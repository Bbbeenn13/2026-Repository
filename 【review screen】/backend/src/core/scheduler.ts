/**
 * Screenshot Scheduler Module
 */

import cron from 'node-cron';
import { getScreenshotCapture } from './screenshot';
import { getPrivacyFilter } from './privacy';
import { getOllamaAnalyzer } from './ollama';
import { getDatabase } from '../storage/database';
import { generateId } from '../storage/models';
import { config } from '../config/settings';
import { schedulerLog, screenshotLog, analysisLog } from '../utils/logger';
import { AnalysisResult, ScreenshotMetadata, TimeAllocation } from '../storage/models';

export class ScreenshotScheduler {
  private scheduledTask: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    // Auto-start on initialization
    this.start();
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      schedulerLog.warn('Scheduler is already running');
      return;
    }

    // Schedule screenshot capture every N minutes
    const cronExpression = `*/${config.captureIntervalMinutes} * * * *`;

    this.scheduledTask = cron.schedule(cronExpression, async () => {
      await this.onScheduledCapture();
    });

    this.isRunning = true;
    this.isPaused = false;
    schedulerLog.started();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
    }

    this.isRunning = false;
    this.isPaused = false;
    schedulerLog.stopped();
  }

  /**
   * Pause the scheduler
   */
  pause(): void {
    this.isPaused = true;
    schedulerLog.paused();
  }

  /**
   * Resume the scheduler
   */
  resume(): void {
    this.isPaused = false;
    schedulerLog.resumed();
  }

  /**
   * Check if scheduler is running
   */
  isActive(): boolean {
    return this.isRunning && !this.isPaused;
  }

  /**
   * Check if scheduler is paused
   */
  isSchedulerPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Scheduled capture handler
   */
  private async onScheduledCapture(): Promise<void> {
    try {
      // Check if paused
      if (this.isPaused) {
        schedulerLog.skipped('Scheduler is paused');
        return;
      }

      // Check idle time (TODO: implement idle detection)
      // For now, we'll skip idle check

      // Capture screenshot
      const capture = getScreenshotCapture();
      const result = await capture.captureScreen();

      if (!result) {
        screenshotLog.failed('Scheduled capture', new Error('Capture failed'));
        return;
      }

      const { metadata, imageBuffer } = result;

      // Privacy detection
      const privacyFilter = getPrivacyFilter();
      const privacyResult = await privacyFilter.detectSensitiveContent(
        metadata.filePath,
        metadata.activeWindowTitle
      );

      if (privacyResult.isSensitive && privacyResult.detectedRegions.length > 0) {
        const blurredPath = await privacyFilter.applyBlur(
          metadata.filePath,
          privacyResult.detectedRegions
        );

        if (blurredPath) {
          metadata.blurredPath = blurredPath;
          metadata.isSensitive = true;
        }
      }

      // Save to database
      const db = getDatabase(config.dbPath);
      db.saveScreenshot(metadata);

      // Analyze screenshot
      await this.analyzeScreenshot(metadata, db);

      screenshotLog.captured(metadata.id);
    } catch (error) {
      screenshotLog.failed('Scheduled capture', error as Error);
    }
  }

  /**
   * Analyze screenshot and save results
   */
  private async analyzeScreenshot(metadata: ScreenshotMetadata, db: any): Promise<void> {
    try {
      const analyzer = getOllamaAnalyzer();

      // Use blurred image if sensitive, otherwise use original
      const imagePath = metadata.isSensitive && metadata.blurredPath
        ? metadata.blurredPath
        : metadata.filePath;

      const analysisResult = await analyzer.analyzeScreenshot(imagePath, metadata);

      if (analysisResult) {
        // Save analysis result
        const analysis: AnalysisResult = {
          id: generateId(),
          screenshotId: metadata.id,
          activity: analysisResult.activity,
          category: analysisResult.category,
          confidence: analysisResult.confidence,
          description: analysisResult.description,
          productivityScore: analysisResult.productivityScore,
          detectedApps: analysisResult.detectedApps,
          createdAt: new Date(),
        };

        db.saveAnalysis(analysis);

        // Save time allocation
        const timeAllocation: TimeAllocation = {
          id: generateId(),
          screenshotId: metadata.id,
          appName: metadata.activeWindowApp || 'Unknown',
          category: analysisResult.category,
          duration: config.captureIntervalMinutes,
          timestamp: metadata.timestamp,
        };

        db.saveTimeAllocation(timeAllocation);

        analysisLog.completed(metadata.id, analysisResult);
      }
    } catch (error) {
      analysisLog.failed(metadata.id, error as Error);
    }
  }

  /**
   * Manually trigger a capture (for testing)
   */
  async triggerManualCapture(): Promise<ScreenshotMetadata | null> {
    await this.onScheduledCapture();

    // Get the most recent screenshot
    const db = getDatabase(config.dbPath);
    const screenshots = db.getRecentScreenshots(1);

    return screenshots.length > 0 ? screenshots[0] : null;
  }
}

// Singleton instance
let schedulerInstance: ScreenshotScheduler | null = null;

export function getScheduler(): ScreenshotScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new ScreenshotScheduler();
  }
  return schedulerInstance;
}

export function stopScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
    schedulerInstance = null;
  }
}
