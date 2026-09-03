import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '../../api/apiClient.js';
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password' })
      .min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    if (!token) {
      setServerError('Reset token is missing from the link. Please request a new reset link.');
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword
      });
      setIsSuccess(true);
    } catch (err) {
      setServerError(
        err.message || 'Invalid or expired password reset link. Please request a new link.'
      );
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
            Set New Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose a secure, strong password for your InterviewAI account
          </p>
        </div>

        {/* STATE 1: Missing Token in URL */}
        {!token && !isSuccess && (
          <div className="space-y-4 text-center rounded-2xl bg-amber-50 p-6 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Missing or Invalid Reset Link
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              No reset token was detected in your link URL. Please request a fresh password reset email.
            </p>
            <div className="pt-2">
              <Link
                to="/forgot-password"
                className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        )}

        {/* STATE 2: Successful Password Reset */}
        {isSuccess && (
          <div className="space-y-4 text-center rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Password Reset Successful
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Your password has been successfully updated. All previous active sessions have been invalidated for security.
            </p>
            <div className="pt-3">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition"
              >
                Sign In with New Password
              </Link>
            </div>
          </div>
        )}

        {/* STATE 3: Active Reset Password Form */}
        {token && !isSuccess && (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-2">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">{serverError}</p>
                </div>
                <div className="text-right pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 underline"
                  >
                    Request a new reset link &rarr;
                  </Link>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters with letters and numbers"
                  {...register('newPassword')}
                  className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
                    errors.newPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  {...register('confirmPassword')}
                  className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-brand-600" /> Password Requirements:
              </span>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Minimum 8 characters (maximum 128)</li>
                <li>At least one letter and one numerical digit</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Reset Password</span>
                </>
              )}
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

export default ResetPasswordPage;
