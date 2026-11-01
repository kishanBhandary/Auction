import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-sm">© 2026 Narayana Guru Premier League</div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <Link href="/login" className="hover:text-white">Login</Link>
          <Link href="/auctioneer" className="hover:text-white">Auctioneer</Link>
          <Link href="/owner" className="hover:text-white">Owners</Link>
        </div>
      </div>
    </footer>
  );
}
