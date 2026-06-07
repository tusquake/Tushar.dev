import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// Vector diagrams
const TwoPointersSVG = ({ accent, text, muted }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 40)">
            {[2, 4, 7, 9, 12, 15].map((val, idx) => (
                <g key={idx} transform={`translate(${idx * 30}, 0)`}>
                    <rect width="24" height="24" rx="4" fill="none" stroke={idx === 0 || idx === 5 ? accent : muted} strokeWidth="1.5" />
                    <text x="12" y="15" fill={idx === 0 || idx === 5 ? accent : text} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{val}</text>
                </g>
            ))}
        </g>
        <g className="animate-pointer-l">
            <path d="M22 18V32M22 32L19 29M22 32L25 29" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
            <text x="22" y="12" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">L</text>
        </g>
        
        <g className="animate-pointer-r">
            <path d="M172 95V81M172 81L169 84M172 81L175 84" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
            <text x="172" y="106" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">R</text>
        </g>
    </svg>
);

const SystemDesignSVG = ({ accent, text, muted, secondary }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Client block */}
        <rect x="10" y="45" width="28" height="28" rx="6" fill="none" stroke={text} strokeWidth="1.5" />
        <text x="24" y="62" fill={text} fontSize="7" textAnchor="middle" fontWeight="bold">Client</text>
        
        {/* Load Balancer */}
        <rect x="70" y="41" width="32" height="38" rx="6" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="86" y="58" fill={accent} fontSize="7" textAnchor="middle" fontWeight="bold">LB</text>
        <path d="M74 62h24M86 46v26" stroke={accent} strokeWidth="1" strokeDasharray="2 1" />

        {/* Server 1 & Server 2 */}
        <rect x="140" y="20" width="36" height="24" rx="4" fill="none" stroke={muted} strokeWidth="1.5" />
        <text x="158" y="34" fill={text} fontSize="7" textAnchor="middle">App-01</text>

        <rect x="140" y="76" width="36" height="24" rx="4" fill="none" stroke={muted} strokeWidth="1.5" />
        <text x="158" y="90" fill={text} fontSize="7" textAnchor="middle">App-02</text>

        {/* Connections */}
        <path d="M38 59h32" stroke={text} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M102 50l38-18" stroke={muted} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M102 68l38 18" stroke={muted} strokeWidth="1.2" strokeLinecap="round" />

        {/* Animatic Flowing Request Dot */}
        <circle r="2.5" fill={secondary}>
            <animateMotion 
                path="M 38,59 L 70,59 L 102,50 L 140,32" 
                dur="2.5s" 
                repeatCount="indefinite" 
            />
        </circle>
        <circle r="2.5" fill={secondary}>
            <animateMotion 
                path="M 38,59 L 70,59 L 102,68 L 140,86" 
                dur="2.5s" 
                begin="1.25s"
                repeatCount="indefinite" 
            />
        </circle>
    </svg>
);

const GenAISVG = ({ accent, text, muted, secondary }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* User Prompt */}
        <rect x="15" y="45" width="34" height="28" rx="6" fill="none" stroke={text} strokeWidth="1.5" />
        <text x="32" y="61" fill={text} fontSize="7" textAnchor="middle" fontWeight="bold">Prompt</text>
        
        {/* Embedding & Vector Search */}
        <rect x="85" y="15" width="40" height="28" rx="6" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="105" y="32" fill={accent} fontSize="7" textAnchor="middle" fontWeight="bold">Vector DB</text>

        {/* LLM Engine */}
        <rect x="145" y="45" width="40" height="28" rx="6" fill="none" stroke={accent} strokeWidth="1.5" className="animate-pulse" />
        <text x="165" y="61" fill={accent} fontSize="8" textAnchor="middle" fontWeight="bold">LLM</text>

        {/* Vector DB connection lines */}
        <path d="M49 54 L 85 29" stroke={muted} strokeWidth="1" strokeDasharray="2 2" />
        <path d="M125 29 L 145 54" stroke={muted} strokeWidth="1" strokeDasharray="2 2" />
        <path d="M145 62 L 49 62" stroke={secondary} strokeWidth="1.2" strokeLinecap="round" />

        {/* Animated Tokens / Vector Embeddings */}
        <circle r="2.5" fill={secondary}>
            <animateMotion 
                path="M 49,54 L 85,29" 
                dur="2s" 
                repeatCount="indefinite" 
            />
        </circle>
        <circle r="2.5" fill={accent}>
            <animateMotion 
                path="M 125,29 L 145,54" 
                dur="2s" 
                begin="0.7s"
                repeatCount="indefinite" 
            />
        </circle>
        <circle r="2" fill={text}>
            <animateMotion 
                path="M 145,62 L 49,62" 
                dur="2s" 
                begin="1.4s"
                repeatCount="indefinite" 
            />
        </circle>
    </svg>
);

const DeploymentSVG = ({ accent, text, muted, secondary }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Git commit/branch */}
        <circle cx="25" cy="60" r="6" fill="none" stroke={text} strokeWidth="1.5" />
        <line x1="25" y1="20" x2="25" y2="100" stroke={muted} strokeWidth="1.2" />
        <circle cx="25" cy="30" r="4" fill={text} />
        <circle cx="25" cy="90" r="4" fill={text} />
        
        {/* CI/CD Pipeline Container */}
        <rect x="75" y="40" width="34" height="40" rx="6" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="92" y="63" fill={accent} fontSize="7" textAnchor="middle" fontWeight="bold">CI/CD</text>

        {/* Kubernetes Cluster / Cloud Node */}
        <polygon points="160,25 180,35 180,55 160,65 140,55 140,35" fill="none" stroke={muted} strokeWidth="1.2" />
        <polygon points="160,55 180,65 180,85 160,95 140,85 140,65" fill="none" stroke={accent} strokeWidth="1.2" />
        <text x="160" y="48" fill={text} fontSize="6" textAnchor="middle">Pod-A</text>
        <text x="160" y="78" fill={accent} fontSize="6" textAnchor="middle">Pod-B</text>

        {/* Pipeline path connections */}
        <path d="M31 60h44" stroke={muted} strokeWidth="1" />
        <path d="M109 52 L 140,43" stroke={muted} strokeWidth="1" />
        <path d="M109 68 L 140,73" stroke={muted} strokeWidth="1" />

        {/* Flow of deployment containers */}
        <rect width="6" height="6" rx="1.5" fill={secondary}>
            <animateMotion 
                path="M 31,60 L 75,60" 
                dur="1.8s" 
                repeatCount="indefinite" 
            />
        </rect>
        <rect width="6" height="6" rx="1.5" fill={accent}>
            <animateMotion 
                path="M 109,60 L 140,43" 
                dur="1.8s" 
                begin="0.6s"
                repeatCount="indefinite" 
            />
        </rect>
        <rect width="6" height="6" rx="1.5" fill={accent}>
            <animateMotion 
                path="M 109,60 L 140,73" 
                dur="1.8s" 
                begin="1.2s"
                repeatCount="indefinite" 
            />
        </rect>
    </svg>
);

const slides = [
    {
        tag: 'Data Structures & Algorithms',
        title: 'Elevate Your DSA Mastery',
        description: 'Visualize algorithmic patterns, study dynamic pointer layouts, and track your practice progress.',
        renderVisual: (accent, text, muted, secondary) => (
            <TwoPointersSVG accent={accent} text={text} muted={muted} />
        )
    },
    {
        tag: 'System Design',
        title: 'Design Resilient Architectures',
        description: 'Practice high-scale system routing, configure load balancing patterns, and structure services.',
        renderVisual: (accent, text, muted, secondary) => (
            <SystemDesignSVG accent={accent} text={text} muted={muted} secondary={secondary} />
        )
    },
    {
        tag: 'Generative AI',
        title: 'Integrate Vector Databases & LLMs',
        description: 'Build prompt engines, interface with Vector DB retrieval components, and configure language models.',
        renderVisual: (accent, text, muted, secondary) => (
            <GenAISVG accent={accent} text={text} muted={muted} secondary={secondary} />
        )
    },
    {
        tag: 'Cloud & DevOps',
        title: 'Automate Pipelines & Deployments',
        description: 'Master CI/CD automated test integrations, orchestrate Kubernetes container pods, and optimize node clusters.',
        renderVisual: (accent, text, muted, secondary) => (
            <DeploymentSVG accent={accent} text={text} muted={muted} secondary={secondary} />
        )
    }
];

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
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
    const [activeSlide, setActiveSlide] = useState(0);

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userStr = params.get('user');
        const error = params.get('error');

        if (error) {
            setApiError('Social registration failed. Please try again.');
        } else if (token && userStr) {
            try {
                const parsedUser = JSON.parse(decodeURIComponent(userStr));
                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(parsedUser));
                window.location.href = '/learning';
            } catch (e) {
                console.error('OAuth Callback Parsing Error:', e);
                setApiError('Authentication callback failed. Please try again.');
            }
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
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

    const colors = isDark 
        ? { accent: '#39d353', text: '#e6edf3', muted: '#8b949e', secondary: '#58a6ff' }
        : { accent: '#7c3aed', text: '#1e1b4b', muted: '#6b7280', secondary: '#c084fc' };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-dark-50 dark:bg-dark-950/40 relative">
            {/* Background glowing decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-dark-200/50 dark:border-dark-800 bg-white dark:bg-dark-900 relative z-10">
                {/* Left Column: Dynamic Visual Carousel */}
                <div className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden bg-dark-50/40 dark:bg-dark-950/20 border-r border-dark-200/30 dark:border-dark-800/50">
                    {/* Theme-based animated background */}
                    {isDark ? (
                        <div className="absolute inset-0 bg-[#0d1117] transition-all duration-300">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#39d353_1px,transparent_1px)] [background-size:16px_16px]" />
                            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#39d353]/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#f5f3ff] to-[#edd8ff] transition-all duration-300">
                            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c084fc]/15 rounded-full blur-3xl" />
                        </div>
                    )}

                    {/* Left Side Content Container */}
                    <div className="relative z-10 w-full flex flex-col items-center text-center px-4">
                        {/* Brand header */}
                        <div className="mb-6 h-7">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all duration-300 ${
                                isDark 
                                    ? 'bg-[#39d353]/10 border-[#39d353]/25 text-[#39d353]' 
                                    : 'bg-[#7c3aed]/10 border-[#7c3aed]/25 text-[#7c3aed]'
                            }`}>
                                {slides[activeSlide].tag}
                            </span>
                        </div>

                        <div className="h-20 flex items-center justify-center">
                            <h2 className={`text-xl lg:text-2xl font-extrabold tracking-tight mb-3 transition-all duration-500 ${
                                isDark ? 'text-white' : 'text-[#1e1b4b]'
                            }`}>
                                {slides[activeSlide].title}
                            </h2>
                        </div>
                        
                        <div className="h-16 flex items-center justify-center mb-6">
                            <p className={`text-xs leading-relaxed max-w-xs transition-all duration-500 ${
                                isDark ? 'text-dark-400' : 'text-dark-600'
                            }`}>
                                {slides[activeSlide].description}
                            </p>
                        </div>

                        {/* Interactive Widget */}
                        <div className="w-full h-44 flex items-center justify-center p-4 rounded-xl bg-white/50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-800/40 shadow-inner">
                            {slides[activeSlide].renderVisual(colors.accent, colors.text, colors.muted, colors.secondary)}
                        </div>

                        {/* Slide Indicators */}
                        <div className="flex gap-2 mt-6">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveSlide(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                        activeSlide === idx
                                            ? (isDark ? 'bg-[#39d353] w-4' : 'bg-[#7c3aed] w-4')
                                            : 'bg-dark-300 dark:bg-dark-700'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Register Form */}
                <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 md:p-12">
                    <div className="w-full max-w-md mx-auto font-sans">
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
                                    onClick={() => {
                                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                        const rootServer = apiBase.replace(/\/api$/, '');
                                        window.location.href = `${rootServer}/api/auth/google`;
                                    }}
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
                                    onClick={() => {
                                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                        const rootServer = apiBase.replace(/\/api$/, '');
                                        window.location.href = `${rootServer}/api/auth/github`;
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-dark-200 dark:border-dark-800 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-900 text-sm font-semibold transition-all cursor-pointer bg-white dark:bg-dark-950 text-dark-800 dark:text-dark-200"
                                >
                                    <svg className="w-5 h-5 text-dark-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                    GitHub
                                </button>
                            </div>
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
        </div>
    );
};

export default Register;
