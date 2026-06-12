import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Sparkles,
  Check,
  XCircle,
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import type { ChatMessage, PRDDocument } from '../types';
import apiClient from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

interface AIChatPanelProps {
  document: PRDDocument;
  onClose: () => void;
  onApplyChange: (sectionId: string, oldContent: string, newContent: string, changeSummary: string) => void;
  isSubscribed?: boolean;
  onUpgradeClick?: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  document,
  onClose,
  onApplyChange,
  isSubscribed = false,
  onUpgradeClick
}) => {
  const { locale, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: t('chat.welcome', { title: document.title }),
        timestamp: new Date().toISOString()
      }
    ]);
  }, [document.id, locale]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isReplying]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isReplying) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsReplying(true);

    apiClient.getChatResponse(textToSend, document)
      .then((res) => {
        setIsReplying(false);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toISOString(),
          suggestedDiff: res.suggestedDiff
        };
        setMessages(prev => [...prev, assistantMsg]);
      })
      .catch((err) => {
        setIsReplying(false);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: t('chat.failedRevision', { error: err.message || err }),
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleAcceptDiff = (msgId: string, diff: ChatMessage['suggestedDiff']) => {
    if (!diff) return;
    onApplyChange(diff.sectionId, diff.oldContent || '', diff.newContent, diff.summary);

    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          suggestedDiff: undefined,
          content: m.content + `\n\n${t('chat.approved')}`
        };
      }
      return m;
    }));
  };

  const handleRejectDiff = (msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          suggestedDiff: undefined,
          content: m.content + `\n\n${t('chat.rejected')}`
        };
      }
      return m;
    }));
  };

  const renderDiffBox = (msgId: string, diff: ChatMessage['suggestedDiff']) => {
    if (!diff) return null;

    const linesOld = diff.oldContent.split('\n');
    const linesNew = diff.newContent.split('\n');

    return (
      <div className="mt-3 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden text-[11px] font-mono leading-normal shadow-sm">
        <div className="bg-slate-100 dark:bg-zinc-900 px-3.5 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-sans">
          <span>{t('chat.reviewChanges', { section: diff.sectionId })}</span>
          <span className="text-[9px] font-normal font-mono bg-apple-gray-50 dark:bg-zinc-800 text-apple-gray-600 dark:text-zinc-300 px-1 py-0.5 rounded border border-apple-gray-100 dark:border-zinc-700">PROPOSAL</span>
        </div>

        <div className="p-3 max-h-40 overflow-y-auto space-y-1 bg-white dark:bg-zinc-900">
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans italic mb-2">
            {t('chat.changeSummary', { summary: diff.summary })}
          </div>
          <div className="space-y-0.5">
            {linesNew.slice(-4).map((line, idx) => {
              const isAdded = !linesOld.includes(line);
              return (
                <div
                  key={idx}
                  className={`px-1.5 py-0.5 rounded ${isAdded ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-350 border-l-2 border-emerald-500' : 'text-slate-500 dark:text-zinc-400'}`}
                >
                  <span className="select-none mr-2 opacity-50">{isAdded ? '+' : ' '}</span>
                  {line || ' '}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button trigger */}
        <div className="bg-slate-50 dark:bg-zinc-950/80 p-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end space-x-2 font-sans">
          <button
            onClick={() => handleRejectDiff(msgId)}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-bold text-slate-505 dark:text-zinc-450 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-202 dark:border-zinc-800 hover:border-red-100 rounded-lg transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{t('chat.reject')}</span>
          </button>
          <button
            onClick={() => handleAcceptDiff(msgId, diff)}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t('chat.apply')}</span>
          </button>
        </div>
      </div>
    );
  };

  const promptTags = [
    { label: t('chat.chips.story.label'), text: t('chat.chips.story.text') },
    { label: t('chat.chips.nfr.label'), text: t('chat.chips.nfr.text') },
    { label: t('chat.chips.constraints.label'), text: t('chat.chips.constraints.text') }
  ];

  return (
    <aside className="w-full max-w-md lg:w-96 bg-white dark:bg-zinc-900 border-l border-slate-100 dark:border-zinc-800/80 h-[calc(100vh-4rem)] lg:h-full flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-[-4px_0_24px_rgba(0,0,0,0.01)] z-30 animate-slideLeft fixed lg:static right-0 top-16 lg:top-0 bottom-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-apple-gray-50 dark:bg-zinc-800 border border-apple-gray-100 dark:border-zinc-700 flex items-center justify-center text-apple-gray-500 dark:text-zinc-400 shadow-sm">
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight">{t('common.aiAssistant')}</h3>
            <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Iterative PRD Chat</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-100 dark:hover:border-zinc-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isSubscribed ? (
        <>
          {/* Feed Panel */}
          <div
            ref={feedRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-zinc-950/40"
          >
            {messages.map((msg) => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-1 ${isAI ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${isAI
                      ? 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-800 rounded-tl-sm'
                      : 'bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-sm'
                      }`}
                  >
                    {/* AI Spark Logo on top */}
                    {isAI && (
                      <div className="flex items-center space-x-1 mb-2 text-apple-gray-500 dark:text-zinc-400 font-bold font-mono text-[9px] uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-apple-gray-500 dark:text-zinc-400 fill-apple-gray-500/20 dark:fill-zinc-400/20" />
                        <span>{t('common.aiAssistant')}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line font-sans">
                      {msg.content}
                    </div>

                    {/* Inline Diff Box */}
                    {isAI && msg.suggestedDiff && renderDiffBox(msg.id, msg.suggestedDiff)}
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 dark:text-zinc-500 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Loading Bubble */}
            {isReplying && (
              <div className="flex flex-col items-start space-y-1">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] text-xs flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-apple-gray-500 dark:text-zinc-400 animate-bounce" />
                  <span className="text-slate-400 dark:text-zinc-550 font-medium">{t('chat.aiReviewing')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Inputs Drawer */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shrink-0">
            {/* Suggestion prompt chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap pb-2 chips-scroll-container scroll-smooth">
              {promptTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(tag.text)}
                  className="px-2.5 py-1 text-[10px] bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-slate-505 dark:text-zinc-400 hover:text-apple-gray-600 dark:hover:text-zinc-200 hover:bg-apple-gray-50/50 dark:hover:bg-zinc-750 hover:border-apple-gray-205 dark:hover:border-zinc-600 transition-all rounded-md flex items-center space-x-1"
                >
                  <span>{tag.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>

            {/* Input input-box */}
            <div className="relative flex items-center">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('chat.inputText')}
                rows={1}
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl pl-3 pr-10 py-3 text-xs placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all resize-none shadow-inner"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isReplying}
                className={`absolute right-2.5 p-2 rounded-lg transition-all ${inputValue.trim() && !isReplying
                  ? 'bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-900 dark:hover:bg-zinc-200 shadow-sm'
                  : 'text-slate-300 dark:text-zinc-700'
                  }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[8px] text-slate-400 dark:text-zinc-500 font-mono px-1">
              <span>{t('chat.shiftEnter')}</span>
              <span>{t('chat.contextLoaded')}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-50/50 dark:bg-zinc-950/20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-100 border border-zinc-800 dark:border-zinc-200 flex items-center justify-center text-white dark:text-zinc-900 shadow-md">
            <Sparkles className="w-8 h-8 text-white dark:text-zinc-900 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight font-sans">
              {t('chat.lockedTitle')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans font-medium">
              {t('chat.lockedDescription')}
            </p>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold text-xs tracking-wider uppercase shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer border border-zinc-800 dark:border-zinc-200"
            >
              <Sparkles className="w-4 h-4 text-white dark:text-zinc-900" />
              <span>{t('common.upgrade')}</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
