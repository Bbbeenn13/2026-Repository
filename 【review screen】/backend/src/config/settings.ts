/**
 * Application Configuration
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export interface AppConfig {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  dbPath: string;

  // Storage
  dataDir: string;
  screenshotQuality: number;
  maxScreenshotAgeDays: number;

  // Scheduling
  captureIntervalMinutes: number;
  idleThresholdMinutes: number;

  // Ollama
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaTimeout: number;

  // Privacy
  privacyBlurPasswords: boolean;
  privacyBlurCreditCards: boolean;
  privacyBlurEmails: boolean;
  privacyAiDetection: boolean;

  // Logging
  logLevel: string;
  logDir: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  dbPath: process.env.DB_PATH || path.join(__dirname, '../../database/screen-tracker.db'),

  dataDir: process.env.DATA_DIR || path.join(__dirname, '../../data'),
  screenshotQuality: parseInt(process.env.SCREENSHOT_QUALITY || '85', 10),
  maxScreenshotAgeDays: parseInt(process.env.MAX_SCREENSHOT_AGE_DAYS || '90', 10),

  captureIntervalMinutes: parseInt(process.env.CAPTURE_INTERVAL_MINUTES || '5', 10),
  idleThresholdMinutes: parseInt(process.env.IDLE_THRESHOLD_MINUTES || '10', 10),

  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llava',
  ollamaTimeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10),

  privacyBlurPasswords: process.env.PRIVACY_BLUR_PASSWORDS !== 'false',
  privacyBlurCreditCards: process.env.PRIVACY_BLUR_CREDIT_CARDS !== 'false',
  privacyBlurEmails: process.env.PRIVACY_BLUR_EMAILS !== 'false',
  privacyAiDetection: process.env.PRIVACY_AI_DETECTION !== 'false',

  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || path.join(__dirname, '../../logs'),
};

// Validate critical settings
export function validateConfig(): void {
  const errors: string[] = [];

  if (config.port < 1 || config.port > 65535) {
    errors.push('Invalid PORT: must be between 1 and 65535');
  }

  if (config.screenshotQuality < 1 || config.screenshotQuality > 100) {
    errors.push('Invalid SCREENSHOT_QUALITY: must be between 1 and 100');
  }

  if (config.captureIntervalMinutes < 1) {
    errors.push('Invalid CAPTURE_INTERVAL_MINUTES: must be at least 1');
  }

  if (config.idleThresholdMinutes < 0) {
    errors.push('Invalid IDLE_THRESHOLD_MINUTES: must be non-negative');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

// Call validation on import
validateConfig();
