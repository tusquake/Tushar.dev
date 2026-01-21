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
        const topic = await Learning.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Learning topic not found'
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

        const topic = await Learning.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status },
            { new: true }
        );

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Learning topic not found'
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

module.exports = {
    getLearningTopics,
    getLearningTopic,
    createLearningTopic,
    updateLearningTopic,
    updateLearningStatus,
    deleteLearningTopic
};
