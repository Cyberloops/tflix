import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Channel } from '../../types';
import { ChannelCard } from './ChannelCard';

interface ChannelRowProps {
  title: string;
  subtitle?: string;
  channels: Channel[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
}

export const ChannelRow: React.FC<ChannelRowProps> = ({
  title,
  subtitle,
  channels,
  isFavorite,
  onToggleFavorite,
  onDeleteChannel,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (channels.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative py-3 group/row">
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white font-['Outfit']">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Desktop Carousel Navigation Controls */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-80 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="w-[240px] sm:w-[270px] md:w-[290px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ChannelCard
              channel={channel}
              isFavorite={isFavorite(channel.id)}
              onToggleFavorite={onToggleFavorite}
              onDeleteChannel={onDeleteChannel}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
