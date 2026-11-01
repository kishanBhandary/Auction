import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { Shield, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  let teams: any[] = [];
  try {
    teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        owner: true,
        purchases: {
          include: { player: true },
        },
      },
    });
  } catch (error) {
    teams = [];
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-[70vh]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Franchises</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              League Teams ({teams.length})
            </h1>
          </div>
          <Link
            href="/auctioneer/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition w-fit"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Auctioneer Dashboard</span>
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-slate-50 dark:bg-slate-900/50">
            <Shield className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No teams created yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Teams join dynamically when team owners use their tournament room code and passcode.
            </p>
            <Link
              href="/team/join"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Join Auction Room as Team
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-20 bg-gradient-to-r from-sky-500 to-blue-700" />
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 font-bold text-white text-base">
                      {team.shortName || team.name?.slice(0, 3).toUpperCase()}
                    </div>
                    <Badge variant="secondary">₹{team.remainingBudget?.toLocaleString('en-IN')}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{team.name}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Owner: {team.owner?.name || team.owner?.email || 'Unassigned'}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                    <span>Squad: {team.purchases?.length || 0} players</span>
                    <span>Budget: ₹{team.budget?.toLocaleString('en-IN')}</span>
                  </div>
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
