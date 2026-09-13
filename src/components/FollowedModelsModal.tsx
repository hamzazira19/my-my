import React, { useState, useEffect } from 'react';
import {
  X, Heart, Radio, MessageCircle, UserCheck, Search,
  Users, Gem, ShieldCheck, Sparkles, ExternalLink, ArrowRight
} from 'lucide-react';
import { LiveStreamItem, UserProfile } from '../types';

interface FollowedModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  followingList: string[];
  currentUser: UserProfile;
  liveStreams: LiveStreamItem[];
  onUnfollow: (streamerId: string) => void;
  onJoinStream: (stream: LiveStreamItem) => void;
  onOpenProfile: (streamerId: string) => void;
  onOpenDirectChat: (targetUser: { id: string; name: string; avatar: string }) => void;
}

export const FollowedModelsModal: React.FC<FollowedModelsModalProps> = ({
  isOpen,
  onClose,
  followingList,
  currentUser,
  liveStreams,
  onUnfollow,
  onJoinStream,
  onOpenProfile,
  onOpenDirectChat,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'live'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allModels, setAllModels] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all platform users to resolve profiles for followed models
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((users: UserProfile[]) => {
        setAllModels(users);
      })
      .catch(() => {
        // Fallback: build from streams
        const fallback = liveStreams.map((s) => ({
          id: s.streamerId,
          name: s.streamerName,
          email: `${s.streamerId}@livevibe.io`,
          avatar: s.streamerAvatar,
          bio: s.title || 'Modèle vérifiée LiveVibe',
          coinsBalance: 0,
          diamondsBalance: 15000,
          level: s.streamerLevel,
          followers: 12000,
          following: 40,
          isStreamer: true,
          country: s.country,
          countryFlag: s.countryFlag,
          role: 'model' as const,
        }));
        setAllModels(fallback);
      })
      .finally(() => setLoading(false));
  }, [isOpen, liveStreams]);

  if (!isOpen) return null;

  // Filter models that are in followingList
  const followedModelsList = allModels.filter((m) => followingList.includes(m.id));

  // Map each followed model to see if she is currently live
  const followedModelsWithLive = followedModelsList.map((model) => {
    const liveStream = liveStreams.find((s) => s.streamerId === model.id && s.isLive);
    return {
      model,
      isLive: !!liveStream,
      liveStream,
    };
  });

  // Filter based on tab and search query
  const filteredList = followedModelsWithLive.filter(({ model, isLive, liveStream }) => {
    if (activeTab === 'live' && !isLive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = model.name.toLowerCase().includes(q);
      const matchCountry = model.countryName?.toLowerCase().includes(q) || false;
      const matchTitle = liveStream?.title.toLowerCase().includes(q) || false;
      return matchName || matchCountry || matchTitle;
    }
    return true;
  });

  const totalFollowedCount = followedModelsList.length;
  const liveFollowedCount = followedModelsWithLive.filter((item) => item.isLive).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0e1424] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-800 flex items-center justify-between bg-[#11182c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-900/40">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
                <span>Mes Abonnements</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black border border-pink-500/30">
                  {totalFollowedCount}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Toutes les créatrices et modèles que vous suivez
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-red-600/80 hover:text-white text-slate-400 flex items-center justify-center transition-colors cursor-pointer border border-slate-700/60"
            id="followed-models-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-5 sm:px-7 py-3 border-b border-slate-800/80 bg-[#12192e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes ({totalFollowedCount})
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>En direct maintenant ({liveFollowedCount})</span>
            </button>
          </div>

          {/* Search in followed */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une modèle..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Chargement de vos abonnements...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Heart className="w-7 h-7 text-pink-500/50" />
              </div>
              <h3 className="text-base font-bold text-white">
                {activeTab === 'live'
                  ? 'Aucune de vos modèles suivies n’est en direct en ce moment.'
                  : searchQuery
                  ? 'Aucun modèle correspondant à votre recherche.'
                  : 'Vous ne suivez encore aucun modèle.'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Suivez des modèles depuis la page d’accueil ou le live en cliquant sur "+ Suivre" pour les retrouver rapidement ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredList.map(({ model, isLive, liveStream }) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLive
                      ? 'bg-gradient-to-br from-[#1c132c] via-[#141829] to-[#121524] border-pink-500/50 shadow-lg shadow-pink-950/20'
                      : 'bg-[#121727] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar with Live Indicator */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenProfile(model.id);
                          onClose();
                        }}
                        className="cursor-pointer group"
                      >
                        <img
                          src={model.avatar}
                          alt={model.name}
                          className={`w-14 h-14 rounded-2xl object-cover ring-2 transition-all ${
                            isLive
                              ? 'ring-red-500 group-hover:ring-pink-400'
                              : 'ring-purple-500/40 group-hover:ring-purple-400'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        {model.countryFlag && (
                          <span className="absolute -bottom-1 -right-1 text-sm bg-black/60 rounded-full px-1">
                            {model.countryFlag}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenProfile(model.id);
                            onClose();
                          }}
                          className="font-bold text-sm text-white hover:text-pink-300 truncate text-left cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="truncate">{model.name}</span>
                          {model.verified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </button>

                        {/* Live Badge */}
                        {isLive ? (
                          <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] shadow-sm animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>EN DIRECT</span>
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
                            Hors ligne
                          </span>
                        )}
                      </div>

                      {/* Bio or Live Title */}
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {isLive && liveStream?.title ? `🔴 ${liveStream.title}` : model.bio || 'Créatrice Live'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>
                          <strong className="text-pink-400 font-bold">
                            {model.followersFormatted || (model.followers ? model.followers.toLocaleString() : '12K')}
                          </strong>{' '}
                          Abonnés
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-300">
                          <Gem className="w-3 h-3 text-cyan-400" />
                          {model.gainsFormatted || (model.diamondsBalance ? (model.diamondsBalance / 1000).toFixed(0) + 'K' : '45K')}
                        </span>
                        {isLive && liveStream && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-cyan-300 font-bold">
                              <Users className="w-3 h-3" />
                              {liveStream.viewerCount} spectateurs
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isLive && liveStream && (
                        <button
                          type="button"
                          onClick={() => {
                            onJoinStream(liveStream);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Rejoindre</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onOpenDirectChat({
                            id: model.id,
                            name: model.name,
                            avatar: model.avatar,
                          });
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Envoyer un message direct"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenProfile(model.id);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Profil
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUnfollow(model.id)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-pink-400 hover:text-red-400 hover:bg-red-500/10 border border-pink-500/30 hover:border-red-500/30 transition-all cursor-pointer"
                      title="Se désabonner de ce modèle"
                    >
                      ✓ Abonné
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-slate-800 bg-[#0c101d] flex items-center justify-between text-xs text-slate-400">
          <span>{totalFollowedCount} modèle{totalFollowedCount > 1 ? 's' : ''} suivie{totalFollowedCount > 1 ? 's' : ''}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
