import { useEffect, useRef } from 'react';
import './skills.css';

const SkillsOrbit = () => {
    const containerRef = useRef(null);

    // Skills data with icons for the orbital animation (21 skills for 3 rings: 6+7+8)
    const skills = [

    ];

    // Skill categories for display - matching resume exactly
    const categories = [
        {
            title: 'Programming Languages',
            skills: ['Java', 'JavaScript', 'C++']
        },
        {
            title: 'Frontend Development',
            skills: ['React.js', 'SAPUI5', 'HTML5', 'CSS3', 'Tailwind CSS']
        },
        {
            title: 'Backend Development',
            skills: ['Spring Boot', 'Spring Security', 'Spring Data JPA', 'Node.js', 'REST APIs', 'Microservices']
        },
        {
            title: 'Databases',
            skills: ['PostgreSQL', 'SAP HANA', 'MongoDB', 'Redis']
        },
        {
            title: 'Cloud & DevOps',
            skills: ['SAP BTP', 'SAP WorkZone', 'AWS EC2', 'AWS S3', 'Render']
        },
        {
            title: 'Tools',
            skills: ['Git', 'GitHub', 'Postman', 'Apache Kafka', 'Maven']
        },
        {
            title: 'Core Concepts',
            skills: ['OOP', 'DSA', 'DBMS', 'Low-Level Design']
        }
    ];

    return (
        <section className="py-20 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* <div className="text-center mb-16">
                    <h2 className="section-title">Skills & Expertise</h2>
                    <p className="mt-4 section-subtitle mx-auto">
                        Technologies I work with to bring ideas to life
                    </p>
                </div> */}

                {/* 3D Orbital Animation */}
                {/* <div className="skills-orbit-container" ref={containerRef}>
                    <div className="orbit-wrapper">

                        <div className="orbit-center">
                            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span className="text-sm font-medium mt-2 text-dark-600 dark:text-dark-300">Full Stack</span>
                        </div>

                        <div className="orbit-ring orbit-ring-1">
                            {skills.slice(0, 6).map((skill, index) => (
                                <div
                                    key={skill.name}
                                    className="orbit-item"
                                    style={{
                                        '--index': index,
                                        '--total': 6,
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
                            {skills.slice(6, 13).map((skill, index) => (
                                <div
                                    key={skill.name}
                                    className="orbit-item"
                                    style={{
                                        '--index': index,
                                        '--total': 7,
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
                            {skills.slice(13, 21).map((skill, index) => (
                                <div
                                    key={skill.name}
                                    className="orbit-item"
                                    style={{
                                        '--index': index,
                                        '--total': 8,
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
                </div> */}

                {/* Skills Categories Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
