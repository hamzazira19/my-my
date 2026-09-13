import React, { useState, useEffect, useRef } from 'react';
import {
  X, Heart, Send, Sparkles, Video, VideoOff,
  Mic, MicOff, Users, Coins, Flame, Award,
  ShieldCheck, Wand2, Trophy, VolumeX, Volume2, Ban,
  CheckCircle2, UserX, UserCheck, Settings, Play, Radio,
  Clock, Pause, Volume1
} from 'lucide-react';
import Hls from 'hls.js';
import confetti from 'canvas-confetti';
import { LiveStreamItem, ChatMessage, UserProfile, GiftItem } from '../types';
import { GIFTS_CATALOG } from '../data/gifts';

interface LiveRoomModalProps {
  stream: LiveStreamItem;
  currentUser: UserProfile;
  followingList?: string[];
  onFollowToggle?: (targetId: string) => void;
  onOpenProfile?: (userId: string) => void;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onOpenDeposit: () => void;
}

interface FloatingHeart {
  id: number;
  left: number;
  color: string;
  size: number;
}

interface ModeratedUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  timestamp: number;
}

export const LiveRoomModal: React.FC<LiveRoomModalProps> = ({
  stream,
  currentUser,
  followingList = [],
  onFollowToggle,
  onOpenProfile,
  onClose,
  onUpdateUser,
  onOpenDeposit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeGift, setActiveGift] = useState<GiftItem>(GIFTS_CATALOG[0]);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<{
    gift: GiftItem;
    senderName: string;
    combo: number;
  } | null>(null);

  // Moderation state
  const [selectedUserForMod, setSelectedUserForMod] = useState<{
    id: string;
    name: string;
    avatar: string;
    level: number;
  } | null>(null);
  const [mutedUsers, setMutedUsers] = useState<Record<string, ModeratedUser>>({});
  const [blockedUsers, setBlockedUsers] = useState<Record<string, ModeratedUser>>({});
  const [isViewerMuted, setIsViewerMuted] = useState(false);
  const [isViewerBlocked, setIsViewerBlocked] = useState(false);
  const [chatTab, setChatTab] = useState<'chat' | 'moderation'>('chat');
  const [modNotice, setModNotice] = useState<string | null>(null);

  // HLS Video Stream state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [videoFilter, setVideoFilter] = useState<'normal' | 'beauty' | 'vibrant' | 'cyber'>('beauty');
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(stream.likesCount);
  const [currentViewers, setCurrentViewers] = useState(stream.viewerCount);
  const [currentGoalCoins, setCurrentGoalCoins] = useState(stream.goal.current);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamSourceType, setStreamSourceType] = useState<'hls' | 'camera'>('hls');
  const [activeM3u8Url, setActiveM3u8Url] = useState<string>(
    stream.m3u8Url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  );
  const [hlsStatus, setHlsStatus] = useState<string>('Connecting to HLS stream...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isMyOwnStream = stream.streamerId === currentUser.id;
  const isHostOrAdmin = isMyOwnStream || currentUser.role === 'admin';

  // Helper notice
  const triggerModNotice = (msg: string) => {
    setModNotice(msg);
    setTimeout(() => setModNotice(null), 3500);
  };

  // -------------------------------------------------------------
  // HLS (.m3u8 & .ts) and Camera Lifecycle
  // -------------------------------------------------------------
  useEffect(() => {
    // If not my own camera, or if model chooses HLS preview:
    const shouldUseHls = !isMyOwnStream || streamSourceType === 'hls';

    if (shouldUseHls && videoRef.current) {
      const video = videoRef.current;
      const m3u8 = activeM3u8Url.trim();

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
        });
        hlsRef.current = hls;

        hls.loadSource(m3u8);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setHlsStatus('Live HLS (.m3u8 + .ts) Synchronized');
          video.play().catch(() => {
            // Autoplay with sound might be blocked, retry muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(console.error);
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setHlsStatus('Reconnecting HLS stream...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setHlsStatus('Recovering media segments (.ts)...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setHlsStatus('HLS stream disconnected. Re-initializing...');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari / iOS HLS
        video.src = m3u8;
        video.addEventListener('loadedmetadata', () => {
          setHlsStatus('Native HLS (.m3u8) Playing');
          video.play().catch(console.error);
        });
      }
    } else if (isMyOwnStream && streamSourceType === 'camera') {
      // Local Camera broadcast
      let streamActive = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      navigator.mediaDevices?.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      })
      .then((mediaStream) => {
        if (!streamActive) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }
        mediaStreamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
      })
      .catch((err) => {
        console.warn('Camera access error:', err);
        setCameraError('Webcam unavailable. Switched to HLS .m3u8 live feed.');
        setStreamSourceType('hls');
      });

      return () => {
        streamActive = false;
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isMyOwnStream, streamSourceType, activeM3u8Url]);

  // -------------------------------------------------------------
  // Stream Chat & Moderation Polling
  // -------------------------------------------------------------
  const loadStreamState = () => {
    fetch(`/api/streams/${stream.id}`)
      .then(res => {
        if (res.status === 403) {
          setIsViewerBlocked(true);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.chat) setMessages(data.chat);
        if (data.isMuted) setIsViewerMuted(true);
        if (data.moderation) {
          const mUsers: Record<string, ModeratedUser> = {};
          data.moderation.mutedUsers.forEach((u: ModeratedUser) => { mUsers[u.id] = u; });
          setMutedUsers(mUsers);

          const bUsers: Record<string, ModeratedUser> = {};
          data.moderation.blockedUsers.forEach((u: ModeratedUser) => { bUsers[u.id] = u; });
          setBlockedUsers(bUsers);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadStreamState();

    const interval = setInterval(() => {
      loadStreamState();
      // Slight viewer count variance
      setCurrentViewers(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)));
    }, 3000);

    return () => clearInterval(interval);
  }, [stream.id]);

  // Scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // -------------------------------------------------------------
  // Chat Actions
  // -------------------------------------------------------------
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (isViewerMuted) {
      alert('You are muted by the host in this room and can only watch.');
      return;
    }

    try {
      const res = await fetch(`/api/streams/${stream.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setMessages(prev => [...prev, data]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // -------------------------------------------------------------
  // Real-time Moderation: MUTE & BLOCK
  // -------------------------------------------------------------
  const handleMuteUser = async (user: { id: string; name: string; avatar: string; level: number }) => {
    try {
      const res = await fetch(`/api/streams/${stream.id}/mute-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          userLevel: user.level,
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerModNotice(`🔇 ${user.name} is now MUTED. They can only watch.`);
        setSelectedUserForMod(null);
        loadStreamState();
      }
    } catch (err) {
      console.error('Mute error:', err);
    }
  };

  const handleUnmuteUser = async (userId: string, userName: string) => {
    try {
      const res = await fetch(`/api/streams/${stream.id}/unmute-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        triggerModNotice(`🔊 ${userName} was UNMUTED.`);
        setSelectedUserForMod(null);
        loadStreamState();
      }
    } catch (err) {
      console.error('Unmute error:', err);
    }
  };

  const handleBlockUser = async (user: { id: string; name: string; avatar: string; level: number }) => {
    try {
      const res = await fetch(`/api/streams/${stream.id}/block-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          userLevel: user.level,
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerModNotice(`🚫 ${user.name} was BLOCKED and ejected from this live broadcast.`);
        setSelectedUserForMod(null);
        loadStreamState();
      }
    } catch (err) {
      console.error('Block error:', err);
    }
  };

  const handleUnblockUser = async (userId: string, userName: string) => {
    try {
      const res = await fetch(`/api/streams/${stream.id}/unblock-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        triggerModNotice(`✅ ${userName} was UNBLOCKED.`);
        setSelectedUserForMod(null);
        loadStreamState();
      }
    } catch (err) {
      console.error('Unblock error:', err);
    }
  };

  // -------------------------------------------------------------
  // Hearts & Gifts (For Viewers & Da3ém)
  // -------------------------------------------------------------
  const handleHeartReaction = () => {
    const colors = ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24', '#06b6d4'];
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 60 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 20,
    };

    setFloatingHearts(prev => [...prev.slice(-15), newHeart]);
    setCurrentLikes(prev => prev + 1);
    fetch(`/api/streams/${stream.id}/like`, { method: 'POST' }).catch(() => {});

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1800);
  };

  const triggerGiftExplosion = (gift: GiftItem, combo: number) => {
    setActiveAnimation({ gift, senderName: currentUser.name, combo });

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (gift.tier === 'legendary') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Ignore audio restriction
    }

    if (gift.tier === 'legendary' || gift.tier === 'epic') {
      confetti({
        particleCount: gift.tier === 'legendary' ? 120 : 60,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
      });
    }

    setTimeout(() => {
      setActiveAnimation(null);
    }, 3200);
  };

  const handleSendGift = async (gift: GiftItem) => {
    const totalCost = gift.coinsCost * comboMultiplier;

    if (currentUser.coinsBalance < totalCost) {
      onOpenDeposit();
      return;
    }

    try {
      const res = await fetch(`/api/streams/${stream.id}/gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          giftName: gift.name,
          giftIcon: gift.icon,
          coinsCost: gift.coinsCost,
          count: comboMultiplier,
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.user) {
        onUpdateUser(data.user);
      }

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }

      setCurrentGoalCoins(prev => prev + totalCost);
      triggerGiftExplosion(gift, comboMultiplier);
      handleHeartReaction();
    } catch (err) {
      console.error('Failed to send gift:', err);
    }
  };

  // Real-time live chronometer
  const [liveDuration, setLiveDuration] = useState<number>(() => {
    return Math.floor(Math.random() * 1200) + 1420; // Starts around ~25 mins in
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatChrono = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  // Tools for model during live:
  // 1. Toggle camera (cut camera, keep audio only)
  const handleToggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
    setIsVideoEnabled((prev) => {
      const next = !prev;
      triggerModNotice(next ? '📷 Caméra réactivée' : '🚫 Caméra coupée (Mode audio seul)');
      return next;
    });
  };

  // 2. Toggle mic (cut sound, keep camera video)
  const handleToggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => {
      const next = !prev;
      triggerModNotice(next ? '🔇 Son coupé (Microphone désactivé)' : '🎙️ Son réactivé (Microphone actif)');
      return next;
    });
  };

  // 3. Cut both camera & sound simultaneously (Privacy pause)
  const handleToggleBothOff = () => {
    const areBothOff = !isVideoEnabled && isMuted;
    if (areBothOff) {
      if (mediaStreamRef.current) {
        const vTrack = mediaStreamRef.current.getVideoTracks()[0];
        if (vTrack) vTrack.enabled = true;
        const aTrack = mediaStreamRef.current.getAudioTracks()[0];
        if (aTrack) aTrack.enabled = true;
      }
      if (videoRef.current) videoRef.current.muted = false;
      setIsVideoEnabled(true);
      setIsMuted(false);
      triggerModNotice('▶️ Live repris : Caméra et Son réactivés');
    } else {
      if (mediaStreamRef.current) {
        const vTrack = mediaStreamRef.current.getVideoTracks()[0];
        if (vTrack) vTrack.enabled = false;
        const aTrack = mediaStreamRef.current.getAudioTracks()[0];
        if (aTrack) aTrack.enabled = false;
      }
      if (videoRef.current) videoRef.current.muted = true;
      setIsVideoEnabled(false);
      setIsMuted(true);
      triggerModNotice('⏸️ Pause complète : Caméra et Son coupés');
    }
  };

  const goalPercent = Math.min(100, Math.round((currentGoalCoins / stream.goal.target) * 100));

  const filterStyles = {
    normal: 'brightness-100 contrast-100',
    beauty: 'brightness-105 contrast-105 saturate-110 blur-[0.3px]',
    vibrant: 'brightness-110 saturate-130 contrast-110',
    cyber: 'hue-rotate-15 contrast-125 saturate-150',
  }[videoFilter];

  // If viewer is blocked from entering
  if (isViewerBlocked && !isHostOrAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
        <div className="bg-[#0f1422] border border-red-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
            <Ban className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white font-['Outfit']">Access Denied</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You have been blocked from entering this live room by the host. You cannot watch this broadcast or join the chat.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 md:p-4 overflow-hidden backdrop-blur-md">
      <div className="relative w-full h-full md:max-w-6xl md:h-[92vh] bg-[#0c101c] md:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ================= LEFT / MAIN: VIDEO STAGE ================= */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Main Video Element (Supports HLS or local webcam) */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted={isMuted}
              className={`w-full h-full object-cover transition-all duration-300 ${
                !isVideoEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100'
              } ${isMyOwnStream && streamSourceType === 'camera' ? '-scale-x-100' : ''} ${filterStyles}`}
            />

            {/* Audio-Only Mode Overlay (When camera is cut but audio is active) */}
            {!isVideoEnabled && !isMuted && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#180f28]/95 via-[#0e1322]/95 to-[#0b0f1a]/95 backdrop-blur-md p-6 text-center animate-fade-in">
                <div className="relative mb-6">
                  {/* Glowing acoustic audio waves animation */}
                  <div className="absolute -inset-4 rounded-full bg-pink-500/20 animate-ping opacity-60 pointer-events-none" />
                  <div className="absolute -inset-8 rounded-full bg-purple-500/15 animate-pulse opacity-50 pointer-events-none" />
                  <img
                    src={stream.streamerAvatar}
                    alt={stream.streamerName}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-pink-500 shadow-2xl relative z-10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 z-20 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg border-2 border-slate-900">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Mode Audio Seul (Caméra coupée)</span>
                  </div>
                  <h3 className="text-lg font-black text-white font-['Outfit']">
                    {stream.streamerName} diffuse sa voix en direct
                  </h3>
                  <p className="text-xs text-slate-400">
                    La caméra a été temporairement désactivée. Le microphone reste actif.
                  </p>
                </div>

                {/* Animated Equalizer Waveform */}
                <div className="flex items-center gap-1.5 mt-6 h-8">
                  {[40, 75, 55, 90, 65, 80, 45, 95, 70, 60, 85, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDuration: `${0.6 + (i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Paused Screen (When BOTH camera and audio are cut) */}
            {!isVideoEnabled && isMuted && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-2xl">
                  <Pause className="w-10 h-10 text-pink-400" />
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit'] mb-1">
                  Live en Pause Privée
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mb-5">
                  La caméra et le son sont tous les deux coupés en même temps.
                </p>
                <button
                  type="button"
                  onClick={handleToggleBothOff}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-950/40"
                >
                  <Play className="w-4 h-4" />
                  <span>Reprendre la diffusion (Caméra + Son)</span>
                </button>
              </div>
            )}

            {/* Sound Muted Badge when video is active */}
            {isVideoEnabled && isMuted && (
              <div className="absolute top-20 left-4 z-20 flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs px-3 py-1.5 rounded-full backdrop-blur-md animate-fade-in shadow-lg">
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Son Coupé (Microphone désactivé)</span>
              </div>
            )}

            {cameraError && streamSourceType === 'camera' && (
              <div className="absolute top-16 left-4 right-4 bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs p-3 rounded-xl backdrop-blur-md">
                {cameraError}
              </div>
            )}
          </div>

          {/* Model Live Control Tools Dock (Devant la modèle) */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-[#0c1120]/95 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-700/80 shadow-2xl"
            id="model-live-tools-dock"
          >
            {/* Tool 1: Camera ON / OFF (Couper caméra et garder le son seul) */}
            <button
              type="button"
              onClick={handleToggleCamera}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm ${
                isVideoEnabled
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600/70'
                  : 'bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-md shadow-red-950/50'
              }`}
              title={isVideoEnabled ? 'Couper la caméra (Garder le son seul)' : 'Réactiver la caméra'}
              id="model-tool-camera-toggle"
            >
              {isVideoEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-white" />}
              <span className="hidden sm:inline">{isVideoEnabled ? 'Caméra ON' : 'Caméra OFF (Audio seul)'}</span>
              <span className="sm:hidden">{isVideoEnabled ? 'Cam' : 'Audio seul'}</span>
            </button>

            {/* Tool 2: Micro / Son ON / OFF (Couper le son et garder la caméra) */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm ${
                !isMuted
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600/70'
                  : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 shadow-md shadow-amber-950/50'
              }`}
              title={!isMuted ? 'Couper le son (Microphone coupé)' : 'Réactiver le son'}
              id="model-tool-mic-toggle"
            >
              {!isMuted ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-white" />}
              <span className="hidden sm:inline">{!isMuted ? 'Micro ON' : 'Son Coupé'}</span>
              <span className="sm:hidden">{!isMuted ? 'Mic' : 'Muet'}</span>
            </button>

            {/* Tool 3: Tout Couper (Caméra + Son coupés fared wa9et / Pause totale) */}
            <button
              type="button"
              onClick={handleToggleBothOff}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm ${
                !isVideoEnabled && isMuted
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white border border-pink-400 animate-pulse'
                  : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600/60'
              }`}
              title="Couper la caméra et le son en même temps (Pause privée)"
              id="model-tool-pause-all-toggle"
            >
              <Pause className="w-4 h-4 text-pink-300" />
              <span className="hidden sm:inline">{!isVideoEnabled && isMuted ? 'Reprendre Tout' : 'Tout Couper (Cam + Son)'}</span>
              <span className="sm:hidden">{!isVideoEnabled && isMuted ? 'Reprendre' : 'Pause'}</span>
            </button>
          </div>

          {/* Floating Hearts Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {floatingHearts.map(h => (
              <div
                key={h.id}
                className="absolute bottom-16 animate-float-up opacity-90"
                style={{
                  left: `${h.left}%`,
                  color: h.color,
                  fontSize: `${h.size}px`,
                }}
              >
                ❤️
              </div>
            ))}
          </div>

          {/* Fullscreen Gift Celebration Overlay */}
          {activeAnimation && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in">
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b from-purple-900/90 via-slate-900/90 to-pink-900/90 border border-pink-500/40 shadow-2xl scale-110 animate-bounce">
                <div className="text-7xl mb-2 filter drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]">
                  {activeAnimation.gift.icon}
                </div>
                <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-black font-extrabold text-sm tracking-wider uppercase shadow-lg">
                  {activeAnimation.combo > 1 ? `${activeAnimation.combo}x COMBO!` : 'BIG GIFT!'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 font-['Outfit']">
                  {activeAnimation.gift.name}
                </h2>
                <p className="text-pink-300 font-bold text-sm mt-1">
                  Sent by <span className="text-cyan-300 underline font-extrabold">{activeAnimation.senderName}</span>
                </p>
                <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs mt-2 bg-black/60 px-3 py-1 rounded-full">
                  <Coins className="w-4 h-4 text-amber-400" />
                  {(activeAnimation.gift.coinsCost * activeAnimation.combo).toLocaleString()} Coins
                </div>
              </div>
            </div>
          )}

          {/* Notification banner on moderation actions */}
          {modNotice && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-purple-500/60 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="font-bold">{modNotice}</span>
            </div>
          )}

          {/* Top Header Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
            {/* Streamer Profile Pill */}
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
              <button
                type="button"
                onClick={() => onOpenProfile?.(stream.streamerId)}
                className="relative group cursor-pointer"
                title="Voir le profil"
              >
                <img
                  src={stream.streamerAvatar}
                  alt={stream.streamerName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500 group-hover:ring-pink-400 transition-all"
                  referrerPolicy="no-referrer"
                />
                {stream.countryFlag && (
                  <span className="absolute -bottom-1 -right-1 text-[10px]">
                    {stream.countryFlag}
                  </span>
                )}
              </button>
              <div 
                className="text-left cursor-pointer select-none"
                onClick={() => onOpenProfile?.(stream.streamerId)}
                title="Voir le profil"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1 group-hover:text-pink-300">
                  <span>{stream.streamerName}</span>
                  {isMyOwnStream ? (
                    <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-extrabold">YOU (HOST)</span>
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {currentLikes.toLocaleString()} Likes
                </div>
              </div>

              {!isMyOwnStream && (
                <button
                  type="button"
                  onClick={() => {
                    if (onFollowToggle) {
                      onFollowToggle(stream.streamerId);
                    }
                    setIsFollowing(!followingList.includes(stream.streamerId));
                  }}
                  className={`ml-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1 ${
                    followingList.includes(stream.streamerId) || isFollowing
                      ? 'bg-slate-800/90 text-pink-300 border border-pink-500/40 hover:bg-slate-700'
                      : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:scale-105 shadow-md shadow-pink-600/30'
                  }`}
                  id="live-stream-follow-btn"
                >
                  {followingList.includes(stream.streamerId) || isFollowing ? '✓ Abonné' : '+ Suivre'}
                </button>
              )}
            </div>

            {/* Live Chronometer (User request: "zidni crono lél model 9adéch 3andeha mén wa9ét 7ala live") */}
            <div
              className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/50 text-white text-xs font-black shadow-lg"
              title="Temps de diffusion en direct"
              id="live-chronometer-badge"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="font-mono tracking-wider font-extrabold text-red-100">{formatChrono(liveDuration)}</span>
            </div>

            {/* Viewers & Stream Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-slate-700/60">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {currentViewers.toLocaleString()}
              </div>

              {/* Streamer Broadcast Controls */}
              {isMyOwnStream && (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-slate-700/60">
                  {/* Switch between HLS Stream vs Camera */}
                  <button
                    onClick={() => setStreamSourceType(streamSourceType === 'hls' ? 'camera' : 'hls')}
                    className="px-2.5 py-1 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Basculer Caméra / Flux HLS"
                  >
                    <Radio className="w-3 h-3" />
                    <span>{streamSourceType === 'hls' ? 'HLS Stream' : 'Webcam'}</span>
                  </button>

                  <button
                    onClick={handleToggleCamera}
                    className={`p-1.5 rounded-full cursor-pointer ${isVideoEnabled ? 'bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
                    title="Basculer Caméra"
                  >
                    {isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleToggleMic}
                    className={`p-1.5 rounded-full cursor-pointer ${!isMuted ? 'bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
                    title="Basculer Micro"
                  >
                    {!isMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      const filters: Array<'normal' | 'beauty' | 'vibrant' | 'cyber'> = ['normal', 'beauty', 'vibrant', 'cyber'];
                      const next = filters[(filters.indexOf(videoFilter) + 1) % filters.length];
                      setVideoFilter(next);
                    }}
                    className="p-1.5 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white cursor-pointer"
                    title={`Current Filter: ${videoFilter}`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/60"
                id="live-room-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-2.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {stream.goal.title}
              </span>
              <span className="text-amber-400 font-extrabold text-[11px]">
                {currentGoalCoins.toLocaleString()} / {stream.goal.target.toLocaleString()} ({goalPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT: INTERACTIVE CHAT & MODERATION PANEL ================= */}
        <div className="w-full md:w-96 bg-[#0e131f] flex flex-col border-t md:border-t-0 md:border-l border-slate-800 h-[50vh] md:h-full">
          
          {/* Header with Moderation Tabs */}
          <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between bg-[#111726]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChatTab('chat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  chatTab === 'chat'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Chat
              </button>

              {isHostOrAdmin && (
                <button
                  onClick={() => setChatTab('moderation')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                    chatTab === 'moderation'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="View Muted & Blocked Users in this Room"
                >
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  <span>Moderation</span>
                  {(Object.keys(mutedUsers).length + Object.keys(blockedUsers).length) > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px]">
                      {Object.keys(mutedUsers).length + Object.keys(blockedUsers).length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Coins indicator (only for viewers, hidden for model's screen) */}
            {!isMyOwnStream && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>{currentUser.coinsBalance.toLocaleString()}</span>
              </div>
            )}
            {isMyOwnStream && (
              <span className="text-[10px] font-bold text-pink-400 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30">
                Model Screen
              </span>
            )}
          </div>

          {/* ================= TAB 1: REAL-TIME LIVE CHAT ================= */}
          {chatTab === 'chat' && (
            <>
              {/* Host moderation hint */}
              {isHostOrAdmin && (
                <div className="px-3 py-1.5 bg-purple-950/40 border-b border-purple-800/30 text-[10px] text-purple-300 font-medium flex items-center justify-between">
                  <span>💡 Click on any user name to Mute or Block them in real-time</span>
                  <span className="text-[9px] text-slate-400">Host Controls</span>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
                {messages.map((m) => {
                  if (m.type === 'system') {
                    return (
                      <div key={m.id} className="bg-purple-950/40 border border-purple-800/40 text-purple-300 p-2 rounded-xl text-[11px] text-center font-semibold">
                        {m.text}
                      </div>
                    );
                  }

                  if (m.type === 'gift') {
                    return (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 flex items-center gap-2.5 shadow-sm"
                      >
                        <div className="text-2xl">{m.gift?.giftIcon || '🎁'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => isHostOrAdmin && setSelectedUserForMod({
                                id: m.userId,
                                name: m.userName,
                                avatar: m.userAvatar,
                                level: m.userLevel,
                              })}
                              className={`font-extrabold text-pink-300 truncate hover:underline ${
                                isHostOrAdmin ? 'cursor-pointer' : ''
                              }`}
                            >
                              {m.userName}
                            </button>
                            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                              DONOR
                            </span>
                          </div>
                          <p className="text-slate-300 font-semibold text-[11px]">
                            Sent <span className="text-white font-bold">{m.gift?.giftName}</span> ({m.gift?.coinsCost.toLocaleString()} coins)
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const isMutedUser = !!mutedUsers[m.userId];

                  return (
                    <div key={m.id} className="flex items-start gap-2 group">
                      <div className="flex-1 leading-relaxed">
                        <button
                          onClick={() => isHostOrAdmin && setSelectedUserForMod({
                            id: m.userId,
                            name: m.userName,
                            avatar: m.userAvatar,
                            level: m.userLevel,
                          })}
                          className={`font-bold text-slate-300 mr-1.5 transition-colors ${
                            isHostOrAdmin ? 'hover:text-cyan-400 hover:underline cursor-pointer' : ''
                          }`}
                        >
                          {m.userName}
                        </button>
                        {isMutedUser && (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-400 mr-1">
                            Muted
                          </span>
                        )}
                        <span className="text-slate-200 font-medium break-words">{m.text}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* USER MODERATION POPOVER CARD (Mute / Block User) */}
              {selectedUserForMod && isHostOrAdmin && (
                <div className="m-3 p-3 rounded-2xl bg-[#141a2c] border border-red-500/40 shadow-2xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs">
                        {selectedUserForMod.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-white flex items-center gap-1">
                          {selectedUserForMod.name}
                        </div>
                        <div className="text-[10px] text-slate-400">Streamer Moderation Controls</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUserForMod(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Moderation Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Mute / Unmute Button */}
                    {mutedUsers[selectedUserForMod.id] ? (
                      <button
                        onClick={() => handleUnmuteUser(selectedUserForMod.id, selectedUserForMod.name)}
                        className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Unmute User</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMuteUser(selectedUserForMod)}
                        className="py-2 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="User cannot write in chat anymore, only watch"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Mute User</span>
                      </button>
                    )}

                    {/* Block / Unblock Button */}
                    {blockedUsers[selectedUserForMod.id] ? (
                      <button
                        onClick={() => handleUnblockUser(selectedUserForMod.id, selectedUserForMod.name)}
                        className="py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unblock User</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(selectedUserForMod)}
                        className="py-2 px-3 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="User is ejected and blocked from entering the live room completely"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block User</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Muted: Watch only (cannot write) • Blocked: Completely removed from live room
                  </p>
                </div>
              )}

              {/* ================= GIFTS DRAWER: ONLY FOR VIEWERS (HIDDEN ON MODEL SCREEN) ================= */}
              {!isMyOwnStream && (
                <div className="p-2.5 bg-[#0b0f19] border-t border-slate-800/80">
                  {/* Quick Gift Icons Carousel */}
                  <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {GIFTS_CATALOG.slice(0, 6).map((gift) => (
                      <button
                        key={gift.id}
                        onClick={() => handleSendGift(gift)}
                        className="flex flex-col items-center p-1.5 rounded-xl hover:bg-slate-800/90 active:scale-95 transition-all cursor-pointer shrink-0 group border border-transparent hover:border-slate-700"
                        title={`${gift.name} - ${gift.coinsCost} coins`}
                      >
                        <span className="text-xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 mt-0.5">
                          {gift.coinsCost}
                        </span>
                      </button>
                    ))}

                    <button
                      onClick={handleHeartReaction}
                      className="w-9 h-9 rounded-full bg-pink-600/20 hover:bg-pink-600/30 text-pink-500 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0 border border-pink-500/40"
                      title="Send Free Love Heart"
                    >
                      <Heart className="w-4 h-4 fill-pink-500" />
                    </button>
                  </div>

                  {/* Gift Drawer & Combo Controls */}
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-800/60">
                    <button
                      onClick={() => setShowGiftDrawer(!showGiftDrawer)}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>{showGiftDrawer ? 'Hide Catalog' : 'Full Gift Shop'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Combo:</span>
                      {[1, 5, 10].map(mult => (
                        <button
                          key={mult}
                          onClick={() => setComboMultiplier(mult)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold cursor-pointer ${
                            comboMultiplier === mult
                              ? 'bg-amber-500 text-black'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mult}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Gift Shop Drawer */}
                  {showGiftDrawer && (
                    <div className="grid grid-cols-4 gap-2 mt-2 p-2 bg-[#121829] rounded-2xl border border-slate-700/60 max-h-44 overflow-y-auto">
                      {GIFTS_CATALOG.map((gift) => (
                        <button
                          key={gift.id}
                          onClick={() => {
                            setActiveGift(gift);
                            handleSendGift(gift);
                          }}
                          className="flex flex-col items-center p-2 rounded-xl bg-slate-900/80 hover:bg-purple-900/40 border border-slate-800 hover:border-pink-500/50 transition-all cursor-pointer group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{gift.icon}</span>
                          <span className="text-[10px] font-bold text-white truncate max-w-[65px] mt-1">{gift.name}</span>
                          <span className="text-[9px] font-extrabold text-amber-400 flex items-center gap-0.5">
                            <Coins className="w-2.5 h-2.5" />
                            {gift.coinsCost}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#0d121e] border-t border-slate-800 flex items-center gap-2">
                {isViewerMuted ? (
                  <div className="flex-1 bg-red-950/40 border border-red-500/30 rounded-xl px-3 py-2 text-[11px] text-red-300 font-bold flex items-center gap-1.5">
                    <VolumeX className="w-3.5 h-3.5 shrink-0" />
                    <span>You are muted by the host. You can only watch the live broadcast.</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isMyOwnStream ? 'Send message to your viewers...' : 'Send message to stream...'}
                      className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer transition-transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </form>
            </>
          )}

          {/* ================= TAB 2: ROOM MODERATION LIST ================= */}
          {chatTab === 'moderation' && isHostOrAdmin && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 mb-1">
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Muted Viewers ({Object.keys(mutedUsers).length})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mb-2">Can watch the stream, but cannot write in chat.</p>

                {Object.keys(mutedUsers).length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900/60 text-slate-400 text-center">
                    No muted users in this room.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {(Object.values(mutedUsers) as ModeratedUser[]).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="font-bold text-slate-200">{u.name}</span>
                        <button
                          onClick={() => handleUnmuteUser(u.id, u.name)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Unmute
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 mb-1">
                  <Ban className="w-4 h-4 text-red-400" />
                  <span>Blocked Viewers ({Object.keys(blockedUsers).length})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mb-2">Completely banned from entering or watching this live broadcast.</p>

                {Object.keys(blockedUsers).length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900/60 text-slate-400 text-center">
                    No blocked users in this room.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {(Object.values(blockedUsers) as ModeratedUser[]).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="font-bold text-slate-200">{u.name}</span>
                        <button
                          onClick={() => handleUnblockUser(u.id, u.name)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
