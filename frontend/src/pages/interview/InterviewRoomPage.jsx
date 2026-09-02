import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient.js';
import speechService from '../../services/speechService.js';
import {
  Bot,
  Mic,
  MicOff,
  Keyboard,
  Clock,
  Pause,
  Play,
  SkipForward,
  Send,
  CheckCircle2,
  AlertCircle,
  Flag,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';

export const InterviewRoomPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local Session State
  const [answerText, setAnswerText] = useState('');
  const [inputMode, setInputMode] = useState('SPEECH'); // 'SPEECH' | 'TEXT'
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch full interview data
  const {
    data: interviewData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['interviewRoom', interviewId],
    queryFn: async () => {
      const res = await apiClient.get(`/interviews/${interviewId}`);
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  const interview = interviewData?.interview;
  const questions = interviewData?.questions || [];
  const answers = interviewData?.answers || [];

  const currentIndex = interview?.currentQuestionIndex || 0;
  const currentQuestion = questions[currentIndex];
  const isCompleted = interview?.status === 'COMPLETED';
  const isPaused = interview?.status === 'PAUSED';

  // 2. Initialize timer and question start time
  useEffect(() => {
    if (interview?.remainingTimeSeconds !== undefined && secondsRemaining === null) {
      setSecondsRemaining(interview.remainingTimeSeconds);
    }
  }, [interview, secondsRemaining]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    // Pre-fill answer if already submitted for current question
    if (currentQuestion) {
      const existingAnswer = answers.find(a => a.questionId === currentQuestion._id);
      if (existingAnswer) {
        setAnswerText(existingAnswer.transcriptText || '');
      } else {
        setAnswerText('');
      }
    }
  }, [currentIndex, currentQuestion, answers]);

  // 3. Countdown timer interval
  useEffect(() => {
    if (!interview || interview.status !== 'IN_PROGRESS' || secondsRemaining === null || secondsRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interview?.status, secondsRemaining]);

  // 4. Speech Recognition setup
  const toggleListening = () => {
    if (isListening) {
      speechService.stop();
      setIsListening(false);
    } else {
      setSpeechError('');
      const started = speechService.start(
        (transcriptData) => {
          setAnswerText((prev) => {
            const current = prev.trim();
            if (transcriptData.finalTranscript) {
              return current ? `${current} ${transcriptData.finalTranscript.trim()}` : transcriptData.finalTranscript.trim();
            }
            return prev;
          });
        },
        (err) => {
          setSpeechError(err.message);
          setIsListening(false);
        },
        (status) => setIsListening(status)
      );

      if (!started) {
        setInputMode('TEXT');
      }
    }
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  // 5. Actions: Start, Pause, Resume, Skip, Submit, Finish
  const startInterviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/interviews/${interviewId}/start`);
      return res.data;
    },
    onSuccess: () => refetch()
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      speechService.stop();
      setIsListening(false);
      const res = await apiClient.post(`/interviews/${interviewId}/pause`);
      return res.data;
    },
    onSuccess: () => refetch()
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/interviews/${interviewId}/resume`);
      return res.data;
    },
    onSuccess: () => refetch()
  });

  const submitAnswer = async () => {
    if (!currentQuestion) return;
    setIsSubmitting(true);
    speechService.stop();
    setIsListening(false);

    try {
      const durationSeconds = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
      await apiClient.post(`/interviews/${interviewId}/answer`, {
        questionId: currentQuestion._id,
        transcriptText: answerText,
        durationSeconds,
        inputMethod: inputMode
      });
      setAnswerText('');
      refetch();
    } catch (err) {
      setSpeechError(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipQuestion = async () => {
    if (!currentQuestion) return;
    if (!confirm('Are you sure you want to skip this question?')) return;

    setIsSubmitting(true);
    speechService.stop();
    setIsListening(false);

    try {
      await apiClient.post(`/interviews/${interviewId}/skip`, {
        questionId: currentQuestion._id
      });
      setAnswerText('');
      refetch();
    } catch (err) {
      setSpeechError(err.message || 'Failed to skip question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishInterview = async () => {
    if (!confirm('Are you ready to complete this mock interview?')) return;
    speechService.stop();
    setIsListening(false);

    try {
      await apiClient.post(`/interviews/${interviewId}/complete`);
      refetch();
    } catch (err) {
      setSpeechError(err.message || 'Failed to complete interview.');
    }
  };

  const formatTime = (totalSec) => {
    if (totalSec === null || totalSec === undefined) return '--:--';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Loading and Error States
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Entering interview room...
        </p>
      </div>
    );
  }

  if (isError || !interview) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-red-200 bg-red-50 text-center dark:border-red-900 dark:bg-red-950/30">
        <AlertCircle className="mx-auto h-10 w-10 text-red-600 mb-3" />
        <h2 className="text-base font-bold text-red-900 dark:text-red-200">Unable to load interview</h2>
        <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error?.message || 'Session not found or forbidden.'}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Interview Completed Screen
  // -------------------------------------------------------------
  if (isCompleted) {
    const answeredCount = answers.filter(a => !a.isSkipped).length;
    const skippedCount = answers.filter(a => a.isSkipped).length;

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shadow-md">
            <Award className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Mock Interview Completed!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You have completed all questions for the <span className="font-semibold text-slate-700 dark:text-slate-200">{interview.title}</span> session.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Total Questions</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{questions.length}</span>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900">
              <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Answered</span>
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{answeredCount}</span>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-900">
              <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Skipped</span>
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{skippedCount}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/interview/setup"
              className="inline-flex items-center rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Start Another Mock
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Ready to Start Screen
  // -------------------------------------------------------------
  if (interview.status === 'CREATED' || interview.status === 'READY') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Bot className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Ready to Begin Your Interview
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your session is configured with <span className="font-semibold text-slate-700 dark:text-slate-200">{questions.length} AI-generated questions</span> ({interview.difficulty} difficulty, {interview.timeLimitMinutes} min limit).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-left border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Target Role:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{interview.targetRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Target Company:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{interview.targetCompany}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Input Options:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Voice (Speech-to-Text) or Text Keyboard</span>
            </div>
          </div>

          <button
            onClick={() => startInterviewMutation.mutate()}
            disabled={startInterviewMutation.isPending}
            className="inline-flex items-center rounded-2xl bg-brand-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition disabled:opacity-50"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            {startInterviewMutation.isPending ? 'Starting...' : 'Start Interview Now'}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Active Live Interview Room
  // -------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar: Progress, Timer, State */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            {interview.targetCompany} • {interview.type}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Countdown Clock */}
          <div className={`flex items-center space-x-2 rounded-xl px-3 py-1.5 text-xs font-bold border ${
            (secondsRemaining || 0) < 300
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Pause / Resume Button */}
          {isPaused ? (
            <button
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
              className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Resume
            </button>
          ) : (
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
            >
              <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
            </button>
          )}

          <button
            onClick={finishInterview}
            className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
          >
            <Flag className="mr-1.5 h-3.5 w-3.5" /> End
          </button>
        </div>
      </div>

      {/* Paused Overlay Alert */}
      {isPaused && (
        <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300 text-xs">
          <div className="flex items-center space-x-2">
            <Pause className="h-4 w-4" />
            <span>Interview is currently <strong>Paused</strong>. Timer and question flow are suspended.</span>
          </div>
          <button
            onClick={() => resumeMutation.mutate()}
            className="font-bold underline hover:text-amber-800"
          >
            Click here to resume
          </button>
        </div>
      )}

      {/* Question Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {currentQuestion?.category || 'General'}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {currentQuestion?.difficulty || interview.difficulty}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
          {currentQuestion?.questionText}
        </h2>

        {currentQuestion?.expectedTopics?.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Key concepts to consider:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentQuestion.expectedTopics.map((topic, i) => (
                <span
                  key={i}
                  className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-100 dark:border-slate-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer Workspace */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Your Response
            </span>
            {isListening && (
              <span className="flex items-center space-x-1.5 text-xs text-red-600 font-semibold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <span>Recording Speech...</span>
              </span>
            )}
          </div>

          {/* Input Mode Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setInputMode('SPEECH')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                inputMode === 'SPEECH'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Voice / Mic</span>
            </button>
            <button
              onClick={() => {
                speechService.stop();
                setIsListening(false);
                setInputMode('TEXT');
              }}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                inputMode === 'TEXT'
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Type Text</span>
            </button>
          </div>
        </div>

        {speechError && (
          <div className="flex items-center space-x-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Voice Mode Mic Controls */}
        {inputMode === 'SPEECH' && (
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3">
            <button
              onClick={toggleListening}
              disabled={isPaused}
              className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition transform active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white shadow-red-500/30 animate-pulse ring-4 ring-red-300 dark:ring-red-900'
                  : 'bg-brand-600 text-white shadow-brand-500/30 hover:bg-brand-700'
              } disabled:opacity-50`}
            >
              {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isListening ? 'Click microphone to stop speech recognition' : 'Click microphone to speak your answer'}
            </span>
          </div>
        )}

        {/* Answer Text Area (Editable in both Speech and Text modes) */}
        <textarea
          rows={6}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={isPaused}
          placeholder={
            inputMode === 'SPEECH'
              ? 'Your speech transcription will appear here in real-time. You can also edit and fine-tune the text before submitting...'
              : 'Type your detailed answer here. Focus on structuring your thoughts clearly...'
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white leading-relaxed"
        />

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={skipQuestion}
            disabled={isSubmitting || isPaused}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 disabled:opacity-50 transition"
          >
            <SkipForward className="mr-1.5 h-4 w-4" /> Skip Question
          </button>

          <button
            onClick={submitAnswer}
            disabled={isSubmitting || isPaused || !answerText.trim()}
            className="inline-flex items-center rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Submit & Finish Mock
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Submit & Next Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoomPage;
