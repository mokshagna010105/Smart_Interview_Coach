import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../api/apiClient.js';
import { MessageSquare, Star, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const FeedbackModal = ({ isOpen, onClose, interviewId }) => {
  const [category, setCategory] = useState('GENERAL');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const feedbackMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/feedback', payload);
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    },
    onError: (err) => {
      setErrorMessage(err.message || 'Failed to submit feedback.');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    feedbackMutation.mutate({
      category,
      rating: Number(rating),
      message,
      interviewId: interviewId || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Your Feedback</h3>
          </div>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
            <h4 className="text-sm font-bold">Thank You!</h4>
            <p className="text-xs text-slate-500">Your feedback helps us continuously improve InterviewAI.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 flex items-center space-x-2 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="GENERAL">General Experience</option>
                <option value="QUESTIONS">Interview Questions Quality</option>
                <option value="EVALUATION">AI Feedback & Scoring</option>
                <option value="UI_UX">UI / Speech / Webcam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1.5 rounded-lg transition ${
                      star <= rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Comments
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did you like? What can we improve?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={feedbackMutation.isPending || !message.trim()}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {feedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
