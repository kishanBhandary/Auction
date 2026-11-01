import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">About the league</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Volleyball Premier League</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Competition format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-600">
              <p>The league brings together four premiere franchises, each building a competitive roster of six starters and one substitute.</p>
              <p>Every club is managed through a structured acquisition process backed by server-authoritative auction timing and verified team budgets.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Why this platform matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-600">
              <p>Owners can make strategic bids while the auctioneer controls the live process, enabling a fair, modern recruitment experience for all stakeholders.</p>
              <p>Real-time dashboards provide visibility to administrators, managers, and viewers throughout the process.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
