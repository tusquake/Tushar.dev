import { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import { callLlm, parseJsonResponse } from '../utils/ai';
import { useAuth } from '../context/AuthContext';

const AIInterview = () => {
  const { isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [topic, setTopic] = useState('Data Structures');
  const [duration, setDuration] = useState(5); // minutes
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [stage, setStage] = useState('idle'); // idle, asking, listening, evaluating

  // Speech synthesis helper
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  // Speech recognition helper (Web Speech API)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }
    const recognizer = new SpeechRecognition();
    recognizer.lang = 'en-US';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    recognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
      setStage('evaluating');
    };
    recognizer.onerror = (e) => {
      console.error('Speech recognition error', e);
      setStage('idle');
    };
    recognizer.start();
    setStage('listening');
  };

  const generateQuestion = async () => {
    setLoading(true);
    const prompt = `You are an AI interview coach. Generate ONE concise interview question on the topic "${topic}" suitable for a ${duration} minute interview. Respond with ONLY the question text, no extra formatting.`;
    try {
      const response = await callLlm(prompt);
      setQuestion(response.trim());
      speak(response.trim());
      setStage('asking');
    } catch (e) {
      console.error('Failed to generate question', e);
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    setLoading(true);
    const prompt = `You are an AI interviewer. The question was: "${question}". The candidate answered: "${answer}". Evaluate the answer and respond with ONLY a JSON object of shape { "correct": boolean, "feedback": string } (no markdown, no extra text).`;
    try {
      const raw = await callLlm(prompt);
      const parsed = parseJsonResponse(raw);
      setFeedback(parsed);
    } catch (e) {
      console.error('Evaluation failed', e);
      setFeedback({ correct: false, feedback: 'Could not evaluate answer.' });
    } finally {
      setLoading(false);
    }
  };

  // Trigger evaluation when answer is set
  useEffect(() => {
    if (stage === 'evaluating' && answer) {
      evaluateAnswer();
    }
  }, [stage, answer]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-dark-500 dark:text-dark-400">Please log in to access AI Interview.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-dark-50 dark:bg-dark-950/20">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">AI Interview Practice</h2>
          {/* Resume Upload / Paste */}
          <div className="mb-4">
            <label className="label">Resume Content (Paste or upload PDF)</label>
            <textarea
              className="input min-h-[150px]"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
          {/* Topic & Duration */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Topic</label>
              <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option>Data Structures</option>
                <option>Algorithms</option>
                <option>System Design</option>
                <option>JavaScript</option>
                <option>React</option>
              </select>
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                className="input"
                min={1}
                max={30}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 5)}
              />
            </div>
          </div>
          {/* Action Buttons */}
          {stage === 'idle' && (
            <button
              onClick={generateQuestion}
              disabled={loading || !resumeText.trim()}
              className="btn-primary"
            >
              {loading ? 'Generating...' : 'Start Interview'}
            </button>
          )}
          {stage === 'asking' && (
            <div className="space-y-4">
              <p className="text-lg font-medium text-dark-900 dark:text-white">Question:</p>
              <blockquote className="p-4 bg-dark-100 dark:bg-dark-800 rounded-xl italic">{question}</blockquote>
              <button onClick={startListening} className="btn-primary">
                Answer (Voice)
              </button>
            </div>
          )}
          {stage === 'listening' && (
            <p className="text-sm text-dark-500 dark:text-dark-400">Listening... Speak your answer.</p>
          )}
          {feedback && (
            <div className={`p-4 rounded-xl border ${feedback.correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
              <p className="font-bold">{feedback.correct ? 'Correct ✔' : 'Needs Improvement ✖'}</p>
              <p>{feedback.feedback}</p>
              <button onClick={() => { setStage('idle'); setQuestion(''); setAnswer(''); setFeedback(null); }} className="mt-2 btn-primary">
                Try Another Question
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AIInterview;
