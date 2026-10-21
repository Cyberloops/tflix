import React from 'react';
import { Channel } from '../types';
import { ChannelGrid } from '../components/channels/ChannelGrid';
import { History, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentPageProps {
  recentChannels: (Channel & { watchedAt: number })[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onClearRecent: () => void;
  onDeleteChannel?: (id: string) => void;
}

export const RecentPage: React.FC<RecentPageProps> = ({
  recentChannels,
  isFavorite,
  onToggleFavorite,
  onClearRecent,
  onDeleteChannel,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-1 font-['Outfit']">
            <History className="w-3.5 h-3.5" />
            <span>TFLIX History</span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">
            Recently Watched
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Persisted in SQLite database — pick up where you left off
          </p>
        </div>

        {recentChannels.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear your entire watch history in SQLite?')) {
                onClearRecent();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-xl transition-colors self-start sm:self-auto font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <ChannelGrid
        channels={recentChannels}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onDeleteChannel={onDeleteChannel}
        emptyMessage="No watch history yet"
        emptySubtext="When you stream live TV on TFLIX, channels will appear here automatically."
      />

      {recentChannels.length === 0 && (
        <div className="flex justify-center mt-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Watching TFLIX</span>
          </Link>
        </div>
      )}
    </div>
  );
};
