import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Interview<span className="text-brand-600">AI</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/interview/setup" className="hover:text-slate-900 dark:hover:text-white transition">
              Mock Interview
            </Link>
            <Link to="/analytics" className="hover:text-slate-900 dark:hover:text-white transition">
              Analytics
            </Link>
            <Link to="/resume" className="hover:text-slate-900 dark:hover:text-white transition">
              Resume Intelligence
            </Link>
            <Link to="/profile" className="hover:text-slate-900 dark:hover:text-white transition">
              Account Profile
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 pt-8 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} InterviewAI. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span>AI-Powered Interview Coach</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
