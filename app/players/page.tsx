import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { Users, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
  let players: any[] = [];
  try {
    players = await prisma.player.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tournament: true,
        purchase: {
          include: { team: true },
        },
      },
    });
  } catch (error) {
    players = [];
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-[70vh]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Player Pool</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Registered Players ({players.length})
            </h1>
          </div>
          <Link
            href="/auctioneer/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition w-fit"
          >
            <UserPlus className="h-4 w-4" />
            <span>Auctioneer Dashboard</span>
          </Link>
        </div>

        {players.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-slate-50 dark:bg-slate-900/50">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No players registered yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Real players can be added from the Auctioneer Control Panel or through tournament player registration.
            </p>
            <Link
              href="/auctioneer/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Go to Auctioneer Panel
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <Card
                key={player.id}
                className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-36 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.3),transparent_40%),linear-gradient(135deg,#0b1220,#1e293b)] flex items-center justify-center">
                  <span className="font-heading text-4xl font-black text-white/30 tracking-widest">
                    {player.position?.slice(0, 3)}
                  </span>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{player.name}</h2>
                    <Badge variant="warning">₹{player.basePrice?.toLocaleString('en-IN')}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-sky-600 dark:text-sky-400">
                    {(() => {
                      const u = String(player.position || '').trim().toUpperCase();
                      if (u === 'OUTSIDE_HITTER' || u === 'ATTACKER') return 'Attacker';
                      if (u === 'LIBERO') return 'Libero';
                      if (u === 'DEFENSIVE_SPECIALIST' || u === 'DEFENCE') return 'Defence';
                      if (u === 'SETTER') return 'Setter';
                      if (u === 'MIDDLE_BLOCKER' || u === 'OPPOSITE' || u === 'ALL_ROUNDER') return 'All Rounder';
                      return player.position;
                    })()}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Exp: {player.experience || 0} yrs</span>
                    <span className="font-semibold text-emerald-500 uppercase">{player.status}</span>
                  </div>
                  {player.purchase?.team && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      Sold to <strong className="text-slate-900 dark:text-white">{player.purchase.team.name}</strong> for ₹{player.purchase.price?.toLocaleString('en-IN')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
