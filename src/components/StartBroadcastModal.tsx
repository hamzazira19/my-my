import React, { useState, useRef, useEffect } from 'react';
import { X, Video, Sparkles, Trophy, Mic, ShieldCheck, RefreshCw } from 'lucide-react';
import { UserProfile, LiveStreamItem } from '../types';

interface StartBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onStreamCreated: (stream: LiveStreamItem) => void;
}

const CATEGORIES = ['Chat', 'Music', 'Crypto', 'Dance', 'Gaming', 'Lifestyle'];

export const StartBroadcastModal: React.FC<StartBroadcastModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStreamCreated,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Chat');
  const [goalTitle, setGoalTitle] = useState('Tonight Dragon Goal 🐉');
  const [goalTarget, setGoalTarget] = useState('25000');
  const [videoType, setVideoType] = useState<'camera' | 'feed'>('camera');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && videoType === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          setHasCameraPermission(true);
          if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = stream;
            previewVideoRef.current.play().catch(console.error);
          }
        })
        .catch((err) => {
          console.warn('Camera preview error:', err);
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, videoType]);

  if (!isOpen) return null;

  const handleStartBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

    try {
      const res = await fetch('/api/streams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || `${currentUser.name} Live Stream 🔴`,
          category,
          goalTitle: goalTitle.trim() || 'Goal for tonight',
          goalTarget: Number(goalTarget) || 20000,
          videoType,
        })
      });

      const newStream = await res.json();
      if (newStream && newStream.id) {
        onStreamCreated(newStream);
        onClose();
      }
    } catch (err) {
      console.error('Failed to start broadcast:', err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#0e1320] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-['Outfit']">Go Live on LiveVibe</h2>
            <p className="text-xs text-slate-400">Broadcast your stream to thousands of supporters</p>
          </div>
        </div>

        <form onSubmit={handleStartBroadcast} className="space-y-4 text-xs">
          {/* Live Camera Preview Box */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
            {videoType === 'camera' && hasCameraPermission ? (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Video className="w-8 h-8 text-pink-500 mb-2" />
                <p className="font-bold text-white">Live Camera Preview Ready</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {hasCameraPermission === false
                    ? 'Camera permission not granted; using interactive virtual avatar mode'
                    : 'Your video feed will go live when you click Start'}
                </p>
              </div>
            )}

            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-black uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              PREVIEW
            </div>
          </div>

          {/* Stream Title */}
          <div>
            <label className="block font-extrabold uppercase text-slate-300 mb-1">
              Stream Title & Topic
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VIP Hangout & Song Requests 🎸 Send gifts to unlock!"
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-extrabold uppercase text-slate-300 mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    category === cat
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Goal Setting */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold uppercase text-slate-300 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Dragon Hunter 🐉"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-extrabold uppercase text-slate-300 mb-1">
                Target Coins
              </label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="25000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isStarting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-red-950/40 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 mt-2"
          >
            {isStarting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Launching Your Live Room...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Start Live Broadcast Now 🔴</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
