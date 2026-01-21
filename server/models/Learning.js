const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Topic title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
    },
    resources: [{
        title: String,
        url: String
    }],
    notes: {
        type: String,
        maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
learningSchema.index({ user: 1, category: 1 });
learningSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Learning', learningSchema);
