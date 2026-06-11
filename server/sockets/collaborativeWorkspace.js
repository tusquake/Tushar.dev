const { GoogleGenerativeAI } = require('@google/generative-ai');
const Y = require('yjs');

const DEFAULT_BOILERPLATE = `// Collaborative Javascript Playground
// Type your code here. Click "Run Code" to execute.

function main() {
    console.log("Workspace initialized.");
    const users = ["User A", "User B", "User C"];
    console.log("Active participants: " + users.join(", "));
}

main();`;

// In-memory workspace session storage
// Structure: RoomID -> { users: Map, messages: Array, yDoc: Y.Doc, cleanupTimer: Timeout }
const workspaces = new Map();

// Capped settings
const MAX_USERS_PER_ROOM = 5;
const MAX_MESSAGE_HISTORY = 50;
const ROOM_CLEANUP_DELAY_MS = 5 * 60 * 1000; // 5 minutes

function initCollaborativeWorkspace(io) {
  io.on('connection', (socket) => {
    console.log(`Collaborative workspace socket connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, username, avatarColor }) => {
      let workspace = workspaces.get(roomId);

      if (!workspace) {
        const yDoc = new Y.Doc();
        const text = yDoc.getText('monaco');
        text.insert(0, DEFAULT_BOILERPLATE);

        workspace = {
          users: new Map(),
          messages: [],
          yDoc,
          canvasHistory: [],
          cleanupTimer: null
        };
        workspaces.set(roomId, workspace);
      }

      if (workspace.cleanupTimer) {
        clearTimeout(workspace.cleanupTimer);
        workspace.cleanupTimer = null;
        console.log(`Cancelled cleanup timer for room: ${roomId}`);
      }

      if (workspace.users.size >= MAX_USERS_PER_ROOM) {
        socket.emit('room-error', 'Room is full (Maximum 5 users).');
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.avatarColor = avatarColor;

      workspace.users.set(socket.id, {
        socketId: socket.id,
        username,
        avatarColor,
        cursor: null
      });

      // Synchronize Yjs document state with the newly joined user
      const stateVector = Y.encodeStateAsUpdate(workspace.yDoc);
      socket.emit('yjs-update', Array.from(stateVector));

      // Synchronize users list, messages history, and canvas history
      socket.emit('room-sync', {
        users: Array.from(workspace.users.values()),
        messages: workspace.messages,
        canvasHistory: workspace.canvasHistory || []
      });

      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        username,
        avatarColor
      });
    });

    // Yjs collaboration document sync
    socket.on('yjs-update', (updateArray) => {
      const { roomId } = socket;
      if (!roomId) return;

      const workspace = workspaces.get(roomId);
      if (workspace && workspace.yDoc) {
        try {
          const update = new Uint8Array(updateArray);
          Y.applyUpdate(workspace.yDoc, update);
          // Broadcast to other users in the room
          socket.to(roomId).emit('yjs-update', updateArray);
        } catch (err) {
          console.error(`Yjs update error in room ${roomId}:`, err);
        }
      }
    });

    // Cursor position updates
    socket.on('cursor-move', (cursor) => {
      const { roomId } = socket;
      if (!roomId) return;

      const workspace = workspaces.get(roomId);
      if (workspace) {
        const user = workspace.users.get(socket.id);
        if (user) {
          user.cursor = cursor;
          socket.to(roomId).emit('user-cursor-updated', {
            socketId: socket.id,
            cursor
          });
        }
      }
    });

    // Ephemeral session chat messages (includes media)
    socket.on('send-message', ({ text, media }) => {
      const { roomId } = socket;
      if (!roomId) return;

      const workspace = workspaces.get(roomId);
      if (!workspace) return;

      const messageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: socket.username,
        avatarColor: socket.avatarColor,
        text: text || '',
        media: media || null, // media format: { type: 'image/png', data: 'data:image/png;base64,...' }
        timestamp: new Date().toISOString()
      };

      workspace.messages.push(messageObj);
      if (workspace.messages.length > MAX_MESSAGE_HISTORY) {
        workspace.messages.shift();
      }

      io.to(roomId).emit('new-message', messageObj);
    });

    // Live shared AI assistant stream
    socket.on('ask-ai', async ({ prompt, currentCode, language, userApiKey, userGroqKey }) => {
      const { roomId } = socket;
      if (!roomId) return;

      const workspace = workspaces.get(roomId);
      if (!workspace) return;

      // Broadcast generating state
      io.to(roomId).emit('ai-status', { status: 'generating', querier: socket.username });

      const fullPrompt = `
You are an expert AI pair programming partner assisting a collaborative group of developers.
The current programming language is: ${language}.
The current code written in the workspace editor:
\`\`\`${language}
${currentCode}
\`\`\`

User Question: "${prompt}"

Provide a concise, expert answer. If correcting code, explain the bug briefly and provide clean code blocks.
`;

      const geminiApiKey = process.env.GEMINI_API_KEY || userApiKey;
      const groqApiKey = process.env.GROQ_API_KEY || userGroqKey;

      let success = false;
      let lastError = null;

      // 1. Try Gemini first
      if (geminiApiKey) {
        try {
          console.log(`[Workspace ${roomId}] Attempting Gemini stream query...`);
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await model.generateContentStream(fullPrompt);

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              io.to(roomId).emit('ai-chunk', { text: chunkText });
            }
          }
          success = true;
        } catch (geminiError) {
          console.warn(`Gemini stream failed for room ${roomId}. Trying Groq fallback...`, geminiError);
          lastError = geminiError;
        }
      }

      // 2. Try Groq fallback
      if (!success && groqApiKey) {
        try {
          console.log(`[Workspace ${roomId}] Attempting Groq stream fallback...`);
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: fullPrompt }],
              temperature: 0.15,
              stream: true
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API returned status ${response.status}: ${errText}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let done = false;
          let buffer = '';

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              buffer += decoder.decode(value, { stream: !done });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const cleanLine = line.trim();
                if (cleanLine === 'data: [DONE]') continue;
                if (cleanLine.startsWith('data: ')) {
                  try {
                    const json = JSON.parse(cleanLine.substring(6));
                    const text = json.choices?.[0]?.delta?.content;
                    if (text) {
                      io.to(roomId).emit('ai-chunk', { text });
                    }
                  } catch (e) {
                    // Ignore parse errors on incomplete chunks
                  }
                }
              }
            }
          }
          success = true;
        } catch (groqError) {
          console.error(`Groq fallback stream failed for room ${roomId}:`, groqError);
          lastError = groqError;
        }
      }

      if (success) {
        io.to(roomId).emit('ai-status', { status: 'idle' });
      } else {
        const errMsg = lastError?.message || 'No Gemini or Groq API Keys configured for this workspace.';
        io.to(roomId).emit('ai-error', errMsg);
        io.to(roomId).emit('ai-status', { status: 'idle' });
      }
    });

    // Collaborative Whiteboard draw event
    socket.on('draw-stroke', (stroke) => {
      const { roomId } = socket;
      if (!roomId) return;
      const workspace = workspaces.get(roomId);
      if (workspace) {
        workspace.canvasHistory = workspace.canvasHistory || [];
        workspace.canvasHistory.push(stroke);
        if (workspace.canvasHistory.length > 2000) {
          workspace.canvasHistory.shift();
        }
        socket.to(roomId).emit('draw-stroke', stroke);
      }
    });

    // Collaborative Whiteboard clear event
    socket.on('clear-canvas', () => {
      const { roomId } = socket;
      if (!roomId) return;
      const workspace = workspaces.get(roomId);
      if (workspace) {
        workspace.canvasHistory = [];
        io.to(roomId).emit('clear-canvas');
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const { roomId } = socket;
      if (!roomId) return;

      const workspace = workspaces.get(roomId);
      if (!workspace) return;

      workspace.users.delete(socket.id);
      io.to(roomId).emit('user-left', socket.id);

      // If room is empty, trigger cleanup grace period
      if (workspace.users.size === 0) {
        workspace.cleanupTimer = setTimeout(() => {
          workspaces.delete(roomId);
          console.log(`🧹 Room ${roomId} has been deleted from memory (empty and inactive).`);
        }, ROOM_CLEANUP_DELAY_MS);
      }
    });
  });
}

module.exports = initCollaborativeWorkspace;
