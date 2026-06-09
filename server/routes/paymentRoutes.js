const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// All payment routes are protected by JWT verification middleware
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
