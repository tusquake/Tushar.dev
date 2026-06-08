import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initialize dark mode
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Navigation links
    const navLinks = [
        { name: 'Learning Hub', path: '/learning' },
        { name: 'Projects', path: '/projects' },
        { name: 'AI Interview', path: '/ai-interview' },
        { name: 'Code Editor', path: '/code-editor' },
        { name: 'Profile Hub', path: '/profile' },
    ];

    const visibleNavLinks = isAuthenticated
        ? navLinks
        : [];

    const handleLogout = async () => {
        await logout();
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl shadow-lg border-b border-dark-200/20 dark:border-dark-800/35'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <BrandLogo />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {visibleNavLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-800'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        {/* Resume Dropdown */}
                        {isAuthenticated && (
                            <div className="relative group">
                                <button className="px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-800 flex items-center gap-1.5 cursor-pointer">
                                    Resume
                                    <span className="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">New</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 mt-1 w-48 rounded-xl bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                                    <Link to="/resume/builder" className="block px-4 py-2 text-sm text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400">
                                        Resume Builder
                                    </Link>
                                    <Link to="/resume/reviewer" className="block px-4 py-2 text-sm text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400">
                                        ATS Reviewer
                                    </Link>
                                    <Link to="/resume/latex" className="block px-4 py-2 text-sm text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400">
                                        LaTeX Resume
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Connect Dropdown */}
                        {isAuthenticated && (
                            <div className="relative group">
                                <button className="px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-800 flex items-center gap-1.5 cursor-pointer">
                                    Connect
                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                                    <Link to="/about" className="block px-4 py-2 text-sm text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400">
                                        About Creator
                                    </Link>
                                    <Link to="/contact" className="block px-4 py-2 text-sm text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400">
                                        Contact Info
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Settings Button */}
                        {isAuthenticated && (
                            <Link
                                to="/settings"
                                className="p-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-800 rounded-lg transition-all"
                                title="Settings"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </Link>
                        )}

                        {/* Cool Theme Switch Toggle */}
                        <div className="flex items-center mr-3" title="Switch Theme">
                            <button
                                onClick={toggleDarkMode}
                                className="w-12 h-6 rounded-full bg-dark-200 dark:bg-dark-800 p-0.5 transition-colors duration-300 relative border border-dark-350 dark:border-dark-700 cursor-pointer focus:outline-none flex items-center"
                                aria-label="Toggle Theme"
                            >
                                <div
                                    className={`w-5 h-5 rounded-full shadow-md transition-transform duration-300 transform ${
                                        darkMode 
                                            ? 'translate-x-6 bg-[#39d353] shadow-[#39d353]/30' 
                                            : 'translate-x-0 bg-[#7c3aed] shadow-[#7c3aed]/30'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Auth buttons */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm py-2 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 cursor-pointer">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-3">
                        {/* Cool Mobile Theme Switch Toggle */}
                        <div className="flex items-center mr-1" title="Switch Theme">
                            <button
                                onClick={toggleDarkMode}
                                className="w-12 h-6 rounded-full bg-dark-200 dark:bg-dark-800 p-0.5 transition-colors duration-300 relative border border-dark-350 dark:border-dark-700 cursor-pointer focus:outline-none flex items-center"
                                aria-label="Toggle Theme"
                            >
                                <div
                                    className={`w-5 h-5 rounded-full shadow-md transition-transform duration-300 transform ${
                                        darkMode 
                                            ? 'translate-x-6 bg-[#39d353] shadow-[#39d353]/30' 
                                            : 'translate-x-0 bg-[#7c3aed] shadow-[#7c3aed]/30'
                                    }`}
                                />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-dark-500 dark:text-dark-400"
                        >
                            {isOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'
                    }`}
            >
                <div className="px-4 py-4 space-y-2 bg-white dark:bg-dark-900 border-t border-dark-100 dark:border-dark-800">
                    {visibleNavLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-lg font-medium transition-all ${isActive
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-dark-600 dark:text-dark-300'
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}

                    {/* Mobile Resume Links */}
                    {isAuthenticated && (
                        <div className="px-4 py-2 border-l-2 border-primary-500/30 space-y-1 my-2">
                            <div className="text-xs font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider flex items-center mb-1">
                                Resume
                                <span className="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ml-2">New</span>
                            </div>
                            <NavLink
                                to="/resume/builder"
                                className={({ isActive }) =>
                                    `block px-2 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-dark-600 dark:text-dark-300'
                                    }`
                                }
                            >
                                Resume Builder
                            </NavLink>
                            <NavLink
                                to="/resume/reviewer"
                                className={({ isActive }) =>
                                    `block px-2 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-dark-600 dark:text-dark-300'
                                    }`
                                }
                            >
                                ATS Reviewer
                            </NavLink>
                            <NavLink
                                to="/resume/latex"
                                className={({ isActive }) =>
                                    `block px-2 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-dark-600 dark:text-dark-300'
                                    }`
                                }
                            >
                                LaTeX Resume
                            </NavLink>
                        </div>
                    )}

                    {/* Mobile Connect Links */}
                    {isAuthenticated && (
                        <div className="px-4 py-2 border-l-2 border-primary-500/30 space-y-1 my-2">
                            <div className="text-xs font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider flex items-center mb-1">
                                Connect
                            </div>
                            <NavLink
                                to="/about"
                                className={({ isActive }) =>
                                    `block px-2 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-dark-600 dark:text-dark-300'
                                    }`
                                }
                            >
                                About Creator
                            </NavLink>
                            <NavLink
                                to="/contact"
                                className={({ isActive }) =>
                                    `block px-2 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-dark-600 dark:text-dark-300'
                                    }`
                                }
                            >
                                Contact Info
                            </NavLink>
                        </div>
                    )}
                    <div className="pt-4 border-t border-dark-100 dark:border-dark-800 space-y-2">
                        {isAuthenticated && (
                            <Link
                                to="/settings"
                                className="block px-4 py-3 rounded-lg font-medium text-dark-600 dark:text-dark-300"
                            >
                                Settings
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block px-4 py-3 rounded-lg font-medium text-dark-600 dark:text-dark-300"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full btn-secondary cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-4 py-3 rounded-lg font-medium text-dark-600 dark:text-dark-300"
                                >
                                    Login
                                </Link>
                                <Link to="/register" className="block btn-primary text-center cursor-pointer">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
