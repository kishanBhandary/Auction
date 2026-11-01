'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Users, Coins, Gavel, LogOut, Check, Radio, PlusCircle, Sparkles, Star } from 'lucide-react';
import { VplLogo, TeamSlotBadge, Volleyball3D } from '@/components/icons/team-icons';
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

const SLOT_STYLES = [
  { cardClass: 'card-alpha', glowColor: '#008CFF' },
  { cardClass: 'card-bravo', glowColor: '#FF2345' },
  { cardClass: 'card-charlie', glowColor: '#00D878' },
  { cardClass: 'card-delta', glowColor: '#A020F0' },
];

function WaitingRoomContent() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params?.roomId || '';

  const [data, setData] = useState<any>(null);

  // Fetch Room Data
  const fetchRoom = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        setData(payload);

        // If room or auction is LIVE, redirect to auction
        if (payload.room?.status === 'LIVE' || payload.auction?.status === 'LIVE') {
          router.push(`/room/${roomId}/auction`);
        }
      }
    } catch (err) {
      console.error('Error fetching waiting room:', err);
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 2500);
    return () => clearInterval(interval);
  }, [roomId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel(`vpl-waiting-room-${roomId}`);
    channel.on('broadcast', { event: 'room:update' }, (payload: any) => {
      fetchRoom();
      if (payload?.payload?.room?.status === 'LIVE' || payload?.payload?.auctionStatus === 'LIVE') {
        router.push(`/room/${roomId}/auction`);
      }
    });
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, router]);

  const room = data?.room;
  const dbTeams = data?.teams || [];
  const memberships = room?.memberships || [];
  const maxTeams = Number(room?.maximumTeams || 4);

  // Dynamically map slots based on joined teams in this room
  const dynamicSlots = useMemo(() => {
    return Array.from({ length: maxTeams }).map((_, index) => {
      const theme = SLOT_STYLES[index % SLOT_STYLES.length];
      const membership = memberships[index] || null;
      const team = dbTeams[index] || membership?.team || null;
      const isJoined = Boolean(team || membership);

      const teamName = team?.name || membership?.team?.name || `Slot ${index + 1}`;
      const ownerName = membership?.user?.name || team?.ownerName || 'Awaiting Owner';
      const logoUrl = team?.logoUrl || membership?.team?.logoUrl || null;
      const iconPlayer = team?.iconPlayer || null;
      const purchasedCount = team?.purchasedCount ?? (iconPlayer ? 1 : 0);

      return {
        slotIndex: index + 1,
        teamName,
        ownerName,
        logoUrl,
        iconPlayer,
        purchasedCount,
        isJoined,
        theme,
      };
    });
  }, [maxTeams, memberships, dbTeams]);

  const joinedCount = dynamicSlots.filter((s) => s.isJoined).length;

  return (
    <main className="relative min-h-screen w-full bg-[#050B18] text-white overflow-x-hidden flex flex-col justify-between stadium-bg">
      {/* Stadium Overhead Lighting Cones */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-[8%] h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]" />
        <div className="absolute -top-10 right-[8%] h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-[600px] bg-blue-600/10 blur-[120px]" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-10 w-full px-6 py-5 sm:px-10 flex items-center justify-between border-b border-white/5 bg-[#07152B]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <VplLogo />
        </div>

        {/* Center: AUCTION ROOM Badge */}
        <div className="flex items-center justify-center">
          <div className="rounded-full px-5 py-1.5 border border-purple-500/50 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 shadow-[0_0_18px_rgba(168,85,247,0.4)]">
            <span className="font-heading text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-purple-200">
              AUCTION ROOM {room?.roomCode ? `• ${room.roomCode}` : ''}
            </span>
          </div>
        </div>

        {/* Right: LEAVE ROOM & JOIN Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/team/join?roomCode=${room?.roomCode || ''}`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-xs font-heading font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/25 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Join as Team</span>
          </Link>

          <Link
            href="/teams"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs sm:text-sm font-heading font-semibold uppercase tracking-wider text-slate-300 transition-all hover:bg-white/10 hover:border-white/30 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave</span>
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
            {joinedCount >= maxTeams
              ? 'All team owners have joined. The auction will begin shortly.'
              : `${joinedCount} of ${maxTeams} team owners connected. Waiting for remaining teams.`}
          </p>
        </div>

        {/* DYNAMIC TEAM SLOTS (GRID) */}
        <div className={`w-full grid gap-6 max-w-6xl ${
          maxTeams <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' : maxTeams === 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {dynamicSlots.map((slot) => {
            return (
              <div
                key={`slot-${slot.slotIndex}`}
                className={`relative rounded-2xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 ${
                  slot.isJoined ? slot.theme.cardClass : 'rounded-2xl border-2 border-dashed border-white/15 bg-[#07152B]/40 hover:border-white/30'
                }`}
              >
                {/* Team Logo or Slot Badge */}
                <div className="mb-4 flex items-center justify-center h-24 w-24">
                  <TeamSlotBadge
                    slotNum={slot.slotIndex}
                    teamName={slot.teamName}
                    logoUrl={slot.logoUrl}
                    isJoined={slot.isJoined}
                    size="lg"
                  />
                </div>

                {/* Team Name */}
                <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                  {slot.teamName}
                </h3>

                {/* Owner Information */}
                <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/20">
                    <span className="text-[10px]">👤</span>
                  </div>
                  <span className="font-medium text-slate-200">
                    {slot.ownerName}
                  </span>
                </div>

                {/* Franchise Icon Player Tag */}
                {slot.isJoined && slot.iconPlayer && (
                  <div className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                    {slot.iconPlayer.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slot.iconPlayer.photoUrl}
                        alt="Icon Player"
                        className="h-5 w-5 rounded-full object-cover border border-amber-400 shrink-0"
                      />
                    ) : (
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    <div className="text-left leading-tight truncate">
                      <span className="text-[11px] font-heading font-bold text-amber-300 block truncate">
                        ★ {slot.iconPlayer.name}
                      </span>
                      <span className="text-[9px] text-slate-300 font-sans block truncate">
                        Icon Player ({slot.purchasedCount}/7)
                      </span>
                    </div>
                  </div>
                )}

                {/* Joined Indicator or Open Slot Button */}
                <div className="mt-5 w-full">
                  {slot.isJoined ? (
                    <div className="w-full py-2 px-4 rounded-xl font-heading text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 border bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Joined</span>
                    </div>
                  ) : (
                    <Link
                      href={`/team/join?roomCode=${room?.roomCode || ''}`}
                      className="w-full py-2 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-sky-400/50 bg-sky-500/10 text-sky-300 hover:bg-sky-500/25 transition"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Claim Slot</span>
                    </Link>
                  )}
                </div>

                {/* Status Dot */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-heading uppercase tracking-wider">
                  {slot.isJoined ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400/90">ONLINE & READY</span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                      <span className="text-slate-400">AWAITING TEAM OWNER</span>
                    </>
                  )}
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
                  {joinedCount} / {maxTeams}
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
          <div className="relative rounded-2xl border-2 border-sky-400/80 bg-gradient-to-b from-sky-950/80 via-[#07152B] to-[#050B18] px-10 py-5 text-center shadow-[0_0_35px_rgba(0,140,255,0.5),inset_0_0_20px_rgba(0,140,255,0.25)]">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
              AUCTION STATUS
            </span>
            <div className="mt-1 font-heading text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(0,140,255,0.8)]">
              WAITING FOR AUCTIONEER
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-3 rounded-full bg-sky-400/40 blur-md pointer-events-none" />
          </div>

          <p className="mt-4 text-xs text-slate-300 font-sans tracking-wide flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>The auctioneer controls when the auction starts. Live bidding begins when the auctioneer presses START.</span>
          </p>
        </div>
      </div>

      {/* STADIUM FLOOR WITH 3D VOLLEYBALLS */}
      <div className="relative z-10 w-full px-8 pb-6 flex items-end justify-between pointer-events-none">
        <div className="transform -rotate-12 translate-y-2 opacity-95 pointer-events-auto">
          <Volleyball3D className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
        <div className="h-0.5 flex-1 mx-6 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
        <div className="transform rotate-12 translate-y-2 opacity-95 pointer-events-auto">
          <Volleyball3D className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
      </div>
    </main>
  );
}
