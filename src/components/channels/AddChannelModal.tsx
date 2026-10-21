import React, { useState, useRef, useEffect } from 'react';
import { X, Tv, CheckCircle2, AlertCircle, Play, Sparkles, Database, Globe } from 'lucide-react';
import { Channel, Category, Language, Country } from '../../types';
import Hls from 'hls.js';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: Channel) => void;
}

const PRESET_STREAMS = [
  {
    name: 'Suriya TV (Tamil)',
    url: 'https://stream.ottlive.co.in/suryatvtamil/index.m3u8',
    lang: 'Tamil',
    cat: 'Entertainment',
    country: 'India',
    code: 'IN',
  },
  {
    name: 'Akamai HLS Cinema',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    lang: 'English',
    cat: 'Movies',
    country: 'United States',
    code: 'US',
  },
  {
    name: 'Mux Master Stream',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    lang: 'English',
    cat: 'Entertainment',
    country: 'International',
    code: 'INT',
  },
];

const POPULAR_COUNTRIES = [
  { name: 'India', code: 'IN' },
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Russia', code: 'RU' },
  { name: 'International', code: 'INT' },
];

const POPULAR_LANGUAGES = [
  'Tamil',
  'Malayalam',
  'Hindi',
  'Telugu',
  'Kannada',
  'Bengali',
  'Punjabi',
  'English',
  'Spanish',
  'Arabic',
  'French',
  'German',
  'Russian',
  'Other'
];

const POPULAR_CATEGORIES = [
  'Entertainment',
  'Movies',
  'News',
  'Sports',
  'Music',
  'Kids',
  'Animation',
  'Comedy',
  'Documentary',
  'Religious',
  'Education',
  'Lifestyle',
  'General'
];

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
}) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [countryCode, setCountryCode] = useState('IN');
  const [language, setLanguage] = useState('Tamil');
  const [category, setCategory] = useState('Entertainment');
  const [quality, setQuality] = useState('1080p');
  const [streamUrl, setStreamUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [currentProgram, setCurrentProgram] = useState('Live Broadcast HD');
  
  // Test stream state
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const testVideoRef = useRef<HTMLVideoElement | null>(null);
  const testHlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    return () => {
      if (testHlsRef.current) {
        testHlsRef.current.destroy();
        testHlsRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleTestStream = () => {
    if (!streamUrl.trim()) {
      setTestStatus('failed');
      setTestMessage('Please enter a stream URL first.');
      return;
    }

    setIsTesting(true);
    setTestStatus('idle');
    setTestMessage('Testing HLS broadcast playback...');

    if (testHlsRef.current) {
      testHlsRef.current.destroy();
      testHlsRef.current = null;
    }

    const video = testVideoRef.current;
    if (!video) {
      setIsTesting(false);
      return;
    }

    if (Hls.isSupported() && (streamUrl.includes('.m3u8') || streamUrl.includes('/hls/'))) {
      const hls = new Hls({ enableWorker: true });
      testHlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(streamUrl.trim());
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsTesting(false);
        setTestStatus('success');
        setTestMessage('Verified! Stream parsed and playable in TFLIX.');
        video.muted = true;
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setIsTesting(false);
          setTestStatus('failed');
          setTestMessage(`Playback warning: ${data.details || 'Unable to parse manifest'}. Try testing with proxy.`);
        }
      });
    } else {
      video.src = streamUrl.trim();
      video.onloadedmetadata = () => {
        setIsTesting(false);
        setTestStatus('success');
        setTestMessage('Media signal verified.');
        video.muted = true;
        video.play().catch(() => {});
      };
      video.onerror = () => {
        setIsTesting(false);
        setTestStatus('failed');
        setTestMessage('Stream URL failed to load. Check CORS and network address.');
      };
    }
  };

  const applyPreset = (preset: typeof PRESET_STREAMS[0]) => {
    setName(preset.name);
    setStreamUrl(preset.url);
    setLanguage(preset.lang);
    setCategory(preset.cat);
    setCountry(preset.country);
    setCountryCode(preset.code);
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !streamUrl.trim()) return;

    const newChannel: Channel = {
      id: `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      language,
      category,
      country,
      countryCode,
      quality,
      logo: logoUrl.trim() || '',
      streamUrl: streamUrl.trim(),
      isCustom: true,
      description: description.trim() || `User added broadcast stream for ${name} on TFLIX`,
      currentProgram: currentProgram.trim() || 'Live Broadcast',
      nextProgram: 'Upcoming Program',
      programTime: 'Live Now',
      tags: [country, language, category, quality, 'TFLIX User Stream']
    };

    onAddChannel(newChannel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#0d0f15] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-100 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Outfit']">Add Stream to TFLIX</h2>
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>SQLite Stored</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400">cybertech by cyberloops · Live .m3u8 stream broadcaster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-1">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Quick Sample Stream Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_STREAMS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 text-xs rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-red-500" />
                <span className="truncate max-w-[170px]">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Channel Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Star Gold HD, BBC News, Sky Sports"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => {
                  const found = POPULAR_COUNTRIES.find(c => c.name === e.target.value);
                  setCountry(e.target.value);
                  if (found) setCountryCode(found.code);
                }}
                className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-red-600"
              >
                {POPULAR_COUNTRIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-red-600"
              >
                <option value="1080p">1080p FHD</option>
                <option value="720p">720p HD</option>
                <option value="4K UHD">4K Ultra HD</option>
                <option value="576p">576p SD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Language *
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-red-600"
              >
                {POPULAR_LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-red-600"
              >
                {POPULAR_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Live Stream URL (.m3u8) *
              </label>
              <button
                type="button"
                onClick={handleTestStream}
                disabled={isTesting || !streamUrl.trim()}
                className="text-xs text-red-500 hover:text-red-400 font-semibold disabled:opacity-40 transition-colors"
              >
                {isTesting ? 'Verifying...' : '⚡ Test Stream Signal'}
              </button>
            </div>
            <input
              type="url"
              required
              placeholder="https://example.com/live/playlist.m3u8"
              value={streamUrl}
              onChange={(e) => {
                setStreamUrl(e.target.value);
                setTestStatus('idle');
              }}
              className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Stream Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/60 border border-red-800 text-red-300'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="flex-1">{testMessage}</span>
            </div>
          )}

          {/* Test video container */}
          <div className={`aspect-video w-full rounded-2xl bg-black border border-neutral-800 overflow-hidden ${testStatus === 'success' ? 'block' : 'hidden'}`}>
            <video ref={testVideoRef} controls className="w-full h-full object-contain" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Channel Logo URL <span className="text-neutral-500 text-[11px]">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-[#13151f] border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-98 flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Save & Publish Live Stream</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
