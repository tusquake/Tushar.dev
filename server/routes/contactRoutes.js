const express = require('express');
const router = express.Router();
const {
    submitContact,
    getContacts,
    markAsRead,
    deleteContact
} = require('../controllers/contactController');
const { contactLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.post('/', contactLimiter, submitContact);
router.get('/', getContacts);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteContact);

module.exports = router;
