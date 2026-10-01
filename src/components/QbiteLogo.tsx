import React from 'react';

interface QbiteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitle?: string;
  glow?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const QbiteLogo: React.FC<QbiteLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitle = 'SVCE Cafe',
  glow = true,
  className = '',
  variant = 'full'
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  if (variant === 'icon-only') {
    return (
      <div className={`relative ${iconSizes[size]} shrink-0 ${glow ? 'glow-orange-sm' : ''} ${className}`}>
        <img
          src="/icons/qbite-icon-512.png"
          alt="QBite – SVCE Cafe"
          className="w-full h-full rounded-full object-contain select-none shadow-md"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Circular Logo Badge */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 rounded-full overflow-hidden bg-[#0D0D0D] border border-white/10 flex items-center justify-center shadow-lg ${
          glow ? 'glow-orange-sm' : ''
        }`}
      >
        <img
          src="/icons/qbite-icon-192.png"
          alt="QBite"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {/* Official Typography */}
      <div className="leading-none">
        <div className="flex items-center">
          <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
            QBite
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`block font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mt-0.5 ${subSizes[size]}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
