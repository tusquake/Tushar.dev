const LearningResource = require('../models/LearningResource');

// @desc    Get all learning resources (public)
// @route   GET /api/learning-resources
// @access  Public
const getResources = async (req, res) => {
    try {
        const resources = await LearningResource.find({ isPublic: true })
            .sort({ category: 1, order: 1 });

        res.json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources',
            error: error.message
        });
    }
};

// @desc    Get all learning resources (admin - includes private)
// @route   GET /api/learning-resources/all
// @access  Private (Admin)
const getAllResources = async (req, res) => {
    try {
        const resources = await LearningResource.find()
            .sort({ category: 1, order: 1 });

        res.json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error('Get all resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources',
            error: error.message
        });
    }
};

// @desc    Create learning resource
// @route   POST /api/learning-resources
// @access  Private (Admin)
const createResource = async (req, res) => {
    try {
        const resource = await LearningResource.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: resource
        });
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create resource',
            error: error.message
        });
    }
};

// @desc    Update learning resource
// @route   PUT /api/learning-resources/:id
// @access  Private (Admin)
const updateResource = async (req, res) => {
    try {
        const resource = await LearningResource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Resource updated successfully',
            data: resource
        });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update resource',
            error: error.message
        });
    }
};

// @desc    Delete learning resource
// @route   DELETE /api/learning-resources/:id
// @access  Private (Admin)
const deleteResource = async (req, res) => {
    try {
        const resource = await LearningResource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resource',
            error: error.message
        });
    }
};

module.exports = {
    getResources,
    getAllResources,
    createResource,
    updateResource,
    deleteResource
};
