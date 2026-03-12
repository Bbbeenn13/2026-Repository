/**
 * Screenshot Capture Module
 */

import screenshot from 'node-screenshots';
import activeWin from 'active-win';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { generateId, ScreenshotMetadata, WindowInfo } from '../storage/models';
import { config } from '../config/settings';
import { SCREENSHOT_FORMAT, THUMBNAIL_SIZE, THUMBNAIL_QUALITY } from '../config/constants';
import { screenshotLog } from '../utils/logger';

export interface CaptureOptions {
  screenId?: string;
  quality?: number;
  format?: 'png' | 'jpeg';
}

export interface CaptureResult {
  metadata: ScreenshotMetadata;
  imageBuffer: Buffer;
  thumbnailBuffer: Buffer;
}

export class ScreenshotCapture {
  private dataDir: string;
  private screenshotDir: string;
  private thumbnailDir: string;

  constructor() {
    this.dataDir = config.dataDir;
    this.screenshotDir = path.join(this.dataDir, 'screenshots', 'original');
    this.thumbnailDir = path.join(this.dataDir, 'screenshots', 'thumbnails');

    // Ensure directories exist
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.dataDir, this.screenshotDir, this.thumbnailDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get all available screens
   */
  getAllScreens(): screenshot.Screen[] {
    return screenshot.listDisplays();
  }

  /**
   * Get the currently active window
   */
  async getActiveWindow(): Promise<WindowInfo | null> {
    try {
      const active = await activeWin();
      return {
        title: active.title,
        appName: active.owner.name,
        path: active.owner.path,
        ownerName: active.owner.name,
      };
    } catch (error) {
      screenshotLog.failed('getActiveWindow', error as Error);
      return null;
    }
  }

  /**
   * Capture a single screen
   */
  async captureScreen(options: CaptureOptions = {}): Promise<CaptureResult | null> {
    try {
      const screens = this.getAllScreens();
      if (screens.length === 0) {
        throw new Error('No screens detected');
      }

      // Use specified screen or primary screen
      const screenId = options.screenId || screens[0].id;
      const screen = screens.find(s => s.id === screenId) || screens[0];

      // Get active window info
      const activeWindow = await this.getActiveWindow();

      // Capture screenshot
      const image = screenshot.captureScreen(screen.id);

      // Convert to buffer
      const imageBuffer = Buffer.from(image);

      // Generate thumbnail
      const thumbnailBuffer = await this.generateThumbnail(imageBuffer);

      // Generate file paths
      const timestamp = new Date();
      const dateStr = this.formatDatePath(timestamp);
      const filename = `${generateId()}.${options.format || SCREENSHOT_FORMAT}`;

      // Create date-based subdirectory
      const dateDir = path.join(this.screenshotDir, dateStr);
      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
      }

      const thumbnailDateDir = path.join(this.thumbnailDir, dateStr);
      if (!fs.existsSync(thumbnailDateDir)) {
        fs.mkdirSync(thumbnailDateDir, { recursive: true });
      }

      const filePath = path.join(dateDir, filename);
      const thumbnailPath = path.join(thumbnailDateDir, filename);

      // Save files
      await this.saveImage(imageBuffer, filePath, options.quality || config.screenshotQuality);
      await this.saveImage(thumbnailBuffer, thumbnailPath, THUMBNAIL_QUALITY);

      // Create metadata
      const metadata: ScreenshotMetadata = {
        id: generateId(),
        timestamp,
        filePath,
        thumbnailPath,
        isSensitive: false,
        screenIndex: screens.indexOf(screen),
        resolutionWidth: screen.width,
        resolutionHeight: screen.height,
        activeWindowTitle: activeWindow?.title,
        activeWindowApp: activeWindow?.appName,
        createdAt: timestamp,
      };

      screenshotLog.captured(metadata.id, metadata);

      return {
        metadata,
        imageBuffer,
        thumbnailBuffer,
      };
    } catch (error) {
      screenshotLog.failed('captureScreen', error as Error);
      return null;
    }
  }

  /**
   * Capture all screens
   */
  async captureAllScreens(options: CaptureOptions = {}): Promise<CaptureResult[]> {
    const screens = this.getAllScreens();
    const results: CaptureResult[] = [];

    for (const screen of screens) {
      const result = await this.captureScreen({ ...options, screenId: screen.id });
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Generate thumbnail from image buffer
   */
  private async generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toBuffer();
  }

  /**
   * Save image buffer to file
   */
  private async saveImage(buffer: Buffer, filePath: string, quality: number): Promise<void> {
    await sharp(buffer)
      .jpeg({ quality })
      .toFile(filePath);
  }

  /**
   * Format date for directory path (YYYY/MM/DD)
   */
  private formatDatePath(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /**
   * Read screenshot file
   */
  async readScreenshot(filePath: string): Promise<Buffer | null> {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      return fs.readFileSync(filePath);
    } catch (error) {
      screenshotLog.failed(`readScreenshot: ${filePath}`, error as Error);
      return null;
    }
  }

  /**
   * Delete screenshot file
   */
  async deleteScreenshot(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      screenshotLog.failed(`deleteScreenshot: ${filePath}`, error as Error);
      return false;
    }
  }

  /**
   * Get screenshot file info
   */
  getScreenshotInfo(filePath: string): { size: number; created: Date } | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
      };
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance
let captureInstance: ScreenshotCapture | null = null;

export function getScreenshotCapture(): ScreenshotCapture {
  if (!captureInstance) {
    captureInstance = new ScreenshotCapture();
  }
  return captureInstance;
}
