const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { name, role, quote, rating } = req.body;

        if (!quote || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Review content and rating are required'
            });
        }

        // Check if user already submitted a review
        const existingReview = await Review.findOne({ user: req.user._id });
        if (existingReview) {
            // Update existing review instead of throwing error, making it seamless for user updates
            existingReview.name = name || req.user.name || 'Anonymous User';
            existingReview.role = role || 'Software Developer';
            existingReview.quote = quote;
            existingReview.rating = rating;
            await existingReview.save();

            return res.status(200).json({
                success: true,
                message: 'Review updated successfully',
                data: existingReview
            });
        }

        const review = await Review.create({
            user: req.user._id,
            name: name || req.user.name || 'Anonymous User',
            role: role || 'Software Developer',
            quote,
            rating,
            approved: true // Auto approve reviews for simple, instant display
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review',
            error: error.message
        });
    }
};

module.exports = {
    getReviews,
    createReview
};
