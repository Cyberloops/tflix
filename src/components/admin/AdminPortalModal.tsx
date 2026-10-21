import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { EntryCode, PlanTier, Channel, CreateChannelPayload } from '../../types';
import { TFlixLogo } from '../common/TFlixLogo';
import Hls from 'hls.js';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  DollarSign, 
  Users, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Tv,
  Globe,
  Radio,
  Play,
  Film,
  DownloadCloud,
  Layers,
  Search,
  ExternalLink,
  Edit2
} from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeGenerated?: (code: string) => void;
  onChannelsChanged?: () => void;
}

const COMMON_COUNTRIES = [
  { name: 'India', code: 'IN' },
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Russia', code: 'RU' },
  { name: 'China', code: 'CN' },
  { name: 'Turkey', code: 'TR' },
  { name: 'International', code: 'INT' },
];

const COMMON_LANGUAGES = [
  'Tamil',
  'Malayalam',
  'Hindi',
  'Telugu',
  'Kannada',
  'Bengali',
  'Punjabi',
  'English',
  'Spanish',
  'Arabic',
  'French',
  'German',
  'Russian',
  'Portuguese',
  'Italian',
  'Chinese',
  'Japanese',
  'Turkish',
  'Other'
];

const COMMON_CATEGORIES = [
  'Entertainment',
  'Movies',
  'News',
  'Sports',
  'Music',
  'Kids',
  'Animation',
  'Comedy',
  'Documentary',
  'Religious',
  'Education',
  'Lifestyle',
  'Series',
  'General'
];

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  onCodeGenerated,
  onChannelsChanged,
}) => {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'manage' | 'add-stream' | 'manage-streams' | 'security'>('overview');

  // Stats & Codes State
  const [stats, setStats] = useState<any>(null);
  const [codes, setCodes] = useState<EntryCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generator Form State
  const [genCount, setGenCount] = useState<number>(1);
  const [genPlanTier, setGenPlanTier] = useState<PlanTier>('vip');
  const [genDuration, setGenDuration] = useState<string>('30');
  const [genMaxActivations, setGenMaxActivations] = useState<number>(1);
  const [genPrice, setGenPrice] = useState<number>(20);
  const [genAssignedTo, setGenAssignedTo] = useState('');
  const [genPhoneOrEmail, setGenPhoneOrEmail] = useState('');
  const [genNotes, setGenNotes] = useState('');
  const [genCustomPrefix, setGenCustomPrefix] = useState('TFLIX');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentlyGenerated, setRecentlyGenerated] = useState<any[]>([]);

  // Add Stream Channel Form State
  const [chName, setChName] = useState('');
  const [chStreamUrl, setChStreamUrl] = useState('');
  const [chAltStreams, setChAltStreams] = useState('');
  const [chCountry, setChCountry] = useState('India');
  const [chCountryCode, setChCountryCode] = useState('IN');
  const [chLanguage, setChLanguage] = useState('Tamil');
  const [chCategory, setChCategory] = useState('Entertainment');
  const [chQuality, setChQuality] = useState('1080p');
  const [chLogo, setChLogo] = useState('');
  const [chDescription, setChDescription] = useState('');
  const [chCurrentProg, setChCurrentProg] = useState('Live Prime Broadcast HD');
  const [chNextProg, setChNextProg] = useState('Upcoming Schedule');
  const [chFeatured, setChFeatured] = useState(false);
  const [chTags, setChTags] = useState('');
  const [isPublishingChannel, setIsPublishingChannel] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);
  const [publishErrorMsg, setPublishErrorMsg] = useState<string | null>(null);

  // HLS Stream Tester State
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [streamTestResult, setStreamTestResult] = useState<{ status: 'idle' | 'success' | 'failed'; message: string }>({
    status: 'idle',
    message: ''
  });
  const testVideoRef = useRef<HTMLVideoElement | null>(null);
  const testHlsRef = useRef<Hls | null>(null);

  // Manage Streams State
  const [allStreams, setAllStreams] = useState<Channel[]>([]);
  const [streamSearch, setStreamSearch] = useState('');
  const [streamCountryFilter, setStreamCountryFilter] = useState('All');
  const [streamCategoryFilter, setStreamCategoryFilter] = useState('All');
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [csvSyncStatus, setCsvSyncStatus] = useState<{ loading: boolean; msg: string | null; error: string | null }>({
    loading: false,
    msg: null,
    error: null
  });

  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadStatsAndCodes();
      loadStreamsList();
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    return () => {
      if (testHlsRef.current) {
        testHlsRef.current.destroy();
        testHlsRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const loadStatsAndCodes = async () => {
    setLoadingCodes(true);
    try {
      const [statsData, codesData] = await Promise.all([
        api.adminGetStats(),
        api.adminGetCodes()
      ]);
      setStats(statsData);
      setCodes(codesData);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoadingCodes(false);
    }
  };

  const loadStreamsList = async () => {
    setLoadingStreams(true);
    try {
      const channels = await api.getChannels();
      setAllStreams(channels);
    } catch (e) {
      console.error('Failed to load streams list', e);
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    const res = await api.adminLogin(username, password);
    setIsLoggingIn(false);

    if (res.success) {
      setIsAdminLoggedIn(true);
      loadStatsAndCodes();
    } else {
      setAuthError(res.error || 'Invalid credentials');
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const durationDays = genDuration === 'lifetime' ? null : parseInt(genDuration, 10);
    const res = await api.adminGenerateCodes({
      count: genCount,
      planTier: genPlanTier,
      durationDays: durationDays as any,
      maxActivations: genMaxActivations,
      price: genPrice,
      assignedTo: genAssignedTo,
      phoneOrEmail: genPhoneOrEmail,
      notes: genNotes,
      customPrefix: genCustomPrefix
    });

    setIsGenerating(false);

    if (res.success && res.generated) {
      setRecentlyGenerated(res.generated);
      if (res.allCodes) setCodes(res.allCodes);
      loadStatsAndCodes();
      if (onCodeGenerated && res.generated.length > 0) {
        onCodeGenerated(res.generated[0].code);
      }
    }
  };

  const handleTestStreamPlayback = () => {
    if (!chStreamUrl.trim()) {
      setStreamTestResult({ status: 'failed', message: 'Enter a valid stream URL (.m3u8, etc.) to test.' });
      return;
    }

    setIsTestingStream(true);
    setStreamTestResult({ status: 'idle', message: 'Connecting to HLS stream...' });

    if (testHlsRef.current) {
      testHlsRef.current.destroy();
      testHlsRef.current = null;
    }

    const video = testVideoRef.current;
    if (!video) {
      setIsTestingStream(false);
      return;
    }

    const cleanUrl = chStreamUrl.trim();
    if (Hls.isSupported() && (cleanUrl.includes('.m3u8') || cleanUrl.includes('/hls/'))) {
      const hls = new Hls({ enableWorker: true });
      testHlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(cleanUrl);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsTestingStream(false);
        setStreamTestResult({ status: 'success', message: 'Stream verified & playable with adaptive HLS!' });
        video.muted = true;
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setIsTestingStream(false);
          setStreamTestResult({
            status: 'failed',
            message: `Stream error: ${data.details || 'Unable to parse manifest'}. Try testing with proxy or verify URL.`
          });
        }
      });
    } else {
      video.src = cleanUrl;
      video.onloadedmetadata = () => {
        setIsTestingStream(false);
        setStreamTestResult({ status: 'success', message: 'Native media stream parsed successfully.' });
        video.muted = true;
        video.play().catch(() => {});
      };
      video.onerror = () => {
        setIsTestingStream(false);
        setStreamTestResult({ status: 'failed', message: 'Cannot play stream directly. Ensure URL is live and CORS-friendly.' });
      };
    }
  };

  const handlePublishStreamChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chName.trim() || !chStreamUrl.trim()) {
      setPublishErrorMsg('Channel name and live stream URL are required.');
      return;
    }

    setIsPublishingChannel(true);
    setPublishErrorMsg(null);
    setPublishSuccessMsg(null);

    try {
      const altList = chAltStreams
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const tagList = chTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload: CreateChannelPayload = {
        name: chName.trim(),
        streamUrl: chStreamUrl.trim(),
        alternateStreams: altList,
        country: chCountry,
        countryCode: chCountryCode.toUpperCase(),
        language: chLanguage,
        category: chCategory,
        quality: chQuality,
        logo: chLogo.trim(),
        description: chDescription.trim() || `Official ${chCountry} ${chCategory} broadcast for ${chName} on TFLIX`,
        currentProgram: chCurrentProg.trim() || 'Live Broadcast HD',
        nextProgram: chNextProg.trim() || 'Upcoming Schedule',
        featured: chFeatured,
        tags: tagList.length > 0 ? tagList : [chCountry, chLanguage, chCategory, 'TFLIX Live']
      };

      const updated = await api.addChannel(payload);
      setAllStreams(updated);
      setIsPublishingChannel(false);
      setPublishSuccessMsg(`"${chName}" successfully published to TFLIX SQLite Catalog!`);

      // Reset form
      setChName('');
      setChStreamUrl('');
      setChAltStreams('');
      setChLogo('');
      setChDescription('');
      setChTags('');
      setChFeatured(false);
      setStreamTestResult({ status: 'idle', message: '' });

      if (onChannelsChanged) {
        onChannelsChanged();
      }
      loadStatsAndCodes();
    } catch (err: any) {
      setIsPublishingChannel(false);
      setPublishErrorMsg(err.message || 'Failed to save stream channel to database');
    }
  };

  const handleDeleteStream = async (channelId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to delete "${channelName}" from TFLIX?`)) return;
    try {
      const updated = await api.deleteChannel(channelId);
      setAllStreams(updated);
      if (onChannelsChanged) onChannelsChanged();
      loadStatsAndCodes();
    } catch (e) {
      console.error('Delete channel failed', e);
    }
  };

  const handleSyncCsvCatalog = async (forceReset: boolean = false) => {
    if (!confirm(forceReset ? 'Overwrite current catalog and re-import all 18,131 channels from CSV?' : 'Sync and import all channels from the CSV file into SQLite?')) {
      return;
    }

    setCsvSyncStatus({ loading: true, msg: 'Importing 18,000+ channels from CSV into SQLite... Please wait.', error: null });
    try {
      const res = await api.adminImportCsv(forceReset);
      if (res.success && res.result) {
        setCsvSyncStatus({
          loading: false,
          msg: `Successfully imported ${res.result.imported.toLocaleString()} channels! Total catalog size: ${res.result.total.toLocaleString()} channels.`,
          error: null
        });
        loadStreamsList();
        loadStatsAndCodes();
        if (onChannelsChanged) onChannelsChanged();
      } else {
        setCsvSyncStatus({ loading: false, msg: null, error: res.error || 'Import failed.' });
      }
    } catch (e: any) {
      setCsvSyncStatus({ loading: false, msg: null, error: e.message || 'CSV sync failed' });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const updated = await api.adminUpdateCodeStatus(id, status);
    setCodes(updated);
    loadStatsAndCodes();
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this entry pass?')) return;
    const updated = await api.adminDeleteCode(id);
    setCodes(updated);
    loadStatsAndCodes();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleShareWhatsApp = (codeItem: any) => {
    const message = encodeURIComponent(
      `🎉 *Your TFLIX VIP OTT Access Pass is Ready!*\n\n` +
      `🔑 *Entry Code:* \`${codeItem.code}\`\n` +
      `📺 *Platform:* TFLIX Live OTT (cybertech by cyberloops)\n` +
      `⭐ *Tier:* ${codeItem.planTier?.toUpperCase() || 'VIP'}\n` +
      `🕒 *Expires:* ${codeItem.expiresAt ? new Date(codeItem.expiresAt).toLocaleDateString() : 'Lifetime Pass'}\n` +
      `🌐 *Catalog:* 18,000+ Global TV & Cinema Feeds\n\n` +
      `Enter your pass at login to unlock the full streaming experience. Enjoy!`
    );
    const phone = codeItem.phoneOrEmail ? codeItem.phoneOrEmail.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    const res = await api.adminChangePassword('admin', newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Admin password updated successfully in SQLite!' });
      setNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.error || 'Failed to update password' });
    }
  };

  // Filtered Codes
  const filteredCodes = codes.filter((c) => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedTo && c.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && c.status === filterStatus;
  });

  // Filtered Streams in Manage Tab
  const filteredStreams = allStreams.filter((s) => {
    if (streamCountryFilter !== 'All' && s.country !== streamCountryFilter && s.countryCode !== streamCountryFilter) {
      return false;
    }
    if (streamCategoryFilter !== 'All' && s.category !== streamCategoryFilter) {
      return false;
    }
    if (streamSearch.trim()) {
      const q = streamSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || (s.country && s.country.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0a0c13] border border-neutral-800 rounded-3xl shadow-2xl shadow-red-950/40 text-neutral-100 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0e111a] border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <TFlixLogo size="sm" showSubtitle={false} />
            <div className="h-4 w-px bg-neutral-800" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Management Hub</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In: Show Admin Login */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-700/50 flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-900/30">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-['Outfit'] text-white">Administrator Authentication</h3>
              <p className="text-xs text-neutral-400">
                Sign in to manage live streams, subscriber passes, 18K+ channels, and profit analytics.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Admin Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="cybertech@2026"
                  className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  required
                />
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-red-600/30 active:scale-98 disabled:opacity-50"
              >
                {isLoggingIn ? 'Verifying SQLite Vault...' : 'Access Admin Dashboard'}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-neutral-500">
                  Default credentials: <code className="text-red-400">admin</code> / <code className="text-red-400">cybertech@2026</code>
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* Logged In Admin Panel */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-neutral-800 bg-[#0e111a] text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Profit & Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('add-stream')}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'add-stream'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Tv className="w-4 h-4 text-red-400" />
                <span>Add Stream Channel</span>
              </button>

              <button
                onClick={() => setActiveTab('manage-streams')}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'manage-streams'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Manage Channels ({allStreams.length.toLocaleString()})</span>
              </button>

              <button
                onClick={() => setActiveTab('generate')}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'generate'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Generate Pass & Share</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'manage'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Manage Codes ({codes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3.5 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'security'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Lock className="w-4 h-4 text-neutral-400" />
                <span>Security</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: OVERVIEW & PROFIT HUB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Revenue / Profit Highlight Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#111422] border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400 text-xs">
                        <span>Total Profit Revenue</span>
                        <div className="flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded text-[10px]">
                          <button
                            onClick={() => setCurrency('USD')}
                            className={currency === 'USD' ? 'text-emerald-400 font-bold' : ''}
                          >
                            $
                          </button>
                          <span>|</span>
                          <button
                            onClick={() => setCurrency('INR')}
                            className={currency === 'INR' ? 'text-emerald-400 font-bold' : ''}
                          >
                            ₹
                          </button>
                        </div>
                      </div>
                      <div className="text-2xl font-black font-['Outfit'] text-emerald-400">
                        {currency === 'USD' ? `$${(stats?.totalRevenue || 0).toFixed(2)}` : `₹${((stats?.totalRevenue || 0) * 85).toFixed(0)}`}
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Cumulative subscriber pass receipts
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111422] border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400 text-xs">
                        <span>Total Live Channels</span>
                        <Tv className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-2xl font-black font-['Outfit'] text-white">
                        {(stats?.totalChannels || allStreams.length || 0).toLocaleString()}
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Global live feeds across 180+ countries
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111422] border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400 text-xs">
                        <span>Active Entry Passes</span>
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-black font-['Outfit'] text-white">
                        {stats?.activePassesCount || 0}
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Authorized subscriber sessions
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111422] border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400 text-xs">
                        <span>Custom Channels</span>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black font-['Outfit'] text-amber-400">
                        {stats?.customChannelsCount || allStreams.filter(c => c.isCustom).length || 0}
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Admin-added custom stream feeds
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#10131e] border border-neutral-800 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Tv className="w-4 h-4 text-red-500" />
                        <span>Add New Stream Channel</span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        Add an official live HLS/M3U8 TV stream or custom broadcast to the TFLIX directory with instant SQLite persistence.
                      </p>
                      <button
                        onClick={() => setActiveTab('add-stream')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Stream Now</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#10131e] border border-neutral-800 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>Generate & Dispatch Access Code</span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        Create custom VIP or trial access codes for requesting users and share directly via WhatsApp with 1 click.
                      </p>
                      <button
                        onClick={() => setActiveTab('generate')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Generate Access Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADD STREAM CHANNEL FEATURE (USER REQUEST) */}
              {activeTab === 'add-stream' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h4 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <Tv className="w-5 h-5 text-red-500" />
                        <span>Add New Stream Channel</span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Publish live television feeds, IPTV streams (.m3u8), and cinema channels directly to the SQLite database.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                      Persistent SQLite Storage
                    </span>
                  </div>

                  {publishSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{publishSuccessMsg}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('manage-streams')}
                        className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold"
                      >
                        View in Catalog
                      </button>
                    </div>
                  )}

                  {publishErrorMsg && (
                    <div className="p-4 rounded-2xl bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{publishErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handlePublishStreamChannel} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">
                          Channel Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={chName}
                          onChange={(e) => setChName(e.target.value)}
                          placeholder="e.g. Star Plus HD, HBO Hits Live, Sun News HD"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">
                          Live Stream URL (.m3u8, HLS, mpd) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={chStreamUrl}
                          onChange={(e) => {
                            setChStreamUrl(e.target.value);
                            setStreamTestResult({ status: 'idle', message: '' });
                          }}
                          placeholder="https://example.com/live/playlist.m3u8"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Taxonomy: Country, Language, Category, Quality */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Country */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Country</label>
                        <select
                          value={chCountry}
                          onChange={(e) => {
                            const found = COMMON_COUNTRIES.find(c => c.name === e.target.value);
                            setChCountry(e.target.value);
                            if (found) setChCountryCode(found.code);
                          }}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          {COMMON_COUNTRIES.map(c => (
                            <option key={c.name} value={c.name}>{c.name} ({c.code})</option>
                          ))}
                        </select>
                      </div>

                      {/* Language */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Language</label>
                        <select
                          value={chLanguage}
                          onChange={(e) => setChLanguage(e.target.value)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          {COMMON_LANGUAGES.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Category</label>
                        <select
                          value={chCategory}
                          onChange={(e) => setChCategory(e.target.value)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          {COMMON_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quality */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Stream Quality</label>
                        <select
                          value={chQuality}
                          onChange={(e) => setChQuality(e.target.value)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="1080p">1080p Full HD</option>
                          <option value="720p">720p HD</option>
                          <option value="4K UHD">4K Ultra HD</option>
                          <option value="576p">576p SD</option>
                          <option value="Auto">Auto Adaptive</option>
                        </select>
                      </div>
                    </div>

                    {/* Logo & Current Program */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">
                          Channel Logo URL <span className="text-neutral-500">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={chLogo}
                          onChange={(e) => setChLogo(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">
                          Current Live Program / EPG Slogan
                        </label>
                        <input
                          type="text"
                          value={chCurrentProg}
                          onChange={(e) => setChCurrentProg(e.target.value)}
                          placeholder="e.g. Prime Time Live Cinema HD"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Alternate Streams & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">
                          Backup Alternate Stream URLs <span className="text-neutral-500">(1 per line)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={chAltStreams}
                          onChange={(e) => setChAltStreams(e.target.value)}
                          placeholder="https://backup-stream-1.m3u8&#10;https://backup-stream-2.m3u8"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">
                          Tags <span className="text-neutral-500">(comma-separated)</span>
                        </label>
                        <input
                          type="text"
                          value={chTags}
                          onChange={(e) => setChTags(e.target.value)}
                          placeholder="Cinema, 24/7, Kollywood, High Bitrate"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#121520] border border-neutral-800">
                      <input
                        type="checkbox"
                        id="chFeatured"
                        checked={chFeatured}
                        onChange={(e) => setChFeatured(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                      <label htmlFor="chFeatured" className="text-xs text-neutral-200 cursor-pointer">
                        <span className="font-bold text-white">VIP Featured Stream</span> — Pin to Top 10 Trending Carousel and Home Hero
                      </label>
                    </div>

                    {/* HLS Video Tester & Diagnostics */}
                    <div className="p-4 rounded-2xl bg-[#0f121d] border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-red-500" />
                          <span>Stream Connectivity & Health Tester</span>
                        </span>

                        <button
                          type="button"
                          onClick={handleTestStreamPlayback}
                          disabled={isTestingStream}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 text-red-500" />
                          <span>{isTestingStream ? 'Testing Signal...' : 'Test Playback'}</span>
                        </button>
                      </div>

                      {streamTestResult.message && (
                        <div
                          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                            streamTestResult.status === 'success'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : streamTestResult.status === 'failed'
                              ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                              : 'bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          {streamTestResult.status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                          {streamTestResult.status === 'failed' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                          <span>{streamTestResult.message}</span>
                        </div>
                      )}

                      {/* Hidden or active test video */}
                      <div className={`aspect-video w-full max-w-xs mx-auto rounded-xl bg-black border border-neutral-800 overflow-hidden ${streamTestResult.status === 'success' ? 'block' : 'hidden'}`}>
                        <video ref={testVideoRef} controls className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* Publish Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isPublishingChannel}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Tv className="w-4 h-4" />
                        <span>{isPublishingChannel ? 'Saving to SQLite...' : 'Publish Stream Channel to TFLIX'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: MANAGE CHANNELS & CSV RE-IMPORT (USER REQUEST) */}
              {activeTab === 'manage-streams' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div>
                      <h4 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-400" />
                        <span>Live Stream Channels Directory</span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Total {allStreams.length.toLocaleString()} global channels in SQLite catalog across 180+ countries.
                      </p>
                    </div>

                    {/* CSV Sync Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncCsvCatalog(false)}
                        disabled={csvSyncStatus.loading}
                        className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Sync all channels from public/assets/aistudio/iptv_all_channels_50635ccd.csv"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>{csvSyncStatus.loading ? 'Syncing CSV...' : 'Sync CSV Catalog (18K+)'}</span>
                      </button>

                      <button
                        onClick={loadStreamsList}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                        title="Reload"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {csvSyncStatus.msg && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{csvSyncStatus.msg}</span>
                    </div>
                  )}

                  {csvSyncStatus.error && (
                    <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800 text-xs text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{csvSyncStatus.error}</span>
                    </div>
                  )}

                  {/* Filter Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={streamSearch}
                        onChange={(e) => setStreamSearch(e.target.value)}
                        placeholder="Search channels..."
                        className="w-full bg-[#121520] border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <select
                      value={streamCountryFilter}
                      onChange={(e) => setStreamCountryFilter(e.target.value)}
                      className="bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="All">All Countries (180+)</option>
                      {COMMON_COUNTRIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>

                    <select
                      value={streamCategoryFilter}
                      onChange={(e) => setStreamCategoryFilter(e.target.value)}
                      className="bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="All">All Categories</option>
                      {COMMON_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Streams Table */}
                  <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-[#0d0f17]">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#121624] text-neutral-400 text-[11px] uppercase tracking-wider sticky top-0 border-b border-neutral-800 z-10">
                          <tr>
                            <th className="px-4 py-3">Channel Name</th>
                            <th className="px-3 py-3">Country</th>
                            <th className="px-3 py-3">Category</th>
                            <th className="px-3 py-3">Quality</th>
                            <th className="px-3 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                          {filteredStreams.slice(0, 100).map((stream) => (
                            <tr key={stream.id} className="hover:bg-[#141829] transition-colors">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  {stream.featured && (
                                    <span className="w-2 h-2 rounded-full bg-red-500" title="Featured" />
                                  )}
                                  <div>
                                    <div className="font-bold text-white line-clamp-1">{stream.name}</div>
                                    <div className="text-[10px] text-neutral-500 truncate max-w-xs font-mono">{stream.streamUrl}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-neutral-400">
                                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-medium">
                                  {stream.country || 'International'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap text-neutral-400">
                                {stream.category}
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="text-[10px] font-mono uppercase text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                                  {stream.quality || 'HD'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <a
                                    href={`/watch/${stream.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                                    title="Open Watch Player"
                                  >
                                    <Play className="w-3.5 h-3.5 text-red-500" />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteStream(stream.id, stream.name)}
                                    className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white"
                                    title="Delete Stream"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-[#101422] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Showing {Math.min(100, filteredStreams.length)} of {filteredStreams.length.toLocaleString()} filtered streams</span>
                      <span className="text-neutral-500">Total in SQLite: {allStreams.length.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GENERATE UNIQUE PASS CODES */}
              {activeTab === 'generate' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-bold text-white font-['Outfit']">Generate Subscriber Access Pass</h4>
                    <p className="text-xs text-neutral-400">
                      Issue secure entry passes for requesting users with customizable duration, price, and devices.
                    </p>
                  </div>

                  <form onSubmit={handleGenerateCodes} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Plan Tier</label>
                        <select
                          value={genPlanTier}
                          onChange={(e) => setGenPlanTier(e.target.value as PlanTier)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="vip">VIP All-Access Pass</option>
                          <option value="premium">Premium OTT 4K</option>
                          <option value="trial">7-Day Free / Paid Trial</option>
                          <option value="lifetime">Lifetime Master Pass</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Duration</label>
                        <select
                          value={genDuration}
                          onChange={(e) => setGenDuration(e.target.value)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="7">7 Days</option>
                          <option value="30">30 Days (1 Month)</option>
                          <option value="90">90 Days (3 Months)</option>
                          <option value="365">365 Days (1 Year)</option>
                          <option value="lifetime">Unlimited / Lifetime</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={genCount}
                          onChange={(e) => setGenCount(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Price Charged ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={genPrice}
                          onChange={(e) => setGenPrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Recipient Name / Username</label>
                        <input
                          type="text"
                          value={genAssignedTo}
                          onChange={(e) => setGenAssignedTo(e.target.value)}
                          placeholder="e.g. John Doe, VIP User"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">WhatsApp / Phone / Email</label>
                        <input
                          type="text"
                          value={genPhoneOrEmail}
                          onChange={(e) => setGenPhoneOrEmail(e.target.value)}
                          placeholder="+1234567890"
                          className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-600/30 active:scale-98 disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating Unique Pass in SQLite...' : 'Generate Pass & Save'}
                    </button>
                  </form>

                  {/* Recently Generated Cards */}
                  {recentlyGenerated.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#0f1320] border border-neutral-800 space-y-3">
                      <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Generated Access Pass Ready to Dispatch
                      </h5>
                      <div className="space-y-2">
                        {recentlyGenerated.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-[#14192b] border border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="font-mono font-bold text-white text-sm">{item.code}</div>
                              <div className="text-[11px] text-neutral-400">
                                {item.planTier?.toUpperCase()} · {item.assignedTo || 'Subscriber'} · {item.price ? `$${item.price}` : 'Free'}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyCode(item.code)}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
                              >
                                {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedCode === item.code ? 'Copied' : 'Copy'}</span>
                              </button>

                              <button
                                onClick={() => handleShareWhatsApp(item)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-emerald-700/30"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: MANAGE ENTRY CODES */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-white font-['Outfit']">Subscriber Entry Passes ({codes.length})</h4>
                      <p className="text-xs text-neutral-400">All registered access codes stored in SQLite.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search codes..."
                        className="bg-[#121520] border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-[#121520] border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="used">Used</option>
                        <option value="expired">Expired</option>
                        <option value="revoked">Revoked</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-[#0d0f17]">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#121624] text-neutral-400 text-[11px] uppercase tracking-wider sticky top-0 border-b border-neutral-800">
                          <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-3 py-3">Plan</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Recipient</th>
                            <th className="px-3 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                          {filteredCodes.map((c) => (
                            <tr key={c.id} className="hover:bg-[#141829] transition-colors">
                              <td className="px-4 py-3 font-mono font-bold text-white">
                                <div className="flex items-center gap-2">
                                  <span>{c.code}</span>
                                  <button onClick={() => handleCopyCode(c.code)}>
                                    <Copy className="w-3 h-3 text-neutral-500 hover:text-white" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-3 uppercase text-[11px] text-amber-400 font-semibold">{c.planTier}</td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  c.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                  c.status === 'used' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                                  c.status === 'revoked' ? 'bg-red-950 text-red-400 border border-red-800' :
                                  'bg-neutral-800 text-neutral-400'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-neutral-400">{c.assignedTo || '—'}</td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleShareWhatsApp(c)}
                                    className="p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                                    title="Share on WhatsApp"
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </button>
                                  {c.status === 'active' ? (
                                    <button
                                      onClick={() => handleUpdateStatus(c.id, 'revoked')}
                                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-[10px]"
                                    >
                                      Revoke
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateStatus(c.id, 'active')}
                                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-emerald-950 hover:text-emerald-400 text-[10px]"
                                    >
                                      Activate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCode(c.id)}
                                    className="p-1 rounded bg-neutral-800 hover:bg-red-900 text-neutral-400 hover:text-white"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto space-y-5">
                  <div>
                    <h4 className="text-base font-bold text-white font-['Outfit']">Admin Security Credentials</h4>
                    <p className="text-xs text-neutral-400">Update master administrator password stored in SQLite.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-300">New Admin Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters..."
                        className="w-full bg-[#121520] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        required
                      />
                    </div>

                    {passwordMsg && (
                      <div className={`p-3 rounded-xl text-xs ${
                        passwordMsg.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {passwordMsg.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Update Password in SQLite
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal Footer Brand */}
        <div className="px-6 py-3 bg-[#0a0c13] border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
          <span>TFLIX Platform Vault</span>
          <span className="font-mono text-neutral-400">© 2026 cybertech by cyberloops</span>
        </div>
      </div>
    </div>
  );
};
