const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logout, getProfile } = require('../controllers/authController');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');

// Auth routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// User profile route (public)
router.get('/profile', getProfile);

module.exports = router;
