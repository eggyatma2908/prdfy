import React, { Suspense, useState, useEffect } from 'react';
import { PRDGeneratorForm } from './components/PRDGeneratorForm';
import { ExportModal } from './components/ExportModal';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { Rocket, LogOut, LogIn, Menu, Sparkles, X, Sun, Moon, Crown, MessageSquare } from 'lucide-react';
import { HistorySidebar } from './components/HistorySidebar';
import { AuthModal } from './components/AuthModal';
import { authClient } from './lib/auth-client';
import { motion } from 'framer-motion';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { useWorkspace } from './hooks/useWorkspace';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { FeedbackModal } from './components/FeedbackModal';
import { LandingPage } from './components/LandingPage';
import { apiClient } from './services/apiClient';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ResetPasswordForm } from './components/ResetPasswordForm';

const PRDEditor = React.lazy(() =>
  import('./components/PRDEditor').then((m) => ({ default: m.PRDEditor }))
);

function AppContent() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const {
    user,
    isSubscribed,
    isSuperAdmin,
    documents,
    versions,
    activeDocumentId,
    activeDoc,
    isGenerating,
    isChatOpen,
    isHistoryOpen,
    isExportOpen,
    isHistorySidebarOpen,
    documentToDelete,
    confirmRollbackVersion,
    isUpgradeModalOpen,
    isUpgrading,
    toasts,
    showToast,
    removeToast,
    loadDocuments,
    selectDocument,
    setDocumentToDelete,
    executeDeleteDocument,
    saveDocument,
    generatePRD,
    applyChatChange,
    setConfirmRollbackVersion,
    executeRollback,
    upgradeSubscription,
    setChatOpen,
    setHistoryOpen,
    setExportOpen,
    setHistorySidebarOpen,
    setUpgradeModalOpen,
    theme,
    toggleTheme
  } = useWorkspace();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    apiClient.logVisitor(window.location.pathname, document.referrer);

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const { locale, setLocale, t } = useLanguage();

  if (resetToken) {
    return (
      <ResetPasswordForm
        token={resetToken}
        onComplete={() => {
          setResetToken(null);
          setIsAuthOpen(true);
        }}
      />
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage
          onStartClick={() => setIsAuthOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            setIsAuthOpen(false);
            sessionStorage.setItem('just_logged_in', 'true');
            loadDocuments();
          }}
          showCloseButton={true}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const renderTabContent = () => {
    if (activeDoc) {
      return (
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-zinc-950">
            <div className="flex items-center space-x-2 text-slate-400 dark:text-zinc-555 font-sans text-xs">
              <div className="w-4 h-4 border-2 border-slate-350 dark:border-zinc-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading editor...</span>
            </div>
          </div>
        }>
          <PRDEditor
            document={activeDoc}
            onSave={saveDocument}
            onBack={() => {
              selectDocument(null);
            }}
            onOpenChat={() => {
              setChatOpen(!isChatOpen);
              setHistoryOpen(false);
            }}
            onOpenHistory={() => {
              setHistoryOpen(!isHistoryOpen);
              setChatOpen(false);
            }}
            onOpenExport={() => setExportOpen(true)}
            isChatOpen={isChatOpen}
            isHistoryOpen={isHistoryOpen}
            versions={versions}
            onApplyChange={applyChatChange}
            onRollback={(ver) => setConfirmRollbackVersion(ver)}
            isHistorySidebarOpen={isHistorySidebarOpen}
            onToggleSidebar={() => setHistorySidebarOpen(!isHistorySidebarOpen)}
            isSubscribed={isSubscribed}
            onUpgradeClick={() => setUpgradeModalOpen(true)}
            onAdminClick={() => setIsAdminOpen(true)}
          />
        </Suspense>
      );
    }

    return (
      <div className="py-10 px-4 max-w-4xl mx-auto">
        <PRDGeneratorForm
          onGenerate={generatePRD}
          isGenerating={isGenerating}
        />
      </div>
    );
  };

  return (
    <div className="h-screen bg-grid-glow dark:bg-zinc-950 relative flex flex-row overflow-hidden">
      <HistorySidebar
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelectDocument={(id) => {
          selectDocument(id);
        }}
        onDeleteDocument={(doc) => setDocumentToDelete(doc)}
        isOpen={isHistorySidebarOpen}
        onToggle={() => setHistorySidebarOpen(!isHistorySidebarOpen)}
      />

      {isHistorySidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 xl:hidden"
          onClick={() => setHistorySidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <style>{`
          @media print {
            /* Pengaturan Margin Kertas Standard A4 */
            @page {
              size: A4;
              margin: 20mm;
            }
            html, body, #root, #root div, main, .prd-preview-wrapper-print, .prd-preview-print {
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
              position: static !important;
              display: block !important;
            }
            /* Memastikan semua elemen UI tersembunyi sepenuhnya menggunakan spesifisitas ID */
            #root aside, 
            #root header, 
            #root button, 
            #root select, 
            #root input, 
            #root textarea, 
            #root .no-print, 
            #root .prd-editor-panel-print-hide,
            #root [class*="no-print"] {
              display: none !important;
            }
            .prd-preview-wrapper-print {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .prd-preview-print {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
            }
            /* Mencegah pemotongan baris paragraf, daftar, dan tabel di tengah halaman */
            p, li, tr, pre, blockquote {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Mencegah judul terpisah dari kontennya di bawah halaman */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            /* Setiap bab baru (section) otomatis mulai di halaman baru agar rapi (terpisah per section) */
            .prd-preview-print section {
              page-break-before: always !important;
              break-before: page !important;
            }
            .prd-preview-print h2 {
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
            /* Desain Cover Page (Halaman Judul Pertama) */
            .prd-preview-print > div > div:first-child {
              margin-top: 40mm !important;
              margin-bottom: 20mm !important;
              text-align: center !important;
              border-bottom: none !important;
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            .prd-preview-print > div > div:first-child h1 {
              font-size: 32pt !important;
              line-height: 1.2 !important;
              margin-bottom: 8mm !important;
              font-weight: 800 !important;
            }
            .prd-preview-print > div > div:first-child p {
              font-size: 14pt !important;
              color: #6e6e73 !important;
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
          }
        `}</style>

        {!activeDoc && !isGenerating && (
          <header className="h-16 w-full glass-panel border-b border-slate-200/80 dark:border-zinc-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 z-20 shadow-sm shrink-0 no-print">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {!isHistorySidebarOpen && (
                <button
                  onClick={() => setHistorySidebarOpen(true)}
                  className="mr-1 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-all cursor-pointer animate-fadeIn"
                  title={t('sidebar.fileHistory')}
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-zinc-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xs sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans m-0 leading-tight">
                  {t('common.appName')} <span className="text-zinc-500 dark:text-zinc-400 font-normal text-[10px] sm:text-xs ml-1">AI</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-3.5">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              </button>

              {/* Language Switcher */}
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700 shadow-xs">
                <button
                  onClick={() => setLocale('en')}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-extrabold rounded-md transition-all cursor-pointer ${locale === 'en'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale('id')}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-extrabold rounded-md transition-all cursor-pointer ${locale === 'id'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                >
                  ID
                </button>
              </div>

              {user ? (
                <div className="flex items-center space-x-1.5 sm:space-x-2.5">
                  {isSuperAdmin ? (
                    <button
                      onClick={() => setIsAdminOpen(true)}
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
                    <button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="text-[10px] font-extrabold text-apple-gray-600 dark:text-zinc-300 bg-apple-gray-50/80 dark:bg-zinc-800/80 hover:bg-apple-gray-100/80 dark:hover:bg-zinc-700 px-2 sm:px-2.5 py-1 rounded-full border border-apple-gray-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                      title={t('common.upgrade')}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-apple-gray-500 dark:text-white animate-pulse" />
                      <span className="hidden sm:inline">{t('common.upgrade')}</span>
                    </button>
                  )}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs border border-zinc-700 dark:border-zinc-300 uppercase shrink-0" title={user.email}>
                    {user.name ? user.name.substring(0, 2) : user.email.substring(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 hidden md:inline">{user.name}</span>
                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    title={t('admin.sendFeedback')}
                    className="p-1.5 sm:p-2 text-slate-450 dark:text-white hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 rounded-xl transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await authClient.signOut();
                      showToast(t('auth.logoutToast'), "info");
                    }}
                    title={t('common.logout')}
                    className="p-1.5 sm:p-2 text-slate-450 dark:text-white hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 dark:bg-zinc-100 hover:bg-slate-900 dark:hover:bg-white dark:text-zinc-900 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('common.login')}</span>
                </button>
              )}
            </div>
          </header>
        )}

        <main className={`flex-1 min-h-0 transition-all pl-0 w-full ${activeDoc ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {renderTabContent()}
        </main>
      </div>

      {isExportOpen && activeDoc && (
        <ExportModal
          document={activeDoc}
          onClose={() => setExportOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={confirmRollbackVersion !== null}
        title={t('modals.rollbackTitle')}
        message={t('modals.rollbackMessage', { version: confirmRollbackVersion?.version || '' })}
        confirmText={t('modals.rollbackConfirm')}
        cancelText={t('common.cancel')}
        type="warning"
        onConfirm={executeRollback}
        onCancel={() => setConfirmRollbackVersion(null)}
      />

      <ConfirmModal
        isOpen={documentToDelete !== null}
        title={t('modals.deleteTitle')}
        message={t('modals.deleteMessage', { title: documentToDelete?.title || '' })}
        confirmText={t('modals.deleteConfirm')}
        cancelText={t('common.cancel')}
        type="danger"
        onConfirm={executeDeleteDocument}
        onCancel={() => setDocumentToDelete(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <AuthModal
        isOpen={false}
        onClose={() => { }}
        onSuccess={() => { }}
      />

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 no-print">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer" onClick={() => setUpgradeModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative glass-panel w-full max-w-md bg-white/95 dark:bg-zinc-900/95 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-zinc-800 z-10 flex flex-col space-y-6"
          >
            <button
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-xl text-slate-400 dark:text-zinc-500 hover:text-slate-655 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm border border-zinc-800 dark:border-zinc-200">
                <Sparkles className="w-6 h-6 text-white dark:text-zinc-900 animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight font-sans mt-2">
                {t('upgradeModal.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-[280px] leading-relaxed">
                {t('upgradeModal.description')}
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 text-left">
              <h4 className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">{t('upgradeModal.featuresTitle')}</h4>
              <ul className="text-xs text-slate-500 dark:text-zinc-400 space-y-2 pl-4 list-disc font-medium">
                <li>{t('upgradeModal.feature1')}</li>
                <li>{t('upgradeModal.feature2')}</li>
                <li>{t('upgradeModal.feature3')}</li>
                <li>{t('upgradeModal.feature4')}</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => upgradeSubscription('premium')}
                disabled={isUpgrading}
                className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 border border-zinc-800 dark:border-zinc-200"
              >
                {isUpgrading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t('upgradeModal.verifying')}</span>
                  </>
                ) : (
                  <span>{t('upgradeModal.action')}</span>
                )}
              </button>            </div>
          </motion.div>
        </div>
      )}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AdminDashboardModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </LanguageProvider>
  );
}
