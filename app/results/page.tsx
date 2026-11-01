import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const results = [
  { player: 'Ravi Sharma', team: 'Team Alpha', price: '₹900' },
  { player: 'Mason Lee', team: 'Team Bravo', price: '₹1,100' },
  { player: 'Aarav Singh', team: 'Team Delta', price: '₹700' },
];

export default function ResultsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Auction results</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Completed sales and spending</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardContent className="p-6"><div className="text-sm text-slate-500">Players registered</div><div className="mt-2 text-3xl font-bold">28</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-sm text-slate-500">Players sold</div><div className="mt-2 text-3xl font-bold">17</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-sm text-slate-500">Players unsold</div><div className="mt-2 text-3xl font-bold">11</div></CardContent></Card>
        </div>

        <Card className="mt-8 border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Sold player ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Purchase price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.player}>
                    <TableCell>{result.player}</TableCell>
                    <TableCell>{result.team}</TableCell>
                    <TableCell>{result.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
