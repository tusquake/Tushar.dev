const mongoose = require('mongoose');

const dsaProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    completedQuestions: {
        type: [Number], // Array of global IDs (gid)
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DsaProgress', dsaProgressSchema);
