import React from 'react';
import Link from 'next/link';

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export function AuraLogo({
  size = 'md',
  showSubtitle = false,
  className = '',
  href,
}: AuraLogoProps) {
  const sizeConfig = {
    sm: {
      mark: 'w-7 h-7 text-[10px]',
      text: 'text-sm tracking-[0.2em]',
      gap: 'gap-2',
      radius: 'rounded-md',
      pad: 'p-1',
    },
    md: {
      mark: 'w-8 h-8 text-xs',
      text: 'text-base tracking-[0.25em]',
      gap: 'gap-2.5',
      radius: 'rounded-lg',
      pad: 'p-1.5',
    },
    lg: {
      mark: 'w-11 h-11 text-sm',
      text: 'text-xl tracking-[0.3em]',
      gap: 'gap-3.5',
      radius: 'rounded-xl',
      pad: 'p-2',
    },
  }[size];

  const content = (
    <div className={`flex items-center ${sizeConfig.gap} select-none ${className}`}>
      {/* Brand Mark: White background mixed with mild sandal (warm ivory/sandalwood) */}
      <div
        className={`${sizeConfig.mark} ${sizeConfig.radius} flex items-center justify-center font-black relative overflow-hidden shadow-sm border border-[#E9DFCF] shrink-0 transition-transform hover:scale-105`}
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5EC 50%, #F1E5D1 100%)',
        }}
      >
        {/* Subtle sandal shimmer accent */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 60%)',
          }}
        />

        {/* Crisp Bold Black Typography A */}
        <span className="relative z-10 text-black font-black tracking-tighter transform -translate-y-[0.5px]">
          A
        </span>

        {/* Minimalist sandal luxury dot */}
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-black" />
      </div>

      {/* Typography: AURA written in bold black / white in dark mode with mild sandal tag */}
      <div className="flex flex-col">
        <span className={`font-black text-white ${sizeConfig.text} font-mono leading-none`}>
          AURA
        </span>
        {showSubtitle && (
          <span className="text-[9px] font-semibold tracking-widest text-[#D1C2A5] uppercase mt-0.5">
            Vibe Coding
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
