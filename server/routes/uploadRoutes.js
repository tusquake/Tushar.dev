const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const path = require('path');

// @desc    Upload image
// @route   POST /api/upload
// @access  Private (Admin)
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Return the file path
        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof require('multer').MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 5MB.'
            });
        }
    }

    res.status(400).json({
        success: false,
        message: error.message
    });
});

module.exports = router;
