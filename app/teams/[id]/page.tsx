import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TeamDetailPage() {
  const team = {
    name: 'Team Alpha',
    shortName: 'ALP',
    owner: 'Aisha Mehta',
    remainingBudget: '₹2,450',
    players: [{ name: 'Ravi Sharma', position: 'Outside Hitter' }, { name: 'Aarav Singh', position: 'Libero' }],
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Team profile</div>
            <h1 className="mt-3 text-4xl font-black text-slate-900">{team.name}</h1>
          </div>
          <Badge variant="default">{team.shortName}</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Franchise summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-slate-600">
              <p><strong>Owner:</strong> {team.owner}</p>
              <p><strong>Remaining budget:</strong> {team.remainingBudget}</p>
              <p><strong>Roster slots:</strong> 2 purchased</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <h3 className="mb-3 font-semibold text-slate-900">Purchased players</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {team.players.map((player) => (
                  <li key={player.name}>• {player.name} — {player.position}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
