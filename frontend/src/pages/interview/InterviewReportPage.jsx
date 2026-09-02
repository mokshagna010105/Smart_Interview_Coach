import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient.js';
import {
  Award,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Bot,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Volume2,
  Lightbulb,
  Check,
  RefreshCw,
  Plus
} from 'lucide-react';

export const InterviewReportPage = () => {
  const { interviewId } = useParams();
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['interviewReport', interviewId],
    queryFn: async () => {
      const res = await apiClient.get(`/interviews/${interviewId}/report`);
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Generating comprehensive AI scorecard and rubric evaluations...
        </p>
      </div>
    );
  }

  if (isError || !data?.report) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-red-200 bg-red-50 text-center dark:border-red-900 dark:bg-red-950/30 space-y-3">
        <AlertCircle className="mx-auto h-10 w-10 text-red-600 mb-2" />
        <h2 className="text-base font-bold text-red-900 dark:text-red-200">Unable to load report</h2>
        <p className="text-xs text-red-700 dark:text-red-400">{error?.message || 'Report not available or unauthorized.'}</p>
        <Link
          to="/dashboard"
          className="mt-3 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { report, interview, questionBreakdown = [] } = data;
  const dimensionScores = report.dimensionScores || {};

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 65) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900';
    if (score >= 65) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900';
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/interview/history"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to History
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Interview Performance Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {interview.title} • {interview.targetRole} ({interview.difficulty})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/interview/setup"
            className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-700 transition"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Practice Another
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
          >
            <BarChart3 className="mr-1.5 h-4 w-4 text-brand-600" /> View Analytics
          </Link>
        </div>
      </div>

      {/* Top Hero Score Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left: Overall Score Circle / Gauge */}
          <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overall Score</span>
            <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${
              report.overallScore >= 80 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' :
              report.overallScore >= 65 ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' :
              'border-red-500 bg-red-50 dark:bg-red-950/40'
            }`}>
              <span className={`text-3xl font-extrabold ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}
              </span>
              <span className="text-xs text-slate-400 font-bold self-end mb-4">/100</span>
            </div>
            <span className={`mt-3 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold border ${getScoreBg(report.overallScore)}`}>
              {report.overallScore >= 80 ? 'High Readiness' : report.overallScore >= 65 ? 'Moderate Readiness' : 'Needs Practice'}
            </span>
          </div>

          {/* Middle: Dimension Rubric Bars */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Performance Dimensions
            </h3>

            {[
              { label: 'Technical / Core Correctness', val: dimensionScores.correctness || 0 },
              { label: 'Question Relevance', val: dimensionScores.relevance || 0 },
              { label: 'Answer Completeness', val: dimensionScores.completeness || 0 },
              { label: 'Communication & Structure', val: dimensionScores.communication || 0 },
              { label: 'Clarity & Delivery', val: dimensionScores.clarity || 0 }
            ].map((dim, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{dim.label}</span>
                  <span className={getScoreColor(dim.val)}>{dim.val}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dim.val >= 80 ? 'bg-emerald-500' : dim.val >= 65 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dim.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Answered</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {report.questionsAnswered} / {report.totalQuestions}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Skipped</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {report.questionsSkipped}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Filler Words</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {report.totalFillerWords}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Total Time</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {Math.floor((report.totalDurationSeconds || 0) / 60)}m {(report.totalDurationSeconds || 0) % 60}s
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary & Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Award className="mr-2 h-4 w-4 text-brand-600" /> Key Strengths & Growth Areas
          </h3>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Strongest Areas
            </span>
            <div className="flex flex-wrap gap-2">
              {report.strongestAreas?.length > 0 ? (
                report.strongestAreas.map((st, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  >
                    <Check className="mr-1 h-3 w-3" /> {st}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Continue building baseline consistency.</span>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Focus Areas for Next Session
            </span>
            <div className="flex flex-wrap gap-2">
              {report.weakestAreas?.length > 0 ? (
                report.weakestAreas.map((w, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                  >
                    {w}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No critical weaknesses detected.</span>
              )}
            </div>
          </div>
        </div>

        {/* Actionable Feedback */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Lightbulb className="mr-2 h-4 w-4 text-amber-500" /> Actionable Recommendations
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {report.summaryFeedback}
          </p>
          <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {report.actionableNextSteps?.map((step, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-300 space-x-2">
                <span className="font-bold text-brand-600">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Detailed Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Question-by-Question Evaluation Breakdown
        </h2>

        <div className="space-y-4">
          {questionBreakdown.map((item, index) => {
            const isExpanded = expandedQuestionId === item.questionId;
            const evalData = item.evaluation;
            const answerData = item.answer;

            return (
              <div
                key={item.questionId}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 transition"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : item.questionId)}
                  className="flex items-start justify-between p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Q{index + 1} • {item.category}
                      </span>
                      {answerData?.isSkipped ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          Skipped
                        </span>
                      ) : evalData ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getScoreBg(evalData.overallScore)}`}>
                          Score: {evalData.overallScore}/100
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not evaluated</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 pt-1">
                    {evalData?.evaluator === 'gemini' ? (
                      <span className="hidden sm:inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        <Sparkles className="mr-1 h-2.5 w-2.5" /> AI Evaluated
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Rule-Based
                      </span>
                    )}

                    <div className="p-1 rounded-lg text-slate-400">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-5 bg-slate-50/30 dark:bg-slate-950/20">
                    {/* Candidate's Response */}
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Your Transcript Response
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {answerData?.isSkipped
                          ? '[This question was skipped during the interview]'
                          : answerData?.transcriptText || '[No answer recorded]'}
                      </p>
                    </div>

                    {/* Evaluation Details */}
                    {evalData && (
                      <div className="space-y-4">
                        {/* Rubrics row */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                          <div className="rounded-xl bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-[10px] text-slate-400 block font-medium">Relevance</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{evalData.scores?.relevance || 0}%</span>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-[10px] text-slate-400 block font-medium">Correctness</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{evalData.scores?.correctness || 0}%</span>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-[10px] text-slate-400 block font-medium">Completeness</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{evalData.scores?.completeness || 0}%</span>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-[10px] text-slate-400 block font-medium">Communication</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{evalData.scores?.communication || 0}%</span>
                          </div>
                          <div className="rounded-xl bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-[10px] text-slate-400 block font-medium">Clarity</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{evalData.scores?.clarity || 0}%</span>
                          </div>
                        </div>

                        {/* Strengths and Feedback */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                              Key Strengths
                            </span>
                            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                              {evalData.strengths?.map((s, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5">
                                  <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                              Actionable Feedback
                            </span>
                            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                              {evalData.feedback?.map((f, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5">
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Ideal Sample Answer */}
                        {evalData.idealAnswer && (
                          <div className="rounded-2xl bg-brand-50/50 p-4 border border-brand-100 dark:bg-brand-950/20 dark:border-brand-900/50 space-y-1">
                            <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider block">
                              Ideal Answer Reference
                            </span>
                            <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {evalData.idealAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewReportPage;
