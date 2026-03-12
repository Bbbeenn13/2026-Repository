/**
 * SQLite Database Operations
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  ScreenshotMetadata,
  AnalysisResult,
  DailySummary,
  TimeAllocation,
  CREATE_TABLES_SQL,
  QUERIES,
  generateId,
  formatDateToSQLite,
  parseSQLiteDate,
} from './models';

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.initializeTables();
  }

  private initializeTables(): void {
    this.db.exec(CREATE_TABLES_SQL);
  }

  // ========================================================================
  // Screenshot Operations
  // ========================================================================

  saveScreenshot(metadata: ScreenshotMetadata): void {
    const stmt = this.db.prepare(QUERIES.INSERT_SCREENSHOT);
    stmt.run(
      metadata.id,
      formatDateToSQLite(metadata.timestamp),
      metadata.filePath,
      metadata.thumbnailPath,
      metadata.blurredPath || null,
      metadata.isSensitive ? 1 : 0,
      metadata.screenIndex,
      metadata.resolutionWidth,
      metadata.resolutionHeight,
      metadata.activeWindowTitle || null,
      metadata.activeWindowApp || null
    );
  }

  getScreenshotById(id: string): ScreenshotMetadata | null {
    const stmt = this.db.prepare(QUERIES.GET_SCREENSHOT_BY_ID);
    const row = stmt.get(id) as any;
    return row ? this.mapScreenshotRow(row) : null;
  }

  getScreenshotsByDateRange(startDate: Date, endDate: Date): ScreenshotMetadata[] {
    const stmt = this.db.prepare(QUERIES.GET_SCREENSHOTS_BY_DATE_RANGE);
    const rows = stmt.all(
      formatDateToSQLite(startDate),
      formatDateToSQLite(endDate)
    ) as any[];
    return rows.map(row => this.mapScreenshotRow(row));
  }

  getTodaysScreenshots(): ScreenshotMetadata[] {
    const stmt = this.db.prepare(QUERIES.GET_TODAYS_SCREENSHOTS);
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapScreenshotRow(row));
  }

  getRecentScreenshots(limit: number = 50): ScreenshotMetadata[] {
    const stmt = this.db.prepare(QUERIES.GET_RECENT_SCREENSHOTS);
    const rows = stmt.all(limit) as any[];
    return rows.map(row => this.mapScreenshotRow(row));
  }

  updateScreenshotBlurred(id: string, blurredPath: string, isSensitive: boolean): void {
    const stmt = this.db.prepare(QUERIES.UPDATE_SCREENSHOT_BLURRED);
    stmt.run(blurredPath, isSensitive ? 1 : 0, id);
  }

  deleteOldScreenshots(daysToKeep: number): number {
    const stmt = this.db.prepare(QUERIES.DELETE_OLD_SCREENSHOTS);
    const result = stmt.run(daysToKeep);
    return result.changes;
  }

  // ========================================================================
  // Analysis Operations
  // ========================================================================

  saveAnalysis(result: AnalysisResult): void {
    const stmt = this.db.prepare(QUERIES.INSERT_ANALYSIS);
    stmt.run(
      result.id,
      result.screenshotId,
      result.activity,
      result.category,
      result.confidence,
      result.description || null,
      result.productivityScore,
      JSON.stringify(result.detectedApps)
    );
  }

  getAnalysisByScreenshotId(screenshotId: string): AnalysisResult | null {
    const stmt = this.db.prepare(QUERIES.GET_ANALYSIS_BY_SCREENSHOT_ID);
    const row = stmt.get(screenshotId) as any;
    return row ? this.mapAnalysisRow(row) : null;
  }

  getAnalysisByDate(date: Date): AnalysisResult[] {
    const stmt = this.db.prepare(QUERIES.GET_ANALYSIS_BY_DATE);
    const rows = stmt.all(formatDateToSQLite(date)) as any[];
    return rows.map(row => this.mapAnalysisRow(row));
  }

  // ========================================================================
  // Daily Summary Operations
  // ========================================================================

  saveDailySummary(summary: DailySummary): void {
    const stmt = this.db.prepare(QUERIES.INSERT_OR_UPDATE_SUMMARY);
    stmt.run(
      summary.id,
      formatDateToSQLite(summary.date),
      summary.summaryText,
      summary.totalScreenshots,
      JSON.stringify(summary.activitiesBreakdown),
      summary.productivityScore,
      JSON.stringify(summary.suggestions)
    );
  }

  getDailySummary(date: Date): DailySummary | null {
    const stmt = this.db.prepare(QUERIES.GET_SUMMARY_BY_DATE);
    const row = stmt.get(formatDateToSQLite(date)) as any;
    return row ? this.mapSummaryRow(row) : null;
  }

  getRecentSummaries(limit: number = 30): DailySummary[] {
    const stmt = this.db.prepare(QUERIES.GET_RECENT_SUMMARIES);
    const rows = stmt.all(limit) as any[];
    return rows.map(row => this.mapSummaryRow(row));
  }

  // ========================================================================
  // Time Allocation Operations
  // ========================================================================

  saveTimeAllocation(allocation: TimeAllocation): void {
    const stmt = this.db.prepare(QUERIES.INSERT_TIME_ALLOCATION);
    stmt.run(
      allocation.id,
      allocation.screenshotId,
      allocation.appName,
      allocation.category,
      allocation.duration,
      formatDateToSQLite(allocation.timestamp)
    );
  }

  getTimeAllocationByDate(date: Date): Array<{ appName: string; category: string; totalDuration: number; count: number }> {
    const stmt = this.db.prepare(QUERIES.GET_TIME_ALLOCATION_BY_DATE);
    return stmt.all(formatDateToSQLite(date)) as any[];
  }

  getTimeAllocationByDateRange(startDate: Date, endDate: Date): Array<{ appName: string; category: string; totalDuration: number; count: number }> {
    const stmt = this.db.prepare(QUERIES.GET_TIME_ALLOCATION_BY_DATE_RANGE);
    return stmt.all(formatDateToSQLite(startDate), formatDateToSQLite(endDate)) as any[];
  }

  getCategoryBreakdownByDate(date: Date): Array<{ category: string; totalDuration: number; percentage: number }> {
    const stmt = this.db.prepare(QUERIES.GET_CATEGORY_BREAKDOWN_BY_DATE);
    return stmt.all(formatDateToSQLite(date), formatDateToSQLite(date)) as any[];
  }

  // ========================================================================
  // Utility Operations
  // ========================================================================

  getScreenshotCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM screenshots');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  getAnalysisCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM analysis_results');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  close(): void {
    this.db.close();
  }

  // ========================================================================
  // Row Mappers
  // ========================================================================

  private mapScreenshotRow(row: any): ScreenshotMetadata {
    return {
      id: row.id,
      timestamp: parseSQLiteDate(row.timestamp),
      filePath: row.file_path,
      thumbnailPath: row.thumbnail_path,
      blurredPath: row.blurred_path,
      isSensitive: row.is_sensitive === 1,
      screenIndex: row.screen_index,
      resolutionWidth: row.resolution_width,
      resolutionHeight: row.resolution_height,
      activeWindowTitle: row.active_window_title,
      activeWindowApp: row.active_window_app,
      createdAt: parseSQLiteDate(row.created_at),
    };
  }

  private mapAnalysisRow(row: any): AnalysisResult {
    return {
      id: row.id,
      screenshotId: row.screenshot_id,
      activity: row.activity,
      category: row.category,
      confidence: row.confidence,
      description: row.description,
      productivityScore: row.productivity_score,
      detectedApps: JSON.parse(row.detected_apps || '[]'),
      createdAt: parseSQLiteDate(row.created_at),
    };
  }

  private mapSummaryRow(row: any): DailySummary {
    return {
      id: row.id,
      date: parseSQLiteDate(row.date),
      summaryText: row.summary_text,
      totalScreenshots: row.total_screenshots,
      activitiesBreakdown: JSON.parse(row.activities_breakdown || '[]'),
      productivityScore: row.productivity_score,
      suggestions: JSON.parse(row.suggestions || '[]'),
      createdAt: parseSQLiteDate(row.created_at),
    };
  }
}

// Singleton instance
let dbInstance: DatabaseManager | null = null;

export function getDatabase(dbPath: string): DatabaseManager {
  if (!dbInstance) {
    dbInstance = new DatabaseManager(dbPath);
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
