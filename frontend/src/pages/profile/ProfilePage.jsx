import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { User, Save, CheckCircle2, AlertCircle, X, Plus, Sparkles } from 'lucide-react';

const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  targetRole: z.string().min(2, 'Target role is required').max(100),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  preferredInterviewType: z.enum(['TECHNICAL', 'BEHAVIORAL', 'HR', 'CASE_STUDY']),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional()
});

export const ProfilePage = () => {
  const { profile, updateProfile } = useAuth();

  const [skills, setSkills] = useState(profile?.primarySkills || ['JavaScript', 'React', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');

  const [companies, setCompanies] = useState(profile?.targetCompanies || ['Google', 'Amazon', 'Microsoft']);
  const [companyInput, setCompanyInput] = useState('');

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      targetRole: profile?.targetRole || 'Full Stack Software Engineer',
      experienceLevel: profile?.experienceLevel || 'INTERMEDIATE',
      preferredInterviewType: profile?.preferredInterviewType || 'TECHNICAL',
      bio: profile?.bio || ''
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        targetRole: profile.targetRole || 'Full Stack Software Engineer',
        experienceLevel: profile.experienceLevel || 'INTERMEDIATE',
        preferredInterviewType: profile.preferredInterviewType || 'TECHNICAL',
        bio: profile.bio || ''
      });
      setSkills(profile.primarySkills || ['JavaScript', 'React', 'Node.js']);
      setCompanies(profile.targetCompanies || ['Google', 'Amazon', 'Microsoft']);
    }
  }, [profile, reset]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addCompany = () => {
    const trimmed = companyInput.trim();
    if (trimmed && !companies.includes(trimmed)) {
      setCompanies([...companies, trimmed]);
      setCompanyInput('');
    }
  };

  const removeCompany = (companyToRemove) => {
    setCompanies(companies.filter(c => c !== companyToRemove));
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await updateProfile({
        ...data,
        primarySkills: skills,
        targetCompanies: companies
      });
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Candidate Profile & Preferences
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Personalize your target job role, experience level, and core skills to tailor AI interview questions.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`flex items-start space-x-3 rounded-2xl p-4 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-xs font-semibold">{statusMessage.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Job Role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                {...register('targetRole')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              {errors.targetRole && <p className="mt-1 text-xs text-red-500">{errors.targetRole.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <select
                {...register('experienceLevel')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="BEGINNER">Beginner (Entry-Level / Intern)</option>
                <option value="INTERMEDIATE">Intermediate (Junior - Mid)</option>
                <option value="ADVANCED">Advanced (Senior Level)</option>
                <option value="EXPERT">Expert (Staff / Lead)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Interview Type
              </label>
              <select
                {...register('preferredInterviewType')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="TECHNICAL">Technical Interview</option>
                <option value="BEHAVIORAL">Behavioral (STAR Method)</option>
                <option value="HR">HR & Culture Fit</option>
                <option value="CASE_STUDY">Case Study & Problem Solving</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Professional Bio
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of your background, career goals, and experience..."
              {...register('bio')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
          </div>
        </div>

        {/* Skills & Companies Management */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Skills & Target Companies
          </h2>

          {/* Primary Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Primary Skills & Technologies
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a skill (e.g. TypeScript, Docker, SQL)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-100 dark:border-brand-900"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-red-500 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Companies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Target Companies
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a company (e.g. Netflix, Stripe, Meta)"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCompany();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={addCompany}
                className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {companies.map((company, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  {company}
                  <button
                    type="button"
                    onClick={() => removeCompany(company)}
                    className="ml-2 hover:text-red-500 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
