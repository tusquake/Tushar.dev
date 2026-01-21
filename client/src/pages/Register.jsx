import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError('');

        const result = await register(formData.name, formData.email, formData.password);

        if (result.success) {
            navigate('/learning');
        } else {
            setApiError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md p-8 relative">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-display font-bold mb-4">
                        <span className="gradient-text">Tushar</span>
                        <span className="text-dark-700 dark:text-white">.dev</span>
                    </Link>
                    <h1 className="text-2xl font-semibold text-dark-900 dark:text-white">
                        Create an account
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2">
                        Start tracking your learning journey
                    </p>
                </div>

                {apiError && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        error={errors.name}
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        error={errors.email}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.password}
                        required
                    />

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.confirmPassword}
                        required
                    />

                    <div className="text-sm text-dark-500 dark:text-dark-400">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="text-primary-500 hover:text-primary-600">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary-500 hover:text-primary-600">
                            Privacy Policy
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                    >
                        Create Account
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-dark-500 dark:text-dark-400">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Register;
