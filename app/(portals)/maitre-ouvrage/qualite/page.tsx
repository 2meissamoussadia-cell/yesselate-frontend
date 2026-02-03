'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QualitePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maitre-ouvrage/qualite/outlook');
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
      Redirection vers la qualité…
    </div>
  );
}
