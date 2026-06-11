import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { callLlm, parseJsonResponse } from '../utils/ai';

const BOILERPLATES = {
    javascript: `// CodeForge Javascript Playground
// Write your code and click 'Run Code' to execute.

function main() {
    console.log("Starting Javascript Execution...");
    
    const numbers = [5, 2, 9, 1, 5, 6];
    console.log("Original Array: " + JSON.stringify(numbers));
    
    // Sort array
    numbers.sort((a, b) => a - b);
    console.log("Sorted Array:   " + JSON.stringify(numbers));
    
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    console.log("Sum of elements: " + sum);
    
    console.log("Execution completed successfully!");
}

main();`,
    python: `# CodeForge Python Playground
# Write your code and click 'Run Code' to compile/execute.

def main():
    print("Initializing Python Sandbox...")
    
    # Generate a fibonacci sequence
    n = 10
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
        
    print(f"First {n} Fibonacci numbers: {fib}")
    print("Execution completed successfully!")

if __name__ == "__main__":
    main()`,
    cpp: `// CodeForge C++ Playground
// Write your code and click 'Run Code' to compile/execute.

#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int main() {
    cout << "Running C++ Binary..." << endl;
    
    vector<int> data = {10, 20, 30, 45, 50};
    int sum = accumulate(data.begin(), data.end(), 0);
    
    cout << "Dataset sum: " << sum << endl;
    cout << "Execution completed successfully!" << endl;
    
    return 0;
}`,
    java: `// CodeForge Java Playground
// Write your code and click 'Run Code' to compile/execute.

import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("Running JVM instance...");
        
        Map<String, String> config = new HashMap<>();
        config.put("environment", "Production");
        config.put("compiler", "GraalVM");
        config.put("optimization", "Level 3");
        
        System.out.println("System Config: " + config);
        System.out.println("Execution completed successfully!");
    }
}`
};

export default function CodeEditor() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(BOILERPLATES.javascript);
    const [theme, setTheme] = useState('neon-horizon'); // neon-horizon, cyberpunk, obsidian, aurora
    const [aiIntellisense, setAiIntellisense] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState([
        { type: 'system', text: 'Welcome to CodeForge IDE v1.0.0 Terminal' },
        { type: 'system', text: 'Select a programming language and click [Run Code] to compile.' }
    ]);
    const [performanceMetrics, setPerformanceMetrics] = useState({ time: 0, memory: 0 });
    
    // AI Panel State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const terminalEndRef = useRef(null);

    // Sync scroll of line numbers and textarea
    const handleScroll = () => {
        if (textareaRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Auto scroll terminal to bottom on new output
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalOutput]);

    // Handle boilerplate change on language change
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(BOILERPLATES[lang]);
    };

    // Intercept Tab key for insertion of 4 spaces
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const val = textareaRef.current.value;
            const newVal = val.substring(0, start) + '    ' + val.substring(end);
            setCode(newVal);
            
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                }
            }, 0);
        }
    };

    // Number of lines calculator
    const lineCount = code.split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

    // Local JS execution & Simulated Compilers
    const handleRunCode = async () => {
        setIsRunning(true);
        setTerminalOutput(prev => [
            ...prev,
            { type: 'info', text: `\n$ compile --lang=${language} source.code` }
        ]);

        if (language === 'javascript') {
            // Native client-side sandbox execution for JavaScript!
            setTimeout(() => {
                const logs = [];
                const originalLog = console.log;
                
                // Override console.log
                console.log = (...args) => {
                    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                };

                const startTime = performance.now();
                let success = true;
                let errorMsg = '';

                try {
                    // Execute local JS using Function constructor to avoid eval warning
                    new Function(code)();
                } catch (err) {
                    success = false;
                    errorMsg = err.message;
                }

                // Restore console.log
                console.log = originalLog;
                const endTime = performance.now();
                const diffTime = (endTime - startTime).toFixed(2);

                const newOutputs = logs.map(line => ({ type: 'stdout', text: line }));
                if (!success) {
                    newOutputs.push({ type: 'stderr', text: `Runtime Error: ${errorMsg}` });
                }

                setTerminalOutput(prev => [
                    ...prev,
                    ...newOutputs,
                    { type: 'system', text: `Process finished with exit code ${success ? 0 : 1}` }
                ]);
                setPerformanceMetrics({
                    time: parseFloat(diffTime),
                    memory: Math.floor(Math.random() * 800) + 120 // mock JS engine heap
                });
                setIsRunning(false);
            }, 600);
        } else {
            // Simulated virtual sandbox compilers using Gemini AI for Python, C++, Java!
            try {
                const prompt = `You are a strict code interpreter, sandbox execution environment, and compiler for the "${language}" language.
Your job is to read the provided source code, simulate its compilation, and execute it.

Code to execute:
\`\`\`${language}
${code}
\`\`\`

You must respond with ONLY a valid JSON object matching the schema below. Do not include markdown backticks or any conversational introduction.
JSON Schema:
{
  "success": boolean,
  "stdout": "string containing console stdout outputs separated by \\n",
  "stderr": "string containing compiler warnings, compile errors, or stack traces if success is false",
  "executionTimeMs": number,
  "memoryKb": number
}

JSON Response:`;

                const rawResponse = await callLlm(prompt);
                const parsed = parseJsonResponse(rawResponse);

                const stdoutLines = parsed.stdout ? parsed.stdout.split('\n') : [];
                const stderrLines = parsed.stderr ? parsed.stderr.split('\n') : [];

                const formatOutputs = [];
                stdoutLines.forEach(l => {
                    if (l.trim()) formatOutputs.push({ type: 'stdout', text: l });
                });
                stderrLines.forEach(l => {
                    if (l.trim()) formatOutputs.push({ type: 'stderr', text: l });
                });

                setTerminalOutput(prev => [
                    ...prev,
                    ...formatOutputs,
                    { type: 'system', text: `Process finished with exit code ${parsed.success ? 0 : 1}` }
                ]);
                setPerformanceMetrics({
                    time: parsed.executionTimeMs || 10,
                    memory: parsed.memoryKb || 512
                });
            } catch (err) {
                console.error(err);
                setTerminalOutput(prev => [
                    ...prev,
                    { type: 'stderr', text: 'Simulation Error: Failed to compile code in the virtual sandbox.' }
                ]);
            } finally {
                setIsRunning(false);
            }
        }
    };

    // AI Copilot Actions
    const handleCopilotAction = async (actionType) => {
        setAiLoading(true);
        setAiResponse('');
        let prompt = '';

        if (actionType === 'explain') {
            prompt = `You are a senior compiler engineer. Explain this ${language} code clearly and step-by-step:
\`\`\`${language}
${code}
\`\`\``;
        } else if (actionType === 'optimize') {
            prompt = `You are a performance optimization expert. Review this ${language} code, optimize it for time and space complexity, and provide the fully updated code. Keep details brief, and return the optimized code in a markdown block:
\`\`\`${language}
${code}
\`\`\``;
        } else if (actionType === 'fix_bugs') {
            prompt = `You are a static analysis bug-hunting tool. Look for edge cases, memory leaks, compilation issues, or logic errors in this ${language} code. Suggest fixes and outline the code corrections:
\`\`\`${language}
${code}
\`\`\``;
        } else if (actionType === 'custom') {
            if (!aiQuery.trim()) {
                setAiLoading(false);
                return;
            }
            prompt = `You are an AI programming copilot. The user has the following ${language} code in their editor:
\`\`\`${language}
${code}
\`\`\`

User Request: "${aiQuery}"
Provide instructions and modified code structure to achieve this request.`;
        }

        try {
            const res = await callLlm(prompt);
            setAiResponse(res);
        } catch (e) {
            setAiResponse('AI Intellisense failed to connect. Check your internet connection.');
        } finally {
            setAiLoading(false);
        }
    };

    // Apply Suggestion from AI Panel to Editor
    const applyAiSuggestion = () => {
        // Extract code block from AI Response
        const match = aiResponse.match(/```[a-z]*\n([\s\S]*?)```/);
        if (match && match[1]) {
            setCode(match[1].trim());
            setTerminalOutput(prev => [
                ...prev,
                { type: 'system', text: 'System: Applied AI Intellisense suggestion to active document.' }
            ]);
        } else {
            alert("No clear code block found in the AI response to automatically apply.");
        }
    };

    // Clear Terminal Output
    const handleClearTerminal = () => {
        setTerminalOutput([
            { type: 'system', text: 'Terminal output cleared.' }
        ]);
    };

    // Reset code to boilerplate
    const handleResetCode = () => {
        if (window.confirm("Are you sure you want to reset the editor? All your changes will be lost.")) {
            setCode(BOILERPLATES[language]);
        }
    };

    // Dynamic classes based on active theme
    const getThemeStyles = () => {
        switch (theme) {
            case 'cyberpunk':
                return {
                    container: 'bg-[#fcf8e3] dark:bg-[#000511] text-[#91003c] dark:text-[#00ff66] border-[#ff0055]/20 dark:border-[#ff0055]/30',
                    editorBg: 'bg-[#fffdf5] dark:bg-[#050b1a] text-black dark:text-[#00ffaa]',
                    textarea: 'text-black dark:text-[#00ffaa] caret-[#ff0055]',
                    lineNo: 'text-[#ff0055]/40 dark:text-[#ff0055]/50 border-[#ff0055]/10 dark:border-[#ff0055]/20',
                    glow: 'shadow-[0_0_20px_rgba(255,0,85,0.05)] dark:shadow-[0_0_20px_rgba(255,0,85,0.15)]',
                    accent: '#ff0055',
                    button: 'bg-[#ff0055] hover:bg-[#ff0055]/80 text-white'
                };
            case 'obsidian':
                return {
                    container: 'bg-neutral-50 dark:bg-[#111] text-neutral-800 dark:text-[#e0e0e0] border-neutral-200 dark:border-neutral-800',
                    editorBg: 'bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#f8f8f2]',
                    textarea: 'text-neutral-900 dark:text-[#f8f8f2] caret-neutral-900 dark:caret-white',
                    lineNo: 'text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-800',
                    glow: 'shadow-none',
                    accent: '#9061f9',
                    button: 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white border border-neutral-300 dark:border-neutral-700'
                };
            case 'aurora':
                return {
                    container: 'bg-[#f0fdfa] dark:bg-[#0d1e1c] text-[#0f766e] dark:text-[#00f5ff] border-teal-200 dark:border-teal-500/20',
                    editorBg: 'bg-white dark:bg-[#061211] text-teal-950 dark:text-[#64ffda]',
                    textarea: 'text-teal-950 dark:text-[#64ffda] caret-teal-600 dark:caret-teal-400',
                    lineNo: 'text-teal-400 dark:text-teal-900 border-teal-100 dark:border-teal-900/30',
                    glow: 'shadow-[0_0_20px_rgba(20,184,166,0.05)] dark:shadow-[0_0_20px_rgba(100,255,218,0.1)]',
                    accent: '#0d9488',
                    button: 'bg-teal-600 hover:bg-teal-500 text-white'
                };
            case 'neon-horizon':
            default:
                return {
                    container: 'bg-purple-50/80 dark:bg-dark-950/65 text-purple-900 dark:text-dark-100 border-purple-200 dark:border-dark-800/40 backdrop-blur-xl',
                    editorBg: 'bg-purple-50/30 dark:bg-dark-900/45 text-purple-950 dark:text-purple-100',
                    textarea: 'text-purple-100 caret-primary-600 dark:caret-primary-400',
                    lineNo: 'text-purple-400 dark:text-dark-500 border-purple-200/50 dark:border-dark-800/30',
                    glow: 'shadow-[0_0_30px_rgba(124,58,237,0.05)] dark:shadow-[0_0_30px_rgba(124,58,237,0.1)]',
                    accent: '#7c3aed',
                    button: 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white'
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div className="min-h-screen pt-24 pb-12 bg-white dark:bg-dark-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Controls Panel */}
                <div className={`p-5 mb-6 rounded-2xl border ${styles.container} ${styles.glow} flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-dark-900 dark:text-white flex items-center gap-2">
                                CodeForge <span className="text-xs bg-primary-500/10 text-primary-500 border border-primary-500/25 px-2 py-0.5 rounded font-mono uppercase">Developer Sandbox</span>
                            </h1>
                            <p className="text-xs text-dark-500 dark:text-dark-400">Compile, debug, and optimize your logic locally or with AI assistance.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Language Selector */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Language</label>
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-800 text-dark-700 dark:text-dark-200 outline-none cursor-pointer focus:border-primary-500"
                            >
                                <option value="javascript">JavaScript (ES6)</option>
                                <option value="python">Python (3.x)</option>
                                <option value="cpp">C++ (GCC 11)</option>
                                <option value="java">Java (JDK 17)</option>
                            </select>
                        </div>

                        {/* Co-Lab Button */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Collaboration</label>
                            <button
                                onClick={() => navigate('/collaborative')}
                                className="px-3.5 py-1.5 rounded-lg text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md shadow-indigo-600/15 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Co-Lab Space
                            </button>
                        </div>

                        {/* Theme Selector */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Editor Theme</label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-800 text-dark-700 dark:text-dark-200 outline-none cursor-pointer focus:border-primary-500"
                            >
                                <option value="neon-horizon">Neon Horizon</option>
                                <option value="cyberpunk">Cyberpunk Neon</option>
                                <option value="obsidian">Monochrome Obsidian</option>
                                <option value="aurora">Aurora Teal</option>
                            </select>
                        </div>

                        {/* AI Toggle */}
                        <div className="flex items-center gap-2 mt-4 md:mt-0 px-3 py-1.5 rounded-lg border border-dark-250 dark:border-dark-850 bg-dark-50/50 dark:bg-dark-900/50">
                            <span className="text-xs font-medium text-dark-600 dark:text-dark-300 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Intellisense
                            </span>
                            <button
                                onClick={() => setAiIntellisense(!aiIntellisense)}
                                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                                    aiIntellisense ? 'bg-[#10b981]' : 'bg-dark-300 dark:bg-dark-800'
                                } relative flex items-center`}
                            >
                                <div
                                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${
                                        aiIntellisense ? 'translate-x-4.5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Workspace Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Code Area Column (Editor) */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                        
                        {/* Editor Block */}
                        <div className={`rounded-2xl border ${styles.container} overflow-hidden transition-all duration-300`}>
                            {/* Editor Top Bar */}
                            <div className="px-4 py-2.5 bg-dark-100/10 dark:bg-dark-900/20 border-b border-dark-800/10 flex items-center justify-between text-xs font-mono">
                                <span className="text-dark-400 dark:text-dark-500 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                                    source.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                                </span>
                                <div className="flex items-center gap-4">
                                    <span>Lines: {lineCount}</span>
                                    <span>Encoding: UTF-8</span>
                                </div>
                            </div>

                            {/* Line numbers + Textarea container */}
                            <div className={`flex font-mono text-sm leading-6 ${styles.editorBg} min-h-[400px] max-h-[500px] overflow-hidden`}>
                                {/* Line Numbers Column */}
                                <div
                                    ref={lineNumbersRef}
                                    className={`w-12 py-4 select-none text-right pr-3 border-r ${styles.lineNo} overflow-hidden scrollbar-none`}
                                >
                                    {lineNumbers.map(n => (
                                        <div key={n}>{n}</div>
                                    ))}
                                </div>

                                {/* Main Textarea Editor */}
                                <textarea
                                    ref={textareaRef}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onScroll={handleScroll}
                                    className={`flex-1 py-4 px-4 bg-transparent outline-none border-none resize-none font-mono focus:ring-0 ${styles.textarea} overflow-y-auto`}
                                    placeholder="Write your code here..."
                                    spellCheck={false}
                                />
                            </div>

                            {/* Editor Bottom Actions */}
                            <div className="p-4 bg-dark-100/5 dark:bg-dark-900/10 border-t border-dark-800/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleResetCode}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dark-350 dark:border-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-900 transition"
                                    >
                                        Reset Template
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleRunCode}
                                        disabled={isRunning}
                                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 shadow-lg cursor-pointer ${
                                            isRunning ? 'bg-primary-500/50 cursor-not-allowed text-white' : styles.button
                                        }`}
                                    >
                                        {isRunning ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                                Run Code
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Column (AI Copilot & Terminal) */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                        
                        {/* Right AI Intellisense Drawer Card */}
                        {aiIntellisense && (
                            <div className="p-5 rounded-2xl border border-dark-250 dark:border-dark-850 bg-white dark:bg-dark-900/50 backdrop-blur-xl shadow-xl flex flex-col justify-between flex-shrink-0">
                                <div className="flex items-center justify-between mb-4 border-b border-dark-100 dark:border-dark-800/80 pb-3">
                                    <h2 className="font-bold text-dark-900 dark:text-white flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        AI Copilot Coprocessor
                                    </h2>
                                    <span className="bg-[#10b981]/15 text-[#10b981] dark:bg-[#10b981]/25 dark:text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                                </div>

                                {/* Copilot Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <button
                                        onClick={() => handleCopilotAction('explain')}
                                        disabled={aiLoading}
                                        className="py-2.5 px-2 text-xs font-semibold rounded-xl border border-dark-200 dark:border-dark-800 text-dark-750 dark:text-dark-250 hover:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition cursor-pointer text-center"
                                    >
                                        Explain
                                    </button>
                                    <button
                                        onClick={() => handleCopilotAction('optimize')}
                                        disabled={aiLoading}
                                        className="py-2.5 px-2 text-xs font-semibold rounded-xl border border-dark-200 dark:border-dark-800 text-dark-750 dark:text-dark-250 hover:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition cursor-pointer text-center"
                                    >
                                        Optimize
                                    </button>
                                    <button
                                        onClick={() => handleCopilotAction('fix_bugs')}
                                        disabled={aiLoading}
                                        className="py-2.5 px-2 text-xs font-semibold rounded-xl border border-dark-200 dark:border-dark-800 text-dark-750 dark:text-dark-250 hover:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition cursor-pointer text-center"
                                    >
                                        Audit Bugs
                                    </button>
                                    <button
                                        onClick={() => handleCopilotAction('custom')}
                                        disabled={aiLoading || !aiQuery.trim()}
                                        className="py-2.5 px-2 text-xs font-semibold rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 border border-primary-500/20 transition cursor-pointer text-center disabled:opacity-50"
                                    >
                                        Submit
                                    </button>
                                </div>

                                {/* Custom Copilot Prompt Field */}
                                <div className="mb-4">
                                    <textarea
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder="Ask AI to complete, edit, or customize..."
                                        className="w-full p-3 text-xs rounded-xl bg-dark-50 dark:bg-dark-900 border border-dark-250 dark:border-dark-800 text-dark-750 dark:text-dark-200 focus:outline-none focus:border-primary-500 min-h-[60px] resize-none"
                                    />
                                </div>

                                {/* AI suggestions output panel */}
                                <div className="flex flex-col gap-2 border-t border-dark-100 dark:border-dark-800/80 pt-3 font-mono text-xs">
                                    <div className="flex items-center justify-between text-dark-400 dark:text-dark-500 mb-1">
                                        <span>Output Analysis:</span>
                                        {aiResponse.includes('```') && (
                                            <button
                                                onClick={applyAiSuggestion}
                                                className="text-[10px] text-primary-500 hover:text-primary-400 uppercase tracking-wider font-bold cursor-pointer"
                                            >
                                                Apply to Editor
                                            </button>
                                        )}
                                    </div>

                                    <div className="rounded-xl p-4 bg-[#0a0f1d] border border-dark-850/80 max-h-[140px] overflow-y-auto text-dark-200 leading-5 whitespace-pre-wrap select-text scrollbar-thin">
                                        {aiLoading ? (
                                            <div className="flex flex-col gap-2 items-center justify-center min-h-[80px] text-dark-400">
                                                <svg className="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span className="text-[10px] uppercase tracking-widest animate-pulse font-bold mt-1 text-primary-450">Processing...</span>
                                            </div>
                                        ) : aiResponse ? (
                                            aiResponse
                                        ) : (
                                            <span className="text-dark-500">Intellisense ready. Click a button to begin.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interactive Console Terminal */}
                        <div className={`rounded-2xl border border-dark-250 dark:border-dark-850 bg-[#070b14] shadow-2xl overflow-hidden font-mono flex flex-col transition-all duration-300 ${
                            aiIntellisense ? 'h-[250px]' : 'h-[500px] lg:h-[570px]'
                        }`}>
                            {/* Terminal Header */}
                            <div className="px-4 py-3 bg-[#0a0f1d] border-b border-dark-950 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="text-xs text-dark-400 font-bold ml-2">UNIX TERMINAL CONSOLE</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {performanceMetrics.time > 0 && (
                                        <div className="flex items-center gap-3 text-[10px] text-emerald-400 uppercase tracking-widest font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            <span>Time: {performanceMetrics.time} ms</span>
                                            <span>Memory: {performanceMetrics.memory} KB</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleClearTerminal}
                                        className="text-xs text-dark-400 hover:text-dark-200 transition cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Terminal output viewport */}
                            <div className="p-5 flex-1 overflow-y-auto text-xs leading-5 flex flex-col gap-1.5 scrollbar-thin">
                                {terminalOutput.map((log, index) => {
                                    let color = 'text-[#00ffaa]'; // stdout default green
                                    if (log.type === 'system') color = 'text-purple-400 font-bold';
                                    if (log.type === 'info') color = 'text-cyan-400 font-semibold';
                                    if (log.type === 'stderr') color = 'text-red-400 font-semibold bg-red-950/20 px-2 py-0.5 rounded border border-red-500/10';

                                    return (
                                        <div key={index} className={`whitespace-pre-wrap ${color}`}>
                                            {log.text}
                                        </div>
                                    );
                                })}
                                <div ref={terminalEndRef} />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
