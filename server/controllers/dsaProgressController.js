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

module.exports = {
    getDsaProgress,
    updateDsaProgress
};
