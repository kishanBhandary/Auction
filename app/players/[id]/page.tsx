import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlayerDetailPage() {
  const player = {
    name: 'Ravi Sharma',
    position: 'Outside Hitter',
    age: 24,
    experience: 7,
    basePrice: '₹500',
    status: 'Approved',
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-slate-200 bg-white">
          <div className="h-64 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.3),transparent_40%),linear-gradient(135deg,#0b1220,#1e293b)]" />
          <CardContent className="grid gap-6 p-8 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900">{player.name}</h1>
                <Badge variant="success">{player.status}</Badge>
              </div>
              <div className="mt-5 space-y-3 text-slate-600">
                <p>
                  <strong>Position:</strong>{' '}
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
                <p><strong>Experience:</strong> {player.experience} years</p>
                <p><strong>Base price:</strong> ₹{player.basePrice}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Auction snapshot</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p>Current bid: ₹900</p>
                <p>Highest bidding team: Team Alpha</p>
                <p>Deadline: 14s remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
