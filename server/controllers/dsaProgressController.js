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

        // Upsert progress document
        const progress = await DsaProgress.findOneAndUpdate(
            { user: req.user._id },
            { completedQuestions },
            { new: true, upsert: true, runValidators: true }
        );

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
