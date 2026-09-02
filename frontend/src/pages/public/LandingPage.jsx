import React from 'react';
import { Bot, Mic, FileText, BarChart3, ShieldCheck, Sparkles, CheckCircle, Code2, ArrowRight } from 'lucide-react';
import HealthStatusBadge from '../../components/common/HealthStatusBadge.jsx';

export const LandingPage = () => {
  const corePillars = [
    {
      icon: <Bot className="h-5 w-5 text-brand-600" />,
      title: "AI Interviewer & Follow-Ups",
      description: "Realistic mock interviews with dynamic follow-up questioning tailored to target roles and companies."
    },
    {
      icon: <Mic className="h-5 w-5 text-purple-600" />,
      title: "Live Speech-to-Text",
      description: "Real-time browser speech recognition with filler-word diagnostics and speech pace metrics."
    },
    {
      icon: <FileText className="h-5 w-5 text-emerald-600" />,
      title: "Resume-Driven Context",
      description: "Automatic skill, project, and experience extraction to generate personalized technical challenges."
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-amber-600" />,
      title: "Comprehensive Rubrics & Analytics",
      description: "Technical correctness, relevance, completeness scoring, ideal answers, and score trends."
    }
  ];

  const phaseRoadmap = [
    { phase: "Phase 1", name: "Project Foundation & Scaffolding", status: "Active" },
    { phase: "Phase 2", name: "Database Setup & Mongoose Schemas", status: "Upcoming" },
    { phase: "Phase 3", name: "Authentication & Authorization (JWT/RBAC)", status: "Upcoming" },
    { phase: "Phase 4", name: "User Profile & Skill Preferences", status: "Upcoming" },
    { phase: "Phase 5", name: "Resume Upload & Parsing Engine", status: "Upcoming" },
    { phase: "Phase 6", name: "Interview Configuration & AI Generator", status: "Upcoming" }
  ];

  return (
    <div className="space-y-12 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900/60 dark:bg-brand-950 dark:text-brand-300 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Full-Stack AI Interview Platform • Pure JavaScript</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Master Your Next Tech Interview with <span className="text-brand-600">Real-Time AI</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Simulate technical, behavioral, and HR mock interviews. Practice answering live via speech, receive instant rubric evaluations, and track your readiness with deterministic analytics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="inline-flex items-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition cursor-pointer">
            Phase 1 Initialized <ArrowRight className="ml-2 h-4 w-4" />
          </div>
          <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition">
            <Code2 className="mr-2 h-4 w-4 text-slate-500" /> Pure JavaScript (ESM)
          </div>
        </div>
      </section>

      {/* Connectivity & Health Status Module */}
      <section className="max-w-3xl mx-auto px-4">
        <HealthStatusBadge />
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Core Technical Capabilities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered with a clean, decoupled architecture for reliable mock evaluations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {corePillars.map((pillar, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                {pillar.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap Checklist */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Development Roadmap Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phased milestone execution tracker
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Phase 1 Active
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {phaseRoadmap.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className={`h-4 w-4 ${item.status === 'Active' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{item.phase}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.name}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  item.status === 'Active'
                    ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
