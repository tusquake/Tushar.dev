const express = require('express');
const router = express.Router();
const {
    getCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate
} = require('../controllers/certificateController');

// Public routes
router.get('/', getCertificates);
router.get('/:id', getCertificate);
router.post('/', createCertificate);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

module.exports = router;
