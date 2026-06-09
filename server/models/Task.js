const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [100, 'Task title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Task description cannot exceed 500 characters']
    },
    date: {
        type: Date,
        required: [true, 'Task date is required'],
        default: Date.now
    },
    completed: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['DSA', 'System Design', 'Frontend', 'Backend', 'Other'],
        default: 'Other'
    },
    priority: {
        type: Number,
        enum: [1, 2, 3], // 1: Low, 2: Medium, 3: High
        default: 2
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
