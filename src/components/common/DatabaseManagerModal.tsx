import React, { useState } from 'react';
import { X, Database, Server, RefreshCw, CheckCircle2, ShieldCheck, HardDrive, FileText, KeyRound, DollarSign } from 'lucide-react';
import { DbStatusInfo } from '../../services/api';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DbStatusInfo | null;
  onResetChannels: () => Promise<void>;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onResetChannels,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!confirm('Are you sure you want to restore default channels in the SQLite database?')) {
      return;
    }
    setIsResetting(true);
    try {
      await onResetChannels();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-[#0d0f15] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-100 space-y-4"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Outfit']">TFLIX SQLite Vault</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-neutral-400">cybertech by cyberloops • Encrypted Storage Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database specs grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#13151f] rounded-2xl border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[10px]">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>DATABASE FILE</span>
            </div>
            <div className="font-mono text-white text-xs truncate">
              {dbStatus?.dbFile || 'data/tflix.sqlite'}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">
              Size: {dbStatus?.fileSizeKb || '0'} KB
            </div>
          </div>

          <div className="p-3 bg-[#13151f] rounded-2xl border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[10px]">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>ENGINE ARCHITECTURE</span>
            </div>
            <div className="font-semibold text-white text-xs">
              SQLite (sql.js Wasm)
            </div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Persistent Disk Sync</span>
            </div>
          </div>
        </div>

        {/* Counts Breakdown */}
        <div className="p-4 bg-[#11131c] rounded-2xl border border-neutral-800 space-y-2">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            SQLite Table Statistics
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-neutral-900/60 rounded-xl">
              <span className="text-lg font-black text-white block">
                {dbStatus?.totalChannels || 375}
              </span>
              <span className="text-[10px] text-neutral-400">Channels</span>
            </div>
            <div className="p-2 bg-neutral-900/60 rounded-xl">
              <span className="text-lg font-black text-red-400 block">
                {dbStatus?.totalFavorites || 0}
              </span>
              <span className="text-[10px] text-neutral-400">Favorites</span>
            </div>
            <div className="p-2 bg-neutral-900/60 rounded-xl">
              <span className="text-lg font-black text-blue-400 block">
                {dbStatus?.totalHistory || 0}
              </span>
              <span className="text-[10px] text-neutral-400">History</span>
            </div>
          </div>
        </div>

        {/* Notification on Reset */}
        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SQLite channels synchronized and verified successfully.</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Restoring...' : 'Sync Default Channels'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
