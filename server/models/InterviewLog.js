const mongoose = require('mongoose');

const interviewLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    correct: {
        type: Boolean,
        required: true
    },
    feedbackText: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

interviewLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('InterviewLog', interviewLogSchema);
