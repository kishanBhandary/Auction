import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SoldPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Sold players</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Completed acquisitions</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Sold list</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-600">
            <p>• Ravi Sharma — Team Alpha — ₹900</p>
            <p>• Mason Lee — Team Bravo — ₹1,100</p>
            <p>• Aarav Singh — Team Delta — ₹700</p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
