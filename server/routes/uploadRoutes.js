const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const fs = require('fs');
const path = require('path');
const { isGCSConfigured, uploadToGCS } = require('../utils/gcsService');

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        let imageUrl;

        // If GCS is configured, upload to Google Cloud Storage
        if (isGCSConfigured) {
            try {
                imageUrl = await uploadToGCS(req.file.path, req.file.filename);
                
                // Clean up local temp file asynchronously
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Failed to delete GCS temp file:', err);
                });
            } catch (gcsError) {
                console.error('GCS upload failed, falling back to local file system storage:', gcsError);
                imageUrl = `/uploads/${req.file.filename}`;
            }
        } else {
            // Default to local storage path
            imageUrl = `/uploads/${req.file.filename}`;
        }

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
        
        // Clean up local temp file on error if it was saved
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete temp file on error:', err);
            });
        }

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
