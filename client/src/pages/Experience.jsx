const Experience = () => {
    const experience = [
        {
            role: 'Associate Software Engineer',
            company: 'Incture Technologies',
            location: 'Kolkata, West Bengal',
            period: 'Oct 2024 - Present',
            highlights: [
                'Developed a metadata-driven reusable checklist component with internationalization (i18n) support for 50+ languages, deployed across 15+ modules, and built an automated workflow engine with scheduler-based triggers, role-based approvals, and activity logging for process tracking.',
                'Designed approval status services handling 10,000+ submission records, implementing server-side pagination and sorting to ensure scalable data retrieval and improved performance.',
                'Built a chart payload builder using the Strategy Design Pattern to support 10+ chart types, with Factory Pattern for strategy selection and an orchestrator layer for payload construction, reducing client-side code by 60%.',
                'Engineered a real-time monitoring system using WebSockets to detect asset failures and trigger instant alerts, reducing incident response time by 35%; developed a GenAI-based worker recommendation system using cosine similarity.',
                'Optimized a data-intensive dashboard by consolidating multiple REST API calls into batch requests, eliminating redundant data fetching and reducing API response time from 15+ seconds to under 2 seconds.',
                'Built a centralized document management system using SAP Object Store with multipart file uploads and streaming downloads for large files, improving performance by 30%.',
                'Developed a configuration-driven deviation rule engine enabling admin-configurable ranges via REST APIs, enforcing overlap-free validation rules, and reducing UI change requests by 70%.'
            ],
            techCategories: [
                { name: 'Languages', skills: ['Java', 'JavaScript'] },
                { name: 'Frontend', skills: ['React.js', 'SAPUI5', 'HTML5', 'CSS3'] },
                { name: 'Backend', skills: ['Spring Boot', 'Spring Data JPA', 'REST APIs', 'JWT Authentication'] },
                { name: 'Database', skills: ['SAP HANA', 'PostgreSQL'] },
                { name: 'Cloud', skills: ['SAP BTP', 'SAP WorkZone'] },
                { name: 'Tools', skills: ['Git', 'GitHub', 'Maven'] }
            ]
        }
    ];

    const education = [
        {
            degree: 'Bachelor of Technology in Computer Science and Engineering',
            institution: "St. Thomas' College Of Engineering and Technology",
            location: 'Kolkata, West Bengal',
            period: '2020 - 2024',
            gpa: '9.01'
        },
        {
            degree: 'Senior Secondary Education (CBSE - Class 12th)',
            institution: 'Hariyana Vidya Mandir',
            location: 'Kolkata, West Bengal',
            period: '2018 - 2020',
            percentage: '93.2%'
        }
    ];

    const achievements = [
        {
            title: 'Rising Star Award (Q4 2024)',
            description: 'Received at Incture Technologies for consistent performance and positive client feedback.',
            link: 'https://www.linkedin.com/in/sethtushar111/overlay/1752914910849/single-media-viewer/?profileId=ACoAADMZ-9wBarryFpx94aY8Zf3pilEOGK9RVA0'
        },
        {
            title: '1200+ DSA Problems Solved',
            description: '600+ problems on LeetCode and 600+ on GeeksforGeeks.',
            links: [
                { label: 'LeetCode', url: 'https://leetcode.com/u/Tushar_Seth/' },
                { label: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/user/tusharrealme/' }
            ]
        },
        {
            title: 'Technical Content Writer',
            description: 'Worked at GeeksforGeeks, creating technical articles and tutorials.',
            link: 'https://drive.google.com/file/d/1M6rrt0oB7shMnPUY9bNR3ReOE8gDAC5D/view?usp=sharing'
        },
        {
            title: 'Open Source Contributor',
            description: 'Contributed to projects under GirlScript Summer of Code (GSSoC).',
            link: 'https://github.com/tusquake/GameZone'
        },
        {
            title: 'Hackathon Participant',
            description: 'Participated in Flipkart Grid and Walmart Converge hackathons.',
            links: [
                { label: 'Flipkart Grid', url: 'https://drive.google.com/file/d/1Tpc8oi0x5tv7tvJ-b9yS8QUmGDjEfl7J/view?usp=sharing' },
                { label: 'Walmart Converge', url: 'https://drive.google.com/file/d/1Cq-w0SmKoDMQMmP1VNjrkfBk_VwszXx1/view?usp=sharing' }
            ]
        }
    ];

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="section-title">Experience</h1>
                    <p className="mt-4 section-subtitle mx-auto">
                        My professional journey and achievements
                    </p>
                </div>

                {/* Work Experience Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-8 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work Experience
                    </h2>
                    <div className="space-y-8">
                        {experience.map((exp, index) => (
                            <div key={index} className="card p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white">
                                            {exp.role}
                                        </h3>
                                        <p className="text-primary-500 font-medium">{exp.company}</p>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">{exp.location}</p>
                                    </div>
                                    <span className="badge badge-gray mt-2 md:mt-0">{exp.period}</span>
                                </div>

                                {/* Key Highlights */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-3">
                                        Key Contributions
                                    </h4>
                                    <ul className="space-y-2">
                                        {exp.highlights.map((highlight, i) => (
                                            <li key={i} className="text-dark-600 dark:text-dark-300 flex items-start text-sm">
                                                <span className="text-primary-500 mr-2 mt-1">•</span>
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Technologies Used */}
                                <div className="border-t border-dark-200 dark:border-dark-700 pt-6">
                                    <h4 className="text-sm font-semibold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-4">
                                        Technologies Used
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {exp.techCategories.map((category) => (
                                            <div key={category.name} className="bg-dark-50 dark:bg-dark-800/50 rounded-lg p-3">
                                                <p className="text-xs font-medium text-primary-500 mb-2">{category.name}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {category.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="inline-block px-2 py-0.5 bg-white dark:bg-dark-700 text-dark-700 dark:text-dark-200 text-xs rounded border border-dark-200 dark:border-dark-600"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-8 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        Education
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {education.map((edu, index) => (
                            <div key={index} className="card p-6">
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">
                                            {edu.institution}
                                        </h3>
                                        <p className="text-primary-500 font-medium text-sm mb-1">{edu.degree}</p>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">{edu.location}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="badge badge-gray">{edu.period}</span>
                                        <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                            {edu.gpa ? `GPA: ${edu.gpa}` : `${edu.percentage}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Achievements Section */}
                <section>
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-8 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Achievements & Certifications
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="card p-6 hover:scale-105 transition-transform duration-300"
                            >
                                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                                    {achievement.link ? (
                                        <a
                                            href={achievement.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary-500 transition-colors"
                                        >
                                            {achievement.title}
                                            <svg className="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ) : (
                                        achievement.title
                                    )}
                                </h3>
                                <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">
                                    {achievement.description}
                                </p>
                                {achievement.links && (
                                    <div className="flex flex-wrap gap-2">
                                        {achievement.links.map((linkItem, i) => (
                                            <a
                                                key={i}
                                                href={linkItem.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                                            >
                                                {linkItem.label}
                                                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Experience;
