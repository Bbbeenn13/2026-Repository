'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Activity,
  Clock,
  AlertCircle,
  TrendingUp,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';

interface DashboardData {
  date: string;
  totalScreenshots: number;
  summary?: {
    summaryText: string;
    productivityScore: number;
    suggestions: string[];
  };
  categoryBreakdown: Array<{
    category: string;
    totalDuration: number;
    percentage: number;
  }>;
  topApps: Array<{
    appName: string;
    category: string;
    totalDuration: number;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<{ running: boolean; paused: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchSystemStatus();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/today');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system/status');
      const result = await response.json();
      setStatus(result);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  const handlePauseResume = async () => {
    try {
      const endpoint = status?.running && !status?.paused ? '/api/system/pause' : '/api/system/resume';
      await fetch(endpoint, { method: 'POST' });
      fetchSystemStatus();
    } catch (error) {
      console.error('Failed to pause/resume:', error);
    }
  };

  const handleManualCapture = async () => {
    setCapturing(true);
    try {
      await fetch('/api/system/capture', { method: 'POST' });
      setTimeout(() => {
        fetchDashboardData();
        setCapturing(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to capture:', error);
      setCapturing(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-500',
      development: 'bg-green-500',
      communication: 'bg-purple-500',
      entertainment: 'bg-red-500',
      browsing: 'bg-yellow-500',
      learning: 'bg-indigo-500',
      other: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Screen Tracker</h1>
              <p className="text-sm text-gray-500">
                {data?.date && format(new Date(data.date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                {status?.paused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={handleManualCapture}
                disabled={capturing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${capturing ? 'animate-spin' : ''}`} />
                Capture Now
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg ${
            status.running && !status.paused
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {status.running && !status.paused ? (
                <Activity className="w-5 h-5 text-green-600" />
              ) : (
                <Pause className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-medium">
                {status.running && !status.paused
                  ? 'Tracking Active'
                  : status.paused
                  ? 'Tracking Paused'
                  : 'Tracking Stopped'}
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Screenshots Today</span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data?.totalScreenshots || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Productivity Score</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data?.summary?.productivityScore || 0}/100
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Time</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatDuration(
                data?.categoryBreakdown.reduce((sum, cat) => sum + cat.totalDuration, 0) || 0
              )}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Time by Category</h2>
            <div className="space-y-3">
              {data?.categoryBreakdown.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDuration(category.totalDuration)} ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${getCategoryColor(category.category)} h-2 rounded-full transition-all`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Applications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Applications</h2>
            <div className="space-y-3">
              {data?.topApps.slice(0, 5).map((app, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.appName}</p>
                      <p className="text-xs text-gray-500 capitalize">{app.category}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDuration(app.totalDuration)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {data?.summary && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{data.summary.summaryText}</p>
            </div>
          )}

          {/* Suggestions */}
          {data?.summary && data.summary.suggestions.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Suggestions for Improvement
              </h2>
              <ul className="space-y-2">
                {data.summary.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
