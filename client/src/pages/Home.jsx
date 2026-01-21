import { Link } from 'react-router-dom';

const Home = () => {
    const skills = [
        { name: 'React', level: 90 },
        { name: 'Node.js', level: 85 },
        { name: 'JavaScript', level: 92 },
        { name: 'TypeScript', level: 80 },
        { name: 'MongoDB', level: 85 },
        { name: 'Express.js', level: 88 },
        { name: 'Python', level: 75 },
        { name: 'Git', level: 88 },
    ];

    const experience = [
        {
            role: 'Full Stack Developer',
            company: 'Tech Company',
            period: '2023 - Present',
            description: 'Building scalable web applications using React, Node.js, and MongoDB.',
        },
        {
            role: 'Backend Developer',
            company: 'Startup Inc.',
            period: '2021 - 2023',
            description: 'Developed RESTful APIs and microservices architecture.',
        },
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
                            👋 Welcome to my portfolio
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight animate-slide-up">
                        Hi, I'm{' '}
                        <span className="gradient-text">Tushar Seth</span>
                    </h1>

                    <p className="mt-6 text-xl md:text-2xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto animate-slide-up animate-delay-100">
                        A passionate <span className="text-primary-500">Full Stack Developer</span>{' '}
                        crafting beautiful and functional web experiences.
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
                            Get to know more about my journey and what drives me
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image/Avatar placeholder */}
                        <div className="relative">
                            <div className="w-full max-w-md mx-auto aspect-square rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 p-1">
                                <div className="w-full h-full rounded-3xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
                                    <span className="text-8xl">👨‍💻</span>
                                </div>
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -top-4 -right-4 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-3 animate-float">
                                <span className="text-2xl">⚛️</span>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-3 animate-float animate-delay-200">
                                <span className="text-2xl">🚀</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-white mb-4">
                                Passionate Developer & Lifelong Learner
                            </h3>
                            <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-6">
                                I'm a Full Stack Developer with a passion for creating elegant solutions
                                to complex problems. With expertise in React, Node.js, and modern web
                                technologies, I build applications that are not only functional but also
                                delightful to use.
                            </p>
                            <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-6">
                                When I'm not coding, you can find me exploring new technologies,
                                contributing to open-source projects, or sharing knowledge with the
                                developer community.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {['Problem Solver', 'Team Player', 'Quick Learner', 'Detail Oriented'].map((trait) => (
                                    <span key={trait} className="badge badge-primary">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Skills & Expertise</h2>
                        <p className="mt-4 section-subtitle mx-auto">
                            Technologies and tools I work with
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {skills.map((skill, index) => (
                            <div
                                key={skill.name}
                                className="card p-6 group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-dark-900 dark:text-white">
                                        {skill.name}
                                    </h3>
                                    <span className="text-sm text-primary-500 font-medium">
                                        {skill.level}%
                                    </span>
                                </div>
                                <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${skill.level}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Experience Section */}
            <section className="py-20 px-4 bg-dark-50 dark:bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Experience</h2>
                        <p className="mt-4 section-subtitle mx-auto">
                            My professional journey
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-8">
                        {experience.map((exp, index) => (
                            <div key={index} className="card p-6 relative">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white">
                                            {exp.role}
                                        </h3>
                                        <p className="text-primary-500 font-medium">{exp.company}</p>
                                    </div>
                                    <span className="badge badge-gray mt-2 md:mt-0">{exp.period}</span>
                                </div>
                                <p className="text-dark-600 dark:text-dark-300">{exp.description}</p>
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
