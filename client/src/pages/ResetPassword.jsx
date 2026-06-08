import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Logo from '../components/common/Logo';
import BrandLogo from '../components/common/BrandLogo';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (!validate()) return;

        setLoading(true);
        try {
            const response = await authAPI.resetPassword(token, password);
            if (response.data.success) {
                setSuccessMessage('Password reset successful! Redirecting to login page...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setApiError(response.data.message || 'Failed to reset password. Please request a new link.');
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setApiError(
                err.response?.data?.message || 'Invalid or expired reset token. Please request a new link.'
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
                        Reset Password
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2 text-sm">
                        Please enter and confirm your new password below.
                    </p>
                </div>

                {apiError && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200/50 dark:border-red-900/50">
                        <div className="flex flex-col items-center gap-2">
                            <span>{apiError}</span>
                            <Link to="/forgot-password" className="text-xs font-semibold text-primary-500 hover:text-primary-600 hover:underline">
                                Request new reset link
                            </Link>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-750 dark:text-emerald-300 rounded-xl text-sm border border-emerald-200/30 dark:border-emerald-900/30 flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-emerald-550" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                )}

                {!successMessage && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="New Password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors(prev => ({ ...prev, password: '' }));
                                setApiError('');
                            }}
                            placeholder="Min 8 characters"
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                setApiError('');
                            }}
                            placeholder="Confirm your password"
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                        >
                            Reset Password
                        </Button>
                    </form>
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

export default ResetPassword;
