const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logout, getProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');

// Auth routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// User profile route (public)
router.get('/profile', getProfile);

module.exports = router;
