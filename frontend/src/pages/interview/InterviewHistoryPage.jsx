import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient.js';
import {
  Bot,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const InterviewHistoryPage = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: interviews = [], isLoading, refetch } = useQuery({
    queryKey: ['userInterviews', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/interviews?status=${statusFilter}` : '/interviews';
      const res = await apiClient.get(url);
      return res.data || [];
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300 animate-pulse">
            <Play className="mr-1 h-3 w-3 fill-current" /> In Progress
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Paused
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Ready to Start
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Interview Practice History
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review past mock interview sessions, resume in-progress interviews, and track your practice progress.
          </p>
        </div>

        <Link
          to="/interview/setup"
          className="inline-flex items-center rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Mock Interview
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2">
        {['', 'COMPLETED', 'IN_PROGRESS', 'READY', 'PAUSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
            }`}
          >
            {st === '' ? 'All Sessions' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-600" />
          <span>Loading interview history...</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <Bot className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No interviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't conducted any mock interviews matching this filter yet.
          </p>
          <Link
            to="/interview/setup"
            className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-700 transition"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Start First Mock Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 gap-4 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  {getStatusBadge(item.status)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Role: <strong>{item.targetRole}</strong></span>
                  <span>•</span>
                  <span>Difficulty: <strong>{item.difficulty}</strong></span>
                  <span>•</span>
                  <span>Questions: <strong>{item.questionCount}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong>{item.timeLimitMinutes} mins</strong></span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <Link
                  to={`/interview/room/${item._id}`}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition"
                >
                  {item.status === 'COMPLETED' ? 'View Room' : 'Enter Interview'}
                  <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
