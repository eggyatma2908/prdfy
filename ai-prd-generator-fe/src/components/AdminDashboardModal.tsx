import { useEffect, useState } from 'react';
import { 
  X, Users, FileText, Eye, Star, MessageSquare, 
  RefreshCw, Globe, Award 
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatsData {
  totalVisits: number;
  totalPRDs: number;
  users: {
    total: number;
    free: number;
    premium: number;
    admin: number;
  };
  feedbacks: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user?: {
      name: string;
      email: string;
    };
  }>;
  recentVisitors: Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    path: string;
    referrer: string | null;
    createdAt: string;
  }>;
  avgRating: string;
}

export function AdminDashboardModal({ isOpen, onClose }: AdminDashboardModalProps) {
  const { locale, t } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visitors' | 'feedbacks'>('visitors');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.fetchAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(t('admin.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const parseUserAgent = (ua: string | null): string => {
    if (!ua) return 'Unknown';
    if (ua.includes('Edg/')) return 'Microsoft Edge';
    if (ua.includes('Chrome/')) return 'Google Chrome';
    if (ua.includes('Firefox/')) return 'Mozilla Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('PostmanRuntime/')) return 'Postman';
    if (ua.includes('curl/')) return 'curl';
    const splitStr = ua.split(' ')[0];
    return splitStr || 'Browser';
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col bg-slate-50 dark:bg-zinc-950 border border-slate-250/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 dark:bg-violet-400/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-zinc-100 font-display">
                {t('admin.dashboardTitle')}
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                {t('admin.dashboardSubtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-650 dark:text-zinc-500 dark:hover:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              title={t('admin.refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-450 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* KPIs Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="p-5 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-900 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('admin.visits')}
                </span>
                <Eye className="w-4 h-4 text-sky-500" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-display">
                  {loading ? '...' : stats?.totalVisits ?? 0}
                </span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-5 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-900 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('admin.prdDocuments')}
                </span>
                <FileText className="w-4 h-4 text-violet-500" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-display">
                  {loading ? '...' : stats?.totalPRDs ?? 0}
                </span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-5 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-900 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('admin.users')}
                </span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-display">
                  {loading ? '...' : stats?.users.total ?? 0}
                </div>
                {!loading && stats && (
                  <div className="flex flex-wrap gap-1 mt-1.5 text-[9px] font-extrabold">
                    <span className="bg-slate-100 dark:bg-zinc-800/60 px-1 py-0.5 rounded-md text-slate-650 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
                      F: {stats.users.free}
                    </span>
                    <span className="bg-amber-100/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded-md border border-amber-200/35 dark:border-amber-900/20">
                      P: {stats.users.premium}
                    </span>
                    <span className="bg-violet-100/50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 px-1 py-0.5 rounded-md border border-violet-200/35 dark:border-violet-900/20">
                      A: {stats.users.admin}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-5 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-900 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('admin.satisfaction')}
                </span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-800 dark:text-zinc-100 font-display">
                  {loading ? '...' : stats?.avgRating ?? '0.0'}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200/80 dark:border-zinc-900">
            <button
              onClick={() => setActiveTab('visitors')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'visitors'
                  ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-650 dark:hover:text-zinc-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{t('admin.recentVisitorsTab')}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'feedbacks'
                  ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-655 dark:hover:text-zinc-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>{t('admin.feedbackTab')}</span>
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="border border-slate-200/80 dark:border-zinc-900 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/10 shadow-xs">
            {activeTab === 'visitors' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-b border-slate-200/80 dark:border-zinc-850 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">{t('admin.ipAddress')}</th>
                      <th className="py-3.5 px-4">{t('admin.browser')}</th>
                      <th className="py-3.5 px-4">{t('admin.path')}</th>
                      <th className="py-3.5 px-4">{t('admin.referrer')}</th>
                      <th className="py-3.5 px-4">{t('admin.timestamp')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-slate-650 dark:text-zinc-300">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                          <span>{t('admin.loadingVisitors')}</span>
                        </td>
                      </tr>
                    ) : stats?.recentVisitors && stats.recentVisitors.length > 0 ? (
                      stats.recentVisitors.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 px-4 font-mono select-all text-slate-550 dark:text-zinc-400">{visitor.ipAddress || '127.0.0.1'}</td>
                          <td className="py-3 px-4">{parseUserAgent(visitor.userAgent)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-violet-600 dark:text-violet-400">{visitor.path}</td>
                          <td className="py-3 px-4 truncate max-w-[150px] font-mono text-[10px]" title={visitor.referrer || ''}>
                            {visitor.referrer ? (
                              <a href={visitor.referrer} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">
                                {visitor.referrer.replace(/^https?:\/\//i, '')}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-400 dark:text-zinc-500">{formatDate(visitor.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          {t('admin.noVisitors')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-b border-slate-200/80 dark:border-zinc-850 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">{t('admin.user')}</th>
                      <th className="py-3.5 px-4">{t('admin.rating')}</th>
                      <th className="py-3.5 px-4">{t('admin.commentFeedback')}</th>
                      <th className="py-3.5 px-4">{t('admin.submittedAt')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-slate-650 dark:text-zinc-300">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                          <span>{t('admin.loadingFeedback')}</span>
                        </td>
                      </tr>
                    ) : stats?.feedbacks && stats.feedbacks.length > 0 ? (
                      stats.feedbacks.map((fb) => (
                        <tr key={fb.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200">
                              {fb.user?.name || 'Anonymous'}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono select-all">
                              {fb.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-3.5 h-3.5 ${
                                    star <= fb.rating 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-slate-200 dark:text-zinc-855'
                                  }`} 
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm whitespace-pre-line text-slate-700 dark:text-zinc-300">
                            {fb.comment}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 dark:text-zinc-500">
                            {formatDate(fb.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400">
                          {t('admin.noFeedback')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white dark:bg-zinc-900/40 border-t border-slate-200/80 dark:border-zinc-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-650 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-900/80 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900"
          >
            {t('admin.close')}
          </button>
        </div>

      </div>
    </div>
  );
}
