import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeHeader from '../components/layout/ResumeHeader';
import Card from '../components/common/Card';
import { callLlm, parseJsonResponse } from '../utils/ai';

const AtsReviewer = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('paste'); // paste, upload, built
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [pdfLoading, setPdfLoading] = useState(false);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState(null);
    const [toast, setToast] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        // Restore previous report if saved
        const savedReport = localStorage.getItem('devlearn_ats_report');
        if (savedReport) {
            try {
                setReport(JSON.parse(savedReport));
                showToast('Previous analysis report loaded');
            } catch (e) {
                console.error('Failed to parse saved report', e);
            }
        }
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // load pdf.js CDN
    const loadPdfJs = async () => {
        if (window.pdfjsLib) return window.pdfjsLib;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
            script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            };
            script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
            document.head.appendChild(script);
        });
    };

    // Extract text from PDF
    const extractTextFromPdf = async (arrayBuffer) => {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    };

    // Handle PDF upload
    const handlePdfFile = async (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setPdfLoading(true);
        setError('');
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = await extractTextFromPdf(e.target.result);
                    if (!text.trim()) {
                        throw new Error('No readable text found in PDF.');
                    }
                    setResumeText(text);
                    showToast('PDF text successfully extracted');
                } catch (err) {
                    console.error(err);
                    setError('Could not read PDF. Please paste the text instead.');
                } finally {
                    setPdfLoading(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            setError('Could not read PDF. Please paste the text instead.');
            setPdfLoading(false);
        }
    };

    // Load resume from builder
    const loadBuiltResume = () => {
        const savedData = localStorage.getItem('devlearn_resume');
        if (!savedData) {
            setError('No resume found in Resume Builder. Go build one first!');
            return;
        }
        try {
            const parsed = JSON.parse(savedData);
            const formattedText = convertResumeObjToText(parsed);
            if (!formattedText.trim()) {
                setError('Your built resume is currently empty.');
                return;
            }
            setResumeText(formattedText);
            setError('');
            showToast('Built resume loaded successfully');
        } catch (e) {
            console.error(e);
            setError('Failed to load resume from Builder.');
        }
    };

    const convertResumeObjToText = (resumeData) => {
        const info = resumeData.personalInfo;
        let plainText = '';
        if (info.name) plainText += `${info.name.toUpperCase()}\n`;
        const contactLine = [info.email, info.phone, info.linkedIn, info.gitHub, info.portfolio].filter(Boolean).join('  |  ');
        if (contactLine) plainText += `${contactLine}\n\n`;

        if (resumeData.summary) {
            plainText += `PROFESSIONAL SUMMARY\n====================\n${resumeData.summary}\n\n`;
        }
        if (resumeData.experience?.some(exp => exp.company)) {
            plainText += `PROFESSIONAL EXPERIENCE\n=======================\n`;
            resumeData.experience.forEach(exp => {
                if (!exp.company) return;
                plainText += `${exp.company.toUpperCase()} - ${exp.location}\n${exp.role} (${exp.period})\n`;
                exp.highlights.forEach(h => {
                    if (h) plainText += `• ${h}\n`;
                });
                plainText += `\n`;
            });
        }
        if (resumeData.education?.some(edu => edu.institution)) {
            plainText += `EDUCATION\n=========\n`;
            resumeData.education.forEach(edu => {
                if (!edu.institution) return;
                plainText += `${edu.institution} - ${edu.degree} (${edu.year})\n`;
                if (edu.gpa) plainText += `GPA: ${edu.gpa}\n`;
                plainText += `\n`;
            });
        }
        const skills = [];
        if (resumeData.skills?.languages) skills.push(`Languages: ${resumeData.skills.languages}`);
        if (resumeData.skills?.frameworks) skills.push(`Frameworks: ${resumeData.skills.frameworks}`);
        if (resumeData.skills?.tools) skills.push(`Tools/Databases: ${resumeData.skills.tools}`);
        if (resumeData.skills?.concepts) skills.push(`Concepts: ${resumeData.skills.concepts}`);
        if (skills.length) {
            plainText += `TECHNICAL SKILLS\n================\n${skills.join('\n')}\n\n`;
        }
        if (resumeData.projects?.some(p => p.title)) {
            plainText += `PROJECTS\n========\n`;
            resumeData.projects.forEach(p => {
                if (!p.title) return;
                plainText += `${p.title.toUpperCase()} [${p.techStack}]\n${p.description}\n`;
                if (p.githubLink) plainText += `Link: ${p.githubLink}\n`;
                plainText += `\n`;
            });
        }
        if (resumeData.certifications) {
            plainText += `CERTIFICATIONS & ACHIEVEMENTS\n=============================\n${resumeData.certifications}\n`;
        }
        return plainText;
    };

    // Main ATS review analysis
    const analyzeResume = async () => {
        if (!resumeText.trim()) {
            setError('Please provide your resume content first.');
            return;
        }

        setAnalysisLoading(true);
        setError('');
        
        const systemPrompt = `You are an expert ATS resume reviewer and technical recruiter.
Analyze the following resume and return ONLY a valid JSON object with this exact structure, no markdown, no explanation:

{
  "ats_score": number (0-100),
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": "2-3 sentence overall verdict",
  "sections": {
    "contact": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "string" },
    "summary": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "string" },
    "experience": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "string" },
    "skills": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "string" },
    "education": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "string" },
    "formatting": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "string" }
  },
  "keywords_found": ["string"],
  "keywords_missing": ["string"],
  "quick_wins": ["string"] (exactly 3 things to fix immediately),
  "strengths": ["string"] (exactly 3 things done well)
}

Resume:
${resumeText}

Job Description (if provided):
${jobDescription}`;

        try {
            const rawResponse = await callLlm(systemPrompt);
            let parsedReport;
            try {
                parsedReport = parseJsonResponse(rawResponse);
            } catch (jsonErr) {
                console.warn('JSON parsing failed. Retrying once with stricter prompt...', jsonErr);
                const retryPrompt = `The previous response was not valid JSON. Parse the resume and job description again, and return ONLY a valid JSON object matching this schema. Do not include any markdown formatting, backticks, or comments. Just the pure JSON.
                
                Schema:
                {
                  "ats_score": number,
                  "grade": "A" | "B" | "C" | "D" | "F",
                  "summary": "verdict",
                  "sections": {
                    "contact": { "score": number, "status": "excellent" | "good" | "needs_work" | "missing", "feedback": "feedback" }
                  },
                  "keywords_found": [],
                  "keywords_missing": [],
                  "quick_wins": [],
                  "strengths": []
                }
                
                Resume:
                ${resumeText}
                
                Job Description:
                ${jobDescription}`;

                const retryResponse = await callLlm(retryPrompt);
                parsedReport = parseJsonResponse(retryResponse);
            }

            setReport(parsedReport);
            localStorage.setItem('devlearn_ats_report', JSON.stringify(parsedReport));
            showToast('Resume analysis complete!');
        } catch (err) {
            console.error(err);
            setError('Analysis failed, try again.');
        } finally {
            setAnalysisLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
        if (score >= 70) return 'text-blue-500 border-blue-500 bg-blue-500/10';
        if (score >= 50) return 'text-amber-500 border-amber-500 bg-amber-500/10';
        return 'text-red-500 border-red-500 bg-red-500/10';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'good': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'needs_work': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'missing': default: return 'bg-red-500/10 text-red-500 border border-red-500/20';
        }
    };

    const downloadReport = () => {
        if (!report) return;
        const reportContent = `DEVLEARN.HUB ATS RESUME REVIEW REPORT
=====================================
Overall ATS Score: ${report.ats_score}/100 (Grade: ${report.grade})
Verdict: ${report.summary}

STRENGTHS:
${report.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

QUICK WINS FOR IMMEDIATE FIX:
${report.quick_wins.map((w, i) => `${i + 1}. ${w}`).join('\n')}

KEYWORDS FOUND:
${report.keywords_found.join(', ')}

KEYWORDS MISSING:
${report.keywords_missing.join(', ')}

SECTION RATINGS & FEEDBACK:
- Contact Details: ${report.sections.contact.score}/100 [Status: ${report.sections.contact.status}]
  Feedback: ${report.sections.contact.feedback}
- Professional Summary: ${report.sections.summary.score}/100 [Status: ${report.sections.summary.status}]
  Feedback: ${report.sections.summary.feedback}
- Experience Section: ${report.sections.experience.score}/100 [Status: ${report.sections.experience.status}]
  Feedback: ${report.sections.experience.feedback}
- Skills Listing: ${report.sections.skills.score}/100 [Status: ${report.sections.skills.status}]
  Feedback: ${report.sections.skills.feedback}
- Education Details: ${report.sections.education.score}/100 [Status: ${report.sections.education.status}]
  Feedback: ${report.sections.education.feedback}
- Layout & Formatting: ${report.sections.formatting.score}/100 [Status: ${report.sections.formatting.status}]
  Feedback: ${report.sections.formatting.feedback}
`;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ATS_Review_Report_${report.ats_score}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Drag-and-drop file handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePdfFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="min-h-screen py-6 bg-dark-50 dark:bg-dark-950/20">
            <ResumeHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {toast && (
                    <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-primary-500 text-white dark:text-dark-950 font-semibold shadow-lg animate-fade-in">
                        {toast}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-red-500 font-bold hover:opacity-85">&times;</button>
                    </div>
                )}

                {!report ? (
                    <div className="space-y-6">
                        <Card className="p-6 md:p-8">
                            <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">Evaluate Your Resume</h2>
                            
                            {/* Input Tabs */}
                            <div className="flex border-b border-dark-200/50 dark:border-dark-800 mb-6 gap-4">
                                <button
                                    onClick={() => { setActiveTab('paste'); setError(''); }}
                                    className={`pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === 'paste' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-500'}`}
                                >
                                    Paste Text
                                </button>
                                <button
                                    onClick={() => { setActiveTab('upload'); setError(''); }}
                                    className={`pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === 'upload' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-500'}`}
                                >
                                    Upload PDF
                                </button>
                                <button
                                    onClick={() => { setActiveTab('built'); loadBuiltResume(); }}
                                    className={`pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === 'built' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-500'}`}
                                >
                                    Use Built Resume
                                </button>
                            </div>

                            {/* Tab Panels */}
                            {activeTab === 'paste' && (
                                <div className="space-y-4">
                                    <label className="label">Paste Resume Content</label>
                                    <textarea
                                        className="input min-h-[200px] text-sm"
                                        placeholder="Paste your plain text resume content here..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    />
                                </div>
                            )}

                            {activeTab === 'upload' && (
                                <div className="space-y-4">
                                    <label className="label">Upload PDF Resume</label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] text-center transition-all ${
                                            dragActive ? 'border-primary-500 bg-primary-500/5' : 'border-dark-200/60 dark:border-dark-800 bg-transparent'
                                        }`}
                                    >
                                        {pdfLoading ? (
                                            <div className="space-y-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                                                <p className="text-sm text-dark-500">Extracting text from PDF...</p>
                                            </div>
                                        ) : resumeText ? (
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">✓</div>
                                                <p className="text-sm font-semibold text-dark-900 dark:text-white">PDF Loaded Successfully</p>
                                                <button onClick={() => setResumeText('')} className="text-xs text-red-500 hover:underline">Clear & Reupload</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <svg className="w-10 h-10 text-dark-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-dark-600 dark:text-dark-300">Drag & drop your PDF resume here, or click to browse</p>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => handlePdfFile(e.target.files[0])}
                                                    className="hidden"
                                                    id="pdf-upload-input"
                                                />
                                                <label htmlFor="pdf-upload-input" className="px-4 py-2 bg-dark-100 hover:bg-dark-200 dark:bg-dark-850 dark:hover:bg-dark-800 rounded-xl text-xs font-semibold cursor-pointer border border-dark-200/40 dark:border-dark-750">
                                                    Select File
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'built' && (
                                <div className="space-y-4">
                                    <label className="label">Built Resume Contents Preview</label>
                                    <div className="p-4 bg-dark-100/30 dark:bg-dark-900 border border-dark-200/50 dark:border-dark-850 rounded-xl max-h-[220px] overflow-y-auto text-xs text-dark-500 dark:text-dark-400 font-mono whitespace-pre-wrap">
                                        {resumeText || 'Your built resume is empty or not restored yet.'}
                                    </div>
                                </div>
                            )}

                            {/* Job Description (Optional) */}
                            <div className="space-y-4 mt-6">
                                <label className="label flex justify-between">
                                    <span>Job Description (Optional)</span>
                                    <span className="text-[10px] text-dark-400 dark:text-dark-500 uppercase tracking-wider">Improves Keyword Alignment</span>
                                </label>
                                <textarea
                                    className="input min-h-[120px] text-sm"
                                    placeholder="Paste the target job description or role requirements here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            {/* Action Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={analyzeResume}
                                    disabled={analysisLoading || !resumeText}
                                    className="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {analysisLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-dark-950"></div>
                                            Reviewing Resume...
                                        </>
                                    ) : (
                                        'Analyze Resume'
                                    )}
                                </button>
                            </div>
                        </Card>
                    </div>
                ) : (
                    /* Results UI Panel */
                    <div className="space-y-6 animate-fade-in">
                        {/* 1. Score Card */}
                        <Card className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-bold font-display ${getScoreColor(report.ats_score)}`}>
                                    <span className="text-3xl">{report.ats_score}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-dark-500">Score</span>
                                </div>
                                <div className="text-center md:text-left flex-grow">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <h2 className="text-2xl font-bold font-display text-dark-900 dark:text-white">ATS Analysis Summary</h2>
                                        <span className={`px-2.5 py-0.5 rounded-lg text-sm font-bold ${getScoreColor(report.ats_score)}`}>Grade {report.grade}</span>
                                    </div>
                                    <p className="text-dark-500 dark:text-dark-400 mt-2 leading-relaxed text-sm md:text-base">
                                        {report.summary}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Section Breakdown */}
                        <div>
                            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Section Performance</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {Object.entries(report.sections).map(([key, sec]) => (
                                    <Card key={key} className="p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-dark-900 dark:text-white capitalize">{key}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(sec.status)}`}>
                                                    {sec.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark-500 dark:text-dark-400 leading-relaxed mb-4">
                                                {sec.feedback}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-dark-400 font-semibold mb-1">
                                                <span>Section Strength</span>
                                                <span>{sec.score}%</span>
                                            </div>
                                            <div className="w-full bg-dark-100 dark:bg-dark-800 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        sec.score >= 90 ? 'bg-emerald-500' : sec.score >= 70 ? 'bg-blue-500' : sec.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${sec.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* 3. Keyword Analysis */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h4 className="font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Found Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.keywords_found.length ? report.keywords_found.map((kw, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold rounded-lg">
                                            {kw}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-dark-400">No matching keywords parsed yet.</span>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h4 className="font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.keywords_missing.length ? report.keywords_missing.map((kw, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-red-500/5 text-red-500 border border-dashed border-red-500/35 text-xs font-semibold rounded-lg">
                                            {kw}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-dark-400">All matching keywords identified!</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-dark-400 dark:text-dark-500 mt-4 italic">
                                    {jobDescription ? '* Derived from target Job Description' : '* Inferred developer framework keywords'}
                                </p>
                            </Card>
                        </div>

                        {/* 4 & 5: Quick Wins & Strengths */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Quick Wins (Fix Immediately)</h3>
                                <div className="space-y-3">
                                    {report.quick_wins.map((win, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 border-l-4 border-l-amber-500 rounded-r-xl items-start shadow-sm">
                                            <span className="text-lg font-bold text-amber-500">{idx + 1}</span>
                                            <p className="text-xs text-dark-600 dark:text-dark-300 font-semibold leading-relaxed">
                                                {win}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Strengths</h3>
                                <div className="space-y-3">
                                    {report.strengths.map((str, idx) => (
                                        <div key={idx} className="flex gap-3 p-4 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-xl items-start shadow-sm">
                                            <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <p className="text-xs text-dark-600 dark:text-dark-300 leading-relaxed font-semibold">
                                                {str}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 6. Action Buttons */}
                        <div className="pt-6 border-t border-dark-200/50 dark:border-dark-800 flex flex-wrap gap-4 justify-between items-center">
                            <button
                                onClick={() => { setReport(null); localStorage.removeItem('devlearn_ats_report'); }}
                                className="px-4 py-2 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-600 dark:text-dark-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                Re-analyze Another Resume
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={downloadReport}
                                    className="px-4 py-2 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                                >
                                    Download Report
                                </button>
                                <button
                                    onClick={() => navigate('/resume/builder')}
                                    className="btn-primary text-sm py-2 cursor-pointer"
                                >
                                    Fix in Resume Builder →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsReviewer;
