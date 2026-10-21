import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Channel } from '../types';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { 
  Radio, 
  ArrowLeft, 
  Heart, 
  Tv, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Flame, 
  Sparkles, 
  ListFilter,
  Layers,
  ChevronRight,
  Globe
} from 'lucide-react';

interface WatchPageProps {
  channels: Channel[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  recordWatch: (id: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  channels,
  isFavorite,
  onToggleFavorite,
  recordWatch,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [navMode, setNavMode] = useState<'category' | 'country' | 'all'>('category');

  const currentChannelIndex = useMemo(() => {
    return channels.findIndex(c => c.id === id);
  }, [channels, id]);

  const channel = currentChannelIndex !== -1 ? channels[currentChannelIndex] : channels[0];

  // Category-wise channel pool
  const categoryChannels = useMemo(() => {
    if (!channel) return [];
    return channels.filter(c => c.category === channel.category);
  }, [channels, channel]);

  const currentCategoryIndex = useMemo(() => {
    if (!channel || categoryChannels.length === 0) return 0;
    const idx = categoryChannels.findIndex(c => c.id === channel.id);
    return idx !== -1 ? idx : 0;
  }, [categoryChannels, channel]);

  // Country-wise channel pool
  const countryChannels = useMemo(() => {
    if (!channel) return [];
    const country = channel.country || 'International';
    return channels.filter(c => (c.country || 'International') === country);
  }, [channels, channel]);

  const currentCountryIndex = useMemo(() => {
    if (!channel || countryChannels.length === 0) return 0;
    const idx = countryChannels.findIndex(c => c.id === channel.id);
    return idx !== -1 ? idx : 0;
  }, [countryChannels, channel]);

  useEffect(() => {
    if (channel) {
      recordWatch(channel.id);
    }
  }, [channel, recordWatch]);

  if (!channel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Channel Not Found</h2>
        <p className="text-sm text-neutral-400 mt-2">The selected channel does not exist in the TFLIX database.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Channels</span>
        </Link>
      </div>
    );
  }

  // Next / Previous Channel Navigation
  const handlePrevChannel = () => {
    if (navMode === 'category') {
      if (categoryChannels.length <= 1) return;
      const prevIdx = (currentCategoryIndex - 1 + categoryChannels.length) % categoryChannels.length;
      navigate(`/watch/${categoryChannels[prevIdx].id}`);
    } else if (navMode === 'country') {
      if (countryChannels.length <= 1) return;
      const prevIdx = (currentCountryIndex - 1 + countryChannels.length) % countryChannels.length;
      navigate(`/watch/${countryChannels[prevIdx].id}`);
    } else {
      if (channels.length <= 1) return;
      const prevIdx = (currentChannelIndex - 1 + channels.length) % channels.length;
      navigate(`/watch/${channels[prevIdx].id}`);
    }
  };

  const handleNextChannel = () => {
    if (navMode === 'category') {
      if (categoryChannels.length <= 1) return;
      const nextIdx = (currentCategoryIndex + 1) % categoryChannels.length;
      navigate(`/watch/${categoryChannels[nextIdx].id}`);
    } else if (navMode === 'country') {
      if (countryChannels.length <= 1) return;
      const nextIdx = (currentCountryIndex + 1) % countryChannels.length;
      navigate(`/watch/${countryChannels[nextIdx].id}`);
    } else {
      if (channels.length <= 1) return;
      const nextIdx = (currentChannelIndex + 1) % channels.length;
      navigate(`/watch/${channels[nextIdx].id}`);
    }
  };

  const handleSelectChannel = (channelId: string) => {
    navigate(`/watch/${channelId}`);
  };

  // Other channels in current category rail
  const otherCategoryChannels = categoryChannels.filter(c => c.id !== channel.id);

  // Active navigation pool details for player
  const activeNavPool = navMode === 'category' 
    ? {
        current: currentCategoryIndex + 1,
        total: categoryChannels.length,
        categoryName: `${channel.category} (Category)`,
        categoryChannels: categoryChannels,
      }
    : navMode === 'country'
    ? {
        current: currentCountryIndex + 1,
        total: countryChannels.length,
        categoryName: `${channel.country || 'International'} (Country)`,
        categoryChannels: countryChannels,
      }
    : {
        current: currentChannelIndex + 1,
        total: channels.length,
        categoryName: 'All Channels',
        categoryChannels: channels.slice(0, 50),
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      {/* Top back navigation & Category Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>Back to TFLIX Home</span>
        </Link>

        {/* Navigation Mode Pill (Category Wise vs Country Wise vs All) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#0e111a] border border-neutral-800 rounded-xl text-xs">
            <button
              onClick={() => setNavMode('category')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                navMode === 'category'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Next by Category</span>
            </button>

            <button
              onClick={() => setNavMode('country')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                navMode === 'country'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>By Country</span>
            </button>

            <button
              onClick={() => setNavMode('all')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                navMode === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({channels.length.toLocaleString()})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums">
            <span className="text-red-500 font-bold">TFLIX</span>
            <span>·</span>
            <span>
              {navMode === 'category' ? `${channel.category}: ${currentCategoryIndex + 1}/${categoryChannels.length}` :
               navMode === 'country' ? `${channel.country || 'Global'}: ${currentCountryIndex + 1}/${countryChannels.length}` :
               `Stream ${currentChannelIndex + 1}/${channels.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Video Player + Side Category Channel Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Video Player Area (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            key={channel.id}
            channel={channel}
            isFavorite={isFavorite(channel.id)}
            onToggleFavorite={onToggleFavorite}
            onPrevChannel={handlePrevChannel}
            onNextChannel={handleNextChannel}
            categoryInfo={activeNavPool}
            onSelectChannel={handleSelectChannel}
          />

          {/* Broadcast Information & Guide */}
          <div className="bg-[#0d0f15] border border-neutral-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#13151f] border border-neutral-800/80 flex items-center justify-center overflow-hidden shrink-0 p-1 shadow-md shadow-black/40">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/api/logo-proxy')) {
                          target.src = `/api/logo-proxy?url=${encodeURIComponent(channel.logo)}&name=${encodeURIComponent(channel.name)}`;
                        }
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Tv className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-white font-['Outfit']">
                      {channel.name}
                    </h1>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>TFLIX Verified</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-neutral-300 font-semibold">
                      <Globe className="w-3 h-3 text-red-400" />
                      {channel.country || 'International'}
                    </span>
                    <span>·</span>
                    <span className="text-red-400 font-bold">{channel.language}</span>
                    <span>·</span>
                    <span className="text-white font-medium">{channel.category}</span>
                    {channel.quality && (
                      <>
                        <span>·</span>
                        <span className="text-neutral-400 uppercase font-mono text-[10px] bg-neutral-900 px-1 rounded">{channel.quality}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-emerald-400 font-mono">Channel #{currentCategoryIndex + 1}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => onToggleFavorite(channel.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                    isFavorite(channel.id)
                      ? 'bg-red-600/20 text-red-400 border-red-500/50'
                      : 'bg-[#13151f] text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(channel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isFavorite(channel.id) ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>
            </div>

            {/* EPG / Current & Next Program with Live Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-neutral-900/60 rounded-2xl border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between text-red-500 font-bold text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>NOW AIRING LIVE</span>
                  </div>
                  <span className="text-neutral-400 font-mono">{channel.programTime || '24/7 Live'}</span>
                </div>
                <div className="text-sm font-bold text-white line-clamp-1">
                  {channel.currentProgram || `${channel.name} Prime Live Broadcast`}
                </div>
                {/* Simulated OTT live playback timeline */}
                <div className="space-y-1">
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-amber-500 h-full w-[68%] rounded-full animate-pulse" />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Live broadcast active</span>
                    <span>1080p 60fps adaptive</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-900/40 rounded-2xl border border-neutral-800/60 space-y-2">
                <div className="flex items-center gap-1.5 text-neutral-400 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>UPCOMING NEXT</span>
                </div>
                <div className="text-sm font-semibold text-neutral-200 line-clamp-1">
                  {channel.nextProgram || 'Upcoming Prime Time Show'}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Scheduled broadcast after current transmission concludes.
                </p>
              </div>
            </div>

            {/* Description & Metadata */}
            <p className="text-xs text-neutral-400 leading-relaxed">
              {channel.description || `Official high-definition live television feed for ${channel.name} broadcasting on the TFLIX network. Powered by cybertech by cyberloops.`}
            </p>
          </div>
        </div>

        {/* Right Category Channels Rail */}
        <div className="space-y-4">
          <div className="bg-[#0d0f15] border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-red-500" />
                  <span>More in {channel.category}</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Next channel clicks cycle within this category
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40 text-[10px] font-bold font-mono">
                {categoryChannels.length} feeds
              </span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {categoryChannels.map((c, index) => {
                const isPlaying = c.id === channel.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChannel(c.id)}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all group ${
                      isPlaying
                        ? 'bg-red-600/15 border border-red-500/50 text-white shadow-md'
                        : 'bg-neutral-900/40 hover:bg-neutral-800/80 border border-neutral-800/60 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="text-[11px] font-mono text-neutral-500 w-5 shrink-0 text-center">
                        {isPlaying ? <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse inline" /> : index + 1}
                      </div>
                      
                      <div className="overflow-hidden">
                        <div className={`text-xs font-bold truncate ${isPlaying ? 'text-red-400' : 'group-hover:text-white'}`}>
                          {c.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate flex items-center gap-1">
                          <span>{c.country || 'Global'}</span>
                          <span>·</span>
                          <span>{c.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      {isPlaying && (
                        <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                          Playing
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
