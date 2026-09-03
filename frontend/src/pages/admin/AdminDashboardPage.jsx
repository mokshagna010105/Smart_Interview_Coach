import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext.jsx';
import apiClient from '../../api/apiClient.js';
import {
  Shield,
  Users,
  Bot,
  Award,
  MessageSquare,
  Activity,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Server
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('STATS'); // 'STATS' | 'USERS' | 'FEEDBACK'

  const isAdmin = user?.role === 'ADMIN';

  // 1. Fetch Admin Stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats');
      return res.data;
    },
    enabled: isAdmin
  });

  // 2. Fetch Users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data;
    },
    enabled: isAdmin && activeTab === 'USERS'
  });

  // 3. Fetch Feedback
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['adminFeedback'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/feedback');
      return res.data;
    },
    enabled: isAdmin && activeTab === 'FEEDBACK'
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-red-200 bg-red-50 text-center dark:border-red-900 dark:bg-red-950/30 space-y-3">
        <Shield className="mx-auto h-12 w-12 text-red-600 mb-2" />
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Access Denied</h2>
        <p className="text-xs text-red-700 dark:text-red-400">
          This administration dashboard is restricted to users with the verified ADMIN role.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Platform Administration & RBAC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Admin System Console
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitor platform utilization, user registrations, interview mock volume, and candidate feedback.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { id: 'STATS', label: 'System Overview' },
            { id: 'USERS', label: 'User Directory' },
            { id: 'FEEDBACK', label: 'Feedback Stream' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'STATS' && (
        <div className="space-y-8">
          {statsLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-xs space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-brand-600" />
              <span>Loading admin statistics...</span>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                    <Users className="h-4 w-4 text-brand-600" />
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                    {stats?.totalUsers || 0}
                  </p>
                  <span className="mt-1 block text-xs text-slate-500">Registered candidates</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Mocks</span>
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {stats?.totalInterviews || 0}
                  </p>
                  <span className="mt-1 block text-xs text-slate-500">{stats?.completedInterviews || 0} completed</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Evaluated Answers</span>
                    <Award className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {stats?.totalEvaluations || 0}
                  </p>
                  <span className="mt-1 block text-xs text-slate-500">Avg score: {stats?.averagePlatformScore || 0}%</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Feedback</span>
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    {stats?.totalFeedback || 0}
                  </p>
                  <span className="mt-1 block text-xs text-slate-500">User ratings & reports</span>
                </div>
              </div>

              {/* System Diagnostics & Recent Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                    <Server className="mr-2 h-4 w-4 text-brand-600" /> Server Runtime Health
                  </h3>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-800 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{stats?.systemHealth?.nodeEnv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{Math.floor(stats?.systemHealth?.uptime || 0)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Heap Used:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {Math.round((stats?.systemHealth?.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-amber-500" /> Recent User Feedback
                  </h3>
                  {stats?.recentFeedback?.length === 0 ? (
                    <p className="text-xs text-slate-400">No feedback submissions received yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {stats?.recentFeedback?.map((fb) => (
                        <div key={fb._id} className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {fb.userId?.fullName || fb.userId?.email || 'Anonymous'}
                            </span>
                            <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              ★ {fb.rating}/5 ({fb.category})
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 truncate">{fb.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          {usersLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-xs space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-brand-600" />
              <span>Loading user directory...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Verified</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersData?.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isEmailVerified ? (
                          <span className="text-emerald-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEEDBACK STREAM */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-3">
          {feedbackLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-xs space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-brand-600" />
              <span>Loading user feedback...</span>
            </div>
          ) : feedbackData?.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-400">
              No feedback submissions recorded.
            </div>
          ) : (
            feedbackData?.map((fb) => (
              <div
                key={fb._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {fb.userId?.fullName || fb.userId?.email || 'User'}
                    </span>
                    <span className="text-[11px] text-slate-400">({fb.category})</span>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    ★ {fb.rating} / 5
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{fb.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{new Date(fb.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
