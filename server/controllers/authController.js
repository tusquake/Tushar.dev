const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { sendResetPasswordEmail } = require('../utils/emailService');

// Admin email - this user gets admin role automatically
const ADMIN_EMAIL = 'sethtushar111@gmail.com';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user with admin role if matching admin email
        const user = await User.create({
            name,
            email,
            password,
            role: email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'USER'
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and check if refresh token matches
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

        res.json({
            success: true,
            data: { accessToken }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Clear refresh token from user
            await User.findOneAndUpdate(
                { refreshToken },
                { refreshToken: null }
            );
        }

        // Clear cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Public
const getProfile = async (req, res) => {
    try {
        // Return public profile data
        res.json({
            success: true,
            data: {
                name: 'Tushar Seth',
                designation: 'Full Stack Developer',
                bio: 'Passionate developer with expertise in React, Node.js, and modern web technologies.',
                skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'TypeScript', 'Python'],
                social: {
                    github: 'https://github.com/tusquake',
                    linkedin: 'https://www.linkedin.com/in/sethtushar111/',
                    email: 'sethtushar111@gmail.com'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email });

        // Security best practice: do not reveal user existence, but respond with a generic message
        if (!user) {
            return res.json({
                success: true,
                message: 'If the email is registered, a password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and save to database
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token expiration (1 hour)
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

        await user.save();

        // Create reset URL pointing to frontend route
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        // Log reset URL in development mode for easier local testing
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log('\n====================================');
            console.log('🔑 PASSWORD RESET LINK (DEVELOPMENT):');
            console.log(resetUrl);
            console.log('====================================\n');
        }

        // Send email
        const mailResult = await sendResetPasswordEmail({
            email: user.email,
            name: user.name,
            resetUrl
        });

        if (!mailResult.success) {
            // In development mode, allow testing without a functional SMTP configuration
            if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                console.log('⚠️ [DEV MODE] Email dispatch failed, but token remains active for local testing.');
                return res.json({
                    success: true,
                    message: 'If the email is registered, a password reset link has been sent (Dev Mode: Check console)'
                });
            }

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email'
            });
        }

        res.json({
            success: true,
            message: 'If the email is registered, a password reset link has been sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing forgot password request'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Hash the token to compare with DB value
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user by token & check if token hasn't expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password and clear reset fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful! You can now log in.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting password'
        });
    }
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    getProfile,
    forgotPassword,
    resetPassword
};
