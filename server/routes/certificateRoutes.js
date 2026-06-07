const express = require('express');
const router = express.Router();
const {
    getCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate
} = require('../controllers/certificateController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getCertificates);
router.get('/:id', getCertificate);

// Admin only routes
router.post('/', protect, adminOnly, createCertificate);
router.put('/:id', protect, adminOnly, updateCertificate);
router.delete('/:id', protect, adminOnly, deleteCertificate);

module.exports = router;
