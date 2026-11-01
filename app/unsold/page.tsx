import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnsoldPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Unsold players</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Players not purchased</h1>
        </div>
        <Card>
          <CardHeader><CardTitle>Unsold list</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-slate-600">
            <p>• Daniel Cruz — no qualifying bid</p>
            <p>• Priyansh Verma — no qualifying bid</p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
