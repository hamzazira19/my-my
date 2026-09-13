import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Radio, MessageCircle, UserPlus, UserCheck, Sparkles } from 'lucide-react';
import { UserProfile, LiveStreamItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  streams: LiveStreamItem[];
  currentUser: UserProfile;
  onSelectStream: (stream: LiveStreamItem) => void;
  onOpenDirectChat: (user: UserProfile) => void;
  onFollowToggle?: (userId: string) => void;
  followingList: string[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  streams,
  currentUser,
  onSelectStream,
  onOpenDirectChat,
  onFollowToggle,
  followingList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedCountry, setDetectedCountry] = useState({
    country: 'TN',
    countryName: 'Tunisia',
    countryFlag: '🇹🇳',
  });
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<'all' | 'detected' | string>('all');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect country via IP/timezone endpoint
  useEffect(() => {
    fetch('/api/geo/detect')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country) {
          setDetectedCountry(data);
        }
      })
      .catch((err) => console.error('Geo detect error:', err));
  }, []);

  // Fetch models / users for comprehensive search
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch('/api/streams')
      .then((res) => res.json())
      .then((liveStreams: LiveStreamItem[]) => {
        // Map streams to user list
        const models: UserProfile[] = liveStreams.map((s) => ({
          id: s.streamerId,
          name: s.streamerName,
          email: `${s.streamerId}@livevibe.io`,
          avatar: s.streamerAvatar,
          bio: s.title,
          coinsBalance: 0,
          diamondsBalance: s.totalGiftsCoins,
          level: s.streamerLevel,
          followers: s.likesCount,
          following: 12,
          isStreamer: true,
          country: s.country || 'TN',
          countryFlag: s.countryFlag || '🇹🇳',
          countryName: s.countryName || 'Tunisia',
          role: 'model',
          createdAt: s.startedAt,
        }));
        setAllUsers(models);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users for search:', err);
        setIsLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter users by 1) Country (IP-detected or selected) and 2) Username or name
  const filteredUsers = allUsers.filter((u) => {
    // Country filter
    if (selectedCountryFilter === 'detected') {
      if (u.country !== detectedCountry.country) return false;
    } else if (selectedCountryFilter !== 'all') {
      if (u.country !== selectedCountryFilter) return false;
    }

    // Name or username filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      const matchBio = (u.bio || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchBio) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0f1420] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        id="search-modal-container"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#141b2d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Recherche de Streamers
              </h2>
              <p className="text-xs text-slate-400">
                Trouvez les créatrices en direct par pays (IP) ou par pseudo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            id="close-search-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input and Country Filters */}
        <div className="p-4 sm:p-5 space-y-3 bg-[#111726] border-b border-slate-800/60">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom d'utilisateur ou pseudo..."
              className="w-full pl-10 pr-10 py-3 bg-[#0c101a] border border-slate-700/80 focus:border-pink-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              autoFocus
              id="search-input-field"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Country Selection Pill (IP-detection) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> Pays détecté par IP :
            </span>

            {/* Detected country chip */}
            <button
              onClick={() => setSelectedCountryFilter(selectedCountryFilter === 'detected' ? 'all' : 'detected')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                selectedCountryFilter === 'detected'
                  ? 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-900/40'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-pink-500/50'
              }`}
              id="detected-country-filter-btn"
            >
              <span>{detectedCountry.countryFlag}</span>
              <span>{detectedCountry.countryName} (Votre IP)</span>
            </button>

            {/* All countries option */}
            <button
              onClick={() => setSelectedCountryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCountryFilter === 'all'
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
              id="all-countries-filter-btn"
            >
              🌐 Tous les pays
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-[250px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Chargement des streamers...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm font-semibold text-slate-300">Aucun profil trouvé</p>
              <p className="text-xs text-slate-500">
                Essayez un autre nom d'utilisateur ou réinitialisez le filtre par pays
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const activeStream = streams.find((s) => s.streamerId === user.id && s.isLive);
              const isFollowing = followingList.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#131929] hover:bg-[#182035] border border-slate-800 transition-all group"
                  id={`search-user-item-${user.id}`}
                >
                  {/* Left: Avatar with photo & details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => {
                        if (activeStream) {
                          onSelectStream(activeStream);
                          onClose();
                        } else {
                          onOpenDirectChat(user);
                          onClose();
                        }
                      }}
                      className="relative cursor-pointer shrink-0"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/70 group-hover:ring-pink-400 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      {activeStream && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow-md">
                          LIVE
                        </span>
                      )}
                      {user.countryFlag && (
                        <span className="absolute -bottom-1 -right-1 text-xs" title={user.countryName}>
                          {user.countryFlag}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                          {user.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {user.bio || `@${user.id}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                        <span>{user.countryName}</span>
                        <span>•</span>
                        <span className="text-pink-400 font-bold">
                          💎 {user.diamondsBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Direct Chat action */}
                    <button
                      onClick={() => {
                        onOpenDirectChat(user);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white transition-all shadow-sm flex items-center justify-center"
                      title="Discussion privée"
                      id={`chat-user-btn-${user.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Follow Toggle */}
                    <button
                      onClick={() => onFollowToggle && onFollowToggle(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        isFollowing
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-red-950/40 hover:text-red-300 hover:border-red-800/60'
                          : 'bg-pink-600 text-white border-pink-500 hover:bg-pink-500 shadow-md shadow-pink-900/30'
                      }`}
                      id={`follow-toggle-btn-${user.id}`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Suivi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Suivre</span>
                        </>
                      )}
                    </button>

                    {/* Join Live if broadcasting */}
                    {activeStream && (
                      <button
                        onClick={() => {
                          onSelectStream(activeStream);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shadow-red-950/40"
                        id={`join-live-from-search-${user.id}`}
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span className="hidden sm:inline">Regarder</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
