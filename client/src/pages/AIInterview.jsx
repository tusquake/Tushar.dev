import { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import { callLlm, parseJsonResponse } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';

const AIInterview = () => {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('paste'); // paste, upload, built
    const [resumeText, setResumeText] = useState('');
    const [topic, setTopic] = useState('Data Structures & Algorithms');
    const [duration, setDuration] = useState(10); // minutes
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [stage, setStage] = useState('idle'); // idle, asking, listening, evaluating
    const [pdfLoading, setPdfLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [history, setHistory] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [sessionLogs, setSessionLogs] = useState([]);
    const [inputMode, setInputMode] = useState('voice'); // 'voice', 'code'

    const recognitionRef = useRef(null);
    const idleTimerRef = useRef(null);
    const accumulatedTranscriptRef = useRef('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Load initial history from database, fallback to local storage
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await interviewAPI.getAll();
                if (response.data && response.data.data) {
                    setHistory(response.data.data);
                } else {
                    const savedHistory = localStorage.getItem('codeforge_interview_history');
                    if (savedHistory) setHistory(JSON.parse(savedHistory));
                }
            } catch (e) {
                console.error('Failed to fetch interview history from DB', e);
                const savedHistory = localStorage.getItem('codeforge_interview_history');
                if (savedHistory) setHistory(JSON.parse(savedHistory));
            }
        };
        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    // Clean up speech synthesis & recognition on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, []);

    // Load pdf.js CDN
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
        const savedData = localStorage.getItem('codeforge_resume');
        if (!savedData) {
            setError('No resume found in Resume Builder. Go build one first!');
            return;
        }
        try {
            const parsed = JSON.parse(savedData);
            let plainText = '';
            if (parsed.personalInfo?.name) plainText += `${parsed.personalInfo.name.toUpperCase()}\n`;
            if (parsed.summary) plainText += `${parsed.summary}\n`;
            if (parsed.skills?.languages) plainText += `Languages: ${parsed.skills.languages}\n`;
            if (parsed.skills?.frameworks) plainText += `Frameworks: ${parsed.skills.frameworks}\n`;
            if (parsed.skills?.tools) plainText += `Tools: ${parsed.skills.tools}\n`;
            
            if (parsed.experience) {
                parsed.experience.forEach(exp => {
                    if (exp.company) plainText += `${exp.company} - ${exp.role}\n`;
                });
            }

            if (!plainText.trim()) {
                setError('Your built resume is currently empty.');
                return;
            }
            setResumeText(plainText);
            setError('');
            showToast('Built resume loaded successfully');
        } catch (e) {
            console.error(e);
            setError('Failed to load resume from Builder.');
        }
    };

    // Speech synthesis helper with a more natural interviewer-like voice configuration
    const speak = (text) => {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.lang.startsWith('en-') && 
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en-'));

        if (preferredVoice) {
            utter.voice = preferredVoice;
        }
        utter.pitch = 1.0;
        utter.rate = 0.92;
        window.speechSynthesis.speak(utter);
    };

    // Handle idle timer for auto-stopping after 5 seconds of silence
    const resetIdleTimer = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = setTimeout(() => {
            handleStopRecording();
        }, 5000);
    };

    // Speech recognition helper
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition not supported in this browser. Please use Google Chrome or Safari.');
            return;
        }
        
        window.speechSynthesis.cancel();

        accumulatedTranscriptRef.current = '';
        setAnswer('');
        setError('');

        const recognizer = new SpeechRecognition();
        recognizer.lang = 'en-US';
        recognizer.continuous = true;
        recognizer.interimResults = true;

        recognizer.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                accumulatedTranscriptRef.current += finalTranscript;
            }

            setAnswer(accumulatedTranscriptRef.current + interimTranscript);
            resetIdleTimer();
        };

        recognizer.onerror = (e) => {
            if (e.error !== 'no-speech') {
                console.error('Speech recognition error', e);
                setError('Microphone access issue or timeout. Please check microphone settings.');
                setStage('asking');
            }
        };

        recognitionRef.current = recognizer;
        recognizer.start();
        setStage('listening');
        resetIdleTimer();
    };

    const handleStopRecording = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }

        if (recognitionRef.current) {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error(e);
            }
            recognitionRef.current = null;
        }

        const finalAnswer = accumulatedTranscriptRef.current.trim();
        if (!finalAnswer) {
            setError('No answer detected. Please click start speaking and try again.');
            setStage('asking');
        } else {
            setAnswer(finalAnswer);
            setStage('evaluating');
        }
    };

    const handleExitSession = () => {
        window.speechSynthesis.cancel();
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error(e);
            }
            recognitionRef.current = null;
        }
        setStage('idle');
        setQuestion('');
        setAnswer('');
        setFeedback(null);
        setSessionLogs([]);
    };

    const generateQuestion = async () => {
        setFeedback(null);
        setAnswer('');
        setLoading(true);
        setError('');
        
        // If this is the start of a session, reset session logs
        if (stage === 'idle') {
            setSessionLogs([]);
        }

        const prompt = `You are an expert technical interviewer conducting a mock interview.
The candidate has selected the topic: "${topic}".
Generate ONE highly relevant, specific, and challenging interview question strictly about "${topic}".
Use the candidate's resume context below ONLY to calibrate the experience level (Junior, Mid, Senior) and the context of the question. 
If the topic is "Data Structures & Algorithms", ask a specific conceptual or coding/problem-solving question (e.g., about arrays, trees, dynamic programming, complexity, etc.) rather than asking about their previous projects.
Respond with ONLY the question text itself. No introductory remarks, no meta-commentary, no markdown formatting.

Candidate Resume Context:
${resumeText}

Question:`;
        try {
            const response = await callLlm(prompt);
            const trimmedQ = response.trim();
            setQuestion(trimmedQ);
            speak(trimmedQ);
            
            // Detect if question involves coding/implementation
            const keywords = ['code', 'write a', 'implement', 'function', 'complexity', 'algorithm', 'treenode', 'class ', 'signature', 'method'];
            const isCoding = keywords.some(kw => trimmedQ.toLowerCase().includes(kw));
            setInputMode(isCoding ? 'code' : 'voice');
            
            setStage('asking');
        } catch (e) {
            console.error('Failed to generate question', e);
            setError('Failed to start interview. Please check your AI api keys or internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const evaluateAnswer = async () => {
        setLoading(true);
        setError('');
        const prompt = `You are a professional, supportive, and constructive technical interviewer.
Please evaluate the candidate's response to your question.

Question: "${question}"
Candidate Answer: "${answer}"

Instructions:
1. Act like a professional interviewer: be polite, encouraging, and supportive. Do not use scary or overly critical language. Make the candidate feel motivated.
2. If the candidate missed key parts, made mistake(s), or said they don't know: politely correct them and explicitly provide the correct answer, recommended coding logic, or best-practice solution in your feedback.
3. Keep the feedback structured, clear, and educational.
4. Return ONLY a JSON object of shape:
{
  "correct": boolean,
  "feedback": "constructive feedback text containing corrections and correct answers/solutions"
}
Do not include any markdown backticks, introductory text, or styling in your raw output.

JSON Evaluation:`;
        try {
            const raw = await callLlm(prompt);
            const parsed = parseJsonResponse(raw);
            setFeedback(parsed);
            speak(parsed.feedback);
            setStage('feedback');

            // Record in current session log
            const sessionItem = {
                question,
                answer,
                correct: parsed.correct,
                feedback: parsed.feedback
            };
            setSessionLogs(prev => [...prev, sessionItem]);

            // If candidate indicated lack of knowledge, pivot topic
            const lowerAnswer = answer.toLowerCase();
            const didNotKnow = lowerAnswer.includes("don't know") || 
                               lowerAnswer.includes("no idea") || 
                               lowerAnswer.includes("don't understand") || 
                               lowerAnswer.includes("skip") || 
                               lowerAnswer.includes("unsure") || 
                               answer.trim().length < 5;

            if (didNotKnow) {
                const topicsList = [
                    'Data Structures & Algorithms',
                    'System Design',
                    'Backend Development (NodeJS/Database)',
                    'Frontend Development (React/JS/CSS)',
                    'General Technical & Behavioral'
                ];
                const otherTopics = topicsList.filter(t => t !== topic);
                const newTopic = otherTopics[Math.floor(Math.random() * otherTopics.length)];
                setTopic(newTopic);
                showToast(`Pivoting next question topic to: ${newTopic}`);
            }

            // Log this session in database history
            const payload = {
                topic,
                question,
                answer,
                correct: parsed.correct,
                feedbackText: parsed.feedback
            };

            try {
                const response = await interviewAPI.create(payload);
                if (response.data && response.data.data) {
                    setHistory(prev => [response.data.data, ...prev]);
                }
            } catch (err) {
                console.error('Failed to save interview log to DB', err);
                const newHistoryItem = {
                    _id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    ...payload
                };
                setHistory(prev => [newHistoryItem, ...prev]);
            }
        } catch (e) {
            console.error('Evaluation failed', e);
            setFeedback({ correct: false, feedback: 'Could not evaluate the answer successfully due to an API timeout. Please try again.' });
            setStage('feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSessionReport = () => {
        const printWindow = window.open('', '_blank');
        
        let logsHtml = '';
        sessionLogs.forEach((log, idx) => {
            logsHtml += `
                <div class="card">
                    <h3 class="q-title">Question ${idx + 1}</h3>
                    <p class="question-text">${log.question}</p>
                    <div class="ans-grid">
                        <div>
                            <span class="label">Your Response:</span>
                            <span class="value ${log.correct ? 'correct-text' : 'incorrect-text'}">${log.answer || '(No Answer Provided)'}</span>
                        </div>
                        <div>
                            <span class="label">AI Evaluation & Corrections:</span>
                            <p class="value-text">${log.feedback}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        const correctCount = sessionLogs.filter(l => l.correct).length;
        const totalCount = sessionLogs.length;
        const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        printWindow.document.write(`
            <html>
                <head>
                    <title>CodeForge Mock Interview Performance Report</title>
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
                        .score-container { display: flex; align-items: center; gap: 40px; margin: 25px 0; }
                        .score-badge { font-size: 48pt; font-weight: 900; color: #10B981; border: 5px solid #10B981; border-radius: 50%; width: 120px; height: 120px; display: flex; justify-content: center; align-items: center; }
                        .section-title { font-size: 14pt; font-weight: 700; color: #1F2937; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; }
                        .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 20px; background-color: #F9FAFB; }
                        .q-title { font-size: 11pt; font-weight: bold; margin: 0 0 5px 0; color: #374151; }
                        .question-text { font-size: 11pt; margin-bottom: 12px; color: #111827; font-weight: 500; }
                        .ans-grid { border-top: 1px dashed #E5E7EB; padding-top: 10px; }
                        .label { font-size: 9pt; font-weight: bold; color: #6B7280; text-transform: uppercase; display: block; margin-top: 10px; }
                        .value { font-size: 10pt; font-weight: 600; display: block; margin-top: 2px; }
                        .correct-text { color: #059669; }
                        .incorrect-text { color: #DC2626; }
                        .value-text { font-size: 10pt; color: #4B5563; margin: 4px 0 0 0; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">MOCK INTERVIEW REPORT</div>
                        <div class="meta-info">CodeForge AI Interview Simulator | Date: ${new Date().toLocaleDateString()}</div>
                    </div>
                    
                    <div class="score-container">
                        <div class="score-badge">${scorePercentage}%</div>
                        <div>
                            <h2 style="margin: 0; font-size: 16pt; color: #1F2937;">Topic Focus: ${topic}</h2>
                            <p class="meta-info" style="margin: 5px 0 0 0;">Questions Attempted: ${totalCount} | Correct: ${correctCount}</p>
                        </div>
                    </div>

                    <div class="section-title">Interview Question & Evaluation Log</div>
                    ${logsHtml}

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

    const clearHistory = async () => {
        if (window.confirm('Are you sure you want to clear your entire interview log history?')) {
            try {
                await interviewAPI.clear();
                setHistory([]);
                localStorage.removeItem('codeforge_interview_history');
                showToast('Interview log history cleared');
            } catch (err) {
                console.error('Failed to clear interview logs from DB', err);
                showToast('Failed to clear history. Try again.');
            }
        }
    };

    // Trigger evaluation when answer is set via useEffect
    useEffect(() => {
        if (stage === 'evaluating' && answer) {
            evaluateAnswer();
        }
    }, [stage, answer]);

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

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950/20">
                <p className="text-lg text-dark-500 dark:text-dark-400">Please log in to access AI Interview.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-950/20 mt-16 animate-fade-in">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="mb-4">
                    <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white">AI Interview Prep</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2">Upload your resume, select a topic, and practice with real-time AI voice feedback.</p>
                </div>

                {toast && (
                    <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-emerald-500 text-white dark:text-dark-950 font-semibold shadow-lg animate-fade-in">
                        {toast}
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-red-500 font-bold hover:opacity-80">&times;</button>
                    </div>
                )}

                <Card className="p-6 md:p-8">
                    {stage === 'idle' && (
                        <div className="space-y-6">
                            {/* Resume Source Tabs */}
                            <div className="flex border-b border-dark-200/50 dark:border-dark-800 mb-6 gap-4">
                                <button
                                    onClick={() => { setActiveTab('paste'); setError(''); }}
                                    className={`pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === 'paste' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-500'}`}
                                >
                                    Paste Resume
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

                            {/* Tab Contents */}
                            {activeTab === 'paste' && (
                                <div className="space-y-2">
                                    <label className="label">Paste your resume content</label>
                                    <textarea
                                        className="input min-h-[160px] text-sm"
                                        placeholder="Paste plain text resume content..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    />
                                </div>
                            )}

                            {activeTab === 'upload' && (
                                <div className="space-y-2">
                                    <label className="label">Upload PDF Resume</label>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[160px] text-center transition-all ${
                                            dragActive ? 'border-primary-500 bg-primary-500/5' : 'border-dark-200/60 dark:border-dark-800 bg-transparent'
                                        }`}
                                    >
                                        {pdfLoading ? (
                                            <div className="space-y-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                                                <p className="text-sm text-dark-500">Extracting resume text...</p>
                                            </div>
                                        ) : resumeText ? (
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">✓</div>
                                                <p className="text-sm font-semibold text-dark-900 dark:text-white">Resume PDF Loaded Successfully</p>
                                                <button onClick={() => setResumeText('')} className="text-xs text-red-500 hover:underline">Clear & Reupload</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 animate-fade-in">
                                                <svg className="w-10 h-10 text-dark-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-dark-600 dark:text-dark-300">Drag & drop your PDF resume here, or click to browse</p>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => handlePdfFile(e.target.files[0])}
                                                    className="hidden"
                                                    id="pdf-upload-input-interview"
                                                />
                                                <label htmlFor="pdf-upload-input-interview" className="px-4 py-2 bg-dark-100 hover:bg-dark-200 dark:bg-dark-850 dark:hover:bg-dark-800 rounded-xl text-xs font-semibold cursor-pointer border border-dark-200/40 dark:border-dark-750 inline-block">
                                                    Select PDF File
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'built' && (
                                <div className="space-y-2">
                                    <label className="label">Built Resume Context Preview</label>
                                    <div className="p-4 bg-dark-100/30 dark:bg-dark-900 border border-dark-200/50 dark:border-dark-850 rounded-xl max-h-[160px] overflow-y-auto text-xs text-dark-500 dark:text-dark-400 font-mono whitespace-pre-wrap">
                                        {resumeText || 'Your built resume is empty. Please build one in the Resume Builder first.'}
                                    </div>
                                </div>
                            )}

                            {/* Topic & Duration Selector */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="label">Topic to Prepare</label>
                                    <select
                                        className="input"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    >
                                        <option>Data Structures & Algorithms</option>
                                        <option>System Design</option>
                                        <option>Backend Development (NodeJS/Database)</option>
                                        <option>Frontend Development (React/JS/CSS)</option>
                                        <option>General Technical & Behavioral</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="label">Interview Duration (mins)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        min={3}
                                        max={30}
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value, 10) || 10)}
                                    />
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={generateQuestion}
                                disabled={loading || !resumeText.trim()}
                                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-dark-950"></div>
                                        Generating Interview Question...
                                    </>
                                ) : (
                                    'Start AI Interview'
                                )}
                            </button>
                        </div>
                    )}                    {/* Active Question & Voice Q&A Screen */}
                    {stage === 'asking' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Topic: {topic}
                                </span>
                                <span className="text-xs text-dark-500 dark:text-dark-400 font-medium">
                                    Session Duration: {duration} mins
                                </span>
                            </div>

                            <div className="p-5 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-2xl shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-dark-500 uppercase tracking-wider">AI Question</h3>
                                <p className="text-lg font-bold text-dark-900 dark:text-white leading-relaxed">{question}</p>
                                <button
                                    onClick={() => speak(question)}
                                    className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center gap-1.5 cursor-pointer mt-1"
                                >
                                    🔊 Repeat Question
                                </button>
                            </div>

                            {/* Input Mode Selector */}
                            <div className="flex justify-center">
                                <div className="inline-flex p-1 bg-dark-100 dark:bg-dark-850 rounded-xl border border-dark-200/50 dark:border-dark-800">
                                    <button
                                        onClick={() => setInputMode('voice')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                            inputMode === 'voice' ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm' : 'text-dark-500 dark:text-dark-400'
                                        }`}
                                    >
                                        🎙️ Voice Mode
                                    </button>
                                    <button
                                        onClick={() => setInputMode('code')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                            inputMode === 'code' ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm' : 'text-dark-500 dark:text-dark-400'
                                        }`}
                                    >
                                        💻 Code Editor
                                    </button>
                                </div>
                            </div>

                            {inputMode === 'voice' ? (
                                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-dark-200/50 dark:border-dark-800 rounded-2xl space-y-4 bg-dark-50/25 dark:bg-dark-950/10">
                                    <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-bold text-dark-900 dark:text-white">Record Your Answer</h4>
                                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1 max-w-sm">Click the button below and speak clearly into your microphone to record your response.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={startListening}
                                            className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                                        >
                                            🎙️ Start Speaking
                                        </button>
                                        <button
                                            onClick={handleExitSession}
                                            className="px-6 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-xl cursor-pointer"
                                        >
                                            Exit Session
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 w-full">
                                    <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 text-xs text-primary-600 dark:text-primary-400">
                                        💻 <strong>Code Editor Active:</strong> Write your logic or pseudo-code below. Complete syntax compiling is not required, just explain your algorithms and logic.
                                    </div>
                                    <textarea
                                        className="input font-mono text-sm min-h-[220px] p-4 leading-relaxed"
                                        placeholder="// Write your code or step-by-step logic here..."
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                    />
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                if (!answer.trim()) {
                                                    setError('Please enter your code response before submitting.');
                                                    return;
                                                }
                                                setStage('evaluating');
                                                evaluateAnswer();
                                            }}
                                            className="btn-primary px-6 py-2.5 text-xs font-semibold flex-1 cursor-pointer"
                                        >
                                            🚀 Submit Code Response
                                        </button>
                                        <button
                                            onClick={handleExitSession}
                                            className="px-6 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-xl cursor-pointer"
                                        >
                                            Exit Session
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Speech Recognition Active State */}
                    {stage === 'listening' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-20 h-20 bg-rose-500/25 rounded-full animate-ping"></div>
                                <div className="relative w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-dark-900 dark:text-white">Listening to your answer...</p>
                                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Speak clearly now. Evaluation begins if you are silent for 5 seconds.</p>
                            </div>

                            {answer && (
                                <div className="w-full max-w-lg p-4 bg-dark-100 dark:bg-dark-850 border border-dark-200/50 dark:border-dark-800 rounded-xl text-sm italic text-dark-750 dark:text-dark-300">
                                    <span className="font-semibold not-italic block text-[10px] text-dark-400 uppercase tracking-wider mb-1">Live Transcript:</span>
                                    "{answer}"
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleStopRecording}
                                    className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all border-none"
                                >
                                    🛑 Stop & Submit
                                </button>
                                <button
                                    onClick={handleExitSession}
                                    className="px-6 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-xl cursor-pointer"
                                >
                                    Exit Session
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Evaluating Answer Loading */}
                    {stage === 'evaluating' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                            <div className="text-center">
                                <p className="text-base font-bold text-dark-900 dark:text-white">Analyzing Your Answer...</p>
                                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Evaluating candidate correctness and preparing feedback.</p>
                            </div>
                        </div>
                    )}

                    {/* Feedback Output & Correctness Assessment */}
                    {stage === 'feedback' && feedback && (
                        <div className="space-y-6 animate-fade-in">
                            <div className={`p-6 rounded-2xl border ${
                                feedback.correct 
                                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-300' 
                                    : 'bg-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-300'
                            }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                        feedback.correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                        {feedback.correct ? '✓' : '✗'}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg">
                                            {feedback.correct ? 'Satisfactory Response' : 'Needs Improvement'}
                                        </h3>
                                        <p className="text-xs opacity-75">AI Evaluation Report</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Your Response</h4>
                                        <p className="text-sm italic mt-1 font-medium text-dark-700 dark:text-dark-300 whitespace-pre-wrap">"{answer || '(No response provided)'}"</p>
                                    </div>
                                    <div className="pt-4 border-t border-dark-200/10 dark:border-dark-800/20">
                                        <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Evaluator Feedback & Corrections</h4>
                                        <p className="text-sm mt-1 leading-relaxed text-dark-800 dark:text-dark-200 whitespace-pre-wrap">{feedback.feedback}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleExitSession}
                                    className="px-4 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 min-w-[120px] text-center"
                                >
                                    Exit Session
                                </button>
                                {sessionLogs.length > 0 && (
                                    <button
                                        onClick={() => setStage('session_summary')}
                                        className="px-4 py-2.5 border border-emerald-500/30 dark:border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 min-w-[120px] text-center"
                                    >
                                        🏁 Finish Interview
                                    </button>
                                )}
                                <button
                                    onClick={generateQuestion}
                                    className="btn-primary text-xs py-2.5 flex-1 min-w-[120px] cursor-pointer"
                                >
                                    Next Question →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Overall Session Summary Scorecard */}
                    {stage === 'session_summary' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Mock Interview Session Completed
                                </span>
                                <h2 className="text-2xl font-bold text-dark-900 dark:text-white font-display">Performance Scorecard</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 p-6 bg-dark-100/40 dark:bg-dark-900/40 border border-dark-200/50 dark:border-dark-800 rounded-2xl">
                                {/* Circular score badge */}
                                <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-emerald-500 shadow-lg shadow-emerald-500/10 flex-shrink-0">
                                    <div className="text-center">
                                        <span className="text-3xl font-extrabold text-dark-900 dark:text-white">
                                            {Math.round((sessionLogs.filter(l => l.correct).length / Math.max(1, sessionLogs.length)) * 100)}%
                                        </span>
                                        <span className="block text-[10px] text-dark-500 dark:text-dark-400 font-bold uppercase tracking-wider mt-0.5">Success</span>
                                    </div>
                                </div>
                                <div className="space-y-1 text-center sm:text-left">
                                    <h3 className="font-bold text-dark-950 dark:text-white">Focus Topic: {topic}</h3>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">Total Questions Answered: {sessionLogs.length}</p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">Correct Answers: {sessionLogs.filter(l => l.correct).length} | Needs Improvement: {sessionLogs.filter(l => !l.correct).length}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-dark-800 dark:text-dark-200 text-sm uppercase tracking-wider">Session Transcript & Corrections</h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                    {sessionLogs.map((log, idx) => (
                                        <div key={idx} className="p-4 bg-white dark:bg-dark-900/50 border border-dark-200/50 dark:border-dark-800 rounded-xl space-y-2 text-xs text-left">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-dark-900 dark:text-white">Q{idx + 1}: {log.question}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${log.correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {log.correct ? 'Satisfactory' : 'Needs Improvement'}
                                                </span>
                                            </div>
                                            <p className="text-dark-600 dark:text-dark-400 italic font-mono mt-1">"{log.answer || '(No Answer)'}"</p>
                                            <p className="text-dark-750 dark:text-dark-300 mt-2 bg-dark-100/50 dark:bg-dark-850 p-2.5 rounded-lg border border-dark-200/30 dark:border-dark-800/40 leading-relaxed whitespace-pre-wrap">{log.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleDownloadSessionReport}
                                    className="btn-primary text-xs py-2.5 flex-1 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    📥 Download Report PDF
                                </button>
                                <button
                                    onClick={handleExitSession}
                                    className="px-4 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 text-center"
                                >
                                    Start New Session
                                </button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* PAST INTERVIEW HISTORY LOGS SECTION */}
                {stage === 'idle' && history.length > 0 && (
                    <Card className="p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-dark-200/50 dark:border-dark-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Past Interview Logs
                                </h2>
                                <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Review your historical answers and evaluation logs</p>
                            </div>
                            <button
                                onClick={clearHistory}
                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-all border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/5 cursor-pointer"
                            >
                                Clear Logs
                            </button>
                        </div>

                        <div className="divide-y divide-dark-200/50 dark:divide-dark-800/60 max-h-[450px] overflow-y-auto pr-1">
                            {history.map((item) => {
                                const itemId = item._id || item.id;
                                const isExpanded = expandedItem === itemId;
                                const itemDate = item.createdAt 
                                    ? new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                    : item.date;
                                return (
                                    <div key={itemId} className="py-4 space-y-3">
                                        <div
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => setExpandedItem(isExpanded ? null : itemId)}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        item.correct 
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                             : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                    }`}>
                                                        {item.correct ? 'Correct' : 'Needs Work'}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400 dark:text-dark-500">
                                                        {item.topic}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-dark-800 dark:text-dark-200 line-clamp-1 group-hover:text-primary-500 transition-colors">
                                                    {item.question}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-dark-400 font-medium whitespace-nowrap">{itemDate}</span>
                                                <svg 
                                                    className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="pl-2 pr-2 pb-2 pt-1 border-l-2 border-dark-200 dark:border-dark-850 space-y-4 text-xs leading-relaxed animate-fade-in">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider text-[9px]">Full Question</h4>
                                                    <p className="text-dark-900 dark:text-white font-medium">{item.question}</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider text-[9px]">Your Answer</h4>
                                                    <p className="italic text-dark-700 dark:text-dark-300 font-medium">"{item.answer}"</p>
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider text-[9px]">AI Feedback</h4>
                                                    <p className="text-dark-800 dark:text-dark-200 font-medium">{item.feedbackText}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AIInterview;
