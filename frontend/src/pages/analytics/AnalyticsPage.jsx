import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { data: analytics, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Calculating aggregate performance trends and analytics...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-red-200 bg-red-50 text-center dark:border-red-900 dark:bg-red-950/30">
        <AlertCircle className="mx-auto h-10 w-10 text-red-600 mb-2" />
        <h2 className="text-base font-bold text-red-900 dark:text-red-200">Unable to load analytics</h2>
        <p className="text-xs text-red-700 dark:text-red-400">{error?.message || 'Error fetching analytics.'}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const scoreHistory = analytics?.scoreHistory || [];
  const hasData = scoreHistory.length > 0;

  // Format Bar Chart Data for Interview Types
  const typeChartData = [
    { type: 'Technical', score: analytics?.scoresByType?.TECHNICAL || 0 },
    { type: 'Behavioral', score: analytics?.scoresByType?.BEHAVIORAL || 0 },
    { type: 'HR & Fit', score: analytics?.scoresByType?.HR || 0 },
    { type: 'Case Study', score: analytics?.scoresByType?.CASE_STUDY || 0 }
  ];

  // Format Difficulty Bar Chart Data
  const diffChartData = [
    { level: 'Beginner', score: analytics?.scoresByDifficulty?.BEGINNER || 0 },
    { level: 'Intermediate', score: analytics?.scoresByDifficulty?.INTERMEDIATE || 0 },
    { level: 'Advanced', score: analytics?.scoresByDifficulty?.ADVANCED || 0 },
    { level: 'Expert', score: analytics?.scoresByDifficulty?.EXPERT || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300 mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Progress & Readiness Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Performance Analytics & Growth
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real historical metrics, score progression trajectories, and competency analytics based on your completed mock sessions.
          </p>
        </div>

        <Link
          to="/interview/setup"
          className="inline-flex items-center rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Start New Mock
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
          <p className="mt-2 text-3xl font-extrabold text-brand-600 dark:text-brand-400">
            {hasData ? `${analytics.averageOverallScore}%` : 'N/A'}
          </p>
          <span className="mt-1 block text-xs text-slate-500">Across evaluated sessions</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Sessions</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics.completedInterviews || 0}
          </p>
          <span className="mt-1 block text-xs text-slate-500">Total mocks finished</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions Answered</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {analytics.questionsMetrics?.totalAnswered || 0}
          </p>
          <span className="mt-1 block text-xs text-slate-500">
            {analytics.questionsMetrics?.totalSkipped || 0} questions skipped
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Filler Words</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {hasData ? analytics.questionsMetrics?.avgFillerWords : '0'}
          </p>
          <span className="mt-1 block text-xs text-slate-500">Per interview session</span>
        </div>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <Bot className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No evaluation data available yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete your first mock interview to generate performance charts, competency scores, and longitudinal progress tracking.
          </p>
          <Link
            to="/interview/setup"
            className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-700 transition"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Start First Mock Interview
          </Link>
        </div>
      ) : (
        /* Charts & Visualizations */
        <div className="space-y-8">
          {/* Chart 1: Longitudinal Score Progression */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Score Progression Over Time
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chronological performance across completed mock sessions
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreHistory}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}/100`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid: Performance by Type & by Difficulty */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 2: Average Score by Interview Type */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Average Score by Interview Type
              </h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`${val}%`, 'Avg Score']}
                    />
                    <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Average Score by Difficulty */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Average Score by Difficulty Level
              </h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diffChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="level" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px'
                      }}
                      formatter={(val) => [`${val}%`, 'Avg Score']}
                    />
                    <Bar dataKey="score" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Aggregate Chips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Top Validated Strengths
              </span>
              <div className="flex flex-wrap gap-2">
                {analytics.topStrengths?.length > 0 ? (
                  analytics.topStrengths.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" /> {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Complete more sessions to identify top strengths.</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Priority Growth Opportunities
              </span>
              <div className="flex flex-wrap gap-2">
                {analytics.topWeaknesses?.length > 0 ? (
                  analytics.topWeaknesses.map((w, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-100 dark:border-amber-900"
                    >
                      {w}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No recurring weaknesses identified yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
