'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auctioneer/login');
  }, [router]);

  return <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">Redirecting to auctioneer login…</div>;
}
