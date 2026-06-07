import React from 'react';

const Logo = ({ className = "w-8 h-8", animated = true }) => {
    return (
        <svg
            className={`${className} ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}`}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" /> {/* Purple */}
                    <stop offset="50%" stopColor="#6366f1" /> {/* Indigo */}
                    <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                </linearGradient>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#39d353" /> {/* Green */}
                    <stop offset="100%" stopColor="#2ea043" /> {/* Dark Green */}
                </linearGradient>
                <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Glowing Background Glow (Subtle) */}
            <circle cx="50" cy="50" r="35" fill="url(#logoGrad)" opacity="0.15" filter="url(#logoGlow)" />

            {/* Outer Hexagon frame */}
            <path
                d="M50 12 L83 31 L83 69 L50 88 L17 69 L17 31 Z"
                stroke="url(#logoGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Inner Forged Bracket / Flame Shape */}
            <path
                d="M38 42 L28 50 L38 58"
                stroke="url(#logoGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M62 42 L72 50 L62 58"
                stroke="url(#logoGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* Center forge anvil/lightning path */}
            <path
                d="M50 32 L44 52 L56 48 L50 68"
                stroke="url(#glowGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Micro-spark dots */}
            <circle cx="50" cy="24" r="2" fill="#39d353" />
            <circle cx="28" cy="65" r="1.5" fill="#7c3aed" />
            <circle cx="72" cy="65" r="1.5" fill="#3b82f6" />
        </svg>
    );
};

export default Logo;
