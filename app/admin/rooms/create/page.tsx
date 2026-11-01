'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, KeyRound, PlusCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CreateAuctionRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    roomName: 'VPL SEASON 1 AUCTION',
    description: 'Official auction room for Volleyball Premier League season 1.',
    tournamentName: 'Volleyball Premier League',
    auctioneerEmail: 'auctioneer@vpl.local',
    maximumTeams: 4,
    teamBudget: 5000,
    squadSize: 7,
    startingPrice: 100,
    bidIncrement: 100,
    countdownSeconds: 20,
    lateBidExtensionSeconds: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Room creation failed');
      router.push(`/admin/rooms/${payload.room.id}/waiting-room`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),transparent_25%),linear-gradient(135deg,#020817_0%,#061526_52%,#020b18_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.28em] text-sky-300">Create room</div>
              <h1 className="mt-2 text-3xl font-black">Auction room setup</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Auction room name</label>
                <input value={form.roomName} onChange={(event) => handleChange('roomName', event.target.value)} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Room description</label>
                <textarea value={form.description} onChange={(event) => handleChange('description', event.target.value)} className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Tournament</label>
                <input value={form.tournamentName} onChange={(event) => handleChange('tournamentName', event.target.value)} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Auctioneer</label>
                <input value={form.auctioneerEmail} onChange={(event) => handleChange('auctioneerEmail', event.target.value)} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Maximum teams</label>
                <input type="number" value={form.maximumTeams} onChange={(event) => handleChange('maximumTeams', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Team budget</label>
                <input type="number" value={form.teamBudget} onChange={(event) => handleChange('teamBudget', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Squad size</label>
                <input type="number" value={form.squadSize} onChange={(event) => handleChange('squadSize', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Starting price</label>
                <input type="number" value={form.startingPrice} onChange={(event) => handleChange('startingPrice', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Bid increment</label>
                <input type="number" value={form.bidIncrement} onChange={(event) => handleChange('bidIncrement', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Countdown</label>
                <input type="number" value={form.countdownSeconds} onChange={(event) => handleChange('countdownSeconds', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Late bid extension</label>
                <input type="number" value={form.lateBidExtensionSeconds} onChange={(event) => handleChange('lateBidExtensionSeconds', Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white" />
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 inline-flex rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300"><ShieldCheck className="h-5 w-5" /></div>
            <h2 className="text-xl font-black">Room defaults</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Teams</div><div className="mt-2 font-semibold">1. Team Alpha 2. Team Bravo 3. Team Charlie 4. Team Delta</div></div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Budget</div><div className="mt-2 font-semibold">₹5,000 per team</div></div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Bidding</div><div className="mt-2 font-semibold">Base price 100 • Increment 100</div></div>
            </div>

            {error ? <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-400">
              <PlusCircle className="h-4 w-4" /> {loading ? 'Creating room...' : 'Create room'}
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
