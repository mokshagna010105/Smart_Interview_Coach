import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  Bot,
  Mic,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Shield,
  Layers,
  Award,
  Video,
  Target,
  MessageSquare
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Bot className="h-6 w-6 text-brand-600" />,
      title: "Dynamic AI Interviewer",
      description: "Experience realistic technical, behavioral (STAR), HR, and case study interviews with context-aware follow-up questioning tailored to your target company."
    },
    {
      icon: <Mic className="h-6 w-6 text-purple-600" />,
      title: "Real-Time Voice Transcription",
      description: "Speak naturally using your microphone. Our continuous speech-to-text pipeline captures your verbal delivery with live transcription and conversational pacing diagnostics."
    },
    {
      icon: <Award className="h-6 w-6 text-amber-600" />,
      title: "Granular Rubrics & Ideal Answers",
      description: "Every answer is evaluated across 5 core dimensions: Relevance, Technical Correctness, Completeness, Communication, and Clarity, paired with best-practice sample answers."
    },
    {
      icon: <FileText className="h-6 w-6 text-emerald-600" />,
      title: "Resume-Aware Customization",
      description: "Upload PDF, DOCX, or TXT resumes. The platform extracts your core tech stack, projects, and career milestones to tailor interview questions directly to your profile."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-indigo-600" />,
      title: "Longitudinal Analytics & Growth",
      description: "Monitor your interview readiness over time with interactive charts, competency heatmaps, filler word density metrics, and actionable skill recommendations."
    },
    {
      icon: <Video className="h-6 w-6 text-blue-600" />,
      title: "Interactive Video Mock Room",
      description: "Practice in a realistic video-enabled interview cockpit with live countdown timers, pause/resume controls, question skips, and dual voice/keyboard answering modes."
    }
  ];

  const interviewTypes = [
    {
      title: "Technical Engineering",
      badge: "Coding & System Architecture",
      desc: "Deep-dive questions covering Data Structures, Event Loop concurrency, Distributed Systems, Database Indexing, and REST/Microservice design.",
      color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
    },
    {
      title: "Behavioral (STAR Method)",
      badge: "Leadership & Conflict Resolution",
      desc: "Situational questions assessing high-stakes decision making, incident post-mortems, agile pivots, mentorship, and team multiplier mindset.",
      color: "border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
    },
    {
      title: "HR & Culture Alignment",
      badge: "Career Goals & Values",
      desc: "Evaluate workplace communication style, priority management, growth ambitions, and alignment with company core engineering culture.",
      color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
    },
    {
      title: "Case Study & Scenarios",
      badge: "Real-World Diagnostics",
      desc: "Step-by-step problem breakdown, high-traffic bottleneck diagnostics, zero-downtime database migrations, and architectural tradeoffs.",
      color: "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Configure Your Session",
      desc: "Choose interview track, difficulty tier, target company (Google, Amazon, Meta, etc.), and optional resume context."
    },
    {
      step: "02",
      title: "Practice Live with AI",
      desc: "Answer dynamic questions live via voice speech-to-text or typed responses in an interactive mock room."
    },
    {
      step: "03",
      title: "Review Instant Scorecards",
      desc: "Inspect 5-dimension rubric scores, filler word statistics, strengths, weaknesses, and ideal answers."
    },
    {
      step: "04",
      title: "Track Readiness & Get Hired",
      desc: "Review longitudinal analytics charts, identify priority growth areas, and export/share verified report cards."
    }
  ];

  return (
    <div className="space-y-24 py-10 sm:py-16">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-900/60 dark:bg-brand-950 dark:text-brand-300 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intelligent Mock Interview Preparation Platform</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white leading-tight">
          Practice Smarter. <br />
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            Interview with Confidence.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Master technical, behavioral, and architectural interviews with real-time AI mock sessions, live voice recognition, comprehensive rubric evaluations, and actionable analytics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={isAuthenticated ? '/interview/setup' : '/register'}
            className="inline-flex items-center rounded-2xl bg-brand-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition"
          >
            Start Practicing Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
          </Link>
        </div>

        {/* Feature Pill Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center">
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" /> Speech-to-Text Recognition
          </span>
          <span className="inline-flex items-center">
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" /> 5-Dimension Rubrics
          </span>
          <span className="inline-flex items-center">
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" /> Resume Context Extraction
          </span>
          <span className="inline-flex items-center">
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" /> Shareable & Printable Reports
          </span>
        </div>
      </section>

      {/* 2. Interactive App Preview Mockup */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl text-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-3 text-xs font-mono text-slate-400">InterviewAI Cockpit • Technical Interview Simulation</span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Live Session
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-400 uppercase">Question 1 of 5 • JavaScript Concurrency</span>
                  <span className="text-slate-400 font-mono">18:45 remaining</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  "How does the JavaScript Event Loop coordinate the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout)?"
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-red-400 font-semibold animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Transcribing Voice Response...</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-mono">
                  "The call stack executes synchronous frames first. When asynchronous calls resolve, Microtasks like Promise handlers take priority before the next event loop macrotask tick..."
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Rubric Assessment</span>
              <div className="space-y-3">
                {[
                  { label: 'Technical Correctness', pct: 92, color: 'bg-emerald-500' },
                  { label: 'Question Relevance', pct: 88, color: 'bg-brand-500' },
                  { label: 'Answer Completeness', pct: 85, color: 'bg-indigo-500' },
                  { label: 'Communication & Clarity', pct: 90, color: 'bg-emerald-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-100">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                <span>Filler Words: <strong>0 detected</strong></span>
                <span>Pace: <strong>Optimal (135 wpm)</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything You Need to Ace the Interview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A comprehensive, end-to-end interview coaching environment built to bridge the gap between preparation and real-world offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition duration-200 dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interview Tracks / Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Targeted Interview Tracks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select specialized tracks matching every stage of modern tech recruiting pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {interviewTypes.map((track, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold border ${track.color}`}>
                  {track.badge}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {track.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works: 4-Step Flow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            How InterviewAI Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A frictionless, 4-step workflow from setup to verified interview mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <span className="text-3xl font-extrabold text-brand-600/30 dark:text-brand-400/20 block font-mono">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Final Call To Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-600 to-indigo-700 p-8 sm:p-14 text-center text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Join candidates preparing for top tech companies. Configure your first mock session in under 30 seconds.
          </p>
          <div>
            <Link
              to={isAuthenticated ? '/interview/setup' : '/register'}
              className="inline-flex items-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-brand-900 shadow-xl hover:bg-brand-50 transition"
            >
              Get Started Now <ArrowRight className="ml-2 h-4 w-4 text-brand-600" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
