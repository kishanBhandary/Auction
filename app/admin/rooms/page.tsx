'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/rooms')
      .then((response) => response.json())
      .then((payload) => setRooms(payload.rooms || []))
      .catch(() => setRooms([]));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_25%),linear-gradient(135deg,#020817_0%,#071421_52%,#020b18_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.28em] text-sky-300">All rooms</div>
            <h1 className="mt-2 text-3xl font-black">Auction rooms</h1>
          </div>
          <Link href="/admin/rooms/create" className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400">Create new room</Link>
        </div>

        <div className="grid gap-4">
          {rooms.length === 0 ? (
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 text-slate-300">No rooms created yet.</div>
          ) : rooms.map((room) => (
            <Link key={room.id} href={`/admin/rooms/${room.id}`} className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-black">{room.roomName}</div>
                  <div className="mt-1 text-sm text-slate-400">{room.tournament?.name || 'Volleyball Premier League'} • {room.roomCode}</div>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-200">{room.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
