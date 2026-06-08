const express = require('express');
const router = express.Router();
const { getInterviewLogs, addInterviewLog, clearInterviewLogs } = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .get(getInterviewLogs)
    .post(addInterviewLog)
    .delete(clearInterviewLogs);

module.exports = router;
