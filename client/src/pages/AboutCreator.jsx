import { useState, useEffect } from 'react';
import { certificatesAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const AboutCreator = () => {
    const [certificates, setCertificates] = useState([]);
    const [certLoading, setCertLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('experience');

    // Experience details
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
                { name: 'Languages', skills: ['Java', 'JavaScript', 'C++'] },
                { name: 'Frontend', skills: ['React.js', 'SAPUI5', 'HTML5', 'CSS3', 'Tailwind CSS'] },
                { name: 'Backend', skills: ['Spring Boot', 'Spring Data JPA', 'Spring Security', 'REST APIs', 'JWT Authentication', 'Node.js', 'Microservices'] },
                { name: 'Database', skills: ['SAP HANA', 'PostgreSQL', 'MongoDB', 'Redis'] },
                { name: 'Cloud & DevOps', skills: ['SAP BTP', 'SAP WorkZone', 'AWS EC2', 'AWS S3', 'Render'] },
                { name: 'Tools', skills: ['Git', 'GitHub', 'Postman', 'Apache Kafka', 'Maven'] }
            ]
        }
    ];

    // Education details
    const education = [
        {
            degree: 'Bachelor of Technology in Computer Science and Engineering',
            institution: "St. Thomas' College Of Engineering and Technology",
            location: 'Kolkata, West Bengal',
            period: '2020 - 2024',
            gpa: '9.01/10'
        },
        {
            degree: 'Senior Secondary Education (CBSE - Class 12th)',
            institution: 'Hariyana Vidya Mandir',
            location: 'Kolkata, West Bengal',
            period: '2018 - 2020',
            percentage: '93.2%'
        }
    ];

    // Achievements details
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

    const sampleCertificates = [
        {
            _id: '1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            issueDate: '2024-01-15',
            credentialUrl: 'https://aws.amazon.com/certification',
        },
        {
            _id: '2',
            name: 'Meta React Developer Professional Certificate',
            issuer: 'Meta (Coursera)',
            issueDate: '2023-08-20',
            credentialUrl: 'https://coursera.org/verify',
        },
        {
            _id: '3',
            name: 'MongoDB Developer Certification',
            issuer: 'MongoDB University',
            issueDate: '2023-05-10',
            credentialUrl: 'https://university.mongodb.com',
        },
        {
            _id: '4',
            name: 'Node.js Application Development',
            issuer: 'OpenJS Foundation',
            issueDate: '2023-02-28',
            credentialUrl: 'https://openjsf.org',
        },
    ];

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await certificatesAPI.getAll();
                if (response.data.data.length > 0) {
                    setCertificates(response.data.data);
                } else {
                    setCertificates(sampleCertificates);
                }
            } catch (error) {
                console.log('Using sample certificates');
                setCertificates(sampleCertificates);
            } finally {
                setCertLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-transparent to-dark-50/20 dark:to-dark-950/5">
            <div className="max-w-6xl mx-auto">
                
                {/* Profile Banner */}
                <div className="card p-8 md:p-12 mb-12 relative overflow-hidden bg-gradient-to-br from-white to-dark-50 dark:from-dark-900 dark:to-dark-950">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 p-1 flex-shrink-0">
                            <div className="w-full h-full rounded-3xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center overflow-hidden">
                                <img
                                    src="/tushar-profile.png"
                                    alt="Tushar Seth"
                                    className="w-full h-full object-cover rounded-3xl"
                                />
                            </div>
                        </div>

                        {/* Summary details */}
                        <div className="text-center md:text-left flex-grow">
                            <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
                                Creator & Platform Architect
                            </span>
                            <h1 className="text-3xl md:text-5xl font-display font-black text-dark-900 dark:text-white mb-2">
                                Tushar Seth
                            </h1>
                            <p className="text-lg md:text-xl text-primary-500 font-medium mb-4">
                                Associate Software Engineer @ Incture Technologies
                            </p>
                            <p className="text-dark-500 dark:text-dark-450 leading-relaxed max-w-3xl">
                                Results-driven Software Engineer with 2+ years of experience in designing and developing scalable enterprise applications. Proficient in Java, Spring Boot, React.js, and cloud platforms including SAP BTP and AWS. Strong problem-solving skills with 1200+ Data Structures and Algorithms problems solved.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 border-b border-dark-200/20 dark:border-dark-800/30 mb-8 pb-4">
                    {[
                        { id: 'experience', name: 'Work Experience' },
                        { id: 'skills', name: 'Technical Skills' },
                        { id: 'education', name: 'Education & Accolades' },
                        { id: 'certificates', name: 'Certifications' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'bg-dark-55/40 dark:bg-dark-900 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <div className="transition-all duration-350">
                    
                    {/* Experience Tab */}
                    {activeTab === 'experience' && (
                        <div className="space-y-8 animate-fade-in">
                            {experience.map((exp, expIdx) => (
                                <Card key={expIdx} className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-dark-200/20 dark:border-dark-800/30">
                                        <div>
                                            <h3 className="text-2xl font-bold text-dark-900 dark:text-white">
                                                {exp.role}
                                            </h3>
                                            <p className="text-primary-500 font-semibold text-lg mt-1">
                                                {exp.company}
                                            </p>
                                        </div>
                                        <div className="mt-2 md:mt-0 text-left md:text-right">
                                            <span className="inline-block px-3 py-1 bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 rounded-lg text-sm font-medium">
                                                {exp.period}
                                            </span>
                                            <p className="text-sm text-dark-450 dark:text-dark-500 mt-1">{exp.location}</p>
                                        </div>
                                    </div>

                                    {/* Highlights */}
                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-4">
                                            Key Responsibilities & Achievements
                                        </h4>
                                        <ul className="space-y-3">
                                            {exp.highlights.map((item, idx) => (
                                                <li key={idx} className="flex items-start text-dark-600 dark:text-dark-305 text-sm leading-relaxed">
                                                    <span className="text-primary-500 mr-3 mt-1.5 flex-shrink-0">
                                                        <svg className="w-1.5 h-1.5 fill-current" viewBox="0 0 8 8">
                                                            <circle cx="4" cy="4" r="4" />
                                                        </svg>
                                                    </span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Technology Categories */}
                                    <div>
                                        <h4 className="text-sm font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-4">
                                            Technologies Utilized
                                        </h4>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {exp.techCategories.map((cat, catIdx) => (
                                                <div key={catIdx} className="bg-dark-50/60 dark:bg-dark-950/20 p-4 rounded-xl border border-dark-200/10 dark:border-dark-800/10">
                                                    <p className="text-xs font-bold text-primary-500 uppercase mb-2">{cat.name}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {cat.skills.map((s) => (
                                                            <span key={s} className="px-2 py-0.5 bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs rounded-md">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Technical Skills Tab */}
                    {activeTab === 'skills' && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                            {experience[0].techCategories.map((category, catIdx) => (
                                <Card key={catIdx} className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-550 flex items-center justify-center">
                                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                                            {category.name}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {category.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 bg-dark-55/50 dark:bg-dark-800 text-dark-700 dark:text-dark-300 text-sm rounded-lg font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Education & Accolades Tab */}
                    {activeTab === 'education' && (
                        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                            {/* Education column */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    Education
                                </h2>
                                <div className="space-y-6">
                                    {education.map((edu, eduIdx) => (
                                        <Card key={eduIdx} className="p-6 relative">
                                            <span className="absolute top-6 right-6 text-sm text-dark-400 dark:text-dark-500 font-semibold">
                                                {edu.period}
                                            </span>
                                            <h3 className="text-lg font-bold text-dark-900 dark:text-white pr-20 leading-snug">
                                                {edu.degree}
                                            </h3>
                                            <p className="text-primary-555 font-medium text-sm mt-1">{edu.institution}</p>
                                            <p className="text-xs text-dark-400 dark:text-dark-500 mt-2">{edu.location}</p>
                                            {edu.gpa && (
                                                <div className="mt-4 inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-md">
                                                    GPA: {edu.gpa}
                                                </div>
                                            )}
                                            {edu.percentage && (
                                                <div className="mt-4 inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-md">
                                                    Percentage: {edu.percentage}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Achievements column */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    Accolades & Achievements
                                </h2>
                                <div className="space-y-4">
                                    {achievements.map((ach, achIdx) => (
                                        <Card key={achIdx} className="p-5 flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-md font-bold text-dark-900 dark:text-white leading-snug">
                                                    {ach.title}
                                                </h3>
                                                <p className="text-sm text-dark-500 dark:text-dark-405 mt-1">{ach.description}</p>
                                                
                                                {/* Links */}
                                                {ach.link && (
                                                    <a
                                                        href={ach.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex items-center text-xs text-primary-500 hover:text-primary-600 font-bold"
                                                    >
                                                        Verify Achievement
                                                        <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </a>
                                                )}
                                                {ach.links && (
                                                    <div className="flex gap-3 mt-2">
                                                        {ach.links.map((ln, lnIdx) => (
                                                            <a
                                                                key={lnIdx}
                                                                href={ln.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-xs text-primary-500 hover:text-primary-600 font-bold"
                                                            >
                                                                {ln.label}
                                                                <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Certificates Tab */}
                    {activeTab === 'certificates' && (
                        <div>
                            {certLoading ? (
                                <Loading />
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                    {certificates.map((cert) => (
                                        <Card key={cert._id} className="p-6 group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                    </svg>
                                                </div>
                                                {cert.credentialUrl && (
                                                    <a
                                                        href={cert.credentialUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 line-clamp-2">
                                                {cert.name}
                                            </h3>
                                            <p className="text-primary-500 font-semibold text-sm mb-2">{cert.issuer}</p>
                                            <p className="text-xs text-dark-400 dark:text-dark-500">
                                                Issued {formatDate(cert.issueDate)}
                                            </p>

                                            {cert.credentialUrl && (
                                                <a
                                                    href={cert.credentialUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-4 inline-flex items-center text-xs text-primary-500 hover:text-primary-600 font-bold"
                                                >
                                                    View Credential
                                                    <svg className="w-4.5 h-4.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default AboutCreator;
