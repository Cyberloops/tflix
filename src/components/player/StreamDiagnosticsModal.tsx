import React, { useState } from 'react';
import { X, Activity, Copy, Check, Info, ShieldAlert, Database, Crown } from 'lucide-react';
import { Channel, StreamQualityLevel } from '../../types';

interface StreamDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  streamInfo: {
    width: number;
    height: number;
    fps?: number;
    bitrate?: number;
    type: 'hls' | 'native-hls' | 'direct' | 'unknown';
  };
  qualities: StreamQualityLevel[];
  currentQualityIndex: number;
  error?: string | null;
  errorDetails?: string | null;
}

export const StreamDiagnosticsModal: React.FC<StreamDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  channel,
  streamInfo,
  qualities,
  currentQualityIndex,
  error,
  errorDetails,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(channel.streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-[#0d0f15] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-100 space-y-4"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit']">TFLIX Stream Diagnostics</h2>
              <p className="text-[11px] text-neutral-400">cybertech by cyberloops · HLS.js Live Broadcast Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-neutral-900/80 rounded-2xl border border-neutral-800/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Broadcast Channel</span>
              <span className="font-bold text-white font-['Outfit']">{channel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Language / Category</span>
              <span className="text-neutral-200">{channel.language} · {channel.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Engine / Protocol</span>
              <span className="font-mono text-red-400 uppercase">{streamInfo.type} (HLS.js)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Active Resolution</span>
              <span className="font-mono tabular-nums text-neutral-200">
                {streamInfo.width > 0 ? `${streamInfo.width} × ${streamInfo.height}` : 'Detecting...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Selected Level</span>
              <span className="font-mono text-neutral-200">
                {currentQualityIndex === -1 ? 'Auto (Adaptive Bitrate)' : `Level ${currentQualityIndex}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Data Storage</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>SQLite (data/tflix.sqlite)</span>
              </span>
            </div>
          </div>

          {/* Stream URL */}
          <div className="p-3.5 bg-neutral-900/80 rounded-2xl border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Stream Source (.m3u8)</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-neutral-300 break-all bg-black/60 p-2.5 rounded-xl border border-neutral-800">
              {channel.streamUrl}
            </p>
          </div>

          {/* Errors if any */}
          {error && (
            <div className="p-3.5 bg-red-950/40 rounded-2xl border border-red-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Stream Advisory</span>
              </div>
              <p className="text-red-200 text-[11px]">{error}</p>
              {errorDetails && (
                <p className="text-red-400/80 text-[10px] font-mono mt-1">{errorDetails}</p>
              )}
            </div>
          )}

          {/* Broadcast network notice */}
          <div className="p-3.5 bg-neutral-900/40 rounded-2xl border border-neutral-800/40 space-y-1 text-neutral-400">
            <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-red-500" />
              <span>Broadcast Network Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              TFLIX delivers live feeds using HLS.js. If an external channel stream is restricted by its upstream broadcast origin or CORS policies, you can test or replace it anytime using the <strong>Add Stream</strong> console.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-md shadow-red-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
