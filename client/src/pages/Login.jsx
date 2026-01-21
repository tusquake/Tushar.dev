import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate(from, { replace: true });
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
                        Welcome back
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2">
                        Sign in to access your learning dashboard
                    </p>
                </div>

                {apiError && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <div>
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
                        <div className="flex justify-end mt-2">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary-500 hover:text-primary-600"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-dark-500 dark:text-dark-400">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
