'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CalendarClock, ClipboardList, Crown, Radio, ShieldCheck, Trophy, Users } from 'lucide-react';

export default function AuctioneerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || payload.user?.role !== 'AUCTIONEER') {
          router.replace('/auctioneer/login');
          return;
        }
        setUser(payload.user);
      })
      .catch(() => router.replace('/auctioneer/login'));
  }, [router]);

  if (!user) {
    return <div className="min-h-screen bg-[#071326] px-6 py-12 text-white">Authorizing auctioneer access…</div>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071326] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(3, 11, 22, 0.88) 0%, rgba(4, 15, 31, 0.78) 26%, rgba(9, 23, 43, 0.84) 100%), url('/images/vpl-login-bg.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,_rgba(0,186,255,0.22),_transparent_18%),radial-gradient(circle_at_80%_80%,_rgba(255,184,0,0.14),_transparent_20%)]" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="rounded-[32px] border border-[#00A8FF]/35 bg-[#071326]/75 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-md sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-[#FFB800]/55 bg-[#FFB800]/10 shadow-[0_0_30px_rgba(255,184,0,0.12)]">
                  <img src="/logo.png" alt="VPL Logo" className="h-full w-full object-contain p-2" />
                </div>
                <div>
                  <div className="text-[0.62rem] uppercase tracking-[0.32em] text-[#8bd8ff]">Auctioneer control</div>
                  <h1 className="font-condensed text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">VPL Dashboard</h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-[#FFB800]/30 bg-[#FFB800]/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-[#ffd56d]">
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  Live access
                </span>
                <Link href="/auctioneer/login" className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-sky-200">
                  Switch role
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-[#00A8FF]/30 bg-[#071326]/70 p-6 shadow-[0_0_0_1px_rgba(0,168,255,0.25),0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">
                <Trophy className="h-3.5 w-3.5 text-[#FFB800]" />
                Room overview
              </div>

              <h2 className="mt-4 font-condensed text-5xl font-black tracking-[-0.04em] text-white">Auctioneer lane</h2>
              <p className="mt-3 max-w-xl text-base text-slate-300">
                Manage the live auction room, monitor team join status, and keep the tournament flow moving with a polished VPL control center.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/auctioneer/rooms/VPL2026" className="inline-flex items-center gap-2 rounded-full bg-[#FFB800] px-5 py-3 text-sm font-black text-[#071326] shadow-[0_0_26px_rgba(255,184,0,0.45)] transition hover:bg-[#ffc933]">
                  Open room <ArrowRight className="h-4 w-4" />
                </Link>
                <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-sky-200">
                  <CalendarClock className="h-4 w-4" />
                  Schedule setup
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#FFB800]/25 bg-[#091a2d]/78 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[0.62rem] uppercase tracking-[0.2em] text-slate-400">Broadcast</div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-emerald-200">online</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                  <div className="text-[0.58rem] uppercase tracking-[0.22em] text-slate-400">Live room</div>
                  <div className="mt-2 text-3xl font-black text-white">VPL SEASON 1</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
                    <div className="text-[0.58rem] uppercase tracking-[0.2em] text-slate-400">Code</div>
                    <div className="mt-2 text-xl font-black text-sky-200">VPL2026</div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
                    <div className="text-[0.58rem] uppercase tracking-[0.2em] text-slate-400">Status</div>
                    <div className="mt-2 text-xl font-black text-amber-200">Waiting</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#00A8FF]/25 bg-[#091a2d]/80 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.5)] backdrop-blur-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/25 bg-sky-500/10 text-sky-300">
                <Radio className="h-5 w-5" />
              </div>
              <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Status</div>
              <div className="mt-3 text-3xl font-black text-white">Live</div>
            </div>

            <div className="rounded-[28px] border border-[#00A8FF]/25 bg-[#091a2d]/80 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.5)] backdrop-blur-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Teams joined</div>
              <div className="mt-3 text-3xl font-black text-white">0 / 4</div>
            </div>

            <div className="rounded-[28px] border border-[#00A8FF]/25 bg-[#091a2d]/80 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.5)] backdrop-blur-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Players</div>
              <div className="mt-3 text-3xl font-black text-white">12</div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-[#00A8FF]/25 bg-[#071326]/75 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Current room</div>
                  <h3 className="mt-2 font-condensed text-4xl font-black tracking-[-0.04em] text-white">Assigned room</h3>
                </div>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-amber-200">Waiting</span>
              </div>

              <div className="rounded-[26px] border border-slate-700 bg-slate-950/65 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Tournament</div>
                    <div className="mt-2 text-2xl font-black text-white">VPL SEASON 1 AUCTION</div>
                    <div className="mt-2 text-sm text-slate-400">Room code: VPL2026 • 0/4 teams joined</div>
                  </div>

                  <Link href="/auctioneer/rooms/VPL2026" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00A8FF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(0,168,255,0.3)] transition hover:bg-sky-400">
                    Open room <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#FFB800]/25 bg-[#071326]/75 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">
                <Crown className="h-3.5 w-3.5 text-[#FFB800]" />
                Quick actions
              </div>

              <div className="mt-5 space-y-3">
                <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/65 px-4 py-3 text-left transition hover:border-sky-400 hover:text-sky-200">
                  <span className="text-sm font-medium text-slate-200">Start auction</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/65 px-4 py-3 text-left transition hover:border-sky-400 hover:text-sky-200">
                  <span className="text-sm font-medium text-slate-200">Open player board</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/65 px-4 py-3 text-left transition hover:border-sky-400 hover:text-sky-200">
                  <span className="text-sm font-medium text-slate-200">Review results</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
