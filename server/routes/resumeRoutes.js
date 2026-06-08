const express = require('express');
const router = express.Router();
const { getResume, saveResume } = require('../controllers/resumeController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .get(getResume)
    .post(saveResume);

module.exports = router;
