import { useState, useEffect } from 'react';
import Card from '../components/common/Card';

const Settings = () => {
    const [geminiKey, setGeminiKey] = useState('');
    const [groqKey, setGroqKey] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [customKey, setCustomKey] = useState('');
    const [customModel, setCustomModel] = useState('');
    const [saveLocal, setSaveLocal] = useState(true);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const savedGemini = localStorage.getItem('codeforge_gemini_api_key') || '';
        const savedGroq = localStorage.getItem('codeforge_groq_api_key') || '';
        const savedCustomUrl = localStorage.getItem('codeforge_custom_api_url') || '';
        const savedCustomKey = localStorage.getItem('codeforge_custom_api_key') || '';
        const savedCustomModel = localStorage.getItem('codeforge_custom_api_model') || '';
        const savedSaveLocal = localStorage.getItem('codeforge_save_local') !== 'false';
        
        setGeminiKey(savedGemini);
        setGroqKey(savedGroq);
        setCustomUrl(savedCustomUrl);
        setCustomKey(savedCustomKey);
        setCustomModel(savedCustomModel);
        setSaveLocal(savedSaveLocal);
    }, []);

    const handleSave = () => {
        localStorage.setItem('codeforge_gemini_api_key', geminiKey.trim());
        localStorage.setItem('codeforge_groq_api_key', groqKey.trim());
        localStorage.setItem('codeforge_custom_api_url', customUrl.trim());
        localStorage.setItem('codeforge_custom_api_key', customKey.trim());
        localStorage.setItem('codeforge_custom_api_model', customModel.trim());
        localStorage.setItem('codeforge_save_local', saveLocal ? 'true' : 'false');
        
        showToast('Settings saved successfully!');
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all saved resume data and analysis reports? This cannot be undone.')) {
            localStorage.removeItem('codeforge_resume');
            localStorage.removeItem('codeforge_ats_report');
            showToast('All saved resume and ATS data cleared!');
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-950/20">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white">Settings</h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-2">Manage your API keys, preferences, and data privacy options.</p>
                </div>



                <div className="space-y-6">
                    <Card className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">API Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Gemini API Key</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Enter your Gemini API key"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                />
                                <p className="text-xs text-dark-400 dark:text-dark-500 mt-2">
                                    Used for AI Resume Builder suggestions and ATS Reviews. Stored entirely locally in your browser.
                                </p>
                            </div>

                            <div>
                                <label className="label">Groq API Key (Fallback)</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Enter your Groq API key"
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                />
                                <p className="text-xs text-dark-400 dark:text-dark-500 mt-2">
                                    Used as an automatic fallback LLM service if Gemini requests experience rate limits or failures.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-dark-200 dark:border-dark-800 space-y-4">
                                <h3 className="text-sm font-bold text-dark-900 dark:text-white">Generic Custom Provider (OpenAI-Compatible)</h3>
                                <p className="text-xs text-dark-400 dark:text-dark-500">
                                    Configure any third-party model host (OpenAI, OpenRouter, Together AI, Mistral, Ollama, DeepSeek) supporting the chat completions API standard. If set, this provider takes top priority.
                                </p>

                                <div>
                                    <label className="label">API Base URL</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. https://api.openai.com/v1 or https://openrouter.ai/api/v1"
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="label">API Authorization Key</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Enter your custom API bearer token"
                                        value={customKey}
                                        onChange={(e) => setCustomKey(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="label">Model Identifier</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. gpt-4o or deepseek-chat or llama3"
                                        value={customModel}
                                        onChange={(e) => setCustomModel(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">Data & Privacy</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-dark-900 dark:text-white">Save resume data locally</h3>
                                    <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">Automatically persist your form inputs in local browser storage.</p>
                                </div>
                                <button
                                    onClick={() => setSaveLocal(!saveLocal)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                                        saveLocal ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            saveLocal ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="pt-6 border-t border-dark-200/50 dark:border-dark-800 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-dark-900 dark:text-white">Clear locally saved data</h3>
                                    <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">Erase your saved resumes and evaluation logs.</p>
                                </div>
                                <button
                                    onClick={handleClearData}
                                    className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                                >
                                    Clear Data
                                </button>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <button onClick={handleSave} className="btn-primary">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[100] max-w-sm p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 shadow-2xl text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{toast}</span>
                    <button
                        onClick={() => setToast('')}
                        className="ml-auto text-slate-400 hover:text-white transition cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Settings;
