const DsaProgress = require('../models/DsaProgress');

// @desc    Get user DSA progress
// @route   GET /api/learning/dsa/progress
// @access  Private
const getDsaProgress = async (req, res) => {
    try {
        let progress = await DsaProgress.findOne({ user: req.user._id });
        
        if (!progress) {
            // Return empty list if no record exists yet
            return res.json({
                success: true,
                completedQuestions: []
            });
        }

        res.json({
            success: true,
            completedQuestions: progress.completedQuestions
        });
    } catch (error) {
        console.error('Get DSA progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch DSA progress'
        });
    }
};

// @desc    Update user DSA progress
// @route   POST /api/learning/dsa/progress
// @access  Private
const updateDsaProgress = async (req, res) => {
    try {
        const { completedQuestions } = req.body;

        if (!Array.isArray(completedQuestions)) {
            return res.status(400).json({
                success: false,
                message: 'completedQuestions must be an array of numbers'
            });
        }

        // Validate all items are numbers
        const isValid = completedQuestions.every(item => typeof item === 'number');
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'All completedQuestions items must be numbers'
            });
        }

        // Get existing progress to check for changes
        const existingProgress = await DsaProgress.findOne({ user: req.user._id });
        const oldQuestions = existingProgress ? existingProgress.completedQuestions : [];

        // Upsert progress document
        const progress = await DsaProgress.findOneAndUpdate(
            { user: req.user._id },
            { completedQuestions },
            { new: true, upsert: true, runValidators: true }
        );

        // Track changes in Activity model
        const Activity = require('../models/Activity');
        const newlyCompleted = completedQuestions.filter(q => !oldQuestions.includes(q));
        const removedQuestions = oldQuestions.filter(q => !completedQuestions.includes(q));

        if (newlyCompleted.length > 0) {
            const activityPromises = newlyCompleted.map(gid => {
                return Activity.create({
                    user: req.user._id,
                    activityType: 'DSA_SOLVED',
                    referenceId: String(gid),
                    detail: `Solved DSA Question #${gid}`,
                    date: new Date()
                });
            });
            await Promise.all(activityPromises);

            // Award XP
            const { awardXP } = require('../utils/gamification');
            await awardXP(req.user._id, 'DSA_SOLVED', newlyCompleted.length * 20);
        }

        if (removedQuestions.length > 0) {
            await Activity.deleteMany({
                user: req.user._id,
                activityType: 'DSA_SOLVED',
                referenceId: { $in: removedQuestions.map(String) }
            });
        }

        res.json({
            success: true,
            message: 'DSA progress updated successfully',
            completedQuestions: progress.completedQuestions
        });
    } catch (error) {
        console.error('Update DSA progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update DSA progress',
            error: error.message
        });
    }
};

const User = require('../models/User');

// @desc    Get user's recent LeetCode submissions via proxy
// @route   POST /api/learning/dsa/leetcode-submissions
// @access  Private
const getLeetcodeSubmissions = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'LeetCode username is required'
            });
        }

        const query = `
            query recentSubmissions($username: String!, $limit: Int) {
                recentSubmissionList(username: $username, limit: $limit) {
                    title
                    titleSlug
                    statusDisplay
                    lang
                    timestamp
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                query,
                variables: { username, limit: 100 }
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: `LeetCode API responded with status ${response.status}`
            });
        }

        const result = await response.json();
        
        if (result.errors) {
            return res.status(400).json({
                success: false,
                message: result.errors[0]?.message || 'Error from LeetCode API'
            });
        }

        const submissions = result.data?.recentSubmissionList || [];

        // Automatically update user's leetcode social link if not set or changed
        const user = await User.findById(req.user._id);
        if (user) {
            if (!user.socials) {
                user.socials = { github: '', linkedin: '', twitter: '', website: '', leetcode: '' };
            }
            if (user.socials.leetcode !== username) {
                user.socials.leetcode = username;
                user.markModified('socials');
                await user.save();
            }
        }

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('LeetCode submissions proxy error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch LeetCode submissions',
            error: error.message
        });
    }
};

module.exports = {
    getDsaProgress,
    updateDsaProgress,
    getLeetcodeSubmissions
};

