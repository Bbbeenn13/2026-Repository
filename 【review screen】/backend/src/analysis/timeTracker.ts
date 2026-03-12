/**
 * Time Allocation Tracker
 */

import { getDatabase } from '../storage/database';
import { config } from '../config/settings';
import { ActivityCategory } from '../storage/models';

export interface TimeAllocation {
  appName: string;
  category: ActivityCategory;
  totalDuration: number; // in minutes
  count: number;
}

export interface CategoryTimeAllocation {
  category: ActivityCategory;
  totalDuration: number;
  percentage: number;
}

export interface HourStats {
  hour: number; // 0-23
  screenshotCount: number;
  mostActiveCategory: ActivityCategory;
}

export class TimeTracker {
  /**
   * Get time allocation for a specific date
   */
  getTimeAllocation(date: Date): TimeAllocation[] {
    const db = getDatabase(config.dbPath);
    return db.getTimeAllocationByDate(date);
  }

  /**
   * Get time allocation for a date range
   */
  getTimeAllocationByDateRange(startDate: Date, endDate: Date): TimeAllocation[] {
    const db = getDatabase(config.dbPath);
    return db.getTimeAllocationByDateRange(startDate, endDate);
  }

  /**
   * Get category breakdown for a specific date
   */
  getCategoryBreakdown(date: Date): CategoryTimeAllocation[] {
    const db = getDatabase(config.dbPath);
    const rawData = db.getCategoryBreakdownByDate(date);

    return rawData.map(item => ({
      category: item.category as ActivityCategory,
      totalDuration: item.totalDuration,
      percentage: item.percentage,
    }));
  }

  /**
   * Get most productive hours for a specific date
   */
  getMostProductiveHours(date: Date): HourStats[] {
    const db = getDatabase(config.dbPath);

    // Get all screenshots for the date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const screenshots = db.getScreenshotsByDateRange(startDate, endDate);

    // Group by hour
    const hourStats: Map<number, { count: number; categories: Map<ActivityCategory, number> }> = new Map();

    screenshots.forEach(screenshot => {
      const hour = screenshot.timestamp.getHours();

      if (!hourStats.has(hour)) {
        hourStats.set(hour, { count: 0, categories: new Map() });
      }

      const stats = hourStats.get(hour)!;
      stats.count++;

      // Get analysis to determine category
      const analysis = db.getAnalysisByScreenshotId(screenshot.id);
      const category = analysis?.category || 'other';

      stats.categories.set(category, (stats.categories.get(category) || 0) + 1);
    });

    // Convert to HourStats array
    const result: HourStats[] = [];

    hourStats.forEach((stats, hour) => {
      // Find most active category
      let mostActiveCategory: ActivityCategory = 'other';
      let maxCount = 0;

      stats.categories.forEach((count, category) => {
        if (count > maxCount) {
          maxCount = count;
          mostActiveCategory = category;
        }
      });

      result.push({
        hour,
        screenshotCount: stats.count,
        mostActiveCategory,
      });
    });

    // Sort by screenshot count descending
    return result.sort((a, b) => b.screenshotCount - a.screenshotCount);
  }

  /**
   * Get top applications for a specific date
   */
  getTopApplications(date: Date, limit: number = 10): TimeAllocation[] {
    const allocations = this.getTimeAllocation(date);
    return allocations.slice(0, limit);
  }

  /**
   * Calculate total tracked time for a date
   */
  getTotalTrackedTime(date: Date): number {
    const allocations = this.getTimeAllocation(date);
    return allocations.reduce((sum, alloc) => sum + alloc.totalDuration, 0);
  }

  /**
   * Get daily comparison for the past N days
   */
  getDailyComparison(days: number = 7): Array<{
    date: Date;
    totalDuration: number;
    productivityScore: number;
  }> {
    const db = getDatabase(config.dbPath);
    const result: Array<{ date: Date; totalDuration: number; productivityScore: number }> = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const summary = db.getDailySummary(date);

      if (summary) {
        const allocations = this.getTimeAllocation(date);
        const totalDuration = allocations.reduce((sum, alloc) => sum + alloc.totalDuration, 0);

        result.push({
          date,
          totalDuration,
          productivityScore: summary.productivityScore,
        });
      }
    }

    return result;
  }

  /**
   * Get category trends over time
   */
  getCategoryTrends(days: number = 7): Map<ActivityCategory, Array<{ date: Date; duration: number }>> {
    const trends = new Map<ActivityCategory, Array<{ date: Date; duration: number }>>();
    const db = getDatabase(config.dbPath);

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const breakdown = this.getCategoryBreakdown(date);

      breakdown.forEach(item => {
        if (!trends.has(item.category)) {
          trends.set(item.category, []);
        }

        trends.get(item.category)!.push({
          date,
          duration: item.totalDuration,
        });
      });
    }

    return trends;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Calculate percentage of total time
   */
  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }
}

// Singleton instance
let timeTrackerInstance: TimeTracker | null = null;

export function getTimeTracker(): TimeTracker {
  if (!timeTrackerInstance) {
    timeTrackerInstance = new TimeTracker();
  }
  return timeTrackerInstance;
}
