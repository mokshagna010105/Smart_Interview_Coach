import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Bot, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Must contain at least one letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await registerAuth({
        fullName: data.fullName,
        email: data.email,
        password: data.password
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your information.');
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
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start training for technical & behavioral interviews
          </p>
        </div>

        {serverError && (
          <div className="flex items-start space-x-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-700 dark:text-red-300">{serverError}</p>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Alex Johnson"
              {...register('fullName')}
              className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
                errors.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters with letters & numbers"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
                errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition mt-2"
          >
            {isSubmitting ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Create Free Account
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
