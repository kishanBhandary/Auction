import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 text-lg font-bold text-white">
            V
          </div>
          <div>
            <div className="text-lg">VPL</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-sky-200">Auction</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          <Link href="/auction-room" className="hover:text-white">Live room</Link>
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
