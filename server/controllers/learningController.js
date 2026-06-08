const Learning = require('../models/Learning');

// @desc    Get all learning topics for user
// @route   GET /api/learning
// @access  Private
const getLearningTopics = async (req, res) => {
    try {
        const { category, status } = req.query;

        // Build query
        const query = { user: req.user._id };
        if (category) query.category = category;
        if (status) query.status = status;

        const topics = await Learning.find(query).sort({ priority: -1, createdAt: -1 });

        // Group by category for frontend convenience
        const grouped = topics.reduce((acc, topic) => {
            if (!acc[topic.category]) {
                acc[topic.category] = [];
            }
            acc[topic.category].push(topic);
            return acc;
        }, {});

        res.json({
            success: true,
            count: topics.length,
            data: topics,
            grouped
        });
    } catch (error) {
        console.error('Get learning topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch learning topics'
        });
    }
};

// @desc    Get single learning topic
// @route   GET /api/learning/:id
// @access  Private
const getLearningTopic = async (req, res) => {
    try {
        const topic = await Learning.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Learning topic not found'
            });
        }

        res.json({
            success: true,
            data: topic
        });
    } catch (error) {
        console.error('Get learning topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch learning topic'
        });
    }
};

// @desc    Create new learning topic
// @route   POST /api/learning
// @access  Private
const createLearningTopic = async (req, res) => {
    try {
        const { title, category, description, status, resources, notes, priority } = req.body;

        const topic = await Learning.create({
            title,
            category,
            description,
            status,
            resources,
            notes,
            priority,
            user: req.user._id
        });

        // Log activity if completed
        if (status === 'completed') {
            const Activity = require('../models/Activity');
            await Activity.create({
                user: req.user._id,
                activityType: 'TOPIC_COMPLETED',
                referenceId: String(topic._id),
                detail: `Completed topic: ${title}`,
                date: new Date()
            });
            const { awardXP } = require('../utils/gamification');
            await awardXP(req.user._id, 'TOPIC_COMPLETED');
        }

        res.status(201).json({
            success: true,
            message: 'Learning topic created successfully',
            data: topic
        });
    } catch (error) {
        console.error('Create learning topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create learning topic',
            error: error.message
        });
    }
};

// @desc    Update learning topic
// @route   PUT /api/learning/:id
// @access  Private
const updateLearningTopic = async (req, res) => {
    try {
        const existingTopic = await Learning.findOne({ _id: req.params.id, user: req.user._id });
        if (!existingTopic) {
            return res.status(404).json({
                success: false,
                message: 'Learning topic not found'
            });
        }

        const oldStatus = existingTopic.status;

        const topic = await Learning.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        // Track change in Activity model
        const Activity = require('../models/Activity');
        if (topic.status === 'completed' && oldStatus !== 'completed') {
            await Activity.create({
                user: req.user._id,
                activityType: 'TOPIC_COMPLETED',
                referenceId: String(topic._id),
                detail: `Completed topic: ${topic.title}`,
                date: new Date()
            });
            const { awardXP } = require('../utils/gamification');
            await awardXP(req.user._id, 'TOPIC_COMPLETED');
        } else if (topic.status !== 'completed' && oldStatus === 'completed') {
            await Activity.deleteMany({
                user: req.user._id,
                activityType: 'TOPIC_COMPLETED',
                referenceId: String(topic._id)
            });
        }

        res.json({
            success: true,
            message: 'Learning topic updated successfully',
            data: topic
        });
    } catch (error) {
        console.error('Update learning topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update learning topic',
            error: error.message
        });
    }
};

// @desc    Update learning topic status
// @route   PATCH /api/learning/:id/status
// @access  Private
const updateLearningStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['not-started', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const existingTopic = await Learning.findOne({ _id: req.params.id, user: req.user._id });
        if (!existingTopic) {
            return res.status(404).json({
                success: false,
                message: 'Learning topic not found'
            });
        }

        const oldStatus = existingTopic.status;

        const topic = await Learning.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status },
            { new: true }
        );

        // Track change in Activity model
        const Activity = require('../models/Activity');
        if (status === 'completed' && oldStatus !== 'completed') {
            await Activity.create({
                user: req.user._id,
                activityType: 'TOPIC_COMPLETED',
                referenceId: String(topic._id),
                detail: `Completed topic: ${topic.title}`,
                date: new Date()
            });
            const { awardXP } = require('../utils/gamification');
            await awardXP(req.user._id, 'TOPIC_COMPLETED');
        } else if (status !== 'completed' && oldStatus === 'completed') {
            await Activity.deleteMany({
                user: req.user._id,
                activityType: 'TOPIC_COMPLETED',
                referenceId: String(topic._id)
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: topic
        });
    } catch (error) {
        console.error('Update learning status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status'
        });
    }
};

// @desc    Delete learning topic
// @route   DELETE /api/learning/:id
// @access  Private
const deleteLearningTopic = async (req, res) => {
    try {
        const topic = await Learning.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Learning topic not found'
            });
        }

        // Delete associated activities
        const Activity = require('../models/Activity');
        await Activity.deleteMany({
            user: req.user._id,
            activityType: 'TOPIC_COMPLETED',
            referenceId: String(topic._id)
        });

        res.json({
            success: true,
            message: 'Learning topic deleted successfully'
        });
    } catch (error) {
        console.error('Delete learning topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete learning topic'
        });
    }
};

// @desc    Get user activity history (heatmap ready)
// @route   GET /api/learning/activity
// @access  Private
const getActivityHistory = async (req, res) => {
    try {
        const Activity = require('../models/Activity');
        const DsaProgress = require('../models/DsaProgress');

        // Fetch all logged activities for this user
        let activities = await Activity.find({ user: req.user._id }).sort({ date: 1 });

        // Intelligent Backfill: if empty, generate activities from current db progress to avoid empty heatmaps
        if (activities.length === 0) {
            const backfills = [];
            const dsaProg = await DsaProgress.findOne({ user: req.user._id });
            
            if (dsaProg && dsaProg.completedQuestions.length > 0) {
                dsaProg.completedQuestions.forEach((gid, index) => {
                    const activityDate = new Date(dsaProg.updatedAt);
                    activityDate.setDate(activityDate.getDate() - Math.min(index, 7)); // spread out over a few days
                    backfills.push({
                        user: req.user._id,
                        activityType: 'DSA_SOLVED',
                        referenceId: String(gid),
                        detail: `Solved DSA Question #${gid}`,
                        date: activityDate
                    });
                });
            }

            const completedTopics = await Learning.find({ user: req.user._id, status: 'completed' });
            completedTopics.forEach((topic) => {
                backfills.push({
                    user: req.user._id,
                    activityType: 'TOPIC_COMPLETED',
                    referenceId: String(topic._id),
                    detail: `Completed topic: ${topic.title}`,
                    date: new Date(topic.updatedAt)
                });
            });

            if (backfills.length > 0) {
                await Activity.insertMany(backfills);
                activities = await Activity.find({ user: req.user._id }).sort({ date: 1 });
            }
        }

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        console.error('Get activity history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity history'
        });
    }
};

module.exports = {
    getLearningTopics,
    getLearningTopic,
    createLearningTopic,
    updateLearningTopic,
    updateLearningStatus,
    deleteLearningTopic,
    getActivityHistory
};
