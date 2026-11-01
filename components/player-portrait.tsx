'use client';

import React from 'react';

interface PlayerPortraitProps {
  name?: string;
  photoUrl?: string | null;
  position?: string;
  jerseyNumber?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export function PlayerPortrait({
  name = 'Player',
  photoUrl,
  jerseyNumber = 7,
  size = 'md',
  className = '',
}: PlayerPortraitProps) {
  if (photoUrl) {
    return (
      <div className={`relative overflow-hidden rounded-full ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Hero Athlete Illustration for Arjun Nath / Center Stage
  if (size === 'hero') {
    return (
      <div className={`relative flex items-end justify-center select-none ${className}`}>
        {/* Stadium floor spotlight halo under feet */}
        <div className="absolute -bottom-6 h-12 w-64 rounded-full bg-sky-500/30 blur-xl" />
        <div className="absolute -bottom-2 h-8 w-48 rounded-full border border-sky-400/60 bg-sky-400/20 shadow-[0_0_30px_rgba(56,189,248,0.7)]" />

        <svg
          viewBox="0 0 320 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto max-h-[440px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] filter transition-all duration-300"
        >
          <defs>
            <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0AC82" />
              <stop offset="50%" stopColor="#C98858" />
              <stop offset="100%" stopColor="#A76739" />
            </linearGradient>
            <linearGradient id="hairDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#251914" />
              <stop offset="100%" stopColor="#0F0906" />
            </linearGradient>
            <linearGradient id="jerseyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="35%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0B1E48" />
            </linearGradient>
            <linearGradient id="armMuscle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C98858" />
              <stop offset="50%" stopColor="#E0AC82" />
              <stop offset="100%" stopColor="#A76739" />
            </linearGradient>
          </defs>

          {/* Athletic Neck */}
          <path d="M142 165L142 205H178L178 165Z" fill="#C98858" />
          <path d="M148 185C154 195 166 195 172 185" stroke="#A76739" strokeWidth="2" strokeLinecap="round" />

          {/* Head & Athletic Jawline */}
          <path
            d="M136 120C136 90 148 75 160 75C172 75 184 90 184 120C184 148 174 168 160 168C146 168 136 148 136 120Z"
            fill="url(#skinTone)"
          />

          {/* Curly Volleyball Player Haircut */}
          <path
            d="M130 110C128 85 140 60 160 60C180 60 192 85 190 110C190 118 186 126 186 126C186 126 182 102 178 96C174 90 162 88 152 92C142 96 136 112 136 120C134 116 130 116 130 110Z"
            fill="url(#hairDark)"
          />
          {/* Curls texture */}
          <circle cx="145" cy="72" r="8" fill="#1C1410" />
          <circle cx="160" cy="68" r="9" fill="#251914" />
          <circle cx="175" cy="73" r="8" fill="#1C1410" />
          <circle cx="138" cy="85" r="7" fill="#1C1410" />
          <circle cx="182" cy="85" r="7" fill="#1C1410" />

          {/* Confident Facial Features */}
          {/* Eyebrows */}
          <path d="M143 112L152 110M168 110L177 112" stroke="#251914" strokeWidth="3" strokeLinecap="round" />
          {/* Eyes */}
          <ellipse cx="148" cy="118" rx="4" ry="2.5" fill="#251914" />
          <ellipse cx="172" cy="118" rx="4" ry="2.5" fill="#251914" />
          <circle cx="149" cy="117.5" r="1" fill="#FFFFFF" />
          <circle cx="173" cy="117.5" r="1" fill="#FFFFFF" />
          {/* Nose */}
          <path d="M160 116V132L164 133" stroke="#A76739" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Confident Smile / Mouth */}
          <path d="M152 144C156 147 164 147 168 144" stroke="#874D28" strokeWidth="2.5" strokeLinecap="round" />
          {/* Stubble / athletic shadow */}
          <path d="M148 150C154 156 166 156 172 150" stroke="#A76739" strokeWidth="2" strokeDasharray="1 3" strokeLinecap="round" />

          {/* Jersey Shoulders & Torso */}
          <path
            d="M85 235L110 200L145 198L175 198L210 200L235 235L228 360L92 360L85 235Z"
            fill="url(#jerseyBlue)"
          />

          {/* White Athletic Jersey Collar Accent */}
          <path
            d="M136 200C144 218 176 218 184 200L176 198C170 210 150 210 144 198Z"
            fill="#FFFFFF"
          />
          {/* Jersey Shoulder Wings / White piping */}
          <path d="M110 200L95 240M210 200L225 240" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />

          {/* Large Athletic Jersey Number 7 */}
          <text
            x="160"
            y="285"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="var(--font-orbitron), sans-serif"
            fontWeight="900"
            fontSize="54"
            letterSpacing="2"
            opacity="0.95"
          >
            {jerseyNumber}
          </text>

          {/* Crossed Muscular Arms in Front */}
          {/* Left Bicep & Arm */}
          <path
            d="M78 245C68 285 78 335 110 345L150 345L138 315L108 308C98 288 95 265 98 245Z"
            fill="url(#armMuscle)"
            stroke="#1D4ED8"
            strokeWidth="3"
          />
          {/* Right Bicep & Arm */}
          <path
            d="M242 245C252 285 242 335 210 345L170 345L182 315L212 308C222 288 225 265 222 245Z"
            fill="url(#armMuscle)"
            stroke="#1D4ED8"
            strokeWidth="3"
          />
          {/* Crossed Forearms */}
          <rect x="110" y="315" width="100" height="32" rx="16" fill="url(#armMuscle)" stroke="#A76739" strokeWidth="1.5" />
          {/* Crossed Hands */}
          <path d="M106 318C100 324 100 334 108 338L120 342" stroke="#874D28" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M214 318C220 324 220 334 212 338L200 342" stroke="#874D28" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Small or Medium Avatar Thumbnail for queues and squad slots
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-400/40 bg-gradient-to-br from-slate-800 to-slate-950 shadow-md ${
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
      } ${className}`}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="20" cy="20" r="20" fill="#0C1B33" />
        {/* Head */}
        <circle cx="20" cy="14" r="7" fill="#C98858" />
        {/* Hair */}
        <path d="M13 13C13 8 16 6 20 6C24 6 27 8 27 13C25 12 23 11 20 11C17 11 15 12 13 13Z" fill="#1C1410" />
        {/* Athletic Jersey Torso */}
        <path d="M7 36C7 27 12 23 20 23C28 23 33 27 33 36Z" fill="#1D4ED8" />
        <path d="M17 23C18 26 22 26 23 23Z" fill="#FFFFFF" />
      </svg>
      <span className="sr-only">{name}</span>
    </div>
  );
}

