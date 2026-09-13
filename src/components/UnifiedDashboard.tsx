import React, { useState, useEffect } from 'react';
import {
  Gem, Coins, TrendingUp, Users, ArrowDownLeft, ArrowUpRight,
  Sparkles, Award, Video, ShieldCheck, Heart, BarChart3,
  Calendar, Clock, CheckCircle2, ChevronRight, Zap, MessageCircle,
  Radio, Search, Check, ExternalLink, Globe
} from 'lucide-react';
import { UserProfile, DashboardStatsResponse, LiveStreamItem } from '../types';

interface UnifiedDashboardProps {
  currentUser: UserProfile;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenGoLive: () => void;
  streams?: LiveStreamItem[];
  onSelectStream?: (stream: LiveStreamItem) => void;
  onOpenProfile?: (userId: string) => void;
  onOpenDirectChat?: (targetUser: UserProfile) => void;
  onFollowToggle?: (streamerId: string) => void;
  followingList?: string[];
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  currentUser,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenGoLive,
  streams = [],
  onSelectStream,
  onOpenProfile,
  onOpenDirectChat,
  onFollowToggle,
  followingList = [],
}) => {
  const [statsData, setStatsData] = useState<DashboardStatsResponse | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'earnings' | 'viewers'>('earnings');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'model' | 'supporter'>('all');
  const [modelFilterTab, setModelFilterTab] = useState<'all' | 'live' | 'followed'>('all');
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStatsData(data);
      })
      .catch(console.error);
  }, [currentUser.diamondsBalance, currentUser.coinsBalance]);

  const summary = statsData?.summary || {
    diamondsBalance: currentUser.diamondsBalance,
    diamondsUSD: (currentUser.diamondsBalance / 100).toFixed(2),
    coinsBalance: currentUser.coinsBalance,
    totalEarnedUSD: '409.00',
    totalCoinsDeposited: 18500,
    totalCoinsSpent: 14200,
    streamHours: 42.5,
    totalViewers: 14850,
    totalGiftsReceived: 1080,
  };

  const dailyStats = statsData?.dailyStats || [];
  const topSupporters = statsData?.topSupporters || [];
  const giftsBreakdown = statsData?.giftsBreakdown || [];

  // Max value for bar chart scaling
  const maxEarningsUSD = Math.max(...dailyStats.map(d => d.usd), 1);
  const maxViewers = Math.max(...dailyStats.map(d => d.viewers), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Profile & Mode Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141a2e] via-[#1a1c33] to-[#121626] border border-slate-800 p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-purple-500/50 shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                  {currentUser.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                  Model & Supporter
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-3">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span className="text-pink-400 font-bold">{currentUser.followers.toLocaleString()} Followers</span>
                <span>•</span>
                <span className="text-slate-300">{currentUser.following} Following</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenGoLive}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-900/30 cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <Video className="w-4 h-4" />
              <span>Start Live Broadcast</span>
            </button>

            <button
              onClick={onOpenDeposit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-950/30 cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <Coins className="w-4 h-4 fill-black" />
              <span>+ Deposit Crypto</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw to Crypto</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Role View Toggle: All / Model / Supporter */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-white font-['Outfit']">
            Statistics & Financial Inflow
          </h2>
          <p className="text-xs text-slate-400">
            Real-time statistics updated as funds & gifts enter the account
          </p>
        </div>

        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeSubTab === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unified View
          </button>
          <button
            onClick={() => setActiveSubTab('model')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeSubTab === 'model'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Model Earnings
          </button>
          <button
            onClick={() => setActiveSubTab('supporter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeSubTab === 'supporter'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supporter (Da3ém)
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Diamonds Balance */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-cyan-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Diamonds (Model Balance)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
            {currentUser.diamondsBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Withdrawable:</span>
            <span className="font-bold text-emerald-400">${summary.diamondsUSD} USD</span>
          </div>
        </div>

        {/* Coins Wallet (Supporter) */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-amber-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Coins Wallet (Supporter)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
            {currentUser.coinsBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Crypto Deposits:</span>
            <span className="font-bold text-amber-400">+{summary.totalCoinsDeposited.toLocaleString()} Coins</span>
          </div>
        </div>

        {/* Total Earned USD */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-purple-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Lifetime Income (Model)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ${summary.totalEarnedUSD}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Gifts Received:</span>
            <span className="font-bold text-purple-300">{summary.totalGiftsReceived.toLocaleString()} gifts</span>
          </div>
        </div>

        {/* Stream Metrics */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Live Stream Reach
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-pink-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {summary.totalViewers.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">Broadcast Time:</span>
            <span className="font-bold text-slate-300">{summary.streamHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Top Supporters Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Revenue / Viewers Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111726] border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Weekly Inflow & Engagement Analytics</span>
              </h3>
              <p className="text-xs text-slate-400">
                Detailed breakdown of daily income and live audience count
              </p>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedMetric('earnings')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  selectedMetric === 'earnings'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Revenue ($USD)
              </button>
              <button
                onClick={() => setSelectedMetric('viewers')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  selectedMetric === 'viewers'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Audience (Viewers)
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas Simulation */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2 border-b border-slate-800">
            {dailyStats.map((item, index) => {
              const heightPercent = selectedMetric === 'earnings'
                ? Math.round((item.usd / maxEarningsUSD) * 85) + 15
                : Math.round((item.viewers / maxViewers) * 85) + 15;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-300 bg-black/80 px-2 py-1 rounded-md border border-slate-700 pointer-events-none mb-1 text-center whitespace-nowrap">
                    {selectedMetric === 'earnings' ? `$${item.usd} USD` : `${item.viewers} Viewers`}
                    <div className="text-[9px] text-purple-300">{item.diamonds.toLocaleString()} 💎</div>
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-slate-800 rounded-t-xl overflow-hidden relative flex items-end">
                    <div
                      className={`w-full transition-all duration-500 rounded-t-xl ${
                        selectedMetric === 'earnings'
                          ? 'bg-gradient-to-t from-purple-600 via-pink-600 to-amber-400 group-hover:brightness-125'
                          : 'bg-gradient-to-t from-cyan-600 to-blue-400 group-hover:brightness-125'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-400 mt-2">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Peak Day: Saturday ($168.00 USD / 3,100 viewers)
            </span>
            <span className="text-emerald-400 font-bold">+24.5% vs previous week</span>
          </div>
        </div>

        {/* Top Supporters / Da3ém Leaderboard */}
        <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white font-['Outfit']">Top Supporters</h3>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              VIP Ranking
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Generous gifters and supporters backing the stream
          </p>

          <div className="space-y-3 flex-1">
            {topSupporters.map((supporter, idx) => (
              <div
                key={supporter.userId}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-500 text-black' :
                    idx === 1 ? 'bg-slate-300 text-black' :
                    idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>

                  <img
                    src={supporter.userAvatar}
                    alt={supporter.userName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-500"
                    referrerPolicy="no-referrer"
                  />

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {supporter.userName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Fav Gift: {supporter.lastGiftName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-amber-300 flex items-center justify-end gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {supporter.totalCoins.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Coins Gifted</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Gifts Breakdown & Performance */}
      <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800">
        <h3 className="text-base font-black text-white font-['Outfit'] mb-1">
          Gifts Revenue Distribution
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Breakdown of virtual gifts received during live streams
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {giftsBreakdown.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="text-lg font-black text-white">{item.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.count} sent</div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-300">{item.coins.toLocaleString()} Coins</span>
                <span className="text-[10px] font-bold text-purple-400">{item.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Models Directory Section in Dashboard (User request: "zidni des model f dashboard") */}
      <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 space-y-5" id="dashboard-models-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-black text-white font-['Outfit']">
                Modèles & Créatrices de la Plateforme
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explorez, suivez et interagissez directement avec les modèles de la communauté
            </p>
          </div>

          {/* Filter tabs & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modelSearchQuery}
                onChange={(e) => setModelSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 w-44 sm:w-52"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setModelFilterTab('all')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  modelFilterTab === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({streams.length})
              </button>
              <button
                onClick={() => setModelFilterTab('live')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  modelFilterTab === 'live'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span>En Live</span>
              </button>
              <button
                onClick={() => setModelFilterTab('followed')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  modelFilterTab === 'followed'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3 h-3 text-pink-300 fill-pink-300" />
                <span>Abonnés ({followingList.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        {(() => {
          const displayedModels = streams.filter((m) => {
            if (modelFilterTab === 'live' && !m.isLive) return false;
            if (modelFilterTab === 'followed' && !followingList.includes(m.streamerId)) return false;
            if (modelSearchQuery) {
              const q = modelSearchQuery.toLowerCase();
              return (
                m.streamerName.toLowerCase().includes(q) ||
                (m.streamerUsername && m.streamerUsername.toLowerCase().includes(q)) ||
                (m.countryName && m.countryName.toLowerCase().includes(q))
              );
            }
            return true;
          });

          if (displayedModels.length === 0) {
            return (
              <div className="py-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Aucun modèle trouvé pour ce filtre</p>
                <p className="text-xs text-slate-500 mt-1">Essayez un autre filtre ou réinitialisez la recherche</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedModels.map((model) => {
                const isFollowed = followingList.includes(model.streamerId);

                return (
                  <div
                    key={model.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group relative overflow-hidden shadow-lg hover:shadow-purple-900/20"
                  >
                    {/* Live status banner */}
                    {model.isLive && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-black tracking-wider shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>LIVE</span>
                      </div>
                    )}

                    {/* Top Info */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={model.streamerAvatar}
                          alt={model.streamerName}
                          className={`w-14 h-14 rounded-2xl object-cover ring-2 ${
                            model.isLive ? 'ring-red-500 shadow-md shadow-red-900/40' : 'ring-purple-500/40'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        {model.countryFlag && (
                          <span className="absolute -bottom-1 -right-1 text-sm bg-black/80 rounded-full px-1 shadow">
                            {model.countryFlag}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-sm font-extrabold text-white truncate group-hover:text-purple-300 transition-colors">
                            {model.streamerName}
                          </h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold truncate">
                          {model.streamerUsername || `@${model.streamerId}`}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>{model.countryName || 'Global'}</span>
                          {model.isLive && (
                            <>
                              <span>•</span>
                              <span className="text-pink-400 font-bold flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                {model.viewerCount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio or title tag */}
                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                      {model.title || model.bio || 'Créatrice de contenu exclusive • Rejoignez mon stream !'}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      {model.isLive && onSelectStream ? (
                        <button
                          onClick={() => onSelectStream(model)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-900/30 transition-transform active:scale-95"
                          title="Rejoindre le live"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenProfile?.(model.streamerId)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-purple-500/40 transition-colors"
                          title="Voir le profil"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Profil</span>
                        </button>
                      )}

                      {/* Direct Chat Button */}
                      {onOpenDirectChat && (
                        <button
                          onClick={() =>
                            onOpenDirectChat({
                              id: model.streamerId,
                              name: model.streamerName,
                              avatar: model.streamerAvatar,
                              bio: model.title || 'Modèle LiveVibe',
                              coinsBalance: 0,
                              diamondsBalance: 0,
                              level: 5,
                              followers: 240,
                              following: 120,
                              fansCount: 15,
                              isStreamer: true,
                              country: model.country,
                              countryFlag: model.countryFlag,
                              countryName: model.countryName,
                            })
                          }
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                          title="Envoyer un message privé"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                      )}

                      {/* Follow toggle button */}
                      {onFollowToggle && (
                        <button
                          onClick={() => onFollowToggle(model.streamerId)}
                          className={`p-1.5 rounded-xl border cursor-pointer transition-all ${
                            isFollowed
                              ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                          }`}
                          title={isFollowed ? 'Abonné (Cliquer pour désabonner)' : 'Suivre ce modèle'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-white text-white' : 'text-pink-400'}`} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

    </div>
  );
};
