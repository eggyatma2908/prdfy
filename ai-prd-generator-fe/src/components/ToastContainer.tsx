import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-slate-500 dark:text-zinc-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500';
      case 'error':
        return 'border-l-rose-500';
      case 'warning':
        return 'border-l-amber-500';
      default:
        return 'border-l-slate-400 dark:border-l-zinc-500';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-[100] flex flex-col space-y-3 w-auto sm:w-full sm:max-w-sm pointer-events-none no-print">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className={`pointer-events-auto w-full border border-slate-200/80 dark:border-zinc-800/60 border-l-4 ${getBorderColor(toast.type)} px-4 py-3.5 rounded-2xl shadow-xl flex items-start space-x-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100 leading-normal font-sans">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-0.5 rounded-lg text-slate-400 hover:text-slate-655 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
