import React, { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { Code2, Play, Maximize2, ZoomIn, ZoomOut, RotateCcw, X, Sparkles, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWorkspace } from '../hooks/useWorkspace';

interface MermaidDiagramProps {
  code: string;
}

function sanitizeMermaidLabels(code: string): string {
  const isFlowchart = /^\s*(flowchart|graph)\s/m.test(code);
  const isState = /^\s*(stateDiagram|stateDiagram-v2)\s/m.test(code);

  let cleaned = code;

  if (isFlowchart) {
    cleaned = cleaned.replace(
      /\[([^\]"'`]*[()\/<>\\|{}@!?#~+*&][^\]"'`]*)\]/g,
      (_, label) => `["${label}"]`,
    );

    const getSafeId = (label: string) => {
      return 'node_' + label.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    };

    cleaned = cleaned.replace(
      /(-->|==>|-\.->|---\s*|===\s*|&\s*)\s*(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\2/g,
      (_, arrow, quote, label) => `${arrow} ${getSafeId(label)}[${quote}${label}${quote}]`
    );

    cleaned = cleaned.replace(
      /(?<!-\s*-\s*|==\s*|-\.\s*)(["'])([^"'\\]*(?:\\.[^"'\\]*)*)\1\s*(-->|==>|-\.->|---\s*|===\s*|&\s*)/g,
      (_, quote, label, arrow) => `${getSafeId(label)}[${quote}${label}${quote}] ${arrow}`
    );
  }

  if (isFlowchart || isState) {
    const lines = cleaned.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('%%')) return line;

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return line;

      const prefix = line.slice(0, colonIndex + 1);
      const suffix = line.slice(colonIndex + 1);

      const cleanedSuffix = suffix.replace(/:/g, '.');
      return prefix + cleanedSuffix;
    });
    cleaned = processedLines.join('\n');
  }

  return cleaned;
}

function sanitizeMermaidErDiagram(code: string): string {
  const isErDiagram = /^\s*erDiagram/m.test(code);
  if (!isErDiagram) return code;

  // Match anything inside curly braces, e.g., entity blocks
  return code.replace(/\{([^}]+)\}/g, (_, blockContent) => {
    const lines = blockContent.split('\n');
    const sanitizedLines = lines.map((line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('%%')) {
        return line;
      }

      // Extract the comment if present
      const commentMatch = line.match(/\s*"([^"]*)"\s*$/);
      let commentStr = '';
      let lineWithoutComment = line;
      if (commentMatch) {
        commentStr = commentMatch[0];
        lineWithoutComment = line.substring(0, line.length - commentMatch[0].length);
      }

      const indentation = line.match(/^\s*/)?.[0] || '';
      const tokens = lineWithoutComment.trim().split(/\s+/).map(t => t.replace(/"/g, ''));
      if (tokens.length <= 2) {
        return indentation + tokens.join(' ') + commentStr;
      }

      const knownKeys = new Set(['PK', 'FK', 'UK', 'NK', 'AK']);
      const keyTokens: string[] = [];
      let keyTokensStartIndex = tokens.length;

      for (let i = tokens.length - 1; i >= 2; i--) {
        const token = tokens[i].replace(/,/g, '').toUpperCase();
        if (knownKeys.has(token)) {
          keyTokens.unshift(token);
          keyTokensStartIndex = i;
        } else {
          break;
        }
      }

      if (keyTokens.length > 0) {
        const validKeys = keyTokens.filter(k => k === 'PK' || k === 'FK');
        const typeAndNamePart = tokens.slice(0, keyTokensStartIndex).join(' ');
        const indentation = line.match(/^\s*/)?.[0] || '';

        if (validKeys.length > 0) {
          return `${indentation}${typeAndNamePart} ${validKeys.join(', ')}${commentStr}`;
        } else {
          return `${indentation}${typeAndNamePart}${commentStr}`;
        }
      }

      return line;
    });
    return `{${sanitizedLines.join('\n')}}`;
  });
}


export const MermaidDiagram: React.FC<MermaidDiagramProps> = React.memo(({ code }) => {
  const { t } = useLanguage();
  const { theme } = useWorkspace();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Normal view Zoom and Pan states
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Modal Fullscreen, Zoom, and Pan states
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [modalScale, setModalScale] = useState<number>(1);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalDragStart = useRef({ x: 0, y: 0 });

  // Code editor states
  const [showCode, setShowCode] = useState(false);
  const [editCode, setEditCode] = useState(code);
  const [activeCode, setActiveCode] = useState(code);
  const [copied, setCopied] = useState(false);

  const baseId = useId().replace(/:/g, '');
  const renderCountRef = useRef(0);

  useEffect(() => {
    setEditCode(code);
    setActiveCode(code);
  }, [code]);

  useEffect(() => {
    const w = window as any;
    let isMounted = true;

    const renderDiagram = async () => {
      if (!w.mermaid) {
        if (isMounted) setError('Menunggu library Mermaid.js dimuat...');
        return;
      }

      try {
        setError(null);
        setSvg('');
        const cleanedCode = sanitizeMermaidLabels(sanitizeMermaidErDiagram(activeCode.trim()));
        if (!cleanedCode) return;
        document.querySelectorAll(`[id^="mermaid-${baseId}"]`).forEach(el => el.remove());

        renderCountRef.current += 1;
        const renderId = `mermaid-${baseId}-${renderCountRef.current}`;

        const isDark = theme === 'dark';
        w.mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true, htmlLabels: true },
          er: { useMaxWidth: true },
          themeVariables: isDark ? {
            background: '#121212',
            primaryColor: '#1e1e1e',
            primaryTextColor: '#f3f4f6',
            lineColor: '#9ca3af',
            nodeBorder: '#4b5563',
            actorBorder: '#4b5563',
            actorBkg: '#1e1e1e',
            actorTextColor: '#f3f4f6',
            signalColor: '#d1d5db',
            signalTextColor: '#e5e7eb',
            labelBoxBkgColor: '#1e1e1e',
            labelBoxBorderColor: '#4b5563',
            labelTextColor: '#f3f4f6'
          } : {
            background: '#f8fafc',
            primaryColor: '#f1f5f9',
            primaryTextColor: '#0f172a',
            lineColor: '#64748b',
            nodeBorder: '#cbd5e1',
            actorBorder: '#cbd5e1',
            actorBkg: '#f1f5f9',
            actorTextColor: '#0f172a',
            signalColor: '#475569',
            signalTextColor: '#334155',
            labelBoxBkgColor: '#f1f5f9',
            labelBoxBorderColor: '#cbd5e1',
            labelTextColor: '#0f172a'
          }
        });

        const { svg: renderedSvg } = await w.mermaid.render(renderId, cleanedCode);

        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        console.warn('Mermaid parsing error:', err);
        if (isMounted) {
          setError(err.message || 'Gagal memproses diagram (kesalahan sintaks).');
        }
        document.querySelectorAll(`[id^="mermaid-${baseId}"]`).forEach(el => el.remove());
      }
    };

    if (!(window as any).mermaid) {
      const checkTimer = setInterval(() => {
        if ((window as any).mermaid) {
          clearInterval(checkTimer);
          renderDiagram();
        }
      }, 100);
      return () => {
        clearInterval(checkTimer);
        isMounted = false;
      };
    } else {
      renderDiagram();
    }

    return () => {
      isMounted = false;
    };
  }, [activeCode, baseId, theme]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Normal view drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Modal view drag handlers
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsModalDragging(true);
    modalDragStart.current = { x: e.clientX - modalPosition.x, y: e.clientY - modalPosition.y };
  };

  useEffect(() => {
    if (!isModalDragging) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setModalPosition({
        x: e.clientX - modalDragStart.current.x,
        y: e.clientY - modalDragStart.current.y
      });
    };
    const handleGlobalMouseUp = () => {
      setIsModalDragging(false);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isModalDragging]);

  const handleModalZoomIn = () => setModalScale(prev => Math.min(prev + 0.15, 3));
  const handleModalZoomOut = () => setModalScale(prev => Math.max(prev - 0.15, 0.4));
  const handleModalResetZoom = () => {
    setModalScale(1);
    setModalPosition({ x: 0, y: 0 });
  };

  const handlePlay = () => {
    setActiveCode(editCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error && error !== 'Menunggu library Mermaid.js dimuat...') {
    return (
      <div className="my-4">
        <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto font-mono text-xs border border-zinc-800 shadow-sm">
          <code>{editCode}</code>
        </pre>
        <div className="text-xs text-rose-500 mt-1.5 font-mono bg-rose-50/50 border border-rose-100 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <strong>Kesalahan Sintaks Mermaid:</strong> {error}
          </div>
          <button
            onClick={() => {
              setEditCode(code);
              setActiveCode(code);
              setError(null);
            }}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold rounded transition-colors cursor-pointer"
          >
            Reset Kode Awal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mermaid-wrapper my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121212] shadow-xl relative select-none">
      {/* Header Bar (Mockup Editor) */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-[#1e1e1e] border-b border-slate-200/80 dark:border-zinc-800 no-print">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-slate-500 dark:text-zinc-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${showCode ? 'text-amber-500 bg-slate-200 dark:bg-zinc-800' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800'}`}
            title={t('mermaid.viewCode')}
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlay}
            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-350 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={t('mermaid.compile')}
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={t('mermaid.fullscreenMode')}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code panel (collapsible source editor) */}
      {showCode && (
        <div className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0a0a0a] p-3 space-y-2 no-print">
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-sans px-1">
            <span>{t('mermaid.editInstruction')}</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">{t('mermaid.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('mermaid.copy')}</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            className="w-full h-36 bg-slate-50 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-300 font-mono text-[11px] p-3 rounded-lg border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 resize-y leading-relaxed"
            placeholder="Tulis kode Mermaid..."
          />
        </div>
      )}

      {/* Content Area */}
      <div
        onMouseDown={handleMouseDown}
        className="relative p-6 flex justify-center items-center overflow-hidden min-h-[300px] bg-white dark:bg-[#121212] mermaid-diagram-container cursor-grab active:cursor-grabbing"
      >
        {svg ? (
          <div
            className={`${isDragging ? '' : 'transition-transform duration-200 ease-out'} flex justify-center items-center w-full`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex items-center justify-center space-x-2 text-slate-400 dark:text-zinc-500 font-sans text-xs">
            <div className="w-4 h-4 border-2 border-slate-450 dark:border-zinc-500 border-t-transparent rounded-full animate-spin" />
            <span>{t('mermaid.loading')}</span>
          </div>
        )}

        {/* Floating Controls */}
        {svg && (
          <>
            {/* Zoom Controls (Bottom Right) */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-1 bg-white/95 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 p-1 rounded-lg shadow-lg no-print">
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                title={t('mermaid.zoomIn')}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                title={t('mermaid.zoomOut')}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Control (Bottom Center) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 no-print">
              <button
                onClick={handleResetZoom}
                className="p-1.5 bg-white/95 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white rounded-full shadow-lg transition-colors flex items-center justify-center cursor-pointer"
                title={t('mermaid.reset')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Modal Portal */}
      {isFullscreenOpen && createPortal(
        <div className="fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-50 flex flex-col animate-fadeIn select-none no-print">
          {/* Modal Header */}
          <div className="bg-white/90 dark:bg-zinc-950/90 border-b border-slate-200 dark:border-zinc-800/80 px-6 py-4">
            <div className="w-full mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                  <Sparkles className="w-4 h-4 text-slate-700 dark:text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-wide font-sans m-0 leading-tight">
                    {t('mermaid.preview')}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-1 block">
                    {t('mermaid.fullscreenMode')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFullscreenOpen(false);
                  setModalScale(1);
                  setModalPosition({ x: 0, y: 0 });
                }}
                className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
                title={t('mermaid.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Canvas Area */}
          <div
            onMouseDown={handleModalMouseDown}
            className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950 cursor-grab active:cursor-grabbing"
          >
            {svg ? (
              <div
                className={`${isModalDragging ? '' : 'transition-transform duration-200 ease-out'} flex justify-center items-center w-full`}
                style={{
                  transform: `translate(${modalPosition.x}px, ${modalPosition.y}px) scale(${modalScale})`,
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <div className="flex items-center justify-center space-x-2 text-slate-400 dark:text-zinc-500 font-sans text-xs">
                <div className="w-4 h-4 border-2 border-slate-300 dark:border-zinc-500 border-t-transparent rounded-full animate-spin" />
                <span>{t('mermaid.loading')}</span>
              </div>
            )}

            {/* Modal Controls */}
            {svg && (
              <>
                {/* Zoom controls */}
                <div className="absolute bottom-6 right-6 flex flex-col space-y-1 bg-white/95 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 p-1.5 rounded-xl shadow-2xl">
                  <button
                    onClick={handleModalZoomIn}
                    className="p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title={t('mermaid.zoomIn')}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleModalZoomOut}
                    className="p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title={t('mermaid.zoomOut')}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Reset button */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <button
                    onClick={handleModalResetZoom}
                    className="p-2.5 bg-white/95 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white rounded-full shadow-2xl transition-colors flex items-center justify-center cursor-pointer"
                    title={t('mermaid.reset')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});
