import React from 'react';
import { Channel } from '../types';
import { ChannelGrid } from '../components/channels/ChannelGrid';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FavoritesPageProps {
  favoriteChannels: Channel[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favoriteChannels,
  isFavorite,
  onToggleFavorite,
  onDeleteChannel,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-1 font-['Outfit']">
            <Heart className="w-3.5 h-3.5 fill-red-500" />
            <span>TFLIX Collection</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">
            Favorite Channels
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Persisted in SQLite database for quick 1-click access
          </p>
        </div>

        <div className="text-xs text-neutral-400 font-mono tabular-nums">
          {favoriteChannels.length} channel{favoriteChannels.length === 1 ? '' : 's'} saved
        </div>
      </div>

      <ChannelGrid
        channels={favoriteChannels}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onDeleteChannel={onDeleteChannel}
        emptyMessage="No favorite channels yet"
        emptySubtext="Click the heart icon on any channel card or in the player to save it here for fast one-tap viewing."
      />

      {favoriteChannels.length === 0 && (
        <div className="flex justify-center mt-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Channels</span>
          </Link>
        </div>
      )}
    </div>
  );
};
