/**
 * Daily Activity Summarizer
 */

import { getDatabase } from '../storage/database';
import { getOllamaAnalyzer } from '../core/ollama';
import { generateId, DailySummary, ActivityBreakdown, ScreenshotMetadata, AnalysisResult } from '../storage/models';
import { config } from '../config/settings';
import { PRODUCTIVITY_SCORES } from '../config/constants';
import { analysisLog } from '../utils/logger';

export class ActivitySummarizer {
  /**
   * Generate daily summary
   */
  async generateDailySummary(date: Date): Promise<DailySummary | null> {
    try {
      const db = getDatabase(config.dbPath);

      // Get all screenshots for the date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const screenshots = db.getScreenshotsByDateRange(startDate, endDate);

      if (screenshots.length === 0) {
        analysisLog.info(`No screenshots found for ${date.toISOString()}`);
        return null;
      }

      // Get analysis results for each screenshot
      const screenshotsWithAnalysis: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult | null }> = [];

      for (const screenshot of screenshots) {
        const analysis = db.getAnalysisByScreenshotId(screenshot.id);
        screenshotsWithAnalysis.push({
          metadata: screenshot,
          analysis,
        });
      }

      // Generate summary text
      const analyzer = getOllamaAnalyzer();
      const summaryText = await analyzer.generateDailySummary(
        screenshotsWithAnalysis.filter(s => s.analysis !== null) as any
      );

      // Calculate activity breakdown
      const activitiesBreakdown = this.calculateActivityBreakdown(screenshotsWithAnalysis);

      // Calculate productivity score
      const productivityScore = this.calculateProductivityScore(screenshotsWithAnalysis);

      // Generate suggestions
      const suggestions = await analyzer.generateSuggestions(
        screenshotsWithAnalysis.filter(s => s.analysis !== null) as any
      );

      // Create daily summary
      const summary: DailySummary = {
        id: generateId(),
        date,
        summaryText,
        totalScreenshots: screenshots.length,
        activitiesBreakdown,
        productivityScore,
        suggestions,
        createdAt: new Date(),
      };

      // Save to database
      db.saveDailySummary(summary);

      analysisLog.summaryGenerated(date.toISOString(), screenshots.length);

      return summary;
    } catch (error) {
      analysisLog.error(`Failed to generate summary for ${date.toISOString()}`, error);
      return null;
    }
  }

  /**
   * Calculate activity breakdown
   */
  private calculateActivityBreakdown(
    screenshots: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult | null }>
  ): ActivityBreakdown[] {
    const categoryDurations: Record<string, { duration: number; count: number }> = {};

    for (const item of screenshots) {
      const category = item.analysis?.category || 'other';
      const duration = config.captureIntervalMinutes;

      if (!categoryDurations[category]) {
        categoryDurations[category] = { duration: 0, count: 0 };
      }

      categoryDurations[category].duration += duration;
      categoryDurations[category].count += 1;
    }

    const totalDuration = Object.values(categoryDurations).reduce((sum, cat) => sum + cat.duration, 0);

    return Object.entries(categoryDurations)
      .map(([category, data]) => ({
        category: category as any,
        duration: data.duration,
        percentage: (data.duration / totalDuration) * 100,
        screenshotCount: data.count,
      }))
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Calculate overall productivity score
   */
  private calculateProductivityScore(
    screenshots: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult | null }>
  ): number {
    if (screenshots.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let count = 0;

    for (const item of screenshots) {
      const score = item.analysis?.productivityScore;
      if (typeof score === 'number') {
        totalScore += score;
        count++;
      }
    }

    return count > 0 ? Math.round(totalScore / count) : 50;
  }

  /**
   * Generate weekly summary
   */
  async generateWeeklySummary(startDate: Date): Promise<string> {
    const summaries: DailySummary[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const db = getDatabase(config.dbPath);
      const summary = db.getDailySummary(date);

      if (summary) {
        summaries.push(summary);
      }
    }

    if (summaries.length === 0) {
      return 'No data available for this week.';
    }

    // Calculate weekly stats
    const totalScreenshots = summaries.reduce((sum, s) => sum + s.totalScreenshots, 0);
    const avgProductivity = Math.round(
      summaries.reduce((sum, s) => sum + s.productivityScore, 0) / summaries.length
    );

    // Aggregate activities
    const categoryTotals: Record<string, number> = {};
    summaries.forEach(summary => {
      summary.activitiesBreakdown.forEach(activity => {
        categoryTotals[activity.category] = (categoryTotals[activity.category] || 0) + activity.duration;
      });
    });

    let weeklySummary = `Weekly Activity Summary (${startDate.toLocaleDateString()} - `;
    weeklySummary += `${new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()})\n`;
    weeklySummary += '='.repeat(80) + '\n\n';
    weeklySummary += `Total screenshots: ${totalScreenshots}\n`;
    weeklySummary += `Average productivity score: ${avgProductivity}/100\n\n`;

    weeklySummary += `Time allocation by category:\n`;
    Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, duration]) => {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        weeklySummary += `- ${category}: ${hours}h ${minutes}m\n`;
      });

    return weeklySummary;
  }
}

// Singleton instance
let summarizerInstance: ActivitySummarizer | null = null;

export function getActivitySummarizer(): ActivitySummarizer {
  if (!summarizerInstance) {
    summarizerInstance = new ActivitySummarizer();
  }
  return summarizerInstance;
}
