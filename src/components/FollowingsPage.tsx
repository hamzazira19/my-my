import React, { useState } from 'react';
import {
  Heart, Radio, Users, MessageCircle, ExternalLink,
  Search, ShieldCheck, Compass, ArrowLeft, Globe
} from 'lucide-react';
import { LiveStreamItem, UserProfile, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FollowingsPageProps {
  followingList: string[];
  streams: LiveStreamItem[];
  currentUser: UserProfile;
  onFollowToggle: (streamerId: string) => void;
  onSelectStream: (stream: LiveStreamItem) => void;
  onOpenDirectChat: (targetUser: UserProfile) => void;
  onOpenProfile: (userId: string) => void;
  onNavigateHome: () => void;
}

export const FollowingsPage: React.FC<FollowingsPageProps> = ({
  followingList,
  streams,
  currentUser,
  onFollowToggle,
  onSelectStream,
  onOpenDirectChat,
  onOpenProfile,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');

  const currentLang = (currentUser.language || 'fr') as SupportedLanguage;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;

  // Filter streams down to followed models only
  const followedStreams = streams.filter((s) => followingList.includes(s.streamerId));

  // Available countries among followed models
  const countries = Array.from(
    new Set(followedStreams.map((s) => s.country).filter(Boolean))
  ) as string[];

  // Filtered by search & country
  const filteredFollowed = followedStreams.filter((model) => {
    if (selectedCountry !== 'ALL' && model.country !== selectedCountry) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        model.streamerName.toLowerCase().includes(q) ||
        (model.streamerUsername && model.streamerUsername.toLowerCase().includes(q)) ||
        (model.title && model.title.toLowerCase().includes(q)) ||
        (model.countryName && model.countryName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const liveFollowedCount = followedStreams.filter((s) => s.isLive).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0e14] text-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Retour à l’accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
                <Heart className="w-7 h-7 text-pink-500 fill-pink-500" />
                <span>{t.following}</span>
                <span className="text-sm px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30">
                  {followingList.length} suivis
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tous les modèles et streamers que vous suivez en exclusivité
              </p>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 rounded-2xl px-4 py-2 text-xs font-bold text-red-300 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>{liveFollowedCount} modèle{liveFollowedCount > 1 ? 's' : ''} actuellement en direct</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111726] border border-slate-800 p-3 rounded-2xl">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher parmi vos abonnements..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Country quick filters */}
          {countries.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedCountry('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedCountry === 'ALL'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Tous
              </button>
              {countries.map((cCode) => {
                const sample = followedStreams.find((s) => s.country === cCode);
                return (
                  <button
                    key={cCode}
                    onClick={() => setSelectedCountry(cCode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      selectedCountry === cCode
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{sample?.countryFlag || '🌍'}</span>
                    <span>{sample?.countryName || cCode}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredFollowed.length === 0 && (
          <div className="py-20 text-center bg-[#111726]/60 border border-slate-800/80 rounded-3xl p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white font-['Outfit']">
              {t.noFollowedModels}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t.noFollowedDesc}
            </p>
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-pink-900/30 hover:scale-105 transition-transform cursor-pointer inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>{t.exploreModels}</span>
            </button>
          </div>
        )}

        {/* Grid of Followed Models */}
        {filteredFollowed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredFollowed.map((model) => (
              <div
                key={model.id}
                className="p-5 rounded-3xl bg-[#111726] border border-slate-800 hover:border-pink-500/50 transition-all flex flex-col justify-between group relative overflow-hidden shadow-xl hover:shadow-pink-900/20"
              >
                {/* Live Badge */}
                {model.isLive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>EN DIRECT</span>
                  </div>
                )}

                {/* Top Info */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={model.streamerAvatar}
                        alt={model.streamerName}
                        className={`w-16 h-16 rounded-2xl object-cover ring-2 ${
                          model.isLive ? 'ring-red-500 shadow-md shadow-red-900/50' : 'ring-purple-500/40'
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
                        <h3 className="text-sm font-extrabold text-white truncate group-hover:text-pink-300 transition-colors">
                          {model.streamerName}
                        </h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      </div>
                      <div className="text-[11px] text-pink-400 font-bold truncate">
                        {model.streamerUsername || `@${model.streamerId}`}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
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

                  {/* Title / Bio */}
                  <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                    {model.title || 'Modèle vérifié • Recommandé par la communauté'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
                  {model.isLive ? (
                    <button
                      onClick={() => onSelectStream(model)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-900/30 transition-transform active:scale-95"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>{t.watchLive}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenProfile(model.streamerId)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t.profile}</span>
                    </button>
                  )}

                  {/* Direct Chat */}
                  <button
                    onClick={() =>
                      onOpenDirectChat({
                        id: model.streamerId,
                        name: model.streamerName,
                        avatar: model.streamerAvatar,
                        bio: model.title || 'Modèle LiveVibe',
                        coinsBalance: 0,
                        diamondsBalance: 0,
                        level: model.streamerLevel || 20,
                        followers: 1200,
                        following: 80,
                        isStreamer: true,
                        country: model.country,
                        countryFlag: model.countryFlag,
                        countryName: model.countryName,
                      })
                    }
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                    title="Envoyer un message privé"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {/* Unfollow Button */}
                  <button
                    onClick={() => onFollowToggle(model.streamerId)}
                    className="p-2 rounded-xl bg-pink-600/20 hover:bg-red-600/30 text-pink-400 hover:text-red-400 border border-pink-500/30 cursor-pointer transition-colors"
                    title="Se désabonner"
                  >
                    <Heart className="w-4 h-4 fill-pink-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
