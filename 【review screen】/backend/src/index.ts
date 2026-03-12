/**
 * Backend Entry Point
 */

import express from 'express';
import { config } from './config/settings';
import { log } from './utils/logger';
import apiRoutes from './api/routes';
import { getScheduler } from './core/scheduler';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Screen Tracker Backend',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handler
app.use((err: any, req, res, next) => {
  log.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(config.port, () => {
  log.info(`Screen Tracker Backend started on port ${config.port}`);
  log.info(`Environment: ${config.nodeEnv}`);
  log.info(`Database: ${config.dbPath}`);
  log.info(`Data directory: ${config.dataDir}`);

  // Initialize scheduler
  try {
    getScheduler();
    log.info('Screenshot scheduler initialized');
  } catch (error) {
    log.error('Failed to initialize scheduler', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    log.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    log.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection', reason);
});

export default app;
