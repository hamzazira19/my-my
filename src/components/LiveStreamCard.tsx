import React from 'react';
import { Eye, Swords, Sparkles } from 'lucide-react';
import { LiveStreamItem } from '../types';

interface LiveStreamCardProps {
  stream: LiveStreamItem;
  onJoinStream: (stream: LiveStreamItem) => void;
  onOpenProfile?: (userId: string) => void;
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream, onJoinStream, onOpenProfile }) => {
  return (
    <div
      onClick={() => onJoinStream(stream)}
      className="group relative aspect-[3/4.4] sm:aspect-[3/4.2] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 hover:border-pink-500/80 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-900/30 hover:-translate-y-1 cursor-pointer select-none"
      id={`live-profile-card-${stream.id}`}
    >
      {/* Profile Live Photo */}
      <img
        src={stream.streamerAvatar || stream.streamThumbnail}
        alt={stream.streamerName}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
        loading="lazy"
      />

      {/* Cinematic Edge Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      {/* Top Header Overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        {/* Live Viewer Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[12px] font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <Eye className="w-3.5 h-3.5 text-white/90" />
          <span>{stream.viewerCount}</span>
        </div>

        {/* VS Battle or Gift Badge */}
        {stream.isVsBattle ? (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-white font-black text-[11px] shadow-lg tracking-wider border border-white/20 uppercase">
            <Swords className="w-3 h-3" />
            <span>VS</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/80 backdrop-blur-md text-slate-950 font-extrabold text-[11px] shadow-md">
            <Sparkles className="w-3 h-3" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      {/* Bottom Profile Details Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar with glowing ring - clickable to open profile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile?.(stream.streamerId);
            }}
            className="relative shrink-0 group/avatar cursor-pointer hover:scale-110 transition-transform"
            title="Voir le profil"
          >
            <img
              src={stream.streamerAvatar}
              alt={stream.streamerName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-500 shadow-md shadow-pink-950 group-hover/avatar:ring-white"
              referrerPolicy="no-referrer"
            />
            {stream.countryFlag && (
              <span className="absolute -bottom-1 -right-1 text-xs leading-none" title={stream.countryName}>
                {stream.countryFlag}
              </span>
            )}
          </button>

          {/* Model Name & Diamond Count */}
          <div 
            className="min-w-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile?.(stream.streamerId);
            }}
          >
            <h3 className="text-[13px] font-bold text-white leading-tight truncate drop-shadow-md group-hover:text-pink-300 transition-colors">
              {stream.streamerName}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 drop-shadow">
              <span className="text-pink-400 font-bold">💎</span>
              <span>{stream.diamondsFormatted || `${Math.round(stream.totalGiftsCoins / 1000)}K`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
