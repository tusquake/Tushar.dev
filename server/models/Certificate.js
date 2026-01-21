const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Certificate name is required'],
        trim: true,
        maxlength: [150, 'Name cannot exceed 150 characters']
    },
    issuer: {
        type: String,
        required: [true, 'Issuer is required'],
        trim: true,
        maxlength: [100, 'Issuer cannot exceed 100 characters']
    },
    issueDate: {
        type: Date,
        required: [true, 'Issue date is required']
    },
    expiryDate: {
        type: Date
    },
    credentialId: {
        type: String,
        trim: true
    },
    credentialUrl: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
