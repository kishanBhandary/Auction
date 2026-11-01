'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuctioneerAuctionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">Redirecting to management login…</div>;
}
