import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    const [showOAuthSteps, setShowOAuthSteps] = useState(false);
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

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
        <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-white dark:bg-dark-950">
            {/* Left Column: Interactive Visuals */}
            <div className="hidden md:flex md:col-span-5 lg:col-span-6 flex-col items-center justify-center p-12 relative overflow-hidden border-r border-dark-150 dark:border-dark-850">
                {/* Theme-based animated background */}
                {isDark ? (
                    <div className="absolute inset-0 bg-[#0d1117] transition-all duration-300">
                        {/* Terminal green matrix particle network simulation */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#39d353_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39d353]/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#f5f3ff] to-[#edd8ff] transition-all duration-300">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c084fc]/15 rounded-full blur-3xl animate-pulse" />
                    </div>
                )}

                {/* Left Side Content Container */}
                <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
                    {/* Brand header */}
                    <div className="mb-8">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            isDark 
                                ? 'bg-[#39d353]/10 border-[#39d353]/25 text-[#39d353]' 
                                : 'bg-[#7c3aed]/10 border-[#7c3aed]/25 text-[#7c3aed]'
                        }`}>
                            Interactive Learning
                        </span>
                    </div>

                    <h2 className={`text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 ${
                        isDark ? 'text-white' : 'text-[#1e1b4b]'
                    }`}>
                        Elevate Your Engineering Expertise
                    </h2>
                    
                    <p className={`text-sm leading-relaxed mb-8 max-w-sm ${
                        isDark ? 'text-dark-400' : 'text-dark-600'
                    }`}>
                        Practice patterns, design high-scale systems, automate deployments, and review resumes with ease.
                    </p>

                    {/* Interactive Widget */}
                    {isDark ? (
                        <div className="font-mono text-left p-6 rounded-xl bg-[#161b22] border border-[#30363d] text-[#e6edf3] shadow-2xl relative overflow-hidden w-full transition-all duration-300">
                            <div className="flex gap-1.5 mb-4 border-b border-[#30363d] pb-3">
                                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                                <span className="w-3 h-3 rounded-full bg-[#39d353]/80"></span>
                            </div>
                            <p className="text-[#8b949e] text-xs mb-2">// CodeForge.dev Terminal System</p>
                            <p className="text-[#58a6ff] text-xs"><span className="text-[#ff7b72]">const</span> coder <span className="text-[#ff7b72]">=</span> <span className="text-[#39d353]">new</span> Coder();</p>
                            <p className="text-[#e6edf3] text-xs">coder.studyPattern(<span className="text-[#a5d6ff]">"DSA"</span>);</p>
                            <p className="text-[#e6edf3] text-xs">coder.solveSystemDesign(<span className="text-[#a5d6ff]">"Scale to 10M Users"</span>);</p>
                            <p className="text-[#ff7b72] text-xs">if <span className="text-[#e6edf3]">(coder.isReady()) &#123;</span></p>
                            <p className="text-[#39d353] text-xs">&nbsp;&nbsp;console.log(<span className="text-[#a5d6ff]">"Offer Accepted!"</span>);</p>
                            <p className="text-[#e6edf3] text-xs">&#125;</p>
                        </div>
                    ) : (
                        <div className="text-left p-6 rounded-xl bg-white border border-[#e9e3ff] text-[#1e1b4b] shadow-2xl relative overflow-hidden w-full transition-all duration-300">
                            <div className="flex gap-1.5 mb-4 border-b border-[#f5f3ff] pb-3">
                                <span className="w-3 h-3 rounded-full bg-[#7c3aed]/20"></span>
                                <span className="w-3 h-3 rounded-full bg-[#7c3aed]/40"></span>
                                <span className="w-3 h-3 rounded-full bg-[#7c3aed]/60"></span>
                            </div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[#7c3aed] mb-1">Interview Prep Success</p>
                            <p className="text-2xl font-extrabold text-[#1e1b4b] mb-4">94.8% <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+4.2%</span></p>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 font-medium">DSA Mastery Progress</span>
                                    <span className="font-bold text-[#7c3aed]">18 / 20 Patterns</span>
                                </div>
                                <div className="w-full bg-[#f3e8ff] h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#7c3aed] h-full w-[90%] rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Register Form */}
            <div className="col-span-1 md:col-span-7 lg:col-span-6 flex flex-col items-center justify-center p-8 sm:p-12 relative">
                {/* Mobile background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none md:hidden">
                    <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-display font-bold mb-3">
                            <span className="text-dark-900 dark:text-white">CodeForge</span>
                            <span className="gradient-text">.dev</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
                            Create An Account
                        </h1>
                        <p className="text-dark-500 dark:text-dark-400 mt-1.5 text-sm">
                            Start tracking your learning journey today
                        </p>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200/50 dark:border-red-900/30">
                            {apiError}
                        </div>
                    )}

                    {/* Google and GitHub OAuth Buttons */}
                    <div className="space-y-4 mb-6">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => alert("To configure and trigger Google OAuth login, follow the integration setup instructions below.")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-dark-200 dark:border-dark-800 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-900 text-sm font-semibold transition-all cursor-pointer bg-white dark:bg-dark-950 text-dark-800 dark:text-dark-200"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.48 3.77v3.13h4.01c2.34-2.16 3.68-5.32 3.68-8.75z" />
                                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.01-3.13c-1.11.75-2.53 1.19-3.95 1.19-3.05 0-5.64-2.06-6.56-4.83H1.27v3.23C3.26 21.3 7.37 24 12 24z" />
                                    <path fill="#FBBC05" d="M5.44 14.32a7.18 7.18 0 0 1 0-2.64V8.45H1.27a11.97 11.97 0 0 0 0 7.1l4.17-3.23z" />
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.27 6.84l4.17 3.23c.92-2.77 3.51-4.82 6.56-4.82z" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={() => alert("To configure and trigger GitHub OAuth login, follow the integration setup instructions below.")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-dark-200 dark:border-dark-800 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-900 text-sm font-semibold transition-all cursor-pointer bg-white dark:bg-dark-950 text-dark-800 dark:text-dark-200"
                            >
                                <svg className="w-5 h-5 text-dark-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Integration Guide Button */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setShowOAuthSteps(!showOAuthSteps)}
                                className={`text-xs font-semibold underline hover:text-primary-650 cursor-pointer bg-transparent border-none ${
                                    isDark ? 'text-primary-400 animate-pulse' : 'text-primary-600 animate-pulse'
                                }`}
                            >
                                {showOAuthSteps ? 'Hide OAuth Integration Steps' : 'Show OAuth Integration Steps'}
                            </button>
                        </div>

                        {/* Dynamic integration instructions drawer */}
                        {showOAuthSteps && (
                            <div className="p-4 bg-dark-50 dark:bg-dark-900 border border-dark-250 dark:border-dark-800 rounded-xl text-left text-xs max-h-60 overflow-y-auto space-y-3 shadow-inner">
                                <h4 className="font-bold text-dark-900 dark:text-white uppercase tracking-wider text-[10px]">OAuth Setup Steps</h4>
                                <div>
                                    <p className="font-semibold text-primary-500 mb-0.5">1. Provider Credentials</p>
                                    <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                                        Register developer credentials in Google Developer Console and GitHub Settings to obtain a client ID and secret. Set callbacks to:
                                    </p>
                                    <ul className="list-disc pl-4 mt-1 text-dark-500 dark:text-dark-400 space-y-0.5 font-mono text-[9px]">
                                        <li>http://localhost:5000/api/auth/google/callback</li>
                                        <li>http://localhost:5000/api/auth/github/callback</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-semibold text-primary-500 mb-0.5">2. Backend Controller Strategy</p>
                                    <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                                        Install dependencies: <code className="bg-dark-150 dark:bg-dark-950 px-1 py-0.5 rounded font-mono text-[10px]">npm install passport-google-oauth20 passport-github2</code>. Configure strategy profiles:
                                    </p>
                                    <pre className="bg-dark-100 dark:bg-dark-950 p-2 rounded mt-1 font-mono text-[8.5px] text-dark-600 dark:text-dark-400 overflow-x-auto">
{`passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, (token, tokenSecret, profile, done) => {
    // Find/Create User model entry
    return done(null, user);
  })
);`}
                                    </pre>
                                </div>
                                <div>
                                    <p className="font-semibold text-primary-500 mb-0.5">3. Client Trigger Actions</p>
                                    <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                                        Direct navigation callbacks from frontend:
                                    </p>
                                    <ul className="list-disc pl-4 mt-1 text-dark-500 dark:text-dark-400 space-y-0.5 font-mono text-[9px]">
                                        <li>Google: window.location.href = "http://localhost:5000/api/auth/google"</li>
                                        <li>GitHub: window.location.href = "http://localhost:5000/api/auth/github"</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative flex py-2 items-center mb-4">
                        <div className="flex-grow border-t border-dark-150 dark:border-dark-850"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-widest">Or continue with</span>
                        <div className="flex-grow border-t border-dark-150 dark:border-dark-850"></div>
                    </div>

                    {/* Standard Credentials Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <div className="text-xs text-dark-500 dark:text-dark-400 leading-relaxed">
                            By creating an account, you agree to our{' '}
                            <Link to="/terms" className="text-primary-500 hover:text-primary-600 underline">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary-500 hover:text-primary-600 underline">
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

                    <div className="mt-6 text-center border-t border-dark-150 dark:border-dark-850 pt-5">
                        <p className="text-sm text-dark-500 dark:text-dark-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-500 hover:text-primary-600 font-bold hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
