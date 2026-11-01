'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Search,
  Power,
  Play,
  Pause,
  RotateCcw,
  Gavel,
  Ban,
  ChevronRight,
  Radio,
  Users,
  Briefcase,
  History,
  FileText,
  Settings,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';
import { VplLogo, TeamAlphaLion, TeamBravoBull, TeamCharlieWolf, TeamDeltaHorse } from '@/components/icons/team-icons';
import { PlayerPortrait } from '@/components/player-portrait';
import { supabase } from '@/lib/supabase';

export default function AuctioneerPage() {
  return (
    <Suspense fallback={<AuctioneerSkeleton />}>
      <AuctioneerControlContent />
    </Suspense>
  );
}

function AuctioneerSkeleton() {
  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <VplLogo />
        <div className="font-heading text-lg tracking-widest text-sky-400 animate-pulse">
          INITIALIZING AUCTIONEER CONTROL PANEL…
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_ITEMS = [
  { id: 'live', label: 'Live Auction', icon: Radio, active: true },
  { id: 'players', label: 'Players List', icon: Users, active: false },
  { id: 'teams', label: 'Teams & Purse', icon: Briefcase, active: false },
  { id: 'history', label: 'Auction History', icon: History, active: false },
  { id: 'reports', label: 'Reports', icon: FileText, active: false },
  { id: 'settings', label: 'Settings', icon: Settings, active: false },
];

function AuctioneerControlContent() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params?.roomId || '';

  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch room and auction state
  const refreshRoom = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.error('Failed to load auction room:', err);
    }
  };

  useEffect(() => {
    refreshRoom();
    const interval = setInterval(refreshRoom, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase.channel(`vpl-auctioneer-${roomId}`);
    channel.on('broadcast', { event: 'room:update' }, () => {
      refreshRoom();
    });
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  const auction = data?.auction;
  const dbPlayers = data?.players || [];
  const dbTeams = data?.teams || [];
  const currentPlayer = auction?.currentPlayer;

  // Set selected player ID from current live player if available
  useEffect(() => {
    if (currentPlayer?.id && !selectedPlayerId) {
      setSelectedPlayerId(currentPlayer.id);
    }
  }, [currentPlayer?.id, selectedPlayerId]);

  // Filter players for Queue (Column 1)
  const filteredPlayers = useMemo(() => {
    let list = dbPlayers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dbPlayers, searchQuery]);

  // Selected player object for Column 2
  const activePlayer = useMemo(() => {
    if (selectedPlayerId) {
      const found = dbPlayers.find((p: any) => p.id === selectedPlayerId);
      if (found) return found;
    }
    return currentPlayer || dbPlayers[0] || {
      id: 'p-08',
      name: 'Arjun Nath',
      position: 'OPPOSITE',
      age: 22,
      height: 194,
      experience: 3,
      basePrice: 1000,
      photoUrl: null,
    };
  }, [selectedPlayerId, dbPlayers, currentPlayer]);

  // Helper action runner connecting to existing API endpoints
  const executeAuctionAction = async (endpoint: string, body?: any) => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await res.json();
      if (!res.ok) {
        setActionMessage(result.message || 'Action failed');
      } else {
        setActionMessage(result.message || 'Action successful');
        await refreshRoom();
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Execution error');
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleSelectPlayer = async (playerId: string) => {
    setSelectedPlayerId(playerId);
    await executeAuctionAction('/api/auctions/select-player', { playerId });
  };

  const handleNextPlayer = async () => {
    await executeAuctionAction('/api/auctions/select-player', {});
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auctioneer/login');
  };

  return (
    <main className="min-h-screen w-full bg-[#050B18] text-white flex flex-col stadium-bg">
      {/* HEADER SECTION */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#07152B]/80 backdrop-blur-md sticky top-0 z-30">
        {/* Left: VPL Branding */}
        <div className="flex items-center gap-3">
          <VplLogo />
        </div>

        {/* Center: Title & LIVE CONTROL Indicator */}
        <div className="flex flex-col items-center">
          <h1 className="font-condensed text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            AUCTIONEER CONTROL PANEL
          </h1>
          <div className="mt-0.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-red-500/60 bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-200">
              LIVE CONTROL
            </span>
          </div>
        </div>

        {/* Right: Logged-in Auctioneer & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/50 text-xs">
              👤
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-heading">
                Auctioneer
              </span>
              <span className="text-xs font-bold font-sans text-white">
                Kishan Bhandary
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition-all"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ACTION NOTIFICATION BANNER */}
      {actionMessage && (
        <div className="bg-sky-500/20 border-b border-sky-500/40 py-1.5 px-4 text-center text-xs font-heading font-bold uppercase tracking-wider text-sky-200 animate-fadeIn">
          {actionMessage}
        </div>
      )}

      {/* MAIN CONTAINER: SIDEBAR + 3 COLUMNS */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="rounded-2xl border border-white/10 bg-[#07152B]/70 p-3 flex flex-col gap-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-[0_0_18px_rgba(2,132,199,0.5)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-white/5 px-2">
            <Link
              href={`/room/${roomId}/auction`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-[11px] font-heading font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/20"
            >
              <span>View Spectator Room</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>

        {/* MAIN THREE-COLUMN WORKSPACE */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
            {/* COLUMN 1: PLAYER QUEUE (md:col-span-4) */}
            <section className="md:col-span-4 rounded-2xl border border-white/10 bg-[#07152B]/70 p-4 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                  Player Queue ({dbPlayers.length || 24})
                </h2>
              </div>

              {/* Search Bar */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-slate-950/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 font-sans"
                />
              </div>

              {/* Scrollable Player List */}
              <div className="mt-3 flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2">
                {filteredPlayers.map((player: any, idx: number) => {
                  const isSelected = player.id === activePlayer?.id;
                  const auctionNum = String(idx + 1).padStart(2, '0');
                  const posLabel = (player.position || 'OUTSIDE_HITTER').replace('_', ' ');

                  return (
                    <div
                      key={player.id}
                      onClick={() => handleSelectPlayer(player.id)}
                      className={`cursor-pointer rounded-xl p-2.5 flex items-center justify-between border transition-all ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/15 shadow-[0_0_15px_rgba(0,140,255,0.3)]'
                          : 'border-white/5 bg-slate-950/50 hover:bg-slate-900 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayerPortrait
                          name={player.name}
                          photoUrl={player.photoUrl}
                          size="sm"
                          className="h-9 w-9"
                        />
                        <div className="flex flex-col text-left">
                          <span className="font-heading text-sm font-bold text-white tracking-wide">
                            {player.name}
                          </span>
                          <span className="text-[10px] uppercase font-sans text-slate-400">
                            {posLabel}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-condensed text-sm font-black text-amber-300">
                          ₹{Number(player.basePrice || 1000).toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          #{auctionNum}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* COLUMN 2: CURRENT PLAYER (md:col-span-5) */}
            <section className="md:col-span-5 rounded-2xl border border-white/10 bg-[#07152B]/70 p-5 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                    Current Player
                  </h2>
                  <span className="rounded-full px-2.5 py-0.5 border border-sky-400/40 bg-sky-500/10 text-[10px] font-heading uppercase tracking-widest text-sky-300">
                    {auction?.status || 'SCHEDULED'}
                  </span>
                </div>

                {/* Player Photograph */}
                <div className="mt-4 relative rounded-2xl overflow-hidden bg-gradient-to-b from-sky-950/40 to-slate-950 p-4 flex flex-col items-center">
                  <PlayerPortrait
                    name={activePlayer?.name}
                    photoUrl={activePlayer?.photoUrl}
                    size="hero"
                    className="h-56 w-auto"
                  />

                  {/* Player Name and Auction # */}
                  <div className="mt-4 text-center">
                    <span className="font-display text-sm font-bold text-sky-400 tracking-widest">
                      #08
                    </span>
                    <h3 className="font-condensed text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                      {activePlayer?.name || 'Arjun Nath'}
                    </h3>

                    {/* Gold Position Badge */}
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400 text-slate-950 font-heading text-xs font-bold uppercase tracking-wider">
                      <span>🏃</span>
                      <span>{(activePlayer?.position || 'Opposite Hitter').replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Player Stats Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2">
                    <span className="text-[10px] font-heading uppercase text-slate-400">Age</span>
                    <p className="font-condensed text-base font-bold text-white">{activePlayer?.age || 22}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2">
                    <span className="text-[10px] font-heading uppercase text-slate-400">Height</span>
                    <p className="font-condensed text-base font-bold text-white">{activePlayer?.height || 194} cm</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2">
                    <span className="text-[10px] font-heading uppercase text-slate-400">Experience</span>
                    <p className="font-condensed text-base font-bold text-white">{activePlayer?.experience || 3} Years</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2">
                    <span className="text-[10px] font-heading uppercase text-slate-400">Base Price</span>
                    <p className="font-condensed text-base font-black text-amber-300">
                      ₹{Number(activePlayer?.basePrice || 1000).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current High Bid Indicator */}
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                    Current Highest Bid
                  </span>
                  <div className="font-condensed text-xl font-black text-amber-300">
                    ₹{Number(auction?.currentHighestBid || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                    Leading Team
                  </span>
                  <div className="font-heading text-sm font-bold text-white">
                    {auction?.highestBidTeam?.name || 'No bids yet'}
                  </div>
                </div>
              </div>
            </section>

            {/* COLUMN 3: TEAM PURSE & SQUAD (md:col-span-3) */}
            <section className="md:col-span-3 rounded-2xl border border-white/10 bg-[#07152B]/70 p-4 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                  Team Purse & Squad
                </h2>
              </div>

              {/* Table Header */}
              <div className="mt-3 grid grid-cols-12 text-[10px] font-heading uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
                <div className="col-span-5">Team</div>
                <div className="col-span-4 text-right">Remaining</div>
                <div className="col-span-3 text-right">Players</div>
              </div>

              {/* Team Rows */}
              <div className="mt-2 space-y-3">
                {/* Team Alpha */}
                <div className="grid grid-cols-12 items-center py-2 px-1 rounded-xl bg-slate-950/40 border border-sky-500/20">
                  <div className="col-span-5 flex items-center gap-2">
                    <TeamAlphaLion className="h-6 w-6" />
                    <span className="font-heading text-xs font-bold text-white">Alpha</span>
                  </div>
                  <div className="col-span-4 text-right font-condensed text-xs font-bold text-amber-300">
                    ₹3,400
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-slate-300">
                    3 / 7
                  </div>
                </div>

                {/* Team Bravo */}
                <div className="grid grid-cols-12 items-center py-2 px-1 rounded-xl bg-slate-950/40 border border-red-500/20">
                  <div className="col-span-5 flex items-center gap-2">
                    <TeamBravoBull className="h-6 w-6" />
                    <span className="font-heading text-xs font-bold text-white">Bravo</span>
                  </div>
                  <div className="col-span-4 text-right font-condensed text-xs font-bold text-amber-300">
                    ₹5,000
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-slate-300">
                    0 / 7
                  </div>
                </div>

                {/* Team Charlie */}
                <div className="grid grid-cols-12 items-center py-2 px-1 rounded-xl bg-slate-950/40 border border-emerald-500/20">
                  <div className="col-span-5 flex items-center gap-2">
                    <TeamCharlieWolf className="h-6 w-6" />
                    <span className="font-heading text-xs font-bold text-white">Charlie</span>
                  </div>
                  <div className="col-span-4 text-right font-condensed text-xs font-bold text-amber-300">
                    ₹4,200
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-slate-300">
                    1 / 7
                  </div>
                </div>

                {/* Team Delta */}
                <div className="grid grid-cols-12 items-center py-2 px-1 rounded-xl bg-slate-950/40 border border-purple-500/20">
                  <div className="col-span-5 flex items-center gap-2">
                    <TeamDeltaHorse className="h-6 w-6" />
                    <span className="font-heading text-xs font-bold text-white">Delta</span>
                  </div>
                  <div className="col-span-4 text-right font-condensed text-xs font-bold text-amber-300">
                    ₹4,800
                  </div>
                  <div className="col-span-3 text-right font-mono text-xs text-slate-300">
                    1 / 7
                  </div>
                </div>
              </div>

              {/* Tournament Summary Card */}
              <div className="mt-auto pt-4">
                <div className="rounded-xl border border-white/5 bg-slate-950/70 p-3 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Tournament</span>
                    <span className="text-white font-bold">VPL 2026</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Squad Capacity</span>
                    <span className="text-white font-bold">7 (6+1)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Bid Increment</span>
                    <span className="text-white font-bold">₹100</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* BOTTOM AUCTION CONTROL PANEL */}
          <footer className="w-full rounded-2xl border border-white/10 bg-[#07152B]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CircleDot className="h-3.5 w-3.5 text-sky-400" />
                Auction Controls
              </span>
              <div className="text-xs text-slate-400 font-sans">
                Status: <span className="font-bold text-emerald-400 uppercase">{auction?.status || 'SCHEDULED'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {/* 1. START BIDDING (Green) */}
              <button
                onClick={() => executeAuctionAction('/api/auctions/start')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start Bidding</span>
              </button>

              {/* 2. PAUSE (Dark Blue) */}
              <button
                onClick={() => executeAuctionAction('/api/auctions/pause')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-[#0B254E] hover:bg-[#123670] border border-blue-500/40 font-heading text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>

              {/* 3. RESUME (Dark Blue) */}
              <button
                onClick={() => executeAuctionAction('/api/auctions/resume')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-[#0B254E] hover:bg-[#123670] border border-blue-500/40 font-heading text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Resume</span>
              </button>

              {/* 4. SOLD (Red) */}
              <button
                onClick={() => executeAuctionAction('/api/auctions/sell')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Gavel className="h-4 w-4" />
                <span>Sold</span>
              </button>

              {/* 5. UNSOLD (Dark outlined) */}
              <button
                onClick={() => executeAuctionAction('/api/auctions/unsold')}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl border border-white/20 bg-slate-900/80 hover:bg-slate-800 font-heading text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                <span>Unsold</span>
              </button>

              {/* 6. NEXT PLAYER (Blue outlined) */}
              <button
                onClick={handleNextPlayer}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl border border-sky-400/80 bg-sky-500/10 hover:bg-sky-500/20 font-heading text-sm font-bold uppercase tracking-wider text-sky-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <span>Next Player</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
