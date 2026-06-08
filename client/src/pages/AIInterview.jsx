import { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import { callLlm, parseJsonResponse } from '../utils/ai';
import { useAuth } from '../context/AuthContext';

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

    const recognitionRef = useRef(null);
    const idleTimerRef = useRef(null);
    const accumulatedTranscriptRef = useRef('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

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
        // Look for premium, natural sounding English voices
        const preferredVoice = voices.find(v => 
            v.lang.startsWith('en-') && 
            (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en-'));

        if (preferredVoice) {
            utter.voice = preferredVoice;
        }
        utter.pitch = 1.0;
        utter.rate = 0.92; // Slightly slower, more professional, interviewer-like cadence
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
        
        window.speechSynthesis.cancel(); // Stop interviewer speech

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

            // Real-time update to state
            setAnswer(accumulatedTranscriptRef.current + interimTranscript);
            
            // User is speaking, reset the 5s idle timer
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

        // Start the initial 5 seconds idle timer
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
    };

    const generateQuestion = async () => {
        setLoading(true);
        setError('');
        const prompt = `You are an expert technical interviewer. Based on the candidate's resume summary below, generate ONE professional interview question for a ${duration}-minute session on the topic "${topic}".
Ensure the question is clear, concise, and challenging. Respond with ONLY the question text itself. No intros, no comments.

Candidate Resume Context:
${resumeText}

Question:`;
        try {
            const response = await callLlm(prompt);
            setQuestion(response.trim());
            speak(response.trim());
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
        const prompt = `You are an AI Interviewer. Please evaluate the candidate's response to your question.
Question: "${question}"
Candidate Answer: "${answer}"

Provide feedback on whether the answer is correct/satisfactory, what they got right, and how they can improve.
Return ONLY a JSON object of shape { "correct": boolean, "feedback": "string" } with no additional styling, markdown backticks, or text.

JSON Evaluation:`;
        try {
            const raw = await callLlm(prompt);
            const parsed = parseJsonResponse(raw);
            setFeedback(parsed);
            speak(parsed.feedback);
        } catch (e) {
            console.error('Evaluation failed', e);
            setFeedback({ correct: false, feedback: 'Could not evaluate the answer successfully due to an API timeout. Please try again.' });
        } finally {
            setLoading(false);
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
                    )}

                    {/* Active Question & Voice Q&A Screen */}
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
                    {feedback && (
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
                                            {feedback.correct ? 'Correct Answer!' : 'Needs Improvement'}
                                        </h3>
                                        <p className="text-xs opacity-75">AI Evaluation Report</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Your Answer</h4>
                                        <p className="text-sm italic mt-1 font-medium text-dark-700 dark:text-dark-300">"{answer}"</p>
                                    </div>
                                    <div className="pt-4 border-t border-dark-200/10 dark:border-dark-800/20">
                                        <h4 className="text-xs font-bold uppercase tracking-wider opacity-60">Evaluator Verdict</h4>
                                        <p className="text-sm mt-1 leading-relaxed text-dark-800 dark:text-dark-200">{feedback.feedback}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleExitSession}
                                    className="px-4 py-2.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 text-center"
                                >
                                    Exit Session
                                </button>
                                <button
                                    onClick={generateQuestion}
                                    className="btn-primary text-xs py-2.5 flex-1 cursor-pointer"
                                >
                                    Next Question →
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AIInterview;
