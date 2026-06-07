import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const themeSpecs = {
    terminal: {
        accent: '#39d353',
        secondary: '#58a6ff',
        text: '#e6edf3',
        muted: '#8b949e',
        border: '1px solid #30363d',
        surface: '#161b22',
        heroTag: '$ init your dev journey',
        heroTagStyle: 'font-mono text-xs text-[#39d353]',
        headlineRender: () => (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                Master Software <span style={{ color: '#39d353' }}>Engineering</span> Interviews.
            </h1>
        ),
        cta1Style: {
            backgroundColor: '#39d353',
            color: '#0d1117',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600'
        },
        cta1Text: 'Get Started Free →',
        cta2Style: {
            backgroundColor: '#161b22',
            color: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #30363d',
            fontWeight: '600'
        },
        cta2Text: 'Browse Resources',
        diagramBorder: '1px solid #39d353',
        featureCardStyle: {
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderTop: '4px solid #39d353',
            borderRadius: '6px'
        },
        featureTitleClass: '',
        radius: '6px',
        shadow: 'none'
    },
    purple: {
        accent: '#7c3aed',
        secondary: '#1e1b4b',
        text: '#1e1b4b',
        muted: '#6b7280',
        border: '1px solid #ddd6fe',
        surface: '#ede9fe',
        heroTag: '✦ Free for developers',
        heroTagStyle: 'bg-[#ede9fe] text-[#5b21b6] px-3.5 py-1 text-xs font-semibold rounded-full inline-block',
        headlineRender: () => (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                Your dev journey, <span style={{ color: '#7c3aed' }}>finally organized.</span>
            </h1>
        ),
        cta1Style: {
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600'
        },
        cta1Text: 'Get Started Free →',
        cta2Style: {
            backgroundColor: '#ede9fe',
            color: '#7c3aed',
            borderRadius: '8px',
            border: '1px solid #c4b5fd',
            fontWeight: '600'
        },
        cta2Text: 'Browse Resources',
        diagramBorder: '1px solid #ddd6fe',
        featureCardStyle: {
            backgroundColor: '#ffffff',
            border: '1px solid #ddd6fe',
            borderLeft: '4px solid #7c3aed',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.05)'
        },
        featureTitleClass: '',
        radius: '8px',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }
};

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    // Keep theme updated when class changes on root
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const currentTheme = isDark ? themeSpecs.terminal : themeSpecs.purple;

    return (
        <div className="w-full flex flex-col transition-all duration-200">
            {/* Hero Section */}
            <section className="flex-1 py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
                {/* Left Side: Headline & Copy */}
                <div className="md:col-span-7 flex flex-col items-start text-left animate-slide-up">
                    <div className="mb-4">
                        <span className={currentTheme.heroTagStyle}>
                            {currentTheme.heroTag}
                        </span>
                    </div>

                    {currentTheme.headlineRender()}

                    <p className="text-base md:text-lg leading-relaxed mb-8 max-w-xl opacity-80">
                        Pattern-based learning paths for DSA, System Design, Low-Level Design, and Behavioral interviews.
                    </p>

                    {/* Social proof for Soft Purple */}
                    {!isDark && (
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="w-8 h-8 rounded-full bg-[#ddd6fe] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#5b21b6]">
                                        Dev
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-[#6b7280]">3,200+ developers joined</span>
                        </div>
                    )}

                    <div className="flex flex-row items-center gap-4">
                        <Link 
                            to={isAuthenticated ? "/dashboard" : "/register"}
                            className="px-6 py-3 text-sm font-bold tracking-tight transition-all"
                            style={currentTheme.cta1Style}
                        >
                            {currentTheme.cta1Text}
                        </Link>
                        <Link 
                            to="/learning"
                            className="px-6 py-3 text-sm font-bold tracking-tight transition-all"
                            style={currentTheme.cta2Style}
                        >
                            {currentTheme.cta2Text}
                        </Link>
                    </div>
                </div>

                {/* Right Side: Technical Diagram Grid */}
                <div className="md:col-span-5 grid grid-cols-2 gap-4">
                    {/* Two Pointers Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md animate-float"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">Two Pointers</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <TwoPointersSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} />
                        </div>
                    </div>

                    {/* System Design Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md animate-float-delayed"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">System Design</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <SystemDesignSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>

                    {/* Generative AI Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md animate-float"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">Generative AI</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <GenAISVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>

                    {/* Deployment & DevOps Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md animate-float-delayed"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">Cloud & DevOps</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <DeploymentSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Row Section */}
            <section className="w-full py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'DSA Pattern Hub',
                            desc: 'Master 15+ algorithmic patterns instead of memorizing 500+ LeetCode problems blindly. Includes progress tracker.'
                        },
                        {
                            title: 'System Design Wiki',
                            desc: 'Scale your architectures with structured HLD and LLD materials, microservices, databases, and real-world system designs.'
                        },
                        {
                            title: 'LaTeX Resume Editor',
                            desc: 'Write and compile professional resumes using LaTeX directly in the browser, matching top-tier templates.'
                        },
                        {
                            title: 'ATS Resume Reviewer',
                            desc: 'Get your resume parsed and scored by our ATS algorithm to optimize formatting, keywords, and layout impact.'
                        },
                        {
                            title: 'Interactive Code Builder',
                            desc: 'Build, compile, and run your code within custom workspaces designed for low-level design problems.'
                        },
                        {
                            title: 'Developer Customization',
                            desc: 'Toggle between terminal dark themes and elegant soft violet themes tailored to your aesthetic preference.'
                        }
                    ].map((feature, idx) => (
                        <div 
                            key={idx}
                            className="p-6 md:p-8 flex flex-col justify-between transition-all duration-200 hover:scale-102 hover:shadow-md"
                            style={currentTheme.featureCardStyle}
                        >
                            <div>
                                <h3 className={`text-xl font-bold mb-3 ${currentTheme.featureTitleClass}`}>
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed opacity-85">
                                    {feature.desc}
                                </p>
                            </div>
                            <Link 
                                to="/learning" 
                                className="mt-6 text-sm font-bold hover:underline inline-flex items-center gap-1"
                                style={{ color: currentTheme.accent }}
                            >
                                Start Learning
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
