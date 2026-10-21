import React from 'react';

interface TFlixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const TFlixLogo: React.FC<TFlixLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7 text-sm', text: 'text-base', sub: 'text-[8px]' },
    md: { icon: 'w-9 h-9 text-lg', text: 'text-lg', sub: 'text-[9px]' },
    lg: { icon: 'w-12 h-12 text-2xl', text: 'text-2xl', sub: 'text-[11px]' },
    xl: { icon: 'w-16 h-16 text-3xl', text: 'text-3xl', sub: 'text-[12px]' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Dynamic Cybertech Glowing Holographic T Logo Badge */}
      <div className={`relative ${current.icon} rounded-xl bg-gradient-to-br from-red-600 via-[#e50914] to-red-950 flex items-center justify-center font-black font-['Outfit'] shadow-lg shadow-red-600/30 border border-red-500/40 group-hover:shadow-red-500/60 group-hover:scale-105 transition-all overflow-hidden`}>
        {/* Futuristic Cyber Light Angle */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
        
        {/* Styled Logo SVG Symbol */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Cyber Accent Ring */}
          <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* Red Glowing 'T' Bar */}
          <path
            d="M9 11C9 9.89543 9.89543 9 11 9H29C30.1046 9 31 9.89543 31 11V14.5C31 15.0523 30.5523 15.5 30 15.5H22.5V29C22.5 30.1046 21.6046 31 20.5 31H19.5C18.3954 31 17.5 30.1046 17.5 29V15.5H10C9.44772 15.5 9 15.0523 9 14.5V11Z"
            fill="white"
          />
          {/* Electric Speed Play Marker */}
          <polygon
            points="23,17 31,21.5 23,26"
            fill="#ff4d4d"
            className="filter drop-shadow"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-['Outfit'] font-black tracking-wider uppercase ${current.text} leading-none flex items-center text-white`}>
          T<span className="text-red-600">FLIX</span>
        </div>
        {showSubtitle && (
          <span className={`uppercase tracking-[0.2em] font-semibold text-neutral-400 ${current.sub} mt-0.5 flex items-center gap-1`}>
            <span>cybertech</span>
            <span className="text-red-500 font-mono text-[8px]">•</span>
            <span className="text-neutral-500">by cyberloops</span>
          </span>
        )}
      </div>
    </div>
  );
};
