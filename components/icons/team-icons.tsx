import React from 'react';

// VPL Logo: Stylized blazing volleyball with gold/orange flame trails and metallic VPL emblem
export function VplLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 drop-shadow-[0_0_12px_rgba(255,184,0,0.6)]">
        <defs>
          <linearGradient id="vplGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="40%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
          <linearGradient id="vplBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#0055FF" />
          </linearGradient>
          <linearGradient id="vplShield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A1E3F" />
            <stop offset="100%" stopColor="#040914" />
          </linearGradient>
        </defs>
        {/* Shield background */}
        <path d="M50 4L88 18V52C88 74 72 90 50 96C28 90 12 74 12 52V18L50 4Z" fill="url(#vplShield)" stroke="url(#vplGold)" strokeWidth="3" />
        {/* Speed / Flame arcs */}
        <path d="M22 28C32 20 68 20 78 28" stroke="url(#vplGold)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* Volleyball curved panels */}
        <circle cx="50" cy="46" r="22" fill="#0C2340" stroke="url(#vplGold)" strokeWidth="2.5" />
        <path d="M50 24C50 36 40 46 28 46" stroke="url(#vplGold)" strokeWidth="2.5" fill="none" />
        <path d="M50 46C62 46 72 36 72 24" stroke="#00D2FF" strokeWidth="2.5" fill="none" />
        <path d="M50 46C50 58 60 68 72 68" stroke="url(#vplGold)" strokeWidth="2.5" fill="none" />
        <path d="M50 46C38 46 28 56 28 68" stroke="#00D2FF" strokeWidth="2.5" fill="none" />
        {/* VPL Typography Banner */}
        <rect x="20" y="66" width="60" height="20" rx="4" fill="url(#vplGold)" />
        <text x="50" y="81" textAnchor="middle" fill="#050B18" fontFamily="var(--font-rajdhani), sans-serif" fontWeight="900" fontSize="15" letterSpacing="1.5">VPL</text>
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-condensed text-xl sm:text-2xl font-black tracking-wider text-white drop-shadow-md">
          VOLLEYBALL
        </span>
        <span className="font-heading text-[10px] sm:text-xs font-bold tracking-[0.25em] text-sky-400">
          PREMIER LEAGUE
        </span>
      </div>
    </div>
  );
}

// Team Alpha - Majestic Golden Lion
export function TeamAlphaLion({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-[0_0_12px_rgba(255,184,0,0.6)]">
        <defs>
          <linearGradient id="lionGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Lion Mane outer shapes */}
        <path d="M50 10L62 20L75 14L80 28L92 32L88 46L96 56L86 66L88 80L74 80L66 92L50 86L34 92L26 80L12 80L14 66L4 56L12 46L8 32L20 28L25 14L38 20L50 10Z" fill="url(#lionGold)" />
        {/* Lion Face Inset */}
        <path d="M50 24L65 35L60 62L50 78L40 62L35 35L50 24Z" fill="#1C1405" />
        {/* Golden Facial Features */}
        {/* Eyes */}
        <polygon points="42,42 47,45 43,47" fill="#FFE066" />
        <polygon points="58,42 53,45 57,47" fill="#FFE066" />
        {/* Forehead Brow */}
        <path d="M40 38L50 44L60 38" stroke="#FFE066" strokeWidth="2.5" strokeLinecap="round" />
        {/* Nose & Snout */}
        <polygon points="47,56 53,56 50,61" fill="#FFE066" />
        <path d="M50 61V68M50 68L44 65M50 68L56 65" stroke="#FFE066" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cheek Accents */}
        <path d="M37 50L30 52M63 50L70 52" stroke="#FFE066" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Team Bravo - Fierce Crimson Raging Bull
export function TeamBravoBull({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-[0_0_12px_rgba(255,35,69,0.7)]">
        <defs>
          <linearGradient id="bullRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D6D" />
            <stop offset="50%" stopColor="#FF2345" />
            <stop offset="100%" stopColor="#B3001E" />
          </linearGradient>
        </defs>
        {/* Bull Horns */}
        <path d="M14 26C16 12 30 14 36 24L30 32C24 24 18 22 14 26Z" fill="#FFFFFF" />
        <path d="M86 26C84 12 70 14 64 24L70 32C76 24 82 22 86 26Z" fill="#FFFFFF" />
        {/* Bull Head */}
        <path d="M28 28L50 20L72 28L76 46L66 76L50 90L34 76L24 46L28 28Z" fill="url(#bullRed)" />
        {/* Facial Shadow & Structure */}
        <polygon points="50,28 62,38 58,66 50,82 42,66 38,38" fill="#4A0510" />
        {/* Eyes (Fierce angular white/yellow) */}
        <polygon points="40,46 47,48 41,52" fill="#FFFFFF" />
        <polygon points="60,46 53,48 59,52" fill="#FFFFFF" />
        {/* Snout & Nostrils */}
        <rect x="42" y="68" width="16" height="12" rx="4" fill="url(#bullRed)" />
        <ellipse cx="46" cy="74" rx="2" ry="3" fill="#FFFFFF" />
        <ellipse cx="54" cy="74" rx="2" ry="3" fill="#FFFFFF" />
        {/* Bull Ring */}
        <path d="M46 78C46 84 54 84 54 78" stroke="#FFD700" strokeWidth="2.5" fill="none" />
      </svg>
    </div>
  );
}

// Team Charlie - Menacing Emerald/Silver Wolf
export function TeamCharlieWolf({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-[0_0_12px_rgba(0,216,120,0.7)]">
        <defs>
          <linearGradient id="wolfGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#00D878" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Wolf Ears */}
        <polygon points="26,12 36,36 18,34" fill="url(#wolfGreen)" />
        <polygon points="74,12 82,34 64,36" fill="url(#wolfGreen)" />
        <polygon points="28,18 34,32 23,31" fill="#E5E7EB" />
        <polygon points="72,18 77,31 66,32" fill="#E5E7EB" />
        {/* Wolf Head Outline */}
        <path d="M26 34L50 26L74 34L86 52L76 68L64 74L50 92L36 74L24 68L14 52L26 34Z" fill="#062817" stroke="url(#wolfGreen)" strokeWidth="2.5" />
        {/* Silver Mane Highlights */}
        <path d="M50 36L62 48L58 72L50 84L42 72L38 48L50 36Z" fill="#134E2E" />
        {/* Menacing Eyes */}
        <polygon points="38,48 46,51 40,54" fill="#34D399" />
        <polygon points="62,48 54,51 60,54" fill="#34D399" />
        {/* Wolf Snout & Fangs */}
        <polygon points="46,68 54,68 50,74" fill="#00D878" />
        <polygon points="44,78 47,83 48,78" fill="#FFFFFF" />
        <polygon points="56,78 53,83 52,78" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// Team Delta - Noble Purple/White Charging Stallion
export function TeamDeltaHorse({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-[0_0_12px_rgba(160,32,240,0.7)]">
        <defs>
          <linearGradient id="horsePurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#A020F0" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>
        </defs>
        {/* Flowing Mane */}
        <path d="M54 10L68 18L60 28L78 30L66 44L82 48L68 64L80 72L60 76L66 88L48 84L54 10Z" fill="url(#horsePurple)" />
        {/* Horse Head Profile */}
        <path d="M50 14L40 26L32 38L24 58L22 68L28 72L40 68L48 56L56 50L54 36L50 14Z" fill="#F8FAFC" />
        {/* Horse Muzzle */}
        <ellipse cx="26" cy="67" rx="3" ry="4" fill="#9333EA" />
        {/* Eye */}
        <polygon points="38,40 43,42 40,45" fill="#581C87" />
        {/* Bridle / Athletic Lines */}
        <path d="M38 32L30 52M30 52L24 66M30 52L46 54" stroke="#A020F0" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 3D-styled realistic Volleyball on stadium floor
export function Volleyball3D({ className = 'h-14 w-14' }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className} drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <radialGradient id="vballShade" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>
        </defs>
        {/* Ball Base */}
        <circle cx="50" cy="50" r="46" fill="#F0F4F8" stroke="#1E293B" strokeWidth="2.5" />
        {/* Blue Panels */}
        <path d="M50 4C30 18 24 38 28 58C34 46 42 36 54 28C64 22 76 16 80 8C72 5 61 4 50 4Z" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
        <path d="M86 28C74 38 66 52 64 68C74 66 84 60 92 50C95 42 96 34 94 28C92 28 89 28 86 28Z" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
        {/* Yellow / Gold Panels */}
        <path d="M28 58C24 68 25 80 32 90C40 84 48 76 52 66C44 64 36 62 28 58Z" fill="#EAB308" stroke="#0F172A" strokeWidth="2" />
        <path d="M52 66C56 76 64 84 74 90C82 82 86 72 88 62C80 64 71 66 64 68C60 67 56 67 52 66Z" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
        <path d="M12 36C6 44 4 54 6 64C14 62 22 60 28 58C24 48 24 38 28 28C22 30 16 32 12 36Z" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
        {/* Center Panel Junction Lines */}
        <path d="M50 4C42 22 42 42 50 50C58 58 78 58 96 50" stroke="#0F172A" strokeWidth="2.5" fill="none" />
        <path d="M28 58C36 54 44 52 50 50C54 42 58 34 64 28" stroke="#0F172A" strokeWidth="2.5" fill="none" />
        <path d="M50 50C48 60 48 70 50 82" stroke="#0F172A" strokeWidth="2.5" fill="none" />
        {/* Spherical Shading Overlay */}
        <circle cx="50" cy="50" r="46" fill="url(#vballShade)" pointerEvents="none" />
      </svg>
    </div>
  );
}

export function getTeamLogo(teamName: string, className = 'h-10 w-10') {
  const norm = (teamName || '').toLowerCase();
  if (norm.includes('alpha')) return <TeamAlphaLion className={className} />;
  if (norm.includes('bravo')) return <TeamBravoBull className={className} />;
  if (norm.includes('charlie')) return <TeamCharlieWolf className={className} />;
  if (norm.includes('delta')) return <TeamDeltaHorse className={className} />;
  return <TeamAlphaLion className={className} />;
}

