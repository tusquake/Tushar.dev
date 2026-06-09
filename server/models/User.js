const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: String,
        default: 'https://api.dicebear.com/7.x/bottts/svg?seed=samurai&backgroundColor=b6e3f4'
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    title: {
        type: String,
        default: 'Software Explorer'
    },
    bio: {
        type: String,
        default: 'Learning, coding, and building cool things.'
    },
    location: {
        type: String,
        default: ''
    },
    targetRole: {
        type: String,
        default: ''
    },
    skills: [{
        name: { type: String },
        level: { type: Number, default: 50 }
    }],
    socials: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    themeColor: {
        type: String,
        default: 'purple' // purple, blue, emerald, amber, rose
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    achievements: {
        type: [String],
        default: []
    },
    widgets: {
        showStats: { type: Boolean, default: true },
        showAchievements: { type: Boolean, default: true },
        showActivity: { type: Boolean, default: true },
        showSkills: { type: Boolean, default: true }
    },
    refreshToken: {
        type: String,
        select: false
    },
    subscriptionTier: {
        type: String,
        enum: ['none', 'day', 'basic', 'premium'],
        default: 'none'
    },
    trialStartedAt: {
        type: Date
    },
    subscriptionStartedAt: {
        type: Date
    },
    subscriptionExpiresAt: {
        type: Date
    },
    currentSessionId: {
        type: String
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
