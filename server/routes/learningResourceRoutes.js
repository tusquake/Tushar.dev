const express = require('express');
const router = express.Router();
const {
    getResources,
    getAllResources,
    createResource,
    updateResource,
    deleteResource
} = require('../controllers/learningResourceController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getResources);

// Admin routes
router.get('/all', protect, adminOnly, getAllResources);
router.post('/', protect, adminOnly, createResource);
router.put('/:id', protect, adminOnly, updateResource);
router.delete('/:id', protect, adminOnly, deleteResource);

module.exports = router;
