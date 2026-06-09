import React, { useState, useEffect } from 'react';

const Loading = ({ size = 'md', fullScreen = false }) => {
    const [phraseIndex, setPhraseIndex] = useState(0);

    const CUTE_PHRASES = [
        "Charging level batteries...",
        "Assembling bits & bytes...",
        "Spinning up code hamsters...",
        "Compiling developer magic...",
        "Refactoring virtual variables...",
        "Optimizing coffee absorption...",
        "Summoning achievements...",
        "Connecting to the mothership...",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % CUTE_PHRASES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Custom CSS for cute animations
    const styleBlock = (
        <style>{`
            @keyframes cute-float {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                }
                50% {
                    transform: translateY(-16px) rotate(2deg);
                }
            }
            @keyframes cute-shadow {
                0%, 100% {
                    transform: scale(1);
                    opacity: 0.25;
                }
                50% {
                    transform: scale(0.6);
                    opacity: 0.08;
                }
            }
            @keyframes eye-blink {
                0%, 90%, 100% {
                    transform: scaleY(1);
                }
                95% {
                    transform: scaleY(0.1);
                }
            }
            @keyframes particle-rise-left {
                0% {
                    transform: translate(0, 0) scale(0.8) rotate(0deg);
                    opacity: 0;
                }
                20% {
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-28px, -70px) scale(0.5) rotate(-30deg);
                    opacity: 0;
                }
            }
            @keyframes particle-rise-right {
                0% {
                    transform: translate(0, 0) scale(0.8) rotate(0deg);
                    opacity: 0;
                }
                20% {
                    opacity: 0.8;
                }
                100% {
                    transform: translate(28px, -70px) scale(0.5) rotate(30deg);
                    opacity: 0;
                }
            }
            .animate-cute-float {
                animation: cute-float 2s ease-in-out infinite;
            }
            .animate-cute-shadow {
                animation: cute-shadow 2s ease-in-out infinite;
            }
            .animate-eye-blink {
                animation: eye-blink 4s ease-in-out infinite;
            }
            .animate-particle-left {
                animation: particle-rise-left 2.5s ease-out infinite;
            }
            .animate-particle-right {
                animation: particle-rise-right 3s ease-out infinite;
                animation-delay: 0.8s;
            }
        `}</style>
    );

    const loaderContent = (
        <div className="flex flex-col items-center justify-center">
            {styleBlock}
            
            {/* Mascot Container */}
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
                {/* Float particles */}
                <div className="absolute text-[10px] font-mono font-bold text-primary-500/40 pointer-events-none animate-particle-left" style={{ top: '35%', left: '15%' }}>
                    &lt;/&gt;
                </div>
                <div className="absolute text-[10px] font-mono font-bold text-indigo-500/45 pointer-events-none animate-particle-right" style={{ top: '25%', right: '15%' }}>
                    &#123;&#125;
                </div>
                <div className="absolute text-[10px] font-mono font-bold text-primary-500/30 pointer-events-none animate-particle-left" style={{ top: '15%', right: '25%' }}>
                    101
                </div>
                <div className="absolute text-[10px] font-mono font-bold text-indigo-500/35 pointer-events-none animate-particle-right" style={{ top: '45%', left: '20%' }}>
                    ++
                </div>

                {/* Bouncing Cute Blob */}
                <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-indigo-500 dark:from-primary-500 dark:to-indigo-400 rounded-2xl animate-cute-float shadow-lg shadow-primary-500/20 flex items-center justify-center border border-white/20 dark:border-white/10 z-10">
                    {/* Cute Face */}
                    <div className="w-full h-full flex flex-col justify-center items-center gap-1.5 px-2">
                        {/* Eyes */}
                        <div className="flex justify-between w-8 px-0.5">
                            <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center relative overflow-hidden animate-eye-blink">
                                <div className="absolute w-1.5 h-1.5 bg-dark-900 rounded-full top-0.5 left-0.5" />
                                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-0.5 right-0.5" />
                            </div>
                            <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center relative overflow-hidden animate-eye-blink">
                                <div className="absolute w-1.5 h-1.5 bg-dark-900 rounded-full top-0.5 left-0.5" />
                                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-0.5 right-0.5" />
                            </div>
                        </div>
                        
                        {/* Cute terminal-style mouth/blush */}
                        <div className="flex items-center gap-0.5">
                            <div className="w-0.5 h-0.5 bg-red-400/60 rounded-full blur-[0.5px]" />
                            <div className="font-mono text-[9px] font-black text-white/95 leading-none select-none">
                                &gt;_
                            </div>
                            <div className="w-0.5 h-0.5 bg-red-400/60 rounded-full blur-[0.5px]" />
                        </div>
                    </div>
                </div>

                {/* Shadow underneath */}
                <div className="absolute bottom-3 w-10 h-1 bg-dark-950/20 dark:bg-black/50 rounded-full animate-cute-shadow blur-[1px] pointer-events-none" />
            </div>

            {/* Rotating Cute Text */}
            <div className="mt-1 text-center max-w-[240px]">
                <p className="text-xs sm:text-sm font-semibold font-display tracking-wide text-dark-800 dark:text-dark-100 animate-pulse transition-all duration-500 min-h-[20px]">
                    {CUTE_PHRASES[phraseIndex]}
                </p>
                <p className="text-[9px] text-dark-400 dark:text-dark-500 uppercase tracking-widest mt-1 font-mono">
                    Please stand by
                </p>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-dark-950/90 backdrop-blur-md z-[9999] transition-all duration-300">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-6 w-full min-h-[200px]">
            {loaderContent}
        </div>
    );
};

export default Loading;
