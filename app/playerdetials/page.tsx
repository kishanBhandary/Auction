'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  User,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Target,
  Award,
  ArrowRight,
  PlusCircle,
  Coins,
} from 'lucide-react';
import { VplLogo } from '@/components/icons/team-icons';

export default function PlayerDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white font-heading">Loading…</div>}>
      <PlayerDetailsContent />
    </Suspense>
  );
}

const POSITIONS = [
  { id: 'OUTSIDE_HITTER', label: 'Attacker', icon: Zap, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { id: 'LIBERO', label: 'Libero', icon: Shield, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { id: 'DEFENSIVE_SPECIALIST', label: 'Defence', icon: Shield, color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  { id: 'SETTER', label: 'Setter', icon: Target, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { id: 'MIDDLE_BLOCKER', label: 'All Rounder', icon: Award, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
];

function PlayerDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    roomCode: '',
    name: '',
    position: 'OUTSIDE_HITTER',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredPlayer, setRegisteredPlayer] = useState<any>(null);

  // Auto-populate room code if passed in URL
  useEffect(() => {
    const code = searchParams.get('roomCode') || searchParams.get('code');
    if (code) {
      setForm((prev) => ({ ...prev, roomCode: code.toUpperCase() }));
    }
  }, [searchParams]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/players/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.message || 'Image upload failed.');
    }
    return data.url;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    try {
      setPhotoUploading(true);
      const url = await uploadToCloudinary(file);
      setPhotoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Player photo upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile && !finalPhotoUrl) {
        setPhotoUploading(true);
        finalPhotoUrl = await uploadToCloudinary(photoFile);
        setPhotoUrl(finalPhotoUrl);
      }

      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: form.roomCode.trim().toUpperCase(),
          name: form.name.trim(),
          position: form.position,
          basePrice: 50, // Constant base price 50
          photoUrl: finalPhotoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register player in auction pool.');
      }

      setRegisteredPlayer({
        ...data.player,
        roomCode: form.roomCode.trim().toUpperCase(),
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
      setPhotoUploading(false);
    }
  };

  const handleResetForNextPlayer = () => {
    setRegisteredPlayer(null);
    setForm((prev) => ({
      ...prev,
      name: '',
      position: 'OUTSIDE_HITTER',
    }));
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
    setError(null);
  };

  const currentPos = POSITIONS.find((p) => p.id === form.position) || POSITIONS[0];

  return (
    <main className="min-h-screen bg-[#050B18] text-white flex flex-col items-center justify-center p-4 sm:p-6 stadium-bg relative overflow-x-hidden select-none">
      {/* Stadium Atmospheric Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[750px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -top-10 left-[15%] h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />
        <div className="absolute -top-10 right-[15%] h-72 w-72 rounded-full bg-amber-400/10 blur-[100px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between pb-6 mb-2">
        <VplLogo />
        <Link
          href="/auctioneer/dashboard"
          className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 hover:text-white transition"
        >
          Auctioneer Dashboard →
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player Entry Form (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-3xl border border-sky-400/40 bg-[#07152B]/85 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="pb-4 mb-5 border-b border-white/10">
            <span className="text-[11px] font-heading font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              PLAYER AUCTION POOL ENTRY
            </span>
            <h1 className="mt-1 font-condensed text-3xl sm:text-4xl font-black uppercase tracking-wide text-white">
              PLAYER DETAILS REGISTRATION
            </h1>
            <p className="mt-1 text-xs text-slate-300 font-sans leading-relaxed">
              Enter your room code, player details, choose your playing position, and upload your official match photo. All players enter with a constant base price of ₹50.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-3.5 text-xs font-heading uppercase tracking-wider text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {registeredPlayer ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-condensed text-2xl font-black uppercase text-white tracking-wide">
                  PLAYER REGISTERED SUCCESSFULLY!
                </h3>
                <p className="mt-1 text-xs text-slate-300 font-sans">
                  <span className="font-bold text-white">{registeredPlayer.name}</span> has been added to the official auction pool for room{' '}
                  <span className="font-mono font-bold text-amber-300">{registeredPlayer.roomCode || 'MATCH'}</span>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForNextPlayer}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl btn-gold-bid font-heading text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 text-slate-950" />
                  <span>Register Another Player</span>
                </button>
                <Link
                  href={registeredPlayer.roomCode ? `/room/${registeredPlayer.roomCode}/waiting-room` : '/auctioneer/dashboard'}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-sky-400/50 bg-sky-500/15 text-xs font-heading font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/25 transition text-center"
                >
                  Go to Waiting Room →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Room Code */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Room Code *</span>
                  <span className="text-[10px] text-sky-400 font-mono">Required to link match</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NPL-4829"
                    value={form.roomCode}
                    onChange={(e) => setForm({ ...form, roomCode: e.target.value.toUpperCase() })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sky-400/40 bg-slate-950 text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-sky-300 shadow-[0_0_15px_rgba(0,140,255,0.15)]"
                  />
                </div>
              </div>

              {/* 2. Player Full Name */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Player Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sandeep Gowda, Vignesh Rao"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                  />
                </div>
              </div>

              {/* 3. Position Selection (Attacker, Libero, Defence, Setter, All Rounder) */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Playing Position *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POSITIONS.map((pos) => {
                    const Icon = pos.icon;
                    const isSelected = form.position === pos.id;
                    return (
                      <button
                        type="button"
                        key={pos.id}
                        onClick={() => setForm({ ...form, position: pos.id })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer text-left ${
                          isSelected
                            ? `${pos.color} border-2 shadow-[0_0_15px_rgba(0,140,255,0.3)]`
                            : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span className="font-heading text-xs font-bold uppercase tracking-wider">
                          {pos.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Player Photo Upload */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-amber-400" />
                  <span>Player Photo *</span>
                </label>
                <label className="cursor-pointer border border-dashed border-white/20 hover:border-sky-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-950/60 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {photoPreview ? (
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-14 w-14 rounded-2xl object-cover border-2 border-sky-400 shadow-[0_0_15px_rgba(0,140,255,0.4)]"
                      />
                      <div className="text-left leading-tight">
                        <span className="text-xs text-sky-300 font-heading font-bold block">
                          {photoUploading ? 'Uploading…' : 'Photo Ready'}
                        </span>
                        <span className="text-[10px] text-slate-400">Click to change player photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs group-hover:text-sky-300 transition py-2">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:border-sky-400 group-hover:text-sky-300 transition">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="font-heading font-bold uppercase tracking-wider">Click or drag photo here</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG, WebP up to 10MB</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || photoUploading || !form.roomCode.trim() || !form.name.trim()}
                className="w-full mt-4 py-3.5 px-6 rounded-2xl btn-gold-bid flex items-center justify-center gap-2 text-base font-black uppercase tracking-wider shadow-[0_0_30px_rgba(255,184,0,0.5)] cursor-pointer transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
                    <span>Registering Player…</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM & ADD TO AUCTION POOL</span>
                    <ArrowRight className="h-5 w-5 text-slate-950" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Player Trading Card Preview (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full rounded-2xl border border-white/10 bg-[#07152B]/60 p-3 text-center mb-4">
            <span className="font-heading text-xs uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Live Auction Card Preview
            </span>
          </div>

          {/* Dynamic Trading Card */}
          <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center transition-all border border-sky-400/40 bg-gradient-to-b from-[#0B254E] via-[#07152B] to-[#050B18] shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Top Bar on Card: Room Code & NGPL */}
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-[10px] font-heading font-black uppercase tracking-wider text-slate-400">
              <span className="text-sky-300">NGPL 2026</span>
              <span className="font-mono text-amber-300 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                {form.roomCode || 'ROOM CODE'}
              </span>
            </div>

            {/* Photo Avatar */}
            <div className="mb-4 h-32 w-32 flex items-center justify-center">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Player Photo"
                  className="h-28 w-28 rounded-2xl object-cover border-2 border-sky-400 shadow-[0_0_25px_rgba(0,140,255,0.4)]"
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-sky-400/40 bg-sky-500/10 flex flex-col items-center justify-center text-sky-300 shadow-[0_0_20px_rgba(0,140,255,0.2)]">
                  <User className="h-10 w-10 text-sky-400 mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase">Photo Preview</span>
                </div>
              )}
            </div>

            {/* Position Pill */}
            <div className="mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-heading font-black uppercase tracking-wider border shadow-sm ${currentPos.color}`}>
                {currentPos.label}
              </span>
            </div>

            {/* Player Name */}
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-white truncate max-w-full">
              {form.name || 'Player Full Name'}
            </h2>

            {/* Base Price Card Box */}
            <div className="mt-4 w-full p-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 flex items-center justify-between">
              <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400">
                Constant Base Price
              </span>
              <span className="font-condensed text-xl font-black text-amber-300">
                ₹50
              </span>
            </div>

            {/* Status Indicator */}
            <div className="mt-4 w-full">
              <div className="py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,216,120,0.2)]">
                <Check className="h-4 w-4" />
                <span>Ready for Live Auction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

