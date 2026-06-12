import React from 'react';
import { FileText, Trash2, ChevronLeft, Calendar, Sparkles, Terminal } from 'lucide-react';
import type { PRDDocument } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HistorySidebarProps {
  documents: PRDDocument[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (doc: PRDDocument) => void;
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  isOpen,
  onToggle,
  isLoading = false
}) => {
  const { locale, t } = useLanguage();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <aside
      className={`h-screen flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-zinc-900 z-30 transition-all duration-300 ease-in-out shrink-0 no-print shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none
        fixed xl:static inset-y-0 left-0
        ${isOpen ? 'w-80 max-w-[85vw] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full xl:translate-x-0 overflow-hidden pointer-events-none'}`}
    >
      {/* Sidebar Header: Control Deck Style */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-inner">
            <Sparkles className="w-4.5 h-4.5 text-white dark:text-zinc-900 animate-pulse" />
          </div>
          <div>
            <h2 className="text-[11px] font-extrabold tracking-wider uppercase prd-title-animate font-sans m-0 leading-none">
              PRD Workspace
            </h2>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-slate-400 dark:text-zinc-500 font-mono uppercase tracking-widest">{t('sidebar.activeControl')}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-655 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
          title={t('common.back')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Explorer List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 bg-white/10 dark:bg-zinc-950/20">
        <div className="px-2 mb-2 flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">{t('sidebar.fileHistory')} ({documents.length})</span>
          <Terminal className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-6 h-6 border-2 border-apple-gray-500 dark:border-zinc-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono tracking-widest uppercase">{t('sidebar.fetching')}</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 flex items-center justify-center text-slate-300 dark:text-zinc-600 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('sidebar.emptyFiles')}</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed max-w-[180px]">{t('sidebar.emptyDesc')}</p>
            </div>
          </div>
        ) : (
          documents.map((doc) => {
            const isActive = doc.id === activeDocumentId;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`group flex items-center space-x-3 p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-apple-gray-50/60 dark:bg-zinc-900/60 border border-apple-gray-150/70 dark:border-zinc-800/80 shadow-[0_2px_8px_rgba(37,99,235,0.03)] dark:shadow-none'
                  : 'hover:bg-slate-50 dark:hover:bg-zinc-900/40 border border-transparent'
                  }`}
              >
                {/* File Icon Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${isActive
                  ? 'bg-apple-gray-500 dark:bg-zinc-100 border-apple-gray-600 dark:border-zinc-300 text-white dark:text-zinc-900 shadow-glow-blue dark:shadow-none'
                  : 'bg-slate-50 dark:bg-zinc-900 border-slate-150 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 group-hover:bg-apple-gray-50 group-hover:border-apple-gray-100 group-hover:text-apple-gray-500 dark:group-hover:bg-zinc-800 dark:group-hover:border-zinc-700 dark:group-hover:text-zinc-300'
                  }`}>
                  <FileText className="w-4 h-4" />
                </div>

                {/* Title and Inline Metadata */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-apple-gray-700 dark:text-zinc-200' : 'text-slate-700 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200'
                    }`}>
                    {doc.title || t('sidebar.untitled')}
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5 text-[9px] text-slate-400 dark:text-zinc-500 font-mono">
                    <Calendar className="w-2.5 h-2.5 text-slate-350 dark:text-zinc-650" />
                    <span>{formatDate(doc.updated_at || doc.created_at)}</span>
                    <span className="text-slate-250 dark:text-zinc-750">•</span>
                    <span className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md text-[8px] font-sans font-semibold text-slate-600 dark:text-zinc-300">v{doc.version}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc);
                  }}
                  className="p-1 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50 shrink-0"
                  title={t('sidebar.deletePrd')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
