const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, refreshAccessToken, logout, getProfile, getPublicProfile, forgotPassword, resetPassword, updateProfile, getLeaderboard } = require('../controllers/authController');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { protect } = require('../middlewares/authMiddleware');
const { sendSubscriptionEmail } = require('../utils/emailService');

// Local credentials Auth routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Profile customization & leaderboard
router.put('/profile', protect, updateProfile);
router.get('/leaderboard', protect, getLeaderboard);

// Get currently logged-in user profile
router.get('/me', protect, (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                subscriptionTier: req.user.subscriptionTier || 'none',
                trialStartedAt: req.user.trialStartedAt,
                subscriptionStartedAt: req.user.subscriptionStartedAt,
                subscriptionExpiresAt: req.user.subscriptionExpiresAt,
                createdAt: req.user.createdAt,
                title: req.user.title,
                bio: req.user.bio,
                location: req.user.location,
                targetRole: req.user.targetRole,
                skills: req.user.skills || [],
                socials: req.user.socials || {},
                themeColor: req.user.themeColor || 'purple',
                avatar: req.user.avatar,
                xp: req.user.xp || 0,
                level: req.user.level || 1,
                achievements: req.user.achievements || [],
                widgets: req.user.widgets || { showStats: true, showAchievements: true, showActivity: true, showSkills: true }
            }
        }
    });
});

// Update user subscription tier
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['none', 'day', 'basic', 'premium', 'lifetime'].includes(tier)) {
            return res.status(400).json({ success: false, message: 'Invalid subscription tier' });
        }
        req.user.subscriptionTier = tier;
        if (tier === 'none') {
            req.user.subscriptionStartedAt = null;
            req.user.subscriptionExpiresAt = null;
        } else {
            req.user.subscriptionStartedAt = new Date();
            let duration;
            if (tier === 'day') {
                duration = 24 * 60 * 60 * 1000;
            } else if (tier === 'lifetime') {
                duration = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years
            } else {
                duration = 30 * 24 * 60 * 60 * 1000; // basic/premium
            }
            req.user.subscriptionExpiresAt = new Date(Date.now() + duration);
        }
        await req.user.save();

        if (tier !== 'none') {
            sendSubscriptionEmail({
                email: req.user.email,
                name: req.user.name,
                tier: tier,
                expiresAt: req.user.subscriptionExpiresAt
            }).catch(emailErr => console.error('Subscription email failed:', emailErr));
        }
        res.json({
            success: true,
            message: `Successfully subscribed to ${tier} tier`,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    subscriptionTier: req.user.subscriptionTier,
                    trialStartedAt: req.user.trialStartedAt,
                    subscriptionStartedAt: req.user.subscriptionStartedAt,
                    subscriptionExpiresAt: req.user.subscriptionExpiresAt,
                    createdAt: req.user.createdAt,
                    title: req.user.title,
                    bio: req.user.bio,
                    location: req.user.location,
                    targetRole: req.user.targetRole,
                    skills: req.user.skills || [],
                    socials: req.user.socials || {},
                    themeColor: req.user.themeColor || 'purple',
                    avatar: req.user.avatar,
                    xp: req.user.xp || 0,
                    level: req.user.level || 1,
                    achievements: req.user.achievements || [],
                    widgets: req.user.widgets || { showStats: true, showAchievements: true, showActivity: true, showSkills: true }
                }
            }
        });
    } catch (err) {
        console.error('Subscription update error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during subscription update' });
    }
});

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
            const sessionId = require('crypto').randomBytes(16).toString('hex');
            user.currentSessionId = sessionId;

            const accessToken = generateAccessToken(user._id, sessionId);
            const refreshToken = generateRefreshToken(user._id, sessionId);

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userObj = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscriptionTier: user.subscriptionTier || 'none',
                createdAt: user.createdAt
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
            const sessionId = require('crypto').randomBytes(16).toString('hex');
            user.currentSessionId = sessionId;

            const accessToken = generateAccessToken(user._id, sessionId);
            const refreshToken = generateRefreshToken(user._id, sessionId);

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userObj = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscriptionTier: user.subscriptionTier || 'none',
                createdAt: user.createdAt
            };

            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        } catch (error) {
            console.error('GitHub OAuth Callback Redirection Error:', error);
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
        }
    })(req, res, next);
});

// User profile route (public)
router.get('/profile', getProfile);
router.get('/profile/public/:userId', getPublicProfile);

module.exports = router;
