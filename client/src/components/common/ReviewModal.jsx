import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewsAPI } from '../../services/api';
import Card from './Card';
import Button from './Button';

const ReviewModal = ({ isOpen, onClose, defaultTriggerAction = '' }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [role, setRole] = useState('Software Developer');
    const [rating, setRating] = useState(5);
    const [quote, setQuote] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    // Track triggering action to customize prompt
    const getPromptText = () => {
        if (defaultTriggerAction === 'resume') {
            return "Nice work building your resume! Share your experience with the LaTeX builder to help other developers.";
        }
        if (defaultTriggerAction === 'interview') {
            return "Congratulations on completing your AI interview assessment! How did the experience feel?";
        }
        if (defaultTriggerAction === 'editor') {
            return "Workspaces are designed for maximum productivity. Let us know how compile time or patterns helped you.";
        }
        return "Your feedback helps us make CodeForge better for developers worldwide.";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quote.trim()) {
            setError('Please write a short review.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await reviewsAPI.create({
                name,
                role,
                rating,
                quote: quote.trim()
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
            <Card className="w-full max-w-lg p-6 relative bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 shadow-2xl rounded-2xl overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/30 rounded-full flex items-center justify-center text-primary-500 mb-5 animate-bounce">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Review Submitted!</h3>
                        <p className="text-xs text-dark-500 dark:text-dark-400 max-w-sm">
                            Thank you! Your testimonial is now live on the homepage carousel.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary-500/10 border border-primary-500/20 text-primary-500">
                                Share Review
                            </span>
                            <h2 className="text-xl font-bold tracking-tight mt-3">Help us improve!</h2>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1.5 leading-relaxed">
                                {getPromptText()}
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 text-xs bg-red-500/15 border border-red-500/20 text-red-500 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full px-3 py-2 text-xs bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-800 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-1">
                                    Role / Headline
                                </label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Software Engineer @ Google"
                                    className="w-full px-3 py-2 text-xs bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-800 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-1.5">
                                Rating
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <svg
                                            className={`w-6 h-6 transition-colors ${star <= rating ? 'text-yellow-500' : 'text-dark-300 dark:text-dark-700'}`}
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-dark-500 dark:text-dark-400 mb-1">
                                Your Testimonial
                            </label>
                            <textarea
                                value={quote}
                                onChange={(e) => setQuote(e.target.value)}
                                placeholder="What did you like about CodeForge? How did it help you prepare?"
                                rows={4}
                                maxLength={500}
                                className="w-full px-3 py-2.5 text-xs bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-800 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                required
                            />
                            <div className="flex justify-between items-center mt-1 text-[9px] text-dark-400">
                                <span>Max 500 characters</span>
                                <span>{quote.length}/500</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={onClose}
                                className="flex-1 text-xs py-2 h-auto"
                            >
                                Skip
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                                className="flex-1 text-xs py-2 h-auto flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default ReviewModal;
