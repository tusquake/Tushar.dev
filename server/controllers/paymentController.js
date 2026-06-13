const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const getPlanPrice = (tier) => {
    if (tier === 'day') return 19;
    if (tier === 'basic') return 79;
    if (tier === 'premium') return 109;
    if (tier === 'lifetime') return 499;
    return 0;
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['day', 'basic', 'premium', 'lifetime'].includes(tier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription tier selected'
            });
        }

        const amount = getPlanPrice(tier);
        if (amount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan price'
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: amount * 100, // amount in paise (e.g. 19 * 100 = 1900 paise)
            currency: 'INR',
            receipt: `rcpt_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-10)}`
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            data: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message || error
        });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tier) {
            return res.status(400).json({
                success: false,
                message: 'All payment verification fields are required'
            });
        }

        // Generate HMAC signature to verify authenticity
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Signature mismatch.'
            });
        }

        // Signature is valid. Update user subscription.
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.subscriptionTier = tier;
        user.subscriptionStartedAt = new Date();
        
        const expiresAt = new Date();
        if (tier === 'day') {
            expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours
        } else if (tier === 'lifetime') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years
        } else {
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
        }
        user.subscriptionExpiresAt = expiresAt;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified and subscription activated successfully!',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    subscriptionTier: user.subscriptionTier,
                    subscriptionExpiresAt: user.subscriptionExpiresAt
                }
            }
        });
    } catch (error) {
        console.error('Razorpay Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
};
