import React, { useState } from 'react';
import { TFlixLogo } from '../common/TFlixLogo';
import { KeyRound, ShieldCheck, ArrowRight, Lock, MessageCircle, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AccessGateModalProps {
  isOpen: boolean;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onOpenAdmin: () => void;
}

export const AccessGateModal: React.FC<AccessGateModalProps> = ({
  isOpen,
  onVerify,
  onOpenAdmin,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestHelp, setShowRequestHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your unique TFLIX entry code.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const res = await onVerify(code);
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Invalid or expired entry code.');
    }
  };

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text.trim().toUpperCase());
      }
    } catch {
      // Ignore clipboard read failure
    }
  };

  const handleUseDemo = (sampleCode: string) => {
    setCode(sampleCode);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0c13] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/40 text-neutral-100 overflow-hidden">
        {/* Subtle Cyber Glow Backdrop */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header bar with Admin Login button */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800/80">
          <TFlixLogo size="md" showSubtitle={true} />
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-400 hover:text-white transition-all shadow-sm"
            title="Administrator Access Portal"
          >
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Access Gate Body */}
        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-[11px] font-semibold text-red-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private Cinema & Broadcast Security</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
              Subscriber Entry Pass Required
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              TFLIX streams 375+ high-speed live television networks and cinema channels. Enter your unique access code below to unlock unrestricted playback.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-red-500" />
                  Unique Access Code
                </span>
                <button
                  type="button"
                  onClick={handleQuickPaste}
                  className="text-neutral-500 hover:text-neutral-300 text-[10px] font-mono lowercase underline"
                >
                  paste clipboard
                </button>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="e.g. TFLIX-VIP-ACCESS"
                  className="w-full bg-[#121520] border border-neutral-700/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-mono font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all uppercase tracking-widest text-center"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-xl p-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-[#e50914] to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Activate & Enter TFLIX</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Passes For Instant Verification */}
          <div className="pt-2 border-t border-neutral-800/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
              Instant Ready Pass (Click to fill):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleUseDemo('TFLIX-VIP-ACCESS')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono transition-all hover:border-red-500"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>TFLIX-VIP-ACCESS</span>
                <span className="text-[9px] text-amber-400 font-bold ml-1">VIP</span>
              </button>

              <button
                type="button"
                onClick={() => handleUseDemo('TFLIX-PREMIUM-2026')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono transition-all hover:border-red-500"
              >
                <span>TFLIX-PREMIUM-2026</span>
                <span className="text-[9px] text-red-400 font-bold ml-1">1-Year</span>
              </button>
            </div>
          </div>

          {/* Request Code from Admin button */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 border-t border-neutral-800/80">
            <span className="text-[11px]">Need a new VIP access pass?</span>
            <a
              href="https://api.whatsapp.com/send?text=Hello%20Cybertech%20Admin!%20I%20would%20like%20to%20request%20an%20exclusive%20TFLIX%20OTT%20access%20code."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-800/60 text-emerald-400 font-semibold text-[11px] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contact Admin on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Footer brand stamp */}
        <div className="mt-6 pt-4 border-t border-neutral-900 text-center">
          <p className="text-[10px] text-neutral-500 font-mono">
            Protected by cybertech by cyberloops • Encrypted SQLite Vault
          </p>
        </div>
      </div>
    </div>
  );
};
