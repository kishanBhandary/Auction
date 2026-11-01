'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuctioneerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'AUCTIONEER' }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Login failed');

      router.push(payload.redirect || '/auctioneer/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071326] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(3, 11, 22, 0.82) 0%, rgba(4, 15, 31, 0.72) 30%, rgba(9, 23, 43, 0.82) 100%), url('/images/vpl-login-bg.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(0,186,255,0.26),_transparent_18%),radial-gradient(circle_at_80%_80%,_rgba(255,184,0,0.14),_transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1540px] items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="relative flex items-center justify-center rounded-[34px] border border-white/10 bg-[#040d1f]/10 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.52)] backdrop-blur-[2px] sm:p-8 lg:min-h-[700px] lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,168,255,0.14),_transparent_48%)]" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[30px] border border-[#FFB800]/50 bg-[#FFB800]/8 shadow-[0_0_40px_rgba(255,184,0,0.16)] sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                <img src="/logo.png" alt="VPL logo" className="h-full w-full object-contain p-3" />
              </div>

              <h1 className="mt-7 font-condensed text-[2.4rem] font-black leading-[0.86] tracking-[-0.06em] text-white sm:text-[3rem] lg:text-[4.2rem]">
                NARAYANA GURU
                <span className="mt-1 block text-[#00A8FF]">PREMIER LEAGUE</span>
              </h1>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-[32px] border border-[#00A8FF]/60 bg-[#071326]/75 p-5 shadow-[0_0_0_1px_rgba(0,168,255,0.2),0_0_38px_rgba(0,168,255,0.2)] backdrop-blur-xl sm:p-7 lg:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="mt-2 font-condensed text-5xl font-black tracking-[0.02em] text-white">LOGIN TO NPL</h2>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-slate-400">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8bd8ff]" />
                    <Input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder="Enter your registered email"
                      className="h-12 border-sky-400/15 bg-slate-950/80 pl-11 text-base text-white placeholder:text-slate-500 focus-visible:ring-sky-400/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8bd8ff]" />
                    <Input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="h-12 border-sky-400/15 bg-slate-950/80 pl-11 pr-12 text-base text-white placeholder:text-slate-500 focus-visible:ring-sky-400/50"
                      required
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-sky-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 accent-[#FFB800]" />
                    Remember me
                  </label>
                  <button type="button" className="text-sky-200 transition hover:text-sky-100">
                    Forgot Password?
                  </button>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-[#FFB800] text-[#071326] text-lg font-black shadow-[0_0_26px_rgba(255,184,0,0.52)] transition hover:bg-[#ffc933] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071326] border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowRight className="h-5 w-5" />
                      Login
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
