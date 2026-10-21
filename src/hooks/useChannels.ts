import { useState, useEffect, useMemo, useCallback } from 'react';
import { Channel, Category, Language, Country, CreateChannelPayload } from '../types';
import { api, DbStatusInfo } from '../services/api';
import { storage } from '../services/storage';
import { INITIAL_CHANNELS } from '../data/channels';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    const custom = storage.getCustomChannels();
    return [...custom, ...INITIAL_CHANNELS];
  });
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => storage.getFavorites());
  const [recentItems, setRecentItems] = useState(() => storage.getRecentWatched());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadChannels = useCallback(async () => {
    try {
      const [loadedChannels, loadedFavs, loadedHistory, status] = await Promise.all([
        api.getChannels(),
        api.getFavorites(),
        api.getWatchHistory(),
        api.getDbStatus(),
      ]);
      if (loadedChannels && loadedChannels.length > 0) {
        setChannels(loadedChannels);
      }
      if (loadedFavs) setFavoriteIds(loadedFavs);
      if (loadedHistory) setRecentItems(loadedHistory);
      if (status) setDbStatus(status);
    } catch (err) {
      console.warn('Channel reload error:', err);
    }
  }, []);

  // Sync with SQLite on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [loadedChannels, loadedFavs, loadedHistory, status] = await Promise.all([
          api.getChannels(),
          api.getFavorites(),
          api.getWatchHistory(),
          api.getDbStatus(),
        ]);
        if (isMounted) {
          if (loadedChannels && loadedChannels.length > 0) {
            setChannels(loadedChannels);
          }
          if (loadedFavs) setFavoriteIds(loadedFavs);
          if (loadedHistory) setRecentItems(loadedHistory);
          if (status) setDbStatus(status);
        }
      } catch (err) {
        console.warn('Initial data load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically compute available countries with counts
  const availableCountries = useMemo(() => {
    const map = new Map<string, { name: string; code: string; count: number }>();
    channels.forEach(ch => {
      const c = (ch.country || 'International').trim();
      const code = (ch.countryCode || 'INT').toUpperCase().trim();
      if (!map.has(c)) {
        map.set(c, { name: c, code, count: 0 });
      }
      map.get(c)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [channels]);

  // Dynamically compute available categories with counts
  const availableCategories = useMemo(() => {
    const map = new Map<string, number>();
    channels.forEach(ch => {
      const cat = (ch.category || 'General').trim();
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [channels]);

  // Dynamically compute available languages with counts
  const availableLanguages = useMemo(() => {
    const map = new Map<string, number>();
    channels.forEach(ch => {
      const lang = (ch.language || 'English').trim();
      map.set(lang, (map.get(lang) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [channels]);

  // Favorite channels list
  const favoriteChannels = useMemo(() => {
    return channels.filter(c => favoriteIds.includes(c.id));
  }, [channels, favoriteIds]);

  // Recently watched channels list (ordered by timestamp)
  const recentChannels = useMemo(() => {
    return recentItems
      .map(item => {
        const ch = channels.find(c => c.id === item.channelId);
        return ch ? { ...ch, watchedAt: item.timestamp } : null;
      })
      .filter((item): item is Channel & { watchedAt: number } => Boolean(item));
  }, [channels, recentItems]);

  // Featured channels
  const featuredChannels = useMemo(() => {
    return channels.filter(c => c.featured);
  }, [channels]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      // Country filter
      if (selectedCountry !== 'All') {
        const chCountry = (channel.country || '').toLowerCase();
        const chCode = (channel.countryCode || '').toLowerCase();
        const target = selectedCountry.toLowerCase();
        if (chCountry !== target && chCode !== target) {
          return false;
        }
      }
      // Language filter
      if (selectedLanguage !== 'All') {
        const chLang = (channel.language || '').toLowerCase();
        const targetLang = selectedLanguage.toLowerCase();
        if (chLang !== targetLang) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'All') {
        const chCat = (channel.category || '').toLowerCase();
        const targetCat = selectedCategory.toLowerCase();
        if (chCat !== targetCat) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = channel.name.toLowerCase().includes(query);
        const matchesCategory = channel.category?.toLowerCase().includes(query);
        const matchesLanguage = channel.language?.toLowerCase().includes(query);
        const matchesCountry = channel.country?.toLowerCase().includes(query);
        const matchesDescription = channel.description?.toLowerCase().includes(query);
        const matchesProgram = channel.currentProgram?.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesLanguage || matchesCountry || matchesDescription || matchesProgram;
      }
      return true;
    });
  }, [channels, selectedCountry, selectedLanguage, selectedCategory, searchQuery]);

  const toggleFavorite = useCallback(async (channelId: string) => {
    setFavoriteIds(prev => 
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
    const updated = await api.toggleFavorite(channelId);
    setFavoriteIds(updated);
  }, []);

  const isFavorite = useCallback((channelId: string) => {
    return favoriteIds.includes(channelId);
  }, [favoriteIds]);

  const recordWatch = useCallback(async (channelId: string) => {
    const updated = await api.recordWatch(channelId);
    setRecentItems(updated);
  }, []);

  const clearRecent = useCallback(async () => {
    await api.clearWatchHistory();
    setRecentItems([]);
  }, []);

  const addChannel = useCallback(async (channel: Channel | CreateChannelPayload) => {
    const updatedChannels = await api.addChannel(channel);
    setChannels(updatedChannels);
    api.getDbStatus().then(status => {
      if (status) setDbStatus(status);
    });
  }, []);

  const removeChannel = useCallback(async (channelId: string) => {
    const updatedChannels = await api.deleteChannel(channelId);
    setChannels(updatedChannels);
    api.getDbStatus().then(status => {
      if (status) setDbStatus(status);
    });
  }, []);

  const resetChannels = useCallback(async () => {
    const defaults = await api.resetChannels();
    setChannels(defaults);
  }, []);

  const getChannelById = useCallback((id: string): Channel | undefined => {
    return channels.find(c => c.id === id);
  }, [channels]);

  return {
    allChannels: channels,
    filteredChannels,
    featuredChannels,
    favoriteChannels,
    recentChannels,
    favoriteIds,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    selectedLanguage,
    setSelectedLanguage,
    selectedCategory,
    setSelectedCategory,
    availableCountries,
    availableCategories,
    availableLanguages,
    toggleFavorite,
    isFavorite,
    recordWatch,
    clearRecent,
    addChannel,
    removeChannel,
    resetChannels,
    reloadChannels,
    getChannelById,
    dbStatus,
    isLoading
  };
}
