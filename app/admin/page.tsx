import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Admin dashboard</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">League administration</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Teams</CardTitle></CardHeader><CardContent>4 registered franchises</CardContent></Card>
          <Card><CardHeader><CardTitle>Players</CardTitle></CardHeader><CardContent>28 approved players</CardContent></Card>
          <Card><CardHeader><CardTitle>Budget</CardTitle></CardHeader><CardContent>₹20,000 total pool</CardContent></Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
