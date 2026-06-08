import { useState, useEffect } from 'react';
import ResumeHeader from '../components/layout/ResumeHeader';
import Card from '../components/common/Card';
import { callLlm, getApiKeys } from '../utils/ai';
import { resumeAPI } from '../services/api';
import ReviewModal from '../components/common/ReviewModal';

const initialResumeState = {
    personalInfo: {
        name: '',
        email: '',
        phone: '',
        linkedIn: '',
        gitHub: '',
        portfolio: ''
    },
    summary: '',
    experience: [
        {
            company: '',
            role: '',
            period: '',
            location: '',
            highlights: ['']
        }
    ],
    education: [
        {
            degree: '',
            institution: '',
            year: '',
            gpa: ''
        }
    ],
    skills: {
        languages: '',
        frameworks: '',
        tools: '',
        concepts: ''
    },
    projects: [
        {
            title: '',
            techStack: '',
            description: '',
            githubLink: ''
        }
    ],
    certifications: ''
};
const ResumeBuilder = () => {
    const [resumeData, setResumeData] = useState(initialResumeState);
    const [activeSection, setActiveSection] = useState('personal');
    const [aiLoading, setAiLoading] = useState({ summary: false, experience: {} });
    const [toast, setToast] = useState('');
    const [apiKeyWarning, setApiKeyWarning] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const [selectedLayout, setSelectedLayout] = useState(() => localStorage.getItem('codeforge_resume_layout') || 'classic');
    const [selectedAccent, setSelectedAccent] = useState(() => localStorage.getItem('codeforge_resume_accent') || 'charcoal');
    const [selectedFont, setSelectedFont] = useState(() => localStorage.getItem('codeforge_resume_font') || 'serif');
    
    // Advanced professional customization options
    const [selectedFontSize, setSelectedFontSize] = useState(() => localStorage.getItem('codeforge_resume_fontsize') || 'normal');
    const [selectedMargins, setSelectedMargins] = useState(() => localStorage.getItem('codeforge_resume_margins') || 'normal');
    const [dividerStyle, setDividerStyle] = useState(() => localStorage.getItem('codeforge_resume_divider') || 'solid');
    const [sectionOrder, setSectionOrder] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('codeforge_resume_section_order')) || ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'];
        } catch {
            return ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'];
        }
    });

    // Save selection changes
    useEffect(() => {
        localStorage.setItem('codeforge_resume_layout', selectedLayout);
    }, [selectedLayout]);
    useEffect(() => {
        localStorage.setItem('codeforge_resume_accent', selectedAccent);
    }, [selectedAccent]);
    useEffect(() => {
        localStorage.setItem('codeforge_resume_font', selectedFont);
    }, [selectedFont]);
    useEffect(() => {
        localStorage.setItem('codeforge_resume_fontsize', selectedFontSize);
    }, [selectedFontSize]);
    useEffect(() => {
        localStorage.setItem('codeforge_resume_margins', selectedMargins);
    }, [selectedMargins]);
    useEffect(() => {
        localStorage.setItem('codeforge_resume_divider', dividerStyle);
    }, [dividerStyle]);
    useEffect(() => {
        localStorage.setItem('codeforge_resume_section_order', JSON.stringify(sectionOrder));
    }, [sectionOrder]);

    const moveSection = (index, direction) => {
        const newOrder = [...sectionOrder];
        const temp = newOrder[index];
        newOrder[index] = newOrder[index + direction];
        newOrder[index + direction] = temp;
        setSectionOrder(newOrder);
    };

    const getAccentClass = () => {
        switch (selectedAccent) {
            case 'navy': return 'text-blue-900 border-blue-900 dark:text-blue-900 dark:border-blue-900';
            case 'emerald': return 'text-emerald-800 border-emerald-800 dark:text-emerald-800 dark:border-emerald-800';
            case 'indigo': return 'text-indigo-600 border-indigo-600 dark:text-indigo-600 dark:border-indigo-600';
            default: return 'text-gray-900 border-gray-900 dark:text-gray-900 dark:border-gray-900';
        }
    };

    const getFontFamilyStyle = () => {
        switch (selectedFont) {
            case 'sans': return { fontFamily: '"Inter", Arial, sans-serif' };
            case 'slab': return { fontFamily: '"Georgia", serif' };
            default: return { fontFamily: '"Times New Roman", Times, serif' };
        }
    };

    const getFontFamilyCss = () => {
        switch (selectedFont) {
            case 'sans': return "font-family: 'Inter', sans-serif !important;";
            case 'slab': return "font-family: 'Georgia', serif !important;";
            default: return "font-family: 'Times New Roman', Times, serif !important;";
        }
    };

    const getMarginsCss = () => {
        switch (selectedMargins) {
            case 'compact': return 'padding: 1.25cm 1.0cm !important;';
            case 'spacious': return 'padding: 2.6cm 2.2cm !important;';
            default: return 'padding: 1.8cm 1.5cm !important;'; // normal
        }
    };

    const getMarginsPreviewStyle = () => {
        switch (selectedMargins) {
            case 'compact': return { padding: '1.25cm 1.0cm' };
            case 'spacious': return { padding: '2.6cm 2.2cm' };
            default: return { padding: '1.8cm 1.5cm' }; // normal
        }
    };

    const getFontSizeClasses = () => {
        switch (selectedFontSize) {
            case 'small':
                return {
                    body: 'text-[9.5px] leading-relaxed',
                    heading: 'text-[10px]',
                    name: 'text-xl'
                };
            case 'large':
                return {
                    body: 'text-[11.5px] leading-relaxed',
                    heading: 'text-[12.5px]',
                    name: 'text-3xl'
                };
            default:
                return {
                    body: 'text-[10.5px] leading-relaxed',
                    heading: 'text-[11px]',
                    name: 'text-2xl'
                };
        }
    };

    const getClassicHeadingClass = () => {
        const accentClass = getAccentClass();
        const fs = getFontSizeClasses();
        let border = 'border-b pb-0.5';
        if (dividerStyle === 'left-bar') border = 'border-l-4 pl-2';
        else if (dividerStyle === 'none') border = '';
        return `${fs.heading} font-bold mb-1.5 uppercase ${border} ${accentClass}`;
    };

    const getModernHeadingClass = () => {
        const accentClass = getAccentClass();
        const fs = getFontSizeClasses();
        let border = 'border-l-4 pl-2';
        if (dividerStyle === 'solid') border = 'border-b pb-0.5';
        else if (dividerStyle === 'none') border = '';
        return `${fs.heading} font-bold mb-2 uppercase ${border} ${accentClass}`;
    };

    // Calculate dynamic ATS score and details
    const calculateAtsScore = () => {
        let score = 0;
        const suggestions = [];

        // 1. Personal Contact Info
        if (resumeData.personalInfo.name) score += 5;
        if (resumeData.personalInfo.email && resumeData.personalInfo.phone) {
            score += 15;
        } else {
            suggestions.push("Add your email and phone number to make contacting you simple.");
        }
        if (resumeData.personalInfo.linkedIn || resumeData.personalInfo.gitHub) {
            score += 10;
        } else {
            suggestions.push("Provide LinkedIn or GitHub profile link to prove digital footprints.");
        }

        // 2. Summary
        if (resumeData.summary) {
            if (resumeData.summary.length >= 100 && resumeData.summary.length <= 400) {
                score += 15;
            } else if (resumeData.summary.length > 400) {
                score += 10;
                suggestions.push("Shorten summary under 400 chars to avoid cognitive overload.");
            } else {
                score += 10;
                suggestions.push("Extend summary slightly to properly detail career credentials.");
            }
        } else {
            suggestions.push("Write a short Professional Summary outlining core engineering competencies.");
        }

        // 3. Technical Skills
        const skillsCount = [
            resumeData.skills.languages,
            resumeData.skills.frameworks,
            resumeData.skills.tools,
            resumeData.skills.concepts
        ].filter(Boolean).length;
        if (skillsCount >= 3) {
            score += 20;
        } else if (skillsCount > 0) {
            score += 10;
            suggestions.push("Add specialized frameworks & tools to trigger resume parsing algorithms.");
        } else {
            suggestions.push("Incorporate Technical Skills sections showing your full engineering stack.");
        }

        // 4. Experience & Action Verbs
        const hasExp = resumeData.experience.some(exp => exp.company);
        if (hasExp) {
            score += 15;
            
            const actionVerbs = [
                'led', 'developed', 'designed', 'built', 'optimized', 'created', 'spearheaded', 'implemented', 
                'improved', 'managed', 'engineered', 'launched', 'architected', 'scaled', 'delivered', 
                'automated', 'reduced', 'increased', 'mentored', 'directed'
            ];
            let actionVerbUsed = false;
            resumeData.experience.forEach(exp => {
                exp.highlights.forEach(bullet => {
                    if (bullet) {
                        const words = bullet.toLowerCase().split(/\s+/);
                        if (words.some(w => actionVerbs.includes(w))) {
                            actionVerbUsed = true;
                        }
                    }
                });
            });

            if (actionVerbUsed) {
                score += 10;
            } else {
                suggestions.push("Start experience highlights with strong action verbs (e.g. Optimized, Automated).");
            }
        } else {
            suggestions.push("Add Professional Experience timeline details.");
        }

        // 5. Education
        if (resumeData.education.some(edu => edu.institution)) {
            score += 10;
        } else {
            suggestions.push("List education details/degree information.");
        }

        return { score: Math.min(100, score), suggestions };
    };

    // AI ATS bullet optimizer
    const optimizeAtsBullets = async () => {
        const experienceWithHighlights = resumeData.experience.filter(exp => exp.company && exp.highlights.some(h => h.trim()));
        if (experienceWithHighlights.length === 0) {
            showToast("Please fill out some experience highlights first!");
            return;
        }

        setAiLoading(prev => ({ ...prev, ats: true }));
        try {
            const prompt = `You are a world-class resume optimizer specializing in ATS algorithms. Re-write the following resume highlights so that they strictly conform to the Google XYZ layout: Accomplished [X], as measured by [Y], by doing [Z]. Start each bullet point with a strong, distinct action verb. Avoid any adjectives or fluff. Respond ONLY with a valid JSON array of strings containing the exact re-written highlights. Do not include markdown tags.
Original highlights:
${JSON.stringify(experienceWithHighlights.flatMap(exp => exp.highlights.filter(Boolean)))}`;

            const result = await callLlm(prompt);
            let cleanedResult = result.trim();
            if (cleanedResult.startsWith('```json')) {
                cleanedResult = cleanedResult.substring(7, cleanedResult.length - 3).trim();
            } else if (cleanedResult.startsWith('```')) {
                cleanedResult = cleanedResult.substring(3, cleanedResult.length - 3).trim();
            }
            
            const newBullets = JSON.parse(cleanedResult);
            if (Array.isArray(newBullets)) {
                let bulletIdx = 0;
                updateResumeData(prev => {
                    const newExp = prev.experience.map(exp => {
                        if (!exp.company) return exp;
                        const nextHighlights = exp.highlights.map(h => {
                            if (!h.trim()) return h;
                            const replacement = newBullets[bulletIdx] || h;
                            bulletIdx++;
                            return replacement;
                        });
                        return { ...exp, highlights: nextHighlights };
                    });
                    return { ...prev, experience: newExp };
                });
                showToast("All bullets rewritten for ATS compatibility!");
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to run AI ATS optimization.");
        } finally {
            setAiLoading(prev => ({ ...prev, ats: false }));
        }
    };

    const renderClassicSection = (sectionName) => {
        const accentClass = getAccentClass();
        const headingClass = getClassicHeadingClass();
        switch (sectionName) {
            case 'summary':
                if (!resumeData.summary) return null;
                return (
                    <div className="mb-4" key="summary">
                        <h2 className={headingClass}>Professional Summary</h2>
                        <p className="text-gray-800 text-justify">
                            {resumeData.summary}
                        </p>
                    </div>
                );
            case 'experience':
                if (!resumeData.experience.some(exp => exp.company)) return null;
                return (
                    <div className="mb-4" key="experience">
                        <h2 className={headingClass}>Professional Experience</h2>
                        <div className="space-y-3">
                            {resumeData.experience.map((exp, idx) => {
                                if (!exp.company) return null;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between font-bold text-black">
                                            <span>{exp.company}</span>
                                            <span>{exp.period || 'Period'}</span>
                                        </div>
                                        <div className="flex justify-between italic text-[10px] text-gray-700 mb-1">
                                            <span>{exp.role || 'Job Title'}</span>
                                            <span>{exp.location || 'Location'}</span>
                                        </div>
                                        <ul className="list-disc pl-5 text-gray-800 space-y-1">
                                            {exp.highlights.map((bullet, bIdx) => (
                                                bullet && <li key={bIdx}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'skills':
                if (!(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.tools || resumeData.skills.concepts)) return null;
                return (
                    <div className="mb-4" key="skills">
                        <h2 className={headingClass}>Technical Skills</h2>
                        <div className="text-gray-800 space-y-1">
                            {resumeData.skills.languages && (
                                <div><span className="font-bold">Languages:</span> {resumeData.skills.languages}</div>
                            )}
                            {resumeData.skills.frameworks && (
                                <div><span className="font-bold">Frameworks & Libraries:</span> {resumeData.skills.frameworks}</div>
                            )}
                            {resumeData.skills.tools && (
                                <div><span className="font-bold">Tools & Databases:</span> {resumeData.skills.tools}</div>
                            )}
                            {resumeData.skills.concepts && (
                                <div><span className="font-bold">Core Concepts:</span> {resumeData.skills.concepts}</div>
                            )}
                        </div>
                    </div>
                );
            case 'projects':
                if (!resumeData.projects.some(proj => proj.title)) return null;
                return (
                    <div className="mb-4" key="projects">
                        <h2 className={headingClass}>Key Projects</h2>
                        <div className="space-y-3">
                            {resumeData.projects.map((proj, idx) => {
                                if (!proj.title) return null;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between font-bold text-black">
                                            <span>{proj.title}</span>
                                            <span className="font-normal text-[10px] text-gray-600 italic">
                                                {proj.githubLink || ''}
                                            </span>
                                        </div>
                                        <div className="italic text-[10px] text-gray-700 mb-1">
                                            <span>Tech Stack: {proj.techStack}</span>
                                        </div>
                                        <p className="text-gray-800 text-justify">
                                            {proj.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'education':
                if (!resumeData.education.some(edu => edu.institution)) return null;
                return (
                    <div className="mb-4" key="education">
                        <h2 className={headingClass}>Education</h2>
                        <div className="space-y-2">
                            {resumeData.education.map((edu, idx) => {
                                if (!edu.institution) return null;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between font-bold text-black">
                                            <span>{edu.institution}</span>
                                            <span>{edu.year}</span>
                                        </div>
                                        <div className="flex justify-between italic text-[10px] text-gray-700">
                                            <span>{edu.degree}</span>
                                            <span>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'certifications':
                if (!resumeData.certifications) return null;
                return (
                    <div className="mb-4" key="certifications">
                        <h2 className={headingClass}>Certifications & Achievements</h2>
                        <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                            {resumeData.certifications}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderModernSection = (sectionName) => {
        const accentClass = getAccentClass();
        const headingClass = getModernHeadingClass();
        switch (sectionName) {
            case 'summary':
                if (!resumeData.summary) return null;
                return (
                    <div className="mb-5" key="summary">
                        <h2 className={headingClass}>Professional Summary</h2>
                        <p className="text-gray-800 text-justify">
                            {resumeData.summary}
                        </p>
                    </div>
                );
            case 'experience':
                if (!resumeData.experience.some(exp => exp.company)) return null;
                return (
                    <div className="mb-5" key="experience">
                        <h2 className={headingClass}>Professional Experience</h2>
                        <div className="space-y-4">
                            {resumeData.experience.map((exp, idx) => {
                                if (!exp.company) return null;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between font-bold text-black">
                                            <span>{exp.role || 'Job Title'}</span>
                                            <span>{exp.period || 'Period'}</span>
                                        </div>
                                        <div className="flex justify-between italic text-[10px] text-gray-600 mb-1.5">
                                            <span>{exp.company}</span>
                                            <span>{exp.location || 'Location'}</span>
                                        </div>
                                        <ul className="list-disc pl-5 text-gray-800 space-y-1">
                                            {exp.highlights.map((bullet, bIdx) => (
                                                bullet && <li key={bIdx}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'skills':
                if (!(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.tools || resumeData.skills.concepts)) return null;
                return (
                    <div className="mb-5" key="skills">
                        <h2 className={headingClass}>Technical Skills</h2>
                        <div className="text-gray-800 space-y-1">
                            {resumeData.skills.languages && (
                                <div><span className="font-bold">Languages:</span> {resumeData.skills.languages}</div>
                            )}
                            {resumeData.skills.frameworks && (
                                <div><span className="font-bold">Frameworks & Libraries:</span> {resumeData.skills.frameworks}</div>
                            )}
                            {resumeData.skills.tools && (
                                <div><span className="font-bold">Tools & Databases:</span> {resumeData.skills.tools}</div>
                            )}
                            {resumeData.skills.concepts && (
                                <div><span className="font-bold">Core Concepts:</span> {resumeData.skills.concepts}</div>
                            )}
                        </div>
                    </div>
                );
            case 'projects':
                if (!resumeData.projects.some(proj => proj.title)) return null;
                return (
                    <div className="mb-5" key="projects">
                        <h2 className={headingClass}>Key Projects</h2>
                        <div className="space-y-4">
                            {resumeData.projects.map((proj, idx) => {
                                if (!proj.title) return null;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between font-bold text-black">
                                            <span>{proj.title}</span>
                                            <span className="font-normal text-[10px] text-gray-600 italic">
                                                {proj.githubLink || ''}
                                            </span>
                                        </div>
                                        <div className="italic text-[10px] text-gray-600 mb-1">
                                            <span>Tech Stack: {proj.techStack}</span>
                                        </div>
                                        <p className="text-gray-800 text-justify">
                                            {proj.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'education':
                if (!resumeData.education.some(edu => edu.institution)) return null;
                return (
                    <div className="mb-5" key="education">
                        <h2 className={headingClass}>Education</h2>
                        <div className="space-y-2.5">
                            {resumeData.education.map((edu, idx) => {
                                if (!edu.institution) return null;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between font-bold text-black">
                                            <span>{edu.degree}</span>
                                            <span>{edu.year}</span>
                                        </div>
                                        <div className="flex justify-between italic text-[10px] text-gray-600">
                                            <span>{edu.institution}</span>
                                            <span>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'certifications':
                if (!resumeData.certifications) return null;
                return (
                    <div className="mb-5" key="certifications">
                        <h2 className={headingClass}>Certifications & Achievements</h2>
                        <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                            {resumeData.certifications}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderClassicLayout = () => {
        const accentClass = getAccentClass();
        const fs = getFontSizeClasses();
        return (
            <div className={fs.body}>
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className={`font-bold uppercase tracking-tight mb-1 ${fs.name} ${accentClass}`}>
                        {resumeData.personalInfo.name || 'YOUR NAME'}
                    </h1>
                    <div className="text-[10px] text-gray-700">
                        {[
                            resumeData.personalInfo.email,
                            resumeData.personalInfo.phone,
                            resumeData.personalInfo.linkedIn,
                            resumeData.personalInfo.gitHub,
                            resumeData.personalInfo.portfolio
                        ].filter(Boolean).join('  |  ')}
                    </div>
                </div>

                {sectionOrder.map(sec => renderClassicSection(sec))}
            </div>
        );
    };

    const renderModernLayout = () => {
        const accentClass = getAccentClass();
        const fs = getFontSizeClasses();
        return (
            <div className={fs.body}>
                {/* Header Grid */}
                <div className="flex justify-between items-start border-b pb-4 mb-5 border-gray-100">
                    <div>
                        <h1 className={`font-extrabold uppercase tracking-tight ${fs.name} ${accentClass}`}>
                            {resumeData.personalInfo.name || 'YOUR NAME'}
                        </h1>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1 font-semibold">
                            Software Engineer & Developer
                        </p>
                    </div>
                    <div className="text-right text-[9.5px] text-gray-700 space-y-0.5">
                        {resumeData.personalInfo.email && <div><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Email:</span> {resumeData.personalInfo.email}</div>}
                        {resumeData.personalInfo.phone && <div><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Phone:</span> {resumeData.personalInfo.phone}</div>}
                        {resumeData.personalInfo.linkedIn && <div><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">LinkedIn:</span> {resumeData.personalInfo.linkedIn}</div>}
                        {resumeData.personalInfo.gitHub && <div><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">GitHub:</span> {resumeData.personalInfo.gitHub}</div>}
                        {resumeData.personalInfo.portfolio && <div><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Portfolio:</span> {resumeData.personalInfo.portfolio}</div>}
                    </div>
                </div>

                {sectionOrder.map(sec => renderModernSection(sec))}
            </div>
        );
    };

    const renderTwoColumnLayout = () => {
        const accentClass = getAccentClass();
        const fs = getFontSizeClasses();
        const headingClass = getClassicHeadingClass(); // fallback divider

        // Group columns based on layout strategy
        const leftSections = sectionOrder.filter(s => ['skills', 'education', 'certifications'].includes(s));
        const rightSections = sectionOrder.filter(s => ['summary', 'experience', 'projects'].includes(s));

        return (
            <div className={`grid grid-cols-12 gap-6 ${fs.body}`}>
                {/* Left Side Column */}
                <div className="col-span-4 border-r border-gray-100 pr-5 space-y-5">
                    {/* Contact Details */}
                    <div>
                        <h3 className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${accentClass}`}>
                            Contact
                        </h3>
                        <div className="text-[9.5px] text-gray-700 space-y-2 break-words">
                            {resumeData.personalInfo.email && (
                                <div>
                                    <div className="font-bold text-gray-400 uppercase text-[8px]">Email</div>
                                    <div>{resumeData.personalInfo.email}</div>
                                </div>
                            )}
                            {resumeData.personalInfo.phone && (
                                <div>
                                    <div className="font-bold text-gray-400 uppercase text-[8px]">Phone</div>
                                    <div>{resumeData.personalInfo.phone}</div>
                                </div>
                            )}
                            {resumeData.personalInfo.linkedIn && (
                                <div>
                                    <div className="font-bold text-gray-400 uppercase text-[8px]">LinkedIn</div>
                                    <div>{resumeData.personalInfo.linkedIn}</div>
                                </div>
                            )}
                            {resumeData.personalInfo.gitHub && (
                                <div>
                                    <div className="font-bold text-gray-400 uppercase text-[8px]">GitHub</div>
                                    <div>{resumeData.personalInfo.gitHub}</div>
                                </div>
                            )}
                            {resumeData.personalInfo.portfolio && (
                                <div>
                                    <div className="font-bold text-gray-400 uppercase text-[8px]">Portfolio</div>
                                    <div>{resumeData.personalInfo.portfolio}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {leftSections.map(secName => {
                        if (secName === 'skills') {
                            if (!(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.tools || resumeData.skills.concepts)) return null;
                            return (
                                <div key="skills">
                                    <h3 className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 border-b pb-0.5 ${accentClass}`}>
                                        Skills
                                    </h3>
                                    <div className="text-[9.5px] text-gray-700 space-y-2.5">
                                        {resumeData.skills.languages && (
                                            <div>
                                                <div className="font-bold text-gray-900">Languages:</div>
                                                <div className="text-gray-600">{resumeData.skills.languages}</div>
                                            </div>
                                        )}
                                        {resumeData.skills.frameworks && (
                                            <div>
                                                <div className="font-bold text-gray-900">Frameworks:</div>
                                                <div className="text-gray-600">{resumeData.skills.frameworks}</div>
                                            </div>
                                        )}
                                        {resumeData.skills.tools && (
                                            <div>
                                                <div className="font-bold text-gray-900">Tools:</div>
                                                <div className="text-gray-600">{resumeData.skills.tools}</div>
                                            </div>
                                        )}
                                        {resumeData.skills.concepts && (
                                            <div>
                                                <div className="font-bold text-gray-900">Concepts:</div>
                                                <div className="text-gray-600">{resumeData.skills.concepts}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        if (secName === 'education') {
                            if (!resumeData.education.some(edu => edu.institution)) return null;
                            return (
                                <div key="education">
                                    <h3 className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 border-b pb-0.5 ${accentClass}`}>
                                        Education
                                    </h3>
                                    <div className="space-y-3">
                                        {resumeData.education.map((edu, idx) => {
                                            if (!edu.institution) return null;
                                            return (
                                                <div key={idx} className="text-[9.5px]">
                                                    <div className="font-bold text-gray-900">{edu.degree}</div>
                                                    <div className="text-gray-600 italic">{edu.institution}</div>
                                                    <div className="text-gray-500">{edu.year} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        if (secName === 'certifications') {
                            if (!resumeData.certifications) return null;
                            return (
                                <div key="certifications">
                                    <h3 className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 border-b pb-0.5 ${accentClass}`}>
                                        Achievements
                                    </h3>
                                    <p className="text-[9.5px] text-gray-700 whitespace-pre-line leading-normal">
                                        {resumeData.certifications}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* Right Main Column */}
                <div className="col-span-8 space-y-5">
                    {/* Header */}
                    <div>
                        <h1 className={`font-black uppercase tracking-tight ${fs.name} ${accentClass}`}>
                            {resumeData.personalInfo.name || 'YOUR NAME'}
                        </h1>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">
                            Software Engineer & Developer
                        </p>
                    </div>

                    {rightSections.map(secName => {
                        if (secName === 'summary') {
                            if (!resumeData.summary) return null;
                            return (
                                <div key="summary">
                                    <h2 className={headingClass}>Professional Summary</h2>
                                    <p className="text-gray-800 text-justify font-serif">
                                        {resumeData.summary}
                                    </p>
                                </div>
                            );
                        }
                        if (secName === 'experience') {
                            if (!resumeData.experience.some(exp => exp.company)) return null;
                            return (
                                <div key="experience">
                                    <h2 className={headingClass}>Professional Experience</h2>
                                    <div className="space-y-4">
                                        {resumeData.experience.map((exp, idx) => {
                                            if (!exp.company) return null;
                                            return (
                                                <div key={idx}>
                                                    <div className="flex justify-between font-bold text-black">
                                                        <span>{exp.role || 'Job Title'}</span>
                                                        <span>{exp.period || 'Period'}</span>
                                                    </div>
                                                    <div className="flex justify-between italic text-[10px] text-gray-600 mb-1.5">
                                                        <span>{exp.company}</span>
                                                        <span>{exp.location || 'Location'}</span>
                                                    </div>
                                                    <ul className="list-disc pl-5 text-gray-800 space-y-1">
                                                        {exp.highlights.map((bullet, bIdx) => (
                                                            bullet && <li key={bIdx}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        if (secName === 'projects') {
                            if (!resumeData.projects.some(proj => proj.title)) return null;
                            return (
                                <div key="projects">
                                    <h2 className={headingClass}>Key Projects</h2>
                                    <div className="space-y-4">
                                        {resumeData.projects.map((proj, idx) => {
                                            if (!proj.title) return null;
                                            return (
                                                <div key={idx}>
                                                    <div className="flex justify-between font-bold text-black">
                                                        <span>{proj.title}</span>
                                                        <span className="font-normal text-[10px] text-gray-600 italic">
                                                            {proj.githubLink || ''}
                                                        </span>
                                                    </div>
                                                    <div className="italic text-[10px] text-gray-600 mb-1">
                                                        <span>Tech Stack: {proj.techStack}</span>
                                                    </div>
                                                    <p className="text-gray-800 text-justify">
                                                        {proj.description}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    };

    // Load saved data (local first, then sync from database)
    useEffect(() => {
        const loadInitialData = async () => {
            const savedData = localStorage.getItem('codeforge_resume');
            const saveLocal = localStorage.getItem('codeforge_save_local') !== 'false';
            
            if (savedData && saveLocal) {
                try {
                    setResumeData(JSON.parse(savedData));
                } catch (e) {
                    console.error('Failed to parse saved resume data', e);
                }
            }

            try {
                const response = await resumeAPI.get();
                if (response.data && response.data.data) {
                    setResumeData(response.data.data);
                    localStorage.setItem('codeforge_resume', JSON.stringify(response.data.data));
                }
            } catch (err) {
                console.error('Failed to load resume from DB', err);
            } finally {
                setIsLoaded(true);
            }
        };

        loadInitialData();

        // Check API key
        const keys = getApiKeys();
        if (!keys.geminiKey && !keys.groqKey) {
            setApiKeyWarning(true);
        }
    }, []);

    // Debounced database sync to avoid hitting the DB on every single key stroke
    useEffect(() => {
        if (!isLoaded) return;

        const timer = setTimeout(async () => {
            try {
                await resumeAPI.save(resumeData);
            } catch (err) {
                console.error('Failed to sync resume to DB', err);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [resumeData, isLoaded]);

    // Save data on change
    const updateResumeData = (updater) => {
        setResumeData(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            const saveLocal = localStorage.getItem('codeforge_save_local') !== 'false';
            if (saveLocal) {
                localStorage.setItem('codeforge_resume', JSON.stringify(next));
            }
            return next;
        });
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // AI summary improvement
    const improveSummary = async () => {
        if (!resumeData.summary) {
            showToast('Please write a draft summary first.');
            return;
        }

        setAiLoading(prev => ({ ...prev, summary: true }));
        try {
            const prompt = `Rewrite this developer resume summary to be concise, impactful, and ATS-friendly. Use strong action verbs. Max 3 sentences. Return only the improved text. Original: ${resumeData.summary}`;
            const result = await callLlm(prompt);
            updateResumeData(prev => ({ ...prev, summary: result.trim() }));
            showToast('Summary improved with AI!');
        } catch (err) {
            console.error(err);
            showToast('AI improvement failed. Try again.');
        } finally {
            setAiLoading(prev => ({ ...prev, summary: false }));
        }
    };

    // AI bullet point improvement
    const improveBullet = async (expIdx, bulletIdx) => {
        const bulletText = resumeData.experience[expIdx].highlights[bulletIdx];
        if (!bulletText) {
            showToast('Please enter some text in this bullet first.');
            return;
        }

        setAiLoading(prev => ({
            ...prev,
            experience: { ...prev.experience, [`${expIdx}-${bulletIdx}`]: true }
        }));

        try {
            const prompt = `Rewrite this resume bullet point to start with a strong action verb, include measurable impact if possible, and be ATS-friendly. Max 1 line. Return only the improved bullet. Original: ${bulletText}`;
            const result = await callLlm(prompt);
            
            updateResumeData(prev => {
                const updatedExp = [...prev.experience];
                updatedExp[expIdx].highlights[bulletIdx] = result.trim();
                return { ...prev, experience: updatedExp };
            });
            showToast('Bullet point enhanced with AI!');
        } catch (err) {
            console.error(err);
            showToast('AI enhancement failed. Try again.');
        } finally {
            setAiLoading(prev => ({
                ...prev,
                experience: { ...prev.experience, [`${expIdx}-${bulletIdx}`]: false }
            }));
        }
    };

    // Accordion handler
    const toggleSection = (sectionName) => {
        setActiveSection(activeSection === sectionName ? '' : sectionName);
    };

    // Form modification helpers
    const handlePersonalInfoChange = (field, val) => {
        updateResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: val }
        }));
    };

    const handleAddExperience = () => {
        updateResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { company: '', role: '', period: '', location: '', highlights: [''] }]
        }));
    };

    const handleRemoveExperience = (idx) => {
        updateResumeData(prev => {
            const exp = prev.experience.filter((_, i) => i !== idx);
            return { ...prev, experience: exp.length ? exp : [{ company: '', role: '', period: '', location: '', highlights: [''] }] };
        });
    };

    const handleExperienceChange = (expIdx, field, val) => {
        updateResumeData(prev => {
            const nextExp = [...prev.experience];
            nextExp[expIdx][field] = val;
            return { ...prev, experience: nextExp };
        });
    };

    const handleAddBullet = (expIdx) => {
        updateResumeData(prev => {
            const nextExp = [...prev.experience];
            nextExp[expIdx].highlights.push('');
            return { ...prev, experience: nextExp };
        });
    };

    const handleRemoveBullet = (expIdx, bulletIdx) => {
        updateResumeData(prev => {
            const nextExp = [...prev.experience];
            nextExp[expIdx].highlights = nextExp[expIdx].highlights.filter((_, i) => i !== bulletIdx);
            if (!nextExp[expIdx].highlights.length) nextExp[expIdx].highlights = [''];
            return { ...prev, experience: nextExp };
        });
    };

    const handleBulletChange = (expIdx, bulletIdx, val) => {
        updateResumeData(prev => {
            const nextExp = [...prev.experience];
            nextExp[expIdx].highlights[bulletIdx] = val;
            return { ...prev, experience: nextExp };
        });
    };

    const handleAddEducation = () => {
        updateResumeData(prev => ({
            ...prev,
            education: [...prev.education, { degree: '', institution: '', year: '', gpa: '' }]
        }));
    };

    const handleRemoveEducation = (idx) => {
        updateResumeData(prev => {
            const edu = prev.education.filter((_, i) => i !== idx);
            return { ...prev, education: edu.length ? edu : [{ degree: '', institution: '', year: '', gpa: '' }] };
        });
    };

    const handleEducationChange = (eduIdx, field, val) => {
        updateResumeData(prev => {
            const nextEdu = [...prev.education];
            nextEdu[eduIdx][field] = val;
            return { ...prev, education: nextEdu };
        });
    };

    const handleSkillsChange = (cat, val) => {
        updateResumeData(prev => ({
            ...prev,
            skills: { ...prev.skills, [cat]: val }
        }));
    };

    const handleAddProject = () => {
        updateResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, { title: '', techStack: '', description: '', githubLink: '' }]
        }));
    };

    const handleRemoveProject = (idx) => {
        updateResumeData(prev => {
            const projs = prev.projects.filter((_, i) => i !== idx);
            return { ...prev, projects: projs.length ? projs : [{ title: '', techStack: '', description: '', githubLink: '' }] };
        });
    };

    const handleProjectChange = (projIdx, field, val) => {
        updateResumeData(prev => {
            const nextProjs = [...prev.projects];
            nextProjs[projIdx][field] = val;
            return { ...prev, projects: nextProjs };
        });
    };

    // Copy to clipboard helper
    const copyAsText = () => {
        const info = resumeData.personalInfo;
        let plainText = '';

        if (info.name) plainText += `${info.name.toUpperCase()}\n`;
        const contactLine = [info.email, info.phone, info.linkedIn, info.gitHub, info.portfolio].filter(Boolean).join('  |  ');
        if (contactLine) plainText += `${contactLine}\n\n`;

        if (resumeData.summary) {
            plainText += `PROFESSIONAL SUMMARY\n`;
            plainText += `====================\n`;
            plainText += `${resumeData.summary}\n\n`;
        }

        if (resumeData.experience.some(exp => exp.company)) {
            plainText += `PROFESSIONAL EXPERIENCE\n`;
            plainText += `=======================\n`;
            resumeData.experience.forEach(exp => {
                if (!exp.company) return;
                plainText += `${exp.company.toUpperCase()} - ${exp.location}\n`;
                plainText += `${exp.role} (${exp.period})\n`;
                exp.highlights.forEach(h => {
                    if (h) plainText += `• ${h}\n`;
                });
                plainText += `\n`;
            });
        }

        if (resumeData.education.some(edu => edu.institution)) {
            plainText += `EDUCATION\n`;
            plainText += `=========\n`;
            resumeData.education.forEach(edu => {
                if (!edu.institution) return;
                plainText += `${edu.institution} - ${edu.degree} (${edu.year})\n`;
                if (edu.gpa) plainText += `GPA: ${edu.gpa}\n`;
                plainText += `\n`;
            });
        }

        const skillCats = [];
        if (resumeData.skills.languages) skillCats.push(`Languages: ${resumeData.skills.languages}`);
        if (resumeData.skills.frameworks) skillCats.push(`Frameworks/Libraries: ${resumeData.skills.frameworks}`);
        if (resumeData.skills.tools) skillCats.push(`Tools/Databases: ${resumeData.skills.tools}`);
        if (resumeData.skills.concepts) skillCats.push(`Concepts/Other: ${resumeData.skills.concepts}`);

        if (skillCats.length > 0) {
            plainText += `TECHNICAL SKILLS\n`;
            plainText += `================\n`;
            plainText += skillCats.join('\n') + `\n\n`;
        }

        if (resumeData.projects.some(proj => proj.title)) {
            plainText += `PROJECTS\n`;
            plainText += `========\n`;
            resumeData.projects.forEach(proj => {
                if (!proj.title) return;
                plainText += `${proj.title.toUpperCase()} [${proj.techStack}]\n`;
                plainText += `${proj.description}\n`;
                if (proj.githubLink) plainText += `Link: ${proj.githubLink}\n`;
                plainText += `\n`;
            });
        }

        if (resumeData.certifications) {
            plainText += `CERTIFICATIONS & ACHIEVEMENTS\n`;
            plainText += `=============================\n`;
            plainText += `${resumeData.certifications}\n`;
        }

        navigator.clipboard.writeText(plainText);
        showToast('Resume text copied to clipboard!');
    };

    // Download PDF (native printing)
    const downloadPdf = () => {
        const name = resumeData.personalInfo.name || 'Resume';
        const element = document.getElementById('resume-preview-doc');
        if (!element) return;
        
        const previewContent = element.innerHTML;
        
        // Copy all parent document stylesheets (Tailwind config, custom styles)
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        const htmlContent = `
            <html>
                <head>
                    <title>Resume - ${name}</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Roboto+Slab:wght@400;500;700&display=swap" rel="stylesheet">
                    ${stylesheets}
                    <style>
                        /* Custom printing overrides */
                        body {
                            background-color: white !important;
                            color: black !important;
                            padding: 2.5cm 2cm;
                            ${getFontFamilyCss()}
                        }
                        @media print {
                            body {
                                padding: 0 !important;
                                margin: 0 !important;
                                background-color: white !important;
                                color: black !important;
                            }
                            @page {
                                size: A4 portrait;
                                margin: 1.5cm;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body class="bg-white text-black">
                    <div class="light">
                        ${previewContent}
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } else {
            // Popup blocker fallback: Use hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
            
            iframe.contentDocument.write(htmlContent);
            iframe.contentDocument.close();
            
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    setTimeout(() => {
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                    }, 3000);
                } catch (err) {
                    console.error('Iframe printing failed:', err);
                }
            }, 600);
        }
    };

    const atsInfo = calculateAtsScore();

    return (
        <>
            <div className="min-h-screen py-6 bg-dark-50 dark:bg-dark-950/20">
            <ResumeHeader />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {apiKeyWarning && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex items-center justify-between">
                        <span>Gemini API keys are unconfigured. Update them in settings to activate AI helpers.</span>
                        <a href="/settings" className="underline font-semibold hover:opacity-80">Settings →</a>
                    </div>
                )}

                {toast && (
                    <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-primary-500 text-white dark:text-dark-950 font-semibold shadow-lg animate-fade-in">
                        {toast}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Panel: Accordions */}
                    <div className="space-y-4">
                        {/* Section 1: Personal Info */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('personal')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>1. Personal Information</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'personal' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {activeSection === 'personal' && (
                                <div className="p-6 space-y-4 border-t border-dark-200/40 dark:border-dark-800/40">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Full Name</label>
                                            <input type="text" className="input" value={resumeData.personalInfo.name} onChange={(e) => handlePersonalInfoChange('name', e.target.value)} placeholder="Tushar Seth" />
                                        </div>
                                        <div>
                                            <label className="label">Email Address</label>
                                            <input type="email" className="input" value={resumeData.personalInfo.email} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} placeholder="sethtushar111@gmail.com" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Phone Number</label>
                                            <input type="text" className="input" value={resumeData.personalInfo.phone} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} placeholder="+91 98765 43210" />
                                        </div>
                                        <div>
                                            <label className="label">LinkedIn URL</label>
                                            <input type="text" className="input" value={resumeData.personalInfo.linkedIn} onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)} placeholder="linkedin.com/in/tusharseth" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">GitHub URL</label>
                                            <input type="text" className="input" value={resumeData.personalInfo.gitHub} onChange={(e) => handlePersonalInfoChange('gitHub', e.target.value)} placeholder="github.com/tushar" />
                                        </div>
                                        <div>
                                            <label className="label">Portfolio Website</label>
                                            <input type="text" className="input" value={resumeData.personalInfo.portfolio} onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)} placeholder="tushar.dev" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Section 2: Summary */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('summary')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>2. Professional Summary</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'summary' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeSection === 'summary' && (
                                <div className="p-6 space-y-4 border-t border-dark-200/40 dark:border-dark-800/40">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="label mb-0">Professional Summary</label>
                                            <button
                                                onClick={improveSummary}
                                                disabled={aiLoading.summary}
                                                className="px-3 py-1 bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 text-xs font-bold rounded-lg border border-primary-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                            >
                                                {aiLoading.summary ? (
                                                    <>
                                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Improving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        Improve with AI
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <textarea
                                            className="input min-h-[120px]"
                                            placeholder="Write a brief professional summary detailing your core value, tech expertise, and achievements..."
                                            value={resumeData.summary}
                                            onChange={(e) => updateResumeData(prev => ({ ...prev, summary: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Section 3: Experience */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('experience')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>3. Work Experience ({resumeData.experience.length})</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'experience' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeSection === 'experience' && (
                                <div className="p-6 space-y-6 border-t border-dark-200/40 dark:border-dark-800/40">
                                    {resumeData.experience.map((exp, expIdx) => (
                                        <div key={expIdx} className="p-4 border border-dark-200/50 dark:border-dark-800/60 rounded-xl space-y-4 relative">
                                            <button
                                                onClick={() => handleRemoveExperience(expIdx)}
                                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                            
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Company</label>
                                                    <input type="text" className="input text-sm" value={exp.company} onChange={(e) => handleExperienceChange(expIdx, 'company', e.target.value)} placeholder="Incture Technologies" />
                                                </div>
                                                <div>
                                                    <label className="label">Role / Job Title</label>
                                                    <input type="text" className="input text-sm" value={exp.role} onChange={(e) => handleExperienceChange(expIdx, 'role', e.target.value)} placeholder="Associate Software Engineer" />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Employment Period</label>
                                                    <input type="text" className="input text-sm" value={exp.period} onChange={(e) => handleExperienceChange(expIdx, 'period', e.target.value)} placeholder="Oct 2024 - Present" />
                                                </div>
                                                <div>
                                                    <label className="label">Location</label>
                                                    <input type="text" className="input text-sm" value={exp.location} onChange={(e) => handleExperienceChange(expIdx, 'location', e.target.value)} placeholder="Kolkata, West Bengal" />
                                                </div>
                                            </div>

                                            {/* Bullet Points */}
                                            <div className="space-y-3">
                                                <label className="label">Key Responsibilities / Bullet Points</label>
                                                {exp.highlights.map((bullet, bulletIdx) => (
                                                    <div key={bulletIdx} className="flex gap-2 items-center">
                                                        <span className="text-dark-400 font-semibold text-xs">{bulletIdx + 1}.</span>
                                                        <input
                                                            type="text"
                                                            className="input text-sm flex-grow"
                                                            value={bullet}
                                                            onChange={(e) => handleBulletChange(expIdx, bulletIdx, e.target.value)}
                                                            placeholder="Built internationalized modular dashboard using React and REST APIs..."
                                                        />
                                                        <button
                                                            onClick={() => improveBullet(expIdx, bulletIdx)}
                                                            disabled={aiLoading.experience[`${expIdx}-${bulletIdx}`]}
                                                            className="px-2 py-2 bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-xl text-xs hover:bg-primary-500/20 transition-all flex-shrink-0 cursor-pointer disabled:opacity-50"
                                                            title="Enhance Bullet with AI"
                                                        >
                                                            {aiLoading.experience[`${expIdx}-${bulletIdx}`] ? (
                                                                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveBullet(expIdx, bulletIdx)}
                                                            className="text-red-500 hover:text-red-700 text-sm font-bold px-2 cursor-pointer"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleAddBullet(expIdx)}
                                                    className="text-xs text-primary-500 font-semibold hover:opacity-85 cursor-pointer mt-1"
                                                >
                                                    + Add Bullet Point
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddExperience}
                                        className="w-full py-2.5 border border-dashed border-primary-500/40 text-primary-500 hover:bg-primary-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                                    >
                                        + Add Work Experience Entry
                                    </button>
                                </div>
                            )}
                        </Card>

                        {/* Section 4: Education */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('education')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>4. Education ({resumeData.education.length})</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'education' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeSection === 'education' && (
                                <div className="p-6 space-y-6 border-t border-dark-200/40 dark:border-dark-800/40">
                                    {resumeData.education.map((edu, eduIdx) => (
                                        <div key={eduIdx} className="p-4 border border-dark-200/50 dark:border-dark-800/60 rounded-xl space-y-4 relative">
                                            <button
                                                onClick={() => handleRemoveEducation(eduIdx)}
                                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                                            >
                                                Remove
                                            </button>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Degree & Major</label>
                                                    <input type="text" className="input text-sm" value={edu.degree} onChange={(e) => handleEducationChange(eduIdx, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" />
                                                </div>
                                                <div>
                                                    <label className="label">Institution</label>
                                                    <input type="text" className="input text-sm" value={edu.institution} onChange={(e) => handleEducationChange(eduIdx, 'institution', e.target.value)} placeholder="SRM University" />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Graduation Year</label>
                                                    <input type="text" className="input text-sm" value={edu.year} onChange={(e) => handleEducationChange(eduIdx, 'year', e.target.value)} placeholder="2022" />
                                                </div>
                                                <div>
                                                    <label className="label">GPA / Grade (Optional)</label>
                                                    <input type="text" className="input text-sm" value={edu.gpa} onChange={(e) => handleEducationChange(eduIdx, 'gpa', e.target.value)} placeholder="9.1 CGPA" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddEducation}
                                        className="w-full py-2.5 border border-dashed border-primary-500/40 text-primary-500 hover:bg-primary-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                                    >
                                        + Add Education Entry
                                    </button>
                                </div>
                            )}
                        </Card>

                        {/* Section 5: Skills */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('skills')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>5. Technical Skills</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'skills' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeSection === 'skills' && (
                                <div className="p-6 space-y-4 border-t border-dark-200/40 dark:border-dark-800/40">
                                    <div>
                                        <label className="label">Languages</label>
                                        <input type="text" className="input text-sm" value={resumeData.skills.languages} onChange={(e) => handleSkillsChange('languages', e.target.value)} placeholder="Java, JavaScript, C++, Python, HTML/CSS" />
                                    </div>
                                    <div>
                                        <label className="label">Frameworks / Libraries</label>
                                        <input type="text" className="input text-sm" value={resumeData.skills.frameworks} onChange={(e) => handleSkillsChange('frameworks', e.target.value)} placeholder="React.js, Spring Boot, Node.js, Express, Tailwind CSS" />
                                    </div>
                                    <div>
                                        <label className="label">Tools & Databases</label>
                                        <input type="text" className="input text-sm" value={resumeData.skills.tools} onChange={(e) => handleSkillsChange('tools', e.target.value)} placeholder="Git, GitHub, PostgreSQL, MongoDB, Redis, AWS, SAP BTP, Postman" />
                                    </div>
                                    <div>
                                        <label className="label">Core Concepts / Other</label>
                                        <input type="text" className="input text-sm" value={resumeData.skills.concepts} onChange={(e) => handleSkillsChange('concepts', e.target.value)} placeholder="DSA, Object-Oriented Programming, Microservices, REST APIs" />
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Section 6: Projects */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('projects')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>6. Projects ({resumeData.projects.length})</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'projects' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeSection === 'projects' && (
                                <div className="p-6 space-y-6 border-t border-dark-200/40 dark:border-dark-800/40">
                                    {resumeData.projects.map((proj, projIdx) => (
                                        <div key={projIdx} className="p-4 border border-dark-200/50 dark:border-dark-800/60 rounded-xl space-y-4 relative">
                                            <button
                                                onClick={() => handleRemoveProject(projIdx)}
                                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                                            >
                                                Remove
                                            </button>

                                            <div>
                                                <label className="label">Project Title</label>
                                                <input type="text" className="input text-sm" value={proj.title} onChange={(e) => handleProjectChange(projIdx, 'title', e.target.value)} placeholder="CodeForge.dev Landing Page" />
                                            </div>

                                            <div>
                                                <label className="label">Tech Stack</label>
                                                <input type="text" className="input text-sm" value={proj.techStack} onChange={(e) => handleProjectChange(projIdx, 'techStack', e.target.value)} placeholder="React, Tailwind v4, Vite, LLM Integration" />
                                            </div>

                                            <div>
                                                <label className="label">Description</label>
                                                <textarea className="input text-sm min-h-[80px]" value={proj.description} onChange={(e) => handleProjectChange(projIdx, 'description', e.target.value)} placeholder="Describe the project objective, key features, and performance accomplishments..." />
                                            </div>

                                            <div>
                                                <label className="label">GitHub Link (Optional)</label>
                                                <input type="text" className="input text-sm" value={proj.githubLink} onChange={(e) => handleProjectChange(projIdx, 'githubLink', e.target.value)} placeholder="github.com/tushar/codeforge" />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddProject}
                                        className="w-full py-2.5 border border-dashed border-primary-500/40 text-primary-500 hover:bg-primary-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                                    >
                                        + Add Project Entry
                                    </button>
                                </div>
                            )}
                        </Card>

                        {/* Section 7: Achievements */}
                        <Card className="overflow-hidden">
                            <button
                                onClick={() => toggleSection('certifications')}
                                className="w-full px-6 py-4 flex justify-between items-center font-bold text-dark-900 dark:text-white bg-dark-100/30 dark:bg-dark-800/40 hover:bg-dark-100/50 dark:hover:bg-dark-800/60 transition-all text-left cursor-pointer"
                            >
                                <span>7. Achievements & Certifications</span>
                                <svg className={`w-5 h-5 transition-transform ${activeSection === 'certifications' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeSection === 'certifications' && (
                                <div className="p-6 space-y-4 border-t border-dark-200/40 dark:border-dark-800/40">
                                    <div>
                                        <label className="label">Achievements & Certifications List</label>
                                        <textarea
                                            className="input min-h-[120px] text-sm"
                                            placeholder="AWS Certified Developer Associate (2025)&#10;LeetCode Top 500 Global Rank (#1200+ solved)&#10;Incture Spark Award for Excellence (2024)"
                                            value={resumeData.certifications}
                                            onChange={(e) => updateResumeData(prev => ({ ...prev, certifications: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right Panel: Live formatted resume preview */}
                    <div className="space-y-4 lg:sticky lg:top-24">
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={copyAsText}
                                className="px-4 py-2 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Copy Text
                            </button>

                            <button
                                onClick={() => { downloadPdf(); setTimeout(() => setShowReviewModal(true), 1500); }}
                                className="btn-primary text-sm py-2 flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </button>
                        </div>

                        {/* Style & Layout Selectors */}
                        <div className="bg-white dark:bg-dark-900/60 p-5 border border-dark-200/50 dark:border-dark-800 rounded-2xl space-y-4 shadow-sm">
                            <div className="text-xs font-bold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Customize Template Structure & Theme</div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {/* Structure Selector */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase">Structure</label>
                                    <select 
                                        value={selectedLayout} 
                                        onChange={(e) => setSelectedLayout(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-850 text-dark-850 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="classic">Classic Academic</option>
                                        <option value="modern">Modern Professional</option>
                                        <option value="two-column">Two-Column Executive</option>
                                    </select>
                                </div>

                                {/* Accent Color Selector */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase">Accent Color</label>
                                    <select 
                                        value={selectedAccent} 
                                        onChange={(e) => setSelectedAccent(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-850 text-dark-850 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="charcoal">Charcoal Black</option>
                                        <option value="navy">Slate Navy</option>
                                        <option value="emerald">Emerald Forest</option>
                                        <option value="indigo">Tech Violet</option>
                                    </select>
                                </div>

                                {/* Font Family Selector */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase">Font Family</label>
                                    <select 
                                        value={selectedFont} 
                                        onChange={(e) => setSelectedFont(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-850 text-dark-850 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="serif">Classic Serif</option>
                                        <option value="sans">Modern Sans</option>
                                        <option value="slab">Elegant Slab</option>
                                    </select>
                                </div>

                                {/* Font Size Selector */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase">Font Size</label>
                                    <select 
                                        value={selectedFontSize} 
                                        onChange={(e) => setSelectedFontSize(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-850 text-dark-850 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="small">Small (Dense)</option>
                                        <option value="normal">Normal</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>

                                {/* Page Margins Selector */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase">Margins</label>
                                    <select 
                                        value={selectedMargins} 
                                        onChange={(e) => setSelectedMargins(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-850 text-dark-850 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="compact">Compact (0.5 in)</option>
                                        <option value="normal">Normal (0.75 in)</option>
                                        <option value="spacious">Spacious (1.0 in)</option>
                                    </select>
                                </div>

                                {/* Section Divider Style */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase">Section Dividers</label>
                                    <select 
                                        value={dividerStyle} 
                                        onChange={(e) => setDividerStyle(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-850 text-dark-850 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="solid">Underline</option>
                                        <option value="left-bar">Left Accent Bar</option>
                                        <option value="none">No Line</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section Re-ordering */}
                            <div className="space-y-2 pt-3 border-t border-dark-100 dark:border-dark-850">
                                <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase block">Section Ordering (ATS Control)</label>
                                <div className="flex flex-wrap gap-2">
                                    {sectionOrder.map((section, idx) => (
                                        <div key={section} className="flex items-center gap-1.5 bg-dark-50 dark:bg-dark-950 border border-dark-200 dark:border-dark-800 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg text-dark-750 dark:text-dark-350 select-none">
                                            <span className="capitalize">{section === 'certifications' ? 'Achievements' : section}</span>
                                            <div className="flex flex-col text-[7px] leading-[1] text-dark-400">
                                                {idx > 0 && <button type="button" onClick={() => moveSection(idx, -1)} className="hover:text-primary-500 cursor-pointer p-0.5">▲</button>}
                                                {idx < sectionOrder.length - 1 && <button type="button" onClick={() => moveSection(idx, 1)} className="hover:text-primary-500 cursor-pointer p-0.5">▼</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Real-time ATS Audit Card */}
                        <div className="bg-white dark:bg-dark-900/60 p-5 border border-dark-200/50 dark:border-dark-800 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="text-xs font-bold text-dark-500 dark:text-dark-400 uppercase tracking-wider">ATS Score & Audit</div>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                    atsInfo.score >= 80 
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                        : atsInfo.score >= 50 
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                }`}>
                                    {atsInfo.score}% Ready
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-dark-100 dark:bg-dark-950 rounded-full h-1.5">
                                <div 
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        atsInfo.score >= 80 
                                            ? 'bg-emerald-500' 
                                            : atsInfo.score >= 50 
                                                ? 'bg-amber-500' 
                                                : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${atsInfo.score}%` }}
                                />
                            </div>

                            {/* Suggestions */}
                            {atsInfo.suggestions.length > 0 ? (
                                <ul className="text-[10px] space-y-1 text-dark-500 dark:text-dark-400 list-disc pl-4 leading-normal">
                                    {atsInfo.suggestions.map((sug, sIdx) => (
                                        <li key={sIdx}>{sug}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Excellent! Your resume layout and fields are highly optimized for ATS.
                                </div>
                            )}

                            {/* AI ATS Enhancer Button */}
                            <button
                                onClick={optimizeAtsBullets}
                                className="w-full mt-2 py-2 px-3 bg-primary-500/10 hover:bg-primary-500/25 text-primary-600 dark:text-primary-400 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-primary-500/20"
                                disabled={aiLoading.ats}
                            >
                                {aiLoading.ats ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Rewriting Experience Highlights for ATS...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Auto-Optimize Experience Bullets (Google XYZ Formula)
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Print Preview Container */}
                        <div id="resume-preview" className="bg-white text-black shadow-xl border border-dark-200/50 rounded-2xl min-h-[840px] max-h-[85vh] overflow-y-auto" style={getMarginsPreviewStyle()}>
                            <div id="resume-preview-doc" className="text-left leading-normal text-black bg-white" style={getFontFamilyStyle()}>
                                {selectedLayout === 'two-column' 
                                    ? renderTwoColumnLayout() 
                                    : selectedLayout === 'modern' 
                                        ? renderModernLayout() 
                                        : renderClassicLayout()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <ReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            defaultTriggerAction="resume"
        />
        </>
    );
};

export default ResumeBuilder;
