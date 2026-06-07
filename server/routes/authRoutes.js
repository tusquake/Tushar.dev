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
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        if (err) {
            console.error('Google Passport Authenticate Error:', err);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=PassportError&msg=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            console.error('Google Passport Authenticate Failed, No User. Info:', info);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=NoUser&info=${encodeURIComponent(JSON.stringify(info || {}))}`);
        }
        try {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userObj = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        } catch (error) {
            console.error('Google OAuth Callback Redirection Error:', error);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=RedirectionError&msg=${encodeURIComponent(error.message)}`);
        }
    })(req, res, next);
});

// GitHub Auth Trigger and Callback endpoints
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', { session: false }, async (err, user, info) => {
        if (err) {
            console.error('GitHub Passport Authenticate Error:', err);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=PassportError&msg=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            console.error('GitHub Passport Authenticate Failed, No User. Info:', info);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=NoUser&info=${encodeURIComponent(JSON.stringify(info || {}))}`);
        }
        try {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userObj = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        } catch (error) {
            console.error('GitHub OAuth Callback Redirection Error:', error);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=RedirectionError&msg=${encodeURIComponent(error.message)}`);
        }
    })(req, res, next);
});

// User profile route (public)
router.get('/profile', getProfile);

module.exports = router;
