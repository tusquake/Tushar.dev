const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        enum: ['DSA_SOLVED', 'TOPIC_COMPLETED'],
        required: true
    },
    referenceId: {
        type: String, // gid string for DSA, _id string for roadmap Topic
        required: true
    },
    detail: {
        type: String // name of the topic or description of action
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for high-performance retrieval of user activities sorted by date
activitySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
