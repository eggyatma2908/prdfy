import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, User, X, Rocket, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showCloseButton?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showCloseButton = true,
}) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      sessionStorage.setItem('just_logged_in', 'true');
      await signIn.social({
        provider: 'google',
        callbackURL: window.location.origin
      });
    } catch (err: any) {
      sessionStorage.removeItem('just_logged_in');
      setError(err.message || "Failed to connect Google authentication.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError(t('auth.requiredName'));
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError(t('auth.requiredPassword'));
          setLoading(false);
          return;
        }
        const result = await signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
        });
        if (result?.error) {
          setError(result.error.message || "Failed to register a new account.");
        } else {
          onSuccess();
        }
      } else {
        const result = await signIn.email({
          email: email.trim(),
          password,
        });
        if (result?.error) {
          setError(result.error.message || "Incorrect email or password. Please check your credentials.");
        } else {
          onSuccess();
        }
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('fetch') || err?.name === 'TypeError') {
        setError("Unable to connect to the server. Make sure the backend is running on port 3000.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTab = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto no-print">
          {/* Backdrop Click Close & Blur (Sibling, fixed layout) */}
          {showCloseButton ? (
            <div
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fadeIn"
              onClick={onClose}
            />
          ) : (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fadeIn" />
          )}

          {/* Dialog Positioner (Centers the modal vertically and horizontally) */}
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-card dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-border z-10 flex flex-col space-y-6"
            >
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Header */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/10">
                  <Rocket className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight mt-2">
                  {isSignUp ? t('auth.welcomeTitleSignup') : t('auth.welcomeTitleSignin')}
                </h3>
                <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                  {isSignUp
                    ? t('auth.welcomeDescSignup')
                    : t('auth.welcomeDescSignin')}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center space-x-2.5 text-xs text-destructive animate-slideDown">
                  <AlertCircle className="w-4.5 h-4.5 text-destructive shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase pl-1">{t('auth.fullName')}</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder={t('auth.fullNamePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase pl-1">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase pl-1">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl font-bold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{isSignUp ? t('auth.registerNow') : t('auth.signIn')}...</span>
                    </>
                  ) : (
                    <span>{isSignUp ? t('auth.registerNow') : t('auth.signIn')}</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-1.5 no-print">
                <div className="flex-grow border-t border-border" />
                <span className="flex-shrink mx-4 text-[10px] text-muted-foreground font-bold font-mono tracking-wider uppercase">Atau</span>
                <div className="flex-grow border-t border-border" />
              </div>

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 text-foreground border border-border rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-xs no-print"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>{t('auth.googleSignIn')}</span>
              </button>

              {/* Switch Mode Footer */}
              <div className="text-center pt-2 border-t border-border">
                <button
                  onClick={handleSwitchTab}
                  className="text-xs text-foreground/80 hover:text-foreground font-semibold hover:underline transition-all focus:outline-none cursor-pointer"
                >
                  {isSignUp
                    ? t('auth.switchSignup')
                    : t('auth.switchSignin')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
