import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext.jsx';
import apiClient from '../../api/apiClient.js';
import {
  Bot,
  FileText,
  User,
  Play,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  History,
  PlayCircle
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, profile } = useAuth();

  const primarySkills = profile?.primarySkills || ['JavaScript', 'React', 'Node.js'];
  const targetCompanies = profile?.targetCompanies || ['Google', 'Amazon', 'Microsoft'];

  // Fetch recent interviews
  const { data: interviews = [] } = useQuery({
    queryKey: ['userRecentInterviews'],
    queryFn: async () => {
      const res = await apiClient.get('/interviews?limit=3');
      return res.data || [];
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-brand-600 to-indigo-700 p-8 text-white shadow-xl shadow-brand-500/10 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Mock Interview Training Ground</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome, {profile?.fullName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-brand-100 max-w-xl">
              Targeting: <span className="font-semibold text-white">{profile?.targetRole || 'Software Engineer'}</span> ({profile?.experienceLevel || 'Intermediate'} level)
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/interview/setup"
              className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-xs font-bold text-brand-900 shadow-md hover:bg-brand-50 transition"
            >
              <Play className="mr-2 h-4 w-4 fill-current text-brand-600" /> Start Mock Interview
            </Link>
            <Link
              to="/resume"
              className="inline-flex items-center rounded-xl bg-brand-800/60 border border-white/20 px-4 py-3 text-xs font-bold text-white hover:bg-brand-800 transition"
            >
              <FileText className="mr-2 h-4 w-4" /> Manage Resume
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mocks Conducted</span>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {interviews.length}
          </p>
          <span className="mt-1 block text-xs text-slate-500">Practice sessions created</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Level</span>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {profile?.experienceLevel || 'INTERMEDIATE'}
          </p>
          <span className="mt-1 block text-xs text-slate-500">Profile difficulty</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preferred Type</span>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {profile?.preferredInterviewType || 'TECHNICAL'}
          </p>
          <span className="mt-1 block text-xs text-slate-500">Configured default</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Tier</span>
          <div className="mt-2 flex items-center space-x-1.5 text-emerald-600 font-bold text-base">
            <CheckCircle2 className="h-5 w-5" />
            <span>Active (Free)</span>
          </div>
          <span className="mt-1 block text-xs text-slate-500">Role: {user?.role}</span>
        </div>
      </div>

      {/* Recent Interviews Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
            <History className="mr-2 h-4 w-4 text-brand-600" /> Recent Mock Interviews
          </h2>
          <Link to="/interview/history" className="text-xs font-bold text-brand-600 hover:text-brand-500">
            View All History &rarr;
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No mock interviews conducted yet. Click "Start Mock Interview" to launch your first session.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviews.map((item) => (
              <Link
                key={item._id}
                to={`/interview/room/${item._id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-brand-500 hover:bg-brand-50/20 dark:border-slate-800 dark:bg-slate-950 transition space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase rounded-md bg-brand-50 px-2 py-0.5 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>{item.questionCount} Questions</span>
                  <span>{item.timeLimitMinutes} mins</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Target Skills & Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Skills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Target Skills & Technologies
            </h3>
            <Link to="/profile" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              Edit Skills
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            InterviewAI customizes question banks and evaluation rubrics based on these primary skills:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {primarySkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-100 dark:border-brand-900"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Target Companies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Target Companies
            </h3>
            <Link to="/profile" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
              Edit Companies
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Questions will emulate hiring standards and problem styles for:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {targetCompanies.map((company, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
