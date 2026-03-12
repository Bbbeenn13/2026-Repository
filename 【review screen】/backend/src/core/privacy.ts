/**
 * Privacy Detection and Blur Module
 */

import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';
import { SENSITIVE_PATTERNS, SENSITIVE_WINDOW_TITLES } from '../config/constants';
import { config } from '../config/settings';
import { screenshotLog } from '../utils/logger';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedRegion {
  type: 'password' | 'credit-card' | 'email' | 'api-key' | 'ssn' | 'custom';
  bbox: BoundingBox;
  confidence: number;
  text?: string;
}

export interface PrivacyDetectionResult {
  isSensitive: boolean;
  detectedRegions: DetectedRegion[];
  blurredImagePath?: string;
}

export class PrivacyFilter {
  private blurredDir: string;

  constructor() {
    this.blurredDir = path.join(config.dataDir, 'screenshots', 'blurred');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.blurredDir)) {
      fs.mkdirSync(this.blurredDir, { recursive: true });
    }
  }

  /**
   * Detect sensitive content in screenshot
   */
  async detectSensitiveContent(
    imagePath: string,
    windowTitle?: string
  ): Promise<PrivacyDetectionResult> {
    const detectedRegions: DetectedRegion[] = [];
    let isSensitive = false;

    try {
      // Check window title first (fast check)
      if (windowTitle && this.isSensitiveWindowTitle(windowTitle)) {
        isSensitive = true;
        detectedRegions.push({
          type: 'password',
          bbox: { x: 0, y: 0, width: 0, height: 0 }, // Entire image
          confidence: 1.0,
          text: windowTitle,
        });
      }

      // OCR-based detection
      if (config.privacyBlurPasswords || config.privacyBlurCreditCards || config.privacyBlurEmails) {
        const ocrResults = await this.ocrDetect(imagePath);
        detectedRegions.push(...ocrResults);
      }

      // Pattern-based detection on OCR text
      const patternResults = await this.patternDetect(imagePath);
      detectedRegions.push(...patternResults);

      isSensitive = isSensitive || detectedRegions.length > 0;

      screenshotLog.blurred(imagePath, detectedRegions.length);

      return {
        isSensitive,
        detectedRegions,
      };
    } catch (error) {
      screenshotLog.failed('detectSensitiveContent', error as Error);
      return {
        isSensitive: false,
        detectedRegions: [],
      };
    }
  }

  /**
   * Check if window title indicates sensitive content
   */
  private isSensitiveWindowTitle(title: string): boolean {
    const lowerTitle = title.toLowerCase();
    return SENSITIVE_WINDOW_TITLES.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * OCR-based text detection
   */
  private async ocrDetect(imagePath: string): Promise<DetectedRegion[]> {
    const regions: DetectedRegion[] = [];

    try {
      const { data } = await Tesseract.recognize(imagePath, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            // Optional: log progress
          }
        },
      });

      // Get words with bounding boxes
      if (data.words) {
        for (const word of data.words) {
          const text = word.text;
          const bbox = word.bbox; // {x0, y0, x1, y1}

          // Check against sensitive patterns
          if (this.matchesSensitivePattern(text)) {
            regions.push({
              type: this.getSensitiveType(text),
              bbox: {
                x: bbox.x0,
                y: bbox.y0,
                width: bbox.x1 - bbox.x0,
                height: bbox.y1 - bbox.y0,
              },
              confidence: word.confidence / 100,
              text,
            });
          }
        }
      }
    } catch (error) {
      screenshotLog.failed('ocrDetect', error as Error);
    }

    return regions;
  }

  /**
   * Pattern-based detection
   */
  private async patternDetect(imagePath: string): Promise<DetectedRegion[]> {
    const regions: DetectedRegion[] = [];

    try {
      const { data } = await Tesseract.recognize(imagePath, 'eng');

      // Get full text
      const fullText = data.text;

      // Check for patterns in full text
      if (SENSITIVE_PATTERNS.PASSWORD.test(fullText)) {
        regions.push({
          type: 'password',
          bbox: { x: 0, y: 0, width: 0, height: 0 }, // Entire image
          confidence: 0.8,
          text: 'password detected',
        });
      }

      if (SENSITIVE_PATTERNS.API_KEY.test(fullText)) {
        regions.push({
          type: 'api-key',
          bbox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: 0.8,
          text: 'api key detected',
        });
      }

      if (config.privacyBlurCreditCards && SENSITIVE_PATTERNS.CREDIT_CARD.test(fullText)) {
        regions.push({
          type: 'credit-card',
          bbox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: 0.9,
          text: 'credit card detected',
        });
      }

      if (config.privacyBlurEmails && SENSITIVE_PATTERNS.EMAIL.test(fullText)) {
        regions.push({
          type: 'email',
          bbox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: 0.7,
          text: 'email detected',
        });
      }

      if (SENSITIVE_PATTERNS.SSN.test(fullText)) {
        regions.push({
          type: 'ssn',
          bbox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: 0.95,
          text: 'ssn detected',
        });
      }
    } catch (error) {
      screenshotLog.failed('patternDetect', error as Error);
    }

    return regions;
  }

  /**
   * Check if text matches any sensitive pattern
   */
  private matchesSensitivePattern(text: string): boolean {
    const lowerText = text.toLowerCase();

    if (config.privacyBlurPasswords && SENSITIVE_PATTERNS.PASSWORD.test(lowerText)) {
      return true;
    }

    if (config.privacyBlurCreditCards && SENSITIVE_PATTERNS.CREDIT_CARD.test(text)) {
      return true;
    }

    if (config.privacyBlurEmails && SENSITIVE_PATTERNS.EMAIL.test(text)) {
      return true;
    }

    if (SENSITIVE_PATTERNS.API_KEY.test(lowerText)) {
      return true;
    }

    if (SENSITIVE_PATTERNS.SSN.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Determine sensitive type from text
   */
  private getSensitiveType(text: string): DetectedRegion['type'] {
    const lowerText = text.toLowerCase();

    if (SENSITIVE_PATTERNS.PASSWORD.test(lowerText)) return 'password';
    if (SENSITIVE_PATTERNS.CREDIT_CARD.test(text)) return 'credit-card';
    if (SENSITIVE_PATTERNS.EMAIL.test(text)) return 'email';
    if (SENSITIVE_PATTERNS.API_KEY.test(lowerText)) return 'api-key';
    if (SENSITIVE_PATTERNS.SSN.test(text)) return 'ssn';

    return 'password'; // default
  }

  /**
   * Apply blur to detected regions
   */
  async applyBlur(imagePath: string, regions: DetectedRegion[]): Promise<string | null> {
    if (regions.length === 0) {
      return null;
    }

    try {
      // Create blurred image path
      const filename = path.basename(imagePath);
      const dateStr = this.formatDatePath(new Date());
      const dateDir = path.join(this.blurredDir, dateStr);

      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
      }

      const blurredPath = path.join(dateDir, filename);

      // Check if any region covers entire image
      const entireImage = regions.some(r => r.bbox.width === 0 && r.bbox.height === 0);

      let image = sharp(imagePath);

      if (entireImage) {
        // Blur entire image
        image = image.blur(30);
      } else {
        // Blur specific regions
        const metadata = await image.metadata();
        const overlays = regions.map(region => ({
          input: Buffer.from(
            `<svg>
              <rect x="${region.bbox.x}" y="${region.bbox.y}"
                    width="${region.bbox.width}" height="${region.bbox.height}"
                    fill="black" fill-opacity="0.8"/>
            </svg>`
          ),
          top: 0,
          left: 0,
        }));

        if (overlays.length > 0) {
          image = image.composite(overlays);
        }
      }

      await image.toFile(blurredPath);

      return blurredPath;
    } catch (error) {
      screenshotLog.failed('applyBlur', error as Error);
      return null;
    }
  }

  /**
   * Format date for directory path
   */
  private formatDatePath(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /**
   * Quick check - blur entire image if needed
   */
  async blurEntireImage(imagePath: string): Promise<string | null> {
    try {
      const filename = path.basename(imagePath);
      const dateStr = this.formatDatePath(new Date());
      const dateDir = path.join(this.blurredDir, dateStr);

      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
      }

      const blurredPath = path.join(dateDir, filename);

      await sharp(imagePath)
        .blur(30)
        .toFile(blurredPath);

      return blurredPath;
    } catch (error) {
      screenshotLog.failed('blurEntireImage', error as Error);
      return null;
    }
  }
}

// Singleton instance
let privacyInstance: PrivacyFilter | null = null;

export function getPrivacyFilter(): PrivacyFilter {
  if (!privacyInstance) {
    privacyInstance = new PrivacyFilter();
  }
  return privacyInstance;
}
