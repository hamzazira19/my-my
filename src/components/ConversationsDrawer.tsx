import React, { useState, useEffect } from 'react';
import { X, Search, MessageSquare, Radio, Sparkles, Lock, Gift, UserCheck } from 'lucide-react';
import { UserProfile, DirectConversation, LiveStreamItem } from '../types';

interface ConversationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenDirectChat: (user: UserProfile) => void;
  onSelectStream: (stream: LiveStreamItem) => void;
  streams: LiveStreamItem[];
}

export const ConversationsDrawer: React.FC<ConversationsDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenDirectChat,
  onSelectStream,
  streams,
}) => {
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch('/api/messages/conversations')
      .then((res) => res.json())
      .then((data: DirectConversation[]) => {
        setConversations(data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load conversations:', err);
        setIsLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === 'favorites' && !c.isFavorite) return false;
    if (activeFilter === 'unread' && c.unreadCount === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.participantName.toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-[#0c101a] border-l border-slate-800 shadow-2xl flex flex-col"
        id="conversations-drawer"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#111726] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Discussions</h2>
              <p className="text-[11px] text-slate-400">
                Messages privés & cadeaux exclusifs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Tabs */}
        <div className="p-3 bg-[#0e1320] border-b border-slate-800 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full pl-9 pr-8 py-2 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                activeFilter === 'all'
                  ? 'bg-pink-600 text-white border-pink-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveFilter('favorites')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                activeFilter === 'favorites'
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
            >
              Abonnements ⭐
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                activeFilter === 'unread'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
            >
              Non lus
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-7 h-7 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Chargement des discussions...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-400 space-y-2">
              <p className="text-sm font-bold text-slate-300">Aucune conversation</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Visitez les profils ou les lives des modèles pour commencer à discuter ou envoyer un cadeau !
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const liveStream = streams.find((s) => s.streamerId === conv.participantId && s.isLive);

              // Construct user object to pass to DirectChatModal
              const targetUserObj: UserProfile = {
                id: conv.participantId,
                name: conv.participantName,
                email: `${conv.participantId}@livevibe.io`,
                avatar: conv.participantAvatar,
                bio: '',
                coinsBalance: 0,
                diamondsBalance: 0,
                level: 30,
                followers: 1200,
                following: 40,
                isStreamer: true,
                country: conv.participantCountry || 'TN',
                countryFlag: conv.participantCountryFlag || '🇹🇳',
                countryName: 'Tunisia',
                role: 'model',
                createdAt: new Date().toISOString(),
              };

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onOpenDirectChat(targetUserObj);
                    onClose();
                  }}
                  className="p-3.5 hover:bg-[#131929] cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  id={`conversation-item-${conv.participantId}`}
                >
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/70 group-hover:ring-pink-400 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      {liveStream && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow">
                          LIVE
                        </span>
                      )}
                      {conv.participantCountryFlag && (
                        <span className="absolute -bottom-1 -right-1 text-xs">
                          {conv.participantCountryFlag}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                          {conv.participantName}
                        </h4>
                        {conv.isMutualFollow ? (
                          <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                            <UserCheck className="w-3 h-3" /> Amis
                          </span>
                        ) : conv.isUnlockedByGift ? (
                          <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-0.5 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                            <Gift className="w-3 h-3" /> Débloqué
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Verrouillé
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Time, Unread, or Join Live */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {liveStream && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStream(liveStream);
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow"
                          title="Regarder en direct"
                        >
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>Live</span>
                        </button>
                      )}

                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white font-extrabold text-[10px] shadow-md shadow-pink-900/40">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
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
