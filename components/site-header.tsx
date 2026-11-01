import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Narayana Guru Premier League Logo"
            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(255,184,0,0.5)]"
          />
          <div>
            <div className="text-lg font-bold leading-tight">Narayana Guru Premier League</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-sky-200">Player Auction</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          <Link href="/auction-room" className="hover:text-white">Live room</Link>
          <Link href="/playerdetials" className="hover:text-white">Player Entry</Link>
          <Link href="/auctioneer" className="hover:text-white">Auctioneer</Link>
          <Link href="/owner" className="hover:text-white">Owners</Link>
          <Link href="/login" className="hover:text-white">Login</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-200 hover:text-white">
            Login
          </Link>
          <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
            <Link href="/auction-room">Watch live</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
