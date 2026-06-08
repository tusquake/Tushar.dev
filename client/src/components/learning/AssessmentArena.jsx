import { useState, useEffect } from 'react';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { callLlm, parseJsonResponse, getApiKeys } from '../../utils/ai';
import { resumeAPI } from '../../services/api';

const ASSESSMENT_TOPICS = [
    { id: 'resume', name: 'Resume-Based Assessment', desc: 'Questions tailored directly to your projects, tech stack, and career experience.' },
    { id: 'system_design', name: 'System Design & High-Level Architecture', desc: 'Microservices, databases, scaling, caching, APIs, and distributed design patterns.' },
    { id: 'concurrency', name: 'Java Core & Concurrency / Multithreading', desc: 'Thread synchronization, locks, JVM internals, memory management, and Collection frameworks.' },
    { id: 'frontend', name: 'Frontend Engineering & Web Performance', desc: 'React.js, rendering strategies, bundling, optimization, layout structures, and security.' },
    { id: 'backend', name: 'Backend Engineering & APIs', desc: 'Rest APIs, databases design (SQL/NoSQL), messaging queues, and authentication schemes.' },
    { id: 'dsa', name: 'Data Structures & Algorithms', desc: 'Arrays, Trees, Graphs, Sorting, HashMaps, Dynamic Programming, and complexity analysis.' }
];

const AssessmentArena = () => {
    // Stage: 'setup', 'testing', 'evaluating', 'completed'
    const [stage, setStage] = useState('setup');
    const [selectedTopic, setSelectedTopic] = useState('resume');
    const [customTopic, setCustomTopic] = useState('');
    const [questionTypeFilter, setQuestionTypeFilter] = useState('mixed'); // 'mcq', 'short_answer', 'mixed'
    
    // Resume States
    const [resumeSource, setResumeSource] = useState('profile'); // 'profile', 'paste'
    const [pastedResumeText, setPastedResumeText] = useState('');
    const [profileResumeData, setProfileResumeData] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(false);
    
    // Testing States
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // { questionId: answerText }
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiKeyWarning, setApiKeyWarning] = useState(false);

    // Results States
    const [results, setResults] = useState(null); // { score, feedback, lackingAreas, breakdown: [...] }

    // Check API Keys & Fetch Profile Resume
    useEffect(() => {
        const keys = getApiKeys();
        if (!keys.geminiKey && !keys.groqKey) {
            setApiKeyWarning(true);
        }

        const fetchProfileResume = async () => {
            setResumeLoading(true);
            try {
                const res = await resumeAPI.get();
                if (res.data && res.data.data) {
                    setProfileResumeData(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load profile resume', err);
            } finally {
                setResumeLoading(false);
            }
        };

        fetchProfileResume();
    }, []);

    const formatResumeText = () => {
        if (resumeSource === 'paste') {
            return pastedResumeText.trim();
        }
        if (!profileResumeData) return '';
        
        let text = '';
        const info = profileResumeData.personalInfo || {};
        if (info.name) text += `Name: ${info.name}\n`;
        
        const summary = profileResumeData.summary || '';
        if (summary) text += `Summary: ${summary}\n`;
        
        const skills = profileResumeData.skills || {};
        if (skills.languages || skills.frameworks || skills.tools || skills.concepts) {
            text += `Technical Skills:\n`;
            if (skills.languages) text += `- Languages: ${skills.languages}\n`;
            if (skills.frameworks) text += `- Frameworks/Libraries: ${skills.frameworks}\n`;
            if (skills.tools) text += `- Tools/Databases: ${skills.tools}\n`;
            if (skills.concepts) text += `- Core Concepts: ${skills.concepts}\n`;
        }

        const experience = profileResumeData.experience || [];
        if (experience.length > 0) {
            text += `Work Experience:\n`;
            experience.forEach(exp => {
                if (exp.company) {
                    text += `- Role: ${exp.role || ''} at ${exp.company} (${exp.period || ''})\n`;
                    if (exp.highlights) {
                        exp.highlights.forEach(bullet => {
                            if (bullet) text += `  * ${bullet}\n`;
                        });
                    }
                }
            });
        }

        const projects = profileResumeData.projects || [];
        if (projects.length > 0) {
            text += `Projects:\n`;
            projects.forEach(p => {
                if (p.title) {
                    text += `- Title: ${p.title} [Stack: ${p.techStack || ''}]: ${p.description || ''}\n`;
                }
            });
        }

        return text;
    };

    const handleStartAssessment = async () => {
        setLoading(true);
        setError('');
        setLoadingMessage('Curating 10 custom assessment questions...');

        const resumeContext = formatResumeText();
        const activeTopicObj = ASSESSMENT_TOPICS.find(t => t.id === selectedTopic);
        const activeTopicName = selectedTopic === 'custom' ? customTopic : activeTopicObj?.name;

        if (selectedTopic === 'resume' && !resumeContext) {
            setError('Please write or sync your resume first to use Resume-Based Assessment.');
            setLoading(false);
            return;
        }

        if (selectedTopic === 'custom' && !customTopic.trim()) {
            setError('Please enter a custom topic focus.');
            setLoading(false);
            return;
        }

        // System prompt instructing layout
        const prompt = `You are an expert technical interviewer and systems evaluator.
You need to generate exactly 10 technical assessment questions on the topic: "${activeTopicName}".
The questions must be highly professional and tailored. If a resume is provided, customize the difficulty, project references, and depth to match their resume experience.

Instructions:
- Generate a mix of: Multiple Choice Questions (MCQ), Short Answer/Conceptual Questions, and Short Coding/Problem Solving questions.
- If MCQ: must have 4 options and 1 correctAnswer.
- If Short Answer: no options needed.
- If Coding: request a quick code snippet or solution logic.
- Return ONLY a valid JSON array of objects of the shape:
[
  {
    "id": 1,
    "type": "mcq", // "mcq" or "short_answer" or "coding"
    "question": "Detailed question text here...",
    "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY for type: "mcq"
    "correctAnswer": "Option A", // ONLY for type: "mcq" (Must match one of the options exactly)
    "explanation": "Detailed explanation of the correct answer or concept..."
  }
]

Do not include any introductory remarks, markdown formatting backticks, or text before/after the JSON. Just return the raw JSON array.

Candidate Resume Context:
${resumeContext || 'Not provided'}`;

        try {
            const response = await callLlm(prompt);
            const parsedQuestions = parseJsonResponse(response);

            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                setQuestions(parsedQuestions);
                setUserAnswers({});
                setCurrentQuestionIdx(0);
                setStage('testing');
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate questions. Please verify your Generative AI Keys and connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (questionId, option) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const handleTextAnswerChange = (questionId, val) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: val
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx(prev => prev - 1);
        }
    };

    const handleGradeAssessment = async () => {
        setLoading(true);
        setError('');
        setLoadingMessage('AI is grading your short answers, code submissions, and calculating breakdown report...');

        const activeTopicObj = ASSESSMENT_TOPICS.find(t => t.id === selectedTopic);
        const activeTopicName = selectedTopic === 'custom' ? customTopic : activeTopicObj?.name;

        // Build prompt with questions and user answers
        const gradingData = questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            correctAnswer: q.correctAnswer || null,
            userAnswer: userAnswers[q.id] || '(No Answer Provided)'
        }));

        const prompt = `You are an expert technical evaluator. Evaluate the candidate's answers to the technical questions on "${activeTopicName}".
For MCQs, compare the userAnswer to correctAnswer exactly.
For short_answer and coding questions, evaluate the userAnswer for conceptual accuracy, soundness, and correct implementation logic. Provide constructive evaluation.

Calculate an overall score between 0 and 100 based on their performance.
Identify 2-3 specific topics/areas where the candidate is lacking or needs to study further.
Return ONLY a valid JSON object of this shape:
{
  "score": 85,
  "feedback": "Overall summary of the candidate's performance...",
  "lackingAreas": ["Topic A", "Topic B"],
  "breakdown": [
    {
      "id": 1,
      "correct": true,
      "feedback": "Why the answer is correct or what was missing in their response...",
      "suggestedAnswer": "Suggested best practice answer or correct option"
    }
  ]
}

Input Questions and Answers to evaluate:
${JSON.stringify(gradingData, null, 2)}`;

        try {
            const rawGrading = await callLlm(prompt);
            const parsedGrading = parseJsonResponse(rawGrading);
            setResults(parsedGrading);
            setStage('completed');
        } catch (err) {
            console.error('Failed to grade assessment', err);
            setError('Evaluation failed due to an API timeout. Please click submit again to retry.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        const printWindow = window.open('', '_blank');
        const activeTopicObj = ASSESSMENT_TOPICS.find(t => t.id === selectedTopic);
        const activeTopicName = selectedTopic === 'custom' ? customTopic : activeTopicObj?.name;
        
        let breakdownHtml = '';
        questions.forEach((q, idx) => {
            const grade = results.breakdown.find(b => b.id === q.id) || {};
            const uAns = userAnswers[q.id] || '(No Answer Provided)';
            
            breakdownHtml += `
                <div class="card">
                    <h3 class="q-title">Question ${idx + 1} (${q.type.toUpperCase()})</h3>
                    <p class="question-text">${q.question}</p>
                    <div class="ans-grid">
                        <div>
                            <span class="label">Your Answer:</span>
                            <span class="value ${grade.correct ? 'correct-text' : 'incorrect-text'}">${uAns}</span>
                        </div>
                        <div>
                            <span class="label">Correct / Suggested Answer:</span>
                            <span class="value correct-text">${q.correctAnswer || grade.suggestedAnswer || ''}</span>
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <span class="label">AI Grading Explanation:</span>
                        <p class="value-text">${grade.feedback || ''}</p>
                    </div>
                </div>
            `;
        });

        let lackingHtml = '';
        results.lackingAreas.forEach(area => {
            lackingHtml += `<li>${area}</li>`;
        });

        printWindow.document.write(`
            <html>
                <head>
                    <title>CodeForge - Assessment Report</title>
                    <style>
                        body {
                            font-family: 'Inter', Arial, sans-serif;
                            color: #111827;
                            line-height: 1.5;
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .header { text-align: center; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { font-size: 24pt; font-weight: 800; margin-bottom: 5px; color: #10B981; }
                        .meta-info { font-size: 10pt; color: #6B7280; }
                        .score-container { display: flex; justify-content: center; align-items: center; margin: 25px 0; }
                        .score-badge { font-size: 48pt; font-weight: 900; color: #10B981; border: 5px solid #10B981; border-radius: 50%; width: 120px; height: 120px; display: flex; justify-content: center; align-items: center; }
                        .section-title { font-size: 14pt; font-weight: 700; color: #1F2937; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; }
                        .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 20px; background-color: #F9FAFB; }
                        .q-title { font-size: 11pt; font-weight: bold; margin: 0 0 5px 0; color: #374151; }
                        .question-text { font-size: 11pt; margin-bottom: 12px; color: #111827; font-weight: 500; }
                        .ans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; border-bottom: 1px dashed #E5E7EB; padding-bottom: 10px; }
                        .label { font-size: 9pt; font-weight: bold; color: #6B7280; text-transform: uppercase; display: block; }
                        .value { font-size: 10pt; font-weight: 600; display: block; margin-top: 2px; }
                        .correct-text { color: #059669; }
                        .incorrect-text { color: #DC2626; }
                        .value-text { font-size: 10pt; color: #4B5563; margin: 4px 0 0 0; }
                        .feedback-summary { font-size: 11pt; color: #374151; text-align: justify; margin-bottom: 20px; }
                        ul { padding-left: 20px; margin: 5px 0; }
                        li { margin-bottom: 5px; font-weight: 500; color: #374151; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">ASSESSMENT REPORT</div>
                        <div class="meta-info">CodeForge AI Engineering Arena | Date: ${new Date().toLocaleDateString()}</div>
                    </div>
                    
                    <div style="display: flex; gap: 40px; align-items: center; margin-bottom: 20px;">
                        <div class="score-badge">${results.score}%</div>
                        <div style="flex-grow: 1;">
                            <h2 style="margin: 0; font-size: 16pt; color: #1F2937;">Topic: ${activeTopicName}</h2>
                            <p class="meta-info" style="margin: 5px 0 0 0;">Total Questions Evaluated: 10</p>
                        </div>
                    </div>

                    <div class="section-title">Performance Summary</div>
                    <p class="feedback-summary">${results.feedback}</p>

                    <div class="section-title">Key Areas for Improvement</div>
                    <ul>
                        ${lackingHtml}
                    </ul>

                    <div class="section-title">Question-by-Question Breakdown</div>
                    ${breakdownHtml}

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

    const handleRestart = () => {
        setQuestions([]);
        setUserAnswers({});
        setResults(null);
        setStage('setup');
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col justify-center items-center py-24 space-y-4">
                <Loading />
                <div className="text-center">
                    <p className="text-base font-bold text-dark-900 dark:text-white">{loadingMessage}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">AI modeling takes up to 15 seconds to draft and parse.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col animate-tab-switch pb-4">
            
            {/* API Warning */}
            {apiKeyWarning && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex items-center justify-between">
                    <span>Gemini API keys are unconfigured. Go to Settings page to activate LLM Assessment.</span>
                    <a href="/settings" className="underline font-semibold hover:opacity-80">Settings →</a>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                    {error}
                </div>
            )}

            {/* --- STAGE 1: SETUP --- */}
            {stage === 'setup' && (
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Left: Topic Selector */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Choose Your Assessment Focus</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {ASSESSMENT_TOPICS.map(topic => (
                                    <button
                                        key={topic.id}
                                        onClick={() => setSelectedTopic(topic.id)}
                                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                            selectedTopic === topic.id
                                                ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/5'
                                                : 'border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:border-dark-300 dark:hover:border-dark-700'
                                        }`}
                                    >
                                        <div className="font-bold text-sm text-dark-900 dark:text-white flex justify-between items-center">
                                            <span>{topic.name}</span>
                                            {selectedTopic === topic.id && <span className="text-primary-500 text-xs">●</span>}
                                        </div>
                                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-2 leading-relaxed">{topic.desc}</p>
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => setSelectedTopic('custom')}
                                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                        selectedTopic === 'custom'
                                            ? 'border-primary-500 bg-primary-500/5 shadow-md'
                                            : 'border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:border-dark-300 dark:hover:border-dark-700'
                                    }`}
                                >
                                    <div className="font-bold text-sm text-dark-900 dark:text-white flex justify-between items-center">
                                        <span>Custom Learning Focus</span>
                                        {selectedTopic === 'custom' && <span className="text-primary-500 text-xs">●</span>}
                                    </div>
                                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-2">Enter any engineering topic, library, or architectural system to evaluate.</p>
                                </button>
                            </div>

                            {selectedTopic === 'custom' && (
                                <div className="mt-5 space-y-2">
                                    <label className="label">Custom Topic Description</label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder="e.g. Redis Caching strategies, Web Sockets, Docker configurations..."
                                        value={customTopic}
                                        onChange={(e) => setCustomTopic(e.target.value)}
                                    />
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right: Resume Integration / Start Button */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <h3 className="text-sm font-bold text-dark-900 dark:text-white uppercase tracking-wider">Configure Resume Context</h3>
                            <p className="text-xs text-dark-500 dark:text-dark-400 leading-relaxed">
                                We utilize your resume context to customize the difficulty, scenarios, and code snippets generated by the evaluator.
                            </p>
                            
                            <div className="flex gap-2 p-1 bg-dark-100 dark:bg-dark-850 rounded-xl border border-dark-200/50 dark:border-dark-800">
                                <button
                                    onClick={() => setResumeSource('profile')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                        resumeSource === 'profile' ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm' : 'text-dark-500'
                                    }`}
                                >
                                    Use Profile
                                </button>
                                <button
                                    onClick={() => setResumeSource('paste')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                        resumeSource === 'paste' ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm' : 'text-dark-500'
                                    }`}
                                >
                                    Paste Copy
                                </button>
                            </div>

                            {resumeSource === 'profile' ? (
                                <div className="p-3.5 rounded-xl bg-dark-50 dark:bg-dark-950/20 border border-dark-200/50 dark:border-dark-800/80 text-xs flex items-center justify-between">
                                    {resumeLoading ? (
                                        <span className="text-dark-400">Verifying resume connection...</span>
                                    ) : profileResumeData ? (
                                        <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                                            <span>✓</span> Profile Resume Synced
                                        </span>
                                    ) : (
                                        <span className="text-rose-500 font-medium">
                                            No profile resume found. Please paste one.
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    className="input text-xs min-h-[120px]"
                                    placeholder="Paste your developer text resume context here..."
                                    value={pastedResumeText}
                                    onChange={(e) => setPastedResumeText(e.target.value)}
                                />
                            )}

                            <button
                                onClick={handleStartAssessment}
                                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer mt-4"
                            >
                                🎯 Generate Custom Arena
                            </button>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- STAGE 2: TESTING --- */}
            {stage === 'testing' && questions.length > 0 && (
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Stepper Header */}
                    <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400">
                        <span className="font-semibold uppercase tracking-wider text-primary-500">Question {currentQuestionIdx + 1} of {questions.length}</span>
                        <span className="font-mono">
                            {Math.round(((currentQuestionIdx) / questions.length) * 100)}% Complete
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-dark-200 dark:bg-dark-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary-500 transition-all duration-350"
                            style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    <Card className="p-6 md:p-8 space-y-6">
                        {/* Question Box */}
                        <div className="space-y-2">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-dark-100 dark:bg-dark-800 text-[10px] font-bold uppercase tracking-wider text-dark-500">
                                {questions[currentQuestionIdx].type === 'mcq' ? 'Multiple Choice' : questions[currentQuestionIdx].type === 'coding' ? 'Coding Challenge' : 'Short Answer'}
                            </span>
                            <h2 className="text-lg md:text-xl font-bold text-dark-900 dark:text-white leading-relaxed">
                                {questions[currentQuestionIdx].question}
                            </h2>
                        </div>

                        {/* Answer Input Area */}
                        {questions[currentQuestionIdx].type === 'mcq' ? (
                            <div className="grid gap-3">
                                {questions[currentQuestionIdx].options?.map((option, idx) => {
                                    const isSelected = userAnswers[questions[currentQuestionIdx].id] === option;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(questions[currentQuestionIdx].id, option)}
                                            className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                    ? 'border-primary-500 bg-primary-500/5 text-primary-500 shadow-sm'
                                                    : 'border-dark-200 dark:border-dark-800 hover:bg-dark-100/30 dark:hover:bg-dark-850/50 text-dark-800 dark:text-dark-200'
                                            }`}
                                        >
                                            <span>{option}</span>
                                            {isSelected && (
                                                <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="label">Your Answer / Code Solution</label>
                                <textarea
                                    className="input font-mono text-sm min-h-[180px] leading-relaxed p-4"
                                    placeholder={questions[currentQuestionIdx].type === 'coding' ? '// Write your code solution or logic here...' : 'Explain the concept or mechanism here...'}
                                    value={userAnswers[questions[currentQuestionIdx].id] || ''}
                                    onChange={(e) => handleTextAnswerChange(questions[currentQuestionIdx].id, e.target.value)}
                                />
                            </div>
                        )}

                        {/* Stepper actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-dark-200/50 dark:border-dark-800/60">
                            <button
                                onClick={handlePrevQuestion}
                                disabled={currentQuestionIdx === 0}
                                className="px-4 py-2 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 disabled:opacity-50 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                                ← Previous
                            </button>

                            {currentQuestionIdx < questions.length - 1 ? (
                                <button
                                    onClick={handleNextQuestion}
                                    className="btn-primary px-5 py-2 text-xs font-semibold cursor-pointer"
                                >
                                    Next Question →
                                </button>
                            ) : (
                                <button
                                    onClick={handleGradeAssessment}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white dark:text-dark-950 font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer border-none"
                                >
                                    Submit & Grade
                                </button>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- STAGE 3: RESULTS / COMPLETED --- */}
            {stage === 'completed' && results && (
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Score Card Header */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <h3 className="text-xs font-bold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Assessment Score</h3>
                            <div className="relative flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="currentColor" className="text-dark-200 dark:text-dark-800" fill="transparent" />
                                    <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="currentColor" 
                                        className="text-emerald-500 transition-all duration-1000" 
                                        fill="transparent" 
                                        strokeDasharray={2 * Math.PI * 54}
                                        strokeDashoffset={2 * Math.PI * 54 * (1 - results.score / 100)}
                                    />
                                </svg>
                                <span className="absolute text-3xl font-extrabold text-dark-900 dark:text-white">{results.score}%</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                                {results.score >= 80 ? 'Mastery Level' : results.score >= 50 ? 'Intermediate Competence' : 'Foundation Study Required'}
                            </span>
                        </Card>

                        <Card className="md:col-span-2 p-6 md:p-8 space-y-4">
                            <h3 className="text-xs font-bold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Diagnostic Feedback Summary</h3>
                            <p className="text-sm text-dark-750 dark:text-dark-300 leading-relaxed font-medium">
                                {results.feedback}
                            </p>

                            <div className="space-y-2.5 pt-2">
                                <h4 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-wider">Lacking Subdomains & Focus Areas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.lackingAreas?.map((area, i) => (
                                        <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold rounded-lg">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Report Download and Restart buttons */}
                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={handleDownloadReport}
                            className="px-5 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-xs font-semibold rounded-xl cursor-pointer text-dark-750 dark:text-dark-300 flex items-center gap-1.5"
                        >
                            📥 Download Report PDF
                        </button>
                        <button
                            onClick={handleRestart}
                            className="btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
                        >
                            🔄 Try Another Topic
                        </button>
                    </div>

                    {/* Breakdown Drawer List */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-dark-900 dark:text-white">Question Review & Analysis</h2>
                        <div className="space-y-4">
                            {questions.map((q, idx) => {
                                const evalItem = results.breakdown?.find(b => b.id === q.id) || {};
                                const isCorrect = evalItem.correct;
                                const userAns = userAnswers[q.id] || '(No Answer Provided)';
                                return (
                                    <Card key={q.id} className="p-6 space-y-4 border-l-4 border-l-dark-300 dark:border-l-dark-800">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">Question {idx + 1}</span>
                                                <h3 className="text-sm font-bold text-dark-900 dark:text-white leading-relaxed">{q.question}</h3>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                isCorrect 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-dark-200/50 dark:border-dark-800/50 text-xs">
                                            <div className="space-y-1">
                                                <span className="font-bold text-dark-400 uppercase tracking-wider text-[9px]">Your Response:</span>
                                                <p className={`font-medium ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>{userAns}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="font-bold text-dark-400 uppercase tracking-wider text-[9px]">Suggested Answer / Option:</span>
                                                <p className="text-emerald-500 font-medium">{q.correctAnswer || evalItem.suggestedAnswer || ''}</p>
                                            </div>
                                        </div>

                                        <div className="pt-2 text-xs leading-relaxed">
                                            <span className="font-bold text-dark-400 uppercase tracking-wider text-[9px] block mb-1">AI Critique:</span>
                                            <p className="text-dark-700 dark:text-dark-300 font-medium">{evalItem.feedback || q.explanation}</p>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentArena;
