import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interview<span className="text-brand-600">AI</span>
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Sparkles className="mr-1 h-3 w-3" /> Smart Coach
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Phase 1 • Foundation
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
