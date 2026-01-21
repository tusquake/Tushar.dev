const Certificate = require('../models/Certificate');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({ order: 1, issueDate: -1 });

        res.json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificates'
        });
    }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public
const getCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: certificate
        });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificate'
        });
    }
};

// @desc    Create new certificate
// @route   POST /api/certificates
// @access  Public
const createCertificate = async (req, res) => {
    try {
        const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, image, order } = req.body;

        const certificate = await Certificate.create({
            name,
            issuer,
            issueDate,
            expiryDate,
            credentialId,
            credentialUrl,
            image,
            order
        });

        res.status(201).json({
            success: true,
            message: 'Certificate created successfully',
            data: certificate
        });
    } catch (error) {
        console.error('Create certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create certificate',
            error: error.message
        });
    }
};

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Public
const updateCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            message: 'Certificate updated successfully',
            data: certificate
        });
    } catch (error) {
        console.error('Update certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update certificate',
            error: error.message
        });
    }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Public
const deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndDelete(req.params.id);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            message: 'Certificate deleted successfully'
        });
    } catch (error) {
        console.error('Delete certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete certificate'
        });
    }
};

module.exports = {
    getCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate
};
