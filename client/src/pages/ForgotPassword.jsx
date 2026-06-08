import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Logo from '../components/common/Logo';
import BrandLogo from '../components/common/BrandLogo';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email) {
            setError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!validate()) return;

        setLoading(true);
        try {
            const response = await authAPI.forgotPassword(email);
            if (response.data.success) {
                setSuccessMessage(
                    response.data.message || 'If that email is registered, we have sent a link to reset your password.'
                );
                setEmail('');
            } else {
                setError(response.data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(
                err.response?.data?.message || 'Failed to request password reset. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative bg-dark-50 dark:bg-dark-950/20">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md p-8 relative">
                <div className="text-center mb-8">
                    <BrandLogo className="mb-4" />
                    <h1 className="text-2xl font-semibold text-dark-900 dark:text-white">
                        Forgot Password
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2 text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200/50 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-750 dark:text-emerald-300 rounded-xl text-sm border border-emerald-200/30 dark:border-emerald-900/30">
                        {successMessage}
                    </div>
                )}

                {!successMessage ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="you@example.com"
                            error={error}
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                        >
                            Send Reset Link
                        </Button>
                    </form>
                ) : (
                    <div className="text-center mt-6">
                        <p className="text-dark-500 dark:text-dark-400 text-sm">
                            Didn't receive the email? Check your spam folder or try requesting a link again.
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center border-t border-dark-200/50 dark:border-dark-800 pt-6">
                    <p className="text-dark-500 dark:text-dark-400 text-sm">
                        Remember your password?{' '}
                        <Link
                            to="/login"
                            className="text-primary-500 hover:text-primary-600 font-medium hover:underline"
                        >
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;
