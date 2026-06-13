import { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import { callLlm, parseJsonResponse } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import ReviewModal from '../components/common/ReviewModal';

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
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [history, setHistory] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [sessionLogs, setSessionLogs] = useState([]);
    const [inputMode, setInputMode] = useState('voice'); // 'voice', 'code'
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [continuousMode, setContinuousMode] = useState(true);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState('');
    const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

    useEffect(() => {
        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices().filter(v => 
                v.lang.startsWith('en')
            );
            setVoices(availableVoices);
            
            // Try to auto-select a premium natural/online or Indian English voice if none selected yet
            if (availableVoices.length > 0) {
                setSelectedVoiceName(prev => {
                    if (prev) return prev;
                    
                    // 1. Try to find a premium/natural Indian English voice
                    const indianPremium = availableVoices.find(v => 
                        v.lang.toLowerCase().includes('in') && 
                        (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Neerja') || v.name.includes('Aria'))
                    );
                    if (indianPremium) return indianPremium.name;

                    // 2. Try to find any Indian voice (en-IN or hi-IN)
                    const anyIndian = availableVoices.find(v => v.lang.toLowerCase().includes('in'));
                    if (anyIndian) return anyIndian.name;

                    // 3. Try standard premium/natural voices
                    const premium = availableVoices.find(v => 
                        v.name.includes('Natural') || 
                        v.name.includes('Online') || 
                        v.name.includes('Google') || 
                        v.name.includes('Aria') || 
                        v.name.includes('Guy') || 
                        v.name.includes('Samantha') ||
                        v.name.includes('Daniel')
                    ) || availableVoices[0];
                    return premium.name;
                });
            }
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);

    const recognitionRef = useRef(null);
    const idleTimerRef = useRef(null);
    const accumulatedTranscriptRef = useRef('');

    useEffect(() => {
        let interval = null;
        if (timerActive && !isPaused && timeRemaining > 0 && stage !== 'idle' && stage !== 'session_summary') {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setStage('session_summary');
                        setTimeout(() => setShowReviewModal(true), 1500);
                        window.speechSynthesis.cancel();
                        setIsAiSpeaking(false);
                        showToast("Time is up! Generating your session report.");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerActive, isPaused, timeRemaining, stage]);

    useEffect(() => {
        if (inputMode === 'code') {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
                recognitionRef.current = null;
            }
            if (stage === 'listening') {
                setStage('asking');
            }
        }
    }, [inputMode]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTogglePause = () => {
        const nextPaused = !isPaused;
        setIsPaused(nextPaused);
        if (nextPaused) {
            window.speechSynthesis.cancel();
            setIsAiSpeaking(false);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
            if (stage === 'listening') {
                setStage('asking');
            }
            showToast("Interview session paused");
        } else {
            showToast("Interview session resumed");
        }
    };

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
    const speak = (text, onEndCallback) => {
        setIsAiSpeaking(true);
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';

        const activeVoice = voices.find(v => v.name === selectedVoiceName) || voices.find(v => v.lang.startsWith('en-'));
        if (activeVoice) {
            utter.voice = activeVoice;
        }
        utter.pitch = 1.05;
        utter.rate = 0.95; // Slightly faster to sound more natural

        utter.onend = () => {
            setIsAiSpeaking(false);
            if (onEndCallback) onEndCallback();
        };

        utter.onerror = (e) => {
            console.error('Speech synthesis error', e);
            setIsAiSpeaking(false);
            if (onEndCallback) onEndCallback();
        };

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
        setIsAiSpeaking(false);

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
        
        // If this is the start of a session, reset session logs and initialize session timers
        if (stage === 'idle') {
            setSessionLogs([]);
            setTimeRemaining(duration * 60);
            setIsPaused(false);
            setTimerActive(true);
        }

        const previouslyAsked = sessionLogs.map(log => log.question);
        const exclusionsPrompt = previouslyAsked.length > 0
            ? `To ensure variety and progression, DO NOT ask any of the following questions that have already been asked in this session:\n${previouslyAsked.map(q => `- ${q}`).join('\n')}\nPlease choose a different sub-topic or specific question.`
            : '';

        const prompt = `You are an expert technical interviewer conducting a mock interview.
The candidate has selected the topic: "${topic}".
Generate ONE highly relevant, specific, and challenging interview question strictly about "${topic}".
Use the candidate's resume context below ONLY to calibrate the experience level (Junior, Mid, Senior) and the context of the question. 
If the topic is "Data Structures & Algorithms", ask a specific conceptual or coding/problem-solving question (e.g., about arrays, trees, dynamic programming, complexity, etc.) rather than asking about their previous projects.
${exclusionsPrompt}

Tone Instructions:
- You must adopt a tone that is extremely polite, humble, encouraging, and friendly.
- Start the response with a very brief, warm, conversational greeting or transition (e.g., "Hi! Let's take a look at a question about...", "Awesome, I'd love to discuss...", "I hope you are ready for a fun question regarding...") to make the candidate feel comfortable.
- Avoid sounding strict, robotic, or overly formal. Keep it supportive like a mentor.

Respond with ONLY the conversational spoken text itself. No meta-commentary, no markdown formatting.

Candidate Resume Context:
${resumeText}

Question:`;
        try {
            const response = await callLlm(prompt);
            const trimmedQ = response.trim();
            setQuestion(trimmedQ);
            
            // Detect if question involves coding/implementation
            const keywords = ['code', 'write a', 'implement', 'function', 'complexity', 'algorithm', 'treenode', 'class ', 'signature', 'method'];
            const isCoding = keywords.some(kw => trimmedQ.toLowerCase().includes(kw));
            setInputMode(isCoding ? 'code' : 'voice');
            
            setStage('asking');

            speak(trimmedQ, () => {
                if (continuousMode && !isCoding && !isPaused) {
                    startListening();
                }
            });
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
        const prompt = `You are an extremely polite, humble, warm, and friendly technical interviewer.
Please evaluate the candidate's response to your question.

Question: "${question}"
Candidate Answer: "${answer}"

Instructions:
1. Act like a supportive peer or a humble mentor. Speak in an encouraging, warm, and highly friendly tone.
2. If the candidate made mistakes, missed details, or skipped: gently and politely guide them. Never sound harsh, critical, or condescending. Keep them fully motivated!
3. Return ONLY a JSON object of shape:
{
  "correct": boolean,
  "feedback": "A polite, constructive, and educational text feedback.",
  "voiceResponse": "A very short, warm, and conversational feedback (1-2 sentences max) to say out loud. It MUST be humble and friendly (e.g., 'That's a really great start! I love how you thought about that.', 'Wow, spot on! You explained that beautifully. Let's try the next one.', 'No worries at all, this can be tricky! Actually, we can look at it as...')."
}
Do not include any markdown backticks, introductory text, or styling in your raw output.

JSON Evaluation:`;
        try {
            const raw = await callLlm(prompt);
            const parsed = parseJsonResponse(raw);
            setFeedback(parsed);
            setStage('feedback');

            // Record in current session log
            const sessionItem = {
                question,
                answer,
                correct: parsed.correct,
                feedback: parsed.feedback
            };
            setSessionLogs(prev => [...prev, sessionItem]);

            // Speak the voiceResponse (or fallback to feedback)
            const textToSpeak = parsed.voiceResponse || parsed.feedback;
            speak(textToSpeak, () => {
                if (continuousMode && !isPaused) {
                    // Automatically transition to next question after feedback is read!
                    setTimeout(() => {
                        generateQuestion();
                    }, 1500); // Small pause for natural breathing room
                }
            });

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
        const correctCount = sessionLogs.filter(l => l.correct).length;
        const totalCount = sessionLogs.length;
        const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        let logsHtml = '';
        sessionLogs.forEach((log, idx) => {
            logsHtml += `
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-num">Question ${idx + 1}</span>
                        <span class="status-badge ${log.correct ? 'status-correct' : 'status-needs-work'}">
                            ${log.correct ? 'Correct' : 'Needs Focus'}
                        </span>
                    </div>
                    <div class="question-body">${log.question}</div>
                    
                    <div class="response-section">
                        <div class="response-label">Your Response:</div>
                        <p class="response-text">${log.answer || '(No response provided or skipped)'}</p>
                    </div>
                    
                    <div class="feedback-section">
                        <div class="feedback-label">AI Analysis & Recommended Corrections:</div>
                        <p class="feedback-text">${log.feedback}</p>
                    </div>
                </div>
            `;
        });

        const htmlContent = `
            <html>
                <head>
                    <title>CodeForge AI Mock Interview Evaluation Report</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');
                        body {
                            font-family: 'Inter', Arial, sans-serif;
                            color: #1f2937;
                            line-height: 1.6;
                            padding: 40px;
                            max-width: 850px;
                            margin: 0 auto;
                            background-color: #ffffff;
                        }
                        .report-header {
                            border-bottom: 2px solid #e5e7eb;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .report-logo {
                            font-size: 18px;
                            font-weight: 800;
                            color: #7c3aed;
                            letter-spacing: -0.025em;
                        }
                        .report-title {
                            font-size: 22px;
                            font-weight: 800;
                            color: #111827;
                            text-transform: uppercase;
                            margin-top: 4px;
                        }
                        .meta-details {
                            font-size: 11px;
                            color: #6b7280;
                            margin-top: 4px;
                        }
                        .dashboard-grid {
                            display: flex;
                            align-items: stretch;
                            gap: 30px;
                            background-color: #f9fafb;
                            border: 1px solid #e5e7eb;
                            border-radius: 16px;
                            padding: 24px;
                            margin-bottom: 35px;
                        }
                        .score-circle-container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            border-right: 1px solid #e5e7eb;
                            padding-right: 40px;
                            min-width: 140px;
                        }
                        .score-label {
                            font-size: 10px;
                            font-weight: 700;
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 8px;
                        }
                        .score-value {
                            font-size: 40px;
                            font-weight: 800;
                            color: #7c3aed;
                        }
                        .stat-list {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            flex-grow: 1;
                            gap: 12px;
                        }
                        .stat-row {
                            display: flex;
                            justify-content: space-between;
                            font-size: 13px;
                            border-bottom: 1px dashed #e5e7eb;
                            padding-bottom: 6px;
                        }
                        .stat-label {
                            color: #4b5563;
                            font-weight: 500;
                        }
                        .stat-val {
                            color: #111827;
                            font-weight: 700;
                        }
                        .section-title {
                            font-size: 15px;
                            font-weight: 700;
                            color: #111827;
                            margin-top: 10px;
                            margin-bottom: 20px;
                            border-bottom: 2px solid #7c3aed;
                            padding-bottom: 6px;
                            display: inline-block;
                            text-transform: uppercase;
                            letter-spacing: 0.025em;
                        }
                        .question-card {
                            border: 1px solid #e5e7eb;
                            border-radius: 16px;
                            padding: 24px;
                            margin-bottom: 25px;
                            background-color: #ffffff;
                            page-break-inside: avoid;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                        }
                        .question-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                        }
                        .question-num {
                            font-size: 11px;
                            font-weight: 700;
                            color: #7c3aed;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }
                        .status-badge {
                            font-size: 10px;
                            font-weight: 700;
                            padding: 4px 10px;
                            border-radius: 9999px;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }
                        .status-correct {
                            background-color: #d1fae5;
                            color: #065f46;
                        }
                        .status-needs-work {
                            background-color: #fee2e2;
                            color: #991b1b;
                        }
                        .question-body {
                            font-size: 14px;
                            font-weight: 600;
                            color: #111827;
                            margin-bottom: 16px;
                            line-height: 1.5;
                        }
                        .response-section {
                            background-color: #f9fafb;
                            border-left: 4px solid #9ca3af;
                            padding: 12px 16px;
                            margin-bottom: 16px;
                            border-radius: 0 8px 8px 0;
                        }
                        .response-label {
                            font-size: 10px;
                            font-weight: 700;
                            color: #6b7280;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            letter-spacing: 0.025em;
                        }
                        .response-text {
                            font-family: 'Lora', Georgia, serif;
                            font-style: italic;
                            font-size: 13px;
                            color: #374151;
                            margin: 0;
                        }
                        .feedback-section {
                            background-color: #f5f3ff;
                            border-left: 4px solid #7c3aed;
                            padding: 12px 16px;
                            border-radius: 0 8px 8px 0;
                        }
                        .feedback-label {
                            font-size: 10px;
                            font-weight: 700;
                            color: #6d28d9;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            letter-spacing: 0.025em;
                        }
                        .feedback-text {
                            font-size: 13px;
                            color: #4b5563;
                            margin: 0;
                            white-space: pre-wrap;
                        }
                        @media print {
                            body {
                                padding: 0;
                                margin: 0;
                            }
                            .question-card {
                                page-break-inside: avoid;
                            }
                            @page {
                                size: A4 portrait;
                                margin: 20mm 15mm;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-header">
                        <div>
                            <span class="report-logo">CodeForge</span>
                            <div class="report-title">Mock Interview Report</div>
                            <div class="meta-details">AI Evaluation Log & Assessment Summary</div>
                        </div>
                        <div style="text-align: right; font-size: 11px; color: #6b7280;">
                            <div>Date: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div>System: Gemini evaluation coprocessor</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="score-circle-container">
                            <span class="score-label">Overall Match</span>
                            <span class="score-value">${scorePercentage}%</span>
                        </div>
                        <div class="stat-list">
                            <div class="stat-row">
                                <span class="stat-label">Focus Area Topic:</span>
                                <span class="stat-val">${topic}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Total Questions Evaluated:</span>
                                <span class="stat-val">${totalCount}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Correct Responses:</span>
                                <span class="stat-val">${correctCount}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section-title">Interview Question & Evaluation Log</div>
                    ${logsHtml}

                    <div style="text-align: center; font-size: 10px; color: #9ca3af; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; page-break-inside: avoid;">
                        Mock interview completed successfully via CodeForge. Keep learning and practicing!
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
            // Fallback hidden iframe if popup blocked
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
        <>
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
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
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

                            {/* Voice Style Selector */}
                            {voices.length > 0 && (
                                <div className="space-y-1 relative">
                                    <label className="label font-bold flex items-center justify-between text-xs text-dark-500">
                                        <span>Interviewer Voice (Human-like Edge/Chrome/Safari voices)</span>
                                        <button
                                            type="button"
                                            onClick={() => speak("Hello! I am your friendly AI technical interviewer. How does my voice sound to you?")}
                                            className="text-[10px] text-emerald-500 hover:text-emerald-600 font-extrabold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                            Listen / Test Voice
                                        </button>
                                    </label>

                                    {/* Custom Dropdown Trigger */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                            className="w-full input text-xs flex items-center justify-between gap-2 text-left cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                                <span className="truncate">
                                                    {selectedVoiceName || "Select Interviewer Voice"}
                                                </span>
                                            </span>
                                            <svg className={`w-4 h-4 text-dark-400 transition-transform ${isVoiceDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isVoiceDropdownOpen && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setIsVoiceDropdownOpen(false)}
                                                />
                                                <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 shadow-2xl z-50 py-1">
                                                    {voices.map((v, idx) => {
                                                        const name = v.name;
                                                        const lang = v.lang.toLowerCase();
                                                        let regionText = "International";
                                                        let flagIcon = (
                                                            <svg className="w-3.5 h-3.5 text-dark-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                            </svg>
                                                        );

                                                        if (lang.includes('in')) {
                                                            regionText = "India";
                                                            flagIcon = (
                                                                <span className="w-5 h-3.5 flex items-center justify-center font-bold text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20 px-1 py-0.5">
                                                                    IND
                                                                </span>
                                                            );
                                                        } else if (lang.includes('us')) {
                                                            regionText = "US";
                                                            flagIcon = (
                                                                <span className="w-5 h-3.5 flex items-center justify-center font-bold text-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-500/20 px-1 py-0.5">
                                                                    USA
                                                                </span>
                                                            );
                                                        } else if (lang.includes('gb') || lang.includes('uk')) {
                                                            regionText = "UK";
                                                            flagIcon = (
                                                                <span className="w-5 h-3.5 flex items-center justify-center font-bold text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 px-1 py-0.5">
                                                                    GBR
                                                                </span>
                                                            );
                                                        } else if (lang.includes('ca')) {
                                                            regionText = "Canada";
                                                            flagIcon = (
                                                                <span className="w-5 h-3.5 flex items-center justify-center font-bold text-[8px] bg-red-500/10 text-red-600 dark:text-red-400 rounded border border-red-500/20 px-1 py-0.5">
                                                                    CAN
                                                                </span>
                                                            );
                                                        } else if (lang.includes('au')) {
                                                            regionText = "Australia";
                                                            flagIcon = (
                                                                <span className="w-5 h-3.5 flex items-center justify-center font-bold text-[8px] bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded border border-purple-500/20 px-1 py-0.5">
                                                                    AUS
                                                                </span>
                                                            );
                                                        }

                                                        const isPremium = name.includes('Natural') || name.includes('Online') || name.includes('Google') || name.includes('Neerja') || name.includes('Prabhat') || name.includes('Aria') || name.includes('Guy');

                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedVoiceName(name);
                                                                    setIsVoiceDropdownOpen(false);
                                                                }}
                                                                className={`w-full px-3 py-2.5 flex items-center justify-between gap-3 text-xs text-left transition-colors hover:bg-dark-50 dark:hover:bg-dark-850 cursor-pointer ${
                                                                    selectedVoiceName === name 
                                                                        ? 'bg-primary-500/5 text-primary-500 font-bold' 
                                                                        : 'text-dark-700 dark:text-dark-300'
                                                                }`}
                                                            >
                                                                <span className="flex items-center gap-2 min-w-0">
                                                                    {flagIcon}
                                                                    <span className="truncate">{name}</span>
                                                                </span>
                                                                <span className="flex items-center gap-1.5 flex-shrink-0">
                                                                    <span className="text-[9px] text-dark-450 dark:text-dark-500">{regionText}</span>
                                                                    {isPremium && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                                                            <svg className="w-2.5 h-2.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                            </svg>
                                                                            Natural
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hands-Free Interactive Settings */}
                            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-dark-900 dark:text-white flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Hands-Free Continuous Mode
                                    </h4>
                                    <p className="text-[10px] text-dark-500 dark:text-dark-400 leading-relaxed">
                                        AI will automatically start listening after speaking the question, evaluate your answer, and transition to the next question without requiring clicks.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={continuousMode}
                                        onChange={(e) => setContinuousMode(e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer dark:bg-dark-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                </label>
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
                    )}                    {/* Countdown Timer and Control Header */}
                    {stage !== 'idle' && stage !== 'session_summary' && (
                        <div className="mb-6 p-4 rounded-xl bg-dark-50 dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Time Remaining</div>
                                    <div className="text-lg font-mono font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                        {formatTime(timeRemaining)}
                                        {isPaused && (
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Paused</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleTogglePause}
                                    className="px-3 py-1.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    {isPaused ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                            Resume
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Pause
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        window.speechSynthesis.cancel();
                                        setStage('session_summary');
                                        showToast("Interview finished. Generating scorecard.");
                                    }}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border-none"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Finish & Report
                                </button>
                            </div>
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

                            <div className="p-5 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
                                <style>{`
                                  @keyframes voiceWave {
                                    0%, 100% { transform: scaleY(0.3); }
                                    50% { transform: scaleY(1); }
                                  }
                                  .voice-bar {
                                    display: inline-block;
                                    width: 3px;
                                    height: 14px;
                                    background-color: #10b981; /* emerald-500 */
                                    border-radius: 2px;
                                    transform-origin: bottom;
                                    animation: voiceWave 1s ease-in-out infinite;
                                  }
                                  .voice-bar:nth-child(1) { animation-delay: 0.1s; }
                                  .voice-bar:nth-child(2) { animation-delay: 0.4s; }
                                  .voice-bar:nth-child(3) { animation-delay: 0.2s; }
                                  .voice-bar:nth-child(4) { animation-delay: 0.6s; }
                                  .voice-bar:nth-child(5) { animation-delay: 0.3s; }
                                `}</style>

                                <div className="flex items-center justify-between border-b border-dark-100 dark:border-dark-800/60 pb-2">
                                    <h3 className="text-xs font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">AI Intercom</h3>
                                    {isAiSpeaking && (
                                        <div className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-extrabold mr-1 animate-pulse">AI Speaking</span>
                                            <div className="flex items-end gap-0.5 h-3">
                                                <div className="voice-bar" />
                                                <div className="voice-bar" />
                                                <div className="voice-bar" />
                                                <div className="voice-bar" />
                                                <div className="voice-bar" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-lg font-bold text-dark-900 dark:text-white leading-relaxed">{question}</p>
                                <button
                                    onClick={() => speak(question, () => {
                                        if (continuousMode && inputMode === 'voice') {
                                            startListening();
                                        }
                                    })}
                                    className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center gap-1.5 cursor-pointer mt-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                    Repeat Question
                                </button>
                            </div>

                            {/* Input Mode Selector */}
                            <div className="flex justify-center">
                                <div className="inline-flex p-1 bg-dark-100 dark:bg-dark-850 rounded-xl border border-dark-200/50 dark:border-dark-800">
                                    <button
                                        onClick={() => setInputMode('voice')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                                            inputMode === 'voice' ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm' : 'text-dark-500 dark:text-dark-400'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                        Voice Mode
                                    </button>
                                    <button
                                        onClick={() => setInputMode('code')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                                            inputMode === 'code' ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm' : 'text-dark-500 dark:text-dark-400'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        Code Editor
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
                                            disabled={isPaused}
                                            className={`btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                            Start Speaking
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
                                    <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 text-xs text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span><strong>Code Editor Active:</strong> Write your logic or pseudo-code below. Complete syntax compiling is not required, just explain your algorithms and logic.</span>
                                    </div>
                                    <textarea
                                        className="input font-mono text-sm min-h-[220px] p-4 leading-relaxed"
                                        placeholder="// Write your code or step-by-step logic here..."
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        disabled={isPaused}
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
                                            disabled={isPaused}
                                            className={`btn-primary px-6 py-2.5 text-xs font-semibold flex-1 cursor-pointer flex items-center justify-center gap-1.5 ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                            Submit Code Response
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                    Stop & Submit
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
                                        {feedback.correct ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
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
                                        onClick={() => {
                                            window.speechSynthesis.cancel();
                                            setStage('session_summary');
                                        }}
                                        className="px-4 py-2.5 border border-emerald-500/30 dark:border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl transition-all cursor-pointer flex-1 min-w-[120px] text-center flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Finish Interview
                                    </button>
                                )}
                                <button
                                    onClick={generateQuestion}
                                    className="btn-primary text-xs py-2.5 flex-1 min-w-[120px] cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <span>Next Question</span>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
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
                                    onClick={() => { handleDownloadSessionReport(); setTimeout(() => setShowReviewModal(true), 1200); }}
                                    className="btn-primary text-xs py-2.5 flex-1 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Report PDF
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

        <ReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            defaultTriggerAction="interview"
        />
        </>
    );
};

export default AIInterview;
