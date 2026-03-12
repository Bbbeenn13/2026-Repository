/**
 * Application Constants
 */

import { ActivityCategory } from '../storage/models';

// Screenshot constants
export const SCREENSHOT_FORMAT = 'jpeg' as const;
export const THUMBNAIL_SIZE = 300; // pixels
export const THUMBNAIL_QUALITY = 70;

// Privacy detection patterns
export const SENSITIVE_PATTERNS = {
  PASSWORD: /password|passwd|pwd/i,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  API_KEY: /api[_-]?key|apikey|access[_-]?token/i,
  SSN: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/,
};

// Sensitive window titles (always blur)
export const SENSITIVE_WINDOW_TITLES = [
  'password',
  'login',
  'sign in',
  'authentication',
  'credentials',
  'settings',
  'security',
  'private',
  'incognito',
  'banking',
  'credit card',
  'social security',
];

// Productivity scores by category (0-100)
export const PRODUCTIVITY_SCORES: Record<ActivityCategory, number> = {
  work: 90,
  development: 95,
  learning: 85,
  communication: 60,
  browsing: 40,
  entertainment: 10,
  other: 50,
};

// Ollama prompts
export const OLLAMA_PROMPTS = {
  ANALYZE_SCREENSHOT: `Analyze this screenshot and describe what the user is doing.
Provide your response in JSON format with these fields:
- activity: brief activity description (e.g., "Coding in VS Code", "Reading documentation")
- category: one of [work, development, communication, entertainment, browsing, learning, other]
- confidence: number from 0 to 1
- description: detailed description of what's visible on screen
- detectedApps: array of application names you can identify
- productivityScore: number from 0 to 100 based on how productive this activity is

Be specific and accurate. If you cannot determine the activity, use category "other" and set confidence low.`,

  GENERATE_SUMMARY: `Based on the following screenshots and activities throughout the day, generate a concise daily summary.

Focus on:
1. Main activities and time spent
2. Productivity patterns
3. Notable achievements or distractions
4. Overall productivity assessment

Provide a 2-3 paragraph summary.`,

  GENERATE_SUGGESTIONS: `Based on the user's activity patterns and time allocation data, provide 3-5 actionable suggestions to improve their productivity and time management.

Consider:
1. Time-wasting activities to reduce
2. Optimal work schedule
3. Break patterns
4. Focus improvement opportunities

Format each suggestion as a clear, actionable bullet point.`,
};

// Time constants
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const SECONDS_PER_MINUTE = 60;

// Error messages
export const ERROR_MESSAGES = {
  SCREENSHOT_FAILED: 'Failed to capture screenshot',
  SAVE_SCREENSHOT_FAILED: 'Failed to save screenshot',
  ANALYSIS_FAILED: 'Failed to analyze screenshot',
  OLLAMA_UNAVAILABLE: 'Ollama service is not available',
  DATABASE_ERROR: 'Database operation failed',
  INVALID_DATE_RANGE: 'Invalid date range',
  FILE_NOT_FOUND: 'Screenshot file not found',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SCREENSHOT_CAPTURED: 'Screenshot captured successfully',
  ANALYSIS_COMPLETED: 'Analysis completed successfully',
  SUMMARY_GENERATED: 'Daily summary generated successfully',
  SERVICE_STARTED: 'Screen tracking service started',
  SERVICE_STOPPED: 'Screen tracking service stopped',
} as const;
