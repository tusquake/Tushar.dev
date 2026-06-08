const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Get user from token
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized, invalid token'
        });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    const adminEmail = 'sethtushar111@gmail.com';
    if (req.user && req.user.role === 'ADMIN' && req.user.email === adminEmail) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Authorized admin only.'
        });
    }
};

// Subscription verification middleware
const checkSubscription = (tierRequired) => {
    return (req, res, next) => {
        // If user is Admin, bypass subscription checks
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // Grace period check (5 minutes from registration/createdAt)
        const registrationTime = new Date(req.user.createdAt).getTime();
        const currentTime = Date.now();
        const gracePeriodMs = 5 * 60 * 1000; // 5 minutes

        if (currentTime - registrationTime <= gracePeriodMs) {
            return next();
        }

        // Check subscription tier
        const userTier = req.user.subscriptionTier || 'none';

        if (tierRequired === 'basic') {
            if (userTier === 'basic' || userTier === 'premium') {
                return next();
            }
        } else if (tierRequired === 'premium') {
            if (userTier === 'premium') {
                return next();
            }
        }

        return res.status(402).json({
            success: false,
            message: `Subscription required. This action requires a ${tierRequired} subscription.`,
            code: 'SUBSCRIPTION_REQUIRED',
            gracePeriodExpired: true,
            requiredTier: tierRequired,
            userTier
        });
    };
};

module.exports = { protect, adminOnly, checkSubscription };
