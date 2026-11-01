import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const teams = [
  { name: 'Team Alpha', shortName: 'ALP', owner: 'Aisha Mehta', budget: '₹5,000' },
  { name: 'Team Bravo', shortName: 'BRV', owner: 'Karan Nair', budget: '₹5,000' },
  { name: 'Team Charlie', shortName: 'CHA', owner: 'Riya Sen', budget: '₹5,000' },
  { name: 'Team Delta', shortName: 'DEL', owner: 'Aman Joshi', budget: '₹5,000' },
];

export default function TeamsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Teams</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">League franchise roster</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {teams.map((team) => (
            <Link key={team.shortName} href={`/teams/${team.shortName.toLowerCase()}`}>
              <Card className="overflow-hidden border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md">
                <div className="h-20 bg-gradient-to-r from-sky-500 to-blue-700" />
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">{team.shortName}</div>
                    <Badge variant="secondary">{team.budget}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">Owner: {team.owner}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
