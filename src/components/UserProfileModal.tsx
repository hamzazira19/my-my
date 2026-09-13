import React, { useState, useEffect } from 'react';
import {
  X, Share2, Edit3, Camera, Star, Video, Gem,
  MessageCircle, Gift, UserPlus, UserCheck, Sparkles,
  ChevronRight, MoreHorizontal, Radio, AlertCircle
} from 'lucide-react';
import { UserProfile, LiveStreamItem } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUser: UserProfile;
  followingList: string[];
  onFollowToggle: (targetId: string) => void;
  onOpenDirectChat?: (user: UserProfile) => void;
  onOpenGoLive?: () => void;
  onJoinStream?: (stream: LiveStreamItem) => void;
  onOpenWallet?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUser,
  followingList,
  onFollowToggle,
  onOpenDirectChat,
  onOpenGoLive,
  onJoinStream,
  onOpenWallet,
}) => {
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [activeStream, setActiveStream] = useState<LiveStreamItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareNotice, setShowShareNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'live' | 'about'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  const isOwnProfile = !userId || userId === currentUser.id;
  const isFollowing = profileUser ? followingList.includes(profileUser.id) : false;

  useEffect(() => {
    if (!isOpen) return;

    const targetId = userId || currentUser.id;
    setIsLoading(true);

    fetch(`/api/user/profile/${targetId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setProfileUser(data.user);
          setEditedBio(data.user.bio || data.user.quote || '');
          setActiveStream(data.activeStream || null);
        } else {
          setProfileUser(data);
          setEditedBio(data.bio || data.quote || '');
        }
      })
      .catch((err) => {
        console.error(err);
        // Fallback to currentUser if own profile
        if (targetId === currentUser.id) {
          setProfileUser(currentUser);
          setEditedBio(currentUser.bio || '');
        }
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, userId, currentUser]);

  if (!isOpen) return null;

  const target = profileUser || currentUser;

  // Format numbers nicely matching screenshots (e.g. 60.93K, 16.01M)
  const formatStat = (num: number = 0, defaultStr?: string) => {
    if (defaultStr) return defaultStr;
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2).replace('.', ',')}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2).replace('.', ',')}K`;
    }
    return num.toLocaleString();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareNotice(true);
    setTimeout(() => setShowShareNotice(false), 2500);
  };

  const handleSaveBio = async () => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editedBio }),
      });
      if (profileUser) {
        setProfileUser({ ...profileUser, bio: editedBio });
      }
      setIsEditingBio(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      {/* Background stars click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Profile Card - Strict Design Matching Screenshots 1 & 2 */}
      <div className="relative w-full max-w-4xl bg-[#0c101b] border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-white font-['Plus_Jakarta_Sans']">
        
        {/* Starry Night Sky Canvas Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
          {/* Subtle glowing star particles */}
          <div className="absolute top-6 left-1/4 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px] animate-pulse" />
          <div className="absolute top-12 left-1/2 w-2 h-2 bg-pink-300 rounded-full blur-[0.5px]" />
          <div className="absolute top-8 right-1/3 w-1 h-1 bg-white rounded-full" />
          <div className="absolute top-20 right-1/4 w-2 h-2 bg-purple-300 rounded-full blur-[0.5px]" />
          <div className="absolute top-4 right-12 w-1.5 h-1.5 bg-white rounded-full" />
          <div className="absolute top-16 left-12 w-1 h-1 bg-blue-200 rounded-full" />

          {/* Large soft watermark star behind avatar (as in Screenshot 1) */}
          {isOwnProfile && (
            <svg
              className="absolute -top-10 left-16 w-56 h-56 text-slate-800/20 fill-current"
              viewBox="0 0 24 24"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        </div>

        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Right Header Action Icons (Screenshots 1 & 2) */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-3">
          {/* Share icon with red notification dot */}
          <button
            onClick={handleShare}
            className="relative p-2 rounded-full hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Partager le profil"
          >
            <Share2 className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-[#0c101b]" />
          </button>

          {/* Edit icon for own profile OR Three Dots for other model */}
          {isOwnProfile ? (
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="p-2 rounded-full hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Modifier le profil"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          ) : (
            <button
              className="p-2 rounded-full hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Plus d'options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toast Notice */}
        {showShareNotice && (
          <div className="absolute top-16 right-6 z-30 px-3 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-lg animate-bounce">
            Lien copié dans le presse-papier !
          </div>
        )}

        {/* Profile Content Container */}
        <div className="relative px-6 sm:px-10 pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            
            {/* Avatar Section */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white/90 shadow-2xl overflow-hidden bg-slate-900">
                <img
                  src={target.avatar}
                  alt={target.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Star Badge at bottom-left of avatar (Screenshot 1) */}
              {isOwnProfile && (
                <div className="absolute -bottom-1 left-1 w-9 h-9 rounded-full bg-white text-slate-400 flex items-center justify-center shadow-lg border-2 border-[#0c101b]">
                  <Star className="w-5 h-5 fill-slate-300 text-slate-300" />
                </div>
              )}

              {/* Camera Icon Button at bottom-right of avatar (Screenshot 1) */}
              {isOwnProfile && (
                <button
                  onClick={() => {
                    const newUrl = prompt('Entrez l\'URL de votre nouvelle photo de profil :', target.avatar);
                    if (newUrl && newUrl.trim()) {
                      fetch('/api/user/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatar: newUrl.trim() }),
                      }).then(() => window.location.reload());
                    }
                  }}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#1c2230] hover:bg-[#283145] text-white flex items-center justify-center shadow-lg border-2 border-[#0c101b] cursor-pointer transition-colors"
                  title="Changer la photo de profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}

              {/* Live badge if currently broadcasting */}
              {activeStream && (
                <div className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-lg animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  LIVE
                </div>
              )}
            </div>

            {/* Profile Info Details Section */}
            <div className="flex-1 text-center md:text-left space-y-3">
              {/* Name & Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {target.name}
                </h1>

                {/* Verified Red Badge (Screenshot 2) */}
                {(!isOwnProfile || target.verified) && (
                  <div className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm" title="Vérifiée">
                    ✓
                  </div>
                )}
              </div>

              {/* Subtitle Line (e.g. Arabie saoudite, 26 ans • Legends ! الأساطير >) */}
              {!isOwnProfile && (
                <div className="text-xs sm:text-sm font-semibold text-slate-400 flex items-center justify-center md:justify-start gap-1">
                  <span>
                    {target.subtitle || `${target.countryName || 'Arabie Saoudite'}, ${target.age || 26} ans • Legends ❗ الأساطير`}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}

              {/* Poetic Quote / Bio (Screenshot 2) */}
              {!isOwnProfile && (
                <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-2xl text-right md:text-left dir-auto">
                  {target.quote || target.bio || 'عِش يومك بقلبٍ راضٍ، ولسانٍ شاكر، وعقلٍ متفائل؛ فالأيّام تُزهر لمن يُحسن انتظار المطر ❤️🦌'}
                </p>
              )}

              {/* Editable Bio for own profile */}
              {isOwnProfile && isEditingBio ? (
                <div className="space-y-2 max-w-lg">
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white resize-none outline-none focus:border-pink-500"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-3 py-1 rounded-lg bg-pink-600 text-white font-bold text-xs"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : isOwnProfile && target.bio ? (
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
                  {target.bio}
                </p>
              ) : null}

              {/* Statistics Row (Exact Alignment from Screenshots 1 & 2) */}
              <div className="flex items-center justify-center md:justify-start gap-6 sm:gap-10 pt-2 pb-1">
                {/* 1. Gains (Diamonds) */}
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatStat(target.diamondsBalance, target.gainsFormatted || (isOwnProfile ? '60,93K' : '16,01M'))}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="text-slate-500 text-[10px]">🔻</span>
                    <span>Gains</span>
                  </div>
                </div>

                {/* 2. Abonnés (Followers) */}
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatStat(target.followers, target.followersFormatted || (isOwnProfile ? '542' : '57,73K'))}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    Abonnés
                  </div>
                </div>

                {/* 3. Abonnements (Following - Only in Screenshot 1 for own profile) */}
                {isOwnProfile && (
                  <div className="text-left">
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {target.following || 532}
                    </div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">
                      Abonnements
                    </div>
                  </div>
                )}

                {/* 4. Fans */}
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {target.fansCount ?? (isOwnProfile ? 1 : 5)}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    Fans
                  </div>
                </div>
              </div>

              {/* Action Buttons Row (Screenshots 1 & 2) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                {isOwnProfile ? (
                  <>
                    {/* Primary Pink: + Créer une publication */}
                    <button
                      onClick={() => {
                        alert('Fonctionnalité publication bientôt disponible !');
                      }}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-pink-900/40 cursor-pointer transition-all active:scale-95"
                    >
                      <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-xs">+</span>
                      <span>Créer une publication</span>
                    </button>

                    {/* Secondary Dark: Lancer le Live */}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenGoLive?.();
                      }}
                      className="px-6 py-2.5 rounded-full bg-[#1c2230] hover:bg-[#283145] text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700/60 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Video className="w-4 h-4 text-white" />
                      <span>Lancer le Live</span>
                    </button>

                    {/* Circular Diamond Button with Red Notification Dot */}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenWallet?.();
                      }}
                      className="relative w-10 h-10 rounded-full bg-[#1c2230] hover:bg-[#283145] border border-slate-700/60 flex items-center justify-center text-cyan-300 cursor-pointer transition-colors shadow-md"
                      title="Solde Diamants / Gains"
                    >
                      <Gem className="w-4 h-4" />
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-600 border-2 border-[#0c101b]" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Other Model: Message Button */}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenDirectChat?.(target);
                      }}
                      className="px-6 py-2.5 rounded-full bg-[#1c2230] hover:bg-[#283145] text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700/60 cursor-pointer transition-all active:scale-95 shadow-md"
                    >
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                      <span>Message</span>
                    </button>

                    {/* Other Model: S'abonner / Abonné (Toggle Follow) */}
                    <button
                      onClick={() => onFollowToggle(target.id)}
                      className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 border ${
                        isFollowing
                          ? 'bg-slate-800 text-pink-300 border-pink-500/50 hover:bg-slate-700'
                          : 'bg-[#1c2230] hover:bg-pink-600 text-white border-slate-700/60 hover:border-pink-500'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 text-pink-400" />
                          <span>Abonné</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 text-amber-400" />
                          <span>S'abonner</span>
                        </>
                      )}
                    </button>

                    {/* Other Model: Envoyer un cadeau */}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenDirectChat?.(target);
                      }}
                      className="px-6 py-2.5 rounded-full bg-[#1c2230] hover:bg-pink-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700/60 cursor-pointer transition-all active:scale-95 shadow-md"
                    >
                      <Gift className="w-4 h-4 text-pink-400" />
                      <span>Envoyer un cadeau</span>
                    </button>

                    {/* Live Stream Shortcut if broadcasting right now */}
                    {activeStream && (
                      <button
                        onClick={() => {
                          onClose();
                          onJoinStream?.(activeStream);
                        }}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-900/40 animate-pulse cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Rejoindre le Live</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs & Details Section */}
        <div className="border-t border-slate-800/80 bg-[#090d16]/80 px-6 sm:px-10 py-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Membre actif vérifié</span>
              {target.countryFlag && (
                <span className="ml-2 font-bold text-slate-300">
                  {target.countryFlag} {target.countryName}
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              ID: {target.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
