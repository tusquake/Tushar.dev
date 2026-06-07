import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
        { name: 'Home', path: '/' },
        { name: 'Learning Hub', path: '/learning' },
        { name: 'Projects', path: '/projects' },
        { name: 'About Creator', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

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
                    <Link
                        to="/"
                        className="flex items-center text-2xl font-bold tracking-tight transition-all duration-200"
                        style={{
                            fontFamily: darkMode ? 'monospace' : 'Inter, sans-serif'
                        }}
                    >
                        <span className={darkMode ? 'text-white' : 'text-[#1e1b4b]'}>DevLearn</span>
                        <span className="gradient-text">.hub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
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
                    </div>

                    {/* Right side actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Theme Swatch Toggle */}
                        <div className="flex items-center gap-2 mr-2" title="Switch Theme">
                            <button
                                onClick={() => {
                                    if (!darkMode) {
                                        setDarkMode(true);
                                        document.documentElement.classList.add('dark');
                                        localStorage.setItem('theme', 'dark');
                                    }
                                }}
                                className="w-5 h-5 rounded-full cursor-pointer transition-all duration-200 focus:outline-none"
                                style={{
                                    backgroundColor: '#39d353',
                                    border: darkMode ? '2px solid #ffffff' : 'none',
                                    outline: darkMode ? '2px solid #39d353' : 'none',
                                    outlineOffset: darkMode ? '2px' : 'none'
                                }}
                                aria-label="Terminal Green Theme"
                            />
                            <button
                                onClick={() => {
                                    if (darkMode) {
                                        setDarkMode(false);
                                        document.documentElement.classList.remove('dark');
                                        localStorage.setItem('theme', 'light');
                                    }
                                }}
                                className="w-5 h-5 rounded-full cursor-pointer transition-all duration-200 focus:outline-none"
                                style={{
                                    backgroundColor: '#7c3aed',
                                    border: !darkMode ? '2px solid #1e1b4b' : 'none',
                                    outline: !darkMode ? '2px solid #7c3aed' : 'none',
                                    outlineOffset: !darkMode ? '2px' : 'none'
                                }}
                                aria-label="Soft Purple Theme"
                            />
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
                        {/* Mobile Theme Swatch Toggle */}
                        <div className="flex items-center gap-1.5 mr-1">
                            <button
                                onClick={() => {
                                    if (!darkMode) {
                                        setDarkMode(true);
                                        document.documentElement.classList.add('dark');
                                        localStorage.setItem('theme', 'dark');
                                    }
                                }}
                                className="w-4.5 h-4.5 rounded-full cursor-pointer transition-all duration-200 focus:outline-none"
                                style={{
                                    backgroundColor: '#39d353',
                                    border: darkMode ? '1.5px solid #ffffff' : 'none',
                                    outline: darkMode ? '1.5px solid #39d353' : 'none',
                                    outlineOffset: darkMode ? '1.5px' : 'none'
                                }}
                                aria-label="Terminal Green Theme"
                            />
                            <button
                                onClick={() => {
                                    if (darkMode) {
                                        setDarkMode(false);
                                        document.documentElement.classList.remove('dark');
                                        localStorage.setItem('theme', 'light');
                                    }
                                }}
                                className="w-4.5 h-4.5 rounded-full cursor-pointer transition-all duration-200 focus:outline-none"
                                style={{
                                    backgroundColor: '#7c3aed',
                                    border: !darkMode ? '1.5px solid #1e1b4b' : 'none',
                                    outline: !darkMode ? '1.5px solid #7c3aed' : 'none',
                                    outlineOffset: !darkMode ? '1.5px' : 'none'
                                }}
                                aria-label="Soft Purple Theme"
                            />
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
                    {navLinks.map((link) => (
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
                    <div className="pt-4 border-t border-dark-100 dark:border-dark-800 space-y-2">
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
