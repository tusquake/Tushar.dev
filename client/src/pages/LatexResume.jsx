import { useState, useEffect, useRef } from 'react';
import ResumeHeader from '../components/layout/ResumeHeader';
import Card from '../components/common/Card';

const INITIAL_MINIMALIST = `% --- CodeForge.dev LaTeX Resume ---
\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\titleformat{\\section}{\\scshape\\raggedright\\large}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{Tushar Seth}} \\\\ \\vspace{2pt}
    sethtushar111@gmail.com $|$ +91 98765 43210 $|$ github.com/tushar $|$ linkedin.com/in/tushar
\\end{center}

\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item
    \\textbf{Senior Software Engineer} \\hfill Jan 2023 -- Present \\\\
    \\textit{TechCorp Solutions} \\hfill Mumbai, India
    \\begin{itemize}[leftmargin=0.15in]
        \\item Led migration of monolithic backend to scalable microservices using Node.js and Docker.
        \\item Optimized database queries in PostgreSQL, improving dashboard load times by 40\\%.
        \\item Mentored junior developers and instituted code review standards to ensure quality.
    \\end{itemize}
\\end{itemize}

\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item
    \\textbf{CodeForge.dev Landing Page} \\hfill React, Tailwind v4, Vite \\\\
    \\textit{Creator & Maintainer} \\hfill \\href{https://github.com/tushar/codeforge}{github.com/tushar/codeforge}
    \\begin{itemize}[leftmargin=0.15in]
        \\item Built a high-performance developer learning hub with interactive visualizers.
        \\item Handled client-side states and local storage caching for offline usage.
    \\end{itemize}
\\end{itemize}

\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item
    \\textbf{Bachelor of Technology in Computer Science} \\hfill 2018 -- 2022 \\\\
    \\textit{National Institute of Technology} \\hfill GPA: 8.9/10
\\end{itemize}

\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item \\textbf{Languages:} JavaScript, TypeScript, Python, SQL, C++
    \\item \\textbf{Frameworks:} React, Next.js, Node.js, Express, TailwindCSS
    \\item \\textbf{Developer Tools:} Git, Docker, AWS, PostgreSQL, VS Code
\\end{itemize}

\\end{document}`;

const INITIAL_DEVELOPER = `% --- CodeForge.dev Modern Developer Template ---
\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}

\\titleformat{\\section}{\\bfseries\\raggedright\\large}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{Tushar Seth}} \\\\ \\vspace{2pt}
    \\textit{Full Stack Developer} \\\\ \\vspace{1pt}
    sethtushar111@gmail.com $|$ +91 98765 43210 $|$ github.com/tushar
\\end{center}

\\section{Summary}
Highly motivated Full Stack Software Developer with 3+ years of experience specializing in building responsive web applications, optimizing database performance, and writing clean, maintainable code.

\\section{Technical Expertise}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item \\textbf{Frontend Development:} React, Next.js, TypeScript, TailwindCSS, HTML5, CSS3
    \\item \\textbf{Backend & Databases:} Node.js, Express, GraphQL, PostgreSQL, MongoDB, Redis
    \\item \\textbf{DevOps & Platforms:} AWS (S3, EC2), Docker, Git, CI/CD Pipelines
\\end{itemize}

\\section{Professional Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item \\textbf{Software Engineer} at \\textit{WebTech Inc} \\hfill 2021 -- Present
    \\begin{itemize}
        \\item Designed and launched new features using React and TailwindCSS.
        \\item Integrated REST and GraphQL APIs, reducing data latency by 15\\%.
    \\end{itemize}
\\end{itemize}

\\section{Key Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\item \\textbf{ATS Resume Analyzer} \\hfill \\href{https://github.com/tushar/codeforge}{Link}
    \\begin{itemize}
        \\item Implemented client-side PDF parsing and AI-driven analysis of developer resumes.
    \\end{itemize}
\\end{itemize}

\\end{document}`;

const LatexResume = () => {
    const [template, setTemplate] = useState('minimalist'); // minimalist, developer
    const [latexCode, setLatexCode] = useState(INITIAL_MINIMALIST);
    const [editorFontSize, setEditorFontSize] = useState(13);
    const [toast, setToast] = useState('');
    const [history, setHistory] = useState([INITIAL_MINIMALIST]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [confirmModal, setConfirmModal] = useState(null); // { type, title, message, onConfirm }
    const previewRef = useRef(null);

    // Load saved LaTeX on mount
    useEffect(() => {
        const savedLatex = localStorage.getItem('codeforge_latex_resume');
        const savedTemplate = localStorage.getItem('codeforge_latex_template');
        if (savedLatex) {
            setLatexCode(savedLatex);
            setHistory([savedLatex]);
            setHistoryIndex(0);
        }
        if (savedTemplate) {
            setTemplate(savedTemplate);
        }
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Save LaTeX code change
    const handleCodeChange = (newCode) => {
        setLatexCode(newCode);
        localStorage.setItem('codeforge_latex_resume', newCode);
        
        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newCode);
        // Limit history to 50 entries
        if (newHistory.length > 50) {
            newHistory.shift();
        }
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const nextIdx = historyIndex - 1;
            setHistoryIndex(nextIdx);
            setLatexCode(history[nextIdx]);
            localStorage.setItem('codeforge_latex_resume', history[nextIdx]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            setLatexCode(history[nextIdx]);
            localStorage.setItem('codeforge_latex_resume', history[nextIdx]);
        }
    };

    // Change templates
    const handleTemplateChange = (type) => {
        setConfirmModal({
            title: 'Switch Templates?',
            message: 'Switching templates will overwrite your current edits. Continue?',
            onConfirm: () => {
                const code = type === 'minimalist' ? INITIAL_MINIMALIST : INITIAL_DEVELOPER;
                setTemplate(type);
                localStorage.setItem('codeforge_latex_template', type);
                handleCodeChange(code);
                showToast(`Switched to ${type === 'minimalist' ? 'Minimalist' : 'Modern Developer'} template`);
            }
        });
    };

    // Reset current template
    const handleReset = () => {
        setConfirmModal({
            title: 'Reset Template?',
            message: 'Reset current editor code to the default template? All edits will be lost.',
            onConfirm: () => {
                const code = template === 'minimalist' ? INITIAL_MINIMALIST : INITIAL_DEVELOPER;
                handleCodeChange(code);
                showToast('Template reset successfully');
            }
        });
    };

    // Copy LaTeX code to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(latexCode).then(() => {
            showToast('LaTeX source copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy', err);
        });
    };

    // Download .tex file
    const handleDownloadTex = () => {
        const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume_${template}.tex`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('.tex file downloaded!');
    };

    // Generate from Builder profile data
    const handleImportFromBuilder = () => {
        const savedData = localStorage.getItem('codeforge_resume');
        if (!savedData) {
            setConfirmModal({
                type: 'alert',
                title: 'No Profile Found',
                message: 'No resume data found in Builder. Please create a resume in the Builder first!'
            });
            return;
        }

        try {
            const parsed = JSON.parse(savedData);
            const generated = generateLatexFromProfile(template, parsed);
            if (generated) {
                handleCodeChange(generated);
                showToast('Imported and generated LaTeX from builder profile!');
            }
        } catch (e) {
            console.error('Import failed', e);
            setConfirmModal({
                type: 'alert',
                title: 'Parsing Failed',
                message: 'Failed to parse builder profile data.'
            });
        }
    };

    const generateLatexFromProfile = (type, profileData) => {
        const info = profileData.personalInfo || {};
        const summary = profileData.summary || '';
        const experience = profileData.experience || [];
        const education = profileData.education || [];
        const skills = profileData.skills || {};
        const projects = profileData.projects || [];
        
        const name = info.name || 'Your Name';
        const email = info.email || 'your.email@example.com';
        const phone = info.phone || '+1234567890';
        const github = info.gitHub || 'github.com/username';
        const linkedin = info.linkedIn || 'linkedin.com/in/username';

        // Escape helper for standard LaTeX special characters
        const escapeLatex = (str) => {
            if (!str) return '';
            return str
                .replace(/\\/g, '\\textbackslash ')
                .replace(/%/g, '\\%')
                .replace(/&/g, '\\&')
                .replace(/_/g, '\\_')
                .replace(/\$/g, '\\$')
                .replace(/#/g, '\\#')
                .replace(/{/g, '\\{')
                .replace(/}/g, '\\}')
                .replace(/~/g, '\\textasciitilde ')
                .replace(/\^/g, '\\textasciicircum ');
        };

        if (type === 'minimalist') {
            let latex = `% --- CodeForge.dev LaTeX Resume ---
\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\titleformat{\\section}{\\scshape\\raggedright\\large}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{${escapeLatex(name)}}} \\\\ \\vspace{2pt}
    ${escapeLatex(email)} $|$ ${escapeLatex(phone)} $|$ ${escapeLatex(github)} $|$ ${escapeLatex(linkedin)}
\\end{center}
`;

            if (summary) {
                latex += `
\\section{Summary}
${escapeLatex(summary)}
`;
            }

            if (experience.length > 0 && experience.some(exp => exp.company)) {
                latex += `
\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                experience.forEach(exp => {
                    if (!exp.company) return;
                    const company = exp.company;
                    const role = exp.role || 'Software Engineer';
                    const location = exp.location || '';
                    const period = exp.period || '';
                    latex += `    \\item
    \\textbf{${escapeLatex(role)}} \\hfill ${escapeLatex(period)} \\\\
    \\textit{${escapeLatex(company)}} \\hfill ${escapeLatex(location)}
    \\begin{itemize}[leftmargin=0.15in]
`;
                    if (exp.highlights && exp.highlights.length > 0) {
                        exp.highlights.forEach(h => {
                            if (h) latex += `        \\item ${escapeLatex(h)}\n`;
                        });
                    } else {
                        latex += `        \\item Developed responsive user interfaces and optimized backend systems.\n`;
                    }
                    latex += `    \\end{itemize}
`;
                });
                latex += `\\end{itemize}
`;
            }

            if (projects.length > 0 && projects.some(p => p.title)) {
                latex += `
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                projects.forEach(proj => {
                    if (!proj.title) return;
                    const title = proj.title;
                    const tech = proj.techStack || '';
                    const desc = proj.description || '';
                    const link = proj.githubLink || '';
                    const linkStr = link ? ` \\hfill \\href{${link}}{Link}` : '';
                    latex += `    \\item
    \\textbf{${escapeLatex(title)}} $|$ \\textit{${escapeLatex(tech)}}${linkStr}
    \\begin{itemize}[leftmargin=0.15in]
        \\item ${escapeLatex(desc)}
    \\end{itemize}
`;
                });
                latex += `\\end{itemize}
`;
            }

            if (education.length > 0 && education.some(edu => edu.institution)) {
                latex += `
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                education.forEach(edu => {
                    if (!edu.institution) return;
                    const inst = edu.institution;
                    const degree = edu.degree || 'Bachelor of Science';
                    const year = edu.year || '';
                    const gpa = edu.gpa ? ` $|$ GPA: ${edu.gpa}` : '';
                    latex += `    \\item
    \\textbf{${escapeLatex(degree)}} ${escapeLatex(gpa)} \\hfill ${escapeLatex(year)} \\\\
    \\textit{${escapeLatex(inst)}}
`;
                });
                latex += `\\end{itemize}
`;
            }

            const skillsList = [];
            if (skills.languages) skillsList.push(`\\textbf{Languages:} ${escapeLatex(skills.languages)}`);
            if (skills.frameworks) skillsList.push(`\\textbf{Frameworks:} ${escapeLatex(skills.frameworks)}`);
            if (skills.tools) skillsList.push(`\\textbf{Developer Tools:} ${escapeLatex(skills.tools)}`);
            if (skillsList.length > 0) {
                latex += `
\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                skillsList.forEach(s => {
                    latex += `    \\item ${s}\n`;
                });
                latex += `\\end{itemize}
`;
            }

            latex += `
\\end{document}
`;
            return latex;
        } else {
            // Modern Developer Template
            let latex = `% --- CodeForge.dev Modern Developer Template ---
\\documentclass[letterpaper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}

\\titleformat{\\section}{\\bfseries\\raggedright\\large}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{${escapeLatex(name)}}} \\\\ \\vspace{2pt}
    \\textit{Full Stack Developer} \\\\ \\vspace{1pt}
    ${escapeLatex(email)} $|$ ${escapeLatex(phone)} $|$ ${escapeLatex(github)}
\\end{center}
`;

            if (summary) {
                latex += `
\\section{Summary}
${escapeLatex(summary)}
`;
            }

            const skillsList = [];
            if (skills.languages) skillsList.push(`\\textbf{Languages & Core:} ${escapeLatex(skills.languages)}`);
            if (skills.frameworks) skillsList.push(`\\textbf{Frameworks & Web:} ${escapeLatex(skills.frameworks)}`);
            if (skills.tools) skillsList.push(`\\textbf{Databases & Tools:} ${escapeLatex(skills.tools)}`);
            if (skillsList.length > 0) {
                latex += `
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                skillsList.forEach(s => {
                    latex += `    \\item ${s}\n`;
                });
                latex += `\\end{itemize}
`;
            }

            if (experience.length > 0 && experience.some(exp => exp.company)) {
                latex += `
\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                experience.forEach(exp => {
                    if (!exp.company) return;
                    const company = exp.company;
                    const role = exp.role || 'Software Engineer';
                    const location = exp.location || '';
                    const period = exp.period || '';
                    latex += `    \\item \\textbf{${escapeLatex(role)}} at \\textit{${escapeLatex(company)}} \\hfill ${escapeLatex(period)}
    \\begin{itemize}
`;
                    if (exp.highlights && exp.highlights.length > 0) {
                        exp.highlights.forEach(h => {
                            if (h) latex += `        \\item ${escapeLatex(h)}\n`;
                        });
                    } else {
                        latex += `        \\item Designed and developed frontend components and backend services.\n`;
                    }
                    latex += `    \\end{itemize}
`;
                });
                latex += `\\end{itemize}
`;
            }

            if (projects.length > 0 && projects.some(p => p.title)) {
                latex += `
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                projects.forEach(proj => {
                    if (!proj.title) return;
                    const title = proj.title;
                    const tech = proj.techStack || '';
                    const desc = proj.description || '';
                    const link = proj.githubLink || '';
                    const linkStr = link ? ` \\hfill \\href{${link}}{Repository}` : '';
                    latex += `    \\item \\textbf{${escapeLatex(title)}} $|$ \\textit{${escapeLatex(tech)}}${linkStr}
    \\begin{itemize}
        \\item ${escapeLatex(desc)}
    \\end{itemize}
`;
                });
                latex += `\\end{itemize}
`;
            }

            if (education.length > 0 && education.some(edu => edu.institution)) {
                latex += `
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
`;
                education.forEach(edu => {
                    if (!edu.institution) return;
                    const inst = edu.institution;
                    const degree = edu.degree || 'Bachelor of Science';
                    const year = edu.year || '';
                    const gpa = edu.gpa ? ` ($|$\\textit{GPA: ${escapeLatex(edu.gpa)}})` : '';
                    latex += `    \\item \\textbf{${escapeLatex(degree)}} at \\textit{${escapeLatex(inst)}} \\hfill ${escapeLatex(year)} ${gpa}\n`;
                });
                latex += `\\end{itemize}
`;
            }

            latex += `
\\end{document}
`;
            return latex;
        }
    };

    // Client-side parser: LaTeX -> HTML
    const parseLatexToHtml = (code) => {
        if (!code) return '';
        const lines = code.split('\n');
        let html = [];
        let inDocument = false;
        let inCenter = false;
        let inItemizeStack = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line.startsWith('%')) continue;

            if (line.includes('\\begin{document}')) {
                inDocument = true;
                continue;
            }
            if (line.includes('\\end{document}')) {
                inDocument = false;
                break;
            }

            if (!inDocument) continue;

            // Handle center alignment blocks
            if (line.includes('\\begin{center}')) {
                inCenter = true;
                html.push('<div style="text-align: center; margin-bottom: 8px;">');
                continue;
            }
            if (line.includes('\\end{center}')) {
                inCenter = false;
                html.push('</div>');
                continue;
            }

            // Handle list nests
            if (line.includes('\\begin{itemize}')) {
                inItemizeStack.push(true);
                html.push('<ul style="list-style-type: disc; padding-left: 18px; margin-top: 4px; margin-bottom: 4px;">');
                continue;
            }
            if (line.includes('\\end{itemize}')) {
                inItemizeStack.pop();
                html.push('</ul>');
                continue;
            }

            let text = line;

            // Remove LaTeX formatting markup but keep text content
            text = text.replace(/\\Huge\s*\\textbf\{([^}]+)\}/g, '<span style="font-size: 20px; font-weight: bold; font-family: \'Times New Roman\', Times, serif; display: block; margin-bottom: 2px;">$1</span>');
            text = text.replace(/\\Huge\s*\{([^}]+)\}/g, '<span style="font-size: 20px; font-family: \'Times New Roman\', Times, serif; display: block; margin-bottom: 2px;">$1</span>');
            text = text.replace(/\\Huge\s+([^\\]+)/g, '<span style="font-size: 20px; font-family: \'Times New Roman\', Times, serif; display: block; margin-bottom: 2px;">$1</span>');

            text = text.replace(/\\large\s*\\textbf\{([^}]+)\}/g, '<strong style="font-size: 13px;">$1</strong>');
            text = text.replace(/\\large\s*\{([^}]+)\}/g, '<span style="font-size: 13px;">$1</span>');

            text = text.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
            text = text.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
            text = text.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" style="color: #3b82f6; text-decoration: underline;">$2</a>');

            // Handle hfill alignment
            if (text.includes('\\hfill')) {
                const parts = text.split('\\hfill');
                const left = parts[0].replace(/\\\\/g, '').replace(/\\item/g, '').trim();
                const right = parts[1].replace(/\\\\/g, '').replace(/\\item/g, '').trim();
                text = `<div style="display: flex; justify-content: space-between; align-items: baseline; width: 100%;">
                    <span>${left}</span>
                    <span style="font-weight: normal; color: #4b5563; font-size: 11px;">${right}</span>
                </div>`;
            }

            // Cleanup line breaks
            text = text.replace(/\\\\/g, '<br/>');
            
            // Clean specific spacers
            text = text.replace(/\\vspace\*?\{[^}]+\}/g, '');
            text = text.replace(/\\hspace\*?\{[^}]+\}/g, '');
            text = text.replace(/\\item/g, '');

            // Escape percentage sign backslash
            text = text.replace(/\\%/g, '%');
            text = text.replace(/\\&/g, '&');
            text = text.replace(/\\_/g, '_');

            text = text.trim();

            // Section markers
            const sectionMatch = text.match(/\\section\{([^}]+)\}/);
            if (sectionMatch) {
                html.push(`<h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 12px; margin-bottom: 4px; border-bottom: 1.2px solid #1f2937; padding-bottom: 1.5px; font-family: 'Times New Roman', Times, serif; letter-spacing: 0.05em; color: #111827;">${sectionMatch[1]}</h3>`);
                continue;
            }

            const subsectionMatch = text.match(/\\subsection\{([^}]+)\}/);
            if (subsectionMatch) {
                html.push(`<h4 style="font-size: 11px; font-weight: bold; margin-top: 6px; margin-bottom: 2px; color: #1f2937;">${subsectionMatch[1]}</h4>`);
                continue;
            }

            if (text) {
                if (inItemizeStack.length > 0) {
                    // Check if it was wrapped inside flex
                    if (text.startsWith('<div')) {
                        html.push(`<li style="font-size: 11px; line-height: 1.4; margin-bottom: 2px; color: #374151; list-style-type: none;">${text}</li>`);
                    } else {
                        html.push(`<li style="font-size: 11px; line-height: 1.4; margin-bottom: 2px; color: #374151;">${text}</li>`);
                    }
                } else {
                    html.push(`<div style="font-size: 11px; line-height: 1.4; color: #1f2937; margin-bottom: 3px;">${text}</div>`);
                }
            }
        }

        return html.join('\n');
    };

    const handlePrint = () => {
        const printContent = previewRef.current.innerHTML;
        const htmlContent = `
            <html>
                <head>
                    <title>Resume LaTeX PDF Preview</title>
                    <style>
                        body {
                            font-family: "Times New Roman", Times, serif;
                            margin: 1.5cm;
                            color: #111827;
                            background-color: white;
                        }
                        a { color: #2563eb; text-decoration: none; }
                        h3 { border-bottom: 1px solid #111827; margin-top: 14px; margin-bottom: 4px; padding-bottom: 2px; }
                        ul { padding-left: 15px; margin: 4px 0; }
                        li { margin-bottom: 2px; }
                        @media print {
                            body { margin: 1cm; }
                            button { display: none; }
                            @page {
                                size: A4 portrait;
                                margin: 1.5cm;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
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
            // Popup blocker fallback: Use hidden iframe
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

    return (
        <div className="min-h-screen py-6 bg-dark-50 dark:bg-dark-950/20">
            <ResumeHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {toast && (
                    <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-primary-500 text-white dark:text-dark-950 font-semibold shadow-lg animate-fade-in">
                        {toast}
                    </div>
                )}

                {/* Templates Selector Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card
                        onClick={() => handleTemplateChange('minimalist')}
                        className={`p-5 cursor-pointer border-2 transition-all ${
                            template === 'minimalist' ? 'border-primary-500 bg-primary-500/5' : 'border-dark-200/40 dark:border-dark-800'
                        }`}
                    >
                        <h3 className="font-bold text-dark-900 dark:text-white">Minimalist Serif</h3>
                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">A classic, clean 1-column layout styled using standard TeX packages.</p>
                    </Card>

                    <Card
                        onClick={() => handleTemplateChange('developer')}
                        className={`p-5 cursor-pointer border-2 transition-all ${
                            template === 'developer' ? 'border-primary-500 bg-primary-500/5' : 'border-dark-200/40 dark:border-dark-800'
                        }`}
                    >
                        <h3 className="font-bold text-dark-900 dark:text-white">Modern Developer</h3>
                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Focuses heavily on professional technical summary grids and modern tags.</p>
                    </Card>

                    <Card className="p-5 flex flex-col justify-center bg-dark-100/30 dark:bg-dark-900/40 border border-dark-200/40 dark:border-dark-800">
                        <button
                            onClick={handleImportFromBuilder}
                            className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            Import Profile Data
                        </button>
                        <p className="text-[10px] text-center text-dark-400 dark:text-dark-500 mt-2">
                            Populates templates instantly using details from your local Resume Builder profile.
                        </p>
                    </Card>
                </div>

                {/* Core Split Editor layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Panel: LaTeX Editor */}
                    <div className="lg:col-span-6 space-y-4">
                        <Card className="p-4 flex flex-col h-[750px]">
                            <div className="flex justify-between items-center pb-3 border-b border-dark-200/50 dark:border-dark-800 mb-3">
                                <span className="text-sm font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                    source.tex
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditorFontSize(prev => Math.max(10, prev - 1))}
                                        className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-xs text-dark-500 font-semibold cursor-pointer"
                                        title="Font Size Down"
                                    >
                                        A-
                                    </button>
                                    <button
                                        onClick={() => setEditorFontSize(prev => Math.min(20, prev + 1))}
                                        className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-xs text-dark-500 font-semibold cursor-pointer"
                                        title="Font Size Up"
                                    >
                                        A+
                                    </button>
                                    <div className="h-4 w-px bg-dark-200 dark:bg-dark-800 mx-1"></div>
                                    <button
                                        onClick={handleUndo}
                                        className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-xs text-dark-500 font-semibold cursor-pointer"
                                        title="Undo (Ctrl+Z)"
                                    >
                                        Undo
                                    </button>
                                    <button
                                        onClick={handleRedo}
                                        className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-800 text-xs text-dark-500 font-semibold cursor-pointer"
                                        title="Redo"
                                    >
                                        Redo
                                    </button>
                                </div>
                            </div>

                            <div className="flex-grow relative flex bg-dark-900 rounded-xl overflow-hidden border border-dark-950 font-mono">
                                {/* Simulated Line Numbers */}
                                <div className="w-10 bg-dark-950 text-right pr-2.5 pt-4 text-xs select-none text-dark-600 dark:text-dark-500 border-r border-dark-800/60 leading-relaxed overflow-hidden">
                                    {Array.from({ length: Math.max(50, latexCode.split('\n').length) }).map((_, i) => (
                                        <div key={i}>{i + 1}</div>
                                    ))}
                                </div>

                                <textarea
                                    className="flex-grow p-4 bg-dark-900 text-dark-200 outline-none resize-none leading-relaxed overflow-y-auto"
                                    style={{ fontSize: `${editorFontSize}px` }}
                                    value={latexCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    placeholder="Write your LaTeX resume source here..."
                                    spellCheck="false"
                                />
                            </div>

                            {/* Controls Footer */}
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-dark-200/50 dark:border-dark-800 gap-2 flex-wrap">
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-600 dark:text-dark-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                >
                                    Reset to Default
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-1.5 border border-dark-200 dark:border-dark-800 hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                    >
                                        Copy Code
                                    </button>
                                    <button
                                        onClick={handleDownloadTex}
                                        className="btn-primary text-xs py-1.5 px-4 cursor-pointer"
                                    >
                                        Download .tex
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Panel: LaTeX Live compiled Preview */}
                    <div className="lg:col-span-6 space-y-4">
                        <Card className="p-4 flex flex-col h-[750px]">
                            <div className="flex justify-between items-center pb-3 border-b border-dark-200/50 dark:border-dark-800 mb-3">
                                <span className="text-sm font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Interactive PDF Preview
                                </span>
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-1 border border-emerald-500/20 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                >
                                    Print / Save PDF
                                </button>
                            </div>

                            {/* A4 Proportionate Paper View Container */}
                            <div className="flex-grow bg-dark-100 dark:bg-dark-900/40 rounded-xl p-4 overflow-y-auto border border-dark-200/50 dark:border-dark-800 flex justify-center items-start">
                                <div
                                    ref={previewRef}
                                    className="bg-white text-dark-900 p-8 shadow-md border border-dark-200 rounded-sm w-[210mm] min-h-[297mm] scale-[0.68] md:scale-[0.85] lg:scale-[0.88] origin-top transition-all"
                                    style={{
                                        fontFamily: '"Times New Roman", Times, serif',
                                        fontSize: '11px',
                                        lineHeight: '1.4',
                                        color: '#111827'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: parseLatexToHtml(latexCode) }}
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Overleaf Instructions Guide */}
                <Card className="p-6 mt-8">
                    <h3 className="text-base font-bold text-dark-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Deploying your LaTeX Code to Overleaf
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-primary-500">STEP 1</span>
                            <h4 className="font-semibold text-dark-800 dark:text-dark-200 text-sm">Download or Copy Code</h4>
                            <p className="text-xs text-dark-500 dark:text-dark-400">Click <strong className="text-dark-700 dark:text-dark-300">"Download .tex"</strong> to save your resume source code locally, or copy the source code to your clipboard.</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-primary-500">STEP 2</span>
                            <h4 className="font-semibold text-dark-800 dark:text-dark-200 text-sm">Create Overleaf Project</h4>
                            <p className="text-xs text-dark-500 dark:text-dark-400">Go to <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">overleaf.com</a>, log in, click <strong className="text-dark-700 dark:text-dark-300">"New Project"</strong>, and choose <strong className="text-dark-700 dark:text-dark-300">"Blank Project"</strong>.</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-primary-500">STEP 3</span>
                            <h4 className="font-semibold text-dark-800 dark:text-dark-200 text-sm">Paste and Recompile</h4>
                            <p className="text-xs text-dark-500 dark:text-dark-400">Delete the default code in the editor, paste your copied code (or upload your downloaded file), and click <strong className="text-dark-700 dark:text-dark-300">"Recompile"</strong> to render the exact PDF!</p>
                        </div>
                    </div>
                </Card>
            </div>

            {confirmModal && (
                <div className="fixed inset-0 z-[100] bg-dark-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
                        {/* Background design glow */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                        {/* Warning Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/25 animate-bounce-slow">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">{confirmModal.title}</h3>
                        <p className="text-xs text-dark-550 dark:text-dark-400 mb-6 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        
                        <div className="flex gap-3">
                            {confirmModal.type === 'alert' ? (
                                <button 
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-primary-500/10 transition-colors"
                                >
                                    OK
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setConfirmModal(null)}
                                        className="flex-1 py-3 rounded-xl border border-dark-200 dark:border-dark-850 hover:bg-dark-50 dark:hover:bg-dark-800 text-dark-700 dark:text-dark-300 text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirmModal.onConfirm) confirmModal.onConfirm();
                                            setConfirmModal(null);
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-amber-500/10 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LatexResume;
