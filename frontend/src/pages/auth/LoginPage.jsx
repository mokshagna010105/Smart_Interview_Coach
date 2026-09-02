import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Bot, LogIn, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
            <Bot className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to continue your AI mock interview practice
          </p>
        </div>

        {serverError && (
          <div className="flex items-start space-x-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-700 dark:text-red-300">{serverError}</p>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
