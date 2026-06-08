const express = require('express');
const router = express.Router();
const { getInterviewLogs, addInterviewLog, clearInterviewLogs } = require('../controllers/interviewController');
const { protect, checkSubscription } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(checkSubscription('premium'));

router.route('/')
    .get(getInterviewLogs)
    .post(addInterviewLog)
    .delete(clearInterviewLogs);

module.exports = router;
