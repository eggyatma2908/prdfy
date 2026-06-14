import React, { useState } from 'react';
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle2, Rocket } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

interface ResetPasswordFormProps {
  token: string;
  onComplete: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onComplete,
}) => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (pass: string) => {
    return {
      hasMinLength: pass.length >= 8,
      hasUppercase: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSymbol: /[^A-Za-z0-9]/.test(pass)
    };
  };

  const strength = checkPasswordStrength(password);
  const isPasswordValid = strength.hasMinLength && strength.hasUppercase && strength.hasNumber && strength.hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError(t('auth.requiredPassword') || "Kata sandi tidak memenuhi semua kriteria keamanan.");
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsMustMatch') || "Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (result?.error) {
        setError(result.error.message || "Gagal memperbarui kata sandi Anda.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses pembaruan kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {t('auth.resetSuccessTitle') || "Kata Sandi Diperbarui"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              {t('auth.resetSuccessDesc') || "Kata sandi Anda telah berhasil diperbarui. Silakan masuk kembali."}
            </p>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
          >
            {t('auth.backToLogin') || "Kembali ke Login"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/10">
            <Rocket className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-foreground tracking-tight mt-2">
            {t('auth.resetPasswordTitle') || "Buat Kata Sandi Baru"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
            {t('auth.resetPasswordDesc') || "Silakan masukkan kata sandi baru Anda di bawah ini."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center space-x-2.5 text-xs text-destructive animate-slideDown">
            <AlertCircle className="w-4.5 h-4.5 text-destructive shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase pl-1">
              {t('auth.newPassword') || "Kata Sandi Baru"}
            </label>
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

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase pl-1">
              {t('auth.confirmNewPassword') || "Konfirmasi Kata Sandi Baru"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-200 dark:focus:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all"
              />
            </div>
          </div>

          {password.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/50 border border-slate-100 dark:border-zinc-800/80 text-[11px] space-y-1.5 animate-slideDown">
              <p className="font-bold text-muted-foreground text-[9px] uppercase tracking-wider mb-1">Kekuatan Sandi / Password Strength:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 font-sans">
                <div className={`flex items-center space-x-1.5 font-medium ${strength.hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  <span className="text-xs">{strength.hasMinLength ? '✓' : '✗'}</span>
                  <span>{t('auth.criteriaLength')}</span>
                </div>
                <div className={`flex items-center space-x-1.5 font-medium ${strength.hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-550'}`}>
                  <span className="text-xs">{strength.hasUppercase ? '✓' : '✗'}</span>
                  <span>{t('auth.criteriaUppercase')}</span>
                </div>
                <div className={`flex items-center space-x-1.5 font-medium ${strength.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-555'}`}>
                  <span className="text-xs">{strength.hasNumber ? '✓' : '✗'}</span>
                  <span>{t('auth.criteriaNumber')}</span>
                </div>
                <div className={`flex items-center space-x-1.5 font-medium ${strength.hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-555'}`}>
                  <span className="text-xs">{strength.hasSymbol ? '✓' : '✗'}</span>
                  <span>{t('auth.criteriaSymbol')}</span>
                </div>
              </div>
            </div>
          )}

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
                <span>{t('auth.resetPasswordBtn')}...</span>
              </>
            ) : (
              <span>{t('auth.resetPasswordBtn')}</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
