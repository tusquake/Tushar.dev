const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
        type: String,
        enum: ['repository', 'course', 'article', 'tutorial', 'book', 'other'],
        default: 'repository'
    },
    url: {
        type: String,
        required: [true, 'Resource URL is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['dsa', 'hld', 'lld', 'backend', 'frontend', 'devops', 'database', 'other'],
        default: 'other'
    },
    icon: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LearningResource', learningResourceSchema);
