import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Smart Interview Coach (InterviewAI). Built with React + Node.js (Pure JavaScript).
        </p>
        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <span>Production-Quality Portfolio Architecture</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
