import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllChannels,
  insertChannel,
  deleteChannel,
  getFavorites,
  toggleFavorite,
  getWatchHistory,
  recordWatch,
  clearWatchHistory,
  getDatabaseStats,
  resetToDefaultChannels,
  getDatabase,
  verifyEntryCode,
  validateSession,
  adminLogin,
  adminChangePassword,
  generateEntryCode,
  getAllEntryCodes,
  updateCodeStatus,
  updateChannel,
  getChannelsSummary,
  importChannelsFromCsv,
  deleteEntryCode,
  getRevenueAndCodeStats
} from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize SQLite immediately on startup
getDatabase().then(() => {
  console.log('[TFLIX] SQLite Database Engine ready. Copyright cybertech by cyberloops.');
}).catch((err) => {
  console.error('[TFLIX] Failed to initialize SQLite database:', err);
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'tflix',
    appName: 'TFLIX',
    copyright: 'cybertech by cyberloops',
    version: '3.2.0',
    timestamp: Date.now()
  });
});

// Database diagnostics and stats
app.get('/api/db-status', async (req, res) => {
  try {
    const stats = await getDatabaseStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- Access Gate & Authentication Endpoints -----------------

// Verify user entry code
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { code, deviceFingerprint } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Access Code is required' });
    }

    const result = await verifyEntryCode(code, deviceFingerprint);
    if (!result.valid) {
      return res.status(401).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      sessionToken: result.sessionToken,
      planTier: result.planTier,
      expiresAt: result.expiresAt,
      assignedTo: result.assignedTo,
      code: result.code
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validate existing session token
app.post('/api/auth/validate-session', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken) {
      return res.status(401).json({ success: false, valid: false, error: 'No session provided' });
    }

    const result = await validateSession(sessionToken);
    res.json({ success: result.valid, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- Admin Panel Endpoints -----------------

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const result = await adminLogin(username, password);
    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Change Password
app.post('/api/admin/change-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ success: false, error: 'Username and new password required' });
    }

    await adminChangePassword(username, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Get All Codes
app.get('/api/admin/codes', async (req, res) => {
  try {
    const codes = await getAllEntryCodes();
    res.json({ success: true, codes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Generate Code (Single or Bulk)
app.post('/api/admin/codes', async (req, res) => {
  try {
    const {
      count = 1,
      planTier = 'vip',
      durationDays = 30,
      maxActivations = 1,
      assignedTo = '',
      phoneOrEmail = '',
      price = 15.00,
      notes = '',
      customPrefix = 'TFLIX'
    } = req.body;

    const generated = [];
    const loopCount = Math.min(Math.max(1, parseInt(count, 10) || 1), 50);

    for (let i = 0; i < loopCount; i++) {
      const result = await generateEntryCode({
        planTier,
        durationDays: durationDays === 'lifetime' || durationDays === null ? null : parseInt(durationDays, 10),
        maxActivations: parseInt(maxActivations, 10) || 1,
        assignedTo: assignedTo || (loopCount > 1 ? `Subscriber #${i + 1}` : 'Subscriber'),
        phoneOrEmail,
        price: parseFloat(price) || 0,
        notes,
        customPrefix
      });
      generated.push(result);
    }

    const allCodes = await getAllEntryCodes();
    res.json({ success: true, generated, allCodes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Update Code Status (Revoke / Activate)
app.put('/api/admin/codes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateCodeStatus(id, status);
    const codes = await getAllEntryCodes();
    res.json({ success: true, codes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Delete Code
app.delete('/api/admin/codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEntryCode(id);
    const codes = await getAllEntryCodes();
    res.json({ success: true, codes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Revenue & Analytics Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const revStats = await getRevenueAndCodeStats();
    const dbStats = await getDatabaseStats();
    res.json({
      success: true,
      stats: {
        ...revStats,
        ...dbStats
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- Intelligent Stream Proxy -----------------

app.options('/api/stream-proxy', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.sendStatus(204);
});

app.get('/api/stream-proxy', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).send('URL query parameter required');

  try {
    let origin = '';
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      return res.status(400).send('Invalid target URL');
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': origin,
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send(`Upstream error: ${upstreamRes.statusText}`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    const contentType = upstreamRes.headers.get('content-type') || '';
    const isM3u8 = targetUrl.includes('.m3u8') || contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL');

    if (isM3u8) {
      const text = await upstreamRes.text();
      const finalUrl = upstreamRes.url || targetUrl;
      const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);

      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith('#')) {
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
              const resolved = uri.startsWith('http') ? uri : new URL(uri, baseUrl).href;
              return `URI="/api/stream-proxy?url=${encodeURIComponent(resolved)}"`;
            });
          }
          return line;
        }

        let resolved = trimmed;
        if (!trimmed.startsWith('http')) {
          resolved = new URL(trimmed, baseUrl).href;
        }
        return `/api/stream-proxy?url=${encodeURIComponent(resolved)}`;
      }).join('\n');

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.send(rewritten);
    } else {
      res.setHeader('Content-Type', contentType || 'video/MP2T');
      const arrayBuffer = await upstreamRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    res.status(502).send(`Stream proxy error: ${err.message}`);
  }
});

// Resilient Logo Proxy with auto-caching and vector fallback
app.get('/api/logo-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  const channelName = (req.query.name as string) || 'Live TV';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

  if (!imageUrl) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(generateFallbackSvg(channelName));
  }

  try {
    let origin = '';
    try {
      origin = new URL(imageUrl).origin;
    } catch {
      origin = 'https://i.imgur.com';
    }

    const upstreamRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': origin,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (upstreamRes.ok) {
      const contentType = upstreamRes.headers.get('content-type') || 'image/png';
      res.setHeader('Content-Type', contentType);
      const arrayBuffer = await upstreamRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }
  } catch (err) {
    // Silent failover to SVG badge
  }

  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(generateFallbackSvg(channelName));
});

function generateFallbackSvg(name: string): string {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'TV';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#180b10" />
        <stop offset="50%" stop-color="#0a0c12" />
        <stop offset="100%" stop-color="#030406" />
      </linearGradient>
      <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#991b1b" />
      </linearGradient>
    </defs>
    <rect width="300" height="200" rx="16" fill="url(#bg)" stroke="#262626" stroke-width="1" />
    <circle cx="150" cy="85" r="42" fill="url(#badge)" opacity="0.9" />
    <text x="150" y="96" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">${initials}</text>
    <text x="150" y="152" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#f5f5f5" text-anchor="middle">${name.length > 20 ? name.substring(0, 18) + '...' : name}</text>
    <text x="150" y="172" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="#ef4444" letter-spacing="3" text-anchor="middle">TFLIX OTT</text>
  </svg>`;
}

// ----------------- Channels API -----------------

// Get channels from SQLite (supports optional filtering & pagination)
app.get('/api/channels', async (req, res) => {
  try {
    const { country, category, language, search, featured, limit, offset } = req.query;
    const channels = await getAllChannels({
      country: country as string,
      category: category as string,
      language: language as string,
      search: search as string,
      featured: featured === 'true' ? true : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    res.json({ success: true, count: channels.length, channels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get channels global summary & taxonomy
app.get('/api/channels/summary', async (req, res) => {
  try {
    const summary = await getChannelsSummary();
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Insert new stream channel (Admin or User)
app.post('/api/channels', async (req, res) => {
  try {
    const channelData = req.body;
    if (!channelData.name || !channelData.streamUrl) {
      return res.status(400).json({ success: false, error: 'Channel name and streamUrl are required.' });
    }

    const channel = {
      id: channelData.id || `tflix-${Date.now()}`,
      name: channelData.name.trim(),
      language: channelData.language || 'English',
      category: channelData.category || 'General',
      country: channelData.country || 'International',
      countryCode: (channelData.countryCode || 'INT').toUpperCase(),
      quality: channelData.quality || '1080p',
      logo: channelData.logo || '',
      streamUrl: channelData.streamUrl.trim(),
      alternateStreams: channelData.alternateStreams || [],
      isCustom: channelData.isCustom !== undefined ? channelData.isCustom : true,
      featured: Boolean(channelData.featured),
      description: channelData.description || `Official broadcast of ${channelData.name} on TFLIX`,
      currentProgram: channelData.currentProgram || 'Live Stream HD',
      nextProgram: channelData.nextProgram || 'Upcoming Schedule',
      programTime: channelData.programTime || 'Live Now',
      tags: channelData.tags || [channelData.category || 'General', channelData.language || 'Live TV', 'TFLIX OTT'],
      website: channelData.website || '',
      network: channelData.network || ''
    };

    const newId = await insertChannel(channel);
    const channels = await getAllChannels();
    res.json({ success: true, channel: { ...channel, id: newId }, channels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update stream channel
app.put('/api/channels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const channelData = req.body;
    await updateChannel(id, channelData);
    const channels = await getAllChannels();
    res.json({ success: true, channels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete channel
app.delete('/api/channels/:id', async (req, res) => {
  try {
    const channelId = req.params.id;
    await deleteChannel(channelId);
    const channels = await getAllChannels();
    res.json({ success: true, channels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin force re-import / sync from CSV
app.post('/api/admin/channels/import-csv', async (req, res) => {
  try {
    const { forceReset } = req.body;
    const result = await importChannelsFromCsv(Boolean(forceReset));
    const channels = await getAllChannels();
    res.json({ success: true, result, channels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset channels to default
app.post('/api/channels/reset', async (req, res) => {
  try {
    const channels = await resetToDefaultChannels();
    res.json({ success: true, channels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Favorites
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await getFavorites();
    res.json({ success: true, favorites });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/favorites/toggle', async (req, res) => {
  try {
    const { channelId } = req.body;
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'channelId is required' });
    }
    const favorites = await toggleFavorite(channelId);
    res.json({ success: true, favorites });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Watch History
app.get('/api/history', async (req, res) => {
  try {
    const history = await getWatchHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const { channelId } = req.body;
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'channelId is required' });
    }
    await recordWatch(channelId);
    const history = await getWatchHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/history', async (req, res) => {
  try {
    await clearWatchHistory();
    res.json({ success: true, history: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TFLIX] Server active on http://0.0.0.0:${PORT} (Brand: tflix, Copyright: cybertech by cyberloops, SQLite: active)`);
  });
}

startServer().catch(err => {
  console.error('[TFLIX] Fatal server error:', err);
});
