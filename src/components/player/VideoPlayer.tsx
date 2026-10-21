import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  PictureInPicture, 
  Settings, 
  SkipBack, 
  SkipForward, 
  Radio, 
  Heart, 
  Tv, 
  AlertTriangle,
  Zap,
  ListFilter,
  Clock,
  Moon,
  Sparkles,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { Channel } from '../../types';
import { useHlsPlayer } from '../../hooks/useHlsPlayer';
import { StreamDiagnosticsModal } from './StreamDiagnosticsModal';

interface VideoPlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  categoryInfo?: {
    current: number;
    total: number;
    categoryName: string;
    categoryChannels: Channel[];
  };
  onSelectChannel?: (id: string) => void;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  isFavorite,
  onToggleFavorite,
  onPrevChannel,
  onNextChannel,
  categoryInfo,
  onSelectChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const hideTimeoutRef = useRef<any>(null);

  const {
    videoRef,
    isPlaying,
    isLoading,
    isBuffering,
    error,
    errorDetails,
    volume,
    isMuted,
    isFullscreen,
    isPiP,
    qualities,
    currentQualityIndex,
    streamInfo,
    activeServerIndex,
    allStreamUrls,
    useProxy,
    currentRawUrl,
    effectiveUrl,
    togglePlay,
    changeVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    setQuality,
    retryStream,
    switchServer,
    toggleProxyMode,
  } = useHlsPlayer({
    streamUrl: channel.streamUrl,
    alternateStreams: channel.alternateStreams || [],
    autoPlay: true,
  });

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
        setShowQualityMenu(false);
        setShowServerMenu(false);
        setShowCategoryDrawer(false);
        setShowSleepMenu(false);
      }
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Sleep Timer countdown handler
  useEffect(() => {
    if (!sleepTimer) {
      setSleepTimeRemaining(null);
      return;
    }

    setSleepTimeRemaining(sleepTimer * 60);
    const interval = setInterval(() => {
      setSleepTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (videoRef.current) {
            videoRef.current.pause();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          setControlsVisible(true);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen(containerRef.current);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          setControlsVisible(true);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          setControlsVisible(true);
          break;
        case 'ArrowLeft':
          if (onPrevChannel) {
            e.preventDefault();
            onPrevChannel();
          }
          break;
        case 'ArrowRight':
          if (onNextChannel) {
            e.preventDefault();
            onNextChannel();
          }
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setShowCategoryDrawer(prev => !prev);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePiP();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          setIsDiagnosticsOpen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, toggleFullscreen, toggleMute, changeVolume, volume, onPrevChannel, onNextChannel, togglePiP]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl select-none group border border-neutral-800 ${
        isFullscreen ? 'rounded-none border-none' : ''
      } ${theaterMode ? 'ring-4 ring-red-600/30' : ''}`}
    >
      {/* Ambient Theater Glow */}
      {theaterMode && (
        <div className="absolute inset-0 bg-radial from-red-600/10 via-transparent to-transparent pointer-events-none" />
      )}

      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Top Overlay Header */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0d0f15] border border-neutral-700/60 overflow-hidden flex items-center justify-center shrink-0 p-1 shadow-md">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/api/logo-proxy')) {
                    target.src = `/api/logo-proxy?url=${encodeURIComponent(channel.logo)}&name=${encodeURIComponent(channel.name)}`;
                  }
                }}
              />
            ) : (
              <Tv className="w-5 h-5 text-red-500" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight font-['Outfit']">
                {channel.name}
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-[10px] font-black text-white tracking-widest uppercase shadow-md shadow-red-600/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>LIVE</span>
              </div>

              {categoryInfo && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-neutral-300">
                  <ListFilter className="w-3 h-3 text-red-400" />
                  <span>{categoryInfo.categoryName} ({categoryInfo.current}/{categoryInfo.total})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-300 mt-0.5">
              <span className="text-red-400 font-bold">{channel.language}</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>{channel.category}</span>
              {channel.currentProgram && (
                <>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="text-neutral-400 truncate max-w-[160px] sm:max-w-xs">
                    {channel.currentProgram}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-2">
          {/* Category Channel Surfing Zapper button */}
          {categoryInfo && (
            <button
              onClick={() => setShowCategoryDrawer(!showCategoryDrawer)}
              className={`min-h-[40px] px-3 rounded-2xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${
                showCategoryDrawer 
                  ? 'bg-red-600 text-white border-red-500' 
                  : 'bg-black/60 hover:bg-black/80 text-neutral-200 border-neutral-700/60'
              }`}
              title="Surf Channels in this Category (C)"
            >
              <ListFilter className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">Surf Category</span>
            </button>
          )}

          {/* Sleep Timer button */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className={`min-h-[40px] px-2.5 rounded-2xl flex items-center gap-1 text-xs border transition-all ${
                sleepTimer 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                  : 'bg-black/60 hover:bg-black/80 text-neutral-300 border-neutral-700/60'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-3.5 h-3.5" />
              {sleepTimeRemaining && (
                <span className="text-[10px] font-mono">
                  {Math.floor(sleepTimeRemaining / 60)}m
                </span>
              )}
            </button>

            {showSleepMenu && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-[#0d0f15] border border-neutral-800 rounded-2xl shadow-2xl py-1.5 z-30 overflow-hidden text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-neutral-500">Sleep Timer</div>
                {[null, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins || 0}
                    onClick={() => {
                      setSleepTimer(mins);
                      setShowSleepMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center justify-between ${
                      sleepTimer === mins ? 'text-red-500 font-bold' : 'text-neutral-300'
                    }`}
                  >
                    <span>{mins ? `${mins} minutes` : 'Off'}</span>
                    {sleepTimer === mins && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stream Diagnostics Modal button */}
          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="min-h-[40px] px-2.5 rounded-2xl bg-black/60 hover:bg-black/80 text-neutral-300 hover:text-white transition-all flex items-center justify-center border border-neutral-700/60"
            title="Stream Diagnostics (D)"
          >
            <Gauge className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Floating Category Rail / Quick Channel Zapper Drawer */}
      {showCategoryDrawer && categoryInfo && (
        <div className="absolute top-16 right-4 bottom-20 w-72 bg-[#0c0f18]/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-3 z-30 shadow-2xl flex flex-col gap-2 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-red-500" />
              <span>{categoryInfo.categoryName}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {categoryInfo.total} Channels
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {categoryInfo.categoryChannels.map((c, i) => {
              const isCurrent = c.id === channel.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    if (onSelectChannel) onSelectChannel(c.id);
                    setShowCategoryDrawer(false);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-all ${
                    isCurrent
                      ? 'bg-red-600/20 border border-red-500/60 text-white font-bold'
                      : 'hover:bg-neutral-800/80 text-neutral-300 border border-transparent'
                  }`}
                >
                  <span className="text-[10px] font-mono text-neutral-500 w-4 text-center">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-black/60 p-0.5 shrink-0 flex items-center justify-center">
                    {c.logo ? (
                      <img src={c.logo} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Tv className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{c.name}</div>
                    <div className="text-[9px] text-neutral-500 truncate">{c.currentProgram || 'Live TV'}</div>
                  </div>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Center Buffering & Error Overlays */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin shadow-lg" />
          <p className="mt-3 text-xs font-semibold tracking-wider text-neutral-300 font-mono">
            CONNECTING TO TFLIX FEED...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-10 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Stream Signal Interrupted</h3>
          <p className="text-xs text-neutral-400 max-w-md mb-4">{error}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={retryStream}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
            >
              Retry Playback
            </button>
            <button
              onClick={toggleProxyMode}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl"
            >
              {useProxy ? 'Direct Mode' : 'Switch to CORS Proxy'}
            </button>
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-xl flex items-center gap-1.5"
              >
                <span>Next in Category</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-20 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Category-Wise Navigation Badge Row */}
        {categoryInfo && (
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-1">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-red-500 font-bold uppercase tracking-wider">CATEGORY:</span>
              <span className="text-white font-semibold">{categoryInfo.categoryName}</span>
              <span className="text-neutral-500">·</span>
              <span>Channel {categoryInfo.current} of {categoryInfo.total}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
              <span>Shortcuts:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">← Prev</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">→ Next</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">C Surf</kbd>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/40 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {/* Category-wise Previous Channel */}
            {onPrevChannel && (
              <button
                onClick={onPrevChannel}
                className="min-h-[44px] px-3.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-neutral-800 text-xs font-semibold"
                title="Previous Channel in Category (←)"
              >
                <SkipBack className="w-4 h-4" />
                <span className="hidden md:inline">Prev Channel</span>
              </button>
            )}

            {/* Category-wise Next Channel */}
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="min-h-[44px] px-4 rounded-2xl bg-red-950/70 hover:bg-red-900/90 text-red-200 hover:text-white flex items-center gap-1.5 transition-all border border-red-700/50 text-xs font-bold shadow-md shadow-red-950/40"
                title="Next Channel in Category (→)"
              >
                <span>Next Channel</span>
                <SkipForward className="w-4 h-4 text-red-400" />
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2 pl-1">
              <button
                onClick={toggleMute}
                className="min-h-[44px] min-w-[44px] p-2 text-neutral-300 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title="Mute / Unmute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-500" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-24 accent-red-600 cursor-pointer hidden sm:block h-1.5 bg-neutral-700 rounded-lg"
              />
            </div>

            {/* TFLIX Brand Badge */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-neutral-800 text-xs font-bold text-neutral-400">
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="font-['Outfit'] tracking-wider">TFLIX OTT</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quality Selector */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="min-h-[44px] px-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-800"
                >
                  <Settings className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline">
                    {currentQualityIndex === -1 ? 'Auto HD' : qualities[currentQualityIndex]?.label || 'Quality'}
                  </span>
                </button>

                {showQualityMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-36 bg-[#0d0f15] border border-neutral-800 rounded-2xl shadow-2xl py-1.5 z-30 overflow-hidden text-xs">
                    <button
                      onClick={() => {
                        setQuality(-1);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center justify-between ${
                        currentQualityIndex === -1 ? 'text-red-500 font-bold' : 'text-neutral-300'
                      }`}
                    >
                      <span>Auto (Adaptive)</span>
                      {currentQualityIndex === -1 && <span className="text-[10px]">✓</span>}
                    </button>
                    {qualities.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setQuality(q.id);
                          setShowQualityMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center justify-between ${
                          currentQualityIndex === q.id ? 'text-red-500 font-bold' : 'text-neutral-300'
                        }`}
                      >
                        <span>{q.label}</span>
                        {currentQualityIndex === q.id && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-neutral-800 flex items-center justify-center"
              title="Picture in Picture (P)"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => toggleFullscreen(containerRef.current)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-neutral-800 flex items-center justify-center"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <StreamDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        channel={{
          ...channel,
          streamUrl: currentRawUrl,
        }}
        streamInfo={streamInfo}
        qualities={qualities}
        currentQualityIndex={currentQualityIndex}
        error={error}
        errorDetails={errorDetails}
      />
    </div>
  );
};
