/**
 * server.js — Entry point for the Expert Session Booking API
 *
 * Boot order:
 *  1. Load env vars
 *  2. Connect to MongoDB
 *  3. Create Express app + HTTP server
 *  4. Initialise Socket.io
 *  5. Register middlewares
 *  6. Mount route placeholders
 *  7. Register global error handler
 *  8. Start listening
 */

require('dotenv').config(); // Load .env before anything else

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const errorHandler = require('./src/middlewares/errorHandler');
const ApiError = require('./src/utils/ApiError');

// ── Routers ───────────────────────────────────────────────────────────────────
const expertRoutes = require('./src/routes/expertRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

// ── Bootstrap function ────────────────────────────────────────────────────────
const bootstrap = async () => {
  // 1. Connect to MongoDB (with retry)
  await connectDB();

  // 2. Create Express app
  const app = express();

  // 3. Security & utility middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  const clientOrigins = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',') 
    : ['http://localhost:5173', 'http://localhost:5174'];

  app.use(
    cors({
      origin: clientOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // HTTP request logger — 'dev' format in development, 'combined' in production
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Parse incoming JSON bodies (limit 10kb to prevent large payload attacks)
  app.use(express.json({ limit: '10kb' }));

  // Parse URL-encoded bodies (for form submissions)
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 4. Health check (no auth required — useful for load balancer probes)
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // 5. Mount API routes
  app.use('/api/experts', expertRoutes);
  app.use('/api/bookings', bookingRoutes);

  // 6. Catch-all for unknown routes (must come after all real routes)
  app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
  });

  // 7. Global error handler (must be last middleware, 4 params)
  app.use(errorHandler);

  // 8. Create HTTP server and attach Socket.io
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  // 9. Start listening
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API base:     http://localhost:${PORT}/api`);
  });
};

// ── Unhandled rejection / exception guards ────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  // Allow server to finish handling in-flight requests before exiting
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

// ── Run ───────────────────────────────────────────────────────────────────────
bootstrap();
