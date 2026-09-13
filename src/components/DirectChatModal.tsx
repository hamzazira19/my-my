import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Lock,
  Gift,
  Coins,
  Radio,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Plus,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { UserProfile, LiveStreamItem } from '../types';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserProfile | null;
  currentUser: UserProfile;
  onOpenDeposit: () => void;
  onJoinStream?: (stream: LiveStreamItem) => void;
  activeStream?: LiveStreamItem | null;
  onFollowToggle?: (userId: string) => void;
  isFollowingTarget: boolean;
  onCoinBalanceUpdate?: (newBalance: number) => void;
}

interface ChatMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'gift' | 'system';
  gift?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    coinsCost: number;
  };
  timestamp: number;
  isRead: boolean;
}

interface QuickGift {
  id: string;
  name: string;
  icon: string;
  coinsCost: number;
}

const DEFAULT_QUICK_GIFTS: QuickGift[] = [
  { id: 'rose', name: 'Rose', icon: '🌹', coinsCost: 99 },
  { id: 'champagne', name: 'Champagne', icon: '🍾', coinsCost: 299 },
  { id: 'heart_key', name: 'Heart Key', icon: '🗝️', coinsCost: 499 },
  { id: 'bunny', name: 'Bunny', icon: '🐰', coinsCost: 199 },
  { id: 'playboy', name: 'Playboy Bunny', icon: '🐇', coinsCost: 499 },
  { id: 'black_rose', name: 'Black Rose', icon: '🥀', coinsCost: 999 },
  { id: 'water_gun', name: 'Water Gun', icon: '🔫', coinsCost: 999 },
];

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onOpenDeposit,
  onJoinStream,
  activeStream,
  onFollowToggle,
  isFollowingTarget,
  onCoinBalanceUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [isUnlockedByGift, setIsUnlockedByGift] = useState(false);
  const [canChat, setCanChat] = useState(false);
  const [quickGifts, setQuickGifts] = useState<QuickGift[]>(DEFAULT_QUICK_GIFTS);
  const [selectedGift, setSelectedGift] = useState<QuickGift>(DEFAULT_QUICK_GIFTS[0]);
  const [giftTextMessage, setGiftTextMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history & status
  useEffect(() => {
    if (!isOpen || !targetUser) return;
    setErrorMessage(null);

    fetch(`/api/messages/${targetUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMessages(data.messages || []);
          setIsMutualFollow(!!data.isMutualFollow);
          setIsUnlockedByGift(!!data.isUnlockedByGift);
          setCanChat(!!data.canChat);
          if (data.quickGifts && data.quickGifts.length > 0) {
            setQuickGifts(data.quickGifts);
            setSelectedGift(data.quickGifts[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching direct chat:', err));

    // Mark messages as read
    fetch(`/api/messages/${targetUser.id}/read`, { method: 'POST' }).catch(() => {});
  }, [isOpen, targetUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !targetUser) return null;

  // Send normal message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;
    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/messages/${targetUser.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputMessage.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'GIFT_REQUIRED') {
          setCanChat(false);
          setErrorMessage(
            'Discussion verrouillée : Vous devez vous suivre mutuellement ou envoyer un cadeau pour débloquer le chat direct !'
          );
        } else {
          setErrorMessage(data.error || 'Erreur lors de l’envoi');
        }
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputMessage('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur réseau');
    } finally {
      setIsSending(false);
    }
  };

  // Send unlock gift
  const handleSendUnlockGift = async () => {
    if (isSending) return;

    if (currentUser.coinsBalance < selectedGift.coinsCost) {
      setErrorMessage(
        `Solde insuffisant (${currentUser.coinsBalance} coins). Rechargez des coins en crypto pour envoyer ${selectedGift.name} ${selectedGift.icon} (${selectedGift.coinsCost} coins)`
      );
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/messages/${targetUser.id}/unlock-with-gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: selectedGift.id,
          messageText: giftTextMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || data.error || 'Erreur d’envoi de cadeau');
        return;
      }

      if (data.success) {
        setIsUnlockedByGift(true);
        setCanChat(true);
        setShowGiftPicker(false);
        setGiftTextMessage('');

        if (typeof onCoinBalanceUpdate === 'function' && typeof data.coinsBalance === 'number') {
          onCoinBalanceUpdate(data.coinsBalance);
        }

        // Re-fetch messages to reflect gift and optional text message
        const refreshRes = await fetch(`/api/messages/${targetUser.id}`);
        const refreshData = await refreshRes.json();
        if (refreshData?.messages) {
          setMessages(refreshData.messages);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl h-full sm:h-[88vh] bg-[#0c101a] sm:border sm:border-slate-800 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        id="direct-chat-window"
      >
        {/* Top Header - Matches Tango/SuperLive screenshots 3 & 4 */}
        <div className="px-4 py-3 bg-[#111726] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Back button & Target User Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2 -ml-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              id="back-from-direct-chat-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500 shadow"
                referrerPolicy="no-referrer"
              />
              {activeStream && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-[#111726] rounded-full animate-ping" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white truncate leading-tight">
                  {targetUser.name}
                </h3>
                {targetUser.countryFlag && (
                  <span className="text-xs" title={targetUser.countryName}>
                    {targetUser.countryFlag}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium mt-0.5">
                {activeStream ? (
                  <button
                    onClick={() => {
                      if (onJoinStream) onJoinStream(activeStream);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold animate-pulse"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    En direct • Regarder le Live
                  </button>
                ) : (
                  <span className="text-slate-400">Vu la dernière fois il y a 6 h</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Coins Balance & Recharge + Follow */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Follow button */}
            <button
              onClick={() => onFollowToggle && onFollowToggle(targetUser.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                isFollowingTarget
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-pink-600/30 text-pink-300 border-pink-500/50 hover:bg-pink-600 hover:text-white'
              }`}
              id="chat-toggle-follow-btn"
            >
              {isFollowingTarget ? (
                <>
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Suivi</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  <span className="hidden sm:inline">Suivre</span>
                </>
              )}
            </button>

            {/* Coins Balance Chip (Matches screenshots) */}
            <button
              onClick={onOpenDeposit}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-black shadow-sm"
              title="Recharger des Coins en Crypto"
              id="direct-chat-recharge-coins-btn"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser.coinsBalance.toLocaleString()}</span>
              <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        {/* Message Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-950/80 border-b border-red-800/80 text-red-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {errorMessage.includes('Solde insuffisant') && (
              <button
                onClick={onOpenDeposit}
                className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0"
              >
                Recharger
              </button>
            )}
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090d16]">
          {/* Top Profile Card inside conversation (Matches screenshot 3 & 4) */}
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#111726]/60 rounded-3xl border border-slate-800/80 text-center max-w-sm mx-auto my-2">
            <div className="relative mb-3">
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-500/70 shadow-xl"
                referrerPolicy="no-referrer"
              />
              {activeStream && (
                <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase shadow">
                  LIVE
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-white">{targetUser.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {targetUser.countryName}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeStream ? '🔴 En direct actuellement' : 'Vu la dernière fois il y a 6 h'}
            </p>

            {/* Quick prominent Gift / Live Button */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setShowGiftPicker(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black tracking-wide shadow-lg shadow-pink-950/40 flex items-center gap-1.5"
                id="profile-card-send-gift-btn"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>ENVOYER UN CADEAU</span>
              </button>

              {activeStream && (
                <button
                  onClick={() => {
                    if (onJoinStream) onJoinStream(activeStream);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>VOIR LIVE</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages list */}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            // Gift Message Card
            if (msg.type === 'gift') {
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-2`}
                  id={`msg-gift-${msg.id}`}
                >
                  <div className="max-w-[80%] p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-pink-950/90 to-purple-950/90 border border-pink-500/50 shadow-xl shadow-pink-950/20 text-white">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl filter drop-shadow">
                        {msg.gift?.giftIcon || '🎁'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-black text-pink-300">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{msg.gift?.giftName || 'Cadeau VIP'}</span>
                        </div>
                        <p className="text-[12px] font-bold text-white mt-0.5">{msg.text}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold mt-1">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>{msg.gift?.coinsCost || 99} coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Normal Text Message Bubble
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                id={`msg-${msg.id}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-[#182033] text-slate-100 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                      isMe ? 'text-pink-200' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM SECTION: LOCKED (Screenshot 3 & 4) OR NORMAL INPUT */}
        {!canChat && !isMutualFollow && !isUnlockedByGift ? (
          /* ================= LOCKED STATE: FOLLOW-TO-CHAT OR GIFT-TO-UNLOCK ================= */
          <div
            className="p-4 bg-[#121828] border-t border-pink-500/40 shadow-2xl space-y-3"
            id="chat-locked-unlock-bar"
          >
            {/* Notice header */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-pink-950/40 border border-pink-500/30 text-pink-200">
              <div className="p-1.5 rounded-full bg-pink-500/20 text-pink-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-snug">
                  Discussion privée verrouillée
                </p>
                <p className="text-pink-300/90 mt-0.5">
                  Deux personnes ne peuvent discuter que si elles se suivent mutuellement. Si ce n'est pas le cas, envoyez un cadeau pour débloquer le chat privé !
                </p>
              </div>
            </div>

            {/* Quick Gift Selector Carousel */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Choisissez un cadeau pour débloquer :</span>
                <button
                  onClick={onOpenDeposit}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                >
                  <Coins className="w-3 h-3" />
                  <span>Recharger ({currentUser.coinsBalance} coins)</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {quickGifts.map((gift) => {
                  const isSelected = selectedGift.id === gift.id;
                  const canAfford = currentUser.coinsBalance >= gift.coinsCost;

                  return (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-center ${
                        isSelected
                          ? 'bg-pink-600/30 border-pink-500 shadow-md shadow-pink-950 scale-105'
                          : 'bg-[#182035] border-slate-700/70 hover:border-pink-500/40'
                      }`}
                      id={`unlock-gift-btn-${gift.id}`}
                    >
                      <span className="text-2xl mb-1">{gift.icon}</span>
                      <span className="text-[10px] font-bold text-white truncate max-w-full">
                        {gift.name}
                      </span>
                      <div className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 mt-0.5">
                        <Coins className="w-2.5 h-2.5" />
                        <span>{gift.coinsCost}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional message input with unlock gift */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={giftTextMessage}
                onChange={(e) => setGiftTextMessage(e.target.value)}
                placeholder={`Message avec ${selectedGift.name} (ex: Salut ${targetUser.name}! 💋)`}
                className="flex-1 px-3.5 py-2.5 bg-[#0a0e18] border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
                id="unlock-gift-text-input"
              />

              <button
                onClick={handleSendUnlockGift}
                disabled={isSending}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs tracking-tight shadow-lg shadow-pink-950/40 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                id="send-unlock-gift-submit-btn"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>
                      Débloquer ({selectedGift.coinsCost} 🪙)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= UNLOCKED NORMAL CHAT INPUT ================= */
          <div className="p-3 bg-[#111726] border-t border-slate-800 space-y-2">
            {/* Optional Gift Picker Dropup if user wants to send more gifts */}
            {showGiftPicker && (
              <div className="p-3 bg-[#172033] rounded-2xl border border-slate-700 shadow-2xl space-y-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1 text-pink-400">
                    <Gift className="w-3.5 h-3.5" /> Envoyer un cadeau dans le chat :
                  </span>
                  <button
                    onClick={() => setShowGiftPicker(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Fermer ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {quickGifts.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                        selectedGift.id === gift.id
                          ? 'bg-pink-600/30 border-pink-500'
                          : 'bg-slate-800 border-slate-700 hover:border-pink-500/50'
                      }`}
                    >
                      <span className="text-xl">{gift.icon}</span>
                      <span className="text-[10px] font-bold text-white truncate">{gift.name}</span>
                      <span className="text-[9px] text-amber-400 font-extrabold">{gift.coinsCost} 🪙</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSendUnlockGift}
                    disabled={isSending}
                    className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Envoyer {selectedGift.name} ({selectedGift.coinsCost} 🪙)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
              id="direct-chat-input-form"
            >
              <button
                type="button"
                onClick={() => setShowGiftPicker(!showGiftPicker)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-pink-600 text-pink-400 hover:text-white transition-colors"
                title="Envoyer un cadeau"
                id="toggle-chat-gift-picker-btn"
              >
                <Gift className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-2.5 bg-[#0a0e18] border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-pink-500"
                id="direct-chat-text-input"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-all shadow-md shadow-pink-950/40"
                id="direct-chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
