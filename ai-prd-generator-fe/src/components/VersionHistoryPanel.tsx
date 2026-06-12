import React from 'react';
import {
  X,
  History,
  RotateCcw,
  Clock,
  User
} from 'lucide-react';
import type { PRDDocument, PRDVersion } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface VersionHistoryPanelProps {
  document: PRDDocument;
  versions: PRDVersion[];
  onClose: () => void;
  onRollback: (version: PRDVersion) => void;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  document,
  versions,
  onClose,
  onRollback
}) => {
  const { t } = useLanguage();
  const documentVersions = versions
    .filter(v => v.prd_id === document.id)
    .sort((a, b) => b.version - a.version);

  return (
    <aside className="w-full max-w-sm lg:w-80 bg-white dark:bg-zinc-900 border-l border-slate-100 dark:border-zinc-800 h-[calc(100vh-4rem)] lg:h-full flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-[-4px_0_24px_rgba(0,0,0,0.01)] z-30 animate-slideLeft fixed lg:static right-0 top-16 lg:top-0 bottom-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-apple-gray-50 dark:bg-zinc-800 border border-apple-gray-100 dark:border-zinc-700 flex items-center justify-center text-apple-gray-500 dark:text-zinc-400 shadow-sm">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight">{t('history.title')}</h3>
            <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{t('history.versionBackups')}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-100 dark:hover:border-zinc-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Versions log list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-zinc-950/40">
        {/* Current live version indicator */}
        <div className="p-3 bg-white dark:bg-zinc-900 border border-apple-gray-200/80 dark:border-zinc-800 rounded-2xl flex items-start space-x-3 shadow-sm relative overflow-hidden">
          <div className="w-1.5 h-full bg-apple-gray-500 dark:bg-zinc-600 absolute left-0 top-0" />
          <div className="w-8 h-8 rounded-lg bg-apple-gray-50 dark:bg-zinc-800 flex items-center justify-center text-apple-gray-500 dark:text-zinc-400 text-xs font-bold font-mono">
            v{document.version}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-[10px] font-bold text-apple-gray-600 dark:text-zinc-400 uppercase tracking-wider font-mono">{t('history.currentlyActive')}</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">{document.title}</h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal">{t('history.activeDesc')}</p>
          </div>
        </div>

        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono px-1">{t('history.savedBackups')} ({documentVersions.length})</p>

        {documentVersions.length > 0 ? (
          <div className="space-y-3">
            {documentVersions.map((v) => (
              <div
                key={v.id}
                className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl space-y-3 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-350 text-xs font-bold font-mono">
                      v{v.version}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 block font-mono">{t('history.backupSnapshot')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRollback(v)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[9px] font-bold text-apple-gray-600 dark:text-zinc-300 hover:text-apple-gray-700 dark:hover:text-zinc-100 bg-apple-gray-50 dark:bg-zinc-800 hover:bg-apple-gray-100/50 dark:hover:bg-zinc-700 border border-apple-gray-100 dark:border-zinc-700 transition-all"
                    title={t('modals.rollbackTitle')}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('modals.rollbackConfirm')}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-300 leading-relaxed italic bg-slate-50 dark:bg-zinc-950/50 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                  &quot;{v.change_summary || t('history.manualBackup')}&quot;
                </p>

                <div className="flex items-center justify-between text-[8px] text-slate-400 dark:text-zinc-500 font-mono pt-1">
                  <div className="flex items-center space-x-0.5">
                    <Clock className="w-3 h-3 text-slate-300 dark:text-zinc-600" />
                    <span>{new Date(v.created_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <User className="w-3 h-3 text-slate-300 dark:text-zinc-600" />
                    <span>{t('history.developer')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 text-xs space-y-2">
            <History className="w-6 h-6 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="font-medium text-slate-500 dark:text-zinc-300">{t('history.noHistory')}</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed">{t('history.noHistoryDesc')}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[9px] text-slate-400 dark:text-zinc-500 leading-normal font-mono shrink-0">
        {t('history.footer')}
      </div>
    </aside>
  );
};
