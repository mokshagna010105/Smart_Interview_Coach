import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Bot, Sparkles, LogOut, User, FileText, LayoutDashboard, PlayCircle, History } from 'lucide-react';

export const Header = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mock Interview', path: '/interview/setup', icon: PlayCircle },
    { name: 'History', path: '/interview/history', icon: History },
    { name: 'Resume', path: '/resume', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interview<span className="text-brand-600">AI</span>
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Sparkles className="mr-1 h-3 w-3" /> Coach
            </span>
          </div>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="mr-1.5 h-3.5 w-3.5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="hidden sm:block text-xs font-medium text-slate-600 dark:text-slate-300">
                {profile?.fullName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-brand-500/25 hover:bg-brand-700 transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
