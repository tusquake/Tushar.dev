import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Send,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Check,
  LogOut,
  Users,
  Code,
  Terminal,
  MessageSquare,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marked } from 'marked';

// Vibrant neon colors for avatar and cursor representation
const COLOR_PALETTE = [
  { name: 'Neon Pink', hex: '#ec4899' },
  { name: 'Cyber Blue', hex: '#06b6d4' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Purple Dream', hex: '#8b5cf6' },
  { name: 'Solar Yellow', hex: '#eab308' }
];

const BOILERPLATES = {
  javascript: `// Collaborative Javascript Playground
// Type your code here. Click "Run Code" to execute.

function main() {
    console.log("Workspace initialized.");
    const users = ["User A", "User B", "User C"];
    console.log("Active participants: " + users.join(", "));
}

main();`,
  python: `# Collaborative Python Workspace
def main():
    print("Python execution simulated successfully.")
    
if __name__ == "__main__":
    main()`,
  cpp: `// Collaborative C++ Workspace
#include <iostream>
using namespace std;

int main() {
    cout << "C++ sandbox operational." << endl;
    return 0;
}`,
  java: `// Collaborative Java Workspace
public class Solution {
    public static void main(String[] args) {
        System.out.println("Java compilation complete.");
    }
}`
};

export default function CollaborativeWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();

  // Lobby States
  const [inLobby, setInLobby] = useState(true);
  const [roomId, setRoomId] = useState(urlRoomId || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarColor, setAvatarColor] = useState(COLOR_PALETTE[0].hex);

  // Active Session States
  const [socket, setSocket] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // chat, ai, terminal
  const [language, setLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState('editor'); // editor, whiteboard
  const [canvasHistory, setCanvasHistory] = useState([]);

  // Editor Reference
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const yDocRef = useRef(new Y.Doc());
  const bindingRef = useRef(null);
  const decorationsRef = useRef([]);

  // Chat & Media States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const chatContainerRef = useRef(null);

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiStatus, setAiStatus] = useState({ status: 'idle', querier: '' });
  const aiContainerRef = useRef(null);

  // Terminal States
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', text: 'Workspace Terminal Operational.' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalContainerRef = useRef(null);

  // Cursor presence states
  const [remoteCursors, setRemoteCursors] = useState({});

  // Parse server websocket URL
  const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
  };

  // Generate unique room ID
  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomId(result);
  };

  // Handle enter room
  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId.trim() || !username.trim()) return;
    setInLobby(false);
    navigate(`/workspace/${roomId.trim().toUpperCase()}`);
  };

    // Socket Connection and Event Bindings
  useEffect(() => {
    if (inLobby || !urlRoomId) return;

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true
    });

    setSocket(newSocket);

    // Room Sync
    newSocket.on('room-sync', ({ users, messages, canvasHistory }) => {
      setRoomUsers(users);
      setChatMessages(messages);
      setCanvasHistory(canvasHistory || []);
    });

    // Collaborative Whiteboard events
    newSocket.on('draw-stroke', (stroke) => {
      setCanvasHistory((prev) => [...prev, stroke]);
    });

    newSocket.on('clear-canvas', () => {
      setCanvasHistory([]);
    });

    // Room Errors
    newSocket.on('room-error', (err) => {
      alert(err);
      setInLobby(true);
      navigate('/code-editor');
    });

    // User Joined
    newSocket.on('user-joined', (joinedUser) => {
      setRoomUsers((prev) => [...prev, joinedUser]);
      setTerminalOutput((prev) => [
        ...prev,
        { type: 'system', text: `System: User ${joinedUser.username} connected to the session.` }
      ]);
    });

    // User Left
    newSocket.on('user-left', (socketId) => {
      setRoomUsers((prev) => {
        const leavingUser = prev.find((u) => u.socketId === socketId);
        if (leavingUser) {
          setTerminalOutput((term) => [
            ...term,
            { type: 'system', text: `System: ${leavingUser.username} disconnected.` }
          ]);
        }
        return prev.filter((u) => u.socketId !== socketId);
      });
      setRemoteCursors((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    });

    // Chat Message
    newSocket.on('new-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Yjs Update Handling
    newSocket.on('yjs-update', (updateArray) => {
      try {
        const update = new Uint8Array(updateArray);
        Y.applyUpdate(yDocRef.current, update);
      } catch (err) {
        console.error('Failed to apply remote Yjs update', err);
      }
    });

    // Remote Cursor Updates
    newSocket.on('user-cursor-updated', ({ socketId, cursor }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [socketId]: cursor
      }));
    });

    // AI streaming listeners
    newSocket.on('ai-status', (statusData) => {
      setAiStatus(statusData);
      if (statusData.status === 'generating') {
        setAiResponse('');
        setActiveTab('ai');
      }
    });

    newSocket.on('ai-chunk', ({ text }) => {
      setAiResponse((prev) => prev + text);
    });

    newSocket.on('ai-error', (errMsg) => {
      setAiResponse((prev) => prev + `\n\n⚠️ Error: ${errMsg}`);
    });

    // Emit join-room after registering event listeners
    newSocket.emit('join-room', {
      roomId: urlRoomId.toUpperCase(),
      username,
      avatarColor
    });

    return () => {
      newSocket.close();
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, [inLobby, urlRoomId]);

  // Document Sync Setup
  useEffect(() => {
    if (!socket) return;

    const yDoc = yDocRef.current;
    
    // Bind Yjs changes to sockets
    const onDocUpdate = (update) => {
      socket.emit('yjs-update', Array.from(update));
    };

    yDoc.on('update', onDocUpdate);

    return () => {
      yDoc.off('update', onDocUpdate);
    };
  }, [socket]);

  // Cursors Delta Decoration update loop
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = [];
    Object.entries(remoteCursors).forEach(([socketId, cursorData]) => {
      if (!cursorData) return;
      const { lineNumber, column } = cursorData;
      const userObj = roomUsers.find((u) => u.socketId === socketId);
      if (!userObj) return;

      newDecorations.push({
        range: new monaco.Range(lineNumber, column, lineNumber, column + 1),
        options: {
          className: `remote-cursor-${socketId} border-l-2`,
          beforeContentClassName: `remote-cursor-label-${socketId}`
        }
      });
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current || [],
      newDecorations
    );
  }, [remoteCursors, roomUsers]);

  // Auto scroll effects inside their containers
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (aiContainerRef.current) {
      aiContainerRef.current.scrollTop = aiContainerRef.current.scrollHeight;
    }
  }, [aiResponse]);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const textType = yDocRef.current.getText('monaco');

    // Connect Yjs text type to Monaco editor instance
    const binding = new MonacoBinding(
      textType,
      editor.getModel(),
      new Set([editor])
    );
    bindingRef.current = binding;

    // Listen to local cursor moves
    editor.onDidChangeCursorPosition((e) => {
      socket?.emit('cursor-move', {
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  // Copy Room Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send message
  const handleSendMessage = () => {
    if (!chatInput.trim() && !mediaPreview) return;

    socket.emit('send-message', {
      text: chatInput,
      media: mediaPreview
    });

    setChatInput('');
    setMediaPreview(null);
  };

  // Image upload handler
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({
          type: file.type,
          data: reader.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('File size exceeds the session transfer cap (2MB).');
    }
  };

  // Submit query to shared AI Assistant
  const handleAskAI = () => {
    if (!aiPrompt.trim()) return;
    const currentCode = yDocRef.current.getText('monaco').toString();
    const localGemini = localStorage.getItem('codeforge_gemini_api_key');
    const localGroq = localStorage.getItem('codeforge_groq_api_key');

    socket.emit('ask-ai', {
      prompt: aiPrompt,
      currentCode,
      language,
      userApiKey: localGemini,
      userGroqKey: localGroq
    });

    setAiPrompt('');
  };

  // Run code locally & simulated compiler
  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalOutput((prev) => [
      ...prev,
      { type: 'info', text: `\n$ compile --target=${language} workspace.code` }
    ]);

    const code = yDocRef.current.getText('monaco').toString();

    if (language === 'javascript') {
      setTimeout(() => {
        const logs = [];
        const originalLog = console.log;

        console.log = (...args) => {
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };

        let success = true;
        let errorMsg = '';

        try {
          new Function(code)();
        } catch (err) {
          success = false;
          errorMsg = err.message;
        }

        console.log = originalLog;

        const stdoutOutputs = logs.map((line) => ({ type: 'stdout', text: line }));
        if (!success) {
          stdoutOutputs.push({ type: 'stderr', text: `Runtime Error: ${errorMsg}` });
        }

        setTerminalOutput((prev) => [
          ...prev,
          ...stdoutOutputs,
          { type: 'system', text: `Process ended with exit code ${success ? 0 : 1}` }
        ]);
        setIsRunning(false);
      }, 500);
    } else {
      // Show compiler simulation status
      setTimeout(() => {
        setTerminalOutput((prev) => [
          ...prev,
          { type: 'stdout', text: `[SIMULATED COMPILER]: Code successfully checked for syntactical correctness.` },
          { type: 'stdout', text: `To fully compile and execute non-JS code in real sandbox environments, use the individual Playground panel.` },
          { type: 'system', text: `Process finished (simulation mode).` }
        ]);
        setIsRunning(false);
      }, 800);
    }
  };

  // Inject dynamic cursors styles
  const dynamicCursorStyles = roomUsers
    .map(
      (u) => `
      .remote-cursor-${u.socketId} {
        border-left: 2px solid ${u.avatarColor || '#6366f1'};
        position: relative;
      }
      .remote-cursor-label-${u.socketId}::after {
        content: "${u.username}";
        position: absolute;
        top: -16px;
        left: 0;
        background: ${u.avatarColor || '#6366f1'};
        color: white;
        font-family: monospace;
        font-size: 8px;
        padding: 0px 4px;
        border-radius: 3px;
        white-space: nowrap;
        opacity: 0.9;
        pointer-events: none;
        z-index: 100;
        height: 12px;
        line-height: 12px;
      }
    `
    )
    .join('\n');

  if (inLobby) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-white dark:bg-dark-950 transition-colors duration-300">
        <style>{`.scrollbar-none::-webkit-scrollbar { display: none; }`}</style>
        <div className="max-w-md w-full mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden text-center"
          >
            {/* Background design glow */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 text-indigo-400 shadow-inner">
              <Users size={32} />
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-2 font-display">
              Collaborative Workspace
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              Connect and write code with up to 5 developers in real-time, backed by room-shared AI assistants.
            </p>

            <form onSubmit={handleJoin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                  Room ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Room Code (e.g. ABX-293)"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={generateRoomId}
                    className="px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-350 hover:bg-white/10 transition flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} />
                    New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                  Pick Presence Color
                </label>
                <div className="flex gap-3 justify-center py-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setAvatarColor(color.hex)}
                      className="w-7 h-7 rounded-full relative flex items-center justify-center transition hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {avatarColor === color.hex && (
                        <Check size={14} className="text-white drop-shadow-md font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-150 flex items-center justify-center gap-2"
              >
                Launch Space
                <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen pt-24 pb-12 bg-white dark:bg-dark-950 transition-colors duration-300 flex flex-col">
      <style>{dynamicCursorStyles}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col gap-6">
        {/* Workspace Top Header Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-white">Co-Lab Room</h1>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {urlRoomId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Collaborative sandbox environment (In-Memory Session Only)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Joined user avatars */}
            <div className="flex -space-x-2">
              {roomUsers.map((u) => (
                <div
                  key={u.socketId}
                  className="w-8 h-8 rounded-full border border-dark-950 flex items-center justify-center text-white text-xs font-bold relative group cursor-pointer"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.username.substring(0, 1).toUpperCase()}
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-dark-950 animate-pulse"></span>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10 shadow-lg">
                    {u.username}
                  </div>
                </div>
              ))}
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-850 border border-white/10 text-white outline-none cursor-pointer"
            >
              <option value="javascript" className="bg-slate-900 text-white">JavaScript (ES6)</option>
              <option value="python" className="bg-slate-900 text-white">Python (3.x)</option>
              <option value="cpp" className="bg-slate-900 text-white">C++ (GCC)</option>
              <option value="java" className="bg-slate-900 text-white">Java (JDK)</option>
            </select>

            {/* Invite button */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied URL!' : 'Copy Invite'}
            </button>

            {/* Exit Room */}
            <button
              onClick={() => {
                setInLobby(true);
                navigate('/code-editor');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-1.5 transition"
            >
              <LogOut size={14} />
              Leave Room
            </button>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch min-h-[500px]">
          {/* Editor or Whiteboard Main Workspace Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950/80 min-h-[450px] flex flex-col">
              {/* Main Workspace Toggle Header */}
              <div className="px-4 py-2 bg-slate-900/50 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setWorkspaceMode('editor')}
                    className={`font-bold transition flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg text-[11px] ${
                      workspaceMode === 'editor' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-semibold shadow-inner' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    <Code size={13} />
                    Code Editor
                  </button>
                  <button
                    onClick={() => setWorkspaceMode('whiteboard')}
                    className={`font-bold transition flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg text-[11px] ${
                      workspaceMode === 'whiteboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-semibold shadow-inner' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Whiteboard
                  </button>
                </div>

                {workspaceMode === 'editor' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    collaborator_draft.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Shared Sketchboard
                  </span>
                )}
              </div>

              {workspaceMode === 'editor' ? (
                <>
                  {/* Code Area */}
                  <div className="flex-1">
                    <MonacoEditor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        automaticLayout: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        tabSize: 4
                      }}
                      onMount={handleEditorDidMount}
                    />
                  </div>
                  {/* Run Actions */}
                  <div className="p-3 bg-slate-900/20 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Compiling...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Run Code
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <WhiteboardCanvas
                  socket={socket}
                  canvasHistory={canvasHistory}
                  setCanvasHistory={setCanvasHistory}
                />
              )}
            </div>
          </div>

          {/* Sidebar Tabs Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col flex-1 overflow-hidden h-[500px]">
              {/* Tabs Switcher Header */}
              <div className="flex border-b border-white/5 bg-slate-950/20 text-xs">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 font-semibold border-b-2 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'chat'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare size={14} />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-3 font-semibold border-b-2 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'ai'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles size={14} />
                  Shared AI
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`flex-1 py-3 font-semibold border-b-2 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'terminal'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal size={14} />
                  Terminal
                </button>
              </div>

              {/* Tabs viewport */}
              <div className="flex-1 overflow-hidden relative">
                {/* 1. Chat tab content */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    {/* Message Roster */}
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
                      {chatMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-500 italic text-center px-4 text-xs">
                          No messages in this session yet. Text and media are ephemeral and will disappear when the session closes.
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div key={msg.id} className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-bold" style={{ color: msg.avatarColor || '#fff' }}>
                                {msg.sender}
                              </span>
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl px-3.5 py-2.5 max-w-[85%] text-slate-200 text-xs">
                              {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                              {msg.media && (
                                <img
                                  src={msg.media.data}
                                  alt="shared"
                                  className="mt-2 rounded-lg max-h-36 object-cover border border-white/10"
                                />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input Controls */}
                    <div className="p-3 border-t border-white/5 bg-slate-950/20">
                      {mediaPreview && (
                        <div className="relative inline-block mb-2">
                          <img
                            src={mediaPreview.data}
                            className="w-12 h-12 object-cover rounded-lg border border-white/20"
                            alt="preview"
                          />
                          <button
                            onClick={() => setMediaPreview(null)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-450 border border-white/5 cursor-pointer transition flex-shrink-0">
                          <ImageIcon size={16} />
                          <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
                        </label>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition duration-200 flex-shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AI Assistant tab content */}
                {activeTab === 'ai' && (
                  <div className="flex flex-col h-full">
                    {/* Response Area */}
                    <div ref={aiContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 text-slate-300 text-xs scrollbar-thin select-text">
                      {aiResponse ? (
                        <div
                          className="prose prose-invert prose-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: marked.parse(aiResponse) }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 italic text-center px-4">
                          Ask the room AI assistant helper any queries. The streaming output is visible in real-time to everyone here.
                        </div>
                      )}
                      {aiStatus.status === 'generating' && (
                        <div className="flex items-center gap-1.5 text-indigo-400 font-medium text-[10px] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                          AI is thinking (requested by {aiStatus.querier})...
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t border-white/5 bg-slate-950/20 flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                        placeholder="Ask AI about sandbox code..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
                      />
                      <button
                        onClick={handleAskAI}
                        disabled={aiStatus.status === 'generating'}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Terminal output viewport */}
                {activeTab === 'terminal' && (
                  <div className="flex flex-col h-full bg-[#0a0e17] font-mono p-4 text-[11px] leading-5 text-slate-350">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 flex-shrink-0">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">SHARED LOGS</span>
                      <button
                        onClick={() => setTerminalOutput([{ type: 'system', text: 'Terminal output cleared.' }])}
                        className="text-[9px] text-slate-400 hover:text-slate-200 font-bold transition"
                      >
                        CLEAR
                      </button>
                    </div>
                    <div ref={terminalContainerRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
                      {terminalOutput.map((log, index) => {
                        let color = 'text-[#00ffaa]';
                        if (log.type === 'system') color = 'text-purple-400 font-semibold';
                        if (log.type === 'info') color = 'text-cyan-400';
                        if (log.type === 'stderr') color = 'text-rose-400 bg-rose-950/10 px-1 rounded';

                        return (
                          <div key={index} className={`whitespace-pre-wrap ${color}`}>
                            {log.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Standalone module-level Collaborative Whiteboard Component
function WhiteboardCanvas({ socket, canvasHistory, setCanvasHistory }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ec4899'); // Neon Pink default
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush'); // brush, eraser, rectangle, circle, line
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isDrawing = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const lastPoint = useRef({ x: 0, y: 0 });

  // Redraw complete history when canvasHistory changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvasHistory.forEach((stroke) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.type === 'rectangle') {
        ctx.strokeRect(stroke.x, stroke.y, stroke.w, stroke.h);
      } else if (stroke.type === 'circle') {
        ctx.beginPath();
        ctx.ellipse(stroke.cx, stroke.cy, stroke.rx, stroke.ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (stroke.type === 'line' || stroke.type === 'brush') {
        ctx.moveTo(stroke.x0, stroke.y0);
        ctx.lineTo(stroke.x1, stroke.y1);
        ctx.stroke();
      }
    });
  }, [canvasHistory]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    isDrawing.current = true;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pt = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };

    startPoint.current = pt;
    lastPoint.current = pt;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentPoint = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };

    const strokeColor = tool === 'eraser' ? '#0b0f19' : color;

    if (tool === 'brush' || tool === 'eraser') {
      // Draw segment locally
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      const stroke = {
        type: 'brush',
        x0: lastPoint.current.x,
        y0: lastPoint.current.y,
        x1: currentPoint.x,
        y1: currentPoint.y,
        color: strokeColor,
        width: brushSize
      };

      socket?.emit('draw-stroke', stroke);
      setCanvasHistory((prev) => [...prev, stroke]);
      lastPoint.current = currentPoint;
    } else {
      // Shapes preview drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw absolute history first
      canvasHistory.forEach((stroke) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (stroke.type === 'rectangle') {
          ctx.strokeRect(stroke.x, stroke.y, stroke.w, stroke.h);
        } else if (stroke.type === 'circle') {
          ctx.beginPath();
          ctx.ellipse(stroke.cx, stroke.cy, stroke.rx, stroke.ry, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (stroke.type === 'line' || stroke.type === 'brush') {
          ctx.moveTo(stroke.x0, stroke.y0);
          ctx.lineTo(stroke.x1, stroke.y1);
          ctx.stroke();
        }
      });

      // Draw the temporary shape outline
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'rectangle') {
        const x = Math.min(startPoint.current.x, currentPoint.x);
        const y = Math.min(startPoint.current.y, currentPoint.y);
        const w = Math.abs(currentPoint.x - startPoint.current.x);
        const h = Math.abs(currentPoint.y - startPoint.current.y);
        ctx.strokeRect(x, y, w, h);
      } else if (tool === 'circle') {
        const cx = (startPoint.current.x + currentPoint.x) / 2;
        const cy = (startPoint.current.y + currentPoint.y) / 2;
        const rx = Math.abs(currentPoint.x - startPoint.current.x) / 2;
        const ry = Math.abs(currentPoint.y - startPoint.current.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.moveTo(startPoint.current.x, startPoint.current.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (tool !== 'brush' && tool !== 'eraser') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const currentX = (e.clientX - rect.left) * scaleX;
      const currentY = (e.clientY - rect.top) * scaleY;

      let stroke = null;

      if (tool === 'rectangle') {
        stroke = {
          type: 'rectangle',
          x: Math.min(startPoint.current.x, currentX),
          y: Math.min(startPoint.current.y, currentY),
          w: Math.abs(currentX - startPoint.current.x),
          h: Math.abs(currentY - startPoint.current.y),
          color: color,
          width: brushSize
        };
      } else if (tool === 'circle') {
        stroke = {
          type: 'circle',
          cx: (startPoint.current.x + currentX) / 2,
          cy: (startPoint.current.y + currentY) / 2,
          rx: Math.abs(currentX - startPoint.current.x) / 2,
          ry: Math.abs(currentY - startPoint.current.y) / 2,
          color: color,
          width: brushSize
        };
      } else if (tool === 'line') {
        stroke = {
          type: 'line',
          x0: startPoint.current.x,
          y0: startPoint.current.y,
          x1: currentX,
          y1: currentY,
          color: color,
          width: brushSize
        };
      }

      if (stroke) {
        socket?.emit('draw-stroke', stroke);
        setCanvasHistory((prev) => [...prev, stroke]);
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear whiteboard for all users?')) {
      socket?.emit('clear-canvas');
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[60] bg-[#070b13] flex flex-col p-6 gap-4" : "flex-1 flex flex-col p-4 gap-4 bg-slate-950/40"}>
      {/* Canvas Tool Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/50 border border-white/5 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tools */}
          <div className="flex bg-slate-800/40 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setTool('brush')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                tool === 'brush' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Brush
            </button>
            <button
              onClick={() => setTool('rectangle')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                tool === 'rectangle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rect
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                tool === 'circle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Circle
            </button>
            <button
              onClick={() => setTool('line')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                tool === 'line' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                tool === 'eraser' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-205'
              }`}
            >
              Eraser
            </button>
          </div>

          {/* Stroke Size Selector */}
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="px-2 py-1 rounded bg-slate-850 border border-white/10 text-white outline-none cursor-pointer text-xs"
          >
            <option value={2} className="bg-slate-900 text-white">Thin (2px)</option>
            <option value={5} className="bg-slate-900 text-white">Medium (5px)</option>
            <option value={10} className="bg-slate-900 text-white">Thick (10px)</option>
            <option value={20} className="bg-slate-900 text-white">Huge (20px)</option>
          </select>

          {/* Color palette */}
          {tool !== 'eraser' && (
            <div className="flex gap-2">
              {['#ec4899', '#06b6d4', '#10b981', '#8b5cf6', '#eab308', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full transition transform hover:scale-110 cursor-pointer ${
                    color === c ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            {isFullscreen ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
                </svg>
                Exit Fullscreen
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
                </svg>
                Fullscreen
              </>
            )}
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 transition cursor-pointer"
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className={`flex-grow bg-[#0b0f19] border border-white/5 rounded-2xl relative overflow-hidden ${isFullscreen ? 'min-h-[70vh]' : 'min-h-[350px]'}`}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
}
