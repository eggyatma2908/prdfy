import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  CloudLightning,
  Globe,
  CheckCircle,
  Loader2,
  Download,
  ExternalLink
} from 'lucide-react';
import type { PRDDocument } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useWorkspace } from '../hooks/useWorkspace';

interface ExportModalProps {
  document: PRDDocument;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ document, onClose }) => {
  const { t } = useLanguage();
  const { isSubscribed, setUpgradeModalOpen } = useWorkspace();
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<string | null>(null);

  const getFullMarkdown = () => {
    let md = `# ${document.title}\n\n`;
    md += `*Description: ${document.description}*\n`;
    md += `*Version: ${document.version} | Created: ${new Date(document.created_at).toLocaleDateString('en-US')}*\n\n`;
    md += `---\n\n`;

    document.sections.forEach(sec => {
      md += `## ${sec.title}\n\n${sec.content}\n\n`;
    });

    return md;
  };

  const handleDownloadMarkdown = () => {
    setExportingType('markdown');
    setTimeout(() => {
      const markdownText = getFullMarkdown();
      const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${document.title.toLowerCase().replace(/\s+/g, '-')}-prd.md`);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      setExportingType(null);
      setSuccessType('markdown');
      setTimeout(() => setSuccessType(null), 3000);
    }, 1200);
  };

  const handlePrintPDF = () => {
    setExportingType('pdf');
    const originalTitle = window.document.title;
    window.document.title = document.title;

    const restoreTitle = () => {
      window.document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);

    setTimeout(() => {
      setExportingType(null);
      window.print();
      setTimeout(restoreTitle, 500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 no-print">
      {/* Backdrop & Blur (Sibling, NOT wrapping the card) */}
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Modal Card */}
      <div className="glass-panel w-full max-w-md max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl relative border border-slate-200/60 dark:border-zinc-800 z-10 flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-apple-gray-500 dark:text-zinc-400" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">{t('export.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-100 dark:hover:border-zinc-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options list */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 scrollbar-thin">
          {/* Markdown Download (Actual) */}
          <button
            onClick={handleDownloadMarkdown}
            disabled={exportingType !== null}
            className="w-full p-4 text-left rounded-2xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100/60 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-zinc-900 flex items-center justify-center text-slate-600 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-250 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 block">{t('export.downloadMarkdown')}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">{t('export.downloadMarkdownDesc')}</span>
              </div>
            </div>
            {exportingType === 'markdown' ? (
              <Loader2 className="w-4 h-4 text-slate-400 dark:text-zinc-500 animate-spin" />
            ) : successType === 'markdown' ? (
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* PDF Printing (Actual) */}
          <button
            onClick={isSubscribed ? handlePrintPDF : () => {
              onClose();
              setUpgradeModalOpen(true);
            }}
            disabled={exportingType !== null}
            className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
              !isSubscribed 
                ? 'bg-slate-50/45 dark:bg-zinc-800/20 border-slate-200/60 dark:border-zinc-800/80' 
                : 'bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100/60 dark:hover:bg-zinc-800 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-zinc-900 flex items-center justify-center text-slate-600 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-250 transition-colors">
                <Printer className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 block">{t('export.printPdf')}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans block leading-normal">{t('export.printPdfDesc')}</span>
              </div>
            </div>
            {!isSubscribed ? (
              <span className="text-[8px] font-extrabold font-mono bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-2 whitespace-nowrap flex items-center space-x-0.5">
                <span>PREMIUM</span>
              </span>
            ) : exportingType === 'pdf' ? (
              <Loader2 className="w-4 h-4 text-slate-400 dark:text-zinc-500 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* Notion Push (Mock) */}
          <button
            disabled={true}
            className="w-full p-4 text-left rounded-2xl bg-slate-50/40 dark:bg-zinc-800/20 border border-slate-200/60 dark:border-zinc-800/80 transition-all flex items-center justify-between opacity-60 cursor-not-allowed group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/30 dark:border-amber-900/30 flex items-center justify-center text-amber-500 dark:text-amber-450 shrink-0">
                <CloudLightning className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 block">{t('export.pushNotion')}</span>
                <span className="text-[10px] text-slate-400/70 dark:text-zinc-550 font-sans block leading-normal">{t('export.pushNotionDesc')}</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold font-mono bg-blue-50 dark:bg-blue-950 text-blue-500 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-2 whitespace-nowrap">
              {t('export.comingSoon')}
            </span>
          </button>

          {/* Google Docs (Mock) */}
          <button
            disabled={true}
            className="w-full p-4 text-left rounded-2xl bg-slate-50/40 dark:bg-zinc-800/20 border border-slate-200/60 dark:border-zinc-800/80 transition-all flex items-center justify-between opacity-60 cursor-not-allowed group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-450 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 block">{t('export.exportGDocs')}</span>
                <span className="text-[10px] text-slate-400/70 dark:text-zinc-550 font-sans block leading-normal">{t('export.exportGDocsDesc')}</span>
              </div>
            </div>
            <span className="text-[8px] font-extrabold font-mono bg-blue-50 dark:bg-blue-950 text-blue-500 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ml-2 whitespace-nowrap">
              {t('export.comingSoon')}
            </span>
          </button>
        </div>

        {/* Note on printing */}
        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans text-center pt-4 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          {t('export.tip')}
        </div>
      </div>
    </div>
  );
};
