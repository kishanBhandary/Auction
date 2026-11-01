'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  KeyRound,
  ShieldCheck,
  Check,
  Radio,
  ExternalLink,
  Users,
} from 'lucide-react';
import { VplLogo } from '@/components/icons/team-icons';

export default function CreateAuctionRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    roomName: 'NGPL SEASON 1 AUCTION',
    description: 'Official auction room for Narayana Guru Premier League Season 1.',
    tournamentName: 'Narayana Guru Premier League',
    auctioneerEmail: 'auctioneer@vpl.local',
    maximumTeams: 4,
    teamBudget: 5000,
    squadSize: 7,
    startingPrice: 1000,
    bidIncrement: 100,
    countdownSeconds: 20,
    lateBidExtensionSeconds: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleChange = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
      setCreatedRoom(payload.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room creation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const joinLink = createdRoom
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/team/join?roomCode=${createdRoom.roomCode}`
    : '';

  return (
    <main className="min-h-screen bg-[#050B18] text-white flex flex-col stadium-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/rooms"
              className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-slate-200 hover:border-sky-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[10px] uppercase font-heading tracking-[0.25em] text-sky-400">
                League Administration
              </div>
              <h1 className="mt-1 font-condensed text-3xl font-black uppercase text-white tracking-wide">
                CREATE AUCTION ROOM
              </h1>
            </div>
          </div>
          <VplLogo />
        </div>

        {/* Success Modal / Card when room is created */}
        {createdRoom ? (
          <div className="max-w-3xl mx-auto rounded-3xl border-2 border-sky-400/60 bg-[#07152B]/95 p-8 shadow-[0_0_50px_rgba(0,140,255,0.4)] backdrop-blur-2xl animate-fadeIn">
            <div className="flex items-center gap-3 text-emerald-400 font-heading font-bold uppercase tracking-wider text-sm mb-4">
              <ShieldCheck className="h-5 w-5" />
              <span>Room Created Successfully</span>
            </div>

            <h2 className="font-condensed text-4xl font-black uppercase text-white tracking-wide">
              {createdRoom.roomName}
            </h2>
            <p className="mt-1 text-sm text-slate-300 font-sans">
              Share the credentials or direct registration link below with team owners so they can join with their logo and photo.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Room Code */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                <span className="text-[10px] font-heading uppercase text-slate-400 tracking-wider">
                  Room Code
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-sky-300">
                    {createdRoom.roomCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdRoom.roomCode, 'code')}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedField === 'code' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedField === 'code' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Passcode */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                <span className="text-[10px] font-heading uppercase text-slate-400 tracking-wider">
                  Room Passcode
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-amber-300">
                    {createdRoom.passcode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdRoom.passcode, 'passcode')}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedField === 'passcode' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedField === 'passcode' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Team Owner Direct Join Link */}
            <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-950/30 p-4">
              <span className="text-[10px] font-heading uppercase text-sky-300 tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Team Owner Registration Link (/team/join)
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={joinLink}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono text-slate-300"
                />
                <button
                  onClick={() => copyToClipboard(joinLink, 'link')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 font-heading text-xs font-bold uppercase tracking-wider text-slate-950 shrink-0 flex items-center gap-1.5 transition"
                >
                  {copiedField === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedField === 'link' ? 'Copied Link' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <Link
                href={`/room/${createdRoom.id}/waiting-room`}
                className="flex-1 py-3.5 px-6 rounded-2xl btn-gold-bid font-heading text-sm font-black uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <span>Enter Waiting Room</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href={`/auctioneer/rooms/${createdRoom.id}/auction`}
                className="py-3.5 px-6 rounded-2xl border border-purple-500/60 bg-purple-950/50 hover:bg-purple-900/60 font-heading text-sm font-bold uppercase tracking-wider text-purple-200 text-center flex items-center justify-center gap-2"
              >
                <span>Launch Auctioneer Panel</span>
                <Radio className="h-4 w-4 text-purple-400" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form for Creating Room */
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {error && (
                <div className="mb-5 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-xs font-heading uppercase text-red-300">
                  {error}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Auction Room Name
                  </label>
                  <input
                    value={form.roomName}
                    onChange={(e) => handleChange('roomName', e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Room Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="min-h-20 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Tournament
                  </label>
                  <input
                    value={form.tournamentName}
                    onChange={(e) => handleChange('tournamentName', e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Auctioneer Email
                  </label>
                  <input
                    value={form.auctioneerEmail}
                    onChange={(e) => handleChange('auctioneerEmail', e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Maximum Teams
                  </label>
                  <input
                    type="number"
                    value={form.maximumTeams}
                    onChange={(e) => handleChange('maximumTeams', Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Team Budget (Points)
                  </label>
                  <input
                    type="number"
                    value={form.teamBudget}
                    onChange={(e) => handleChange('teamBudget', Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Squad Size
                  </label>
                  <input
                    type="number"
                    value={form.squadSize}
                    onChange={(e) => handleChange('squadSize', Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
                    Bid Increment
                  </label>
                  <input
                    type="number"
                    value={form.bidIncrement}
                    onChange={(e) => handleChange('bidIncrement', Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3.5 rounded-2xl btn-gold-bid font-heading text-base font-black uppercase tracking-wider shadow-[0_0_25px_rgba(255,184,0,0.5)] transition"
              >
                {loading ? 'Creating Auction Arena…' : 'Create Room & Generate Credentials'}
              </button>
            </section>

            {/* Sidebar Summary */}
            <aside className="rounded-3xl border border-white/10 bg-[#07152B]/80 p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
              <div>
                <span className="font-heading text-xs uppercase tracking-wider text-slate-400">
                  Settings Preview
                </span>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
                    <span className="text-slate-400 font-heading uppercase">Teams</span>
                    <p className="font-condensed text-xl font-bold text-white">{form.maximumTeams} Teams</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
                    <span className="text-slate-400 font-heading uppercase">Purse</span>
                    <p className="font-condensed text-xl font-bold text-amber-300">₹{form.teamBudget.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
                    <span className="text-slate-400 font-heading uppercase">Squad</span>
                    <p className="font-condensed text-xl font-bold text-white">{form.squadSize} (6+1)</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-200">
                After creation, you will receive the unique Room Code and Passcode along with a shareable registration link for team owners.
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
