import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  Cpu,
  Rocket,
  Sparkles,
  Layers,
  History,
  MessageSquare,
  ArrowRight,
  Check,
  Sun,
  Moon,
  Lock,
  ShieldCheck,
  Sparkle,
  ArrowUp
} from 'lucide-react';

interface LandingPageProps {
  onStartClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function LandingPage({ onStartClick, theme, toggleTheme }: LandingPageProps) {
  const { locale, setLocale, t } = useLanguage();

  const smoothScrollTo = (targetY: number, duration: number = 800) => {
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      window.scrollTo(0, startY + difference * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      smoothScrollTo(offsetPosition, 600);
    }
  };

  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    smoothScrollTo(0, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans transition-colors duration-300 overflow-x-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-300/10 dark:bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-zinc-300/10 dark:bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Header / Navbar */}
        <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white dark:text-zinc-900" />
              </div>
              <span className="font-extrabold text-base tracking-tight font-sans">PRDfy</span>
            </div>

            <nav className="hidden md:flex space-x-8 text-xs font-semibold">
              <button
                onClick={() => scrollToSection('features')}
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                {t('landing.navFeatures')}
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                {t('landing.navPricing')}
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center shadow-xs"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              </button>

              {/* Language Switcher */}
              <div className="flex bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-zinc-800 shadow-xs text-[10px] font-extrabold">
                <button
                  onClick={() => setLocale('en')}
                  className={`px-1.5 py-0.5 rounded-md cursor-pointer ${locale === 'en' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs' : 'text-slate-400 dark:text-zinc-500'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale('id')}
                  className={`px-1.5 py-0.5 rounded-md cursor-pointer ${locale === 'id' ? 'bg-white dark:bg-zinc-800 text-zinc-955 dark:text-white shadow-xs' : 'text-slate-400 dark:text-zinc-500'}`}
                >
                  ID
                </button>
              </div>

              {/* CTA Login */}
              <button
                onClick={onStartClick}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-black dark:hover:bg-white rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                {t('landing.navSignIn')}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-6 max-w-3xl mx-auto"
          >
            {/* Badge Release */}
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-[10px] font-bold text-slate-600 dark:text-zinc-400 shadow-xs backdrop-blur-xs">
              {t('landing.badge')}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black font-sans leading-tight tracking-tight text-slate-900 dark:text-zinc-50">
              {t('landing.heroTitlePart1')} <span className="bg-gradient-to-r from-zinc-900 to-zinc-650 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">{t('landing.heroTitlePart2')}</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              {t('landing.heroSub')}
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 w-full justify-center">
              <button
                onClick={onStartClick}
                className="px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-50 hover:bg-black dark:hover:bg-white text-white dark:text-black font-bold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer border border-zinc-800 dark:border-zinc-200 w-full sm:w-auto"
              >
                <span>{t('landing.ctaStart')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="px-6 py-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs tracking-wider uppercase shadow-xs transition-all border border-slate-200 dark:border-zinc-800 cursor-pointer w-full sm:w-auto"
              >
                {t('landing.ctaDemo')}
              </button>
            </div>
          </motion.div>

          {/* Floating preview mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-16 relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md max-w-5xl mx-auto p-2"
          >
            <div className="h-6 w-full border-b border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 flex items-center px-4 space-x-1.5 rounded-t-[20px]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono ml-4">https://prdfy.space</span>
            </div>
            <div className="bg-slate-50/50 dark:bg-zinc-950/40 h-64 sm:h-[400px] flex items-center justify-center overflow-hidden">
              {/* Visual preview representation */}
              <div className="w-full h-full p-4 sm:p-6 grid grid-cols-12 gap-4 text-left font-mono opacity-85">
                <div className="col-span-3 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3 bg-white dark:bg-zinc-900 hidden md:block">
                  <div className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded-md mb-4" />
                  <div className="space-y-2">
                    <div className="w-3/4 h-3 bg-slate-100 dark:bg-zinc-800 rounded-md" />
                    <div className="w-1/2 h-3 bg-slate-100 dark:bg-zinc-800 rounded-md" />
                    <div className="w-5/6 h-3 bg-slate-100 dark:bg-zinc-800 rounded-md" />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-9 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 bg-white dark:bg-zinc-900 flex flex-col space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="w-1/3 h-5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                    <div className="w-16 h-5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-150 dark:bg-zinc-800 rounded-md" />
                    <div className="w-full h-3 bg-slate-150 dark:bg-zinc-800 rounded-md" />
                    <div className="w-5/6 h-3 bg-slate-150 dark:bg-zinc-800 rounded-md" />
                  </div>
                  <div className="border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 h-32">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Sparkle className="w-4 h-4 text-zinc-500 dark:text-zinc-400 animate-spin" />
                    </div>
                    <div className="w-1/4 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="w-1/2 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-200/60 dark:border-zinc-900/60 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
              {t('landing.featureTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2">
              {t('landing.featureSub')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="glass-panel bg-white/70 dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-900/50 hover:shadow-lg transition-all flex flex-col space-y-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{t('landing.f1Title')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{t('landing.f1Desc')}</p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="glass-panel bg-white/70 dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-900/50 hover:shadow-lg transition-all flex flex-col space-y-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{t('landing.f2Title')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{t('landing.f2Desc')}</p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="glass-panel bg-white/70 dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-900/50 hover:shadow-lg transition-all flex flex-col space-y-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{t('landing.f3Title')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{t('landing.f3Desc')}</p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="glass-panel bg-white/70 dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-900/50 hover:shadow-lg transition-all flex flex-col space-y-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <History className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{t('landing.f4Title')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{t('landing.f4Desc')}</p>
              </div>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="glass-panel bg-white/70 dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-900/50 hover:shadow-lg transition-all flex flex-col space-y-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{t('landing.f5Title')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{t('landing.f5Desc')}</p>
              </div>
            </motion.div>

            {/* Card 6 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="glass-panel bg-white/70 dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-900/50 hover:shadow-lg transition-all flex flex-col space-y-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-50">{t('landing.f6Title')}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{t('landing.f6Desc')}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-200/60 dark:border-zinc-900/60 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
              {t('landing.pricingTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2">
              {t('landing.pricingSub')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col h-full"
            >
              <div className="glass-panel bg-white/60 dark:bg-zinc-900/30 p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-zinc-900/50 flex flex-col justify-between shadow-xs h-full">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 inline-block border border-slate-200/60 dark:border-zinc-700/60">
                    {t('landing.freeName')}
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black">{t('landing.freePrice')}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('landing.freeSub')}</p>
                  <hr className="border-slate-150 dark:border-zinc-800" />
                  <ul className="space-y-2.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('landing.freeFeat1')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('landing.freeFeat2')}</span>
                    </li>
                    <li className="flex items-center space-x-2 opacity-50">
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span className="line-through">{t('landing.freeFeat3')}</span>
                    </li>
                    <li className="flex items-center space-x-2 opacity-50">
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span className="line-through">{t('landing.freeFeat4')}</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={onStartClick}
                  className="mt-8 w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl font-bold text-xs cursor-pointer shadow-2xs border border-slate-200/50 dark:border-zinc-750 transition-all uppercase tracking-wider"
                >
                  {t('landing.ctaFree')}
                </button>
              </div>
            </motion.div>

            {/* Premium Tier */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col h-full"
            >
              <div className="glass-panel bg-white/95 dark:bg-zinc-900/80 p-6 sm:p-8 rounded-3xl border-2 border-zinc-900/80 dark:border-zinc-100/80 flex flex-col justify-between shadow-lg relative transform md:scale-105 h-full">
                <div className="absolute top-4 right-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                  Popular
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 inline-block border border-zinc-200/60 dark:border-zinc-700/60">
                    {t('landing.premiumName')}
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black">{t('landing.premiumPrice')}</span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold ml-1">{t('landing.premiumPeriod')}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('landing.premiumSub')}</p>
                  <hr className="border-slate-150 dark:border-zinc-800" />
                  <ul className="space-y-2.5 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('landing.premiumFeat1')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('landing.premiumFeat2')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('landing.premiumFeat3')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('landing.premiumFeat4')}</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={onStartClick}
                  className="mt-8 w-full py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-black dark:hover:bg-white text-white dark:text-black rounded-xl font-bold text-xs cursor-pointer shadow-md border border-zinc-800 dark:border-zinc-200 transition-all uppercase tracking-wider"
                >
                  {t('landing.ctaPremium')}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200/50 dark:border-zinc-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-450 dark:text-zinc-500 space-y-4 md:space-y-0 font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">PRDfy</span>
            <span>&copy; {new Date().getFullYear()} {t('landing.footerRights')}</span>
          </div>
          <span className="text-[10px] text-slate-450 dark:text-zinc-500 max-w-[280px] md:max-w-none text-center">
            {t('landing.footerStack')}
          </span>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:scale-105 active:scale-95 group"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
