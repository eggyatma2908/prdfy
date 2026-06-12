import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = 'danger',
  onConfirm,
  onCancel
}) => {
  const getThemeColors = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
          btnConfirm: 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.2)] dark:shadow-none text-white',
          btnConfirmBorder: 'border-rose-500'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
          btnConfirm: 'bg-amber-500 hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.2)] dark:shadow-none text-white',
          btnConfirmBorder: 'border-amber-500'
        };
      default:
        return {
          iconBg: 'bg-apple-gray-50 dark:bg-zinc-800 text-apple-gray-500 dark:text-zinc-400 border-apple-gray-100 dark:border-zinc-700',
          btnConfirm: 'bg-slate-800 dark:bg-zinc-100 hover:bg-slate-900 dark:hover:bg-zinc-200 text-white dark:text-zinc-950',
          btnConfirmBorder: 'border-slate-800 dark:border-zinc-300'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 no-print">
          {/* Backdrop click close & Blur (Sibling, NOT wrapping the card) */}
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onCancel} />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative glass-panel w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-200/60 dark:border-zinc-800 z-10 flex flex-col items-center text-center space-y-5"
          >
            {/* Close icon */}
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon Badge */}
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${colors.iconBg} shadow-sm`}>
              {type === 'danger' ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>

            {/* Content Text */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight font-sans">
                {title}
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-450 leading-relaxed font-sans px-2">
                {message}
              </p>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center space-x-2.5 w-full pt-1">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100/60 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-xl transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${colors.btnConfirm}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
