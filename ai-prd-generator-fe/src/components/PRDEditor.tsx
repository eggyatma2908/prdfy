import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  History,
  Download,
  ChevronRight,
  FileCode,
  Check,
  Menu,
  Sparkles,
  Sun,
  Moon,
  Crown
} from 'lucide-react';
import type { PRDDocument, PRDVersion } from '../types';
import { AIChatPanel } from './AIChatPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { MermaidDiagram } from './MermaidDiagram';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useLanguage } from '../context/LanguageContext';
import { useWorkspace } from '../hooks/useWorkspace';

interface PRDEditorProps {
  document: PRDDocument;
  onSave: (doc: PRDDocument) => void;
  onBack: () => void;
  onOpenChat: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  isChatOpen: boolean;
  isHistoryOpen: boolean;
  versions: PRDVersion[];
  onApplyChange: (sectionId: string, oldContent: string, newContent: string, changeSummary: string) => void;
  onRollback: (version: PRDVersion) => void;
  isHistorySidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isSubscribed?: boolean;
  onUpgradeClick?: () => void;
  onAdminClick?: () => void;
}

export function parseMarkdownToHTML(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    if (lang === 'mermaid') {
      return `<pre class="mermaid">${code.trim()}</pre>`;
    }
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  const lines = html.split('\n');
  let inTable = false;
  let tableRows: string[] = [];
  let parsedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        if (tableRows.length >= 2) {
          let tableHtml = '<table>';
          tableRows.forEach((row, rowIdx) => {
            const cells = row.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

            if (rowIdx === 1 && row.includes('-')) return;

            tableHtml += '<tr>';
            cells.forEach(cell => {
              const cellTag = rowIdx === 0 ? 'th' : 'td';
              tableHtml += `<${cellTag}>${cell}</${cellTag}>`;
            });
            tableHtml += '</tr>';
          });
          tableHtml += '</table>';
          parsedLines.push(tableHtml);
        }
        inTable = false;
      }
      parsedLines.push(lines[i]);
    }
  }
  if (inTable && tableRows.length >= 2) {
    let tableHtml = '<table>';
    tableRows.forEach((row, rowIdx) => {
      const cells = row.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (rowIdx === 1 && row.includes('-')) return;
      tableHtml += '<tr>';
      cells.forEach(cell => {
        const cellTag = rowIdx === 0 ? 'th' : 'td';
        tableHtml += `<${cellTag}>${cell}</${cellTag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';
    parsedLines.push(tableHtml);
  }
  html = parsedLines.join('\n');

  html = html
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // GitHub Alerts (Special styling)
    .replace(/^\>\s\[!IMPORTANT\]\s(.*$)/gim, '<div class="p-3 my-2 border-l-4 border-blue-500 bg-blue-50/50 text-blue-800 text-xs rounded-r-md"><strong>IMPORTANT:</strong> $1</div>')
    .replace(/^\>\s\[!WARNING\]\s(.*$)/gim, '<div class="p-3 my-2 border-l-4 border-amber-500 bg-amber-50/50 text-amber-800 text-xs rounded-r-md"><strong>WARNING:</strong> $1</div>')
    .replace(/^\>\s\[!TIP\]\s(.*$)/gim, '<div class="p-3 my-2 border-l-4 border-emerald-500 bg-emerald-50/50 text-emerald-800 text-xs rounded-r-md"><strong>TIP:</strong> $1</div>')
    // Blockquote (General)
    .replace(/^\>\s(?!\[!)(.*$)/gim, '<blockquote>$1</blockquote>')
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Unordered Lists
    .replace(/^\*\s(.*$)/gim, '<li>$1</li>')
    .replace(/^\-\s(.*$)/gim, '<li>$1</li>');

  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  html = html.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (!trimmed) return p;
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<div') || trimmed.startsWith('<table') || trimmed.startsWith('<pre')) {
      return p;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}


export const PRDEditor: React.FC<PRDEditorProps> = ({
  document,
  onSave,
  onBack,
  onOpenChat,
  onOpenHistory,
  onOpenExport,
  isChatOpen,
  isHistoryOpen,
  versions,
  onApplyChange,
  onRollback,
  isHistorySidebarOpen,
  onToggleSidebar,
  isSubscribed = false,
  onUpgradeClick,
  onAdminClick
}) => {
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme, isSuperAdmin } = useWorkspace();
  const [docState, setDocState] = useState<PRDDocument>({ ...document });
  const [activeSectionId, setActiveSectionId] = useState(document.sections[0]?.id || '');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'savedDB'>('saved');
  const [activeTab, setActiveTab] = useState<'edit' | 'split' | 'preview'>('split');

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setActiveTab('edit');
    }
  }, []);

  useEffect(() => {
    setDocState({ ...document });
    if (document.sections.length > 0 && !document.sections.some(s => s.id === activeSectionId)) {
      setActiveSectionId(document.sections[0].id);
    }
  }, [document]);

  useEffect(() => {
    if (!activeSectionId || activeTab === 'edit') return;

    const timer = setTimeout(() => {
      const element = window.document.getElementById(`preview-section-${activeSectionId}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeSectionId, activeTab]);

  const markdownComponents = React.useMemo(() => ({
    pre({ children, ...props }: any) {
      const child = React.Children.toArray(children)[0] as any;
      const childClassName: string = child?.props?.className ?? '';
      const isMermaid =
        childClassName.includes('language-mermaid') ||
        childClassName.includes('mermaid');

      if (isMermaid) {
        const code = String(child?.props?.children ?? '').replace(/\n$/, '');
        return <MermaidDiagram code={code} />;
      }
      return <pre {...props}>{children}</pre>;
    },
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const isMermaid = match && match[1] === 'mermaid';
      if (isMermaid) {
        return <MermaidDiagram code={String(children).replace(/\n$/, '')} />;
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  }), []);

  const activeSection = docState.sections.find((s) => s.id === activeSectionId) || docState.sections[0];

  const handleSectionContentChange = (newContent: string) => {
    const updatedSections = docState.sections.map((sec) =>
      sec.id === activeSectionId ? { ...sec, content: newContent } : sec
    );
    const updatedDoc = {
      ...docState,
      sections: updatedSections,
      updated_at: new Date().toISOString()
    };
    setDocState(updatedDoc);

    setAutoSaveStatus('saving');
    const delay = setTimeout(() => {
      onSave(updatedDoc);
      setAutoSaveStatus('savedDB');
    }, 800);
    return () => clearTimeout(delay);
  };

  const handleTitleChange = (newTitle: string) => {
    const updatedDoc = {
      ...docState,
      title: newTitle,
      updated_at: new Date().toISOString()
    };
    setDocState(updatedDoc);
    onSave(updatedDoc);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Editor Top Toolbar */}
      <header className="h-16 glass-panel border-b border-slate-100 dark:border-zinc-800/80 px-2.5 sm:px-4 md:px-6 flex items-center justify-between shrink-0 z-10 shadow-sm bg-white/90 dark:bg-zinc-900/90">
        <div className="flex items-center space-x-1 sm:space-x-2.5 md:space-x-4 min-w-0 flex-1 mr-2">
          {!isHistorySidebarOpen && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer animate-fadeIn shrink-0"
              title={t('sidebar.fileHistory')}
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          )}
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
            title={t('common.back')}
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
            <input
              type="text"
              value={docState.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight bg-transparent focus:outline-none focus:bg-slate-50 dark:focus:bg-zinc-800/50 px-1 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-transparent focus:border-slate-200 dark:focus:border-zinc-700 focus:shadow-inner font-sans w-full max-w-[100px] sm:max-w-[200px] md:max-w-[320px] truncate"
            />
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 font-mono hidden sm:inline shrink-0">v{docState.version}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2.5 shrink-0">
          {/* Auto save status */}
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 hidden md:flex items-center space-x-1">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t(`common.${autoSaveStatus}`)}</span>
          </span>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          </button>

          {/* Language Switcher */}
          <div className="hidden sm:flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700 shadow-xs mr-1 shrink-0">
            <button
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-extrabold rounded-md transition-all cursor-pointer ${locale === 'en'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('id')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-extrabold rounded-md transition-all cursor-pointer ${locale === 'id'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
            >
              ID
            </button>
          </div>

          {isSuperAdmin ? (
            <button
              onClick={onAdminClick}
              title={t('admin.openDashboard')}
              className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 bg-violet-50/80 dark:bg-violet-950/40 hover:bg-violet-100/80 dark:hover:bg-violet-900/60 px-2 sm:px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-900/50 flex items-center space-x-1 shadow-sm shrink-0 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
              <span className="hidden sm:inline">{t('common.superadmin')}</span>
            </button>
          ) : isSubscribed ? (
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 px-2 sm:px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50 flex items-center space-x-1 shadow-sm shrink-0" title={t('common.premium')}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="hidden sm:inline">{t('common.premium')}</span>
            </span>
          ) : (
            onUpgradeClick && (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-extrabold text-apple-gray-600 dark:text-white bg-apple-gray-50/80 dark:bg-zinc-800/80 hover:bg-apple-gray-100/80 dark:hover:bg-zinc-700 px-2 sm:px-2.5 py-1 rounded-full border border-apple-gray-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                title={t('common.upgrade')}
              >
                <Sparkles className="w-3.5 h-3.5 text-apple-gray-500 dark:text-white animate-pulse" />
                <span className="hidden sm:inline">{t('common.upgrade')}</span>
              </button>
            )
          )}

          {/* History */}
          <button
            onClick={onOpenHistory}
            className={`p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border transition-all shrink-0 ${isHistoryOpen
              ? 'bg-apple-gray-50 text-apple-gray-600 border-apple-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm'
              }`}
            title={t('history.title')}
          >
            <History className="w-4.5 h-4.5" />
          </button>

          {/* AI Chat button */}
          <button
            onClick={onOpenChat}
            className={`flex items-center justify-center p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${isChatOpen
              ? 'bg-apple-gray-50 text-apple-gray-600 border-apple-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm'
              }`}
            title={t('common.aiAssistant')}
          >
            <MessageSquare className="w-4 h-4 text-apple-gray-500 dark:text-zinc-400 shrink-0" />
            <span className="hidden sm:inline ml-1.5">{t('common.aiAssistant')}</span>
          </button>

          {/* Export */}
          <button
            onClick={onOpenExport}
            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:text-zinc-955 dark:hover:bg-zinc-200 rounded-xl transition-all shadow-sm shrink-0 dark:text-black"
            title={t('export.title')}
          >
            <Download className="w-4 h-4 text-white dark:text-zinc-800 shrink-0" />
            <span className="hidden sm:inline ml-1.5">{t('common.export')}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Outline Navigation (Far Left) */}
        <aside className="w-60 bg-white dark:bg-zinc-900/50 border-r border-slate-100 dark:border-zinc-800 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="p-4 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">{t('editor.documentOutline')}</h4>
            <div className="space-y-1">
              {docState.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeSectionId === sec.id
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40'
                    }`}
                >
                  <span className="truncate">{sec.title}</span>
                  {activeSectionId === sec.id && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-50 dark:border-zinc-800/60 bg-slate-50/20 dark:bg-zinc-900/20 text-[10px] text-slate-400 dark:text-zinc-500 leading-normal font-mono">
            {t('editor.documentId')} {docState.id}
          </div>
        </aside>

        {/* Double-Panel Split Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* View Mode Tab Switcher */}
          <div className="bg-slate-100/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-zinc-800/50 px-4 py-2 flex items-center justify-center shrink-0">
            <div className="flex bg-slate-200/60 dark:bg-zinc-900/60 p-1 rounded-xl space-x-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 text-center ${activeTab === 'edit'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-zinc-800/40'
                  }`}
              >
                {t('editor.editMarkdown')}
              </button>

              <button
                onClick={() => setActiveTab('split')}
                className={`hidden lg:inline-block py-1.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 text-center ${activeTab === 'split'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-655 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-zinc-800/40'
                  }`}
              >
                {t('editor.splitView')}
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 text-center ${activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-655 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-zinc-800/40'
                  }`}
              >
                {t('editor.documentPreview')}
              </button>
            </div>
          </div>

          {/* Workspace Panels Container */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Panel 1: Markdown Section Editor (Left) */}
            <div className={`flex-1 flex flex-col border-r border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-hidden prd-editor-panel-print-hide ${activeTab === 'edit' || activeTab === 'split' ? 'flex' : 'hidden'
              }`}>
              {/* Outline navigation for mobile */}
              <div className="md:hidden p-3 border-b border-slate-100 dark:border-zinc-800 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {docState.sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${activeSectionId === sec.id
                      ? 'bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                      }`}
                  >
                    {sec.title.replace(/^\d+\.\s*/, '')}
                  </button>
                ))}
              </div>

              {/* Section editor header */}
              <div className="p-4 border-b border-slate-50 dark:border-zinc-800/50 flex items-center justify-between shrink-0 bg-slate-50/20 dark:bg-zinc-900/10">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono uppercase tracking-wider">
                  {t('editor.editHeader')} {activeSection?.title}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-450 font-mono">{t('editor.markdownFormat')}</span>
              </div>

              {/* Edit Textarea */}
              <textarea
                value={activeSection?.content || ''}
                onChange={(e) => handleSectionContentChange(e.target.value)}
                placeholder={activeSection?.title ? t('editor.writePlaceholder', { section: activeSection.title }) : t('editor.writeGeneralPlaceholder')}
                className="flex-1 p-6 text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-mono placeholder-zinc-400 dark:placeholder-zinc-600 bg-white dark:bg-zinc-950 focus:outline-none resize-none overflow-y-auto"
              />
            </div>

            {/* Panel 2: rendered HTML preview (Right) */}
            <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-zinc-900/20 overflow-hidden prd-preview-wrapper-print ${activeTab === 'preview' || activeTab === 'split' ? 'flex' : 'hidden'
              }`}>
              <div className="p-4 border-b border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between shrink-0 bg-slate-100/50 dark:bg-zinc-900/50 no-print">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider">
                  {t('editor.previewHeader')}
                </span>
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-550">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{t('editor.htmlOutput')}</span>
                </div>
              </div>

              {/* Live Render Area */}
              <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-zinc-900 prd-content prd-preview-print">
                {/* Entire Document Render */}
                <div className="w-full space-y-8">
                  <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 leading-tight tracking-tight font-sans border-0 pb-0 mb-2">
                      {docState.title}
                    </h1>
                    <p className="text-sm text-slate-400 dark:text-zinc-455 font-sans">{docState.description}</p>
                  </div>

                  {docState.sections.map((sec) => (
                    <section
                      key={sec.id}
                      id={`preview-section-${sec.id}`}
                      className={`py-2 px-3.5 rounded-2xl border transition-all duration-300 ${activeSectionId === sec.id
                        ? 'bg-apple-gray-50/15 dark:bg-zinc-800/10 border-dashed border-apple-gray-200/40 dark:border-zinc-700/40 shadow-sm'
                        : 'border-transparent'
                        }`}
                    >
                      <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-200 font-sans mb-3 pb-1.5 border-b border-slate-100/80 dark:border-zinc-800/80">
                        {sec.title}
                      </h2>
                      <div className="prd-content prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base prose-headings:font-sans prose-headings:font-bold prose-p:leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={markdownComponents}
                        >
                          {sec.content}
                        </ReactMarkdown>
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {isChatOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-xs z-20 lg:hidden animate-fadeIn"
              onClick={onOpenChat}
            />
            <AIChatPanel
              document={docState}
              onClose={onOpenChat}
              isSubscribed={isSubscribed}
              onUpgradeClick={onUpgradeClick}
              onApplyChange={(sectionId, oldContent, newContent, changeSummary) => {
                const normalize = (str: string) => str.toLowerCase().replace(/^\d+\.\s*/, '').replace(/[^a-z0-9]/g, '');
                const normTarget = normalize(sectionId);
                const matchedSection = docState.sections.find((s) => {
                  const normId = normalize(s.id);
                  const normTitle = normalize(s.title);
                  return normId === normTarget || normTitle === normTarget || normId.includes(normTarget) || normTarget.includes(normId);
                });
                if (matchedSection) {
                  setActiveSectionId(matchedSection.id);
                }
                onApplyChange(sectionId, oldContent, newContent, changeSummary);
              }}
            />
          </>
        )}

        {isHistoryOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-xs z-20 lg:hidden animate-fadeIn"
              onClick={onOpenHistory}
            />
            <VersionHistoryPanel
              document={docState}
              versions={versions}
              onClose={onOpenHistory}
              onRollback={onRollback}
            />
          </>
        )}
      </div>
    </div>
  );
};
