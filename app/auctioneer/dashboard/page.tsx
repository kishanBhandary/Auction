'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Copy,
  Check,
  Info,
  Link as LinkIcon,
  Coins,
  Gavel,
  Clock,
  RotateCcw,
  Radio,
  Briefcase,
  History,
  FileText,
  Settings,
  Sliders,
  Play,
  Power,
  ShieldCheck,
  CheckCircle2,
  CircleDot,
  Crown,
  Sparkles,
  PlusCircle,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  ChevronDown,
  Star,
  User,
} from 'lucide-react';
import {
  VplLogo,
  VplEmblem,
  TeamSlotBadge,
} from '@/components/icons/team-icons';
import { supabase } from '@/lib/supabase';

export default function AuctioneerDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuctioneerDashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <VplLogo />
        <div className="font-heading text-lg tracking-widest text-sky-400 animate-pulse">
          CONNECTING TO LIVE AUCTION SYSTEM…
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_NAV = [
  { id: 'live', label: 'Live Auction', icon: Radio, active: true, href: '/auctioneer/dashboard' },
  { id: 'players', label: 'Players List', icon: Users, active: false, href: '#' },
  { id: 'teams', label: 'Teams & Purse', icon: Briefcase, active: false, href: '#' },
  { id: 'history', label: 'Auction History', icon: History, active: false, href: '/results' },
  { id: 'reports', label: 'Reports', icon: FileText, active: false, href: '/admin/rooms' },
  { id: 'settings', label: 'Settings', icon: Settings, active: false, href: '#' },
];

const SLOT_STYLES = [
  { cardClass: 'card-alpha' },
  { cardClass: 'card-bravo' },
  { cardClass: 'card-charlie' },
  { cardClass: 'card-delta' },
];

function AuctioneerDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & UI states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState({
    name: '',
    position: 'OUTSIDE_HITTER',
    basePrice: 50,
  });

  const [createdRoomResult, setCreatedRoomResult] = useState<{
    id: string;
    roomCode: string;
    roomName: string;
    passcode: string;
    invitation: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedModalCode, setCopiedModalCode] = useState(false);
  const [copiedModalLink, setCopiedModalLink] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [poolPlayersCount, setPoolPlayersCount] = useState<number>(0);

  // Load real players from DB
  const loadPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const res = await fetch('/api/players', { cache: 'no-store' });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.players)) {
        setPlayersList(data.players);
        setPoolPlayersCount(data.players.length);
      }
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // New room form
  const [newRoomForm, setNewRoomForm] = useState({
    roomName: '',
    description: '',
    tournamentName: 'Narayana Guru Premier League',
    maximumTeams: 4,
    teamBudget: 5000,
    squadSize: 7,
    totalPlayersInPool: 0,
    startingPrice: 1000, 
    bidIncrement: 100,
    countdownSeconds: 20,
    lateBidExtensionSeconds: 10,
  });

  // 1. Authorize Auctioneer Session
  useEffect(() => {
    fetch('/api/auth/profile')
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok || (payload.user?.role !== 'AUCTIONEER' && payload.user?.role !== 'ADMIN' && payload.user?.role !== 'SUPER_ADMIN')) {
          router.replace('/auctioneer/login');
          return;
        }
        setUser(payload.user);
      })
      .catch(() => router.replace('/auctioneer/login'));
  }, [router]);

  // 2. Fetch all real rooms
  const loadRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms', { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        const rooms = payload.rooms || [];
        setRoomsList(rooms);
        if (rooms.length > 0) {
          setSelectedRoomId((current) => (current && rooms.some((r: any) => r.id === current) ? current : rooms[0].id));
        } else {
          setSelectedRoomId('');
          setRoomData(null);
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, [selectedRoomId]);

  // 3. Fetch detailed room data when selectedRoomId changes
  const loadSelectedRoomDetails = async (id: string) => {
    if (!id) {
      setRoomData(null);
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        setRoomData(payload);
      }
    } catch (err) {
      console.error('Failed to load room details:', err);
    }
  };

  useEffect(() => {
    if (selectedRoomId) {
      loadSelectedRoomDetails(selectedRoomId);
      const interval = setInterval(() => loadSelectedRoomDetails(selectedRoomId), 2500);
      return () => clearInterval(interval);
    }
  }, [selectedRoomId]);

  // 4. Supabase Realtime Listener
  useEffect(() => {
    const channel = supabase.channel('vpl-auctioneer-dashboard-realtime');
    channel.on('broadcast', { event: 'room:update' }, () => {
      loadRooms();
      if (selectedRoomId) {
        loadSelectedRoomDetails(selectedRoomId);
      }
    });
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [selectedRoomId]);

  // Real Database Data
  const room = roomData?.room || null;
  const dbTeams = room ? (roomData?.teams || []) : [];
  const dbPlayers = room ? (roomData?.players || []) : [];
  const totalPlayersCount = room ? (roomData?.stats?.totalPlayers ?? playersList.length) : playersList.length;
  const maxTeams = Number(room?.maximumTeams || 4);
  const joinedTeamsCount = dbTeams.length;

  const roomCode = room?.roomCode || '';
  const roomName = room?.roomName || '';
  const roomStatus = room?.status || '';

  // Handle Create Room
  const handleCreateRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoomForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Room creation failed');
      }

      setIsCreateModalOpen(false);
      setCreatedRoomResult(data.room);
      setStatusMessage(`Auction room "${data.room.roomName}" created with code: ${data.room.roomCode}!`);
      await loadRooms();
      if (data.room?.id) {
        setSelectedRoomId(data.room.id);
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to create auction room');
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = async () => {
    if (!roomCode) return;
    const link = `${window.location.origin}/team/join?roomCode=${roomCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartAuction = async () => {
    if (!room?.id) return;
    setActionLoading(true);
    try {
      await fetch('/api/auctions/start', { method: 'POST' });
      router.push(`/auctioneer/rooms/${room.id}/auction`);
    } catch {
      router.push(`/auctioneer/rooms/${room.id}/auction`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Auction Room
  const handleDeleteAuction = async () => {
    if (!room?.id) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/rooms/${room.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMessage(`Auction room deleted successfully.`);
        setIsDeleteConfirmOpen(false);
        setRoomData(null);
        setSelectedRoomId('');
        await loadRooms();
      } else {
        setStatusMessage(`Failed: ${data.message || 'Could not delete room'}`);
      }
    } catch {
      setStatusMessage('Failed to delete auction room.');
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Add real player directly to DB
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.name.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlayerForm.name.trim(),
          position: newPlayerForm.position,
          basePrice: 50,
          tournamentId: room?.tournamentId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMessage(`Player "${data.player.name}" added to database!`);
        setNewPlayerForm({
          name: '',
          position: 'OUTSIDE_HITTER',
          basePrice: 50,
        });
        await loadPlayers();
        if (selectedRoomId) await loadSelectedRoomDetails(selectedRoomId);
      } else {
        setStatusMessage(`Failed: ${data.message || 'Could not add player'}`);
      }
    } catch {
      setStatusMessage('Failed to add player.');
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Delete individual player
  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to remove this player from the database?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/players?id=${playerId}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage('Player deleted from database.');
        await loadPlayers();
        if (selectedRoomId) await loadSelectedRoomDetails(selectedRoomId);
      }
    } catch {
      setStatusMessage('Failed to delete player.');
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Clear all players
  const handleClearAllPlayers = async () => {
    if (!confirm('Are you sure you want to permanently clear ALL players from the database?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/players?all=true', { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage('All players cleared from database.');
        await loadPlayers();
        if (selectedRoomId) await loadSelectedRoomDetails(selectedRoomId);
      }
    } catch {
      setStatusMessage('Failed to clear players.');
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auctioneer/login');
  };

  // Build dynamic slots mapped from actual database records
  const dynamicTeamCards = useMemo(() => {
    return Array.from({ length: maxTeams }).map((_, index) => {
      const dbTeam = dbTeams[index] || null;
      const slotDef = SLOT_STYLES[index % SLOT_STYLES.length];
      const isJoined = Boolean(dbTeam);
      const teamName = dbTeam?.name || `Slot ${index + 1} (Open)`;
      const ownerName = dbTeam?.ownerName || (isJoined ? 'Assigned' : 'Awaiting Team');
      const logoUrl = dbTeam?.logoUrl || null;
      const iconPlayer = dbTeam?.iconPlayer || null;
      const remainingBudget = dbTeam ? Number(dbTeam.remainingBudget) : Number(room?.teamBudget || 5000);
      const purchasedCount = dbTeam ? dbTeam.purchasedCount : 0;

      return {
        slotNum: index + 1,
        teamName,
        ownerName,
        isJoined,
        logoUrl,
        iconPlayer,
        remainingBudget,
        purchasedCount,
        cardClass: slotDef.cardClass,
      };
    });
  }, [maxTeams, dbTeams, room?.teamBudget]);

  return (
    <main className="min-h-screen w-full bg-[#050B18] text-white flex flex-col justify-between overflow-x-hidden stadium-bg select-none">
      {/* ATMOSPHERIC STADIUM LIGHTING */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 left-[10%] h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px]" />
        <div className="absolute -top-12 right-[10%] h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[650px] bg-blue-600/10 blur-[120px]" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#07152B]/80 backdrop-blur-md">
        {/* Left: VPL Logo & Branding */}
        <div className="flex items-center gap-3">
          <VplLogo />
        </div>

        {/* Center / Right Badges */}
        <div className="flex items-center gap-4">
          {/* Create Auction Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full border border-sky-400/60 bg-sky-500/15 hover:bg-sky-500/25 font-heading text-xs font-bold uppercase tracking-wider text-sky-300 transition shadow-[0_0_15px_rgba(0,140,255,0.25)] cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Auction</span>
          </button>

          {/* LIVE ACCESS Badge */}


          {/* Auctioneer Profile Card */}
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-slate-950/70 px-4 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/40 text-xs">
              👤
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] uppercase font-heading text-slate-400 tracking-wider">
                Auctioneer
              </span>
              <span className="text-xs font-bold font-sans text-white">
                {user?.name || 'Rohan Mehta'}
              </span>
            </div>
          </div>

          {/* Power / Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-slate-950/70 text-slate-300 hover:text-white hover:border-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* NOTIFICATION BANNER */}
      {statusMessage && (
        <div className="bg-sky-500/20 border-b border-sky-500/40 py-2 px-4 text-center text-xs font-heading font-bold uppercase tracking-wider text-sky-200 z-30 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* MAIN CONTAINER: LEFT SIDEBAR + TWO-COLUMN DASHBOARD */}
      <div className="relative z-10 w-full max-w-[1720px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 flex-1">
        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR NAVIGATION */}
        {/* ========================================================= */}
        <aside className="rounded-3xl border border-white/10 bg-[#07152B]/75 p-3 flex flex-col gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon;
            if (item.id === 'players') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    loadPlayers();
                    setIsPlayersModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all text-slate-400 hover:bg-white/5 hover:text-white text-left cursor-pointer"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }
            if (item.id === 'teams') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIsTeamsModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all text-slate-400 hover:bg-white/5 hover:text-white text-left cursor-pointer"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }
            if (item.id === 'settings') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all text-slate-400 hover:bg-white/5 hover:text-white text-left cursor-pointer"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,140,255,0.6)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl btn-gold-bid font-heading text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-md"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Auction</span>
            </button>

            {room?.id && (
              <Link
                href={`/room/${room.id}/waiting-room`}
                target="_blank"
                className="w-full py-2 px-3 rounded-xl border border-sky-400/40 bg-sky-500/10 text-center font-heading text-[11px] font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/20 block transition"
              >
                Open Waiting Room
              </Link>
            )}

            <Link
              href={roomCode ? `/playerdetials?roomCode=${roomCode}` : '/playerdetials'}
              target="_blank"
              className="w-full py-2 px-3 rounded-xl border border-amber-400/40 bg-amber-500/10 text-center font-heading text-[11px] font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 block transition"
            >
              Player Entry Form
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN DASHBOARD CONTENT */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ===================================================== */}
          {/* LEFT / CENTER COLUMN (xl:col-span-8) */}
          {/* ===================================================== */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* Header Title Bar with Room Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="font-condensed text-3xl sm:text-4xl font-black uppercase text-white tracking-wide">
                  AUCTIONEER CONTROL PANEL
                </h1>
    
              </div>

              {/* Room Switcher if multiple rooms exist */}
              {roomsList.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-heading text-slate-400">Select Room:</span>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="py-1.5 px-3 rounded-xl border border-white/10 bg-slate-950 text-xs font-heading font-bold uppercase text-white focus:outline-none focus:border-sky-400"
                  >
                    {roomsList.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.roomName} ({r.roomCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!room ? (
              /* SHOWN ONLY WHEN NO AUCTION ROOM HAS BEEN CREATED */
              <div className="rounded-3xl border border-sky-400/30 bg-[#07152B]/80 p-8 sm:p-14 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center flex flex-col items-center justify-center gap-6">
                <div className="h-24 w-24 rounded-3xl border border-sky-400/40 bg-sky-500/10 flex items-center justify-center p-3 shadow-[0_0_30px_rgba(0,140,255,0.3)]">
                  <VplEmblem className="h-16 w-16" />
                </div>

                <div className="max-w-xl">
                  <h2 className="font-condensed text-3xl sm:text-4xl font-black uppercase tracking-wide text-white">
                    NO ACTIVE AUCTION MATCH
                  </h2>
                  <p className="mt-2 text-sm text-slate-300 font-sans leading-relaxed">
                    No auction room has been created yet. Click the button below to create your auction match. You will configure the number of teams, player pool, budget, and squad size, and a unique Room Code will be generated for team owners to join.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="py-4 px-8 rounded-2xl btn-gold-bid font-heading text-base font-black uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_35px_rgba(255,184,0,0.6)] cursor-pointer hover:scale-105 transition"
                >
                  <PlusCircle className="h-5 w-5 text-slate-950" />
                  <span>CREATE AUCTION MATCH</span>
                </button>
              </div>
            ) : (
              <>
            {/* CARD 1: ROOM OVERVIEW */}
            <div className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-5 sm:p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-heading text-xs font-bold uppercase tracking-wider">
                  <Trophy className="h-4 w-4" />
                  <span className="text-white">ROOM OVERVIEW</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="py-1 px-3 rounded-lg border border-rose-500/50 bg-rose-500/15 hover:bg-rose-500/25 text-xs font-heading font-bold uppercase text-rose-300 flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(244,63,94,0.2)] cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Auction</span>
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="py-1 px-3 rounded-lg border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 text-xs font-heading font-bold uppercase text-sky-300 flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,140,255,0.2)] cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Create Auction</span>
                  </button>
                </div>
              </div>

              {/* 4 Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Room Code */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                    Room Code
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-base sm:text-lg font-black text-sky-300">
                      {roomCode || 'PENDING'}
                    </span>
                    {roomCode && (
                      <button
                        onClick={handleCopyCode}
                        className="p-1 rounded text-slate-400 hover:text-white transition"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Status */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                    Status
                  </span>
                  <div className="mt-1 inline-flex items-center px-3 py-0.5 rounded-full border border-amber-500/60 bg-amber-500/10 text-amber-300 font-heading text-xs font-bold uppercase tracking-wider">
                    {roomStatus}
                  </div>
                </div>

                {/* 3. Teams Joined */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                    <Users className="h-3.5 w-3.5 text-sky-400" />
                    <span>Teams Joined</span>
                  </div>
                  <div className="mt-1 font-condensed text-xl font-black text-white">
                    {joinedTeamsCount} / {maxTeams}
                  </div>
                </div>

                {/* 4. Players Registered */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                    <Users className="h-3.5 w-3.5 text-sky-400" />
                    <span>Players Registered</span>
                  </div>
                  <div className="mt-1 font-condensed text-xl font-black text-white">
                    {totalPlayersCount}
                  </div>
                </div>
              </div>

              {/* Lower Section: Room Details & Settings */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left side: VPL Season 1 & Buttons (md:col-span-7) */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-2xl border border-white/10 bg-slate-950/80 flex items-center justify-center p-2 shrink-0 shadow-[0_0_20px_rgba(0,140,255,0.2)]">
                      <VplEmblem className="h-14 w-14" />
                    </div>
                    <div>
                      <h3 className="font-condensed text-2xl font-black uppercase text-white tracking-wide">
                        {roomName || 'NGPL SEASON 1 AUCTION'}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300 font-sans leading-relaxed">
                        {room?.description ||
                          'Official auction room for NGPL Season 1. All teams are invited to join and participate in the player auction.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setIsDetailsModalOpen(true)}
                      className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 font-heading text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition cursor-pointer"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Room Details</span>
                    </button>

                    <button
                      onClick={handleCopyInviteLink}
                      disabled={!roomCode}
                      className="py-2 px-4 rounded-xl border border-sky-400/50 bg-sky-500/10 hover:bg-sky-500/20 font-heading text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <LinkIcon className="h-3.5 w-3.5" />}
                      <span>{copiedLink ? 'Invite Link Copied' : 'Copy Invite Link'}</span>
                    </button>

                    <button
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="py-2 px-4 rounded-xl border border-rose-500/50 bg-rose-500/15 hover:bg-rose-500/25 font-heading text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Auction</span>
                    </button>
                  </div>
                </div>

                {/* Right side: Auction Settings (md:col-span-5) */}
                <div className="md:col-span-5 rounded-2xl border border-white/5 bg-slate-950/60 p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-heading font-bold text-slate-400 tracking-wider mb-2">
                    AUCTION SETTINGS
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Coins className="h-3.5 w-3.5 text-amber-400" /> Base Price
                      </span>
                      <span className="font-condensed font-bold text-white">
                        ₹{Number(room?.startingPrice || 1000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Gavel className="h-3.5 w-3.5 text-sky-400" /> Bid Increment
                      </span>
                      <span className="font-condensed font-bold text-white">
                        ₹{Number(room?.bidIncrement || 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-blue-400" /> Timer
                      </span>
                      <span className="font-condensed font-bold text-white">
                        {room?.countdownSeconds || 20} seconds
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <RotateCcw className="h-3.5 w-3.5 text-purple-400" /> Late Extension
                      </span>
                      <span className="font-condensed font-bold text-white">
                        {room?.lateBidExtensionSeconds || 10} seconds
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: FOUR TEAM STATUS CARDS (Horizontal row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicTeamCards.map((card) => {
                return (
                  <div
                    key={`slot-${card.slotNum}`}
                    className={`rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all ${
                      card.cardClass
                    }`}
                  >
                    {/* Team Logo or Slot Badge */}
                    <div className="h-16 w-16 mb-2 flex items-center justify-center">
                      <TeamSlotBadge
                        slotNum={card.slotNum}
                        teamName={card.teamName}
                        logoUrl={card.logoUrl}
                        isJoined={card.isJoined}
                        size="md"
                      />
                    </div>

                    {/* Team Name */}
                    <h4 className="font-heading text-lg font-bold uppercase tracking-wider text-white truncate max-w-full">
                      {card.isJoined ? card.teamName : `TEAM SLOT ${card.slotNum}`}
                    </h4>

                    {/* Owner Name */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="text-[10px]">👤</span>
                      <span className="truncate max-w-[140px]">
                        {card.isJoined ? `Owner: ${card.ownerName}` : 'Waiting to join'}
                      </span>
                    </div>

                    {/* Icon Player Tag */}
                    {card.isJoined && card.iconPlayer && (
                      <div className="mt-2 w-full py-1 px-2 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center gap-1.5 justify-center shadow-[0_0_10px_rgba(251,191,36,0.15)]">
                        {card.iconPlayer.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={card.iconPlayer.photoUrl}
                            alt="Icon"
                            className="h-4 w-4 rounded-full object-cover border border-amber-400 shrink-0"
                          />
                        ) : (
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                        <span className="text-[10px] font-heading font-bold text-amber-300 truncate max-w-[130px]">
                          ★ {card.iconPlayer.name}
                        </span>
                      </div>
                    )}

                    {/* Status Pill */}
                    <div className="mt-2.5 w-full">
                      <div
                        className={`py-1.5 px-3 rounded-lg font-heading text-[11px] font-bold uppercase tracking-wider border ${
                          card.isJoined
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-900/80 text-sky-300 border-sky-500/30'
                        }`}
                      >
                        {card.isJoined ? 'JOINED' : 'NOT JOINED'}
                      </div>
                    </div>

                    {/* Bottom Stats: Players & Purse */}
                    <div className="mt-3 w-full pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span className="font-mono text-[11px]">{card.purchasedCount} / 7</span>
                      </div>
                      <div className="flex items-center gap-1 font-condensed font-bold text-amber-300">
                        <span>Purse</span>
                        <span>₹{card.remainingBudget.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CARD 3: AUCTION LAUNCH STATUS */}
            <div className="rounded-3xl border border-sky-400/40 bg-[#07152B]/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center shrink-0">
                  <Radio className="h-7 w-7 text-sky-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold uppercase tracking-widest text-sky-400">
                      AUCTION STATUS
                    </span>
                    <span className={`h-2 w-2 rounded-full ${joinedTeamsCount >= maxTeams ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className={`text-[11px] font-heading font-bold uppercase tracking-wider ${joinedTeamsCount >= maxTeams ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {joinedTeamsCount >= maxTeams ? 'ALL TEAMS JOINED — READY TO START' : 'WAITING FOR TEAMS TO JOIN'}
                    </span>
                  </div>
                  <h3 className="mt-1 font-condensed text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                    {joinedTeamsCount >= maxTeams
                      ? 'PRESS &quot;START AUCTION&quot; TO BEGIN LIVE BIDDING'
                      : 'AUCTION STARTS WHEN AUCTIONEER PRESSES START'}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    No automatic countdown. Live bidding begins only when you click the golden START AUCTION button.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider block">Teams Joined</span>
                  <span className="font-mono text-base font-bold text-sky-300">{joinedTeamsCount} / {maxTeams}</span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider block">Players Pool</span>
                  <span className="font-mono text-base font-bold text-amber-300">{totalPlayersCount}</span>
                </div>
              </div>
            </div>
            </>
            )}
          </div>

          {/* ===================================================== */}
          {/* RIGHT COLUMN (xl:col-span-4) */}
          {/* ===================================================== */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {!room ? (
              <div className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-6 flex flex-col items-center justify-center text-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-300">
                    Team & Purse Panel Inactive
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 font-sans leading-relaxed">
                    Team slots, purse allocations, and live auction controls will activate here once an auction room is created.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 font-heading text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Configure Auction</span>
                </button>
              </div>
            ) : (
              <>
            {/* CARD 1: TEAM PURSE & SQUAD */}
            <div className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Header Title */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-sky-400 font-heading text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span className="text-white">TEAM PURSE & SQUAD</span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[10px] font-heading uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
                <div className="col-span-3">Team</div>
                <div className="col-span-3 text-right">Remaining</div>
                <div className="col-span-2 text-right">Spent</div>
                <div className="col-span-2 text-right">Players</div>
                <div className="col-span-2 text-right">Squad</div>
              </div>

              {/* Table Rows */}
              <div className="mt-2 space-y-2.5">
                {dynamicTeamCards.map((card) => {
                  const teamBudget = Number(room?.teamBudget || 5000);
                  const spent = Math.max(0, teamBudget - card.remainingBudget);
                  const squadLeft = Math.max(0, (room?.squadSize || 7) - card.purchasedCount);

                  return (
                    <div
                      key={`table-slot-${card.slotNum}`}
                      className="grid grid-cols-12 items-center py-2 px-2 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/20 transition-all text-xs"
                    >
                      {/* Team Logo & Name */}
                      <div className="col-span-3 flex items-center gap-1.5 truncate">
                        <TeamSlotBadge
                          slotNum={card.slotNum}
                          teamName={card.teamName}
                          logoUrl={card.logoUrl}
                          isJoined={card.isJoined}
                          size="sm"
                        />
                        <span className="font-heading font-bold text-white truncate">
                          {card.isJoined ? card.teamName : `Slot ${card.slotNum} (Open)`}
                        </span>
                      </div>

                      {/* Remaining */}
                      <div className="col-span-3 text-right font-condensed font-bold text-amber-300">
                        ₹{card.remainingBudget.toLocaleString('en-IN')}
                      </div>

                      {/* Spent */}
                      <div className="col-span-2 text-right font-condensed text-slate-400">
                        ₹{spent.toLocaleString('en-IN')}
                      </div>

                      {/* Players */}
                      <div className="col-span-2 text-right font-mono text-slate-300">
                        {card.purchasedCount} / {room?.squadSize || 7}
                      </div>

                      {/* Squad Remaining */}
                      <div className="col-span-2 text-right font-mono text-slate-400">
                        {squadLeft}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 2: AUCTION CONTROLS */}
            <div className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Header Title */}
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10 text-amber-400 font-heading text-xs font-bold uppercase tracking-wider">
                <Crown className="h-4 w-4" />
                <span className="text-white">AUCTION CONTROLS</span>
              </div>

              {/* Large Gold Button: START AUCTION */}
              <button
                onClick={handleStartAuction}
                disabled={actionLoading || !room?.id}
                className="w-full py-4 px-6 rounded-2xl btn-gold-bid flex items-center justify-center gap-2.5 text-base sm:text-lg font-black uppercase tracking-wider shadow-[0_0_30px_rgba(255,184,0,0.6)] cursor-pointer transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
                    <span>Launching Arena…</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 fill-slate-950 text-slate-950" />
                    <span>START AUCTION</span>
                  </>
                )}
              </button>

              {/* Checklist underneath */}
              <div className="mt-4 space-y-1.5 text-[11px] text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className={joinedTeamsCount >= maxTeams ? 'text-emerald-400' : 'text-amber-400'}>⊙</span>
                  <span>All {maxTeams} teams must join ({joinedTeamsCount}/{maxTeams} connected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">⊙</span>
                  <span>Player registrations must be approved ({totalPlayersCount} ready)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">⊙</span>
                  <span>Auction settings must be valid</span>
                </div>
              </div>
            </div>
              </>
            )}

            {/* CARD 3: QUICK ACTIONS */}
            <div className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Header Title */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-sky-400 font-heading text-xs font-bold uppercase tracking-wider">
                <Sliders className="h-4 w-4" />
                <span className="text-white">QUICK ACTIONS</span>
              </div>

              {/* 4 Shortcut Buttons Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    loadPlayers();
                    setIsPlayersModalOpen(true);
                  }}
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-2.5 flex flex-col items-center justify-center gap-1.5 hover:border-sky-400 hover:bg-sky-500/10 transition group cursor-pointer"
                >
                  <Users className="h-4 w-4 text-slate-400 group-hover:text-sky-300 transition" />
                  <span className="font-heading text-[10px] uppercase font-bold text-slate-300 group-hover:text-white transition">
                    Player List
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTeamsModalOpen(true)}
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-2.5 flex flex-col items-center justify-center gap-1.5 hover:border-sky-400 hover:bg-sky-500/10 transition group cursor-pointer"
                >
                  <Coins className="h-4 w-4 text-slate-400 group-hover:text-sky-300 transition" />
                  <span className="font-heading text-[10px] uppercase font-bold text-slate-300 group-hover:text-white transition">
                    Teams & Purse
                  </span>
                </button>

                <Link
                  href="/results"
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-2.5 flex flex-col items-center justify-center gap-1.5 hover:border-sky-400 hover:bg-sky-500/10 transition group"
                >
                  <Clock className="h-4 w-4 text-slate-400 group-hover:text-sky-300 transition" />
                  <span className="font-heading text-[10px] uppercase font-bold text-slate-300 group-hover:text-white transition">
                    Auction History
                  </span>
                </Link>

                <Link
                  href="/admin/rooms"
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-2.5 flex flex-col items-center justify-center gap-1.5 hover:border-sky-400 hover:bg-sky-500/10 transition group"
                >
                  <FileText className="h-4 w-4 text-slate-400 group-hover:text-sky-300 transition" />
                  <span className="font-heading text-[10px] uppercase font-bold text-slate-300 group-hover:text-white transition">
                    Reports
                  </span>
                </Link>
              </div>

              {/* Player Entry Quick Link */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-heading uppercase font-bold text-[11px]">Player Entry:</span>
                </div>
                <Link
                  href={roomCode ? `/playerdetials?roomCode=${roomCode}` : '/playerdetials'}
                  target="_blank"
                  className="py-1 px-3 rounded-lg border border-amber-400/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 font-heading text-[11px] font-bold uppercase transition flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                >
                  <span>Open /playerdetials</span>
                  <span className="text-[10px]">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE AUCTION ROOM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-xl w-full rounded-3xl border border-sky-400/60 bg-[#07152B] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,140,255,0.4)] animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-sky-400 font-heading font-bold uppercase tracking-wider text-sm">
                <PlusCircle className="h-5 w-5" />
                <span>Create Real Auction Room</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Auction Match / Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NGPL Season 1 Player Auction"
                  value={newRoomForm.roomName}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, roomName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Tournament / League Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Narayana Guru Premier League"
                  value={newRoomForm.tournamentName}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, tournamentName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Official auction match details..."
                  value={newRoomForm.description}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Number of Teams
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    required
                    value={newRoomForm.maximumTeams}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, maximumTeams: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                  <span className="text-[10px] text-slate-400">Total teams joining this auction</span>
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Squad Size per Team
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    required
                    value={newRoomForm.squadSize}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, squadSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                  <span className="text-[10px] text-slate-400">Players per squad (e.g. 7: 6+1)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Team Budget (Points)
                  </label>
                  <input
                    type="number"
                    value={newRoomForm.teamBudget}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, teamBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Player Pool Size
                  </label>
                  <input
                    type="number"
                    value={newRoomForm.totalPlayersInPool}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, totalPlayersInPool: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                  <span className="text-[10px] text-slate-400">{poolPlayersCount} approved players in DB</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Base Price
                  </label>
                  <input
                    type="number"
                    value={newRoomForm.startingPrice}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, startingPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Increment
                  </label>
                  <input
                    type="number"
                    value={newRoomForm.bidIncrement}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, bidIncrement: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Timer (Sec)
                  </label>
                  <input
                    type="number"
                    value={newRoomForm.countdownSeconds}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, countdownSeconds: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Extension
                  </label>
                  <input
                    type="number"
                    value={newRoomForm.lateBidExtensionSeconds}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, lateBidExtensionSeconds: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  />
                </div>
              </div>

              {/* Player Pool Preview */}
              <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-sky-400" />
                  <span className="text-slate-300 font-sans">Approved Player Pool:</span>
                </div>
                <span className="font-condensed text-sm font-black text-sky-300">
                  {poolPlayersCount} Players Ready
                </span>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full mt-4 py-3 rounded-2xl btn-gold-bid font-heading text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,184,0,0.5)] cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 text-slate-950" />}
                <span>CREATE ROOM IN DATABASE</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ROOM CREATED SUCCESS MODAL (SHARE WITH TEAM OWNERS) */}
      {createdRoomResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-lg w-full rounded-3xl border border-amber-400/70 bg-[#07152B] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,184,0,0.4)] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400 font-heading font-bold uppercase tracking-wider text-sm">
                <Crown className="h-5 w-5" />
                <span>AUCTION MATCH CREATED SUCCESSFULLY</span>
              </div>
              <button
                onClick={() => setCreatedRoomResult(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Big Room Code Box */}
              <div className="rounded-2xl border border-sky-400/50 bg-sky-950/60 p-4 text-center">
                <span className="text-[11px] uppercase font-heading text-slate-400 tracking-wider">
                  Generated Room Code (Share with Team Owners)
                </span>
                <div className="mt-1 flex items-center justify-center gap-3">
                  <span className="font-mono text-3xl font-black text-sky-300 tracking-wider">
                    {createdRoomResult.roomCode}
                  </span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(createdRoomResult.roomCode);
                      setCopiedModalCode(true);
                      setTimeout(() => setCopiedModalCode(false), 2000);
                    }}
                    className="p-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 hover:bg-sky-500/30 transition cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedModalCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Passcode */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-xs">
                <span className="text-slate-400 font-heading uppercase">Room Passcode</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{createdRoomResult.passcode}</span>
              </div>

              {/* Shareable Join Link */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 space-y-2">
                <span className="text-[10px] uppercase font-heading text-slate-400 tracking-wider">
                  Team Owner Direct Registration Link
                </span>
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs text-slate-300 overflow-hidden">
                  <span className="truncate">{createdRoomResult.invitation}</span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(createdRoomResult.invitation);
                      setCopiedModalLink(true);
                      setTimeout(() => setCopiedModalLink(false), 2000);
                    }}
                    className="shrink-0 p-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition cursor-pointer"
                  >
                    {copiedModalLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/room/${createdRoomResult.id}/waiting-room`}
                  target="_blank"
                  className="w-full py-3 rounded-xl btn-gold-bid font-heading text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play className="h-4 w-4 fill-slate-950 text-slate-950" />
                  <span>Open Waiting Room</span>
                </Link>

                <button
                  onClick={() => setCreatedRoomResult(null)}
                  className="w-full py-3 rounded-xl border border-white/15 bg-slate-800 hover:bg-slate-700 font-heading text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROOM DETAILS MODAL */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#07152B] p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-heading font-bold uppercase text-amber-400 text-sm">Room Details</span>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                <span className="text-slate-400 font-heading uppercase">Room Name</span>
                <p className="font-bold text-white text-sm">{roomName || 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                <span className="text-slate-400 font-heading uppercase">Room Code</span>
                <p className="font-mono font-bold text-sky-300 text-base">{roomCode || 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                <span className="text-slate-400 font-heading uppercase">Tournament</span>
                <p className="font-bold text-white">{room?.tournament?.name || 'Narayana Guru Premier League'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                <span className="text-slate-400 font-heading uppercase">Invite Link</span>
                <p className="font-mono text-[11px] text-slate-300 break-all mt-1">
                  {typeof window !== 'undefined' ? `${window.location.origin}/team/join?roomCode=${roomCode}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-heading text-xs font-bold uppercase text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 1. DELETE AUCTION CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-md w-full rounded-3xl border border-rose-500/60 bg-[#07152B] p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.4)] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400 font-heading font-bold uppercase tracking-wider text-sm">
                <AlertTriangle className="h-5 w-5" />
                <span>CONFIRM AUCTION DELETION</span>
              </div>
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Are you sure you want to permanently delete this auction match?
              </p>

              <div className="rounded-2xl border border-white/10 bg-slate-950 p-3.5 space-y-1">
                <div className="text-xs text-slate-400 font-heading uppercase">Match Name</div>
                <div className="font-bold text-white text-sm">{roomName || 'Active Room'}</div>
                <div className="text-xs text-slate-400 font-heading uppercase pt-1">Room Code</div>
                <div className="font-mono font-bold text-sky-300 text-sm">{roomCode}</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200">
                ⚠️ All team memberships, live bidding records, and room configuration will be permanently erased from PostgreSQL.
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 font-heading text-xs font-bold uppercase text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAuction}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(244,63,94,0.5)] transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAL PLAYER POOL MANAGEMENT MODAL */}
      {isPlayersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-3xl w-full rounded-3xl border border-sky-400/50 bg-[#07152B] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,140,255,0.4)] animate-fadeIn my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-sky-400 font-heading font-bold uppercase tracking-wider text-sm sm:text-base">
                <Users className="h-5 w-5" />
                <span>REAL PLAYER POOL MANAGEMENT ({playersList.length})</span>
              </div>
              <div className="flex items-center gap-3">
                {playersList.length > 0 && (
                  <button
                    onClick={handleClearAllPlayers}
                    disabled={actionLoading}
                    className="py-1 px-2.5 rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-[11px] font-heading font-bold uppercase text-rose-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  onClick={() => setIsPlayersModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-5 mt-4">
              {/* ADD PLAYER FORM (Directly stores in Database) */}
              <form onSubmit={handleAddPlayer} className="p-4 rounded-2xl border border-white/10 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    <span>Register New Player to Database</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Stores permanently in PostgreSQL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] uppercase font-heading text-slate-400 mb-1">Player Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Virat Kumar"
                      value={newPlayerForm.name}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-900 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] uppercase font-heading text-slate-400 mb-1">Position</label>
                    <select
                      value={newPlayerForm.position}
                      onChange={(e) => setNewPlayerForm({ ...newPlayerForm, position: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-slate-900 text-xs text-white focus:outline-none focus:border-sky-400 font-sans cursor-pointer"
                    >
                      <option value="OUTSIDE_HITTER">Attacker</option>
                      <option value="LIBERO">Libero</option>
                      <option value="DEFENSIVE_SPECIALIST">Defence</option>
                      <option value="SETTER">Setter</option>
                      <option value="MIDDLE_BLOCKER">All Rounder</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] uppercase font-heading text-slate-400 mb-1">Base Price (Constant)</label>
                    <div className="w-full px-3 py-2 rounded-xl border border-amber-400/30 bg-amber-500/10 text-xs font-condensed font-black text-amber-300 flex items-center justify-between">
                      <span>₹50</span>
                      <span className="text-[10px] font-sans text-slate-400 uppercase font-bold">Standard</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <Link
                    href={`/playerdetials?roomCode=${roomCode}`}
                    target="_blank"
                    className="text-xs text-sky-400 hover:text-sky-300 underline font-heading uppercase tracking-wider flex items-center gap-1"
                  >
                    <span>Public Player Entry Link: /playerdetials</span>
                    <span className="text-[10px]">↗</span>
                  </Link>
                  <button
                    type="submit"
                    disabled={actionLoading || !newPlayerForm.name.trim()}
                    className="py-2 px-5 rounded-xl btn-gold-bid font-heading text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 text-slate-950" />}
                    <span>Add Player to DB</span>
                  </button>
                </div>
              </form>

              {/* PLAYER LIST TABLE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Player Roster ({playersList.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Real database records</span>
                </div>

                {loadingPlayers ? (
                  <div className="py-12 text-center text-slate-400 font-heading text-xs animate-pulse">
                    LOADING PLAYERS FROM DATABASE…
                  </div>
                ) : playersList.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40">
                    <Users className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No players in database</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Use the form above to add real players. Each player is saved directly to your PostgreSQL database.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                    {playersList.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/5 hover:border-white/15 transition text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-7 w-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-heading font-bold text-sky-300 text-xs shrink-0">
                            {player.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="font-heading font-bold text-white block truncate">{player.name}</span>
                            <span className="text-[10px] text-sky-400 font-medium">
                              {(() => {
                                const u = String(player.position || '').trim().toUpperCase();
                                if (u === 'OUTSIDE_HITTER' || u === 'ATTACKER') return 'Attacker';
                                if (u === 'LIBERO') return 'Libero';
                                if (u === 'DEFENSIVE_SPECIALIST' || u === 'DEFENCE') return 'Defence';
                                if (u === 'SETTER') return 'Setter';
                                if (u === 'MIDDLE_BLOCKER' || u === 'OPPOSITE' || u === 'ALL_ROUNDER') return 'All Rounder';
                                return player.position;
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-condensed font-bold text-amber-300 text-xs">
                            ₹{player.basePrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-heading font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {player.status}
                          </span>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            title="Delete Player"
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsPlayersModalOpen(false)}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 font-heading text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REAL TEAMS & PURSE STATUS MODAL */}
      {isTeamsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-2xl w-full rounded-3xl border border-sky-400/50 bg-[#07152B] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,140,255,0.4)] animate-fadeIn my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-sky-400 font-heading font-bold uppercase tracking-wider text-sm sm:text-base">
                <Coins className="h-5 w-5" />
                <span>TEAMS & PURSE STATUS ({joinedTeamsCount}/{maxTeams} Joined)</span>
              </div>
              <button
                onClick={() => setIsTeamsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 mt-4 space-y-3">
              {Array.from({ length: maxTeams }).map((_, idx) => {
                const team = dbTeams[idx];
                const slotNum = idx + 1;

                return (
                  <div
                    key={`modal-slot-${slotNum}`}
                    className="p-3.5 rounded-2xl border border-white/10 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <TeamSlotBadge
                        slotNum={slotNum}
                        teamName={team?.name}
                        logoUrl={team?.logoUrl}
                        isJoined={Boolean(team)}
                        size="md"
                      />
                      <div>
                        <div className="font-heading font-bold text-white text-sm">
                          {team ? team.name : `Team Slot ${slotNum}`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {team ? `Owner: ${team.ownerName}` : 'Slot Open — Waiting for team owner to join'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:text-right">
                      <div>
                        <div className="text-[10px] uppercase font-heading text-slate-400">Purse Left</div>
                        <div className="font-condensed font-bold text-amber-300 text-sm">
                          ₹{team ? team.remainingBudget?.toLocaleString('en-IN') : Number(room?.teamBudget || 5000).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-heading text-slate-400">Squad</div>
                        <div className="font-mono text-xs text-white">
                          {team ? `${team.purchasedCount} / ${room?.squadSize || 7}` : `0 / ${room?.squadSize || 7}`}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider ${
                        team ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      }`}>
                        {team ? 'JOINED' : 'OPEN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsTeamsModalOpen(false)}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 font-heading text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
