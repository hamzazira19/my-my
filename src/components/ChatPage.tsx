import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Send, Coins, Gift, Radio, Search,
  ShieldCheck, ArrowLeft, MoreVertical, Sparkles,
  Phone, Video, CheckCheck, Smile
} from 'lucide-react';
import { UserProfile, LiveStreamItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface MessageItem {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isGift?: boolean;
  giftName?: string;
  giftCoins?: number;
}

interface ChatPageProps {
  currentUser: UserProfile;
  streams: LiveStreamItem[];
  initialTargetUser?: UserProfile | null;
  onSelectStream: (stream: LiveStreamItem) => void;
  onOpenDeposit: () => void;
  onNavigateHome: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  currentUser,
  streams,
  initialTargetUser,
  onSelectStream,
  onOpenDeposit,
  onNavigateHome,
}) => {
  const currentLang = (currentUser.language || 'fr') as SupportedLanguage;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;

  // Conversations list generated from active streams/models
  const conversationUsers: UserProfile[] = streams.slice(0, 15).map((s) => ({
    id: s.streamerId,
    name: s.streamerName,
    username: s.streamerUsername,
    avatar: s.streamerAvatar,
    bio: s.title,
    coinsBalance: 0,
    diamondsBalance: 0,
    level: s.streamerLevel,
    followers: 2400,
    following: 110,
    isStreamer: true,
    country: s.country,
    countryFlag: s.countryFlag,
    countryName: s.countryName,
  }));

  const [selectedUser, setSelectedUser] = useState<UserProfile>(
    initialTargetUser || conversationUsers[0] || currentUser
  );

  const [searchFilter, setSearchFilter] = useState('');
  const [inputText, setInputText] = useState('');
  const [messagesByUserId, setMessagesByUserId] = useState<Record<string, MessageItem[]>>({
    [selectedUser.id]: [
      {
        id: 'msg_1',
        senderId: selectedUser.id,
        text: 'Coucou ! Merci de me suivre ❤️ Tu as vu mon dernier live ?',
        timestamp: '14:20',
      },
      {
        id: 'msg_2',
        senderId: currentUser.id,
        text: 'Salut ! Oui c’était top, hâte du prochain stream !',
        timestamp: '14:22',
      },
      {
        id: 'msg_3',
        senderId: selectedUser.id,
        text: 'Trop gentil ! Passe sur mon live ce soir, je prépare une surprise 🎁',
        timestamp: '14:25',
      },
    ],
  });

  const [tipSuccessMessage, setTipSuccessMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByUserId, selectedUser.id]);

  const activeMessages = messagesByUserId[selectedUser.id] || [
    {
      id: 'default_1',
      senderId: selectedUser.id,
      text: `Bonjour ! Bienvenue sur mon chat privé. Écrivez-moi ou rejoignez mon live !`,
      timestamp: '12:00',
    },
  ];

  // Check if selected user is currently live
  const activeStream = streams.find((s) => s.streamerId === selectedUser.id && s.isLive);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.id,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesByUserId((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMsg],
    }));
    setInputText('');

    // Simulated auto-reply from model
    setTimeout(() => {
      const replies = [
        'Merci pour ton message ! ❤️',
        'Haha trop sympa ! Tu seras là sur le live ? 🔥',
        'Gros bisous et merci pour ton soutien 🥰',
        'Je lis tous vos messages entre deux sessions live ✨',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: MessageItem = {
        id: 'msg_' + (Date.now() + 1),
        senderId: selectedUser.id,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessagesByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), replyMsg],
      }));
    }, 1200);
  };

  const handleSendTip = (coinsAmount: number) => {
    if (currentUser.coinsBalance < coinsAmount) {
      onOpenDeposit();
      return;
    }

    // Deduct coins locally
    currentUser.coinsBalance -= coinsAmount;

    const tipMsg: MessageItem = {
      id: 'tip_' + Date.now(),
      senderId: currentUser.id,
      text: `A envoyé un pourboire de ${coinsAmount} Coins ! 🪙✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGift: true,
      giftName: 'Pourboire Coins',
      giftCoins: coinsAmount,
    };

    setMessagesByUserId((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), tipMsg],
    }));

    setTipSuccessMessage(`Pourboire de ${coinsAmount} Coins envoyé avec succès !`);
    setTimeout(() => setTipSuccessMessage(null), 3000);
  };

  const filteredConversations = conversationUsers.filter((u) =>
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0b0e14] text-slate-200 flex flex-col overflow-hidden">
      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden border-x border-slate-800/80">

        {/* LEFT PANEL: CONVERSATIONS LIST */}
        <div className="w-full sm:w-80 md:w-96 bg-[#0f1422] border-r border-slate-800 flex flex-col shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="sm:hidden p-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <span>{t.discussions}</span>
              </h2>
            </div>

            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              {conversationUsers.length} contacts
            </span>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin">
            {filteredConversations.map((user) => {
              const isSelected = selectedUser.id === user.id;
              const isLive = streams.some((s) => s.streamerId === user.id && s.isLive);

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-900/30 border-l-4 border-cyan-400'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    {isLive ? (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-[#0f1422] animate-pulse" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0f1422]" />
                    )}
                    {user.countryFlag && (
                      <span className="absolute -bottom-1 -left-1 text-xs">
                        {user.countryFlag}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-extrabold text-white truncate flex items-center gap-1">
                        <span>{user.name}</span>
                        <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                      </h4>
                      <span className="text-[10px] text-slate-500">14:25</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.username || `@${user.id}`}
                    </p>
                    {isLive && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-red-400 font-bold mt-0.5">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        <span>En Live maintenant</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE CONVERSATION */}
        <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden">

          {/* Chat Header */}
          <div className="p-4 bg-[#111726] border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-purple-500/50"
                  referrerPolicy="no-referrer"
                />
                {activeStream && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-[#111726] animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">
                    {selectedUser.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  {selectedUser.countryFlag && (
                    <span className="text-xs">{selectedUser.countryFlag}</span>
                  )}
                </div>
                <p className="text-[11px] text-pink-400 font-bold">
                  {selectedUser.username || `@${selectedUser.id}`}
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2">
              {activeStream && (
                <button
                  onClick={() => onSelectStream(activeStream)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-red-900/40 cursor-pointer animate-pulse"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Rejoindre le Live</span>
                </button>
              )}

              {/* Tip coins shortcut */}
              <button
                onClick={() => handleSendTip(100)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-500/30 cursor-pointer transition-colors"
                title="Envoyer 100 Coins de pourboire"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>+100</span>
              </button>
            </div>
          </div>

          {/* Tip Notification */}
          {tipSuccessMessage && (
            <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold py-1.5 text-center border-b border-emerald-500/30 animate-fade-in">
              {tipSuccessMessage}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin bg-radial from-[#13192b]/40 to-transparent">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {msg.isGift ? (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 max-w-sm shadow-md">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">{msg.text}</span>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-900/30'
                          : 'bg-[#151c2e] text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-3 sm:p-4 bg-[#111726] border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendTip(500)}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 cursor-pointer transition-colors"
                title="Offrir 500 Coins"
              >
                <Coins className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.typeMessage}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />

              <button
                type="submit"
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors shadow-md shadow-purple-900/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
