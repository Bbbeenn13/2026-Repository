/**
 * Database Models and Schema Definitions
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface ScreenshotMetadata {
  id: string;
  timestamp: Date;
  filePath: string;
  thumbnailPath: string;
  blurredPath?: string;
  isSensitive: boolean;
  screenIndex: number;
  resolutionWidth: number;
  resolutionHeight: number;
  activeWindowTitle?: string;
  activeWindowApp?: string;
  createdAt: Date;
}

export interface AnalysisResult {
  id: string;
  screenshotId: string;
  activity: string;
  category: ActivityCategory;
  confidence: number;
  description?: string;
  productivityScore: number;
  detectedApps: string[];
  createdAt: Date;
}

export type ActivityCategory =
  | 'work'
  | 'development'
  | 'communication'
  | 'entertainment'
  | 'browsing'
  | 'learning'
  | 'other';

export interface DailySummary {
  id: string;
  date: Date;
  summaryText: string;
  totalScreenshots: number;
  activitiesBreakdown: ActivityBreakdown[];
  productivityScore: number;
  suggestions: string[];
  createdAt: Date;
}

export interface ActivityBreakdown {
  category: ActivityCategory;
  duration: number; // in minutes
  percentage: number;
  screenshotCount: number;
}

export interface TimeAllocation {
  id: string;
  screenshotId: string;
  appName: string;
  category: ActivityCategory;
  duration: number; // in minutes
  timestamp: Date;
}

export interface WindowInfo {
  title: string;
  appName: string;
  path: string;
  ownerName: string;
}

// ============================================================================
// Database Schema SQL
// ============================================================================

export const CREATE_TABLES_SQL = `
-- Screenshots table
CREATE TABLE IF NOT EXISTS screenshots (
  id TEXT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  blurred_path TEXT,
  is_sensitive BOOLEAN DEFAULT 0,
  screen_index INTEGER,
  resolution_width INTEGER,
  resolution_height INTEGER,
  active_window_title TEXT,
  active_window_app TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for screenshots
CREATE INDEX IF NOT EXISTS idx_screenshots_timestamp ON screenshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_screenshots_date ON screenshots(date(timestamp));
CREATE INDEX IF NOT EXISTS idx_screenshots_app ON screenshots(active_window_app);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  screenshot_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence REAL,
  description TEXT,
  productivity_score INTEGER,
  detected_apps TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (screenshot_id) REFERENCES screenshots(id) ON DELETE CASCADE
);

-- Indexes for analysis_results
CREATE INDEX IF NOT EXISTS idx_analysis_screenshot ON analysis_results(screenshot_id);
CREATE INDEX IF NOT EXISTS idx_analysis_category ON analysis_results(category);

-- Daily summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  summary_text TEXT NOT NULL,
  total_screenshots INTEGER,
  activities_breakdown TEXT,
  productivity_score INTEGER,
  suggestions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for daily_summaries
CREATE INDEX IF NOT EXISTS idx_summaries_date ON daily_summaries(date);

-- Time allocations table
CREATE TABLE IF NOT EXISTS time_allocations (
  id TEXT PRIMARY KEY,
  screenshot_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (screenshot_id) REFERENCES screenshots(id) ON DELETE CASCADE
);

-- Indexes for time_allocations
CREATE INDEX IF NOT EXISTS idx_time_screenshot ON time_allocations(screenshot_id);
CREATE INDEX IF NOT EXISTS idx_time_app ON time_allocations(app_name);
CREATE INDEX IF NOT EXISTS idx_time_category ON time_allocations(category);
CREATE INDEX IF NOT EXISTS idx_time_timestamp ON time_allocations(timestamp);
`;

// ============================================================================
// Database Queries
// ============================================================================

export const QUERIES = {
  // Screenshots
  INSERT_SCREENSHOT: `
    INSERT INTO screenshots (
      id, timestamp, file_path, thumbnail_path, blurred_path,
      is_sensitive, screen_index, resolution_width, resolution_height,
      active_window_title, active_window_app
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  GET_SCREENSHOT_BY_ID: `
    SELECT * FROM screenshots WHERE id = ?
  `,

  GET_SCREENSHOTS_BY_DATE_RANGE: `
    SELECT * FROM screenshots
    WHERE date(timestamp) BETWEEN date(?) AND date(?)
    ORDER BY timestamp DESC
  `,

  GET_TODAYS_SCREENSHOTS: `
    SELECT * FROM screenshots
    WHERE date(timestamp) = date('now')
    ORDER BY timestamp DESC
  `,

  GET_RECENT_SCREENSHOTS: `
    SELECT * FROM screenshots
    ORDER BY timestamp DESC
    LIMIT ?
  `,

  DELETE_OLD_SCREENSHOTS: `
    DELETE FROM screenshots
    WHERE timestamp < datetime('now', '-' || ? || ' days')
  `,

  UPDATE_SCREENSHOT_BLURRED: `
    UPDATE screenshots SET blurred_path = ?, is_sensitive = ? WHERE id = ?
  `,

  // Analysis Results
  INSERT_ANALYSIS: `
    INSERT INTO analysis_results (
      id, screenshot_id, activity, category, confidence,
      description, productivity_score, detected_apps
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,

  GET_ANALYSIS_BY_SCREENSHOT_ID: `
    SELECT * FROM analysis_results WHERE screenshot_id = ?
  `,

  GET_ANALYSIS_BY_DATE: `
    SELECT ar.*, s.timestamp
    FROM analysis_results ar
    JOIN screenshots s ON ar.screenshot_id = s.id
    WHERE date(s.timestamp) = ?
    ORDER BY s.timestamp DESC
  `,

  // Daily Summaries
  INSERT_OR_UPDATE_SUMMARY: `
    INSERT INTO daily_summaries (id, date, summary_text, total_screenshots, activities_breakdown, productivity_score, suggestions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      summary_text = excluded.summary_text,
      total_screenshots = excluded.total_screenshots,
      activities_breakdown = excluded.activities_breakdown,
      productivity_score = excluded.productivity_score,
      suggestions = excluded.suggestions
  `,

  GET_SUMMARY_BY_DATE: `
    SELECT * FROM daily_summaries WHERE date = ?
  `,

  GET_RECENT_SUMMARIES: `
    SELECT * FROM daily_summaries
    ORDER BY date DESC
    LIMIT ?
  `,

  // Time Allocations
  INSERT_TIME_ALLOCATION: `
    INSERT INTO time_allocations (id, screenshot_id, app_name, category, duration, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  GET_TIME_ALLOCATION_BY_DATE: `
    SELECT app_name, category, SUM(duration) as total_duration, COUNT(*) as count
    FROM time_allocations
    WHERE date(timestamp) = ?
    GROUP BY app_name, category
    ORDER BY total_duration DESC
  `,

  GET_TIME_ALLOCATION_BY_DATE_RANGE: `
    SELECT app_name, category, SUM(duration) as total_duration, COUNT(*) as count
    FROM time_allocations
    WHERE date(timestamp) BETWEEN date(?) AND date(?)
    GROUP BY app_name, category
    ORDER BY total_duration DESC
  `,

  GET_CATEGORY_BREAKDOWN_BY_DATE: `
    SELECT category, SUM(duration) as total_duration,
           CAST(SUM(duration) * 100.0 / (SELECT SUM(duration) FROM time_allocations WHERE date(timestamp) = ?) AS INTEGER) as percentage
    FROM time_allocations
    WHERE date(timestamp) = ?
    GROUP BY category
    ORDER BY total_duration DESC
  `,
};

// ============================================================================
// Helper Functions
// ============================================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function formatDateToSQLite(date: Date): string {
  return date.toISOString();
}

export function parseSQLiteDate(dateString: string): Date {
  return new Date(dateString);
}
