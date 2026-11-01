'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  ArrowRight,
  Shield,
  User,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  ImageIcon,
  Star,
  Award,
} from 'lucide-react';
import { VplLogo } from '@/components/icons/team-icons';

export default function TeamJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">Loading…</div>}>
      <TeamJoinContent />
    </Suspense>
  );
}

function TeamJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    roomCode: '',
    teamName: '',
    iconName: '',
    ownerName: '',
    iconPlayerName: '',
    iconPlayerPosition: 'OUTSIDE_HITTER',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [ownerPhotoFile, setOwnerPhotoFile] = useState<File | null>(null);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState<string | null>(null);
  const [ownerPhotoUploading, setOwnerPhotoUploading] = useState(false);
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState<string | null>(null);

  const [iconPlayerPhotoFile, setIconPlayerPhotoFile] = useState<File | null>(null);
  const [iconPlayerPhotoPreview, setIconPlayerPhotoPreview] = useState<string | null>(null);
  const [iconPlayerPhotoUploading, setIconPlayerPhotoUploading] = useState(false);
  const [iconPlayerPhotoUrl, setIconPlayerPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    try {
      setLogoUploading(true);
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Team logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleOwnerPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOwnerPhotoFile(file);
    setOwnerPhotoPreview(URL.createObjectURL(file));

    try {
      setOwnerPhotoUploading(true);
      const url = await uploadToCloudinary(file);
      setOwnerPhotoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Owner portrait upload failed');
    } finally {
      setOwnerPhotoUploading(false);
    }
  };

  const handleIconPlayerPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconPlayerPhotoFile(file);
    setIconPlayerPhotoPreview(URL.createObjectURL(file));

    try {
      setIconPlayerPhotoUploading(true);
      const url = await uploadToCloudinary(file);
      setIconPlayerPhotoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Icon player photo upload failed');
    } finally {
      setIconPlayerPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalLogoUrl = logoUrl;
      if (logoFile && !finalLogoUrl) {
        setLogoUploading(true);
        finalLogoUrl = await uploadToCloudinary(logoFile);
        setLogoUrl(finalLogoUrl);
      }

      let finalOwnerPhotoUrl = ownerPhotoUrl;
      if (ownerPhotoFile && !finalOwnerPhotoUrl) {
        setOwnerPhotoUploading(true);
        finalOwnerPhotoUrl = await uploadToCloudinary(ownerPhotoFile);
        setOwnerPhotoUrl(finalOwnerPhotoUrl);
      }

      let finalIconPlayerPhotoUrl = iconPlayerPhotoUrl;
      if (iconPlayerPhotoFile && !finalIconPlayerPhotoUrl) {
        setIconPlayerPhotoUploading(true);
        finalIconPlayerPhotoUrl = await uploadToCloudinary(iconPlayerPhotoFile);
        setIconPlayerPhotoUrl(finalIconPlayerPhotoUrl);
      }

      const res = await fetch('/api/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: form.roomCode.trim(),
          teamName: form.teamName.trim(),
          iconName: form.iconName.trim() || form.teamName.slice(0, 3).toUpperCase(),
          ownerName: form.ownerName.trim(),
          logoUrl: finalLogoUrl,
          ownerPhotoUrl: finalOwnerPhotoUrl,
          iconPlayerName: form.iconPlayerName.trim(),
          iconPlayerPosition: form.iconPlayerPosition,
          iconPlayerPhotoUrl: finalIconPlayerPhotoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to join auction room.');
      }

      router.push(data.redirect || `/room/${data.roomId}/waiting-room`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while joining the room.');
    } finally {
      setLoading(false);
      setLogoUploading(false);
      setOwnerPhotoUploading(false);
      setIconPlayerPhotoUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050B18] text-white flex flex-col items-center justify-center p-4 sm:p-6 stadium-bg relative overflow-x-hidden">
      {/* Stadium Atmospheric Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute -top-10 left-[15%] h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />
        <div className="absolute -top-10 right-[15%] h-72 w-72 rounded-full bg-amber-400/10 blur-[100px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between pb-6 mb-2">
        <VplLogo />
        <Link
          href="/auctioneer/login"
          className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 hover:text-white transition"
        >
          Auctioneer Login →
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Team Registration Form (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-3xl border border-sky-400/40 bg-[#07152B]/85 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="pb-4 mb-5 border-b border-white/10">
            <span className="text-[11px] font-heading font-bold uppercase tracking-widest text-sky-400">
              FRANCHISE REGISTRATION
            </span>
            <h1 className="mt-1 font-condensed text-3xl sm:text-4xl font-black uppercase tracking-wide text-white">
              JOIN AUCTION ROOM
            </h1>
            <p className="mt-1 text-xs text-slate-300 font-sans">
              Enter the match room code, your team name, and upload your team logo to join the live player bidding arena.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-3.5 text-xs font-heading uppercase tracking-wider text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Room Code */}
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Room Code *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. NPL-7482"
                  value={form.roomCode}
                  onChange={(e) => setForm({ ...form, roomCode: e.target.value.toUpperCase() })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sky-400/40 bg-slate-950 text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-sky-300 shadow-[0_0_15px_rgba(0,140,255,0.15)]"
                />
              </div>
            </div>

            {/* 2. Team Details & Icon Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Team Name *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mangalore Spikers, Coastal Blasters"
                    value={form.teamName}
                    onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Icon Name / Code
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. MLS"
                    value={form.iconName}
                    onChange={(e) => setForm({ ...form, iconName: e.target.value.toUpperCase() })}
                    className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* 3. Owner Information */}
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Team Owner Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
                />
              </div>
            </div>

            {/* 4. Team Logo & Owner Photo Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              {/* Team Logo Upload */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Team Logo / Photo</span>
                </label>
                <label className="cursor-pointer border border-dashed border-white/20 hover:border-sky-400 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-950/60 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo Preview" className="h-9 w-9 rounded-xl object-cover border border-white/30" />
                      <div className="text-left leading-tight">
                        <span className="text-xs text-sky-300 font-heading font-bold block">
                          {logoUploading ? 'Uploading…' : 'Logo Ready'}
                        </span>
                        <span className="text-[10px] text-slate-400">Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs group-hover:text-sky-300 transition">
                      <Upload className="h-4 w-4" />
                      <span>Upload Team Photo</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Owner Photo Upload */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Owner Photo (Optional)</span>
                </label>
                <label className="cursor-pointer border border-dashed border-white/20 hover:border-sky-400 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-950/60 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOwnerPhotoChange}
                    className="hidden"
                  />
                  {ownerPhotoPreview ? (
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ownerPhotoPreview} alt="Owner Preview" className="h-9 w-9 rounded-xl object-cover border border-white/30" />
                      <div className="text-left leading-tight">
                        <span className="text-xs text-emerald-300 font-heading font-bold block">
                          {ownerPhotoUploading ? 'Uploading…' : 'Photo Ready'}
                        </span>
                        <span className="text-[10px] text-slate-400">Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs group-hover:text-sky-300 transition">
                      <Upload className="h-4 w-4" />
                      <span>Upload Owner Portrait</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* 5. FRANCHISE ICON PLAYER SECTION */}
            <div className="pt-4 border-t border-amber-400/30 space-y-3 rounded-2xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-4 border">

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Icon Player Name */}
                <div className="sm:col-span-7">
                  <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Icon Player Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shetty"
                      value={form.iconPlayerName}
                      onChange={(e) => setForm({ ...form, iconPlayerName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-400/40 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300 font-sans shadow-[0_0_12px_rgba(251,191,36,0.1)]"
                    />
                  </div>
                </div>

                {/* Icon Player Position */}
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Position
                  </label>
                  <select
                    value={form.iconPlayerPosition}
                    onChange={(e) => setForm({ ...form, iconPlayerPosition: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs font-heading uppercase text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="OUTSIDE_HITTER">Attacker</option>
                    <option value="LIBERO">Libero</option>
                    <option value="DEFENSIVE_SPECIALIST">Defence</option>
                    <option value="SETTER">Setter</option>
                    <option value="MIDDLE_BLOCKER">All Rounder</option>
                  </select>
                </div>
              </div>

              {/* Icon Player Photo Upload */}
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span>Icon Player Photo *</span>
                </label>
                <label className="cursor-pointer border border-dashed border-amber-400/40 hover:border-amber-300 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-950/70 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconPlayerPhotoChange}
                    className="hidden"
                  />
                  {iconPlayerPhotoPreview ? (
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={iconPlayerPhotoPreview}
                        alt="Icon Player Preview"
                        className="h-10 w-10 rounded-xl object-cover border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                      />
                      <div className="text-left leading-tight">
                        <span className="text-xs text-amber-300 font-heading font-bold block">
                          {iconPlayerPhotoUploading ? 'Uploading…' : 'Icon Player Photo Ready'}
                        </span>
                        <span className="text-[10px] text-slate-400">Click to replace photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs group-hover:text-amber-300 transition">
                      <Upload className="h-4 w-4 text-amber-400" />
                      <span>Upload Icon Player Photo</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || logoUploading || ownerPhotoUploading || iconPlayerPhotoUploading || !form.roomCode.trim() || !form.teamName.trim() || !form.iconPlayerName.trim()}
              className="w-full mt-4 py-3.5 px-6 rounded-2xl btn-gold-bid flex items-center justify-center gap-2 text-base font-black uppercase tracking-wider shadow-[0_0_30px_rgba(255,184,0,0.5)] cursor-pointer transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
                  <span>Joining Match Arena…</span>
                </>
              ) : (
                <>
                  <span>CONFIRM & ENTER WAITING ROOM</span>
                  <ArrowRight className="h-5 w-5 text-slate-950" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Card Preview (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full rounded-2xl border border-white/10 bg-[#07152B]/60 p-3.5 text-center mb-4">
            <span className="font-heading text-xs uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Live Team Card Preview
            </span>
          </div>

          {/* Dynamic Preview Card */}
          <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center transition-all card-alpha shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Team Logo or Monogram */}
            <div className="mb-4 h-24 w-24 flex items-center justify-center">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Team Logo"
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white/30 shadow-[0_0_20px_rgba(0,140,255,0.4)]"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-sky-400/40 bg-sky-500/10 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,140,255,0.2)]">
                  <Shield className="h-7 w-7 text-sky-400 mb-0.5" />
                  <span className="font-heading font-black text-xs text-sky-300 tracking-wider">
                    {form.iconName || (form.teamName ? form.teamName.slice(0, 3).toUpperCase() : 'TEAM')}
                  </span>
                </div>
              )}
            </div>

            {/* Team Name */}
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-white">
              {form.teamName || 'Your Team Name'}
            </h2>

            {/* Owner Info with Photo */}
            <div className="mt-3 flex items-center gap-2.5 text-sm text-slate-300">
              {ownerPhotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ownerPhotoPreview}
                  alt="Owner"
                  className="h-7 w-7 rounded-full object-cover border border-white/30"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  👤
                </div>
              )}
              <span className="font-medium text-slate-200">
                {form.ownerName ? `Owner: ${form.ownerName}` : 'Owner: Your Name'}
              </span>
            </div>

            {/* Status Pill */}
            <div className="mt-4 w-full">
              <div className="py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,216,120,0.2)]">
                <Check className="h-4 w-4" />
                <span>Ready to Join Match</span>
              </div>
            </div>

            {/* Franchise Icon Player Card Spotlight */}
            <div className="mt-4 w-full rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-[#07152B] to-amber-500/10 p-3 flex items-center gap-3 text-left shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              {iconPlayerPhotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconPlayerPhotoPreview}
                  alt="Icon Player"
                  className="h-12 w-12 rounded-xl object-cover border-2 border-amber-400 shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex flex-col items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-amber-300 fill-amber-300/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-heading font-black uppercase tracking-wider text-amber-300">
                  <Star className="h-3 w-3 fill-amber-300" />
                  <span>OFFICIAL ICON PLAYER</span>
                </div>
                <h4 className="font-heading font-bold text-sm text-white truncate">
                  {form.iconPlayerName || 'Icon Player Name'}
                </h4>
                <span className="text-[10px] text-slate-300 font-sans block truncate">
                  {form.iconPlayerPosition.replace('_', ' ')} • Spot 1/7 Retained
                </span>
              </div>
            </div>

            {/* Simulated Purse & Squad Size */}
            <div className="mt-4 w-full pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-heading block">Squad</span>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {form.iconPlayerName ? '1 / 7 (Icon Picked)' : '0 / 7'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-heading block">Starting Budget</span>
                <span className="font-condensed font-bold text-amber-300 text-sm">₹5,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}