import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Coins,
  Gem,
  LayoutDashboard,
  Radio,
  ChevronDown,
  UserCheck,
  Search,
  MessageCircle,
  Heart,
  Settings,
  BarChart3,
  Globe,
  HelpCircle,
  Headphones,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';
import { SettingsTab } from './SettingsPage';

interface NavbarProps {
  user: UserProfile;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenDashboard: () => void;
  onOpenAdminDashboard: () => void;
  onOpenGoLive: () => void;
  onOpenGoogleAuth: () => void;
  onOpenSearch: () => void;
  onOpenConversations: () => void;
  onOpenFollowing: () => void;
  followingCount?: number;
  onOpenSettingsTab: (tab: SettingsTab) => void;
  activeView: 'home' | 'dashboard' | 'admin' | 'settings' | 'followings' | 'chat';
  setActiveView: (view: 'home' | 'dashboard' | 'admin' | 'settings' | 'followings' | 'chat') => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenDashboard,
  onOpenAdminDashboard,
  onOpenGoLive,
  onOpenGoogleAuth,
  onOpenSearch,
  onOpenConversations,
  onOpenFollowing,
  followingCount = 0,
  onOpenSettingsTab,
  activeView,
  setActiveView,
  unreadCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMenu = (action: () => void) => {
    setDropdownOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c101b]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & View Switcher */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
            id="nav-brand-logo"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-pink-900/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-pink-500 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                Live<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">Vibe</span>
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              id="nav-dashboard-btn"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Tableau de bord</span>
            </button>
          </nav>
        </div>

        {/* Action Controls: Search, Discussions/Chat, Following, Go Live, Wallet, Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 flex items-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Recherche par Pays ou Nom"
            id="nav-search-button"
          >
            <Search className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Recherche</span>
          </button>

          {/* Discussions / Chat Button -> Navigates to /chat page */}
          <button
            onClick={onOpenConversations}
            className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${
              activeView === 'chat'
                ? 'bg-purple-600/30 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80'
            }`}
            title="Discussions privées (/chat)"
            id="nav-conversations-button"
          >
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Discussions</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white font-black text-[9px] flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Following Button -> Navigates to /followings page */}
          <button
            onClick={onOpenFollowing}
            className={`relative p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${
              activeView === 'followings'
                ? 'bg-pink-600/30 text-pink-300 border-pink-500/50'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80'
            }`}
            title="Modèles suivis (/followings)"
            id="nav-following-button"
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-500/30" />
            <span className="hidden sm:inline">Abonnements</span>
            {followingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-600/30 text-pink-300 border border-pink-500/40 text-[10px] font-black">
                {followingCount}
              </span>
            )}
          </button>

          {/* Go Live Button */}
          <button
            onClick={onOpenGoLive}
            id="nav-go-live-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-pink-900/40 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Video className="w-4 h-4" />
            <span>Go Live</span>
          </button>

          {/* Coins Balance & Deposit */}
          <div className="flex items-center bg-slate-900/90 border border-amber-500/30 rounded-xl p-1 sm:px-2.5 sm:py-1 shadow-sm">
            <button
              onClick={onOpenDeposit}
              className="flex items-center gap-1.5 cursor-pointer group"
              title="Coins Balance (Cliquer pour recharger en Crypto)"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-amber-300 tracking-tight">
                  {user.coinsBalance.toLocaleString()}
                </div>
              </div>
            </button>

            <button
              onClick={onOpenDeposit}
              id="nav-crypto-deposit-btn"
              className="ml-1.5 px-1.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black cursor-pointer transition-transform active:scale-95"
            >
              +
            </button>
          </div>

          {/* Diamonds Balance (For model earnings / Cashout) */}
          <button
            onClick={onOpenWithdraw}
            id="nav-crypto-withdraw-btn"
            className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl px-2.5 py-1 cursor-pointer transition-all hover:bg-slate-800/80"
            title="Diamonds Balance (Cliquer pour retirer en Crypto)"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gem className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-cyan-300">
                {user.diamondsBalance.toLocaleString()}
              </div>
            </div>
          </button>

          {/* USER PROFILE & DROPDOWN MENU */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="nav-user-menu-btn"
              className={`flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl border cursor-pointer transition-all ${
                dropdownOpen
                  ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700'
              }`}
              title="Menu du compte & Paramètres"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-purple-400/60 ring-1 ring-purple-500/30"
                referrerPolicy="no-referrer"
              />
              <div className="text-left hidden lg:block max-w-[100px] truncate">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  {user.name}
                  <UserCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                </div>
                {user.username && (
                  <div className="text-[9px] text-pink-400 font-bold truncate">
                    {user.username}
                  </div>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {/* DROPDOWN MENU ITEMS */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111726] border border-slate-800 shadow-2xl shadow-purple-950/70 py-2 z-50 animate-fade-in divide-y divide-slate-800/60">
                
                {/* Header: User Overview */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-white truncate flex items-center gap-1">
                        <span>{user.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      </div>
                      <div className="text-xs font-bold text-pink-400 truncate">
                        {user.username || '@user_account'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {user.authProvider === 'phone' ? `📱 ${user.phoneNumber || '+216...'}` : `✉️ ${user.email}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Parameter info */}
                <div className="py-1">
                  <button
                    onClick={() => handleSelectMenu(() => onOpenSettingsTab('info'))}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">Paramètres info</div>
                      <div className="text-[10px] text-slate-400 font-normal">Gmail, Téléphone, Photo, Pseudo animal</div>
                    </div>
                  </button>

                  {/* 2. Statistique & Activite */}
                  <button
                    onClick={() => handleSelectMenu(() => onOpenSettingsTab('statistics'))}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">Statistiques & Activité</div>
                      <div className="text-[10px] text-slate-400 font-normal">Dépôts, heures de live, historique</div>
                    </div>
                  </button>

                  {/* 3. Langue du site (AR, FR, EN, ES, PT) */}
                  <button
                    onClick={() => handleSelectMenu(() => onOpenSettingsTab('language'))}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">Langue du site</div>
                      <div className="text-[10px] text-slate-400 font-normal">🇸🇦 AR • 🇫🇷 FR • 🇬🇧 EN • 🇪🇸 ES • 🇵🇹 PT</div>
                    </div>
                  </button>

                  {/* 4. FAQ */}
                  <button
                    onClick={() => handleSelectMenu(() => onOpenSettingsTab('faq'))}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">Foire aux questions (FAQ)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Aide & réponses rapides</div>
                    </div>
                  </button>

                  {/* 5. Contact Support */}
                  <button
                    onClick={() => handleSelectMenu(() => onOpenSettingsTab('support'))}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">Contact Support</div>
                      <div className="text-[10px] text-slate-400 font-normal">Assistance 24/7 & Tickets</div>
                    </div>
                  </button>
                </div>

                {/* Dashboard & Logout */}
                <div className="py-1">
                  <button
                    onClick={() => handleSelectMenu(onOpenDashboard)}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    <span>Tableau de bord créateur</span>
                  </button>

                  <button
                    onClick={() => handleSelectMenu(onOpenGoogleAuth)}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

