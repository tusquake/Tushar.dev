const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect, checkSubscription } = require('../middlewares/authMiddleware');
const {
    learningGetLimiter,
    learningMutateLimiter,
    learningUpdateLimiter
} = require('../middlewares/rateLimiter');

// All routes require authentication and basic subscription (matching other workspace features)
router.use(protect);
router.use(checkSubscription('basic'));

// GET all tasks (with optional date query filter)
router.get('/', learningGetLimiter, getTasks);

// POST create a new task
router.post('/', learningMutateLimiter, createTask);

// PUT update a task (e.g., complete it, edit details)
router.put('/:id', learningUpdateLimiter, updateTask);

// DELETE a task
router.delete('/:id', learningMutateLimiter, deleteTask);

module.exports = router;
