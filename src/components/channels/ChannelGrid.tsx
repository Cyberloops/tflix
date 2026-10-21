import React, { useState, useEffect } from 'react';
import { Channel } from '../../types';
import { ChannelCard } from './ChannelCard';
import { Search, ChevronDown, Layers, Sparkles } from 'lucide-react';

interface ChannelGridProps {
  channels: (Channel & { watchedAt?: number })[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
  emptyMessage?: string;
  emptySubtext?: string;
  initialPageSize?: number;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  isFavorite,
  onToggleFavorite,
  onDeleteChannel,
  emptyMessage = 'No live channels found',
  emptySubtext = 'Try selecting another country, language, category, or checking your search query.',
  initialPageSize = 48,
}) => {
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  // Reset visible count when channel list significantly changes
  useEffect(() => {
    setVisibleCount(initialPageSize);
  }, [channels.length, initialPageSize]);

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 my-6">
        <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-500 mb-4">
          <Search className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-neutral-200">{emptyMessage}</h3>
        <p className="text-xs text-neutral-500 max-w-sm mt-1">{emptySubtext}</p>
      </div>
    );
  }

  const displayedChannels = channels.slice(0, visibleCount);
  const hasMore = visibleCount < channels.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 48, channels.length));
  };

  const handleShowAll = () => {
    setVisibleCount(channels.length);
  };

  return (
    <div className="space-y-6">
      {/* Channel Count & Status Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-red-500" />
            Showing {displayedChannels.length.toLocaleString()} of {channels.length.toLocaleString()} streams
          </span>
        </div>
        {hasMore && (
          <span className="text-neutral-500 font-mono hidden sm:inline">
            {(channels.length - visibleCount).toLocaleString()} more available
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isFavorite={isFavorite(channel.id)}
            onToggleFavorite={onToggleFavorite}
            onDeleteChannel={onDeleteChannel}
            watchedAt={channel.watchedAt}
          />
        ))}
      </div>

      {/* Load More Controls */}
      {hasMore && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 pb-2">
          <button
            onClick={handleLoadMore}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-red-600/50 text-neutral-200 hover:text-white text-sm font-semibold transition-all shadow-lg active:scale-95"
          >
            <span>Load More Streams (+48)</span>
            <ChevronDown className="w-4 h-4 text-red-500" />
          </button>
          
          {channels.length - visibleCount > 48 && (
            <button
              onClick={handleShowAll}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              <span>Show All {channels.length.toLocaleString()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
