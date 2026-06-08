const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getReviews);
router.post('/', protect, createReview);

module.exports = router;
