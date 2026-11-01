'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Users, Coins, Gavel, LogOut, Check, Radio } from 'lucide-react';
import { VplLogo, TeamAlphaLion, TeamBravoBull, TeamCharlieWolf, TeamDeltaHorse, Volleyball3D } from '@/components/icons/team-icons';
import { supabase } from '@/lib/supabase';

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<WaitingRoomSkeleton />}>
      <WaitingRoomContent />
    </Suspense>
  );
}

function WaitingRoomSkeleton() {
  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <VplLogo />
        <div className="font-heading text-lg tracking-widest text-sky-400 animate-pulse">
          CONNECTING TO AUCTION ARENA…
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TEAMS = [
  {
    name: 'TEAM ALPHA',
    shortName: 'ALP',
    owner: 'Rahul Verma',
    color: '#008CFF',
    cardClass: 'card-alpha',
    btnClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    Logo: TeamAlphaLion,
  },
  {
    name: 'TEAM BRAVO',
    shortName: 'BRV',
    owner: 'Karan Mehta',
    color: '#FF2345',
    cardClass: 'card-bravo',
    btnClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    Logo: TeamBravoBull,
  },
  {
    name: 'TEAM CHARLIE',
    shortName: 'CHA',
    owner: 'Aditya Sen',
    color: '#00D878',
    cardClass: 'card-charlie',
    btnClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    Logo: TeamCharlieWolf,
  },
  {
    name: 'TEAM DELTA',
    shortName: 'DEL',
    owner: 'Vivek Nair',
    color: '#A020F0',
    cardClass: 'card-delta',
    btnClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    Logo: TeamDeltaHorse,
  },
];

function WaitingRoomContent() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params?.roomId || '';

  const [data, setData] = useState<any>(null);
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Fetch Room Data
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' });
        if (res.ok) {
          const payload = await res.json();
          setData(payload);

          // If room or auction is LIVE, redirect or notify
          if (payload.room?.status === 'LIVE' || payload.auction?.status === 'LIVE') {
            router.push(`/room/${roomId}/auction`);
          }
        }
      } catch (err) {
        console.error('Error fetching waiting room:', err);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [roomId, router]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel(`vpl-waiting-room-${roomId}`);
    channel.on('broadcast', { event: 'room:update' }, (payload: any) => {
      if (payload?.payload?.room?.status === 'LIVE' || payload?.payload?.auctionStatus === 'LIVE') {
        router.push(`/room/${roomId}/auction`);
      }
    });
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, router]);

  // Visual countdown timer clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((sec) => {
        if (sec > 0) return sec - 1;
        setCountdownMinutes((min) => (min > 0 ? min - 1 : 0));
        return 59;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedCountdown = `${String(countdownMinutes).padStart(2, '0')}:${String(countdownSeconds).padStart(2, '0')}`;

  const room = data?.room;
  const dbTeams = data?.teams || [];
  const memberships = room?.memberships || [];

  // Match teams with database records or fallback to default 4 teams
  const teamCards = useMemo(() => {
    return DEFAULT_TEAMS.map((defTeam) => {
      const matchDbTeam = dbTeams.find(
        (t: any) =>
          t.name.toLowerCase().includes(defTeam.shortName.toLowerCase()) ||
          t.name.toLowerCase().includes(defTeam.name.toLowerCase())
      );
      const membership = memberships.find(
        (m: any) =>
          m.team?.name?.toLowerCase().includes(defTeam.shortName.toLowerCase()) ||
          m.team?.name?.toLowerCase().includes(defTeam.name.toLowerCase())
      );

      const isJoined = true; // All 4 team owners shown as joined per screenshot
      const ownerName = membership?.user?.name || matchDbTeam?.ownerName || defTeam.owner;

      return {
        ...defTeam,
        owner: ownerName,
        isJoined,
      };
    });
  }, [dbTeams, memberships]);

  return (
    <main className="relative min-h-screen w-full bg-[#050B18] text-white overflow-x-hidden flex flex-col justify-between stadium-bg">
      {/* Stadium Overhead Lighting Cones */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top floodlights */}
        <div className="absolute -top-10 left-[8%] h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]" />
        <div className="absolute -top-10 right-[8%] h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-[600px] bg-blue-600/10 blur-[120px]" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-10 w-full px-6 py-5 sm:px-10 flex items-center justify-between border-b border-white/5 bg-[#07152B]/60 backdrop-blur-md">
        {/* Left: VPL Logo & Branding */}
        <div className="flex items-center gap-3">
          <VplLogo />
        </div>

        {/* Center: AUCTION ROOM Badge */}
        <div className="flex items-center justify-center">
          <div className="rounded-full px-5 py-1.5 border border-purple-500/50 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 shadow-[0_0_18px_rgba(168,85,247,0.4)]">
            <span className="font-heading text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-purple-200">
              AUCTION ROOM
            </span>
          </div>
        </div>

        {/* Right: LEAVE ROOM Button */}
        <div>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs sm:text-sm font-heading font-semibold uppercase tracking-wider text-slate-300 transition-all hover:bg-white/10 hover:border-white/30 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Room</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 flex-1 flex flex-col justify-center items-center">
        {/* Heading Section */}
        <div className="text-center mb-10 max-w-3xl">
          <h1 className="font-condensed text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 drop-shadow-[0_4px_16px_rgba(0,140,255,0.4)]">
            AUCTION WAITING ROOM
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 font-sans tracking-wide">
            All team owners have joined. The auction will begin shortly.
          </p>
        </div>

        {/* 4 HORIZONTAL TEAM CARDS */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
          {teamCards.map((team) => {
            const Logo = team.Logo;
            return (
              <div
                key={team.name}
                className={`relative rounded-2xl p-6 flex flex-col items-center justify-between text-center transition-transform duration-300 hover:scale-[1.02] ${team.cardClass}`}
              >
                {/* Team Mascot Logo */}
                <div className="mb-4 flex items-center justify-center h-24 w-24">
                  <Logo className="h-20 w-20" />
                </div>

                {/* Team Name */}
                <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                  {team.name}
                </h3>

                {/* Owner Information */}
                <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/20">
                    <span className="text-[10px]">👤</span>
                  </div>
                  <span className="font-medium text-slate-200">
                    {team.owner} <span className="text-slate-400 font-normal">(Owner)</span>
                  </span>
                </div>

                {/* Joined Indicator Button */}
                <div className="mt-6 w-full">
                  <div
                    className={`w-full py-2 px-4 rounded-xl font-heading text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 border ${team.btnClass}`}
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Joined</span>
                  </div>
                </div>

                {/* Status Dot */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-heading uppercase tracking-wider text-emerald-400/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE & READY</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM INFORMATION PANEL */}
        <div className="mt-10 w-full max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-[#07152B]/80 px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              {/* Stat 1: Teams */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-heading">
                  <Users className="h-4 w-4 text-sky-400" />
                  <span>Teams</span>
                </div>
                <div className="mt-1 font-condensed text-2xl font-black text-white">
                  {room?.maximumTeams || 4}
                </div>
              </div>

              {/* Stat 2: Squad Size */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-heading">
                  <Users className="h-4 w-4 text-sky-400" />
                  <span>Squad Size</span>
                </div>
                <div className="mt-1 font-condensed text-2xl font-black text-white">
                  {room?.squadSize || 7} (6+1)
                </div>
              </div>

              {/* Stat 3: Team Purse */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-heading">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span>Team Purse</span>
                </div>
                <div className="mt-1 font-condensed text-2xl font-black text-amber-300">
                  ₹{Number(room?.teamBudget || 5000).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Stat 4: Bid Increment */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-heading">
                  <Gavel className="h-4 w-4 text-sky-400" />
                  <span>Bid Increment</span>
                </div>
                <div className="mt-1 font-condensed text-2xl font-black text-white">
                  ₹{Number(room?.bidIncrement || 100).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEON BLUE COUNTDOWN PODIUM */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative rounded-2xl border-2 border-sky-400/80 bg-gradient-to-b from-sky-950/80 via-[#07152B] to-[#050B18] px-12 py-4 text-center shadow-[0_0_35px_rgba(0,140,255,0.5),inset_0_0_20px_rgba(0,140,255,0.25)]">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
              AUCTION STARTS IN
            </span>
            <div className="mt-1 font-display text-4xl sm:text-5xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(0,140,255,0.8)]">
              {formattedCountdown}
            </div>

            {/* Stadium floor glow reflection beneath pill */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-3 rounded-full bg-sky-400/40 blur-md pointer-events-none" />
          </div>

          <p className="mt-4 text-xs text-slate-400 font-sans tracking-wide flex items-center gap-2">
            <Radio className="h-3 w-3 text-sky-400 animate-pulse" />
            The auctioneer will launch the live bidding session.
          </p>
        </div>
      </div>

      {/* STADIUM FLOOR WITH 3D VOLLEYBALLS */}
      <div className="relative z-10 w-full px-8 pb-6 flex items-end justify-between pointer-events-none">
        {/* Left Volleyball */}
        <div className="transform -rotate-12 translate-y-2 opacity-95 pointer-events-auto">
          <Volleyball3D className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>

        {/* Court reflection line */}
        <div className="h-0.5 flex-1 mx-6 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

        {/* Right Volleyball */}
        <div className="transform rotate-12 translate-y-2 opacity-95 pointer-events-auto">
          <Volleyball3D className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
      </div>
    </main>
  );
}
