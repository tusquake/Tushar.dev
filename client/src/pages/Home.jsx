import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-transparent to-dark-50/50 dark:to-dark-950/10">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float animate-delay-300" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center py-20 md:py-32">
                    <div className="animate-fade-in">
                        <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
                            🚀 Master Your Tech Interview & Skill Tracker
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight animate-slide-up">
                        Your Ultimate Developer{' '}
                        <span className="gradient-text">Learning Companion</span>
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto animate-slide-up animate-delay-100 leading-relaxed">
                        Track your DSA interview preparation, organize study roadmaps, write notes, and level up your software engineering skills in one centralized, syncable dashboard.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-200">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="btn-primary flex items-center gap-2">
                                    Go to Dashboard
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </Link>
                                <Link to="/learning" className="btn-secondary">
                                    DSA Practice Sheet
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary flex items-center gap-2">
                                    Get Started (Free)
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                                <Link to="/learning" className="btn-secondary">
                                    Browse Resources
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Platform Features Grid */}
            <section className="py-24 px-4 bg-dark-50/50 dark:bg-dark-900/40 border-y border-dark-200/20 dark:border-dark-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Everything You Need to Level Up</h2>
                        <p className="mt-4 section-subtitle mx-auto">
                            A minimalist tool designed by developers, for developers. No clutter, just progression.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card p-8 bg-white dark:bg-dark-900 border border-dark-200/40 dark:border-dark-800/60 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3">Interactive DSA Sheet</h3>
                                <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed">
                                    A hand-picked collection of 120+ high-yield interview questions, sorted by algorithmic pattern. Direct LeetCode links to code.
                                </p>
                            </div>
                            <Link to="/learning" className="mt-6 text-sm font-bold text-primary-500 hover:text-primary-650 inline-flex items-center gap-1.5 group-hover:underline">
                                Start Practice →
                            </Link>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-8 bg-white dark:bg-dark-900 border border-dark-200/40 dark:border-dark-800/60 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-650 dark:text-blue-400 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3">Personal Roadmaps</h3>
                                <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed">
                                    Add your own study modules. Classify under Frontend, Backend, DevOps, or System Design. Set priority flags and write study notes.
                                </p>
                            </div>
                            <Link to="/dashboard" className="mt-6 text-sm font-bold text-primary-500 hover:text-primary-650 inline-flex items-center gap-1.5 group-hover:underline">
                                View Dashboard →
                            </Link>
                        </div>

                        {/* Feature 3 */}
                        <div className="card p-8 bg-white dark:bg-dark-900 border border-dark-200/40 dark:border-dark-800/60 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3">Curated Resource Guides</h3>
                                <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed">
                                    Direct access to open-source guides for Backend Concepts, DSA Pattern-Wise, Low-Level Design (LLD), and High-Level Design (HLD).
                                </p>
                            </div>
                            <Link to="/learning" className="mt-6 text-sm font-bold text-primary-500 hover:text-primary-650 inline-flex items-center gap-1.5 group-hover:underline">
                                Browse Guides →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Stats */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/15 rounded-3xl p-10 md:p-14 text-center">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 dark:text-white mb-8 font-display">
                        Engineered for Rapid Skill Acquisition
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <span className="text-3xl md:text-4xl font-black text-primary-600 dark:text-primary-400 font-display">120+</span>
                            <p className="text-xs text-dark-405 dark:text-dark-500 font-bold uppercase mt-2">DSA Questions</p>
                        </div>
                        <div>
                            <span className="text-3xl md:text-4xl font-black text-primary-600 dark:text-primary-400 font-display">5+</span>
                            <p className="text-xs text-dark-405 dark:text-dark-500 font-bold uppercase mt-2">Core Categories</p>
                        </div>
                        <div>
                            <span className="text-3xl md:text-4xl font-black text-primary-600 dark:text-primary-400 font-display">Cloud</span>
                            <p className="text-xs text-dark-405 dark:text-dark-500 font-bold uppercase mt-2">Progress Sync</p>
                        </div>
                        <div>
                            <span className="text-3xl md:text-4xl font-black text-primary-600 dark:text-primary-400 font-display">Free</span>
                            <p className="text-xs text-dark-405 dark:text-dark-500 font-bold uppercase mt-2">No Hidden Costs</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet the Creator (Tushar Seth Profile block) */}
            <section className="py-24 px-4 bg-dark-50/50 dark:bg-dark-900/20 border-t border-dark-200/25 dark:border-dark-800/35">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3.5 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-3 uppercase tracking-wider">
                            Author & Developer
                        </span>
                        <h2 className="section-title">Meet the Creator</h2>
                        <p className="mt-2 section-subtitle mx-auto">
                            The software engineer who conceptualized and built DevLearn.hub
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-12 items-center">
                        {/* Profile Picture */}
                        <div className="relative md:col-span-5 flex justify-center">
                            <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 p-1 relative group">
                                <div className="w-full h-full rounded-3xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center overflow-hidden">
                                    <img
                                        src="/tushar-profile.png"
                                        alt="Tushar Seth"
                                        className="w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="absolute -top-3 -right-3 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-2.5 border border-dark-200/20 animate-float">
                                    💼 <span className="text-xs font-bold text-dark-700 dark:text-dark-200">Engineer</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="md:col-span-7">
                            <h3 className="text-3xl font-display font-extrabold text-dark-900 dark:text-white mb-2">
                                Tushar Seth
                            </h3>
                            <p className="text-primary-555 font-semibold text-sm mb-6 uppercase tracking-wider">
                                Associate Software Engineer @ Incture Technologies
                            </p>
                            
                            <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-4">
                                I build enterprise-grade web solutions and design clean, high-performance systems. I got hooked on coding by solving complex algorithm problems, solving over <span className="font-bold text-primary-500">1200+ LeetCode problems</span>, and collaborating in the open-source community.
                            </p>
                            <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-6">
                                DevLearn.hub was created to solve my own need: a clean, unified dashboard to store DSA progress and custom roadmaps in the cloud, rather than keeping them scattered across local text files and bookmark bars.
                            </p>

                            <div className="flex flex-wrap gap-2.5 mb-8">
                                {['React & Node.js', 'Java Spring Boot', 'System Design', '1200+ DSA Solved'].map((trait) => (
                                    <span key={trait} className="badge badge-primary text-xs font-semibold py-1.5 px-3">
                                        {trait}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4 items-center">
                                <a
                                    href="https://drive.google.com/file/d/1VEZLs2IXajbk_K0t330Wqv2VRNN9MGU6/view?usp=sharing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary text-sm flex items-center gap-2"
                                >
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View Resume
                                </a>
                                <div className="flex items-center gap-3">
                                    <a href="https://github.com/tusquake" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                    </a>
                                    <a href="https://www.linkedin.com/in/sethtushar111/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-gradient-to-t from-primary-500/5 to-transparent">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="section-title mb-6">Start Tracking Your Prep Today</h2>
                    <p className="text-lg text-dark-500 dark:text-dark-400 mb-8 max-w-2xl mx-auto">
                        Join other developers tracking their study structures, coding progress, and system design roadmaps.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary">
                                Open Your Dashboard
                            </Link>
                        ) : (
                            <Link to="/register" className="btn-primary">
                                Create Free Account
                            </Link>
                        )}
                        <Link to="/learning" className="btn-outline">
                            View DSA Practice Sheet
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
