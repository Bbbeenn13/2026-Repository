/**
 * Ollama AI Integration Module
 */

import Ollama from 'ollama';
import fs from 'fs';
import path from 'path';
import { config } from '../config/settings';
import { OLLAMA_PROMPTS } from '../config/constants';
import { analysisLog, log } from '../utils/logger';
import { ActivityCategory, ScreenshotMetadata } from '../storage/models';

export interface AnalysisResult {
  activity: string;
  category: ActivityCategory;
  confidence: number;
  description: string;
  productivityScore: number;
  detectedApps: string[];
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout: number;
}

export class OllamaAnalyzer {
  private client: Ollama;
  private config: OllamaConfig;
  private available: boolean = false;

  constructor(customConfig?: Partial<OllamaConfig>) {
    this.config = {
      baseUrl: customConfig?.baseUrl || config.ollamaBaseUrl,
      model: customConfig?.model || config.ollamaModel,
      timeout: customConfig?.timeout || config.ollamaTimeout,
    };

    this.client = new Ollama({ host: this.config.baseUrl });

    // Check availability
    this.checkAvailability();
  }

  /**
   * Check if Ollama service is available
   */
  private async checkAvailability(): Promise<void> {
    try {
      await this.client.list();
      this.available = true;
      log.info('Ollama service is available');
    } catch (error) {
      this.available = false;
      log.warn('Ollama service is not available. Analysis will use fallback mode.');
    }
  }

  /**
   * Check if service is available
   */
  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  /**
   * Analyze screenshot image
   */
  async analyzeScreenshot(imagePath: string, metadata?: ScreenshotMetadata): Promise<AnalysisResult | null> {
    if (!this.available) {
      return this.fallbackAnalysis(metadata);
    }

    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Screenshot file not found: ${imagePath}`);
      }

      // Read image as base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Build prompt
      const prompt = this.buildAnalysisPrompt(metadata);

      analysisLog.started(path.basename(imagePath));

      // Call Ollama
      const response = await this.client.chat({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [base64Image],
          },
        ],
        format: 'json',
        options: {
          temperature: 0.3, // Lower temperature for more consistent results
        },
      });

      // Parse response
      const result = this.parseAnalysisResponse(response);
      analysisLog.completed(path.basename(imagePath), result);

      return result;
    } catch (error) {
      analysisLog.failed(path.basename(imagePath), error as Error);
      return this.fallbackAnalysis(metadata);
    }
  }

  /**
   * Build prompt for screenshot analysis
   */
  private buildAnalysisPrompt(metadata?: ScreenshotMetadata): string {
    let prompt = OLLAMA_PROMPTS.ANALYZE_SCREENSHOT;

    if (metadata) {
      prompt += `\n\nContext information:\n`;
      prompt += `- Active window: ${metadata.activeWindowTitle || 'Unknown'}\n`;
      prompt += `- Application: ${metadata.activeWindowApp || 'Unknown'}\n`;
      prompt += `- Timestamp: ${metadata.timestamp.toISOString()}\n`;
    }

    return prompt;
  }

  /**
   * Parse Ollama response
   */
  private parseAnalysisResponse(response: any): AnalysisResult {
    try {
      const content = response.message.content;

      // Try to parse JSON
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Extract JSON from markdown code block if present
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON from response');
        }
      }

      return {
        activity: parsed.activity || 'Unknown activity',
        category: this.validateCategory(parsed.category),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        description: parsed.description || '',
        productivityScore: typeof parsed.productivityScore === 'number'
          ? Math.min(100, Math.max(0, parsed.productivityScore))
          : 50,
        detectedApps: Array.isArray(parsed.detectedApps) ? parsed.detectedApps : [],
      };
    } catch (error) {
      log.error('Failed to parse Ollama response', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Validate and normalize category
   */
  private validateCategory(category: string): ActivityCategory {
    const validCategories: ActivityCategory[] = [
      'work',
      'development',
      'communication',
      'entertainment',
      'browsing',
      'learning',
      'other',
    ];

    const normalized = category?.toLowerCase();
    if (validCategories.includes(normalized as ActivityCategory)) {
      return normalized as ActivityCategory;
    }

    return 'other';
  }

  /**
   * Get default analysis when parsing fails
   */
  private getDefaultAnalysis(): AnalysisResult {
    return {
      activity: 'Unknown activity',
      category: 'other',
      confidence: 0.0,
      description: 'Unable to analyze screenshot',
      productivityScore: 50,
      detectedApps: [],
    };
  }

  /**
   * Fallback analysis when Ollama is unavailable
   */
  private fallbackAnalysis(metadata?: ScreenshotMetadata): AnalysisResult {
    if (!metadata) {
      return this.getDefaultAnalysis();
    }

    // Simple rule-based analysis
    const app = metadata.activeWindowApp?.toLowerCase() || '';
    const title = metadata.activeWindowTitle?.toLowerCase() || '';

    let category: ActivityCategory = 'other';
    let activity = 'Using ' + metadata.activeWindowApp;
    let productivityScore = 50;

    // Development apps
    if (app.includes('code') || app.includes('visual studio') || app.includes('intellij') ||
        app.includes('eclipse') || app.includes('atom') || app.includes('sublime')) {
      category = 'development';
      activity = 'Coding in ' + metadata.activeWindowApp;
      productivityScore = 95;
    }
    // Communication apps
    else if (app.includes('slack') || app.includes('teams') || app.includes('zoom') ||
             app.includes('discord') || app.includes('skype')) {
      category = 'communication';
      activity = 'Communication on ' + metadata.activeWindowApp;
      productivityScore = 60;
    }
    // Browsers
    else if (app.includes('chrome') || app.includes('firefox') || app.includes('edge') ||
             app.includes('safari') || app.includes('brave')) {
      category = 'browsing';
      activity = 'Browsing the web';
      productivityScore = 40;

      // Check for productive browsing
      if (title.includes('github') || title.includes('stackoverflow') || title.includes('documentation')) {
        category = 'learning';
        productivityScore = 75;
      } else if (title.includes('youtube') || title.includes('twitter') || title.includes('reddit')) {
        category = 'entertainment';
        productivityScore = 10;
      }
    }
    // Entertainment
    else if (app.includes('spotify') || app.includes('netflix') || app.includes('steam') ||
             app.includes('games')) {
      category = 'entertainment';
      activity = 'Entertainment on ' + metadata.activeWindowApp;
      productivityScore = 10;
    }
    // Work apps
    else if (app.includes('word') || app.includes('excel') || app.includes('powerpoint') ||
             app.includes('outlook') || app.includes('office')) {
      category = 'work';
      activity = 'Working on ' + metadata.activeWindowApp;
      productivityScore = 85;
    }

    return {
      activity,
      category,
      confidence: 0.7,
      description: `Detected application: ${metadata.activeWindowApp}, Window: ${metadata.activeWindowTitle}`,
      productivityScore,
      detectedApps: [metadata.activeWindowApp || 'Unknown'],
    };
  }

  /**
   * Generate daily summary from screenshots
   */
  async generateDailySummary(screenshots: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult }>): Promise<string> {
    if (!this.available || screenshots.length === 0) {
      return this.generateFallbackSummary(screenshots);
    }

    try {
      // Build summary data
      const summaryData = screenshots.map(s => ({
        time: s.metadata.timestamp.toLocaleTimeString(),
        activity: s.analysis.activity,
        category: s.analysis.category,
        app: s.metadata.activeWindowApp,
      }));

      const prompt = `${OLLAMA_PROMPTS.GENERATE_SUMMARY}

Here's the activity data for the day:
${JSON.stringify(summaryData, null, 2)}

Total screenshots: ${screenshots.length}`;

      const response = await this.client.chat({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.message.content || this.generateFallbackSummary(screenshots);
    } catch (error) {
      log.error('Failed to generate daily summary', error);
      return this.generateFallbackSummary(screenshots);
    }
  }

  /**
   * Generate fallback summary without AI
   */
  private generateFallbackSummary(screenshots: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult }>): string {
    if (screenshots.length === 0) {
      return 'No activity data available for this day.';
    }

    // Count by category
    const categoryCount: Record<string, number> = {};
    const appCount: Record<string, number> = {};

    screenshots.forEach(s => {
      categoryCount[s.analysis.category] = (categoryCount[s.analysis.category] || 0) + 1;
      const app = s.metadata.activeWindowApp || 'Unknown';
      appCount[app] = (appCount[app] || 0) + 1;
    });

    // Build summary
    let summary = `Daily Activity Summary\n`;
    summary += `======================\n\n`;
    summary += `Total screenshots captured: ${screenshots.length}\n\n`;

    summary += `Activity Breakdown:\n`;
    Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([cat, count]) => {
        const percentage = ((count / screenshots.length) * 100).toFixed(1);
        summary += `- ${cat}: ${count} screenshots (${percentage}%)\n`;
      });

    summary += `\nTop Applications:\n`;
    Object.entries(appCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([app, count]) => {
        summary += `- ${app}: ${count} screenshots\n`;
      });

    return summary;
  }

  /**
   * Generate productivity suggestions
   */
  async generateSuggestions(
    screenshots: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult }>
  ): Promise<string[]> {
    if (!this.available) {
      return this.generateFallbackSuggestions(screenshots);
    }

    try {
      const summaryData = screenshots.map(s => ({
        time: s.metadata.timestamp.toLocaleTimeString(),
        activity: s.analysis.activity,
        category: s.analysis.category,
        productivityScore: s.analysis.productivityScore,
      }));

      const prompt = `${OLLAMA_PROMPTS.GENERATE_SUGGESTIONS}

Activity data:
${JSON.stringify(summaryData, null, 2)}`;

      const response = await this.client.chat({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Parse suggestions from response
      const content = response.message.content;
      const suggestions = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0);

      return suggestions.length > 0 ? suggestions : this.generateFallbackSuggestions(screenshots);
    } catch (error) {
      log.error('Failed to generate suggestions', error);
      return this.generateFallbackSuggestions(screenshots);
    }
  }

  /**
   * Generate fallback suggestions
   */
  private generateFallbackSuggestions(
    screenshots: Array<{ metadata: ScreenshotMetadata; analysis: AnalysisResult }>
  ): string[] {
    const suggestions: string[] = [];

    if (screenshots.length === 0) {
      return ['Start tracking your screen time to receive personalized suggestions.'];
    }

    // Analyze patterns
    const lowProductivity = screenshots.filter(s => s.analysis.productivityScore < 50);
    const entertainment = screenshots.filter(s => s.analysis.category === 'entertainment');
    const browsing = screenshots.filter(s => s.analysis.category === 'browsing');

    if (lowProductivity.length > screenshots.length * 0.5) {
      suggestions.push('Consider focusing more on high-value activities. Your productivity score was below 50% for most of the day.');
    }

    if (entertainment.length > screenshots.length * 0.3) {
      suggestions.push('You spent over 30% of your time on entertainment. Try setting limits to improve focus.');
    }

    if (browsing.length > screenshots.length * 0.4) {
      suggestions.push('Web browsing accounted for a significant portion of your day. Consider using website blockers during work hours.');
    }

    const development = screenshots.filter(s => s.analysis.category === 'development');
    if (development.length > 0) {
      suggestions.push(`Great job on development work! You had ${development.length} coding sessions today.`);
    }

    if (suggestions.length === 0) {
      suggestions.push('Keep up the good work! Your activity patterns look balanced.');
    }

    return suggestions;
  }
}

// Singleton instance
let ollamaInstance: OllamaAnalyzer | null = null;

export function getOllamaAnalyzer(): OllamaAnalyzer {
  if (!ollamaInstance) {
    ollamaInstance = new OllamaAnalyzer();
  }
  return ollamaInstance;
}
