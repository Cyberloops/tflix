import { Channel, WatchHistoryItem } from '../types';

const FAVORITES_KEY = 'tflix_favorites';
const RECENT_KEY = 'tflix_recent_watched';
const CUSTOM_CHANNELS_KEY = 'tflix_custom_channels';
const SESSION_TOKEN_KEY = 'tflix_session_token';
const USER_CODE_KEY = 'tflix_user_code';

export const storage = {
  // Session & Access Pass
  getSessionToken(): string | null {
    try {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setSessionToken(token: string): void {
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save session token', e);
    }
  },

  clearSessionToken(): void {
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(USER_CODE_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  },

  getUserCode(): string | null {
    try {
      return localStorage.getItem(USER_CODE_KEY);
    } catch {
      return null;
    }
  },

  setUserCode(code: string): void {
    try {
      localStorage.setItem(USER_CODE_KEY, code);
    } catch (e) {
      console.error('Failed to save user code', e);
    }
  },

  // Favorites
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : ['suriya-tv', 'adithya-tv-comedy'];
    } catch {
      return ['suriya-tv'];
    }
  },

  setFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  },

  toggleFavorite(channelId: string): string[] {
    const current = this.getFavorites();
    const updated = current.includes(channelId)
      ? current.filter(id => id !== channelId)
      : [...current, channelId];
    this.setFavorites(updated);
    return updated;
  },

  // Watch History
  getRecentWatched(): WatchHistoryItem[] {
    try {
      const data = localStorage.getItem(RECENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecentWatched(channelId: string): WatchHistoryItem[] {
    try {
      const current = this.getRecentWatched().filter(item => item.channelId !== channelId);
      const updated = [{ channelId, timestamp: Date.now() }, ...current].slice(0, 20);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save recent watched', e);
      return [];
    }
  },

  clearRecentWatched(): void {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch (e) {
      console.error('Failed to clear recent', e);
    }
  },

  // Custom Channels
  getCustomChannels(): Channel[] {
    try {
      const data = localStorage.getItem(CUSTOM_CHANNELS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCustomChannel(channel: Channel): Channel[] {
    try {
      const existing = this.getCustomChannels();
      const updated = [channel, ...existing.filter(c => c.id !== channel.id)];
      localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to add custom channel', e);
      return [];
    }
  },

  removeCustomChannel(channelId: string): Channel[] {
    try {
      const existing = this.getCustomChannels();
      const updated = existing.filter(c => c.id !== channelId);
      localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to delete custom channel', e);
      return [];
    }
  }
};
