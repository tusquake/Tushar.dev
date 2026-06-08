import { useState, useEffect } from 'react';
import ResumeHeader from '../components/layout/ResumeHeader';
import Card from '../components/common/Card';
import { callLlm, getApiKeys } from '../utils/ai';
import { resumeAPI } from '../services/api';

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
        const printWindow = window.open('', '_blank');
        const previewContent = document.getElementById('resume-preview-doc').innerHTML;
        const name = resumeData.personalInfo.name || 'Resume';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Resume - ${name}</title>
                    <style>
                        body {
                            font-family: 'Times New Roman', Times, serif, Arial, sans-serif;
                            color: #000;
                            line-height: 1.4;
                            padding: 30px;
                            font-size: 11pt;
                            margin: 0;
                            background-color: #fff;
                        }
                        .text-center { text-align: center; }
                        .name-header { font-size: 20pt; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                        .contact-header { font-size: 9.5pt; margin-bottom: 15px; }
                        .section-title { font-size: 11pt; font-weight: bold; border-bottom: 1.5px solid #000; padding-bottom: 2px; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; }
                        .summary-text { margin-bottom: 10px; text-align: justify; }
                        .flex-row { display: flex; justify-content: space-between; }
                        .item-bold { font-weight: bold; }
                        .item-italic { font-style: italic; }
                        .bullet-list { margin: 4px 0 8px 0; padding-left: 20px; }
                        .bullet-item { margin-bottom: 2px; text-align: justify; }
                        .skills-list { margin-bottom: 5px; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${previewContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
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
                                                {aiLoading.summary ? 'Improving...' : '✨ Improve with AI'}
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
                                                            {aiLoading.experience[`${expIdx}-${bulletIdx}`] ? '⏳' : '✨'}
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
                                onClick={downloadPdf}
                                className="btn-primary text-sm py-2 flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </button>
                        </div>

                        {/* Print Preview Container */}
                        <div id="resume-preview" className="bg-white text-black p-8 sm:p-12 shadow-xl border border-dark-200/50 rounded-2xl min-h-[840px] max-h-[85vh] overflow-y-auto">
                            <div id="resume-preview-doc" className="text-left font-serif leading-normal text-xs text-black bg-white">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold font-serif uppercase tracking-tight text-black mb-1">
                                        {resumeData.personalInfo.name || 'YOUR NAME'}
                                    </h1>
                                    <div className="text-[10px] text-gray-700 font-serif">
                                        {[
                                            resumeData.personalInfo.email,
                                            resumeData.personalInfo.phone,
                                            resumeData.personalInfo.linkedIn,
                                            resumeData.personalInfo.gitHub,
                                            resumeData.personalInfo.portfolio
                                        ].filter(Boolean).join('  |  ')}
                                    </div>
                                </div>

                                {/* Summary */}
                                {resumeData.summary && (
                                    <div className="mb-4">
                                        <h2 className="text-[11px] font-bold border-b border-black uppercase pb-0.5 mb-1.5 font-serif text-black">
                                            Professional Summary
                                        </h2>
                                        <p className="text-[10.5px] font-serif text-gray-800 text-justify">
                                            {resumeData.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Experience */}
                                {resumeData.experience.some(exp => exp.company) && (
                                    <div className="mb-4">
                                        <h2 className="text-[11px] font-bold border-b border-black uppercase pb-0.5 mb-1.5 font-serif text-black">
                                            Professional Experience
                                        </h2>
                                        <div className="space-y-3">
                                            {resumeData.experience.map((exp, idx) => {
                                                if (!exp.company) return null;
                                                return (
                                                    <div key={idx}>
                                                        <div className="flex justify-between font-serif font-bold text-[10.5px] text-black">
                                                            <span>{exp.company}</span>
                                                            <span>{exp.period || 'Period'}</span>
                                                        </div>
                                                        <div className="flex justify-between font-serif italic text-[10px] text-gray-700 mb-1">
                                                            <span>{exp.role || 'Job Title'}</span>
                                                            <span>{exp.location || 'Location'}</span>
                                                        </div>
                                                        <ul className="list-disc pl-5 font-serif text-[10.5px] text-gray-800 space-y-1">
                                                            {exp.highlights.map((bullet, bIdx) => (
                                                                bullet && <li key={bIdx}>{bullet}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                {(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.tools || resumeData.skills.concepts) && (
                                    <div className="mb-4">
                                        <h2 className="text-[11px] font-bold border-b border-black uppercase pb-0.5 mb-1.5 font-serif text-black">
                                            Technical Skills
                                        </h2>
                                        <div className="text-[10.5px] font-serif text-gray-800 space-y-1">
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
                                )}

                                {/* Projects */}
                                {resumeData.projects.some(proj => proj.title) && (
                                    <div className="mb-4">
                                        <h2 className="text-[11px] font-bold border-b border-black uppercase pb-0.5 mb-1.5 font-serif text-black">
                                            Key Projects
                                        </h2>
                                        <div className="space-y-3">
                                            {resumeData.projects.map((proj, idx) => {
                                                if (!proj.title) return null;
                                                return (
                                                    <div key={idx}>
                                                        <div className="flex justify-between font-serif font-bold text-[10.5px] text-black">
                                                            <span>{proj.title}</span>
                                                            <span className="font-normal text-[10px] text-gray-600 italic">
                                                                {proj.githubLink || ''}
                                                            </span>
                                                        </div>
                                                        <div className="font-serif italic text-[10px] text-gray-700 mb-1">
                                                            <span>Tech Stack: {proj.techStack}</span>
                                                        </div>
                                                        <p className="text-[10.5px] font-serif text-gray-800 text-justify">
                                                            {proj.description}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {resumeData.education.some(edu => edu.institution) && (
                                    <div className="mb-4">
                                        <h2 className="text-[11px] font-bold border-b border-black uppercase pb-0.5 mb-1.5 font-serif text-black">
                                            Education
                                        </h2>
                                        <div className="space-y-2">
                                            {resumeData.education.map((edu, idx) => {
                                                if (!edu.institution) return null;
                                                return (
                                                    <div key={idx}>
                                                        <div className="flex justify-between font-serif font-bold text-[10.5px] text-black">
                                                            <span>{edu.institution}</span>
                                                            <span>{edu.year}</span>
                                                        </div>
                                                        <div className="flex justify-between font-serif italic text-[10px] text-gray-700">
                                                            <span>{edu.degree}</span>
                                                            <span>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {resumeData.certifications && (
                                    <div className="mb-4">
                                        <h2 className="text-[11px] font-bold border-b border-black uppercase pb-0.5 mb-1.5 font-serif text-black">
                                            Certifications & Achievements
                                        </h2>
                                        <p className="text-[10.5px] font-serif text-gray-800 whitespace-pre-line leading-relaxed">
                                            {resumeData.certifications}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
