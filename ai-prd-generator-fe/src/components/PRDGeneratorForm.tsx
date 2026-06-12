import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  User,
  Layers,
  Tag,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PRDGeneratorFormProps {
  onGenerate: (prompt: string, title: string, options: { techStack: string; targetUser: string; tags: string[] }) => void;
  isGenerating: boolean;
}

export function generateDynamicTitle(promptText: string): string {
  if (!promptText) return "New Document";

  let cleaned = promptText.trim();

  // List of Indonesian/English introductory patterns to strip
  const introPatterns = [
    /^(tolong\s+)?bantu\s+buatkan\s+(aplikasi|sistem|fitur|platform)?/i,
    /^(tolong\s+)?buatkan\s+(aplikasi|sistem|fitur|platform)?/i,
    /^(tolong\s+)?bikin\s+(aplikasi|sistem|fitur|platform)?/i,
    /^(aplikasi|sistem|fitur|platform|software|program)\s+untuk\s+/i,
    /^(aplikasi|sistem|fitur|platform|software|program)\s+yang\s+/i,
    /^(bantu\s+)?rancang\s+(aplikasi|sistem|fitur|platform)?/i,
    /^please\s+create\s+(a|an\s+)?(app|system|feature|platform)?/i,
    /^create\s+(a|an\s+)?(app|system|feature|platform)?/i,
    /^build\s+(a|an\s+)?(app|system|feature|platform)?/i,
  ];

  for (const pattern of introPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  cleaned = cleaned.trim();

  const words = cleaned.split(/\s+/);

  const titleWords: string[] = [];
  let charCount = 0;

  for (const word of words) {
    if (titleWords.length >= 5 || charCount + word.length > 40) {
      break;
    }
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, "");
    if (cleanWord.trim().length > 0) {
      titleWords.push(cleanWord);
      charCount += cleanWord.length + 1;
    }
  }

  const stopWords = ['untuk', 'yang', 'dan', 'dengan', 'di', 'ke', 'dari', 'beserta', 'bagi', 'pada', 'tentang', 'oleh', 'for', 'and', 'with', 'in', 'to', 'from', 'of', 'on', 'about', 'by'];
  while (titleWords.length > 0 && stopWords.includes(titleWords[titleWords.length - 1].toLowerCase())) {
    titleWords.pop();
  }

  const titleText = titleWords
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return titleText ? `${titleText}` : "New Document";
}

export const PRDGeneratorForm: React.FC<PRDGeneratorFormProps> = ({ onGenerate, isGenerating }) => {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const loadingSteps = [
    t('form.loadingSteps.0'),
    t('form.loadingSteps.1'),
    t('form.loadingSteps.2'),
    t('form.loadingSteps.3'),
    t('form.loadingSteps.4'),
    t('form.loadingSteps.5'),
    t('form.loadingSteps.6')
  ];

  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, loadingSteps.length]);

  const quickPrompts = React.useMemo(() => [
    {
      label: t('form.samples.saas.label'),
      text: t('form.samples.saas.text')
    },
    {
      label: t('form.samples.mobile.label'),
      text: t('form.samples.mobile.text')
    },
    {
      label: t('form.samples.api.label'),
      text: t('form.samples.api.text')
    },
    {
      label: t('form.samples.cli.label'),
      text: t('form.samples.cli.text')
    }
  ], [t]);

  useEffect(() => {
    const matched = quickPrompts.find((qp) => qp.text === prompt);
    if (matched) {
      setSelectedSample(matched.label);
    } else {
      setSelectedSample(null);
    }
  }, [prompt, quickPrompts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const finalTitle = title.trim() ? title.trim() : generateDynamicTitle(prompt);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    if (tags.length === 0) {
      tags.push('AI-Generated');
    }

    onGenerate(prompt, finalTitle, {
      techStack: techStack.trim() || 'Next.js, Tailwind, PostgreSQL',
      targetUser: targetUser.trim() || 'Umum',
      tags
    });
  };

  const handleQuickPromptClick = (text: string, label: string) => {
    setPrompt(text);
    setTitle(`${label}`);
    if (label.includes("SaaS")) {
      setTechStack("React, Tailwind CSS, Stripe API, Node.js");
      setTargetUser("Merchant & Finance Team");
      setTagsInput("SaaS, Payment, Checkout");
    } else if (label.includes("Mobile")) {
      setTechStack("Flutter, Firebase, GPS, Camera SDK");
      setTargetUser("Company Employees");
      setTagsInput("Mobile, HR, Biometrics");
    } else if (label.includes("API")) {
      setTechStack("Node.js, Express, Zod, PostgreSQL");
      setTargetUser("Frontend Developer & Partner");
      setTagsInput("REST-API, Backend, Inventory");
    } else if (label.includes("CLI")) {
      setTechStack("Go, GitHub REST API, Git Hooks");
      setTargetUser("DevOps & Developer Team");
      setTagsInput("CLI, Developer Tools, Security");
    }
    setShowAdvanced(true);
  };

  const handleResetSelection = () => {
    setPrompt('');
    setTitle('');
    setTechStack('');
    setTargetUser('');
    setTagsInput('');
    setSelectedSample(null);
    setShowAdvanced(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight font-sans">
          {t('form.title')}
        </h2>
        <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">
          {t('form.subtitle')}
        </p>
      </div>

      {isGenerating ? (
        /* Minimalist Generation Loading UI */
        <div className="glass-panel p-5 sm:p-10 rounded-3xl text-center space-y-8 relative overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-sm">
              <Cpu className="w-8 h-8 animate-pulse text-zinc-700 dark:text-zinc-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{t('form.loadingTitle')}</h3>
              <p className="text-xs font-sans text-zinc-500 dark:text-zinc-400 tracking-wide">
                {t('form.loadingSubtitle')}
              </p>
            </div>
          </div>

          {/* Stepper progress representation */}
          <div className="max-w-md mx-auto space-y-3 pt-4 text-left">
            {loadingSteps.map((step, idx) => {
              const isCurrent = loadingStep === idx;
              const isPast = loadingStep > idx;
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 text-xs transition-all duration-500 ${isCurrent
                    ? 'text-slate-800 dark:text-zinc-100 font-semibold scale-[1.01] bg-slate-50/50 dark:bg-zinc-800/40 p-2 rounded-lg border border-slate-100 dark:border-zinc-750'
                    : isPast
                      ? 'text-slate-600 dark:text-zinc-400 font-medium'
                      : 'text-slate-300 dark:text-zinc-650'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border font-mono text-[9px] shrink-0 mt-0.5 ${isCurrent
                    ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-bold'
                    : isPast
                      ? 'border-emerald-500 bg-emerald-500 text-zinc-950 dark:text-white'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700'
                    }`}>
                    {isPast ? "✓" : idx + 1}
                  </div>
                  <span className="flex-1 whitespace-normal leading-normal">{step}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans italic max-w-xs mx-auto">
            {t('form.tip')}
          </div>
        </div>
      ) : (
        /* Input Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
            {/* Prompt Textarea */}
            <div className="space-y-2">
              <label htmlFor="prd-prompt" className="text-sm font-bold text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-apple-gray-500 dark:text-zinc-400" />
                <span>{t('form.coreIdea')}</span>
              </label>
              <textarea
                id="prd-prompt"
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('form.placeholder')}
                rows={5}
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-sm placeholder-slate-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Quick suggestions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  {t('form.selectSample')}
                </span>
                {selectedSample && (
                  <button
                    type="button"
                    onClick={handleResetSelection}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent transition-all cursor-pointer"
                    title={t('form.resetSelected')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((qp, idx) => {
                  const isSelected = selectedSample === qp.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPromptClick(qp.text, qp.label)}
                      className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between space-y-1 ${isSelected
                        ? 'bg-zinc-100 hover:bg-zinc-200/60 focus:bg-zinc-200/60 dark:bg-zinc-800 dark:hover:bg-zinc-700/60 dark:focus:bg-zinc-700/60 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none'
                        : 'bg-slate-50/50 hover:bg-slate-50 focus:bg-slate-50 dark:bg-zinc-800/20 dark:hover:bg-zinc-800/50 dark:focus:bg-zinc-800/50 border-slate-200/60 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 focus:outline-none'
                        }`}
                    >
                      <span className={`font-bold ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300'}`}>{qp.label}</span>
                      <span className={`line-clamp-1 font-sans ${isSelected ? 'text-zinc-500 dark:text-zinc-400' : 'text-slate-400 dark:text-zinc-500'}`}>{qp.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
            >
              <span>{t('form.advancedSettings')}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Collapsible Panel */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100/80 dark:border-zinc-800/85 animate-slideDown">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-white flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 animate-pulse" />
                    <span>{t('form.prdTitle')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('form.prdTitlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-white flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{t('form.techStack')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('form.techStackPlaceholder')}
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-white flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{t('form.targetUsers')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('form.targetUsersPlaceholder')}
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-white flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{t('form.tags')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('form.tagsPlaceholder')}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Prompt warning & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            <div className="hidden sm:flex items-center space-x-2 text-slate-400 dark:text-zinc-500">
              <AlertCircle className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
              <span className="text-[10px] leading-none">{t('form.footerText')}</span>
            </div>
            <button
              type="submit"
              disabled={!prompt.trim()}
              className={`flex items-center justify-center space-x-2 px-8 py-3.5 text-sm font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-black dark:hover:bg-zinc-200 rounded-xl transition-all duration-200 shadow-sm w-full sm:w-auto ${!prompt.trim() ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''
                }`}
            >
              <Sparkles className="w-4.5 h-4.5 text-white dark:text-zinc-900" />
              <span>{t('form.generateButton')}</span>
            </button>
          </div>
        </form>
      )}
      <div className="h-12" />
    </div>
  );
};
