import React from 'react';

// NGPL Emblem: Uses /logo.png directly
export function VplEmblem({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Narayana Guru Premier League"
      className={`${className} object-contain drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]`}
    />
  );
}

// NGPL Logo: Uses /logo.png with Narayana Guru Premier League Typography
export function VplLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Narayana Guru Premier League"
        className="h-11 w-11 object-contain drop-shadow-[0_0_12px_rgba(255,184,0,0.6)] shrink-0"
      />
      <div className="flex flex-col leading-none">
        <span className="font-condensed text-lg sm:text-xl font-black tracking-wider text-white drop-shadow-md">
          NARAYANA GURU
        </span>
        <span className="font-heading text-[10px] sm:text-xs font-bold tracking-[0.2em] text-sky-400">
          PREMIER LEAGUE
        </span>
      </div>
    </div>
  );
}

// Dynamic Team Slot Badge: Displays real team logo when joined, or clean slot number when open
export function TeamSlotBadge({
  slotNum,
  teamName,
  logoUrl,
  isJoined,
  size = 'md',
}: {
  slotNum: number;
  teamName?: string;
  logoUrl?: string | null;
  isJoined: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px] rounded-lg',
    md: 'h-14 w-14 text-base rounded-2xl',
    lg: 'h-20 w-20 text-2xl rounded-3xl',
  };

  if (isJoined && logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={teamName || `Team Slot ${slotNum}`}
        className={`${sizeClasses[size]} object-cover border border-white/20 shadow-[0_0_20px_rgba(0,140,255,0.35)] shrink-0`}
      />
    );
  }

  if (isJoined) {
    const initials = teamName
      ? teamName
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 3)
          .toUpperCase()
      : `T${slotNum}`;

    return (
      <div
        className={`${sizeClasses[size]} border border-sky-400/50 bg-gradient-to-br from-sky-500/25 to-blue-700/40 flex items-center justify-center font-heading font-black text-white shadow-[0_0_20px_rgba(0,140,255,0.3)] shrink-0`}
      >
        {initials}
      </div>
    );
  }

  // Not Joined (Slot open / waiting to join)
  return (
    <div
      className={`${sizeClasses[size]} border border-dashed border-white/20 bg-slate-950/70 flex flex-col items-center justify-center text-slate-400 shadow-inner shrink-0`}
    >
      <span className="font-mono font-black text-sky-400">#{slotNum}</span>
    </div>
  );
}

// Fallback legacy icons kept for backwards compatibility if referenced
export function TeamAlphaLion({ className = 'h-10 w-10' }: { className?: string }) {
  return <TeamSlotBadge slotNum={1} isJoined={false} size="md" />;
}

export function TeamBravoBull({ className = 'h-10 w-10' }: { className?: string }) {
  return <TeamSlotBadge slotNum={2} isJoined={false} size="md" />;
}

export function TeamCharlieWolf({ className = 'h-10 w-10' }: { className?: string }) {
  return <TeamSlotBadge slotNum={3} isJoined={false} size="md" />;
}

export function TeamDeltaHorse({ className = 'h-10 w-10' }: { className?: string }) {
  return <TeamSlotBadge slotNum={4} isJoined={false} size="md" />;
}

export function Volleyball3D({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Volleyball"
      className={`${className} object-contain drop-shadow-[0_0_15px_rgba(255,184,0,0.6)]`}
    />
  );
}
