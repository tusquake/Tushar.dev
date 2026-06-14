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
    const [boxStyle, setBoxStyle] = useState('glowing-glass'); // glowing-glass, frosted-glass, solid-border, retro-neon
    const [fullscreenBox, setFullscreenBox] = useState(null); // 'editor' | 'ai' | 'terminal' | null
    const [aiIntellisense, setAiIntellisense] = useState(true);
    const [isRunning, setIsRunning] = useState(false);

    // Handle body overflow and Escape key to close fullscreen
    useEffect(() => {
        if (fullscreenBox) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [fullscreenBox]);

    useEffect(() => {
        const handleKeyDownEscape = (e) => {
            if (e.key === 'Escape') {
                setFullscreenBox(null);
            }
        };
        window.addEventListener('keydown', handleKeyDownEscape);
        return () => window.removeEventListener('keydown', handleKeyDownEscape);
    }, []);
    const [terminalOutput, setTerminalOutput] = useState([
        { type: 'system', text: 'Welcome to CodeForge IDE v1.0.0 Terminal' },
        { type: 'system', text: 'Select a programming language and click [Run Code] to compile.' }
    ]);
    const [performanceMetrics, setPerformanceMetrics] = useState({ time: 0, memory: 0 });
    const [modalConfig, setModalConfig] = useState(null);

    // Debugger / Auto-Fix State (ForgeDebugger)
    const [debugMode, setDebugMode] = useState(false);
    const [debugCode, setDebugCode] = useState('');
    const [debugExplanation, setDebugExplanation] = useState('');
    const [debugLoading, setDebugLoading] = useState(false);
    
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

    // Intercept Tab key and Ctrl+Space for AI Autocomplete
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
        } else if (e.key === ' ' && e.ctrlKey) {
            e.preventDefault();
            triggerInlineCompletion();
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

    // Hotkey triggered AI Autocomplete continuation
    const triggerInlineCompletion = async () => {
        if (!aiIntellisense || !textareaRef.current) return;
        
        const cursor = textareaRef.current.selectionStart;
        const textBefore = code.substring(0, cursor);
        const textAfter = code.substring(cursor);
        
        setTerminalOutput(prev => [
            ...prev,
            { type: 'info', text: 'AI Copilot: Suggesting code completion...' }
        ]);

        const prompt = `You are an inline code auto-complete assistant.
Given the code prefix and suffix, return ONLY the direct next few lines of code to continue the logic. Do not write explanations or wrap the code in markdown blocks.

Code Prefix:
${textBefore}

Code Suffix:
${textAfter}

Completion:`;

        try {
            const completion = await callLlm(prompt);
            // Clean markdown blocks if LLM wrapped it
            let cleanCompletion = completion.trim();
            if (cleanCompletion.startsWith('```')) {
                cleanCompletion = cleanCompletion.replace(/```[a-z]*\n/, '').replace(/```$/, '');
            }
            
            const newVal = textBefore + cleanCompletion + textAfter;
            setCode(newVal);
            
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursor + cleanCompletion.length;
                }
            }, 0);

            setTerminalOutput(prev => [
                ...prev,
                { type: 'system', text: 'AI Copilot: Inserted completion successfully.' }
            ]);
        } catch (err) {
            setTerminalOutput(prev => [
                ...prev,
                { type: 'stderr', text: `AI Copilot Error: ${err.message}` }
            ]);
        }
    };

    // Auto-fix errors handler (ForgeDebugger)
    const handleAutoFixError = async () => {
        if (!aiIntellisense) return;
        
        setDebugMode(true);
        setDebugLoading(true);
        setDebugCode('');
        setDebugExplanation('');

        const errorsText = terminalOutput
            .filter(log => log.type === 'stderr')
            .map(log => log.text)
            .join('\n');

        const prompt = `You are an expert automated debugger and pair programmer.
The user has executed the following "${language}" code and received an execution error.

Source Code:
${code}

Stderr Error Output:
${errorsText}

You must identify the bug and provide the fix.
You must respond with ONLY a valid JSON object. Do not include markdown code block backticks around the JSON.
Schema:
{
  "explanation": "Brief explanation of the bug and how to fix it.",
  "fixedCode": "The complete, corrected code to replace the editor buffer."
}
`;

        try {
            const res = await callLlm(prompt);
            const parsed = parseJsonResponse(res);
            setDebugCode(parsed.fixedCode || '');
            setDebugExplanation(parsed.explanation || 'No explanation details returned.');
        } catch (err) {
            console.error(err);
            setDebugExplanation(`Failed to generate debug suggestions: ${err.message}`);
        } finally {
            setDebugLoading(false);
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
            setModalConfig({
                title: "Apply Suggestion",
                message: "No clear code block found in the AI response to automatically apply. Please verify that the suggestion contains standard markdown code blocks.",
                type: "alert"
            });
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
        setModalConfig({
            title: "Reset Code Editor",
            message: "Are you sure you want to reset the editor? All your active changes in the editor workspace will be lost.",
            type: "confirm",
            onConfirm: () => {
                setCode(BOILERPLATES[language]);
                setTerminalOutput([
                    { type: 'system', text: 'Editor successfully reset to template boilerplate.' }
                ]);
            }
        });
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
            case 'dracula':
                return {
                    container: 'bg-[#282a36] text-[#f8f8f2] border-[#6272a4]/45',
                    editorBg: 'bg-[#282a36] text-[#f8f8f2]',
                    textarea: 'text-[#f8f8f2] caret-[#ff79c6]',
                    lineNo: 'text-[#6272a4] border-[#6272a4]/20',
                    glow: 'shadow-[0_0_20px_rgba(189,147,249,0.15)]',
                    accent: '#bd93f9',
                    button: 'bg-[#bd93f9] hover:bg-[#a478e7] text-black font-semibold'
                };
            case 'nord':
                return {
                    container: 'bg-[#2e3440] text-[#d8dee9] border-[#4c566a]/40',
                    editorBg: 'bg-[#2e3440] text-[#d8dee9]',
                    textarea: 'text-[#d8dee9] caret-[#88c0d0]',
                    lineNo: 'text-[#4c566a] border-[#4c566a]/20',
                    glow: 'shadow-[0_0_20px_rgba(136,192,208,0.1)]',
                    accent: '#88c0d0',
                    button: 'bg-[#88c0d0] hover:bg-[#81b4c3] text-[#2e3440] font-semibold'
                };
            case 'monokai':
                return {
                    container: 'bg-[#272822] text-[#f8f8f2] border-[#49483e]/50',
                    editorBg: 'bg-[#272822] text-[#f8f8f2]',
                    textarea: 'text-[#f8f8f2] caret-[#f92672]',
                    lineNo: 'text-[#75715e] border-[#49483e]/30',
                    glow: 'shadow-[0_0_20px_rgba(166,226,46,0.1)]',
                    accent: '#a6e22e',
                    button: 'bg-[#a6e22e] hover:bg-[#97cf28] text-black font-semibold'
                };
            case 'solarized-dark':
                return {
                    container: 'bg-[#002b36] text-[#839496] border-[#073642]/60',
                    editorBg: 'bg-[#002b36] text-[#93a1a1]',
                    textarea: 'text-[#93a1a1] caret-[#b58900]',
                    lineNo: 'text-[#586e75] border-[#073642]/40',
                    glow: 'shadow-[0_0_20px_rgba(42,161,152,0.1)]',
                    accent: '#2aa198',
                    button: 'bg-[#2aa198] hover:bg-[#238b82] text-white font-semibold'
                };
            case 'retro-terminal':
                return {
                    container: 'bg-black text-[#ffb000] border-[#ffb000]/40 font-mono',
                    editorBg: 'bg-black text-[#ffb000]',
                    textarea: 'text-[#ffb000] caret-[#ffb000] placeholder-[#ffb000]/30',
                    lineNo: 'text-[#ffb000]/40 border-[#ffb000]/20',
                    glow: 'shadow-[0_0_20px_rgba(255,176,0,0.15)]',
                    accent: '#ffb000',
                    button: 'bg-[#ffb000] hover:bg-[#e09b00] text-black font-mono font-bold border border-[#ffb000]/50'
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

    const getBoxStyleProps = (styleName, currentThemeStyles) => {
        switch (styleName) {
            case 'frosted-glass':
                return {
                    className: 'backdrop-blur-2xl bg-white/10 dark:bg-dark-900/30 border border-dark-200/50 dark:border-dark-800/40 shadow-xl',
                    style: {}
                };
            case 'solid-border':
                return {
                    className: 'bg-white dark:bg-dark-900 border-2 border-dark-300 dark:border-dark-700 shadow-none text-dark-900 dark:text-dark-100',
                    style: {}
                };
            case 'retro-neon':
                const accent = currentThemeStyles.accent || '#7c3aed';
                return {
                    className: 'bg-white dark:bg-dark-950 text-dark-900 dark:text-dark-100 transition-all duration-300',
                    style: {
                        borderColor: accent,
                        borderWidth: '2px',
                        boxShadow: `6px 6px 0px 0px ${accent}45`
                    }
                };
            case 'glowing-glass':
            default:
                return {
                    className: `${currentThemeStyles.container} ${currentThemeStyles.glow}`,
                    style: {}
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div className="min-h-screen pt-24 pb-12 bg-white dark:bg-dark-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Controls Panel */}
                {(() => {
                    const headerBoxProps = getBoxStyleProps(boxStyle, styles);
                    return (
                        <div 
                            className={`p-5 mb-6 rounded-2xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300 ${headerBoxProps.className}`}
                            style={headerBoxProps.style}
                        >
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
                                        <option value="dracula">Dracula Dark</option>
                                        <option value="nord">Nord Frost</option>
                                        <option value="monokai">Retro Monokai</option>
                                        <option value="solarized-dark">Solarized Dark</option>
                                        <option value="retro-terminal">Retro Terminal (Amber)</option>
                                    </select>
                                </div>

                                {/* Box Style Selector */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Box Container Style</label>
                                    <select
                                        value={boxStyle}
                                        onChange={(e) => setBoxStyle(e.target.value)}
                                        className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-800 text-dark-700 dark:text-dark-200 outline-none cursor-pointer focus:border-primary-500"
                                    >
                                        <option value="glowing-glass">Glowing Glass</option>
                                        <option value="frosted-glass">Frosted Glassmorphism</option>
                                        <option value="solid-border">Solid Minimalist</option>
                                        <option value="retro-neon">Retro Neon</option>
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
                    );
                })()}

                {/* Main Workspace Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Code Area Column (Editor) */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                        
                        {/* Editor Block */}
                        {(() => {
                            const editorBoxProps = getBoxStyleProps(boxStyle, styles);
                            return (
                                <div 
                                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${editorBoxProps.className} ${
                                        fullscreenBox === 'editor' 
                                            ? 'fixed inset-0 z-[100] m-0 rounded-none w-screen h-screen flex flex-col p-6' 
                                            : ''
                                    }`}
                                    style={{
                                        ...editorBoxProps.style,
                                        ...(fullscreenBox === 'editor' ? { borderRadius: '0' } : {})
                                    }}
                                >
                                    {/* Editor Top Bar */}
                                    <div className="px-4 py-2.5 bg-dark-100/10 dark:bg-dark-900/20 border-b border-dark-800/10 flex items-center justify-between text-xs font-mono">
                                        <span className="text-dark-400 dark:text-dark-500 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                                            source.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span>Lines: {lineCount}</span>
                                            <span>Encoding: UTF-8</span>
                                            <button
                                                onClick={() => setFullscreenBox(fullscreenBox === 'editor' ? null : 'editor')}
                                                className="p-1 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded transition cursor-pointer"
                                                title={fullscreenBox === 'editor' ? "Exit Fullscreen (Esc)" : "Fullscreen Code Editor"}
                                            >
                                                {fullscreenBox === 'editor' ? (
                                                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v-6m0 6l7 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Line numbers + Textarea container */}
                                    <div className={`flex font-mono text-sm leading-6 ${styles.editorBg} ${
                                        fullscreenBox === 'editor' 
                                            ? 'flex-1 min-h-[70vh] max-h-[85vh]' 
                                            : 'min-h-[400px] max-h-[500px]'
                                    } overflow-hidden divide-x divide-dark-800/20 dark:divide-dark-800`}>
                                {/* Left Half: User Editor */}
                                <div className="flex flex-1 overflow-hidden min-w-[200px]">
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
                                        placeholder="Write your code here... Press [Ctrl + Space] for AI Autocomplete"
                                        spellCheck={false}
                                    />
                                </div>

                                {/* Right Half: AI Proposed Fix (rendered in Split Screen if debugMode is true) */}
                                {debugMode && (
                                    <div className="flex flex-1 flex-col bg-[#0b101d] text-xs leading-5 text-dark-300 min-w-[200px] overflow-hidden">
                                        <div className="px-4 py-2 bg-red-950/20 border-b border-red-500/20 text-red-400 font-bold uppercase tracking-wider flex items-center justify-between">
                                            <span>AI Debugger Suggestion</span>
                                            <div className="flex gap-2">
                                                {!debugLoading && debugCode && (
                                                    <button
                                                        onClick={() => {
                                                            setCode(debugCode);
                                                            setDebugMode(false);
                                                            setTerminalOutput(prev => [
                                                                ...prev,
                                                                { type: 'system', text: 'AI Debugger: Applied code changes successfully.' }
                                                            ]);
                                                        }}
                                                        className="px-2 py-0.5 rounded bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider transition cursor-pointer"
                                                    >
                                                        Accept Fix
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDebugMode(false)}
                                                    className="px-2 py-0.5 rounded bg-dark-850 hover:bg-dark-800 text-dark-200 font-bold text-[9px] uppercase tracking-wider transition cursor-pointer"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin select-text">
                                            {debugLoading ? (
                                                <div className="flex flex-col gap-2 items-center justify-center h-full text-dark-400">
                                                    <svg className="animate-spin h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    <span className="text-[10px] uppercase tracking-widest animate-pulse font-bold mt-1 text-red-400">Analyzing Error...</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="p-3 bg-red-950/10 border border-red-500/10 rounded-lg">
                                                        <h4 className="font-bold text-red-400 mb-1">Bug Explanation:</h4>
                                                        <p className="text-dark-250 font-sans leading-relaxed">{debugExplanation}</p>
                                                    </div>
                                                    
                                                    {debugCode && (
                                                        <div>
                                                            <h4 className="font-bold text-emerald-400 mb-1">Proposed Code:</h4>
                                                            <pre className="p-3 bg-[#070b14] border border-dark-800 rounded-lg overflow-x-auto text-[10px] font-mono whitespace-pre text-dark-100 scrollbar-thin">
                                                                <code>{debugCode}</code>
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                    );
                })()}
                    </div>

                    {/* Right Sidebar Column (AI Copilot & Terminal) */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                        
                        {/* Right AI Intellisense Drawer Card */}
                        {aiIntellisense && (() => {
                            const aiBoxProps = getBoxStyleProps(boxStyle, styles);
                            return (
                                <div 
                                    className={`p-5 rounded-2xl border flex flex-col justify-between flex-shrink-0 transition-all duration-300 ${aiBoxProps.className} ${
                                        fullscreenBox === 'ai' 
                                            ? 'fixed inset-0 z-[100] m-0 rounded-none w-screen h-screen bg-white dark:bg-dark-900/95 p-6 md:p-8 overflow-y-auto' 
                                            : ''
                                    }`}
                                    style={{
                                        ...aiBoxProps.style,
                                        ...(fullscreenBox === 'ai' ? { borderRadius: '0' } : {})
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-4 border-b border-dark-100 dark:border-dark-800/80 pb-3">
                                        <h2 className="font-bold text-dark-900 dark:text-white flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            AI Copilot Coprocessor
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[#10b981]/15 text-[#10b981] dark:bg-[#10b981]/25 dark:text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                                            <button
                                                onClick={() => setFullscreenBox(fullscreenBox === 'ai' ? null : 'ai')}
                                                className="p-1 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded transition cursor-pointer flex items-center justify-center"
                                                title={fullscreenBox === 'ai' ? "Exit Fullscreen (Esc)" : "Fullscreen AI Copilot"}
                                            >
                                                {fullscreenBox === 'ai' ? (
                                                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v-6m0 6l7 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
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

                                        <div className={`rounded-xl p-4 bg-[#0a0f1d] border border-dark-850/80 overflow-y-auto text-dark-200 leading-5 whitespace-pre-wrap select-text scrollbar-thin ${
                                            fullscreenBox === 'ai' ? 'flex-1 min-h-[400px] max-h-[calc(100vh-280px)]' : 'max-h-[140px]'
                                        }`}>
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
                            );
                        })()}

                        {/* Interactive Console Terminal */}
                        {(() => {
                            const terminalBoxProps = getBoxStyleProps(boxStyle, styles);
                            return (
                                <div 
                                    className={`rounded-2xl border bg-[#070b14] shadow-2xl overflow-hidden font-mono flex flex-col transition-all duration-300 ${terminalBoxProps.className} ${
                                        fullscreenBox === 'terminal' 
                                            ? 'fixed inset-0 z-[100] m-0 rounded-none w-screen h-screen p-6 md:p-8' 
                                            : aiIntellisense ? 'h-[250px]' : 'h-[500px] lg:h-[570px]'
                                    }`}
                                    style={{
                                        ...terminalBoxProps.style,
                                        ...(fullscreenBox === 'terminal' ? { borderRadius: '0' } : {})
                                    }}
                                >
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
                                            <button
                                                onClick={() => setFullscreenBox(fullscreenBox === 'terminal' ? null : 'terminal')}
                                                className="p-1 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded transition cursor-pointer flex items-center justify-center"
                                                title={fullscreenBox === 'terminal' ? "Exit Fullscreen (Esc)" : "Fullscreen Terminal"}
                                            >
                                                {fullscreenBox === 'terminal' ? (
                                                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v-6m0 6l7 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                                    </svg>
                                                )}
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
                                        {terminalOutput.some(log => log.type === 'stderr') && !debugMode && (
                                            <div className="mt-2 p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-3 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                                    <span className="text-[11px] text-red-300 font-medium animate-none">Execution error detected.</span>
                                                </div>
                                                <button
                                                    onClick={handleAutoFixError}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider shadow shadow-red-500/30 hover:shadow-red-500/50 transition cursor-pointer"
                                                >
                                                    Debug with AI
                                                </button>
                                            </div>
                                        )}
                                        <div ref={terminalEndRef} />
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                </div>

            </div>

        {/* Premium In-App Modal / Dialog */}
        {modalConfig && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="max-w-md w-full mx-4 p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden text-center animate-scale-up">
                    {/* Background design glow */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{modalConfig.title}</h3>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">{modalConfig.message}</p>

                    <div className="flex gap-3 justify-center">
                        {modalConfig.type === 'confirm' ? (
                            <>
                                <button
                                    onClick={() => {
                                        if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        setModalConfig(null);
                                    }}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setModalConfig(null)}
                                    className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 font-semibold text-xs transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                                    setModalConfig(null);
                                }}
                                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
