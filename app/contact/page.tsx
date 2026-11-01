import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Contact</div>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Reach the league office</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Your name" />
            <Input placeholder="Your email" type="email" />
            <textarea className="min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="How can we help?" />
            <Button className="bg-sky-600 hover:bg-sky-500">Submit</Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
