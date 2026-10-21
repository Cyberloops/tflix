import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Radio, Trash2, Tv, Globe } from 'lucide-react';
import { Channel } from '../../types';

interface ChannelCardProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
  watchedAt?: number;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isFavorite,
  onToggleFavorite,
  onDeleteChannel,
  watchedAt,
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(channel.logo || '');

  const handleImageError = () => {
    if (channel.logo && !imgSrc.includes('/api/logo-proxy')) {
      setImgSrc(`/api/logo-proxy?url=${encodeURIComponent(channel.logo)}&name=${encodeURIComponent(channel.name)}`);
    } else {
      setImgError(true);
    }
  };

  const handleCardClick = () => {
    navigate(`/watch/${channel.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteChannel && confirm(`Remove channel "${channel.name}" from TFLIX?`)) {
      onDeleteChannel(channel.id);
    }
  };

  const initials = channel.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const countryName = channel.country || 'International';
  const quality = channel.quality || 'HD';

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-[#0d0f15] hover:bg-[#13151f] border border-neutral-800/80 hover:border-red-600/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/20 hover:-translate-y-1.5"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Top Media Thumbnail Area */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-[#12141c] via-[#0d0f15] to-[#07080c] flex items-center justify-center p-4 overflow-hidden border-b border-neutral-800/50">
        {/* Subtle radial ambient glow behind logo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_70%)] pointer-events-none" />

        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={channel.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="max-h-20 max-w-[80%] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/25 to-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 font-black text-lg mb-1 shadow-lg shadow-red-950/40 font-['Outfit']">
              {initials || <Tv className="w-5 h-5" />}
            </div>
            <span className="text-xs font-bold text-neutral-300 text-center line-clamp-1">{channel.name}</span>
          </div>
        )}

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f15] via-transparent to-black/50 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/95 backdrop-blur-sm text-[10px] font-black text-white tracking-widest uppercase shadow-md shadow-red-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>
          {quality && (
            <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-bold text-neutral-300 border border-neutral-700/60 uppercase">
              {quality}
            </div>
          )}
        </div>

        {/* Action icons (Top Right) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {channel.isCustom && onDeleteChannel && (
            <button
              onClick={handleDeleteClick}
              className="min-h-[30px] min-w-[30px] p-1.5 rounded-full bg-black/70 hover:bg-red-900/90 text-neutral-300 hover:text-white backdrop-blur-md transition-colors flex items-center justify-center"
              title="Delete from SQLite database"
              aria-label="Delete channel"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleFavoriteClick}
            className={`min-h-[30px] min-w-[30px] p-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md transition-all active:scale-90 flex items-center justify-center ${
              isFavorite ? 'text-red-500' : 'text-neutral-300 hover:text-red-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Play Icon Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-neutral-100 group-hover:text-red-500 transition-colors line-clamp-1 font-['Outfit']">
              {channel.name}
            </h3>
          </div>

          {/* Country & Language & Category pills/metadata */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-neutral-300 font-medium">
              <Globe className="w-3 h-3 text-red-500/80" />
              {countryName}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-red-400 font-medium">{channel.language}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="truncate text-neutral-400">{channel.category}</span>
          </div>
        </div>

        {/* Current Program info */}
        {channel.currentProgram && (
          <div className="pt-2 border-t border-neutral-800/60 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium line-clamp-1">
              <Radio className="w-3 h-3 text-red-500 shrink-0" />
              <span className="truncate">{channel.currentProgram}</span>
            </div>
            {channel.programTime && (
              <p className="text-[11px] text-neutral-500 mt-0.5 font-mono tabular-nums">
                {channel.programTime}
              </p>
            )}
          </div>
        )}

        {/* Watched timestamp if recent */}
        {watchedAt && (
          <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
            Watched {formatTimeAgo(watchedAt)}
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
