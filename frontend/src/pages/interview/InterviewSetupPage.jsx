import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext.jsx';
import apiClient from '../../api/apiClient.js';
import {
  Bot,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Plus,
  X,
  FileText,
  Clock,
  HelpCircle,
  Briefcase
} from 'lucide-react';

const INTERVIEW_TYPES = [
  { id: 'TECHNICAL', title: 'Technical Interview', desc: 'Algorithms, system design, data structures, and tech stack principles' },
  { id: 'BEHAVIORAL', title: 'Behavioral (STAR)', desc: 'Situational leadership, conflict resolution, ownership, and teamwork' },
  { id: 'HR', title: 'HR & Culture Fit', desc: 'Career goals, communication style, workplace adaptability, and role alignment' },
  { id: 'CASE_STUDY', title: 'Case Study & Scenarios', desc: 'Real-world problem diagnostics, product architecture, and trade-off analysis' }
];

const DIFFICULTY_LEVELS = [
  { id: 'BEGINNER', label: 'Beginner', desc: 'Entry-Level / Intern' },
  { id: 'INTERMEDIATE', label: 'Intermediate', desc: 'Junior - Mid Level' },
  { id: 'ADVANCED', label: 'Advanced', desc: 'Senior Level' },
  { id: 'EXPERT', label: 'Expert', desc: 'Staff / Principal' }
];

export const InterviewSetupPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [type, setType] = useState(profile?.preferredInterviewType || 'TECHNICAL');
  const [difficulty, setDifficulty] = useState(profile?.experienceLevel || 'INTERMEDIATE');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Full Stack Software Engineer');
  const [targetCompany, setTargetCompany] = useState(profile?.targetCompanies?.[0] || 'Generic');
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [skills, setSkills] = useState(profile?.primarySkills || ['JavaScript', 'React', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ['userResumes'],
    queryFn: async () => {
      const res = await apiClient.get('/resumes');
      return res.data || [];
    }
  });

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const def = resumes.find(r => r.isDefault) || resumes[0];
      setSelectedResumeId(def._id);
    }
  }, [resumes, selectedResumeId]);

  // Mutation to create interview
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/interviews', payload);
      return res.data;
    },
    onSuccess: (data) => {
      navigate(`/interview/room/${data.interview._id}`);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to configure interview session. Please verify your settings.');
    }
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (toRemove) => {
    setSkills(skills.filter(s => s !== toRemove));
  };

  const handleStartInterview = (e) => {
    e.preventDefault();
    setErrorMessage('');

    createMutation.mutate({
      type,
      difficulty,
      targetRole,
      targetCompany,
      skillsFocus: skills,
      questionCount: Number(questionCount),
      timeLimitMinutes: Number(timeLimitMinutes),
      resumeId: selectedResumeId || undefined
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900/60 dark:bg-brand-950 dark:text-brand-300 shadow-sm mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Step 1 of 2 • Interview Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Configure Mock Interview
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Customize your interview parameters. The AI interviewer will generate dynamic questions tailored to your target company and skills.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start space-x-3 rounded-2xl bg-red-50 p-4 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="space-y-8">
        {/* 1. Interview Type Selection */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            1. Select Interview Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INTERVIEW_TYPES.map((t) => (
              <div
                key={t.id}
                onClick={() => setType(t.id)}
                className={`rounded-2xl border p-4 cursor-pointer transition ${
                  type === t.id
                    ? 'border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</span>
                  {type === t.id && <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Difficulty Level */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. Target Difficulty Level
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIFFICULTY_LEVELS.map((d) => (
              <div
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-2xl border p-3.5 text-center cursor-pointer transition ${
                  difficulty === d.id
                    ? 'border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900 dark:text-white">{d.label}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Role, Company & Session Metrics */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            3. Target Role & Company Context
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Job Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Company
              </label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Generic">Generic / Standard Tech</option>
                <option value="Google">Google</option>
                <option value="Amazon">Amazon (Leadership Principles)</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Meta">Meta</option>
                <option value="Netflix">Netflix</option>
                <option value="Stripe">Stripe</option>
                <option value="Custom">Custom High-Growth Startup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <HelpCircle className="inline h-3.5 w-3.5 mr-1" /> Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="3">3 Questions (Quick Test)</option>
                <option value="5">5 Questions (Standard)</option>
                <option value="7">7 Questions (Comprehensive)</option>
                <option value="10">10 Questions (Full Mock)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Clock className="inline h-3.5 w-3.5 mr-1" /> Time Limit
              </label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <FileText className="inline h-3.5 w-3.5 mr-1" /> Resume Context
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">No Resume Context</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.originalFilename} {r.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Tags */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Focus Skills & Topics
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add focus topic (e.g. System Design, React Hooks, Concurrency)"
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
        </div>

        {/* Start Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center rounded-2xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 disabled:opacity-50 transition"
          >
            {createMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Generating AI Question Bank...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5 fill-current" />
                Start Mock Interview
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetupPage;
