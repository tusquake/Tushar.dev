const rateLimit = require('express-rate-limit');

// Generic rate limiter factory
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: message || 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Login rate limiter - 10 requests per 15 minutes
const loginLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    10,
    'Too many login attempts. Please try again after 15 minutes.'
);

// Register rate limiter - 5 requests per 15 minutes
const registerLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5,
    'Too many registration attempts. Please try again after 15 minutes.'
);

// Contact rate limiter - 3 requests per hour
const contactLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3,
    'Too many contact requests. Please try again after an hour.'
);

// Learning GET rate limiter - 30 requests per 15 minutes
const learningGetLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    30,
    'Too many requests. Please try again after 15 minutes.'
);

// Learning POST/DELETE rate limiter - 10 requests per 15 minutes
const learningMutateLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    10,
    'Too many requests. Please try again after 15 minutes.'
);

// Learning PUT/PATCH rate limiter - 20 requests per 15 minutes
const learningUpdateLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    20,
    'Too many requests. Please try again after 15 minutes.'
);

// General API limiter - 100 requests per 15 minutes
const apiLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100,
    'Too many requests from this IP. Please try again after 15 minutes.'
);

module.exports = {
    loginLimiter,
    registerLimiter,
    contactLimiter,
    learningGetLimiter,
    learningMutateLimiter,
    learningUpdateLimiter,
    apiLimiter
};
