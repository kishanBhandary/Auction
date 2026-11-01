import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const players = [
  { name: 'Ravi Sharma', position: 'Outside Hitter', age: 24, basePrice: '₹500' },
  { name: 'Nikhil Rao', position: 'Setter', age: 27, basePrice: '₹450' },
  { name: 'Mason Lee', position: 'Opposite', age: 28, basePrice: '₹550' },
  { name: 'Aarav Singh', position: 'Libero', age: 25, basePrice: '₹350' },
  { name: 'Daniel Cruz', position: 'Middle Blocker', age: 22, basePrice: '₹400' },
  { name: 'Priyansh Verma', position: 'Defensive Specialist', age: 26, basePrice: '₹320' },
];

export default function PlayersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Players</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Registered player pool</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <Link key={player.name} href={`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <Card className="overflow-hidden border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md">
                <div className="h-44 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.3),transparent_40%),linear-gradient(135deg,#0b1220,#1e293b)]" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{player.name}</h2>
                    <Badge variant="warning">{player.basePrice}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{player.position}</p>
                  <div className="mt-4 text-sm text-slate-500">Age: {player.age}</div>
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
