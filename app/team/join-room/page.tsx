'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, KeyRound, ShieldCheck, Trophy, Users } from 'lucide-react';

export default function TeamJoinRoomPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('VPL2026');
  const [passcode, setPasscode] = useState('482916');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || payload.user?.role !== 'TEAM_OWNER') {
          router.replace('/team/login');
          return;
        }
        setSession(payload.user);
      })
      .catch(() => router.replace('/team/login'));
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/team/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, passcode }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to join room');

      if (payload.redirect) {
        router.push(payload.redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join room');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">Checking owner access…</div>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),transparent_26%),linear-gradient(135deg,#020817_0%,#0b1120_52%,#020b18_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-violet-400/20 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(76,29,149,0.35)] backdrop-blur">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.28em] text-violet-300">Volleyball Premier League</div>
            <h1 className="mt-2 text-3xl font-black">Join Auction Room</h1>
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-emerald-100">Connected</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 text-violet-300"><Trophy className="h-5 w-5" /></div>
              <div>
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Lobby access</div>
                <div className="text-xl font-black">Team owner room entry</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Assigned team</label>
                <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-bold text-violet-200">{session.teamName || 'Team owner'}</div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Room code</label>
                <div className="relative">
                  <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-lg font-bold tracking-[0.2em] text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Room passcode</label>
                <div className="relative">
                  <input value={passcode} onChange={(event) => setPasscode(event.target.value)} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-lg font-bold text-white" />
                </div>
              </div>

              {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500">
                {loading ? 'Joining room...' : 'Join Room'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </section>

          <aside className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-black">Room details</h2>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Tournament</div>
                <div className="mt-2 font-semibold">Volleyball Premier League</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Owner</div>
                <div className="mt-2 font-semibold">{session.name}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
                <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Team purse</div>
                <div className="mt-2 font-semibold">₹5,000</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
