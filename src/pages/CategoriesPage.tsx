import React, { useState, useMemo } from 'react';
import { Channel } from '../types';
import { ChannelGrid } from '../components/channels/ChannelGrid';
import { 
  Film, 
  Smile, 
  Tv, 
  Sparkles, 
  Filter, 
  Newspaper, 
  Music, 
  Trophy, 
  Gamepad2, 
  HeartHandshake, 
  Compass, 
  Globe, 
  Languages, 
  Search,
  BookOpen,
  Coffee,
  Car
} from 'lucide-react';

interface CategoriesPageProps {
  channels: Channel[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteChannel?: (id: string) => void;
}

const CATEGORY_ITEMS: {
  key: string;
  label: string;
  icon: any;
  description: string;
  poster?: string;
}[] = [
  {
    key: 'All',
    label: 'All Channels',
    icon: Sparkles,
    description: 'Explore the complete global catalog of 18,000+ live television feeds and cinema streams.',
  },
  {
    key: 'Entertainment',
    label: 'Entertainment',
    icon: Tv,
    description: 'Prime time serials, reality television shows, family dramas, and cultural specials broadcast live.',
    poster: '/src/assets/images/hero_ott_cinematic_1792308127625.jpg',
  },
  {
    key: 'Movies',
    label: 'Blockbuster Cinema',
    icon: Film,
    description: 'Non-stop Kollywood, Mollywood, Hollywood, Bollywood blockbusters, classics, and action hits.',
    poster: '/src/assets/images/tamil_cinema_poster_1792308128632.jpg',
  },
  {
    key: 'News',
    label: '24/7 Live News',
    icon: Newspaper,
    description: 'Real-time breaking news, international headlines, regional reports, and 24/7 bulletins.',
    poster: '/src/assets/images/hero_ott_cinematic_1792308127625.jpg',
  },
  {
    key: 'Sports',
    label: 'Sports & Action',
    icon: Trophy,
    description: 'Live cricket, football, racing, athletic tournaments, and major league matches.',
    poster: '/src/assets/images/hero_ott_cinematic_1792308127625.jpg',
  },
  {
    key: 'Music',
    label: 'Non-Stop Music',
    icon: Music,
    description: 'Chartbusters, regional Indian melodies, unplugged acoustics, EDM, and MTV-style music television.',
    poster: '/src/assets/images/comedy_festival_banner_1792308129794.jpg',
  },
  {
    key: 'Kids',
    label: 'Kids & Animation',
    icon: Gamepad2,
    description: 'Animated cartoon series, kids adventures, learning journeys, and animated cinema.',
  },
  {
    key: 'Comedy',
    label: 'Comedy Riot',
    icon: Smile,
    description: 'Hilarious comedy skits, legendary scene retrospectives, mimicry, and comedy festivals.',
    poster: '/src/assets/images/comedy_festival_banner_1792308129794.jpg',
  },
  {
    key: 'Documentary',
    label: 'Documentary & Wildlife',
    icon: Compass,
    description: 'Exploration, wildlife expeditions, scientific breakthroughs, historical features, and travel docs.',
  },
  {
    key: 'Religious',
    label: 'Spiritual & Devotional',
    icon: HeartHandshake,
    description: 'Sacred ceremonies, live prayers, temple broadcasts, discourses, and devotional music.',
  },
  {
    key: 'Education',
    label: 'Education & Science',
    icon: BookOpen,
    description: 'Knowledge broadcasts, academic lessons, scientific research, and university channels.',
  },
  {
    key: 'Lifestyle',
    label: 'Lifestyle & Cooking',
    icon: Coffee,
    description: 'Culinary shows, home design, travel guides, fashion trends, and health programming.',
  },
];

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  channels,
  isFavorite,
  onToggleFavorite,
  onDeleteChannel,
}) => {
  // Navigation Dimension: 'category' | 'country' | 'language'
  const [browseDimension, setBrowseDimension] = useState<'category' | 'country' | 'language'>('category');

  // Selected filters
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCountry, setActiveCountry] = useState<string>('All');
  const [activeLang, setActiveLang] = useState<string>('All');
  const [internalSearch, setInternalSearch] = useState<string>('');

  // Compute countries with counts
  const countryList = useMemo(() => {
    const map = new Map<string, number>();
    channels.forEach(c => {
      const cnt = (c.country || 'International').trim();
      map.set(cnt, (map.get(cnt) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [channels]);

  // Compute languages with counts
  const languageList = useMemo(() => {
    const map = new Map<string, number>();
    channels.forEach(c => {
      const l = (c.language || 'English').trim();
      map.set(l, (map.get(l) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [channels]);

  // Filter channels
  const filtered = useMemo(() => {
    return channels.filter(c => {
      if (activeCategory !== 'All') {
        const cat = (c.category || '').toLowerCase();
        const target = activeCategory.toLowerCase();
        if (!cat.includes(target) && cat !== target) return false;
      }
      if (activeCountry !== 'All') {
        const cnt = (c.country || '').toLowerCase();
        const code = (c.countryCode || '').toLowerCase();
        const target = activeCountry.toLowerCase();
        if (cnt !== target && code !== target) return false;
      }
      if (activeLang !== 'All') {
        const lang = (c.language || '').toLowerCase();
        const target = activeLang.toLowerCase();
        if (lang !== target) return false;
      }
      if (internalSearch.trim()) {
        const q = internalSearch.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCountry = c.country?.toLowerCase().includes(q);
        const matchCat = c.category?.toLowerCase().includes(q);
        const matchLang = c.language?.toLowerCase().includes(q);
        return matchName || matchCountry || matchCat || matchLang;
      }
      return true;
    });
  }, [channels, activeCategory, activeCountry, activeLang, internalSearch]);

  const activeDef = CATEGORY_ITEMS.find(d => d.key === activeCategory) || CATEGORY_ITEMS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-6">
      
      {/* Category / Dimension Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d0f17] via-[#141622] to-[#0d0f17] border border-neutral-800 p-6 md:p-8">
        {activeDef.poster && (
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <img
              src={activeDef.poster}
              alt={activeDef.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f17] via-[#0d0f17]/90 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-2 font-['Outfit']">
            <Filter className="w-3.5 h-3.5" />
            <span>TFLIX Global Catalog & Taxonomy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            {browseDimension === 'category' ? activeDef.label : browseDimension === 'country' ? `${activeCountry === 'All' ? 'Global Live Countries' : activeCountry + ' Live TV'}` : `${activeLang === 'All' ? 'Global Languages' : activeLang + ' Streams'}`}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
            {browseDimension === 'category' ? activeDef.description : `Browse verified live broadcast channels from across ${countryList.length} countries and ${languageList.length} languages.`}
          </p>
        </div>
      </div>

      {/* Main Browse Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0c13] p-2.5 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl">
          <button
            onClick={() => setBrowseDimension('category')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              browseDimension === 'category'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>By Category</span>
          </button>

          <button
            onClick={() => setBrowseDimension('country')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              browseDimension === 'country'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>By Country ({countryList.length})</span>
          </button>

          <button
            onClick={() => setBrowseDimension('language')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              browseDimension === 'language'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>By Language</span>
          </button>
        </div>

        {/* Quick Filter Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Search in this view..."
            className="w-full bg-[#121520] border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* SUB-BAR 1: CATEGORY BUTTONS */}
      {browseDimension === 'category' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_ITEMS.map((def) => {
            const isActive = activeCategory === def.key;
            const Icon = def.icon;
            const count = def.key === 'All' ? channels.length : channels.filter(c => (c.category || '').toLowerCase().includes(def.key.toLowerCase())).length;

            return (
              <button
                key={def.key}
                onClick={() => setActiveCategory(def.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                    : 'bg-[#0d0f15] hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{def.label}</span>
                <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-red-800 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* SUB-BAR 2: COUNTRY BUTTONS */}
      {browseDimension === 'country' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCountry('All')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all ${
                activeCountry === 'All'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'bg-[#0d0f15] hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
              }`}
            >
              All Countries ({channels.length.toLocaleString()})
            </button>

            {countryList.slice(0, 30).map(({ name, count }) => {
              const isActive = activeCountry === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveCountry(name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                      : 'bg-[#0d0f15] hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <Globe className="w-3 h-3 text-red-500/80" />
                  <span>{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-red-800 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
                    {count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-BAR 3: LANGUAGE BUTTONS */}
      {browseDimension === 'language' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveLang('All')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all ${
              activeLang === 'All'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'bg-[#0d0f15] hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            All Languages ({channels.length.toLocaleString()})
          </button>

          {languageList.slice(0, 25).map(({ name, count }) => {
            const isActive = activeLang === name;
            return (
              <button
                key={name}
                onClick={() => setActiveLang(name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                    : 'bg-[#0d0f15] hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <span>{name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-red-800 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Count & Channel Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-neutral-400">
            Found <span className="font-bold text-neutral-200 tabular-nums">{filtered.length.toLocaleString()}</span> live stream{filtered.length === 1 ? '' : 's'}
          </p>

          {(activeCategory !== 'All' || activeCountry !== 'All' || activeLang !== 'All' || internalSearch) && (
            <button
              onClick={() => {
                setActiveCategory('All');
                setActiveCountry('All');
                setActiveLang('All');
                setInternalSearch('');
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <ChannelGrid
          channels={filtered}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onDeleteChannel={onDeleteChannel}
          emptyMessage="No streams found matching the selected filters"
          emptySubtext="Try selecting another category, country, or language above."
        />
      </div>
    </div>
  );
};
