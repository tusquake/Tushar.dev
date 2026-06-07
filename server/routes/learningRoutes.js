const express = require('express');
const router = express.Router();
const {
    getLearningTopics,
    getLearningTopic,
    createLearningTopic,
    updateLearningTopic,
    updateLearningStatus,
    deleteLearningTopic,
    getActivityHistory
} = require('../controllers/learningController');
const {
    getDsaProgress,
    updateDsaProgress
} = require('../controllers/dsaProgressController');
const { protect } = require('../middlewares/authMiddleware');
const {
    learningGetLimiter,
    learningMutateLimiter,
    learningUpdateLimiter
} = require('../middlewares/rateLimiter');

// All routes require authentication
router.use(protect);

// DSA Progress & Activity History routes (defined before parameterized routes to avoid conflicts)
router.get('/dsa/progress', learningGetLimiter, getDsaProgress);
router.post('/dsa/progress', learningMutateLimiter, updateDsaProgress);
router.get('/activity', learningGetLimiter, getActivityHistory);

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
