import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const bids = [
  { team: 'Team Alpha', amount: '₹900' },
  { team: 'Team Bravo', amount: '₹800' },
  { team: 'Team Charlie', amount: '₹700' },
];

export default function LiveAuctionPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Live auction</div>
            <h1 className="mt-3 text-4xl font-black text-slate-900">Current player in action</h1>
          </div>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="overflow-hidden border-slate-200 bg-white">
            <div className="h-72 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.2),transparent_40%),linear-gradient(135deg,#0b1220,#1e293b)]" />
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Player #12</div>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">Ravi Sharma</h2>
                </div>
                <Badge variant="warning">Open</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><span className="text-sm text-slate-500">Age</span><p className="font-semibold">24</p></div>
                <div><span className="text-sm text-slate-500">Position</span><p className="font-semibold">Outside Hitter</p></div>
                <div><span className="text-sm text-slate-500">Experience</span><p className="font-semibold">7 years</p></div>
                <div><span className="text-sm text-slate-500">Base price</span><p className="font-semibold">₹500</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Auction details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-slate-100 p-4">
                <div className="text-sm text-slate-500">Current highest bid</div>
                <div className="mt-2 text-3xl font-black text-slate-900">₹900</div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Highest bidding team</span>
                <span className="font-semibold text-slate-900">Team Alpha</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Countdown</span>
                <span className="font-semibold text-orange-600">00:14</span>
              </div>
              <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">Place valid bid</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Bid history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.team}>
                    <TableCell>{bid.team}</TableCell>
                    <TableCell>{bid.amount}</TableCell>
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
