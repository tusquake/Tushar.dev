const { GoogleGenerativeAI } = require('@google/generative-ai');
const Y = require('yjs');

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
        workspace = {
          users: new Map(),
          messages: [],
          yDoc: new Y.Doc(),
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

      // Synchronize users list and messages history
      socket.emit('room-sync', {
        users: Array.from(workspace.users.values()),
        messages: workspace.messages
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
    socket.on('ask-ai', async ({ prompt, currentCode, language, userApiKey }) => {
      const { roomId } = socket;
      if (!roomId) return;

      const workspace = workspaces.get(roomId);
      if (!workspace) return;

      // Broadcast generating state
      io.to(roomId).emit('ai-status', { status: 'generating', querier: socket.username });

      try {
        const apiKey = process.env.GEMINI_API_KEY || userApiKey;
        if (!apiKey) {
          throw new Error('No API key provided. Please configure a Gemini API Key in Settings or set GEMINI_API_KEY env.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

        const result = await model.generateContentStream(fullPrompt);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            io.to(roomId).emit('ai-chunk', { text: chunkText });
          }
        }

        io.to(roomId).emit('ai-status', { status: 'idle' });
      } catch (error) {
        console.error('Gemini Stream Error:', error);
        io.to(roomId).emit('ai-error', error.message || 'AI could not compile a response.');
        io.to(roomId).emit('ai-status', { status: 'idle' });
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
