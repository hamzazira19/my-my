import React, { useState, useEffect } from 'react';
import {
  Flame,
  Radio,
  Video,
  Coins,
  Gem,
  Search,
  RefreshCw,
  ShieldAlert,
  MessageCircle,
  MapPin,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronRight,
  Check,
  Globe,
  AlertCircle,
  UserPlus,
  Users,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LiveStreamCard } from './components/LiveStreamCard';
import { LiveRoomModal } from './components/LiveRoomModal';
import { CryptoWalletModal } from './components/CryptoWalletModal';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { StartBroadcastModal } from './components/StartBroadcastModal';
import { SearchModal } from './components/SearchModal';
import { DirectChatModal } from './components/DirectChatModal';
import { ConversationsDrawer } from './components/ConversationsDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsPage, SettingsTab } from './components/SettingsPage';
import { FollowingsPage } from './components/FollowingsPage';
import { ChatPage } from './components/ChatPage';
import { ALL_TEST_MODELS, INITIAL_FOLLOWED_STREAMER_IDS } from './data/mockModels';
import { UserProfile, LiveStreamItem, SupportedLanguage } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr_google_10203',
    name: 'الزير',
    username: '@falcon_pro',
    email: 'hamza.zira010203@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Platform Creator, Model & Supporter 🚀 Welcome to my live room!',
    authProvider: 'google',
    phoneNumber: '+216 98 123 456',
    totalDepositedUSD: 320.0,
    streamHours: 48.5,
    language: 'fr',
    coinsBalance: 3200,
    diamondsBalance: 60930,
    level: 18,
    followers: 542,
    following: 532,
    fansCount: 1,
    isStreamer: true,
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    role: 'admin',
    gainsFormatted: '60,93K',
  });

  // Initialize with the 40 test models requested by user (10 followed + 30 non-followed)
  const [streams, setStreams] = useState<LiveStreamItem[]>(ALL_TEST_MODELS);
  const [selectedStream, setSelectedStream] = useState<LiveStreamItem | null>(null);
  
  // Settings Tab state ('info' | 'statistics' | 'language' | 'faq' | 'support')
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('info');

  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'admin' | 'settings' | 'followings' | 'chat'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin') return 'admin';
      if (path === '/dashboard') return 'dashboard';
      if (path === '/followings') return 'followings';
      if (path === '/chat') return 'chat';
      if (path === '/settings') return 'settings';
    }
    return 'home';
  });

  // Country filter state: array of selected country codes. Default: ['TN']
  // Enforced Rule: At least 1 country MUST ALWAYS be selected (béssif alih)!
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['TN']);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countryWarning, setCountryWarning] = useState<string | null>(null);

  // Filter only followed models who are live
  const [showOnlyFollowed, setShowOnlyFollowed] = useState(false);

  // Profile modal state (for self or any model)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

  // 10 initial followed models requested by user
  const [followingList, setFollowingList] = useState<string[]>([
    'usr_reem',
    'usr_sarah',
    'usr_silia',
    'usr_eya',
    'usr_jin',
    'usr_layla',
    'usr_amina',
    'usr_yasmin',
    'usr_kenza',
    'usr_selma',
  ]);

  // Handle URL changes & popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as SettingsTab | null;
      if (tabParam) setSettingsTab(tabParam);

      if (path === '/admin') {
        setActiveView('admin');
      } else if (path === '/dashboard') {
        setActiveView('dashboard');
      } else if (path === '/followings') {
        setActiveView('followings');
      } else if (path === '/chat') {
        setActiveView('chat');
      } else if (path === '/settings') {
        setActiveView('settings');
      } else {
        setActiveView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: 'home' | 'dashboard' | 'admin' | 'settings' | 'followings' | 'chat', tab?: SettingsTab) => {
    setActiveView(view);
    if (tab) setSettingsTab(tab);

    let targetPath = '/';
    if (view === 'admin') targetPath = '/admin';
    else if (view === 'dashboard') targetPath = '/dashboard';
    else if (view === 'followings') targetPath = '/followings';
    else if (view === 'chat') targetPath = '/chat';
    else if (view === 'settings') targetPath = `/settings${tab ? `?tab=${tab}` : ''}`;

    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Modals and Drawers
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const [directChatTarget, setDirectChatTarget] = useState<UserProfile | null>(null);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  // Fetch initial user, follows, & streams
  const fetchUserData = () => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) setCurrentUser(data);
      })
      .catch(console.error);

    fetch('/api/user/follows')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.following)) {
          setFollowingList(data.following);
        }
      })
      .catch(console.error);
  };

  const fetchStreams = () => {
    fetch('/api/streams')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge server streams with ALL_TEST_MODELS to ensure all 40 models exist
          const existingIds = new Set(data.map((s: any) => s.id));
          const merged = [...data, ...ALL_TEST_MODELS.filter((m) => !existingIds.has(m.id))];
          setStreams(merged);
        } else {
          setStreams(ALL_TEST_MODELS);
        }
      })
      .catch((err) => {
        console.error('Fetch streams error, fallback to mock:', err);
        setStreams(ALL_TEST_MODELS);
      });
  };

  const handleUpdateUser = async (updatedFields: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchStreams();
  }, []);

  const handleOpenDeposit = () => {
    setWalletInitialTab('deposit');
    setIsWalletOpen(true);
  };

  const handleOpenWithdraw = () => {
    setWalletInitialTab('withdraw');
    setIsWalletOpen(true);
  };

  // Follow / Unfollow toggle
  const handleFollowToggle = async (targetId: string) => {
    try {
      const res = await fetch(`/api/user/follow/${targetId}`, { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        setFollowingList(data.following || []);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  // Direct 1-click Go Live without barrier
  const handleDirectGoLive = async () => {
    try {
      const res = await fetch('/api/streams/quick-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${currentUser.name}'s Live Stream ✨`,
          category: 'Chat',
        }),
      });
      const newStream = await res.json();
      if (newStream && newStream.id) {
        setStreams((prev) => [newStream, ...prev.filter((s) => s.id !== newStream.id)]);
        setSelectedStream(newStream);
      } else {
        setIsGoLiveOpen(true);
      }
    } catch (err) {
      console.error('Quick live start failed:', err);
      setIsGoLiveOpen(true);
    }
  };

  const handleStreamCreated = (newStream: LiveStreamItem) => {
    setStreams((prev) => [newStream, ...prev]);
    setSelectedStream(newStream);
  };

  // Navigate directly to /chat page when user clicks direct chat (no popup)
  const handleOpenDirectChatWithUser = (user: UserProfile) => {
    setDirectChatTarget(user);
    handleNavigate('chat');
  };

  const AVAILABLE_COUNTRIES = [
    { code: 'TN', label: 'Tunisie', flag: '🇹🇳' },
    { code: 'SA', label: 'Arabie Saoudite', flag: '🇸🇦' },
    { code: 'MA', label: 'Maroc', flag: '🇲🇦' },
    { code: 'DZ', label: 'Algérie', flag: '🇩🇿' },
    { code: 'EG', label: 'Égypte', flag: '🇪🇬' },
    { code: 'AE', label: 'Dubaï (Émirats)', flag: '🇦🇪' },
    { code: 'LB', label: 'Liban', flag: '🇱🇧' },
    { code: 'FR', label: 'France', flag: '🇫🇷' },
  ];

  // Only show models currently live (isLive: true)
  const liveOnlyStreams = streams.filter((s) => s.isLive);

  // Total followed models currently in live
  const followedLiveStreams = liveOnlyStreams.filter((s) =>
    followingList.includes(s.streamerId)
  );

  // Filter by selected countries - at least 1 country is always selected (béssif)
  const countryFilteredStreams = liveOnlyStreams.filter((s) =>
    selectedCountries.includes(s.country || '')
  );

  // Filter by followed models if toggle is active (User request: "zidni bouton kif yénzél aléha yatl3olo chékoun live fi les models éli 3amlélhom follow")
  const filteredStreams = countryFilteredStreams.filter((s) => {
    if (!showOnlyFollowed) return true;
    return followingList.includes(s.streamerId);
  });

  // Total followed models currently in live
  const followedLiveStreamsCount = followedLiveStreams.length;

  const handleToggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length <= 1) {
        setCountryWarning('Au moins 1 pays doit être obligatoirement sélectionné (béssif) !');
        setTimeout(() => setCountryWarning(null), 3500);
        return;
      }
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const handleOpenProfile = (userId?: string) => {
    setSelectedProfileUserId(userId || currentUser.id);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-pink-600 selection:text-white pb-20 md:pb-6">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        onOpenDeposit={handleOpenDeposit}
        onOpenWithdraw={handleOpenWithdraw}
        onOpenDashboard={() => handleNavigate('dashboard')}
        onOpenAdminDashboard={() => handleNavigate('admin')}
        onOpenGoLive={handleDirectGoLive}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenConversations={() => handleNavigate('chat')}
        onOpenFollowing={() => handleNavigate('followings')}
        followingCount={followingList.length}
        onOpenSettingsTab={(tab) => handleNavigate('settings', tab)}
        activeView={activeView}
        setActiveView={handleNavigate}
        unreadCount={0}
      />

      {/* Main Content Area */}
      {activeView === 'home' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Automatic Following Models in Live at Top of Index (User request: "f index deja following automatique yatl3o") */}
          {followedLiveStreams.length > 0 && (
            <div className="bg-gradient-to-r from-[#190e28] via-[#101526] to-[#0e1422] p-3 sm:p-4 rounded-2xl border border-pink-500/30 shadow-xl" id="index-following-auto-bar">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 font-['Outfit']">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    <span>Vos abonnements en direct</span>
                    <span className="px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black border border-pink-500/30">
                      {followedLiveStreams.length}
                    </span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('followings')}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  id="index-see-all-following-btn"
                >
                  <span>Tous mes abonnements ({followingList.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {followedLiveStreams.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStream(s)}
                    className="group shrink-0 flex items-center gap-2.5 p-2 pr-3.5 bg-slate-900/80 hover:bg-slate-800 rounded-2xl border border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all shadow-md"
                  >
                    <div className="relative">
                      <img
                        src={s.streamerAvatar}
                        alt={s.streamerName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-red-500 group-hover:ring-pink-400 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      {s.countryFlag && (
                        <span className="absolute -bottom-1 -right-1 text-xs bg-black/80 rounded-full px-0.5">
                          {s.countryFlag}
                        </span>
                      )}
                    </div>
                    <div className="text-left min-w-0 max-w-[130px]">
                      <div className="text-xs font-bold text-white truncate group-hover:text-pink-300">
                        {s.streamerName}
                      </div>
                      <div className="text-[10px] text-pink-400 font-semibold truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>{s.viewerCount} spectateurs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Bar: Country Select (Only Flags displayed after selection, no direct select, no all-countries button) */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0f1422] p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md">
            {/* Left Controls: Country Select Dropdown (Only Flags, Strict: At least 1 country ALWAYS selected) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-[#151c2e] hover:bg-[#1a233a] text-slate-200 border border-slate-700/80 hover:border-pink-500/50 shadow-sm cursor-pointer select-none"
                  id="country-select-dropdown-btn"
                  title="Sélectionner les pays"
                >
                  <Globe className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-slate-400 font-semibold">Pays :</span>
                  <div className="flex items-center gap-1.5 text-base font-extrabold text-white">
                    {selectedCountries.map((c) => {
                      const item = AVAILABLE_COUNTRIES.find((ac) => ac.code === c);
                      return (
                        <span key={c} title={item?.label || c} className="leading-none hover:scale-110 transition-transform">
                          {item?.flag || '🌐'}
                        </span>
                      );
                    })}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Country Dropdown Menu (No 'Tous' button, only individual countries) */}
                {isCountryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-[#121829] border border-slate-700 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-xs font-bold text-white">Filtrer par pays</div>
                        <div className="text-[10px] text-pink-400 font-medium">Au moins 1 pays obligatoire (béssif)</div>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {AVAILABLE_COUNTRIES.map((item) => {
                        const isSelected = selectedCountries.includes(item.code);
                        const countryLiveCount = liveOnlyStreams.filter((s) => s.country === item.code).length;

                        return (
                          <div
                            key={item.code}
                            onClick={() => handleToggleCountry(item.code)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-pink-600/20 text-white border border-pink-500/40'
                                : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{item.flag}</span>
                              <span className="font-bold">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {countryLiveCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-950 text-red-300 border border-red-800/50 font-bold">
                                  {countryLiveCount} live
                                </span>
                              )}
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                                  isSelected
                                    ? 'bg-pink-600 border-pink-500 text-white'
                                    : 'border-slate-600 bg-slate-800'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 px-1">
                      <span className="text-[10px] text-slate-400">
                        {selectedCountries.length} pays sélectionné{selectedCountries.length > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(false)}
                        className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Followed Models Live Filter Button */}
              <button
                type="button"
                onClick={() => setShowOnlyFollowed(!showOnlyFollowed)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer select-none ${
                  showOnlyFollowed
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-lg shadow-pink-900/40 ring-2 ring-pink-500/50'
                    : 'bg-[#151c2e] text-slate-300 hover:text-white border-slate-700/80 hover:border-pink-500/50'
                }`}
                id="followed-models-live-toggle-btn"
                title="Afficher uniquement les modèles que vous suivez en direct"
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyFollowed ? 'fill-white text-white' : 'text-pink-400'}`} />
                <span>Modèles suivis en live</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  showOnlyFollowed ? 'bg-white text-pink-600' : 'bg-pink-950/70 text-pink-300 border border-pink-500/30'
                }`}>
                  {followedLiveStreamsCount}
                </span>
              </button>
            </div>

            {/* Right Controls: Live Count + Quick Search + Refresh */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/40 px-2.5 py-1.5 rounded-xl border border-red-800/40">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{filteredStreams.length} En direct</span>
              </div>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors shadow-sm cursor-pointer"
                id="quick-search-trigger-btn"
              >
                <Search className="w-3.5 h-3.5 text-pink-400" />
                <span className="hidden sm:inline">Recherche</span>
              </button>

              <button
                onClick={fetchStreams}
                className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Actualiser les lives"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inline warning notification if user attempts to remove last country */}
          {countryWarning && (
            <div className="bg-amber-500/15 border border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-amber-300 flex items-center gap-2 animate-in fade-in duration-200 shadow-md">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">{countryWarning}</span>
            </div>
          )}

          {/* Live Streams Grid - Pure Profile Photos of Live Models (Screenshots 1 & 2) */}
          <section id="live-models-grid-section">
            {filteredStreams.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#111726] border border-slate-800 text-slate-400">
                <Radio className="w-8 h-8 text-pink-500 mx-auto mb-3 animate-pulse" />
                <p className="text-base font-extrabold text-white">
                  {showOnlyFollowed
                    ? "Aucun de vos modèles suivis n'est en direct dans les pays sélectionnés."
                    : 'Aucun live trouvé pour ce filtre de pays.'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {showOnlyFollowed
                    ? 'Découvrez d’autres créatrices en direct ou sélectionnez d’autres pays pour élargir votre flux.'
                    : 'Sélectionnez d’autres pays dans la liste pour voir les modèles actuellement en direct.'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {showOnlyFollowed && (
                    <button
                      onClick={() => setShowOnlyFollowed(false)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                      Voir tous les lives
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCountries(AVAILABLE_COUNTRIES.map((c) => c.code))}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Activer tous les pays
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {filteredStreams.map((stream) => (
                  <LiveStreamCard
                    key={stream.id}
                    stream={stream}
                    onJoinStream={(s) => setSelectedStream(s)}
                    onOpenProfile={(uid) => handleOpenProfile(uid)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Unified Model & Supporter Dashboard View */}
      {activeView === 'dashboard' && (
        <main className="flex-1 w-full">
          <UnifiedDashboard
            currentUser={currentUser}
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenGoLive={handleDirectGoLive}
            streams={streams}
            onSelectStream={(stream) => setSelectedStream(stream)}
            onOpenProfile={(userId) => handleOpenProfile(userId)}
            onOpenDirectChat={(user) => handleOpenDirectChatWithUser(user)}
            onFollowToggle={handleFollowToggle}
            followingList={followingList}
          />
        </main>
      )}

      {/* Admin Dashboard View with Full Privileges (Dedicated route /admin) */}
      {activeView === 'admin' && (
        <main className="flex-1 w-full">
          <AdminDashboard
            currentUser={currentUser}
            onRefreshUser={fetchUserData}
            onSelectStream={(stream) => setSelectedStream(stream)}
            onExitToHome={() => handleNavigate('home')}
          />
        </main>
      )}

      {/* Parameter Info & Settings Page (Dedicated route /settings) */}
      {activeView === 'settings' && (
        <main className="flex-1 w-full">
          <SettingsPage
            currentUser={currentUser}
            initialTab={settingsTab}
            onUpdateUser={handleUpdateUser}
            onLanguageChange={(lang) => {
              handleUpdateUser({ language: lang });
            }}
            onNavigate={(view, tab) => handleNavigate(view, tab)}
            onOpenDeposit={handleOpenDeposit}
          />
        </main>
      )}

      {/* Followings Page - Models Followed Only (/followings) */}
      {activeView === 'followings' && (
        <main className="flex-1 w-full">
          <FollowingsPage
            followingList={followingList}
            streams={streams}
            currentUser={currentUser}
            onFollowToggle={handleFollowToggle}
            onSelectStream={(stream) => setSelectedStream(stream)}
            onOpenDirectChat={(user) => handleOpenDirectChatWithUser(user)}
            onOpenProfile={(userId) => handleOpenProfile(userId)}
            onNavigateHome={() => handleNavigate('home')}
          />
        </main>
      )}

      {/* Chat / Discussions Page (/chat) */}
      {activeView === 'chat' && (
        <main className="flex-1 w-full">
          <ChatPage
            currentUser={currentUser}
            streams={streams}
            initialTargetUser={directChatTarget}
            onSelectStream={(stream) => setSelectedStream(stream)}
            onOpenDeposit={handleOpenDeposit}
            onNavigateHome={() => handleNavigate('home')}
          />
        </main>
      )}

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Active Live Room Modal */}
      {selectedStream && (
        <LiveRoomModal
          stream={selectedStream}
          currentUser={currentUser}
          followingList={followingList}
          onFollowToggle={handleFollowToggle}
          onOpenProfile={(uid) => handleOpenProfile(uid)}
          onClose={() => setSelectedStream(null)}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onOpenDeposit={handleOpenDeposit}
        />
      )}

      {/* Dedicated Search Modal (IP Country detection, username/name search) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        streams={streams}
        currentUser={currentUser}
        onSelectStream={(stream) => setSelectedStream(stream)}
        onOpenDirectChat={(user) => handleOpenDirectChatWithUser(user)}
        onFollowToggle={handleFollowToggle}
        followingList={followingList}
      />

      {/* Direct Messaging / Discussions Drawer */}
      <ConversationsDrawer
        isOpen={isConversationsOpen}
        onClose={() => setIsConversationsOpen(false)}
        currentUser={currentUser}
        onOpenDirectChat={(user) => handleOpenDirectChatWithUser(user)}
        onSelectStream={(stream) => setSelectedStream(stream)}
        streams={streams}
      />

      {/* Direct Chat Modal (Follow-to-chat & Gift-to-unlock restrictions as in screenshots 3 & 4) */}
      <DirectChatModal
        isOpen={isDirectChatOpen}
        onClose={() => setIsDirectChatOpen(false)}
        targetUser={directChatTarget}
        currentUser={currentUser}
        onOpenDeposit={handleOpenDeposit}
        onJoinStream={(stream) => setSelectedStream(stream)}
        activeStream={
          directChatTarget
            ? streams.find((s) => s.streamerId === directChatTarget.id && s.isLive)
            : null
        }
        onFollowToggle={handleFollowToggle}
        isFollowingTarget={
          directChatTarget ? followingList.includes(directChatTarget.id) : false
        }
        onCoinBalanceUpdate={(newBalance) => {
          setCurrentUser((prev) => ({ ...prev, coinsBalance: newBalance }));
        }}
      />

      {/* Crypto Wallet Modal */}
      <CryptoWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        initialTab={walletInitialTab}
      />

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(updated) => setCurrentUser(updated)}
      />

      {/* Start Live Broadcast Modal */}
      <StartBroadcastModal
        isOpen={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        currentUser={currentUser}
        onStreamCreated={handleStreamCreated}
      />

      {/* User / Model Profile Modal (Screenshots 1 & 2 design) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={selectedProfileUserId}
        currentUser={currentUser}
        followingList={followingList}
        onFollowToggle={handleFollowToggle}
        onOpenDirectChat={(targetUser) => handleOpenDirectChatWithUser(targetUser)}
        onOpenGoLive={handleDirectGoLive}
        onJoinStream={(stream) => setSelectedStream(stream)}
        onOpenWallet={handleOpenDeposit}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c101b]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeView === 'home' ? 'text-pink-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="text-[10px]">Lives</span>
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px]">Recherche</span>
        </button>

        <button
          onClick={handleDirectGoLive}
          className="flex flex-col items-center gap-0.5 text-pink-500 font-bold cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-900/40">
            <Video className="w-4 h-4" />
          </div>
          <span className="text-[9px]">Go Live</span>
        </button>

        <button
          onClick={() => handleNavigate('chat')}
          className={`relative flex flex-col items-center gap-1 cursor-pointer ${
            activeView === 'chat' ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px]">Discussions</span>
          <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-pink-500" />
        </button>

        <button
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeView === 'dashboard' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span className="text-[10px]">Tableau</span>
        </button>
      </nav>
    </div>
  );
}
