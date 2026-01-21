const Contact = require('../models/Contact');
const { sendContactEmail } = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Save to database
        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // Try to send email (non-blocking)
        const emailResult = await sendContactEmail({ name, email, subject, message });

        if (!emailResult.success) {
            console.warn('Email sending failed, but contact saved:', emailResult.error);
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! I will get back to you soon.',
            data: {
                id: contact._id
            }
        });
    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: error.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Public
const getContacts = async (req, res) => {
    try {
        const { read, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};
        if (read !== undefined) {
            query.read = read === 'true';
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            count: contacts.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: contacts
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact messages'
        });
    }
};

// @desc    Mark contact as read
// @route   PATCH /api/contact/:id/read
// @access  Public
const markAsRead = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.json({
            success: true,
            message: 'Marked as read',
            data: contact
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark as read'
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Public
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact message'
        });
    }
};

module.exports = {
    submitContact,
    getContacts,
    markAsRead,
    deleteContact
};
