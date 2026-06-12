import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { PRDDocument, PRDVersion, ToastMessage, PRDSection } from '../types';
import apiClient from '../services/apiClient';
import { useSession, authClient } from '../lib/auth-client';
import confetti from 'canvas-confetti';
import { useLanguage } from './LanguageContext';

export interface WorkspaceContextType {
  user: any;
  isSubscribed: boolean;
  isSuperAdmin: boolean;
  documents: PRDDocument[];
  versions: PRDVersion[];
  activeDocumentId: string | null;
  activeDoc: PRDDocument | undefined;
  isGenerating: boolean;
  generatingSections: PRDSection[] | null;
  isChatOpen: boolean;
  isHistoryOpen: boolean;
  isExportOpen: boolean;
  isHistorySidebarOpen: boolean;
  documentToDelete: PRDDocument | null;
  confirmRollbackVersion: PRDVersion | null;
  isUpgradeModalOpen: boolean;
  isUpgrading: boolean;
  toasts: ToastMessage[];
  creatorEmail: string | null;

  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  loadDocuments: () => Promise<void>;
  selectDocument: (id: string | null) => void;
  setDocumentToDelete: (doc: PRDDocument | null) => void;
  executeDeleteDocument: () => Promise<void>;
  saveDocument: (updatedDoc: PRDDocument) => Promise<void>;
  generatePRD: (prompt: string, title: string, options: { techStack: string; targetUser: string; tags: string[] }) => void;
  applyChatChange: (sectionId: string, oldContent: string, newContent: string, changeSummary: string) => Promise<void>;
  setConfirmRollbackVersion: (version: PRDVersion | null) => void;
  executeRollback: () => Promise<void>;
  upgradeSubscription: (tier?: string) => Promise<void>;

  setChatOpen: (open: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setHistorySidebarOpen: (open: boolean) => void;
  setUpgradeModalOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const user = (session?.user as any) || null;
  const { t } = useLanguage();

  const [documents, setDocuments] = useState<PRDDocument[]>([]);
  const [versions, setVersions] = useState<PRDVersion[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSections, setGeneratingSections] = useState<PRDSection[] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<PRDDocument | null>(null);
  const [confirmRollbackVersion, setConfirmRollbackVersion] = useState<PRDVersion | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleSessionExpired = () => {
      showToast(t('auth.sessionExpiredToast'), 'error');
      authClient.signOut();
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [t]);

  useEffect(() => {
    if (!isPending && session) {
      const justLoggedIn = sessionStorage.getItem('just_logged_in');
      if (justLoggedIn === 'true') {
        sessionStorage.removeItem('just_logged_in');
        showToast(t('auth.welcomeToast'), 'success');
      }
    }
  }, [session, isPending, t]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await apiClient.fetchConfig();
        setCreatorEmail(config.creatorEmail);
      } catch (err) {
        console.error('Gagal mengambil email creator dari server:', err);
      }
    };
    fetchConfig();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isCreator = !!(user?.email && creatorEmail && user.email.toLowerCase() === creatorEmail.toLowerCase());
  const isSuperAdmin = user?.tier === 'superadministrator' || isCreator;
  const isSubscribed = user?.tier === 'premium' || isSuperAdmin;
  const activeDoc = documents.find((doc) => doc.id === activeDocumentId);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadDocuments = async () => {
    if (!user) return;
    try {
      const data = await apiClient.fetchDocuments();
      setDocuments(data);
    } catch (err: any) {
      showToast(t('toasts.connectError'), 'error');
    }
  };

  useEffect(() => {
    if (user) {
      loadDocuments();
    } else {
      setDocuments([]);
      setActiveDocumentId(null);
    }
  }, [user]);

  useEffect(() => {
    if (!activeDocumentId) {
      setVersions([]);
      return;
    }
    const fetchVersions = async () => {
      try {
        const data = await apiClient.fetchVersions(activeDocumentId);
        setVersions(data);
      } catch (e) {
        console.error('Gagal memuat riwayat versi:', e);
      }
    };
    fetchVersions();
  }, [activeDocumentId]);

  const selectDocument = (id: string | null) => {
    setActiveDocumentId(id);
    setIsChatOpen(false);
    setIsHistoryOpen(false);
  };

  const executeDeleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      await apiClient.deleteDocument(documentToDelete.id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete.id));
      if (activeDocumentId === documentToDelete.id) {
        selectDocument(null);
      }
      showToast(t('toasts.deleteSuccess'), 'success');
    } catch (err: any) {
      showToast(t('toasts.deleteError'), 'error');
    } finally {
      setDocumentToDelete(null);
    }
  };

  const saveDocument = async (updatedDoc: PRDDocument) => {
    try {
      await apiClient.updateDocument(updatedDoc.id, updatedDoc);
      setDocuments((prev) => prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc)));
    } catch (err: any) {
      console.error('Auto-save failed on server:', err);
    }
  };

  const generatePRD = (
    prompt: string,
    title: string,
    options: { techStack: string; targetUser: string; tags: string[] }
  ) => {
    const limit = isSuperAdmin ? Infinity : (isSubscribed ? 5 : 2);
    let count = 0;
    if (isSuperAdmin) {
      count = 0;
    } else if (isSubscribed) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      count = documents.filter(doc => new Date(doc.created_at) >= startOfToday).length;
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      count = documents.filter(doc => new Date(doc.created_at) >= thirtyDaysAgo).length;
    }

    if (count >= limit) {
      if (!isSubscribed) {
        setIsUpgradeModalOpen(true);
        showToast(t('toasts.limitExceeded'), 'error');
      } else {
        showToast(t('toasts.premiumLimitExceeded'), 'error');
      }
      return;
    }
    setIsGenerating(true);
    setIsHistorySidebarOpen(false);
    const docId = `prd-${Date.now()}`;
    const newDoc: PRDDocument = {
      id: docId,
      title: title,
      description: prompt,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: options.tags,
      sections: [
        { id: 'overview', title: '1. Overview', content: '' },
        { id: 'requirements_specification', title: '2. Requirements Specification', content: '' },
        { id: 'core_features', title: '3. Core Features', content: '' },
        { id: 'user_flow', title: '4. User Flow', content: '' },
        { id: 'system_architecture', title: '5. System Architecture', content: '' },
        { id: 'database_schema', title: '6. Database Schema', content: '' },
        { id: 'tech_stack_recommendation', title: '7. Tech Stack Recommendation', content: '' }
      ]
    };

    setGeneratingSections(newDoc.sections);
    let latestSections = newDoc.sections;
    const startTime = Date.now();

    const onChunk = (streamedSections: any[]) => {
      latestSections = streamedSections;
      setGeneratingSections(streamedSections);
      setDocuments((prevDocs) => {
        const exists = prevDocs.some((d) => d.id === docId);
        if (exists) {
          return prevDocs.map((d) => (d.id === docId ? { ...d, sections: streamedSections } : d));
        } else {
          return [...prevDocs, { ...newDoc, sections: streamedSections }];
        }
      });
    };

    const onComplete = async () => {
      const elapsed = Date.now() - startTime;
      const minDuration = 7000;
      const delay = Math.max(0, minDuration - elapsed);

      setTimeout(async () => {
        setIsGenerating(false);
        setGeneratingSections(null);
        const finalDoc: PRDDocument = {
          ...newDoc,
          sections: latestSections,
          updated_at: new Date().toISOString()
        };

        try {
          await apiClient.createDocument(finalDoc);
          setDocuments((prev) => {
            const exists = prev.some((d) => d.id === docId);
            if (exists) {
              return prev.map((d) => (d.id === docId ? finalDoc : d));
            } else {
              return [...prev, finalDoc];
            }
          });
        } catch (err: any) {
          console.error('Gagal sinkron dokumen ke server:', err);
          showToast(t('toasts.syncError'), 'error');
        }

        selectDocument(docId);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#27272a']
        });
        showToast(t('toasts.createSuccess'), 'success');
      }, delay);
    };

    const onError = (err: any) => {
      setIsGenerating(false);
      setGeneratingSections(null);
      showToast(t('toasts.apiFailed', { error: err.message || err }), 'error');
    };

    showToast(t('toasts.composing'), 'info');
    apiClient.streamPRD(prompt, title, options, onChunk, onComplete, onError);
  };

  const applyChatChange = async (sectionId: string, oldContent: string, newContent: string, changeSummary: string) => {
    if (!activeDoc) return;

    const snapshotId = `ver-${Date.now()}`;
    const newVersion: PRDVersion = {
      id: snapshotId,
      prd_id: activeDoc.id,
      version: activeDoc.version,
      sections: activeDoc.sections.map((s) => ({ ...s })),
      change_summary: changeSummary,
      created_at: new Date().toISOString()
    };

    try {
      await apiClient.saveVersion(activeDoc.id, newVersion);
      setVersions((prev) => [...prev, newVersion]);
    } catch (e) {
      console.error('Gagal mencadangkan versi di server:', e);
    }

    const normalize = (str: string) => str.toLowerCase().replace(/^\d+\.\s*/, '').replace(/[^a-z0-9]/g, '');
    const normTarget = normalize(sectionId);

    const updatedSections = activeDoc.sections.map((s) => {
      const normId = normalize(s.id);
      const normTitle = normalize(s.title);
      const isMatch = normId === normTarget || normTitle === normTarget || normId.includes(normTarget) || normTarget.includes(normId);

      if (isMatch) {
        const trimmedOld = oldContent?.trim();
        if (trimmedOld && s.content.includes(trimmedOld)) {
          return { ...s, content: s.content.replace(trimmedOld, newContent.trim()) };
        }
        const exactOld = oldContent;
        if (exactOld && s.content.includes(exactOld)) {
          return { ...s, content: s.content.replace(exactOld, newContent) };
        }
        return { ...s, content: newContent };
      }
      return s;
    });

    const updatedDoc: PRDDocument = {
      ...activeDoc,
      sections: updatedSections,
      version: activeDoc.version + 1,
      updated_at: new Date().toISOString()
    };

    try {
      await apiClient.updateDocument(activeDoc.id, updatedDoc);
      setDocuments((prev) => prev.map((d) => (d.id === activeDoc.id ? updatedDoc : d)));

      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#27272a']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#27272a']
      });
      showToast(t('toasts.revisionApplied'), 'success');
    } catch (err: any) {
      showToast(t('toasts.revisionSyncError', { error: err.message }), 'error');
    }
  };

  const executeRollback = async () => {
    if (!activeDoc || !confirmRollbackVersion) return;

    const updatedDoc: PRDDocument = {
      ...activeDoc,
      sections: confirmRollbackVersion.sections.map((s) => ({ ...s })),
      version: confirmRollbackVersion.version,
      updated_at: new Date().toISOString()
    };

    try {
      await apiClient.updateDocument(activeDoc.id, updatedDoc);
      setDocuments((prev) => prev.map((d) => (d.id === activeDoc.id ? updatedDoc : d)));
      setVersions((prev) => prev.filter(v => v.prd_id !== activeDoc.id || v.version < confirmRollbackVersion.version));

      setIsHistoryOpen(false);

      confetti({
        particleCount: 60,
        spread: 40,
        colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#27272a']
      });
      showToast(t('toasts.rollbackSuccess', { version: confirmRollbackVersion.version }), 'success');
    } catch (err: any) {
      showToast(t('toasts.rollbackSyncError', { error: err.message }), 'error');
    } finally {
      setConfirmRollbackVersion(null);
    }
  };

  const loadSnapScript = (isProduction: boolean, clientKey: string) => {
    return new Promise<void>((resolve, reject) => {
      const snapSrc = isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

      const keyToUse = clientKey || 'SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY';

      const existingScript = document.querySelector(`script[src="${snapSrc}"]`);
      if (existingScript) {
        existingScript.setAttribute('data-client-key', keyToUse);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = snapSrc;
      script.setAttribute('data-client-key', keyToUse);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuat script Midtrans Snap.'));
      document.head.appendChild(script);
    });
  };

  const upgradeSubscription = async (tier?: string) => {
    setIsUpgrading(true);
    try {
      const res = await apiClient.upgradeSubscription(tier);

      if (tier === 'superadministrator') {
        setIsUpgrading(false);
        setIsUpgradeModalOpen(false);
        await authClient.getSession();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#27272a']
        });
        showToast(t('toasts.upgradeSuperadminSuccess'), 'success');
        return;
      }

      if (res && (res as any).token) {
        const token = (res as any).token;
        const isProduction = !!(res as any).isProduction;
        const clientKey = (res as any).clientKey || '';
        await loadSnapScript(isProduction, clientKey);

        setIsUpgrading(false);

        (window as any).snap.pay(token, {
          onSuccess: async function (result: any) {
            console.log('Midtrans Snap payment success:', result);
            showToast(t('toasts.upgradeSuccess'), 'success');
            setIsUpgradeModalOpen(false);

            await authClient.getSession();

            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#27272a']
            });
          },
          onPending: function (result: any) {
            console.log('Midtrans Snap payment pending:', result);
            showToast('Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran.', 'info');
            setIsUpgradeModalOpen(false);
          },
          onError: function (result: any) {
            console.error('Midtrans Snap payment error:', result);
            showToast('Pembayaran gagal. Silakan coba lagi.', 'error');
          },
          onClose: function () {
            console.log('Midtrans Snap payment popup closed without finishing payment.');
          }
        });
      } else {
        throw new Error('Gagal menginisialisasi token pembayaran dari server.');
      }
    } catch (e: any) {
      setIsUpgrading(false);
      showToast(e.message || t('toasts.upgradeError'), 'error');
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        isSubscribed,
        isSuperAdmin,
        documents,
        versions,
        activeDocumentId,
        activeDoc,
        isGenerating,
        generatingSections,
        isChatOpen,
        isHistoryOpen,
        isExportOpen,
        isHistorySidebarOpen,
        documentToDelete,
        confirmRollbackVersion,
        isUpgradeModalOpen,
        isUpgrading,
        toasts,
        creatorEmail,
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
        setChatOpen: setIsChatOpen,
        setHistoryOpen: setIsHistoryOpen,
        setExportOpen: setIsExportOpen,
        setHistorySidebarOpen: setIsHistorySidebarOpen,
        setUpgradeModalOpen: setIsUpgradeModalOpen,
        theme,
        toggleTheme
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
