/**
 * Logging Utility
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { config } from '../config/settings';

// Ensure log directory exists
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }),

  // File transport - all logs
  new DailyRotateFile({
    filename: path.join(config.logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat,
  }),

  // File transport - error logs only
  new DailyRotateFile({
    filename: path.join(config.logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat,
  }),
];

// Create logger
export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Convenience methods
export const log = {
  info: (message: string, meta?: any): void => {
    logger.info(message, meta);
  },

  error: (message: string, error?: Error | any): void => {
    logger.error(message, error);
  },

  warn: (message: string, meta?: any): void => {
    logger.warn(message, meta);
  },

  debug: (message: string, meta?: any): void => {
    logger.debug(message, meta);
  },

  verbose: (message: string, meta?: any): void => {
    logger.verbose(message, meta);
  },
};

// Add screenshot-specific logging
export const screenshotLog = {
  captured: (id: string, metadata?: any): void => {
    log.info(`Screenshot captured: ${id}`, metadata);
  },

  saved: (id: string, filePath: string): void => {
    log.debug(`Screenshot saved: ${id} -> ${filePath}`);
  },

  analyzed: (id: string, activity: string, category: string): void => {
    log.info(`Screenshot analyzed: ${id} - ${activity} (${category})`);
  },

  failed: (id: string, error: Error): void => {
    log.error(`Screenshot failed: ${id}`, error);
  },

  blurred: (id: string, regionCount: number): void => {
    log.debug(`Screenshot blurred: ${id} - ${regionCount} regions`);
  },
};

// Add analysis-specific logging
export const analysisLog = {
  started: (screenshotId: string): void => {
    log.debug(`Analysis started for screenshot: ${screenshotId}`);
  },

  completed: (screenshotId: string, result: any): void => {
    log.info(`Analysis completed for screenshot: ${screenshotId}`, {
      activity: result.activity,
      category: result.category,
      confidence: result.confidence,
    });
  },

  failed: (screenshotId: string, error: Error): void => {
    log.error(`Analysis failed for screenshot: ${screenshotId}`, error);
  },

  summaryGenerated: (date: string, screenshotCount: number): void => {
    log.info(`Daily summary generated: ${date} - ${screenshotCount} screenshots`);
  },
};

// Add scheduler-specific logging
export const schedulerLog = {
  started: (): void => {
    log.info('Screenshot scheduler started');
  },

  stopped: (): void => {
    log.info('Screenshot scheduler stopped');
  },

  paused: (): void => {
    log.info('Screenshot scheduler paused');
  },

  resumed: (): void => {
    log.info('Screenshot scheduler resumed');
  },

  skipped: (reason: string): void => {
    log.debug(`Screenshot capture skipped: ${reason}`);
  },

  idleDetected: (idleMinutes: number): void => {
    log.debug(`System idle detected: ${idleMinutes} minutes`);
  },
};

export default logger;
