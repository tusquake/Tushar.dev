const express = require('express');
const router = express.Router();
const {
    getLearningTopics,
    getLearningTopic,
    createLearningTopic,
    updateLearningTopic,
    updateLearningStatus,
    deleteLearningTopic
} = require('../controllers/learningController');
const { protect } = require('../middlewares/authMiddleware');
const {
    learningGetLimiter,
    learningMutateLimiter,
    learningUpdateLimiter
} = require('../middlewares/rateLimiter');

// All routes require authentication
router.use(protect);

// GET routes with rate limiting
router.get('/', learningGetLimiter, getLearningTopics);
router.get('/:id', learningGetLimiter, getLearningTopic);

// POST/DELETE routes with rate limiting
router.post('/', learningMutateLimiter, createLearningTopic);
router.delete('/:id', learningMutateLimiter, deleteLearningTopic);

// PUT/PATCH routes with rate limiting
router.put('/:id', learningUpdateLimiter, updateLearningTopic);
router.patch('/:id/status', learningUpdateLimiter, updateLearningStatus);

module.exports = router;
