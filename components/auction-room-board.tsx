'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const teamStyles: Record<string, string> = {
  'Team Alpha': 'from-sky-500 to-blue-600',
  'Team Bravo': 'from-violet-500 to-indigo-600',
  'Team Charlie': 'from-orange-500 to-amber-500',
  'Team Delta': 'from-emerald-500 to-teal-600',
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function AuctionRoomBoard({
  role,
  session,
}: {
  role: 'PUBLIC' | 'TEAM_OWNER' | 'AUCTIONEER';
  session?: { teamId?: string; teamName?: string; email?: string; role?: string } | null;
}) {
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const activeTeam = useMemo(() => {
    if (!session?.teamName || !room?.teams) {
      return null;
    }
    return room.teams.find((team: any) => team.name === session.teamName) ?? null;
  }, [room, session]);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const res = await fetch('/api/auction-room', { cache: 'no-store' });
        const payload = await res.json();
        setRoom(payload.room ?? null);
      } catch {
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
    const interval = setInterval(loadRoom, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes('placeholder')) {
      return;
    }

    const channel = supabase.channel('vpl-auction-room');
    channel.on('broadcast', { event: 'room:update' }, (payload: any) => {
      setRoom(payload.payload?.room ?? null);
    });
    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const bidNow = async (amount: number) => {
    if (!session?.teamId && role === 'TEAM_OWNER') {
      return;
    }

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const payload = await res.json();
    if (!res.ok) {
      alert(payload.message ?? 'Bid failed');
      return;
    }

    const refreshed = await fetch('/api/auction-room', { cache: 'no-store' });
    const nextRoom = await refreshed.json();
    setRoom(nextRoom.room ?? null);
  };

  const handleAction = async (endpoint: string) => {
    const res = await fetch(endpoint, { method: 'POST' });
    const payload = await res.json();
    if (!res.ok) {
      alert(payload.message ?? 'Action failed');
      return;
    }

    const refreshed = await fetch('/api/auction-room', { cache: 'no-store' });
    const nextRoom = await refreshed.json();
    setRoom(nextRoom.room ?? null);
  };

  if (loading || !room) {
    return <div className="min-h-screen bg-[#040915] p-6 text-white">Loading auction board…</div>;
  }

  const currentPlayer = room.currentPlayer;
  const highestBidder = room.highestBidTeam?.name ?? 'No team';
  const leftTeam = room.teams[0];
  const topTeam = room.teams[1];
  const rightTeam = room.teams[2];
  const bottomTeam = room.teams[3];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,_rgba(43,87,224,0.35),_transparent_18%),linear-gradient(180deg,#040b17_0%,#050d1d_45%,#030915_100%)] px-3 py-5 text-white sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-5 flex items-center justify-between rounded-[24px] border border-sky-500/30 bg-[#0a162d]/90 px-4 py-3 shadow-[0_0_35px_rgba(14,165,233,0.15)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-base font-black text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.5)]">
              VPL
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-sky-200">Volleyball</div>
              <div className="text-sm font-black tracking-wide text-white">Premier League</div>
            </div>
          </div>

          <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-100">
            Auction Room
          </div>
        </div>

        <div className="mb-5 rounded-[28px] border border-slate-800 bg-[linear-gradient(180deg,rgba(7,13,24,0.8),rgba(5,10,18,0.95))] p-4 shadow-[0_0_30px_rgba(14,165,233,0.06)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Auction waiting room</h1>
              <p className="mt-1 text-sm text-slate-300">All teams are joined. The auction will begin shortly.</p>
            </div>
            <div className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-sky-200">
              Live
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[leftTeam, topTeam, rightTeam, bottomTeam].map((team, index) => (
              <div
                key={team.id}
                className={`relative overflow-hidden rounded-[20px] border ${
                  index % 2 === 0 ? 'border-sky-500/40' : 'border-emerald-500/40'
                } bg-[linear-gradient(180deg,rgba(8,15,26,0.95),rgba(8,15,26,0.7))] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${teamStyles[team.name] ?? 'from-sky-500 to-violet-500'}`} />
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Team</div>
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] text-emerald-200">
                    Joined
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${teamStyles[team.name] ?? 'from-sky-500 to-violet-500'} text-base font-black text-white`}>
                    {team.shortName}
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">{team.name.replace('Team ', '')}</div>
                    <div className="text-xs text-slate-300">Owner: {team.ownerName}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-2 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Purse</div>
                    <div className="mt-1 font-bold text-white">{money.format(team.remainingBudget ?? 0)}</div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-2 py-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Slots</div>
                    <div className="mt-1 font-bold text-white">{team.availableSlots ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-slate-800 bg-slate-950/70 p-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Teams</div>
              <div className="mt-1 font-black text-white">4</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Squad Size</div>
              <div className="mt-1 font-black text-white">7</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Team purse</div>
              <div className="mt-1 font-black text-white">{money.format(5000)}</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Bid increment</div>
              <div className="mt-1 font-black text-white">{money.format(room.nextValidBid ?? 100)}</div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="flex items-center justify-center rounded-full border-[4px] border-sky-400/70 bg-sky-500/10 px-8 py-4 shadow-[0_0_28px_rgba(59,130,246,0.35)]">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.28em] text-sky-200">Auction starts in</div>
                <div className="mt-2 text-4xl font-black tracking-tight text-white">05:00</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[26px] border border-slate-800 bg-[linear-gradient(180deg,rgba(8,17,31,0.88),rgba(5,10,18,0.95))] p-4 shadow-[0_0_32px_rgba(59,130,246,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-red-200">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Live auction
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1">Players 24</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1">Sold 6</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1">Unsold 0</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1">Remaining 18</span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr_1fr]">
            <div className="space-y-4">
              <TeamLivePanel team={leftTeam} side="left" />
              <TeamLivePanel team={rightTeam} side="right" />
            </div>

            <div className="rounded-[22px] border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Auction no. 08</div>
                <div className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[8px] uppercase tracking-[0.22em] text-sky-200">
                  {room.auctionStatus}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                {currentPlayer?.photoUrl ? (
                  <img src={currentPlayer.photoUrl} alt={currentPlayer.name} className="h-44 w-44 rounded-full border-[5px] border-sky-500/50 object-cover shadow-[0_0_30px_rgba(59,130,246,0.35)]" />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center rounded-full border-[5px] border-sky-500/50 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-4xl font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                    {currentPlayer?.name?.slice(0, 2).toUpperCase() ?? 'PL'}
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="text-[10px] uppercase tracking-[0.28em] text-sky-200">Current player</div>
                <h2 className="mt-2 text-3xl font-black text-white">{currentPlayer?.name ?? 'No player selected'}</h2>
                <div className="mt-2 flex items-center justify-center gap-3 text-sm text-slate-300">
                  <span>{currentPlayer?.position ?? 'Waiting for selection'}</span>
                  <span>•</span>
                  <span>Age {currentPlayer?.age ?? '—'}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Base price</div>
                  <div className="mt-2 text-2xl font-black text-amber-300">{money.format(currentPlayer?.basePrice ?? 0)}</div>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Current bid</div>
                  <div className="mt-2 text-2xl font-black text-amber-300">{money.format(room.currentHighestBid)}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-violet-500/40 bg-violet-500/10 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.22em] text-violet-200">Highest bidder</div>
                <div className="mt-2 text-xl font-black text-white">{highestBidder}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Next bid</div>
                <div className="mt-2 text-xl font-black text-white">{money.format(room.nextValidBid)}</div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-2xl font-black text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.2)]">
                <span className="text-xl font-bold text-amber-300">00:</span>
                <span>{String(room.countdownSeconds ?? 0).padStart(2, '0')}</span>
              </div>

              {role === 'TEAM_OWNER' && session?.teamName && (
                <div className="mt-5 flex items-center gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-xl font-black text-slate-950 hover:brightness-110">
                    Bid {money.format(room.nextValidBid)}
                  </Button>
                  <Button className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-900 text-2xl text-white hover:bg-slate-800">+</Button>
                </div>
              )}

              {role === 'AUCTIONEER' && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Button className="bg-sky-600 hover:bg-sky-500">Start bidding</Button>
                  <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400">Pause</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-500">Sold</Button>
                  <Button className="bg-red-600 hover:bg-red-500">Unsold</Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <TeamLivePanel team={topTeam} side="top" />
              <TeamLivePanel team={bottomTeam} side="bottom" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function TeamLivePanel({ team, side }: { team: any; side: 'left' | 'right' | 'top' | 'bottom' }) {
  if (!team) return null;

  const gradient = teamStyles[team.name] ?? 'from-slate-500 to-slate-700';

  return (
    <div className="rounded-[20px] border border-slate-800 bg-[linear-gradient(180deg,rgba(10,17,29,0.95),rgba(9,14,23,0.9))] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r ${gradient} text-sm font-black text-white`}>
            {team.shortName}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Owner: {team.ownerName}</div>
            <div className="text-lg font-black text-white">{team.name.replace('Team ', '')}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Purse</div>
          <div className="text-base font-black text-white">{money.format(team.remainingBudget ?? 0)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-300">
        <span>Players</span>
        <span className="font-semibold text-white">{team.purchasedCount ?? 0} / {((team.availableSlots ?? 0) + (team.purchasedCount ?? 0))}</span>
      </div>

      <div className="mt-3 flex gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-[10px] font-bold text-slate-200">
            {idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
