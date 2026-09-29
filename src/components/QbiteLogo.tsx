import React from 'react';

interface QbiteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
  glow?: boolean;
  className?: string;
}

export const QbiteLogo: React.FC<QbiteLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitle = 'SVCE Cafe',
  glow = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl'
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Signature "q" + Token Emblem */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl md:rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-white/10 flex items-center justify-center shrink-0 shadow-lg ${
          glow ? 'glow-orange-sm' : ''
        }`}
      >
        {/* Subtle orange accent corner */}
        <div className="absolute top-0 right-0 w-2 h-2 rounded-tr-lg bg-[#FF6A00] opacity-80" />

        {/* Custom SVG mark: Geometric "q" formed with a token ring & bite cutout */}
        <svg
          viewBox="0 0 32 32"
          className="w-3/5 h-3/5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main outer ring with bite arc */}
          <path
            d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C18.2 26 20.22 25.29 21.87 24.1L24.5 26.5C24.8 26.8 25.3 26.6 25.3 26.2V15C25.3 10.03 21.14 6 16 6ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z"
            fill="#FFFFFF"
          />
          {/* The radiant orange "bite" core dot inside token */}
          <circle cx="16" cy="16" r="3.2" fill="#FF6A00" />
          <circle cx="21" cy="11" r="1.5" fill="#FF9D2E" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="leading-none">
        <div className="flex items-center gap-0.5">
          <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
            q<span className="text-[#FF6A00]">Bite</span>
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`block font-semibold uppercase tracking-[0.18em] text-[#A1A1A1] mt-0.5 ${subSizes[size]}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
