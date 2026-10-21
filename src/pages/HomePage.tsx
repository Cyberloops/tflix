import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Radio, Sparkles, Database, Film, Tv, Music, Flame, Award, Smile, Sun, Globe, ShieldCheck, Trophy, Layers } from 'lucide-react';
import { Channel } from '../types';
import { ChannelRow } from '../components/channels/ChannelRow';
import { ChannelGrid } from '../components/channels/ChannelGrid';
import { DbStatusInfo } from '../services/api';

interface HomePageProps {
  channels: Channel[];
  featuredChannels: Channel[];
  favoriteChannels: Channel[];
  recentChannels: (Channel & { watchedAt: number })[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
  searchQuery: string;
  filteredChannels: Channel[];
  dbStatus?: DbStatusInfo | null;
  onOpenDbModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  channels,
  featuredChannels,
  favoriteChannels,
  recentChannels,
  isFavorite,
  onToggleFavorite,
  onDeleteChannel,
  searchQuery,
  filteredChannels,
  dbStatus,
  onOpenDbModal,
}) => {
  const navigate = useNavigate();
  const [quickFilter, setQuickFilter] = useState<'All' | 'India' | 'USA' | 'UK' | 'Tamil' | 'Malayalam' | 'Sports' | 'Movies' | 'News' | 'Music' | 'Kids' | 'Devotional'>('All');

  const heroChannel = featuredChannels[0] || channels[0];

  // Specific filtered subsets for OTT rows
  const indianChannels = channels.filter(c => c.country === 'India' || c.countryCode === 'IN');
  const usaChannels = channels.filter(c => c.country === 'United States' || c.countryCode === 'US');
  const ukChannels = channels.filter(c => c.country === 'United Kingdom' || c.countryCode === 'GB' || c.countryCode === 'UK');
  
  const tamilChannels = channels.filter(c => c.language === 'Tamil');
  const malayalamChannels = channels.filter(c => c.language === 'Malayalam');
  const sportsChannels = channels.filter(c => c.category === 'Sports' || c.category.includes('Sports'));
  const movieChannels = channels.filter(c => c.category.includes('Movies') || c.category === 'Movies');
  const newsChannels = channels.filter(c => c.category === 'News' || c.category.includes('News'));
  const musicChannels = channels.filter(c => c.category === 'Music' || c.category.includes('Music'));
  const kidsChannels = channels.filter(c => c.category === 'Kids' || c.category.includes('Animation'));
  const devotionalChannels = channels.filter(c => c.category === 'Devotional' || c.category === 'Religious');
  const customChannels = channels.filter(c => c.isCustom);

  // Top 10 Trending Channels (JioHotstar & Netflix OTT style)
  const top10Trending = channels.slice(0, 10);

  // If search query is active
  if (searchQuery.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-black text-white font-['Outfit']">
            Search Results in TFLIX for "{searchQuery}"
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Found {filteredChannels.length.toLocaleString()} channel{filteredChannels.length === 1 ? '' : 's'} across global catalog
          </p>
        </div>
        <ChannelGrid
          channels={filteredChannels}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
          emptyMessage={`No channels matching "${searchQuery}"`}
          emptySubtext="Try checking for country (India, USA, UK), language (Tamil, Hindi, English), or genre."
        />
      </div>
    );
  }

  // If a quick category/country filter is active (not 'All')
  if (quickFilter !== 'All') {
    let subset: Channel[] = [];
    if (quickFilter === 'India') subset = indianChannels;
    else if (quickFilter === 'USA') subset = usaChannels;
    else if (quickFilter === 'UK') subset = ukChannels;
    else if (quickFilter === 'Tamil') subset = tamilChannels;
    else if (quickFilter === 'Malayalam') subset = malayalamChannels;
    else if (quickFilter === 'Sports') subset = sportsChannels;
    else if (quickFilter === 'Movies') subset = movieChannels;
    else if (quickFilter === 'News') subset = newsChannels;
    else if (quickFilter === 'Music') subset = musicChannels;
    else if (quickFilter === 'Kids') subset = kidsChannels;
    else if (quickFilter === 'Devotional') subset = devotionalChannels;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-black text-white font-['Outfit']">
              {quickFilter} Live Streams
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Showing {subset.length.toLocaleString()} live broadcast{subset.length === 1 ? '' : 's'} in TFLIX
            </p>
          </div>
          <button
            onClick={() => setQuickFilter('All')}
            className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-[#0d0f15] hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors"
          >
            ← View All Rows
          </button>
        </div>

        <ChannelGrid
          channels={subset}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-8">
      
      {/* Cinematic Hero Featured Section */}
      {heroChannel && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a0a0f] via-[#10131e] to-[#07080d] border border-neutral-800/80 shadow-2xl">
          <div className="relative aspect-[21/9] min-h-[360px] md:min-h-[420px] w-full overflow-hidden">
            <img
              src="/src/assets/images/hero_ott_cinematic_1792308127625.jpg"
              alt={heroChannel.name}
              className="w-full h-full object-cover object-center transform scale-105"
            />
            {/* Scrim gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/85 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-black/40 z-10" />

            {/* Hero Information */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 md:p-12 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-[11px] font-black text-white tracking-widest uppercase shadow-lg shadow-red-600/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>TFLIX EXCLUSIVE</span>
                </span>
                
                <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>cybertech by cyberloops</span>
                </span>

                <span className="text-xs font-semibold text-neutral-300">
                  {heroChannel.country || 'Global'} · {heroChannel.language} · {heroChannel.category}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
                {heroChannel.name}
              </h1>

              {heroChannel.currentProgram && (
                <div className="mt-3 flex items-center gap-2 text-sm text-neutral-200">
                  <Radio className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                  <span className="font-semibold">{heroChannel.currentProgram}</span>
                  {heroChannel.programTime && (
                    <span className="text-xs text-neutral-400 font-mono">
                      ({heroChannel.programTime})
                    </span>
                  )}
                </div>
              )}

              <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                {heroChannel.description || 'Watch premier live television, family serials, cinema shows, and cultural specials broadcast 24/7 in high definition.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/watch/${heroChannel.id}`)}
                  className="px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center gap-2.5 transition-all shadow-xl shadow-red-600/40 active:scale-95 font-['Outfit'] tracking-wide"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Stream Live</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(heroChannel.id)}
                  className={`px-4 py-3 rounded-2xl border border-neutral-700/80 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 text-sm font-semibold flex items-center gap-2 transition-colors ${
                    isFavorite(heroChannel.id) ? 'text-red-400 border-red-500/40' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(heroChannel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                <button
                  onClick={() => navigate('/categories')}
                  className="px-4 py-3 rounded-2xl border border-neutral-800 bg-[#0d0f15]/90 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Globe className="w-4 h-4 text-red-400" />
                  <span className="font-mono">{channels.length.toLocaleString()} Live Feeds (180+ Countries)</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-black uppercase text-neutral-500 tracking-wider mr-1 shrink-0 font-['Outfit']">
          Quick Explore:
        </span>
        {[
          { key: 'All', label: 'All Feeds' },
          { key: 'India', label: `India (${indianChannels.length.toLocaleString()})` },
          { key: 'USA', label: `USA (${usaChannels.length.toLocaleString()})` },
          { key: 'UK', label: `UK (${ukChannels.length.toLocaleString()})` },
          { key: 'Tamil', label: `Tamil (${tamilChannels.length})` },
          { key: 'Malayalam', label: `Malayalam (${malayalamChannels.length})` },
          { key: 'Sports', label: `Sports (${sportsChannels.length.toLocaleString()})` },
          { key: 'Movies', label: `Cinema (${movieChannels.length.toLocaleString()})` },
          { key: 'News', label: `News (${newsChannels.length.toLocaleString()})` },
          { key: 'Music', label: `Music (${musicChannels.length.toLocaleString()})` },
          { key: 'Kids', label: `Kids (${kidsChannels.length.toLocaleString()})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setQuickFilter(f.key as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              quickFilter === f.key
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-[#0d0f15] text-neutral-400 hover:text-white border border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Top 10 Trending Today Row */}
      <ChannelRow
        title="🔥 Top 10 Trending Live Channels Today"
        subtitle="Most watched live streams right now on TFLIX platform"
        channels={top10Trending}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onDeleteChannel={onDeleteChannel}
      />

      {/* Recently Watched Row */}
      {recentChannels.length > 0 && (
        <ChannelRow
          title="Continue Watching"
          subtitle="Resume your recently played live TV broadcasts"
          channels={recentChannels}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Favorites Row */}
      {favoriteChannels.length > 0 && (
        <ChannelRow
          title="Your Favorites"
          subtitle="Channels saved to your personal TFLIX collection"
          channels={favoriteChannels}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Popular Tamil Channels Row */}
      {tamilChannels.length > 0 && (
        <ChannelRow
          title="Popular Tamil Cinema & Television"
          subtitle="Suriya TV, Sun TV HD, Zee Tamil, Colors Tamil, Polimer, Thanthi, Raj TV & more"
          channels={tamilChannels}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Malayalam Live Channels Row */}
      {malayalamChannels.length > 0 && (
        <ChannelRow
          title="Malayalam Entertainment & Cinema"
          subtitle="Asianet, Surya TV, Mazhavil Manorama, Flowers TV, Kairali, Amrita"
          channels={malayalamChannels}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* United States Live Feeds */}
      {usaChannels.length > 0 && (
        <ChannelRow
          title="United States Major Broadcasts"
          subtitle="Top American national and regional news, entertainment, and sports networks"
          channels={usaChannels.slice(0, 20)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Global Sports Action */}
      {sportsChannels.length > 0 && (
        <ChannelRow
          title="World Sports & Major Leagues"
          subtitle="Live cricket, football, racing, athletic tournaments, and action sports"
          channels={sportsChannels.slice(0, 20)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Blockbuster Movies Row */}
      {movieChannels.length > 0 && (
        <ChannelRow
          title="Cinema & Blockbuster Movies"
          subtitle="Non-stop blockbuster movie channels from India, Hollywood, and international studios"
          channels={movieChannels.slice(0, 20)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* 24/7 News Row */}
      {newsChannels.length > 0 && (
        <ChannelRow
          title="24/7 National & Global News"
          subtitle="Aaj Tak, WION, India Today, NDTV, BBC, CNN, Sky News, and regional 24/7 bulletins"
          channels={newsChannels.slice(0, 20)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Music Channels Row */}
      {musicChannels.length > 0 && (
        <ChannelRow
          title="Non-Stop Music & Beats"
          subtitle="9XM, 9X Jalwa, 9X Tashan, B4U Music, MTV, YRF Music, PTC Music, and global music TV"
          channels={musicChannels.slice(0, 20)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}

      {/* Custom SQLite Channels */}
      {customChannels.length > 0 && (
        <ChannelRow
          title="Your Custom Streams (Stored in SQLite)"
          subtitle="Streams stored in data/tflix.sqlite with persistent multi-device sync"
          channels={customChannels}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
        />
      )}
    </div>
  );
};
