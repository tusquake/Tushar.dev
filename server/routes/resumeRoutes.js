const express = require('express');
const router = express.Router();
const { getResume, saveResume } = require('../controllers/resumeController');
const { protect, checkSubscription } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(checkSubscription('premium'));

router.route('/')
    .get(getResume)
    .post(saveResume);

module.exports = router;
