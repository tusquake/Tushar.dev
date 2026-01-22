import { useEffect, useRef } from 'react';
import './skills.css';

const SkillsOrbit = () => {
    const containerRef = useRef(null);

    // Skills data with icons (using simple text/emoji for now, can be replaced with devicons)
    const skills = [
        { name: 'Java', icon: '☕', color: '#f89820' },
        { name: 'JavaScript', icon: 'JS', color: '#f7df1e' },
        { name: 'React', icon: '⚛️', color: '#61dafb' },
        { name: 'Node.js', icon: '⬢', color: '#68a063' },
        { name: 'Spring Boot', icon: '🍃', color: '#6db33f' },
        { name: 'MongoDB', icon: '🍃', color: '#47a248' },
        { name: 'PostgreSQL', icon: '🐘', color: '#336791' },
        { name: 'AWS', icon: '☁️', color: '#ff9900' },
        { name: 'Docker', icon: '🐳', color: '#2496ed' },
        { name: 'Git', icon: '📦', color: '#f05032' },
        { name: 'Redis', icon: '🔴', color: '#dc382d' },
        { name: 'TypeScript', icon: 'TS', color: '#3178c6' },
    ];

    // Skill categories for display
    const categories = [
        {
            title: 'Languages',
            skills: ['Java', 'JavaScript', 'C++', 'TypeScript']
        },
        {
            title: 'Frameworks',
            skills: ['Spring Boot', 'React.js', 'Node.js', 'Express', 'FastAPI']
        },
        {
            title: 'Databases',
            skills: ['PostgreSQL', 'MongoDB', 'Redis', 'SAP HANA']
        },
        {
            title: 'Cloud & Tools',
            skills: ['AWS', 'Docker', 'Git', 'Kafka', 'Postman']
        }
    ];

    return (
        <section className="py-20 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="section-title">Skills & Expertise</h2>
                    <p className="mt-4 section-subtitle mx-auto">
                        Technologies I work with to bring ideas to life
                    </p>
                </div>

                {/* 3D Orbital Animation */}
                <div className="skills-orbit-container" ref={containerRef}>
                    <div className="orbit-wrapper">
                        {/* Center element */}
                        <div className="orbit-center">
                            <span className="text-4xl">💻</span>
                            <span className="text-sm font-medium mt-2 text-dark-600 dark:text-dark-300">Full Stack</span>
                        </div>

                        {/* Orbital rings */}
                        <div className="orbit-ring orbit-ring-1">
                            {skills.slice(0, 4).map((skill, index) => (
                                <div
                                    key={skill.name}
                                    className="orbit-item"
                                    style={{
                                        '--index': index,
                                        '--total': 4,
                                        '--color': skill.color
                                    }}
                                >
                                    <div className="skill-icon" style={{ borderColor: skill.color }}>
                                        <span>{skill.icon}</span>
                                    </div>
                                    <span className="skill-name">{skill.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="orbit-ring orbit-ring-2">
                            {skills.slice(4, 8).map((skill, index) => (
                                <div
                                    key={skill.name}
                                    className="orbit-item"
                                    style={{
                                        '--index': index,
                                        '--total': 4,
                                        '--color': skill.color
                                    }}
                                >
                                    <div className="skill-icon" style={{ borderColor: skill.color }}>
                                        <span>{skill.icon}</span>
                                    </div>
                                    <span className="skill-name">{skill.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="orbit-ring orbit-ring-3">
                            {skills.slice(8, 12).map((skill, index) => (
                                <div
                                    key={skill.name}
                                    className="orbit-item"
                                    style={{
                                        '--index': index,
                                        '--total': 4,
                                        '--color': skill.color
                                    }}
                                >
                                    <div className="skill-icon" style={{ borderColor: skill.color }}>
                                        <span>{skill.icon}</span>
                                    </div>
                                    <span className="skill-name">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Skills Categories Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
                    {categories.map((category, idx) => (
                        <div
                            key={category.title}
                            className="skill-category-card"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
                                {category.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {category.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="skill-tag"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SkillsOrbit;
