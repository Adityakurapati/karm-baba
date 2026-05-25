'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDiscovery() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/discovery');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-on-surface-variant font-bold">Redirecting to profile preferences...</p>
    </div>
  );
}
