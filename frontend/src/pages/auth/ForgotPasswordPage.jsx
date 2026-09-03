import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient.js';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase()
});

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If a reset token is present in the URL query string, redirect to the reset password form
  useEffect(() => {
    if (token) {
      navigate(`/reset-password?token=${encodeURIComponent(token)}`, { replace: true });
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Unable to process request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Reset Instructions Sent
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              If an account exists with this email address, you will receive password recovery instructions shortly.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="flex items-start space-x-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300">{serverError}</p>
              </div>
            )}

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Dispatching...' : 'Send Recovery Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
