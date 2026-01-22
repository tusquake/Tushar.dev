import { Link } from 'react-router-dom';
import SkillsOrbit from '../components/skills/SkillsOrbit';

const Home = () => {
    const experience = [
        {
            role: 'Associate Software Engineer',
            company: 'Incture Technologies',
            location: 'Kolkata, West Bengal',
            period: 'Oct 2024 - Present',
            highlights: [
                'Built metadata-driven reusable checklist component with event-based state management and i18n support for 50+ languages',
                'Developed chart payload builder using Strategy Pattern supporting 10+ chart types, reducing client-side code by 60%',
                'Engineered real-time monitoring system using WebSockets to detect asset failures and trigger instant alerts',
                'Optimized OEE scheduling dashboard by consolidating multiple REST API calls into batch requests, reducing response time from 15+ seconds to under 2 seconds'
            ],
            techStack: ['Java', 'JavaScript', 'REST APIs', 'Spring Boot', 'SAP BTP', 'PostgreSQL', 'Git']
        }
    ];

    const projects = [
        {
            title: 'HomeGenie (Smart Maintenance Management System)',
            description: 'AI-powered maintenance platform with integrated Voice Assistant enabling Admin, Resident, and Technician users to manage over 200+ monthly requests via voice or text.',
            techStack: ['Spring Boot', 'React', 'FastAPI', 'PostgreSQL', 'AWS', 'Gemini API'],
            links: { github: '#', live: '#' }
        },
        {
            title: 'SpendWise (AI-powered Expense Tracker)',
            description: 'Built AI-powered expense tracker with automatic categorization using Gemini API, OAuth 2.0 authentication, and interactive React dashboards.',
            techStack: ['Spring Boot', 'React', 'OAuth 2.0', 'PostgreSQL', 'Gemini API'],
            links: { github: '#', live: '#' }
        }
    ];

    const education = [
        {
            degree: 'Bachelor of Technology in Computer Science and Engineering',
            institution: "St. Thomas' College Of Engineering and Technology",
            location: 'Kolkata, West Bengal',
            period: '2020 - 2024',
            gpa: '9.01'
        }
    ];

    const achievements = [
        'Received Rising Star Award (Q4 2024) at Incture Technologies for consistent performance',
        'Solved 600+ DSA problems on LeetCode and 600+ on GeeksforGeeks',
        'Worked as a Technical Content Writer at GFG',
        'Participated in hackathons including Flipkart Grid and Walmart Converge'
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float animate-delay-300" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="animate-fade-in">
                        <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
                            Welcome to my portfolio
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight animate-slide-up">
                        Hi, I'm{' '}
                        <span className="gradient-text">Tushar Seth</span>
                    </h1>

                    <p className="mt-6 text-xl md:text-2xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto animate-slide-up animate-delay-100">
                        <span className="text-primary-500">Associate Software Engineer</span>{' '}
                        at Incture Technologies, crafting scalable web solutions.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-delay-200">
                        <Link to="/projects" className="btn-primary">
                            View My Work
                            <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                        >
                            <svg className="inline-block mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Resume
                        </a>
                    </div>

                    {/* Social Links */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <a href="https://github.com/tusquake" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                        </a>
                        <a href="https://www.linkedin.com/in/sethtushar111/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                        <a href="https://leetcode.com/tusharseth" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" /></svg>
                        </a>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <svg className="w-6 h-6 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 px-4 bg-dark-50 dark:bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">About Me</h2>
                        <p className="mt-4 section-subtitle mx-auto">
                            Associate Software Engineer at Incture Technologies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image/Avatar placeholder */}
                        <div className="relative">
                            <div className="w-full max-w-md mx-auto aspect-square rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 p-1">
                                <div className="w-full h-full rounded-3xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center overflow-hidden">
                                    <span className="text-8xl">👨‍💻</span>
                                </div>
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -top-4 -right-4 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-3 animate-float">
                                <span className="text-2xl">⚛️</span>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-3 animate-float animate-delay-200">
                                <span className="text-2xl">☕</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-white mb-4">
                                Building Scalable Solutions with Modern Tech
                            </h3>
                            <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-6">
                                I'm an Associate Software Engineer at Incture Technologies with a passion for creating
                                elegant solutions to complex problems. With expertise in Java, Spring Boot, React, and
                                cloud technologies, I build applications that are not only functional but also
                                delightful to use.
                            </p>
                            <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-6">
                                I graduated from St. Thomas' College of Engineering and Technology with a GPA of 9.01.
                                I've solved over 600+ DSA problems on LeetCode and contributed to various open-source projects.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {['Problem Solver', 'Java Expert', 'Full Stack', 'Cloud Enthusiast'].map((trait) => (
                                    <span key={trait} className="badge badge-primary">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section - Using SkillsOrbit Component */}
            <SkillsOrbit />

            {/* Experience Section */}
            <section className="py-20 px-4 bg-dark-50 dark:bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Experience</h2>
                        <p className="mt-4 section-subtitle mx-auto">
                            My professional journey
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {experience.map((exp, index) => (
                            <div key={index} className="card p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white">
                                            {exp.role}
                                        </h3>
                                        <p className="text-primary-500 font-medium">{exp.company}</p>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">{exp.location}</p>
                                    </div>
                                    <span className="badge badge-gray mt-2 md:mt-0">{exp.period}</span>
                                </div>
                                <ul className="space-y-2 mb-4">
                                    {exp.highlights.map((highlight, i) => (
                                        <li key={i} className="text-dark-600 dark:text-dark-300 flex items-start">
                                            <span className="text-primary-500 mr-2">•</span>
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-wrap gap-2">
                                    {exp.techStack.map((tech) => (
                                        <span key={tech} className="badge badge-primary text-xs">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Education Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Education</h2>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        {education.map((edu, index) => (
                            <div key={index} className="card p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white">
                                            {edu.institution}
                                        </h3>
                                        <p className="text-primary-500 font-medium">{edu.degree}</p>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">{edu.location}</p>
                                    </div>
                                    <div className="text-right mt-2 md:mt-0">
                                        <span className="badge badge-gray">{edu.period}</span>
                                        <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mt-1">GPA: {edu.gpa}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-20 px-4 bg-dark-50 dark:bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Achievements</h2>
                    </div>

                    <div className="max-w-3xl mx-auto grid gap-4">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="card p-4 flex items-center">
                                <span className="text-2xl mr-4">🏆</span>
                                <p className="text-dark-700 dark:text-dark-300">{achievement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="section-title mb-6">Let's Work Together</h2>
                    <p className="text-lg text-dark-500 dark:text-dark-400 mb-8 max-w-2xl mx-auto">
                        Have a project in mind? I'd love to hear about it. Let's discuss how we can
                        bring your ideas to life.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/contact" className="btn-primary">
                            Get In Touch
                        </Link>
                        <Link to="/projects" className="btn-outline">
                            View Projects
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
