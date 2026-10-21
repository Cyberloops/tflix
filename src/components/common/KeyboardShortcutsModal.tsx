import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play or Pause current live stream' },
    { key: 'F', desc: 'Toggle Fullscreen mode' },
    { key: 'M', desc: 'Mute or Unmute audio' },
    { key: '↑ / ↓', desc: 'Increase or Decrease volume' },
    { key: '← / →', desc: 'Switch to Previous or Next channel' },
    { key: 'P', desc: 'Toggle Picture-in-Picture (PiP)' },
    { key: 'D', desc: 'Open Stream Diagnostics' },
    { key: '?', desc: 'Show this keyboard guide' },
    { key: 'Esc', desc: 'Exit player or close modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#111219] border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-['Outfit']">Keyboard & Remote Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-neutral-800/80 text-xs">
          {shortcuts.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-300">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-neutral-900 border border-neutral-700/80 rounded-md font-mono text-amber-400 font-semibold shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
