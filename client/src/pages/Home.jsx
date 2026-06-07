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
        <path d="M22 18V32M22 32L19 29M22 32L25 29" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <text x="22" y="12" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">L</text>
        
        <path d="M172 95V81M172 81L169 84M172 81L175 84" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <text x="172" y="106" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">R</text>
    </svg>
);

const SlidingWindowSVG = ({ accent, text, muted }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 40)">
            {[1, 3, 5, 2, 8, 4].map((val, idx) => {
                const isInside = idx >= 1 && idx <= 3;
                return (
                    <g key={idx} transform={`translate(${idx * 30}, 0)`}>
                        <rect width="24" height="24" rx="4" fill="none" stroke={isInside ? accent : muted} strokeWidth="1.5" />
                        <text x="12" y="15" fill={isInside ? accent : text} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{val}</text>
                    </g>
                );
            })}
            <rect x="27" y="-4" width="86" height="32" rx="4" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="3 3" />
        </g>
        <path d="M42 22V32" stroke={accent} strokeWidth="1" />
        <text x="42" y="15" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace">i</text>
        
        <path d="M102 22V32" stroke={accent} strokeWidth="1" />
        <text x="102" y="15" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace">j</text>
    </svg>
);

const BFSTreeSVG = ({ accent, text, muted, secondary }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="20" r="10" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="100" y="23" fill={text} fontSize="8" textAnchor="middle" fontFamily="monospace">1</text>
        
        <circle cx="70" cy="55" r="10" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="70" y="58" fill={text} fontSize="8" textAnchor="middle" fontFamily="monospace">2</text>
        
        <circle cx="130" cy="55" r="10" fill="none" stroke={accent} strokeWidth="1.5" />
        <text x="130" y="58" fill={text} fontSize="8" textAnchor="middle" fontFamily="monospace">3</text>
        
        <circle cx="45" cy="90" r="10" fill="none" stroke={muted} strokeWidth="1.5" />
        <text x="45" y="93" fill={text} fontSize="8" textAnchor="middle" fontFamily="monospace">4</text>
        
        <circle cx="95" cy="90" r="10" fill="none" stroke={muted} strokeWidth="1.5" />
        <text x="95" y="93" fill={text} fontSize="8" textAnchor="middle" fontFamily="monospace">5</text>
        
        <line x1="93" y1="28" x2="77" y2="47" stroke={muted} strokeWidth="1.2" />
        <line x1="107" y1="28" x2="123" y2="47" stroke={muted} strokeWidth="1.2" />
        <line x1="64" y1="63" x2="51" y2="82" stroke={muted} strokeWidth="1.2" />
        <line x1="76" y1="63" x2="89" y2="82" stroke={muted} strokeWidth="1.2" />
        
        <path d="M40 38H155" stroke={secondary} strokeWidth="1.2" strokeDasharray="3 2" />
        <path d="M155 38L151 35M155 38L151 41" stroke={secondary} strokeWidth="1.2" />
        <text x="175" y="41" fill={secondary} fontSize="8" textAnchor="middle" fontFamily="monospace">Queue</text>
    </svg>
);

const PrefixSumSVG = ({ accent, text, muted }) => (
    <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="25" fill={muted} fontSize="8" fontFamily="monospace">A =</text>
        <g transform="translate(35, 10)">
            {[3, 1, 4, 2].map((val, idx) => (
                <g key={idx} transform={`translate(${idx * 30}, 0)`}>
                    <rect width="20" height="20" rx="3" fill="none" stroke={muted} strokeWidth="1.5" />
                    <text x="10" y="13" fill={text} fontSize="8" textAnchor="middle" fontFamily="monospace">{val}</text>
                </g>
            ))}
        </g>
        
        <path d="M45 36V62M75 36V62M105 36V62M135 36V62" stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
        
        <text x="10" y="85" fill={accent} fontSize="8" fontFamily="monospace">P =</text>
        <g transform="translate(35, 70)">
            {[3, 4, 8, 10].map((val, idx) => (
                <g key={idx} transform={`translate(${idx * 30}, 0)`}>
                    <rect width="20" height="20" rx="3" fill="none" stroke={accent} strokeWidth="1.5" />
                    <text x="10" y="13" fill={accent} fontSize="8" textAnchor="middle" fontFamily="monospace">{val}</text>
                </g>
            ))}
        </g>
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
                <div className="md:col-span-7 flex flex-col items-start text-left">
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
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200"
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

                    {/* Sliding Window Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">Sliding Window</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <SlidingWindowSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} />
                        </div>
                    </div>

                    {/* BFS Tree Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">BFS Tree</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <BFSTreeSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} secondary={currentTheme.secondary} />
                        </div>
                    </div>

                    {/* Prefix Sum Card */}
                    <div 
                        className="p-4 flex flex-col justify-between aspect-square transition-all duration-200"
                        style={{ 
                            backgroundColor: isDark ? currentTheme.surface : '#ffffff', 
                            border: currentTheme.diagramBorder,
                            borderRadius: currentTheme.radius,
                            boxShadow: currentTheme.shadow
                        }}
                    >
                        <span className="text-[11px] font-bold tracking-wider opacity-70 uppercase">Prefix Sum</span>
                        <div className="flex-1 flex items-center justify-center py-2">
                            <PrefixSumSVG accent={currentTheme.accent} text={isDark ? currentTheme.text : '#1e1b4b'} muted={currentTheme.muted} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Row Section */}
            <section className="w-full py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'DSA Patterns',
                            desc: 'Master 15+ algorithmic patterns instead of memorizing 500+ LeetCode problems blindly.'
                        },
                        {
                            title: 'System Design',
                            desc: 'Scale your architectures from 10 users to 10M+ with structured high-level and low-level design guides.'
                        },
                        {
                            title: 'Mock Interviews',
                            desc: 'Track your roadmap and practice with evaluation rubrics structured for tier-1 tech company standard.'
                        }
                    ].map((feature, idx) => (
                        <div 
                            key={idx}
                            className="p-6 md:p-8 flex flex-col justify-between transition-all duration-200"
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
