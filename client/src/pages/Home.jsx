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

// Micro-Animatic Feature Icons
const DSAPatternIcon = ({ accent }) => (
    <svg className="w-9 h-9 mb-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="4" r="2" stroke={accent} strokeWidth="1.5" />
        <circle cx="6" cy="12" r="2" stroke={accent} strokeWidth="1.5" />
        <circle cx="18" cy="12" r="2" stroke={accent} strokeWidth="1.5" />
        <circle cx="12" cy="20" r="2" stroke={accent} strokeWidth="1.5" />
        <path d="M10.5 5.5L7.5 10.5M13.5 5.5l3 5M7.5 13.5l3 5M16.5 13.5l-3 5" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
        <circle cx="12" cy="20" r="1.2" fill={accent} className="animate-ping" />
    </svg>
);

const SystemDesignIcon = ({ accent }) => (
    <svg className="w-9 h-9 mb-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="4" rx="1" stroke={accent} strokeWidth="1.5" />
        <rect x="3" y="10" width="18" height="4" rx="1" stroke={accent} strokeWidth="1.5" />
        <rect x="3" y="17" width="18" height="4" rx="1" stroke={accent} strokeWidth="1.5" />
        <circle cx="6" cy="5" r="0.75" fill={accent} className="animate-pulse" />
        <circle cx="6" cy="12" r="0.75" fill={accent} className="animate-pulse" />
        <circle cx="6" cy="19" r="0.75" fill={accent} className="animate-pulse" />
        <line x1="17" y1="7" x2="17" y2="10" stroke={accent} strokeWidth="1" strokeDasharray="1.5 1" />
        <line x1="17" y1="14" x2="17" y2="17" stroke={accent} strokeWidth="1" strokeDasharray="1.5 1" />
    </svg>
);

const LaTeXResumeIcon = ({ accent }) => (
    <svg className="w-9 h-9 mb-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke={accent} strokeWidth="1.5" />
        <line x1="7" y1="6" x2="13" y2="6" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="10" x2="17" y2="10" stroke={accent} strokeWidth="1.2" strokeLinecap="round" className="animate-pulse" />
        <line x1="7" y1="14" x2="15" y2="14" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="18" x2="12" y2="18" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const ATSResumeIcon = ({ accent }) => (
    <svg className="w-9 h-9 mb-4 group-hover:scale-110 transition-transform duration-300 relative overflow-hidden" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="3" width="14" height="18" rx="2" stroke={accent} strokeWidth="1.5" />
        <circle cx="9" cy="7" r="1.2" fill={accent} />
        <line x1="8" y1="11" x2="16" y2="11" stroke={accent} strokeWidth="1" />
        <line x1="8" y1="14" x2="16" y2="14" stroke={accent} strokeWidth="1" />
        <line x1="8" y1="17" x2="13" y2="17" stroke={accent} strokeWidth="1" />
        {/* Animated Scan Line */}
        <line x1="3" y1="10" x2="21" y2="10" stroke={accent} strokeWidth="1.5" className="animate-bounce" />
    </svg>
);

const CodeBuilderIcon = ({ accent }) => (
    <svg className="w-9 h-9 mb-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke={accent} strokeWidth="1.5" />
        <path d="M7 8l3 3-3 3" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="11" y1="14" x2="15" y2="14" stroke={accent} strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
    </svg>
);

const DevCustomizationIcon = ({ accent }) => (
    <svg className="w-9 h-9 mb-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={accent} strokeWidth="1.5" />
        <path d="M12 3v18" stroke={accent} strokeWidth="1.5" />
        <path d="M12 3a9 9 0 0 1 0 18" fill={accent} fillOpacity="0.25" />
        <circle cx="7" cy="12" r="1.2" fill={accent} className="animate-pulse" />
        <circle cx="17" cy="12" r="1.2" fill={accent} className="animate-ping" />
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
        heroTagStyle: 'font-mono text-xs text-[#39d353] border border-[#39d353]/30 px-3 py-1 rounded-md bg-[#39d353]/5 inline-block',
        headlineRender: () => (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                Master Software <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39d353] to-[#58a6ff]">Engineering</span> Interviews.
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
        diagramBorder: '1px solid #30363d',
        featureCardStyle: {
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderTop: '4px solid #39d353',
            borderRadius: '6px'
        },
        aboutCardStyle: {
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px'
        },
        testimonialCardStyle: {
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px'
        },
        radius: '12px',
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
        heroTagStyle: 'bg-[#ede9fe] text-[#5b21b6] px-3.5 py-1.5 text-xs font-semibold rounded-full inline-block',
        headlineRender: () => (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                Your dev journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] to-[#c084fc]">finally organized.</span>
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
        aboutCardStyle: {
            backgroundColor: '#ffffff',
            border: '1px solid #ddd6fe',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        },
        testimonialCardStyle: {
            backgroundColor: '#ffffff',
            border: '1px solid #ddd6fe',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)'
        },
        radius: '16px',
        shadow: '0 10px 15px -3px rgba(124, 58, 237, 0.03)'
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
        <div className="w-full flex flex-col transition-all duration-200 relative overflow-hidden">
            {/* Background glowing decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-2/3 -left-48 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -right-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 flex-1 py-16 md:py-28 px-6 md:px-12 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
                {/* Left Side: Headline & Copy */}
                <div className="md:col-span-7 flex flex-col items-start text-left animate-slide-up">
                    <div className="mb-5">
                        <span className={currentTheme.heroTagStyle}>
                            {currentTheme.heroTag}
                        </span>
                    </div>

                    {currentTheme.headlineRender()}

                    <p className="text-base md:text-lg leading-relaxed mb-8 max-w-xl opacity-80">
                        Stop memorizing 500+ LeetCode problems blindly. CodeForge helps you master software engineering interviews using pattern-based modules, system design playbooks, and compiler tools.
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
                            to={isAuthenticated ? "/learning" : "/register"}
                            className="px-6 py-3.5 text-sm font-bold tracking-tight transition-all transform hover:-translate-y-0.5 hover:shadow-lg duration-200 cursor-pointer"
                            style={currentTheme.cta1Style}
                        >
                            {currentTheme.cta1Text}
                        </Link>
                        <Link 
                            to="/learning"
                            className="px-6 py-3.5 text-sm font-bold tracking-tight transition-all transform hover:-translate-y-0.5 hover:shadow-md duration-200 border border-dark-250 cursor-pointer"
                            style={currentTheme.cta2Style}
                        >
                            {currentTheme.cta2Text}
                        </Link>
                    </div>
                </div>

                {/* Right Side: Technical Diagram Grid with Hover Interactions */}
                <div className="md:col-span-5 grid grid-cols-2 gap-4 relative z-10">
                    {/* DSA Card */}
                    <div 
                        className="p-5 flex flex-col justify-between aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-500/50 group cursor-pointer"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold tracking-widest opacity-70 uppercase">DSA</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping group-hover:bg-[#39d353]" />
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <TwoPointersSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} />
                        </div>
                    </div>

                    {/* System Design Card */}
                    <div 
                        className="p-5 flex flex-col justify-between aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-500/50 group cursor-pointer"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold tracking-widest opacity-70 uppercase">System Design</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-pulse" />
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <SystemDesignSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>

                    {/* Generative AI Card */}
                    <div 
                        className="p-5 flex flex-col justify-between aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-500/50 group cursor-pointer"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold tracking-widest opacity-70 uppercase">Generative AI</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <GenAISVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>

                    {/* Cloud & DevOps Card */}
                    <div 
                        className="p-5 flex flex-col justify-between aspect-square transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-500/50 group cursor-pointer"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold tracking-widest opacity-70 uppercase">Cloud & DevOps</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <DeploymentSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Row Section */}
            <section className="relative z-10 w-full py-16 px-6 md:px-12 bg-dark-50/20 dark:bg-dark-950/10 border-y border-dark-200/30 dark:border-dark-900/55">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold tracking-tight font-display mb-4">
                            All the features you need to scale
                        </h2>
                        <p className="text-sm max-w-xl mx-auto opacity-75 leading-relaxed">
                            A highly structured suite engineered specifically for fast paced preparation and optimal retention.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'DSA Pattern Hub',
                                desc: 'Master 15+ algorithmic patterns instead of memorizing 500+ LeetCode problems blindly. Includes progress tracker.',
                                icon: (acc) => <DSAPatternIcon accent={acc} />
                            },
                            {
                                title: 'System Design Wiki',
                                desc: 'Scale your architectures with structured HLD and LLD materials, microservices, databases, and real-world system designs.',
                                icon: (acc) => <SystemDesignIcon accent={acc} />
                            },
                            {
                                title: 'LaTeX Resume Editor',
                                desc: 'Write and compile professional resumes using LaTeX directly in the browser, matching top-tier templates.',
                                icon: (acc) => <LaTeXResumeIcon accent={acc} />
                            },
                            {
                                title: 'ATS Resume Reviewer',
                                desc: 'Get your resume parsed and scored by our ATS algorithm to optimize formatting, keywords, and layout impact.',
                                icon: (acc) => <ATSResumeIcon accent={acc} />
                            },
                            {
                                title: 'Interactive Code Builder',
                                desc: 'Build, compile, and run your code within custom workspaces designed for low-level design problems.',
                                icon: (acc) => <CodeBuilderIcon accent={acc} />
                            },
                            {
                                title: 'Developer Customization',
                                desc: 'Toggle between terminal dark themes and elegant soft violet themes tailored to your aesthetic preference.',
                                icon: (acc) => <DevCustomizationIcon accent={acc} />
                            }
                        ].map((feature, idx) => (
                            <div 
                                key={idx}
                                className="p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border group cursor-pointer"
                                style={currentTheme.featureCardStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = currentTheme.accent;
                                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.accent}20`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = isDark ? '#30363d' : '#ddd6fe';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div>
                                    <div className="mb-2">
                                        {feature.icon(currentTheme.accent)}
                                    </div>
                                    <h3 className={`text-lg font-bold mb-3 ${currentTheme.featureTitleClass}`}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs leading-relaxed opacity-85">
                                        {feature.desc}
                                    </p>
                                </div>
                                <Link 
                                    to="/learning" 
                                    className="mt-6 text-xs font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    style={{ color: currentTheme.accent }}
                                >
                                    Start Learning
                                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Tushar Section */}
            <section className="relative z-10 w-full py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-12 gap-12 items-center">
                    {/* Left: Tushar Monogram Card & Interactive Terminal Mockup */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <div 
                            className="p-8 flex flex-col items-center text-center transition-all duration-300"
                            style={currentTheme.aboutCardStyle}
                        >
                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#7c3aed] to-[#39d353] p-1 shadow-lg mb-4">
                                <div className="w-full h-full rounded-full bg-white dark:bg-dark-900 flex items-center justify-center text-2xl font-extrabold tracking-tight">
                                    TS
                                </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Tushar Seth</h3>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-65 mb-3" style={{ color: currentTheme.accent }}>Founder & Creator</p>
                            <p className="text-xs opacity-75 max-w-xs leading-relaxed">
                                Full Stack Engineer passionate about optimizing technical preparation and structuring developer workflows.
                            </p>
                        </div>

                        {/* Interactive Console Screen */}
                        <div className="rounded-xl border border-dark-200/60 dark:border-dark-800 bg-dark-900 text-dark-100 p-4 font-mono text-[10px] shadow-2xl relative overflow-hidden">
                            <div className="flex gap-1.5 mb-3.5 pb-2 border-b border-dark-800">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            </div>
                            <p className="text-dark-500 mb-1.5">// Querying unique features...</p>
                            <p className="mb-1 text-primary-400">codeforge --motivation</p>
                            <p className="text-dark-400 mb-2 leading-relaxed">&gt; Build structured pattern systems instead of random practice lists.</p>
                            <p className="mb-1 text-primary-400">codeforge --difference</p>
                            <p className="text-dark-400 mb-2 leading-relaxed">&gt; Fully interactive code compilers coupled with LaTeX template compilers.</p>
                            <p className="mb-0 text-primary-400">codeforge --status <span className="text-[#39d353] animate-pulse">● online</span></p>
                        </div>
                    </div>

                    {/* Right: Story Details */}
                    <div className="md:col-span-7 flex flex-col justify-center text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-primary-500/10 border-primary-500/25 text-primary-500 mb-4 self-start">
                            Behind the Project
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-6">
                            Structured by a developer, for developers.
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.accent }}>
                                    The Motivation
                                </h4>
                                <p className="text-xs leading-relaxed opacity-80">
                                    I built CodeForge because I was tired of the fragmented learning landscape. Developers spend countless hours jumping between LeetCode tabs, static architecture wikis, and local LaTeX compilers just to prepare for interviews. There was no single hub that mapped engineering structures to live code compilers. CodeForge solves that by bringing preparation under one interactive terminal.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.accent }}>
                                    How It's Different
                                </h4>
                                <p className="text-xs leading-relaxed opacity-80">
                                    Instead of feeding users 500+ LeetCode problems blindly, we specialize in **pattern-based learning**. If you master the "Two Pointer" or "Sliding Window" pattern, you can solve 90% of dynamic data problems. Furthermore, we tie algorithmic knowledge directly to **system design blueprints** and **LaTeX resume compilation** — making it a holistic developer workstation.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: currentTheme.accent }}>
                                    What Makes It Unique
                                </h4>
                                <p className="text-xs leading-relaxed opacity-80">
                                    We support active state-synchronization across light (Soft Purple) and dark (Terminal Green) themes, dynamic animated SVG compilers built into the visual widgets, and high-performance client compilers. This is a platform engineered to feel fast, secure, and visually premium.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative z-10 w-full py-16 px-6 md:px-12 bg-dark-50/20 dark:bg-dark-950/10 border-t border-dark-200/30 dark:border-dark-900/55">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-purple-500/10 border-purple-500/25 text-purple-500 mb-3 inline-block">
                            Developer Reviews
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight font-display mb-4">
                            Loved by engineers worldwide
                        </h2>
                        <p className="text-xs max-w-xl mx-auto opacity-75 leading-relaxed">
                            Read how developers use CodeForge to clear interviews, design scalable systems, and optimize resumes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "CodeForge's pattern hub helped me classify LeetCode patterns instead of trying to memorize hundreds of individual problems. It was instrumental in my prep!",
                                name: "Alex Mercer",
                                role: "Software Engineer @ Google",
                                initials: "AM",
                                color: "bg-red-500/10 text-red-500"
                            },
                            {
                                quote: "The built-in LaTeX compiler works seamlessly. I wrote my resume in 10 minutes, checked the formatting score using the ATS reviewer, and landed my Stripe callback.",
                                name: "Sarah Jenkins",
                                role: "Senior Dev @ Stripe",
                                initials: "SJ",
                                color: "bg-purple-500/10 text-purple-500"
                            },
                            {
                                quote: "The visual system design components are simply stunning. Dynamic flow diagrams help clarify concepts much faster than standard text books.",
                                name: "Vikram Malhotra",
                                role: "DevOps Engineer @ AWS",
                                initials: "VM",
                                color: "bg-green-500/10 text-green-500"
                            }
                        ].map((test, idx) => (
                            <div 
                                key={idx}
                                className="p-6 md:p-8 flex flex-col justify-between border border-dark-250/20 dark:border-dark-850/20 transition-all duration-300 hover:scale-102 hover:shadow-xl relative"
                                style={currentTheme.testimonialCardStyle}
                            >
                                <div className="absolute -top-3.5 left-6 text-3xl font-serif text-primary-500/40 select-none">“</div>
                                <p className="text-xs leading-relaxed opacity-85 italic mb-6">
                                    {test.quote}
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-dark-200/40 dark:border-dark-800/40">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${test.color}`}>
                                        {test.initials}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold leading-tight">{test.name}</h4>
                                        <p className="text-[10px] opacity-65 mt-0.5">{test.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
