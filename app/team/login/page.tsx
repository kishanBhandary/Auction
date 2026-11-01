'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TeamLoginRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B18] text-white flex items-center justify-center">Loading…</div>}>
      <TeamLoginRedirectContent />
    </Suspense>
  );
}

function TeamLoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const destination = params ? `/team/join?${params}` : '/team/join';
    router.replace(destination);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#050B18] px-6 py-10 text-white flex items-center justify-center font-heading">
      <div className="text-sky-400 tracking-wider animate-pulse">
        REDIRECTING TO TEAM REGISTRATION & LOGIN…
      </div>
    </div>
  );
}
