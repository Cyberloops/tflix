import { Channel, CreateChannelPayload, WatchHistoryItem, EntryCode, PlanTier, UserSession, RevenueStats } from '../types';
import { storage } from './storage';
import { INITIAL_CHANNELS } from '../data/channels';

export interface DbStatusInfo {
  engine: string;
  dbFile: string;
  fileSizeKb: string;
  totalChannels: number;
  totalFavorites: number;
  totalHistory: number;
  totalRevenue?: number;
  activePassesCount?: number;
  totalCodesGenerated?: number;
  owner?: string;
  appName: string;
  copyright?: string;
}

export const api = {
  // ----------------- Entry Code & Session API -----------------

  async verifyEntryCode(code: string): Promise<{ success: boolean; sessionToken?: string; planTier?: PlanTier; expiresAt?: number | null; assignedTo?: string; code?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          deviceFingerprint: typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 50)}_${window.innerWidth}x${window.innerHeight}` : 'web'
        }),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, error: 'Network error communicating with authentication server.' };
    }
  },

  async validateSession(sessionToken: string): Promise<{ success: boolean; valid: boolean; planTier?: PlanTier; code?: string; expiresAt?: number | null; assignedTo?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, valid: false, error: 'Network error validating session' };
    }
  },

  // ----------------- Admin API -----------------

  async adminLogin(username: string, password: string):Promise<{ success: boolean; adminToken?: string; username?: string; role?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, error: 'Connection error reaching admin endpoint' };
    }
  },

  async adminChangePassword(username: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async adminGetCodes(): Promise<EntryCode[]> {
    try {
      const res = await fetch('/api/admin/codes');
      if (res.ok) {
        const data = await res.json();
        return data.codes || [];
      }
    } catch (e) {
      console.warn('[TFLIX API] Fetching codes failed', e);
    }
    return [];
  },

  async adminGenerateCodes(options: {
    count?: number;
    planTier?: string;
    durationDays?: number | 'lifetime';
    maxActivations?: number;
    assignedTo?: string;
    phoneOrEmail?: string;
    price?: number;
    notes?: string;
    customPrefix?: string;
  }): Promise<{ success: boolean; generated?: any[]; allCodes?: EntryCode[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async adminUpdateCodeStatus(id: string, status: string): Promise<EntryCode[]> {
    try {
      const res = await fetch(`/api/admin/codes/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.codes || [];
      }
    } catch (e) {
      console.warn('[TFLIX API] Update code status failed', e);
    }
    return [];
  },

  async adminDeleteCode(id: string): Promise<EntryCode[]> {
    try {
      const res = await fetch(`/api/admin/codes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        return data.codes || [];
      }
    } catch (e) {
      console.warn('[TFLIX API] Delete code failed', e);
    }
    return [];
  },

  async adminGetStats(): Promise<RevenueStats & DbStatusInfo | null> {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        return data.stats;
      }
    } catch (e) {
      console.warn('[TFLIX API] Fetching admin stats failed', e);
    }
    return null;
  },

  // ----------------- Channels API -----------------

  async getChannels(): Promise<Channel[]> {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
          return data.channels;
        }
      }
    } catch (e) {
      console.warn('[TFLIX API] Fetching channels from SQLite failed, falling back to local cache', e);
    }
    const custom = storage.getCustomChannels();
    return [...custom, ...INITIAL_CHANNELS];
  },

  async addChannel(channel: Channel | CreateChannelPayload): Promise<Channel[]> {
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channel),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.channels) {
          storage.addCustomChannel(data.channel || channel);
          return data.channels;
        }
      }
    } catch (e) {
      console.warn('[TFLIX API] Add channel via SQLite API failed, storing locally', e);
    }
    storage.addCustomChannel(channel as Channel);
    return [...storage.getCustomChannels(), ...INITIAL_CHANNELS];
  },

  async adminUpdateChannel(id: string, channel: Partial<Channel>): Promise<Channel[]> {
    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channel),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.channels) {
          return data.channels;
        }
      }
    } catch (e) {
      console.warn('[TFLIX API] Update channel failed', e);
    }
    return this.getChannels();
  },

  async adminImportCsv(forceReset: boolean = false): Promise<{ success: boolean; result?: { imported: number; total: number }; channels?: Channel[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/channels/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceReset }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getChannelsSummary(): Promise<{ total: number; countries: any[]; categories: any[]; languages: any[] } | null> {
    try {
      const res = await fetch('/api/channels/summary');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.summary) {
          return data.summary;
        }
      }
    } catch (e) {
      console.warn('[TFLIX API] Get channels summary failed', e);
    }
    return null;
  },

  async deleteChannel(channelId: string): Promise<Channel[]> {
    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(channelId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.channels) {
          storage.removeCustomChannel(channelId);
          return data.channels;
        }
      }
    } catch (e) {
      console.warn('[TFLIX API] Delete channel via SQLite API failed', e);
    }
    storage.removeCustomChannel(channelId);
    return [...storage.getCustomChannels(), ...INITIAL_CHANNELS];
  },

  async resetChannels(): Promise<Channel[]> {
    try {
      const res = await fetch('/api/channels/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.channels) {
          return data.channels;
        }
      }
    } catch (e) {
      console.warn('[TFLIX API] Reset failed', e);
    }
    return INITIAL_CHANNELS;
  },

  // ----------------- Favorites & History -----------------

  async getFavorites(): Promise<string[]> {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.favorites)) {
          storage.setFavorites(data.favorites);
          return data.favorites;
        }
      }
    } catch {
      // Fallback
    }
    return storage.getFavorites();
  },

  async toggleFavorite(channelId: string): Promise<string[]> {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.favorites)) {
          storage.setFavorites(data.favorites);
          return data.favorites;
        }
      }
    } catch {
      // Fallback
    }
    return storage.toggleFavorite(channelId);
  },

  async getWatchHistory(): Promise<WatchHistoryItem[]> {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          return data.history;
        }
      }
    } catch {
      // Fallback
    }
    return storage.getRecentWatched();
  },

  async recordWatch(channelId: string): Promise<WatchHistoryItem[]> {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          storage.addRecentWatched(channelId);
          return data.history;
        }
      }
    } catch {
      // Fallback
    }
    return storage.addRecentWatched(channelId);
  },

  async clearWatchHistory(): Promise<void> {
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch {
      // Fallback
    }
    storage.clearRecentWatched();
  },

  async getDbStatus(): Promise<DbStatusInfo | null> {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          return data.stats;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  }
};
