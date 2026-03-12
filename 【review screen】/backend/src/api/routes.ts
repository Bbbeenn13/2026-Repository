/**
 * Express API Routes
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../storage/database';
import { getScheduler } from '../core/scheduler';
import { getScreenshotCapture } from '../core/screenshot';
import { getTimeTracker } from '../analysis/timeTracker';
import { getActivitySummarizer } from '../analysis/summarizer';
import { config } from '../config/settings';
import { log } from '../utils/logger';

const router = express.Router();

// ========================================================================
// Middleware
// ========================================================================

router.use(cors());
router.use(express.json());

// Request logging
router.use((req, res, next) => {
  log.info(`${req.method} ${req.path}`);
  next();
});

// Error handler
router.use((err: any, req: Request, res: Response, next: any) => {
  log.error(`API Error: ${req.path}`, err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ========================================================================
// Screenshots Routes
// ========================================================================

/**
 * GET /api/screenshots
 * List screenshots with optional filters
 */
router.get('/screenshots', (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit } = req.query;

    const db = getDatabase(config.dbPath);

    let screenshots;

    if (startDate && endDate) {
      screenshots = db.getScreenshotsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else {
      screenshots = db.getRecentScreenshots(
        limit ? parseInt(limit as string) : 50
      );
    }

    res.json({ screenshots });
  } catch (error) {
    log.error('Failed to get screenshots', error);
    res.status(500).json({ error: 'Failed to get screenshots' });
  }
});

/**
 * GET /api/screenshots/:id
 * Get single screenshot by ID
 */
router.get('/screenshots/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase(config.dbPath);

    const screenshot = db.getScreenshotById(id);

    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    res.json({ screenshot });
  } catch (error) {
    log.error('Failed to get screenshot', error);
    res.status(500).json({ error: 'Failed to get screenshot' });
  }
});

/**
 * GET /api/screenshots/:id/image
 * Get screenshot image file
 */
router.get('/screenshots/:id/image', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { blurred } = req.query;

    const db = getDatabase(config.dbPath);
    const screenshot = db.getScreenshotById(id);

    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    // Use blurred image if requested and available
    const imagePath = blurred === 'true' && screenshot.blurredPath
      ? screenshot.blurredPath
      : screenshot.filePath;

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    log.error('Failed to get screenshot image', error);
    res.status(500).json({ error: 'Failed to get screenshot image' });
  }
});

/**
 * GET /api/screenshots/today
 * Get today's screenshots
 */
router.get('/screenshots/today', (req: Request, res: Response) => {
  try {
    const db = getDatabase(config.dbPath);
    const screenshots = db.getTodaysScreenshots();

    res.json({ screenshots });
  } catch (error) {
    log.error('Failed to get today\'s screenshots', error);
    res.status(500).json({ error: 'Failed to get today\'s screenshots' });
  }
});

// ========================================================================
// Analysis Routes
// ========================================================================

/**
 * GET /api/analysis/:date
 * Get analysis for a specific date
 */
router.get('/analysis/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const db = getDatabase(config.dbPath);

    const analysis = db.getAnalysisByDate(new Date(date));

    res.json({ analysis });
  } catch (error) {
    log.error('Failed to get analysis', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

/**
 * GET /api/analysis/times/:startDate/:endDate
 * Get time allocation for date range
 */
router.get('/analysis/times/:startDate/:endDate', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.params;
    const timeTracker = getTimeTracker();

    const allocations = timeTracker.getTimeAllocationByDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ allocations });
  } catch (error) {
    log.error('Failed to get time allocation', error);
    res.status(500).json({ error: 'Failed to get time allocation' });
  }
});

/**
 * POST /api/analysis/generate/:date
 * Generate daily summary for a specific date
 */
router.post('/analysis/generate/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const summarizer = getActivitySummarizer();

    const summary = await summarizer.generateDailySummary(new Date(date));

    if (!summary) {
      return res.status(404).json({ error: 'No data available for this date' });
    }

    res.json({ summary });
  } catch (error) {
    log.error('Failed to generate summary', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// ========================================================================
// Dashboard Routes
// ========================================================================

/**
 * GET /api/dashboard/today
 * Get today's dashboard summary
 */
router.get('/dashboard/today', (req: Request, res: Response) => {
  try {
    const db = getDatabase(config.dbPath);
    const timeTracker = getTimeTracker();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's screenshots
    const screenshots = db.getTodaysScreenshots();

    // Get today's summary if available
    const summary = db.getDailySummary(today);

    // Get category breakdown
    const categoryBreakdown = timeTracker.getCategoryBreakdown(new Date());

    // Get top apps
    const topApps = timeTracker.getTopApplications(new Date(), 5);

    // Get productive hours
    const productiveHours = timeTracker.getMostProductiveHours(new Date());

    res.json({
      date: today,
      totalScreenshots: screenshots.length,
      summary,
      categoryBreakdown,
      topApps,
      productiveHours,
    });
  } catch (error) {
    log.error('Failed to get today\'s dashboard', error);
    res.status(500).json({ error: 'Failed to get today\'s dashboard' });
  }
});

/**
 * GET /api/dashboard/stats
 * Get quick statistics
 */
router.get('/dashboard/stats', (req: Request, res: Response) => {
  try {
    const db = getDatabase(config.dbPath);

    const screenshotCount = db.getScreenshotCount();
    const analysisCount = db.getAnalysisCount();

    res.json({
      totalScreenshots: screenshotCount,
      totalAnalysis: analysisCount,
    });
  } catch (error) {
    log.error('Failed to get stats', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * GET /api/dashboard/suggestions
 * Get productivity suggestions
 */
router.get('/dashboard/suggestions', (req: Request, res: Response) => {
  try {
    const db = getDatabase(config.dbPath);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary = db.getDailySummary(today);

    if (!summary) {
      return res.json({ suggestions: [] });
    }

    res.json({ suggestions: summary.suggestions });
  } catch (error) {
    log.error('Failed to get suggestions', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// ========================================================================
// System Routes
// ========================================================================

/**
 * GET /api/system/status
 * Get system status
 */
router.get('/system/status', (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();

    res.json({
      running: scheduler.isActive(),
      paused: scheduler.isSchedulerPaused(),
      captureInterval: config.captureIntervalMinutes,
      ollamaAvailable: false, // TODO: implement check
    });
  } catch (error) {
    log.error('Failed to get system status', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

/**
 * POST /api/system/pause
 * Pause screenshot capture
 */
router.post('/system/pause', (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    scheduler.pause();

    res.json({ message: 'Scheduler paused' });
  } catch (error) {
    log.error('Failed to pause scheduler', error);
    res.status(500).json({ error: 'Failed to pause scheduler' });
  }
});

/**
 * POST /api/system/resume
 * Resume screenshot capture
 */
router.post('/system/resume', (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    scheduler.resume();

    res.json({ message: 'Scheduler resumed' });
  } catch (error) {
    log.error('Failed to resume scheduler', error);
    res.status(500).json({ error: 'Failed to resume scheduler' });
  }
});

/**
 * POST /api/system/capture
 * Manually trigger a screenshot capture
 */
router.post('/system/capture', async (req: Request, res: Response) => {
  try {
    const scheduler = getScheduler();
    const screenshot = await scheduler.triggerManualCapture();

    if (!screenshot) {
      return res.status(500).json({ error: 'Failed to capture screenshot' });
    }

    res.json({ screenshot });
  } catch (error) {
    log.error('Failed to trigger manual capture', error);
    res.status(500).json({ error: 'Failed to trigger manual capture' });
  }
});

/**
 * GET /api/system/settings
 * Get system settings
 */
router.get('/system/settings', (req: Request, res: Response) => {
  try {
    res.json({
      captureIntervalMinutes: config.captureIntervalMinutes,
      screenshotQuality: config.screenshotQuality,
      maxScreenshotAgeDays: config.maxScreenshotAgeDays,
      ollamaBaseUrl: config.ollamaBaseUrl,
      ollamaModel: config.ollamaModel,
      privacyBlurPasswords: config.privacyBlurPasswords,
      privacyBlurCreditCards: config.privacyBlurCreditCards,
      privacyBlurEmails: config.privacyBlurEmails,
    });
  } catch (error) {
    log.error('Failed to get settings', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

export default router;
