const InterviewLog = require('../models/InterviewLog');

// @desc    Get user interview logs
// @route   GET /api/interviews
// @access  Private
exports.getInterviewLogs = async (req, res, next) => {
    try {
        const logs = await InterviewLog.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new interview log
// @route   POST /api/interviews
// @access  Private
exports.addInterviewLog = async (req, res, next) => {
    try {
        const { topic, question, answer, correct, feedbackText } = req.body;
        
        if (!topic || !question || !answer || correct === undefined || !feedbackText) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (topic, question, answer, correct, feedbackText)'
            });
        }

        const log = await InterviewLog.create({
            user: req.user._id,
            topic,
            question,
            answer,
            correct,
            feedbackText
        });

        res.status(201).json({
            success: true,
            data: log
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear user interview logs
// @route   DELETE /api/interviews
// @access  Private
exports.clearInterviewLogs = async (req, res, next) => {
    try {
        await InterviewLog.deleteMany({ user: req.user._id });
        res.status(200).json({
            success: true,
            message: 'All interview logs cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};
