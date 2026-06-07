const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, refreshAccessToken, logout, getProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');

// Local credentials Auth routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google Auth Trigger and Callback endpoints
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=OAuthFailed` }),
    async (req, res) => {
        try {
            const accessToken = generateAccessToken(req.user._id);
            const refreshToken = generateRefreshToken(req.user._id);

            req.user.refreshToken = refreshToken;
            await req.user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userObj = {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            };

            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        } catch (error) {
            console.error('Google OAuth Callback Redirection Error:', error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=RedirectionError`);
        }
    }
);

// GitHub Auth Trigger and Callback endpoints
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', 
    passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=OAuthFailed` }),
    async (req, res) => {
        try {
            const accessToken = generateAccessToken(req.user._id);
            const refreshToken = generateRefreshToken(req.user._id);

            req.user.refreshToken = refreshToken;
            await req.user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userObj = {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            };

            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        } catch (error) {
            console.error('GitHub OAuth Callback Redirection Error:', error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=RedirectionError`);
        }
    }
);

// User profile route (public)
router.get('/profile', getProfile);

module.exports = router;
