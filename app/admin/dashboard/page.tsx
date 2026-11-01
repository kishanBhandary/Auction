'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, ShieldCheck, Trophy, Zap } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !['ADMIN', 'SUPER_ADMIN'].includes(payload.user?.role)) {
          router.replace('/admin/login');
          return;
        }
        setUser(payload.user);
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!user) {
    return <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">Verifying management access…</div>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),transparent_28%),linear-gradient(135deg,#020817_0%,#071421_52%,#020b18_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-sky-400/20 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.75)] md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.28em] text-sky-300">League command centre</div>
            <h1 className="mt-2 text-3xl font-black">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/rooms/create" className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400">Create room <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Tournament', value: 'Volleyball Premier League', icon: Trophy },
            { label: 'Active Rooms', value: '1 room', icon: Building2 },
            { label: 'System Status', value: 'Operational', icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-5">
              <div className="mb-4 inline-flex rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300"><Icon className="h-5 w-5" /></div>
              <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">{label}</div>
              <div className="mt-3 text-2xl font-black">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Auction rooms</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-200">Ready</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold">VPL SEASON 1 AUCTION</div>
                    <div className="text-sm text-slate-400">Room code: VPL2026 • Waiting for owners</div>
                  </div>
                  <Link href="/admin/rooms/create" className="text-sm text-sky-300 hover:text-sky-200">Manage</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-300" />
              <h2 className="text-xl font-black">Quick actions</h2>
            </div>
            <div className="space-y-3">
              <Link href="/admin/rooms/create" className="block rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 hover:border-sky-500/40">Create auction room</Link>
              <Link href="/auctioneer/dashboard" className="block rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 hover:border-sky-500/40">Auctioneer overview</Link>
              <Link href="/team/login" className="block rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200 hover:border-sky-500/40">Team owner portal</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
