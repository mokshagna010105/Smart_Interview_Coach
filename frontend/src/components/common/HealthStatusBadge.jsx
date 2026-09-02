import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import apiClient from '../../api/apiClient.js';

export const HealthStatusBadge = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['backendHealth'],
    queryFn: async () => {
      const res = await apiClient.get('/health');
      return res.data;
    },
    refetchInterval: 30000,
    retry: 1
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Backend API Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live connectivity to Express server
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
            <span>Verifying backend service connectivity...</span>
          </div>
        ) : isError ? (
          <div className="flex items-start space-x-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Backend Connection Failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {error?.message || 'Ensure the backend server is running on port 5000.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Connected • API v1 Operational
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Service</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{data?.service}</span>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Environment</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase">{data?.environment}</span>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Uptime</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{data?.uptime}s</span>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Version</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">v{data?.version}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthStatusBadge;
