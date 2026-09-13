import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, Radio, Coins, Gem, DollarSign,
  Ban, VolumeX, Volume2, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, Search, ArrowUpRight, ArrowDownLeft, Eye,
  Lock, Unlock, ShieldCheck, Flame, Sliders, Play, Trash2,
  Home, ArrowLeft, Percent, Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminOverview {
  totalUsers: number;
  totalStreams: number;
  activeViewers: number;
  totalCoinsInCirculation: number;
  totalDiamondsInCirculation: number;
  totalDepositedUSD: number;
  totalWithdrawnUSD: number;
  platformNetRevenueUSD: number;
  totalBlockedUsers: number;
  totalMutedUsers: number;
}

interface AdminUser extends UserProfile {
  role: 'admin' | 'model' | 'user';
  isBanned?: boolean;
  isMutedGlobal?: boolean;
  createdAt: string;
}

interface AdminStream {
  id: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar: string;
  streamerLevel: number;
  title: string;
  category: string;
  viewerCount: number;
  likesCount: number;
  streamThumbnail: string;
  isLive: boolean;
  totalGiftsCoins: number;
  videoType: string;
  m3u8Url?: string;
  mutedCount?: number;
  blockedCount?: number;
  startedAt: string;
}

interface AdminTx {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  cryptoCurrency: string;
  amountCrypto: number;
  amountUSD: number;
  coinsReceived?: number;
  diamondsDeducted?: number;
  paymentId: string;
  payAddress: string;
  status: 'waiting' | 'confirming' | 'finished' | 'failed';
  network: string;
  txHash?: string;
  createdAt: string;
}

interface ModerationLog {
  streamId: string;
  streamTitle: string;
  streamerName: string;
  userId: string;
  userName: string;
  type: 'muted' | 'blocked';
  timestamp: number;
}

interface AdminDashboardProps {
  currentUser: UserProfile;
  onRefreshUser: () => void;
  onSelectStream?: (stream: any) => void;
  onExitToHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRefreshUser,
  onSelectStream,
  onExitToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'streams' | 'users' | 'moderation' | 'crypto'>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [streams, setStreams] = useState<AdminStream[]>([]);
  const [transactions, setTransactions] = useState<AdminTx[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Platform Settings State (Model Revenue % & Platform Commission)
  const [platformSettings, setPlatformSettings] = useState<{
    modelRevenuePercentage: number;
    minWithdrawDiamonds: number;
    withdrawalFeePercentage: number;
    platformCommissionPercentage: number;
  }>({
    modelRevenuePercentage: 80,
    minWithdrawDiamonds: 1000,
    withdrawalFeePercentage: 3,
    platformCommissionPercentage: 20,
  });
  const [tempModelPercentage, setTempModelPercentage] = useState<number>(80);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Balance edit modal state
  const [balanceEditUser, setBalanceEditUser] = useState<AdminUser | null>(null);
  const [coinsChange, setCoinsChange] = useState<number>(1000);
  const [diamondsChange, setDiamondsChange] = useState<number>(5000);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, usrRes, strRes, txRes, modRes, setRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/users'),
        fetch('/api/admin/streams'),
        fetch('/api/crypto/transactions'),
        fetch('/api/admin/moderation'),
        fetch('/api/platform/settings'),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (usrRes.ok) setUsers(await usrRes.json());
      if (strRes.ok) setStreams(await strRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (modRes.ok) setModerationLogs(await modRes.json());
      if (setRes.ok) {
        const sData = await setRes.json();
        setPlatformSettings(sData);
        setTempModelPercentage(sData.modelRevenuePercentage);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModelPercentage = async (newPct?: number) => {
    const pct = typeof newPct === 'number' ? newPct : tempModelPercentage;
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelRevenuePercentage: pct }),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setPlatformSettings(data.settings);
        setTempModelPercentage(data.settings.modelRevenuePercentage);
        showNotification(data.message || `Taux modèle mis à jour : ${pct}% !`);
        // Refresh overview for platform commission update
        const ovRes = await fetch('/api/admin/overview');
        if (ovRes.ok) setOverview(await ovRes.json());
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Terminate Live Stream (Kill Switch)
  const handleKillStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to forcibly terminate this live stream?')) return;
    try {
      const res = await fetch(`/api/admin/streams/${streamId}/kill`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'Stream terminated.');
        loadAllData();
      }
    } catch (err) {
      console.error('Failed to kill stream:', err);
    }
  };

  // Ban or Unban User
  const handleToggleBan = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
        onRefreshUser();
      }
    } catch (err) {
      console.error('Failed to toggle ban:', err);
    }
  };

  // Global Mute or Unmute User
  const handleToggleGlobalMute = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/mute`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
        onRefreshUser();
      }
    } catch (err) {
      console.error('Failed to toggle mute:', err);
    }
  };

  // Toggle Role (Admin / Model / User)
  const handleToggleRole = async (userId: string, newRole: 'admin' | 'model' | 'user') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, isStreamer: newRole === 'model' || newRole === 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`User role updated to ${newRole.toUpperCase()}`);
        loadAllData();
        onRefreshUser();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  // Save Balance Adjustment
  const handleSaveBalance = async () => {
    if (!balanceEditUser) return;
    try {
      const res = await fetch(`/api/admin/users/${balanceEditUser.id}/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinsChange, diamondsChange }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Balance adjusted for ${balanceEditUser.name}`);
        setBalanceEditUser(null);
        loadAllData();
        onRefreshUser();
      }
    } catch (err) {
      console.error('Failed to adjust balance:', err);
    }
  };

  // Crypto Transaction Action (Approve / Reject)
  const handleTxAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Transaction ${action === 'approve' ? 'approved & marked completed' : 'rejected and refunded'}`);
        loadAllData();
        onRefreshUser();
      }
    } catch (err) {
      console.error('Failed tx action:', err);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950/40 via-purple-950/40 to-slate-900/90 border border-red-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-pink-600 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-red-900/40">
            <div className="w-full h-full bg-[#0b0e14] rounded-[14px] flex items-center justify-center text-red-400">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-['Outfit']">
                Admin Control & Moderation Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/40 uppercase tracking-wide">
                Full Privileges
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live broadcast controls, user ban/mute actions, crypto transaction approvals, and platform revenue.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onExitToHome) {
                onExitToHome();
              } else {
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all active:scale-95 border border-slate-700"
            title="Quitter l'administration et revenir à l'accueil"
          >
            <Home className="w-3.5 h-3.5 text-pink-400" />
            <span>Retour au site</span>
          </button>

          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Platform Overview', icon: DollarSign, badge: null },
          { id: 'settings', label: 'Taux Modèles (Coins/Diamants)', icon: Sliders, badge: `${platformSettings.modelRevenuePercentage}%` },
          { id: 'streams', label: 'Live Streams & Kill Switch', icon: Radio, badge: streams.filter(s => s.isLive).length },
          { id: 'users', label: 'User Database & Bans', icon: Users, badge: users.length },
          { id: 'moderation', label: 'Muted & Blocked Registry', icon: VolumeX, badge: moderationLogs.length },
          { id: 'crypto', label: 'Crypto Gateway & Payouts', icon: Coins, badge: transactions.filter(t => t.status === 'confirming').length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-purple-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW & FINANCIALS ================= */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0f1422] p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Total Registered</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{overview.totalUsers} Accounts</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>Models & Supporters</span>
              </div>
            </div>

            <div className="bg-[#0f1422] p-5 rounded-2xl border border-red-500/30 shadow-md">
              <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Active Broadcasts</span>
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-white">{overview.totalStreams} Live Rooms</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {overview.activeViewers.toLocaleString()} current viewers
              </div>
            </div>

            <div className="bg-[#0f1422] p-5 rounded-2xl border border-amber-500/30 shadow-md">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Crypto Deposited</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">
                ${overview.totalDepositedUSD.toLocaleString()} USD
              </div>
              <div className="text-[11px] text-amber-500/80 mt-1">
                {overview.totalCoinsInCirculation.toLocaleString()} coins in circulation
              </div>
            </div>

            <div className="bg-[#0f1422] p-5 rounded-2xl border border-emerald-500/30 shadow-md">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Platform Net Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300">
                ${overview.platformNetRevenueUSD.toLocaleString()} USD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {100 - platformSettings.modelRevenuePercentage}% commission cadeaux + {platformSettings.withdrawalFeePercentage}% retraits
              </div>
            </div>
          </div>

          {/* Model Revenue & Commission Quick Control Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-black text-xs border border-pink-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    Contrôle des Revenus Modèles
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Actuel : <strong className="text-white text-sm">{platformSettings.modelRevenuePercentage}%</strong> (Modèles) / <strong className="text-purple-300 text-sm">{100 - platformSettings.modelRevenuePercentage}%</strong> (Plateforme)
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1 font-['Outfit']">
                  Taux de conversion Coins ➔ Diamants pour les Modèles
                </h3>
                <p className="text-xs text-slate-400">
                  Définissez la part exacte des Coins reçus lors des cadeaux ou messages qui est créditée en Diamants sur le compte du modèle.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold cursor-pointer transition-all"
                >
                  Configurer en détail &rarr;
                </button>
              </div>
            </div>

            {/* Quick Slider and Live Calculator */}
            <div className="bg-[#0a0e17] p-4 rounded-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-300 font-bold">Ajuster le pourcentage :</span>
                  <span className="font-mono font-black text-pink-400 text-sm bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/40">
                    {tempModelPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={tempModelPercentage}
                  onChange={(e) => setTempModelPercentage(Number(e.target.value))}
                  className="w-full accent-pink-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                  <span>10%</span>
                  <span className="text-pink-400 font-extrabold">80% (Défaut)</span>
                  <span>100%</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[50, 60, 70, 75, 80, 85, 90, 95].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTempModelPercentage(pct)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tempModelPercentage === pct
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Result */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950/40 p-4 rounded-xl border border-purple-500/30 space-y-2">
                <div className="text-[11px] font-black uppercase text-purple-300 flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simulation en temps réel (Exemple 10 000 Coins)</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Supporter envoie :</span>
                    <span className="font-mono font-bold text-amber-300">10 000 Coins</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-300">
                    <span>Modèle reçoit ({tempModelPercentage}%) :</span>
                    <span className="font-mono">{Math.floor(10000 * (tempModelPercentage / 100)).toLocaleString()} Diamants</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Plateforme retient ({100 - tempModelPercentage}%) :</span>
                    <span className="font-mono">{Math.floor(10000 * ((100 - tempModelPercentage) / 100)).toLocaleString()} Coins</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSaveModelPercentage(tempModelPercentage)}
                    disabled={isSavingSettings}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Enregistrement...' : `Appliquer le taux (${tempModelPercentage}%)`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0e121d] p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>Creator Reserves & Cashout Pool</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Creator Diamonds:</span>
                  <span className="font-bold text-cyan-300">{overview.totalDiamondsInCirculation.toLocaleString()} Diamonds</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Diamonds USD Value:</span>
                  <span className="font-bold text-white">${(overview.totalDiamondsInCirculation / 100).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Withdrawn by Models:</span>
                  <span className="font-bold text-emerald-400">${overview.totalWithdrawnUSD.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0e121d] p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Live Moderation Enforcement Status</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Blocked from Live Rooms:</span>
                  <span className="font-bold text-red-400">{overview.totalBlockedUsers} Users Blocked</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Muted in Live Rooms:</span>
                  <span className="font-bold text-amber-400">{overview.totalMutedUsers} Users Muted</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Streaming Protocol:</span>
                  <span className="font-bold text-cyan-300 font-mono">HLS (.m3u8 + .ts) & WebRTC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MODEL REVENUE & COMMISSION SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0f1422] p-6 rounded-3xl border border-purple-500/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/40 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Gestion Économique & Monétisation
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1 font-['Outfit']">
                Taux de Redistribution Modèles & Commission Plateforme
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Contrôlez le pourcentage exact de conversion des Coins envoyés par les supporters vers le solde de Diamants des modèles (ex: 80% = un cadeau de 10 000 Coins crédite 8 000 Diamants au modèle).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-pink-400 bg-pink-950/60 px-4 py-2 rounded-2xl border border-pink-500/40 shadow-inner">
                {platformSettings.modelRevenuePercentage}% Modèles
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Percentage Adjustment Panel */}
            <div className="lg:col-span-7 bg-[#0e121d] p-6 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-pink-400" />
                  <span>Définir le pourcentage des modèles</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Glissez le curseur ou sélectionnez une valeur prédéfinie.
                </p>
              </div>

              {/* Range Slider & Manual Input */}
              <div className="space-y-3 bg-[#080b12] p-5 rounded-2xl border border-slate-850">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Taux actuel sélectionné :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={tempModelPercentage}
                      onChange={(e) => setTempModelPercentage(Math.min(100, Math.max(1, Number(e.target.value))))}
                      className="w-20 bg-slate-900 border border-pink-500/50 rounded-xl px-3 py-1.5 text-center font-mono font-black text-pink-400 text-lg outline-none"
                    />
                    <span className="font-bold text-pink-400 text-lg">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={tempModelPercentage}
                  onChange={(e) => setTempModelPercentage(Number(e.target.value))}
                  className="w-full accent-pink-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-xs text-slate-400 font-bold">
                  <span>1% (Min)</span>
                  <span className="text-pink-400 font-black">80% (Recommandé)</span>
                  <span>100% (Aucune commission)</span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Raccourcis prédéfinis :</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[50, 60, 70, 75, 80, 85, 90, 95].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTempModelPercentage(pct)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        tempModelPercentage === pct
                          ? 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-900/40 scale-105'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Part plateforme calculée : <strong className="text-purple-300 font-bold">{100 - tempModelPercentage}%</strong>
                </div>
                <button
                  onClick={() => handleSaveModelPercentage(tempModelPercentage)}
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs cursor-pointer shadow-xl shadow-purple-950/50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingSettings ? 'Enregistrement en cours...' : `Sauvegarder le taux (${tempModelPercentage}%)`}
                </button>
              </div>
            </div>

            {/* Right Column: Live Simulator & Economic Impact */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0e121d] p-6 rounded-3xl border border-purple-500/30 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
                    Simulateur de conversion en direct
                  </h3>
                </div>

                <p className="text-xs text-slate-400">
                  Voici le montant que recevra le compte du modèle pour différents montants de cadeaux envoyés avec le taux choisi de <strong>{tempModelPercentage}%</strong> :
                </p>

                <div className="space-y-2 text-xs">
                  {/* Highlighted Case: 10,000 Coins -> 8,000 Diamonds */}
                  <div className="p-3.5 rounded-2xl bg-pink-950/40 border border-pink-500/50 space-y-1.5 shadow-md">
                    <div className="flex justify-between items-center text-pink-300 font-black">
                      <span>Cadeau de 10 000 Coins (Exemple demandé)</span>
                      <span className="font-mono text-sm">10 000 🪙</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-300 font-bold">
                      <span>➔ Le modèle reçoit en Diamants ({tempModelPercentage}%) :</span>
                      <span className="font-mono text-base">{Math.floor(10000 * (tempModelPercentage / 100)).toLocaleString()} 💎</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>➔ Reste pour la plateforme ({100 - tempModelPercentage}%) :</span>
                      <span className="font-mono">{Math.floor(10000 * ((100 - tempModelPercentage) / 100)).toLocaleString()} 🪙</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Petit cadeau (500 Coins) :</span>
                      <span className="font-mono text-emerald-300 font-bold">{Math.floor(500 * (tempModelPercentage / 100)).toLocaleString()} 💎</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Cadeau moyen (5 000 Coins) :</span>
                      <span className="font-mono text-emerald-300 font-bold">{Math.floor(5000 * (tempModelPercentage / 100)).toLocaleString()} 💎</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Gros cadeau (50 000 Coins) :</span>
                      <span className="font-mono text-emerald-300 font-bold">{Math.floor(50000 * (tempModelPercentage / 100)).toLocaleString()} 💎</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Déblocage Chat direct (par défaut) :</span>
                      <span className="font-mono text-emerald-300 font-bold">{Math.floor(500 * (tempModelPercentage / 100)).toLocaleString()} 💎</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Application instantanée</span>
                  </div>
                  <p>
                    Dès la sauvegarde, tous les cadeaux en direct et déblocages de messages directs appliqueront immédiatement le nouveau ratio pour tous les modèles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVE STREAMS & KILL SWITCH ================= */}
      {activeTab === 'streams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Live Broadcasts Management</h2>
              <p className="text-xs text-slate-400">Inspect live rooms, monitor viewer counts, and exercise emergency termination switch.</p>
            </div>
            <span className="text-xs font-bold text-red-400 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
              {streams.filter(s => s.isLive).length} Rooms Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className={`p-5 rounded-2xl border transition-all ${
                  stream.isLive
                    ? 'bg-[#0f1422] border-slate-800 hover:border-slate-700'
                    : 'bg-black/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={stream.streamerAvatar}
                      alt={stream.streamerName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">{stream.streamerName}</span>
                        {stream.isLive ? (
                          <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                            LIVE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                            ENDED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-semibold line-clamp-1 mt-0.5">{stream.title}</p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                        <span className="text-purple-300 font-bold">{stream.category}</span>
                        <span>•</span>
                        <span>{stream.viewerCount} Viewers</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{stream.totalGiftsCoins.toLocaleString()} Coins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream Video Source info */}
                <div className="mt-4 p-2.5 rounded-xl bg-black/40 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono">
                      HLS .M3U8 / .TS
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {stream.m3u8Url || 'Live Camera Stream'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Muted: {stream.mutedCount || 0}</span>
                    <span>Blocked: {stream.blockedCount || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  {onSelectStream && stream.isLive && (
                    <button
                      onClick={() => onSelectStream(stream)}
                      className="flex-1 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-purple-500/40"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enter & Moderate</span>
                    </button>
                  )}

                  {stream.isLive && (
                    <button
                      onClick={() => handleKillStream(stream.id)}
                      className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-red-500/40 transition-colors"
                      title="Forcibly stop stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kill Stream</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: USER DATABASE & PERMISSIONS ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white">Platform Users & Roles</h2>
              <p className="text-xs text-slate-400">Manage user accounts, ban offenders, adjust coin/diamond balances, and set creator roles.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full bg-[#0e121d] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="bg-[#0e121d] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131929] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Coins Balance</th>
                    <th className="p-3.5">Diamonds (USD)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1">
                              {u.name}
                              {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-red-400" />}
                              {u.role === 'model' && <Gem className="w-3.5 h-3.5 text-cyan-400" />}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleToggleRole(u.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-200 outline-none"
                        >
                          <option value="user">User / Supporter</option>
                          <option value="model">Model / Creator</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <span className="font-black text-amber-300 font-mono">
                          {u.coinsBalance.toLocaleString()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-black text-cyan-300 font-mono">
                          {u.diamondsBalance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ≈ ${(u.diamondsBalance / 100).toFixed(2)} USD
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                              BANNED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                          {u.isMutedGlobal && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                              MUTED
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {/* Adjust balance */}
                        <button
                          onClick={() => setBalanceEditUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Adjust coins or diamonds"
                        >
                          Edit Balance
                        </button>

                        {/* Global Mute */}
                        <button
                          onClick={() => handleToggleGlobalMute(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            u.isMutedGlobal
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 hover:bg-amber-600/40 text-amber-300'
                          }`}
                        >
                          {u.isMutedGlobal ? 'Unmute' : 'Mute'}
                        </button>

                        {/* Global Ban */}
                        <button
                          onClick={() => handleToggleBan(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            u.isBanned
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-800 hover:bg-red-600/40 text-red-300'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MUTED & BLOCKED REGISTRY ================= */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Live Stream Moderation Registry</h2>
              <p className="text-xs text-slate-400">All users currently muted or blocked in any live room. Administrators can inspect and lift restrictions.</p>
            </div>
            <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
              {moderationLogs.length} Active Restrictions
            </span>
          </div>

          {moderationLogs.length === 0 ? (
            <div className="p-8 text-center bg-[#0e121d] rounded-2xl border border-slate-800 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-white text-sm">Clean Community State</p>
              <p className="mt-1">No users are currently muted or blocked in any live broadcast room.</p>
            </div>
          ) : (
            <div className="bg-[#0e121d] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131929] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Restriction</th>
                    <th className="p-3.5">Live Room</th>
                    <th className="p-3.5">Streamer Host</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {moderationLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-800/30">
                      <td className="p-3.5 font-bold text-white">{log.userName}</td>
                      <td className="p-3.5">
                        {log.type === 'blocked' ? (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center gap-1 w-fit">
                            <Ban className="w-3 h-3" />
                            BLOCKED (No Access)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 w-fit">
                            <VolumeX className="w-3 h-3" />
                            MUTED (Watch Only)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium line-clamp-1">{log.streamTitle}</td>
                      <td className="p-3.5 text-purple-300 font-semibold">{log.streamerName}</td>
                      <td className="p-3.5 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={async () => {
                            const endpoint = log.type === 'blocked'
                              ? `/api/streams/${log.streamId}/unblock-user`
                              : `/api/streams/${log.streamId}/unmute-user`;
                            await fetch(endpoint, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: log.userId }),
                            });
                            showNotification(`Restriction removed for ${log.userName}`);
                            loadAllData();
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: CRYPTO GATEWAY & PAYOUTS ================= */}
      {activeTab === 'crypto' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Crypto Transactions & Payouts Ledger</h2>
              <p className="text-xs text-slate-400">Direct blockchain deposits and creator withdrawal requests. Approve, verify, or reject.</p>
            </div>
            <span className="text-xs font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              {transactions.length} Total Records
            </span>
          </div>

          <div className="bg-[#0e121d] rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131929] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Amount USD</th>
                    <th className="p-3.5">Crypto & Network</th>
                    <th className="p-3.5">Destination / Invoice</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="p-3.5">
                        {tx.type === 'deposit' ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>Deposit</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Withdrawal</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-white">
                        ${tx.amountUSD.toFixed(2)} USD
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-amber-300 font-bold">
                          {tx.amountCrypto} {tx.cryptoCurrency}
                        </div>
                        <div className="text-[10px] text-slate-400">Network: {tx.network}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-slate-300 text-[11px] truncate max-w-[180px]">
                          {tx.payAddress}
                        </div>
                        <div className="text-[10px] text-slate-400">ID: {tx.paymentId}</div>
                      </td>

                      <td className="p-3.5">
                        {tx.status === 'finished' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            COMPLETED
                          </span>
                        )}
                        {tx.status === 'confirming' && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 animate-pulse">
                            PENDING PAYOUT
                          </span>
                        )}
                        {tx.status === 'waiting' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            WAITING DEPOSIT
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                            REJECTED
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-1.5">
                        {tx.status !== 'finished' && (
                          <>
                            <button
                              onClick={() => handleTxAction(tx.id, 'approve')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTxAction(tx.id, 'reject')}
                              className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {tx.status === 'finished' && (
                          <span className="text-[11px] text-emerald-400 font-bold">Verified on Chain</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= BALANCE ADJUSTMENT MODAL ================= */}
      {balanceEditUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0f1422] rounded-3xl border border-slate-700 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <span>Adjust User Balance: {balanceEditUser.name}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Add / Deduct Coins (Current: {balanceEditUser.coinsBalance})</label>
                <input
                  type="number"
                  value={coinsChange}
                  onChange={(e) => setCoinsChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  placeholder="e.g. 5000 or -1000"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Add / Deduct Diamonds (Current: {balanceEditUser.diamondsBalance})</label>
                <input
                  type="number"
                  value={diamondsChange}
                  onChange={(e) => setDiamondsChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  placeholder="e.g. 10000 or -5000"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBalanceEditUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBalance}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
