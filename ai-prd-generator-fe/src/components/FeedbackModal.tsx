import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWorkspace } from '../hooks/useWorkspace';
import apiClient from '../services/apiClient';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRANSLATIONS = {
  id: {
    title: "Kirim Masukan & Saran",
    desc: "Bantu kami meningkatkan kualitas aplikasi ini dengan memberikan penilaian dan saran Anda.",
    ratingLabel: "Penilaian Anda",
    commentLabel: "Komentar / Saran",
    commentPlaceholder: "Tuliskan masukan, keluhan, atau fitur baru yang Anda inginkan di sini...",
    submit: "Kirim Masukan",
    submitting: "Mengirim...",
    cancel: "Batal",
    success: "Masukan Anda berhasil dikirim. Terima kasih!",
    errorRating: "Silakan pilih rating terlebih dahulu.",
    errorComment: "Silakan tuliskan masukan Anda sebelum mengirim.",
    ratingTexts: ["", "Sangat Buruk", "Buruk", "Cukup Baik", "Sangat Baik", "Luar Biasa!"]
  },
  en: {
    title: "Submit Feedback & Suggestions",
    desc: "Help us improve this application by sharing your rating and suggestions.",
    ratingLabel: "Your Rating",
    commentLabel: "Comments / Suggestions",
    commentPlaceholder: "Write your feedback, issues, or new feature requests here...",
    submit: "Submit Feedback",
    submitting: "Submitting...",
    cancel: "Cancel",
    success: "Your feedback has been submitted successfully. Thank you!",
    errorRating: "Please select a rating first.",
    errorComment: "Please write your feedback before submitting.",
    ratingTexts: ["", "Very Bad", "Bad", "Good", "Very Good", "Excellent!"]
  }
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { locale } = useLanguage();
  const { showToast } = useWorkspace();
  const text = TRANSLATIONS[locale as 'id' | 'en'] || TRANSLATIONS.id;

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast(text.errorRating, 'error');
      return;
    }

    if (!comment.trim()) {
      showToast(text.errorComment, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.submitFeedback(rating, comment);
      showToast(text.success, 'success');
      setRating(0);
      setComment('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirimkan masukan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-zinc-800/80 transition-all transform scale-100 flex flex-col font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Desc */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mb-2">
            {text.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
            {text.desc}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars Section */}
          <div className="flex flex-col items-center justify-center py-2 bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-slate-100/50 dark:border-zinc-800/30">
            <span className="text-[11px] font-extrabold text-slate-455 dark:text-zinc-500 uppercase tracking-widest mb-3">
              {text.ratingLabel}
            </span>

            {/* Stars Row */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-115 transform active:scale-90 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-150 ${isActive
                          ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]'
                          : 'text-slate-300 dark:text-zinc-700 hover:text-amber-400'
                        }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dynamic Rating Description */}
            <div className="h-5 mt-2 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 transition-all">
                {text.ratingTexts[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Comment input area */}
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-extrabold text-slate-455 dark:text-zinc-555 uppercase tracking-widest">
              {text.commentLabel}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={text.commentPlaceholder}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/30 border border-slate-200 dark:border-zinc-800/80 focus:border-zinc-800 dark:focus:border-zinc-400 rounded-2xl text-slate-800 dark:text-zinc-200 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none transition-all resize-none shadow-inner"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 rounded-2xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <span>{text.submitting}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{text.submit}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
