const { Server } = require('socket.io');

/** @type {Server | null} */
let io = null;

/**
 * Initialises Socket.io and attaches it to the HTTP server.
 * Call this once in server.js after the HTTP server is created.
 *
 * @param {import('http').Server} httpServer - The Node HTTP server instance
 * @returns {Server} The Socket.io server instance
 */
const initSocket = (httpServer) => {
  const clientOrigins = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',') 
    : ['http://localhost:5173', 'http://localhost:5174'];

  io = new Server(httpServer, {
    cors: {
      origin: clientOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Allow websocket + long-polling fallback
    transports: ['websocket', 'polling'],
    // Ping settings to detect dead connections
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins a room by bookingId to receive targeted updates
    socket.on('join:booking', (bookingId) => {
      socket.join(`booking:${bookingId}`);
      console.log(`📌 Socket ${socket.id} joined room booking:${bookingId}`);
    });

    // Client joins an expert room to watch slot availability
    socket.on('join:expert', (expertId) => {
      socket.join(`expert:${expertId}`);
      console.log(`📌 Socket ${socket.id} joined room expert:${expertId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} — reason: ${reason}`);
    });
  });

  console.log('✅ Socket.io initialised');
  return io;
};

/**
 * Returns the Socket.io server instance.
 * Throws if initSocket() has not been called yet.
 *
 * @returns {Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialised. Call initSocket(server) first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
