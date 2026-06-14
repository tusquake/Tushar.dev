import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useState, useEffect } from 'react';

const Layout = () => {
    const [isNavbarVisible, setIsNavbarVisible] = useState(() => {
        const saved = localStorage.getItem('navbar-visible');
        return saved !== 'false';
    });

    useEffect(() => {
        localStorage.setItem('navbar-visible', isNavbarVisible);
        window.dispatchEvent(new Event('navbar-toggle'));
    }, [isNavbarVisible]);

    useEffect(() => {
        const handleToggleEvent = (e) => {
            if (e.detail !== undefined) {
                setIsNavbarVisible(e.detail);
            } else {
                setIsNavbarVisible(v => !v);
            }
        };

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                setIsNavbarVisible(v => !v);
            }
        };

        window.addEventListener('toggle-navbar', handleToggleEvent);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('toggle-navbar', handleToggleEvent);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="layout-wrapper min-h-screen flex flex-col relative">
            {isNavbarVisible ? (
                <Navbar />
            ) : (
                <button
                    onClick={() => setIsNavbarVisible(true)}
                    className="fixed top-4 left-4 z-[9999] p-2.5 bg-dark-900/80 border border-dark-800 hover:border-primary-500/50 hover:bg-dark-850/90 text-white rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md cursor-pointer opacity-70 hover:opacity-100 animate-fade-in group"
                    title="Show Navigation Bar (Ctrl+Shift+N)"
                >
                    <svg className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Show Navbar</span>
                </button>
            )}
            <main className={`flex-1 transition-all duration-300 ${isNavbarVisible ? 'pt-16 md:pt-20' : 'pt-0'}`}>
                <Outlet context={{ isNavbarVisible, setIsNavbarVisible }} />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
