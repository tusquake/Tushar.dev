const express = require('express');
const router = express.Router();
const {
    submitContact,
    getContacts,
    markAsRead,
    deleteContact
} = require('../controllers/contactController');
const { contactLimiter } = require('../middlewares/rateLimiter');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes - submitting contact message is public with rate limiting
router.post('/', contactLimiter, submitContact);

// Admin only routes - viewing and managing messages is secure
router.get('/', protect, adminOnly, getContacts);
router.patch('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteContact);

module.exports = router;
