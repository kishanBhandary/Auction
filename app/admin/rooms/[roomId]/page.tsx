'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

export default function AdminRoomDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 px-6 py-10 text-white">Loading room details…</div>}>
      <AdminRoomDetailContent />
    </Suspense>
  );
}

function AdminRoomDetailContent() {
  const params = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    if (!params?.roomId) return;
    fetch(`/api/admin/rooms/${params.roomId}`)
      .then((response) => response.json())
      .then((payload) => setRoom(payload.room || null))
      .catch(() => setRoom(null));
  }, [params?.roomId]);

  if (!room) {
    return <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">Loading room details…</div>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_25%),linear-gradient(135deg,#020817_0%,#071421_52%,#020b18_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-slate-800 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.8)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.28em] text-sky-300">Room overview</div>
            <h1 className="mt-2 text-3xl font-black">{room.roomName}</h1>
          </div>
          <Link href="/admin/dashboard" className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">Back to dashboard</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between">
              <span className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Room code</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-200">{room.status}</span>
            </div>
            <div className="text-3xl font-black tracking-[0.18em] text-sky-200">{room.roomCode}</div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">{room.description || 'Official NGPL bidding room.'}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4"><div className="text-[0.62rem] uppercase tracking-[0.2em] text-slate-400">Tournament</div><div className="mt-2 text-lg font-semibold">{room.tournament.name}</div></div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4"><div className="text-[0.62rem] uppercase tracking-[0.2em] text-slate-400">Teams</div><div className="mt-2 text-lg font-semibold">{room.memberships.length}/{room.maximumTeams}</div></div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-black">Joined teams</h2>
            <div className="mt-5 space-y-3">
              {room.memberships.length === 0 ? <div className="text-slate-400">No teams have joined yet.</div> : room.memberships.map((membership: any) => (
                <div key={membership.id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
                  <div className="font-semibold">{membership.team.name}</div>
                  <div className="text-sm text-slate-400">Owner: {membership.user.name}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
