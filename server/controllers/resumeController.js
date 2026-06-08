const Resume = require('../models/Resume');

// @desc    Get user resume
// @route   GET /api/resume
// @access  Private
exports.getResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ user: req.user._id });
        res.status(200).json({
            success: true,
            data: resume ? resume.resumeData : null
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save/Update user resume
// @route   POST /api/resume
// @access  Private
exports.saveResume = async (req, res, next) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) {
            return res.status(400).json({
                success: false,
                message: 'Please provide resumeData'
            });
        }

        let resume = await Resume.findOne({ user: req.user._id });

        if (resume) {
            resume.resumeData = resumeData;
            await resume.save();
        } else {
            resume = await Resume.create({
                user: req.user._id,
                resumeData
            });
        }

        // Award XP
        const { awardXP } = require('../utils/gamification');
        await awardXP(req.user._id, 'RESUME_BUILT');

        res.status(200).json({
            success: true,
            data: resume.resumeData
        });
    } catch (error) {
        next(error);
    }
};
