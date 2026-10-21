import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { StreamQualityLevel } from '../types';

interface UseHlsPlayerProps {
  streamUrl: string;
  alternateStreams?: string[];
  autoPlay?: boolean;
}

export function useHlsPlayer({ streamUrl, alternateStreams = [], autoPlay = true }: UseHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Combine primary and alternate streams
  const allStreamUrls = useMemo(() => {
    const list = [streamUrl, ...alternateStreams].filter(Boolean);
    // Unique list
    return Array.from(new Set(list));
  }, [streamUrl, alternateStreams]);

  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('nilatv_player_volume');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('nilatv_player_muted') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [qualities, setQualities] = useState<StreamQualityLevel[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number>(-1);

  const [streamInfo, setStreamInfo] = useState<{
    width: number;
    height: number;
    fps?: number;
    bitrate?: number;
    type: 'hls' | 'native-hls' | 'direct' | 'unknown';
  }>({
    width: 0,
    height: 0,
    type: 'unknown'
  });

  // Current active raw URL
  const currentRawUrl = allStreamUrls[activeServerIndex] || streamUrl;

  // Resolved URL (direct or via stream proxy)
  const effectiveUrl = useMemo(() => {
    if (!currentRawUrl) return '';
    // If URL is HTTP (insecure), route through proxy to prevent mixed content blocking
    if (useProxy || currentRawUrl.startsWith('http://')) {
      return `/api/stream-proxy?url=${encodeURIComponent(currentRawUrl)}`;
    }
    return currentRawUrl;
  }, [currentRawUrl, useProxy]);

  // Clean up existing HLS instance
  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
      } catch (err) {
        console.warn('HLS destroy warning:', err);
      }
      hlsRef.current = null;
    }
  }, []);

  // Initialize and load stream
  const loadStream = useCallback(() => {
    const video = videoRef.current;
    if (!video || !effectiveUrl) return;

    cleanup();
    setIsLoading(true);
    setIsBuffering(false);
    setError(null);
    setErrorDetails(null);
    setQualities([]);

    const isM3u8 = effectiveUrl.includes('.m3u8') || effectiveUrl.includes('stream-proxy') || effectiveUrl.includes('/hls/');

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        fragLoadingMaxRetry: 3,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;

      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(effectiveUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const mappedLevels: StreamQualityLevel[] = data.levels.map((level, idx) => ({
          id: idx,
          height: level.height || 720,
          width: level.width,
          bitrate: level.bitrate,
          label: level.height ? `${level.height}p` : `Level ${idx + 1}`
        }));
        setQualities(mappedLevels);
        setStreamInfo(prev => ({
          ...prev,
          type: 'hls',
          width: video.videoWidth || 1280,
          height: video.videoHeight || 720
        }));

        if (autoPlay) {
          video.play().catch(err => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {
              setIsPlaying(false);
            });
          });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls.levels[data.level];
        if (level) {
          setStreamInfo(prev => ({
            ...prev,
            width: level.width || prev.width,
            height: level.height || prev.height,
            bitrate: level.bitrate
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If not already using proxy, automatically try stream proxy
              if (!useProxy && !effectiveUrl.includes('stream-proxy')) {
                console.log('[TFLIX] Direct stream failed, auto-retrying via CORS stream proxy...');
                setUseProxy(true);
                return;
              }

              // If proxy also failed and we have alternate servers, auto switch
              if (activeServerIndex < allStreamUrls.length - 1) {
                console.log(`[TFLIX] Server ${activeServerIndex + 1} unreachable, failing over to Server ${activeServerIndex + 2}...`);
                setActiveServerIndex(prev => prev + 1);
                setUseProxy(false);
                return;
              }

              setError('Broadcast Offline or Access Restricted.');
              setErrorDetails(`Network detail: ${data.details}. The source broadcast server is temporarily offline, region-restricted, or blocking client requests.`);
              try {
                hls.startLoad();
              } catch (e) {
                console.error(e);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Stream Media Buffering Recovery...');
              setErrorDetails(`Media error: ${data.details}`);
              try {
                hls.recoverMediaError();
              } catch (e) {
                console.error(e);
              }
              break;
            default:
              setError('Playback Error: Stream format unsupported.');
              setErrorDetails(`Details: ${data.details}`);
              cleanup();
              break;
          }
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = effectiveUrl;
      setStreamInfo(prev => ({ ...prev, type: 'native-hls' }));
      if (autoPlay) {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(e => console.warn('Native playback error:', e));
        });
      }
    } else {
      video.src = effectiveUrl;
      setStreamInfo(prev => ({ ...prev, type: 'direct' }));
      if (autoPlay) {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(e => console.warn('Direct playback error:', e));
        });
      }
    }
  }, [effectiveUrl, autoPlay, cleanup, useProxy, activeServerIndex, allStreamUrls]);

  useEffect(() => {
    loadStream();
    return () => {
      cleanup();
    };
  }, [loadStream, cleanup]);

  // Hook into video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };
    const onCanPlay = () => setIsLoading(false);
    const onLoadedMetadata = () => {
      setStreamInfo(prev => ({
        ...prev,
        width: video.videoWidth,
        height: video.videoHeight
      }));
    };
    const onError = () => {
      setIsLoading(false);
      if (!useProxy && !effectiveUrl.includes('stream-proxy')) {
        setUseProxy(true);
      } else if (activeServerIndex < allStreamUrls.length - 1) {
        setActiveServerIndex(prev => prev + 1);
        setUseProxy(false);
      } else if (!error) {
        setError('Stream could not be loaded. Please try another server or check connection.');
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
    };
  }, [error, volume, isMuted, useProxy, effectiveUrl, activeServerIndex, allStreamUrls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(e => console.warn('Play error:', e));
    } else {
      video.pause();
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    if (clamped === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    if (videoRef.current) {
      videoRef.current.volume = clamped;
    }
    localStorage.setItem('nilatv_player_volume', clamped.toString());
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    localStorage.setItem('nilatv_player_muted', nextMuted ? 'true' : 'false');
  }, [isMuted]);

  const toggleFullscreen = useCallback(async (containerElement?: HTMLElement | null) => {
    const target = containerElement || videoRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      try {
        await target.requestFullscreen();
      } catch (e) {
        console.warn('Fullscreen request failed', e);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.warn('Exit fullscreen failed', e);
      }
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (e) {
      console.warn('Picture-in-picture error:', e);
    }
  }, []);

  const setQuality = useCallback((qualityIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIndex;
      setCurrentQualityIndex(qualityIndex);
    }
  }, []);

  const retryStream = useCallback(() => {
    setUseProxy(false);
    loadStream();
  }, [loadStream]);

  const switchServer = useCallback((index: number) => {
    if (index >= 0 && index < allStreamUrls.length) {
      setActiveServerIndex(index);
      setUseProxy(false);
      setError(null);
    }
  }, [allStreamUrls]);

  const toggleProxyMode = useCallback(() => {
    setUseProxy(prev => !prev);
  }, []);

  return {
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
  };
}
