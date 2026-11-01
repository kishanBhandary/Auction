'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Shield,
  Crown,
  Wallet,
  Minus,
  Plus,
  Radio,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  VplLogo,
  TeamSlotBadge,
} from '@/components/icons/team-icons';
import { PlayerPortrait } from '@/components/player-portrait';
import { supabase } from '@/lib/supabase';

export default function LiveAuctionPage() {
  return (
    <Suspense fallback={<LiveAuctionSkeleton />}>
      <LiveAuctionBoard />
    </Suspense>
  );
}

function LiveAuctionSkeleton() {
  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <VplLogo />
        <div className="font-heading text-lg tracking-widest text-sky-400 animate-pulse">
          CONNECTING TO LIVE BROADCAST ARENA…
        </div>
      </div>
    </div>
  );
}

function LiveAuctionBoard() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params?.roomId || '';

  const [data, setData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [biddingBidAmount, setBiddingBidAmount] = useState<number>(1700);
  const [customBidStep, setCustomBidStep] = useState<number>(0);
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [bidAlert, setBidAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [countdownLeft, setCountdownLeft] = useState<number>(14);

  // Fetch current session
  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.user) {
          setSession(res.user);
        }
      })
      .catch(() => setSession(null));
  }, []);

  // Fetch live room and auction data
  const refreshLiveAuction = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.error('Failed to load live auction data:', err);
    }
  };

  useEffect(() => {
    refreshLiveAuction();
    const interval = setInterval(refreshLiveAuction, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Realtime subscription via Supabase Realtime channel
  useEffect(() => {
    const channel = supabase.channel(`vpl-auction-live-${roomId}`);
    channel.on('broadcast', { event: 'room:update' }, () => {
      refreshLiveAuction();
    });
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  const auction = data?.auction;
  const stats = data?.stats || { totalPlayers: 24, sold: 6, unsold: 0, remaining: 18 };
  const dbTeams = data?.teams || [];
  const recentBids = data?.recentBids || [];
  const history = data?.history || [];
  const currentPlayer = auction?.currentPlayer;

  const currentHighBid = auction?.currentHighestBid || 1600;
  const serverNextValidBid = auction?.nextValidBid || 1700;
  const bidIncrement = data?.room?.bidIncrement || 100;

  // Sync bidding amount when next valid bid updates from server
  useEffect(() => {
    if (serverNextValidBid) {
      setBiddingBidAmount(serverNextValidBid + customBidStep * bidIncrement);
    }
  }, [serverNextValidBid, customBidStep, bidIncrement]);

  // Countdown clock sync with auction deadline
  useEffect(() => {
    if (auction?.countdownSeconds !== undefined) {
      setCountdownLeft(auction.countdownSeconds);
    }

    const timer = setInterval(() => {
      setCountdownLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction?.countdownSeconds]);

  // Handle Owner Bidding
  const handlePlaceBid = async () => {
    if (!session || session.role !== 'TEAM_OWNER') {
      setBidAlert({ message: 'Only authenticated team owners can bid.', type: 'error' });
      return;
    }

    try {
      setBiddingLoading(true);
      setBidAlert(null);
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: biddingBidAmount }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setBidAlert({ message: resData.message || 'Bid rejected', type: 'error' });
      } else {
        setBidAlert({ message: `Bid of ₹${biddingBidAmount.toLocaleString('en-IN')} confirmed!`, type: 'success' });
        setCustomBidStep(0);
        await refreshLiveAuction();
      }
    } catch (err: any) {
      setBidAlert({ message: err.message || 'Network error while placing bid', type: 'error' });
    } finally {
      setBiddingLoading(false);
      setTimeout(() => setBidAlert(null), 3500);
    }
  };

  // Quick Auctioneer controls
  const handleAuctioneerAction = async (endpoint: string) => {
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        await refreshLiveAuction();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Four dynamic teams mapped to the 4 corners of the gaming board
  const teamSlot0 = dbTeams[0] || null;
  const teamSlot1 = dbTeams[1] || null;
  const teamSlot2 = dbTeams[2] || null;
  const teamSlot3 = dbTeams[3] || null;

  // Logged-in user's team or fallback to first registered team
  const myTeam = useMemo(() => {
    if (session?.teamName) {
      const match = dbTeams.find((t: any) => t.name.toLowerCase() === session.teamName.toLowerCase());
      if (match) return match;
    }
    if (session?.teamId) {
      const match = dbTeams.find((t: any) => t.id === session.teamId);
      if (match) return match;
    }
    return teamSlot0;
  }, [session, dbTeams, teamSlot0]);

  // Display Recent Bids (dynamic from auction)
  const displayRecentBids = recentBids;

  // Display History (dynamic from purchases)
  const displayHistory = history;

  // Formatted countdown: 00:14
  const formattedTimer = `00:${String(countdownLeft).padStart(2, '0')}`;

  return (
    <main className="min-h-screen w-full bg-[#050B18] text-white flex flex-col justify-between overflow-x-hidden stadium-bg select-none">
      {/* ATMOSPHERIC STADIUM LIGHT BEAMS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Overhead floodlights */}
        <div className="absolute -top-12 left-[12%] h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px]" />
        <div className="absolute -top-12 right-[12%] h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px]" />
        {/* Center spotlight cone */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 h-[550px] w-[500px] bg-gradient-to-b from-sky-400/15 via-blue-600/10 to-transparent blur-[80px]" />
      </div>

      {/* 1. HEADER SECTION */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between border-b border-white/10 bg-[#07152B]/85 backdrop-blur-md">
        {/* Left: VPL Logo */}
        <div className="flex items-center gap-3">
          <VplLogo />
        </div>

        {/* Center: Glowing LIVE AUCTION Capsule */}
        <div className="flex items-center justify-center my-1 sm:my-0">
          <div className="relative inline-flex items-center gap-2.5 px-6 py-2 rounded-full border border-red-500/80 bg-gradient-to-r from-red-950/90 via-red-900/90 to-red-950/90 shadow-[0_0_30px_rgba(239,68,68,0.65),inset_0_0_15px_rgba(239,68,68,0.3)]">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]" />
            <span className="font-condensed text-base sm:text-lg font-black uppercase tracking-[0.25em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              LIVE AUCTION
            </span>
          </div>
        </div>

        {/* Right: Four Statistics Counters */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Total Players */}
          <div className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/40 px-3 py-1.5 shadow-[0_0_10px_rgba(14,165,233,0.15)]">
            <Users className="h-4 w-4 text-sky-400" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase font-heading text-slate-400">Players</span>
              <span className="font-condensed text-base font-bold text-white">{stats.totalPlayers}</span>
            </div>
          </div>

          {/* Sold */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase font-heading text-slate-400">Sold</span>
              <span className="font-condensed text-base font-bold text-emerald-300">{stats.sold}</span>
            </div>
          </div>

          {/* Unsold */}
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-1.5 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
            <XCircle className="h-4 w-4 text-red-400" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase font-heading text-slate-400">Unsold</span>
              <span className="font-condensed text-base font-bold text-red-300">{stats.unsold}</span>
            </div>
          </div>

          {/* Remaining */}
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/40 px-3 py-1.5 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
            <Clock className="h-4 w-4 text-blue-400" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase font-heading text-slate-400">Remaining</span>
              <span className="font-condensed text-base font-bold text-sky-200">{stats.remaining}</span>
            </div>
          </div>

          {/* If Auctioneer is viewing spectator page */}
          {session?.role === 'AUCTIONEER' && (
            <Link
              href={`/auctioneer/rooms/${roomId}/auction`}
              className="ml-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
            >
              Control Panel
            </Link>
          )}
        </div>
      </header>

      {/* BID ALERT BANNER */}
      {bidAlert && (
        <div
          className={`py-2 px-4 text-center font-heading font-bold uppercase tracking-wider text-xs z-30 transition-all ${
            bidAlert.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-b border-red-500/40'
          }`}
        >
          {bidAlert.message}
        </div>
      )}

      {/* 2. MAIN GAMING BOARD ARENA */}
      <div className="relative z-10 w-full max-w-[1680px] mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col justify-between">
        {/* FOUR CORNERS & CENTRE SHOWCASE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* ========================================================= */}
          {/* LEFT SIDE: TOP-LEFT ALPHA & BOTTOM-LEFT CHARLIE (lg:col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4">
            {/* TOP LEFT: SLOT 1 */}
            <div className={`relative rounded-2xl p-4 flex flex-col justify-between ${teamSlot0 ? 'card-alpha' : 'border border-dashed border-sky-500/30 bg-[#07152B]/50'}`}>
              <div>
                <div className="flex items-center gap-3">
                  <TeamSlotBadge
                    slotNum={1}
                    teamName={teamSlot0?.name}
                    logoUrl={teamSlot0?.logoUrl}
                    isJoined={Boolean(teamSlot0)}
                    size="sm"
                  />
                  <div className="flex flex-col text-left">
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                      {teamSlot0?.name || 'SLOT 1 OPEN'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans">
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      <span>{teamSlot0 ? `Owner: ${teamSlot0.ownerName}` : 'Awaiting team owner'}</span>
                    </div>
                  </div>
                </div>

                {/* Purse & Player Count */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-condensed text-sm font-bold">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>₹{Number(teamSlot0?.remainingBudget ?? 5000).toLocaleString('en-IN')} / 5,000</span>
                  </div>
                  <div className="font-heading text-xs uppercase tracking-wider text-slate-300">
                    Players: <span className="font-mono font-bold text-white">{teamSlot0?.purchasedCount ?? 0} / 7</span>
                  </div>
                </div>
              </div>

              {/* 7 Squad Slots */}
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const isFilled = idx < (teamSlot0?.purchasedCount ?? 0);
                  return (
                    <div
                      key={`slot0-sub-${idx}`}
                      className={`h-9 rounded-lg border flex items-center justify-center overflow-hidden transition-all ${
                        isFilled
                          ? 'border-sky-400 bg-sky-950/80 shadow-[0_0_8px_rgba(0,140,255,0.4)]'
                          : 'border-sky-500/20 bg-slate-950/40 border-dashed'
                      }`}
                    >
                      {isFilled ? (
                        <PlayerPortrait
                          name={`Player ${idx + 1}`}
                          size="sm"
                          className="h-7 w-7"
                        />
                      ) : (
                        <span className="text-[10px] text-sky-500/30">#</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM LEFT: SLOT 3 */}
            <div className={`relative rounded-2xl p-4 flex flex-col justify-between ${teamSlot2 ? 'card-charlie' : 'border border-dashed border-emerald-500/30 bg-[#07152B]/50'}`}>
              <div>
                <div className="flex items-center gap-3">
                  <TeamSlotBadge
                    slotNum={3}
                    teamName={teamSlot2?.name}
                    logoUrl={teamSlot2?.logoUrl}
                    isJoined={Boolean(teamSlot2)}
                    size="sm"
                  />
                  <div className="flex flex-col text-left">
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                      {teamSlot2?.name || 'SLOT 3 OPEN'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans">
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      <span>{teamSlot2 ? `Owner: ${teamSlot2.ownerName}` : 'Awaiting team owner'}</span>
                    </div>
                  </div>
                </div>

                {/* Purse & Player Count */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-condensed text-sm font-bold">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>₹{Number(teamSlot2?.remainingBudget ?? 5000).toLocaleString('en-IN')} / 5,000</span>
                  </div>
                  <div className="font-heading text-xs uppercase tracking-wider text-slate-300">
                    Players: <span className="font-mono font-bold text-white">{teamSlot2?.purchasedCount ?? 0} / 7</span>
                  </div>
                </div>
              </div>

              {/* 7 Squad Slots */}
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const isFilled = idx < (teamSlot2?.purchasedCount ?? 0);
                  return (
                    <div
                      key={`slot2-sub-${idx}`}
                      className={`h-9 rounded-lg border flex items-center justify-center overflow-hidden transition-all ${
                        isFilled
                          ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_8px_rgba(0,216,120,0.4)]'
                          : 'border-emerald-500/20 bg-slate-950/40 border-dashed'
                      }`}
                    >
                      {isFilled ? (
                        <PlayerPortrait
                          name={`Player ${idx + 1}`}
                          size="sm"
                          className="h-7 w-7"
                        />
                      ) : (
                        <span className="text-[10px] text-emerald-500/30">#</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTRE: CURRENT PLAYER SHOWCASE & LIVE BIDDING (lg:col-span-6) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 relative flex flex-col justify-between items-center rounded-3xl border border-white/10 bg-[#07152B]/60 p-4 sm:p-6 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Concentric Stadium Neon Floor Podium Underneath Player */}
            <div className="absolute inset-x-0 bottom-16 h-36 flex items-center justify-center pointer-events-none">
              {/* Outer Neon Ring */}
              <div className="w-[520px] h-20 rounded-[50%] border-2 border-sky-400/40 shadow-[0_0_35px_rgba(0,140,255,0.5)] transform rotate-x-60" />
              {/* Inner Neon Ring */}
              <div className="absolute w-[360px] h-14 rounded-[50%] border border-cyan-300/60 shadow-[0_0_25px_rgba(6,182,212,0.6)] transform rotate-x-60" />
              {/* Core Light Pillar */}
              <div className="absolute w-44 h-10 rounded-[50%] bg-sky-400/30 blur-md transform rotate-x-60" />
            </div>

            {/* THREE-WAY CENTRE LAYOUT: Left Stats | Center Hero Athlete | Right Current Bid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center z-10">
              {/* LEFT COLUMN: Player Info & Details (md:col-span-3) */}
              <div className="md:col-span-3 flex flex-col text-left">
                {/* Auction No. */}
                <div className="inline-flex w-fit items-center px-3 py-1 rounded-md border border-white/20 bg-white/5 font-display text-xs font-bold uppercase tracking-widest text-slate-300">
                  AUCTION NO. 08
                </div>

                {/* Player Name */}
                <h1 className="mt-3 font-condensed text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  {currentPlayer?.name || 'ARJUN NATH'}
                </h1>

                {/* Gold Playing Position Badge */}
                <div className="mt-2 inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-md bg-amber-400 text-slate-950 font-heading text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  <span>🏃</span>
                  <span>
                    {(() => {
                      const u = String(currentPlayer?.position || '').trim().toUpperCase();
                      if (u === 'OUTSIDE_HITTER' || u === 'ATTACKER') return 'Attacker';
                      if (u === 'LIBERO') return 'Libero';
                      if (u === 'DEFENSIVE_SPECIALIST' || u === 'DEFENCE') return 'Defence';
                      if (u === 'SETTER') return 'Setter';
                      if (u === 'MIDDLE_BLOCKER' || u === 'OPPOSITE' || u === 'ALL_ROUNDER') return 'All Rounder';
                      return (currentPlayer?.position || 'Attacker').replace('_', ' ');
                    })()}
                  </span>
                </div>

                {/* Stats List */}
                <div className="mt-5 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400 font-sans">Height</span>
                    <span className="font-heading font-bold text-white">{currentPlayer?.height || 194} cm</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400 font-sans">Experience</span>
                    <span className="font-heading font-bold text-white">{currentPlayer?.experience || 3} Years</span>
                  </div>
                </div>
              </div>

              {/* CENTRE COLUMN: Large Hero Player Photograph (md:col-span-6) */}
              <div className="md:col-span-6 relative flex flex-col items-center justify-end h-[320px] sm:h-[380px]">
                <PlayerPortrait
                  name={currentPlayer?.name || 'Arjun Nath'}
                  photoUrl={currentPlayer?.photoUrl}
                  size="hero"
                  className="h-full w-auto"
                />

                {/* CIRCULAR COUNTDOWN TIMER (Overlayed at bottom of player) */}
                <div className="absolute -bottom-5 flex flex-col items-center z-20">
                  <div className="relative h-24 w-24 rounded-full border-4 border-amber-500/80 bg-[#07152B] flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6),inset_0_0_12px_rgba(245,158,11,0.3)]">
                    {/* SVG Progress Circle */}
                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="#FF2345"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="264"
                        strokeDashoffset={264 - (264 * countdownLeft) / 20}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>

                    <span className="font-display text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-md">
                      {formattedTimer}
                    </span>
                    <span className="font-heading text-[8px] font-bold uppercase tracking-wider text-amber-400">
                      BIDDING TIME
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Current Bidding Information Panel (md:col-span-3) */}
              <div className="md:col-span-3 flex flex-col text-right">
                {/* CURRENT BID Box */}
                <div className="rounded-2xl border border-red-500/60 bg-gradient-to-b from-red-950/80 to-[#07152B] p-3 text-center shadow-[0_0_25px_rgba(239,68,68,0.35)]">
                  <div className="rounded-lg bg-red-600/80 py-1 font-heading text-xs font-bold uppercase tracking-widest text-white">
                    CURRENT BID
                  </div>
                  <div className="mt-2 font-condensed text-3xl sm:text-4xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]">
                    ₹{currentHighBid.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* HIGHEST BIDDER */}
                <div className="mt-4 flex flex-col items-end">
                  <span className="text-[10px] font-heading uppercase tracking-wider text-slate-400">
                    HIGHEST BIDDER
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                      {auction?.highestBidTeam?.name || 'NO BIDS YET'}
                    </span>
                    {auction?.highestBidTeam?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={auction.highestBidTeam.logoUrl} alt="Bidder" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <Gavel className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                </div>

                {/* NEXT BID */}
                <div className="mt-4 flex flex-col items-end">
                  <span className="text-[10px] font-heading uppercase tracking-wider text-slate-400">
                    NEXT BID
                  </span>
                  <div className="font-condensed text-xl sm:text-2xl font-black text-sky-400">
                    ₹{serverNextValidBid.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* GOLDEN BID BUTTON & CONTROLS */}
            <div className="w-full mt-10 pt-4 flex flex-col items-center z-10">
              {/* Only authenticated team owners see the interactive BID button */}
              {session?.role === 'TEAM_OWNER' ? (
                <div className="flex items-center gap-3 w-full max-w-md justify-center">
                  {/* Minus button */}
                  <button
                    onClick={() => setCustomBidStep((prev) => Math.max(0, prev - 1))}
                    disabled={customBidStep <= 0}
                    className="h-12 w-12 rounded-xl border border-white/20 bg-slate-900/80 hover:bg-slate-800 text-white font-black text-lg flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    <Minus className="h-5 w-5" />
                  </button>

                  {/* Main Large Golden Button */}
                  <button
                    onClick={handlePlaceBid}
                    disabled={biddingLoading}
                    className="flex-1 py-3.5 px-6 rounded-2xl btn-gold-bid flex items-center justify-center gap-3 text-lg font-black uppercase tracking-wider cursor-pointer"
                  >
                    <Gavel className="h-6 w-6 text-slate-950" />
                    <span>BID ₹{biddingBidAmount.toLocaleString('en-IN')}</span>
                  </button>

                  {/* Plus button */}
                  <button
                    onClick={() => setCustomBidStep((prev) => prev + 1)}
                    className="h-12 w-12 rounded-xl border border-white/20 bg-slate-900/80 hover:bg-slate-800 text-white font-black text-lg flex items-center justify-center transition-all"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              ) : session?.role === 'AUCTIONEER' ? (
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => handleAuctioneerAction('/api/auctions/start')}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-heading font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Start</span>
                  </button>
                  <button
                    onClick={() => handleAuctioneerAction('/api/auctions/pause')}
                    className="py-2.5 px-4 rounded-xl bg-[#0B254E] border border-blue-500/40 text-xs font-heading font-bold uppercase tracking-wider text-white"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </button>
                  <button
                    onClick={() => handleAuctioneerAction('/api/auctions/sell')}
                    className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-heading font-bold uppercase tracking-wider text-white"
                  >
                    <Gavel className="h-3.5 w-3.5" />
                    <span>Sell</span>
                  </button>
                  <button
                    onClick={() => handleAuctioneerAction('/api/auctions/unsold')}
                    className="py-2.5 px-4 rounded-xl border border-white/20 bg-slate-900 text-xs font-heading font-bold uppercase tracking-wider text-slate-200"
                  >
                    <span>Unsold</span>
                  </button>
                </div>
              ) : (
                <div className="py-2.5 px-6 rounded-xl border border-sky-400/30 bg-sky-950/40 text-xs font-heading tracking-widest text-sky-300 uppercase flex items-center gap-2">
                  <Radio className="h-4 w-4 text-sky-400 animate-pulse" />
                  <span>SPECTATOR BROADCAST MODE • LIVE BID: ₹{currentHighBid.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: TOP-RIGHT BRAVO & BOTTOM-RIGHT DELTA (lg:col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4">
            {/* TOP RIGHT: SLOT 2 */}
            <div className={`relative rounded-2xl p-4 flex flex-col justify-between ${teamSlot1 ? 'card-bravo' : 'border border-dashed border-red-500/30 bg-[#07152B]/50'}`}>
              <div>
                <div className="flex items-center gap-3">
                  <TeamSlotBadge
                    slotNum={2}
                    teamName={teamSlot1?.name}
                    logoUrl={teamSlot1?.logoUrl}
                    isJoined={Boolean(teamSlot1)}
                    size="sm"
                  />
                  <div className="flex flex-col text-left">
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                      {teamSlot1?.name || 'SLOT 2 OPEN'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans">
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      <span>{teamSlot1 ? `Owner: ${teamSlot1.ownerName}` : 'Awaiting team owner'}</span>
                    </div>
                  </div>
                </div>

                {/* Purse & Player Count */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-condensed text-sm font-bold">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>₹{Number(teamSlot1?.remainingBudget ?? 5000).toLocaleString('en-IN')} / 5,000</span>
                  </div>
                  <div className="font-heading text-xs uppercase tracking-wider text-slate-300">
                    Players: <span className="font-mono font-bold text-white">{teamSlot1?.purchasedCount ?? 0} / 7</span>
                  </div>
                </div>
              </div>

              {/* 7 Squad Slots */}
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const isFilled = idx < (teamSlot1?.purchasedCount ?? 0);
                  return (
                    <div
                      key={`slot1-sub-${idx}`}
                      className={`h-9 rounded-lg border flex items-center justify-center overflow-hidden transition-all ${
                        isFilled
                          ? 'border-red-400 bg-red-950/80 shadow-[0_0_8px_rgba(255,35,69,0.4)]'
                          : 'border-red-500/20 bg-slate-950/40 border-dashed'
                      }`}
                    >
                      {isFilled ? (
                        <PlayerPortrait
                          name={`Player ${idx + 1}`}
                          size="sm"
                          className="h-7 w-7"
                        />
                      ) : (
                        <span className="text-[10px] text-red-500/30">#</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM RIGHT: SLOT 4 */}
            <div className={`relative rounded-2xl p-4 flex flex-col justify-between ${teamSlot3 ? 'card-delta' : 'border border-dashed border-purple-500/30 bg-[#07152B]/50'}`}>
              <div>
                <div className="flex items-center gap-3">
                  <TeamSlotBadge
                    slotNum={4}
                    teamName={teamSlot3?.name}
                    logoUrl={teamSlot3?.logoUrl}
                    isJoined={Boolean(teamSlot3)}
                    size="sm"
                  />
                  <div className="flex flex-col text-left">
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                      {teamSlot3?.name || 'SLOT 4 OPEN'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans">
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      <span>{teamSlot3 ? `Owner: ${teamSlot3.ownerName}` : 'Awaiting team owner'}</span>
                    </div>
                  </div>
                </div>

                {/* Purse & Player Count */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-condensed text-sm font-bold">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>₹{Number(teamSlot3?.remainingBudget ?? 5000).toLocaleString('en-IN')} / 5,000</span>
                  </div>
                  <div className="font-heading text-xs uppercase tracking-wider text-slate-300">
                    Players: <span className="font-mono font-bold text-white">{teamSlot3?.purchasedCount ?? 0} / 7</span>
                  </div>
                </div>
              </div>

              {/* 7 Squad Slots */}
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const isFilled = idx < (teamSlot3?.purchasedCount ?? 0);
                  return (
                    <div
                      key={`slot3-sub-${idx}`}
                      className={`h-9 rounded-lg border flex items-center justify-center overflow-hidden transition-all ${
                        isFilled
                          ? 'border-purple-400 bg-purple-950/80 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                          : 'border-purple-500/20 bg-slate-950/40 border-dashed'
                      }`}
                    >
                      {isFilled ? (
                        <PlayerPortrait
                          name={`Player ${idx + 1}`}
                          size="sm"
                          className="h-7 w-7"
                        />
                      ) : (
                        <span className="text-[10px] text-purple-500/30">#</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM ROW: RECENT BIDS | AUCTION HISTORY | MY TEAM SQUAD */}
        {/* ========================================================= */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* BOTTOM LEFT: RECENT BIDS (md:col-span-4) */}
          <div className="md:col-span-4 rounded-2xl border border-sky-500/30 bg-[#07152B]/80 p-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 font-heading text-xs font-bold uppercase tracking-wider text-sky-400">
              <Clock className="h-3.5 w-3.5" />
              <span>RECENT BIDS</span>
            </div>

            <div className="mt-2.5 space-y-1.5">
              {displayRecentBids.slice(0, 4).map((bid: any) => (
                <div key={bid.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0 font-sans">
                  <span className="font-condensed font-black text-amber-300 text-sm">
                    ₹{Number(bid.amount).toLocaleString('en-IN')}
                  </span>
                  <span className="font-heading font-bold text-white">
                    {bid.teamName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {bid.timeLabel || 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM CENTER: AUCTION HISTORY (md:col-span-4) */}
          <div className="md:col-span-4 rounded-2xl border border-white/10 bg-[#07152B]/80 p-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button className="text-slate-400 hover:text-white transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300">
                AUCTION HISTORY
              </span>
              <button className="text-slate-400 hover:text-white transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Horizontal Player Sold Cards */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {displayHistory.slice(0, 3).map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-slate-950/60 p-2 flex flex-col items-center text-center"
                >
                  <PlayerPortrait
                    name={item.playerName}
                    photoUrl={item.photoUrl}
                    size="sm"
                    className="h-8 w-8 mb-1"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    #{item.auctionNo || '06'}
                  </span>
                  <span className="font-heading text-xs font-bold text-white truncate max-w-full">
                    {item.playerName}
                  </span>
                  <span className="mt-1 rounded px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-heading uppercase font-bold tracking-wider">
                    SOLD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM RIGHT: MY TEAM SQUAD (md:col-span-4) */}
          <div className="md:col-span-4 rounded-2xl border border-white/10 bg-[#07152B]/80 p-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-sky-300">
                <Shield className="h-3.5 w-3.5 text-sky-400" />
                <span>MY TEAM SQUAD ({myTeam?.name || 'TEAM ALPHA'})</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">
                {myTeam?.purchasedCount ?? 0} / {myTeam?.squadCapacity || 7}
              </span>
            </div>

            {/* 7 Squad Slots for Logged-in Team */}
            <div className="mt-2.5 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, idx) => {
                const purchasedList = myTeam?.purchases || [];
                const purchase = purchasedList[idx];
                const isPurchased = Boolean(purchase);
                return (
                  <div
                    key={`my-squad-slot-${idx}`}
                    title={purchase ? `${purchase.playerName} (${purchase.isIcon ? 'Icon Player' : `₹${purchase.price}`})` : `Open Slot ${idx + 1}`}
                    className={`h-11 rounded-xl border flex items-center justify-center overflow-hidden transition-all relative ${
                      isPurchased
                        ? purchase.isIcon
                          ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                          : 'border-sky-400 bg-sky-950/80 shadow-[0_0_10px_rgba(0,140,255,0.35)]'
                        : 'border-white/10 bg-slate-950/50 border-dashed'
                    }`}
                  >
                    {isPurchased ? (
                      <>
                        <PlayerPortrait
                          name={purchase?.playerName || `Player ${idx + 1}`}
                          photoUrl={purchase?.playerPhoto}
                          size="sm"
                          className="h-8 w-8"
                        />
                        {purchase.isIcon && (
                          <div className="absolute top-0.5 right-0.5 text-[8px] text-amber-300 font-black">
                            ★
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
