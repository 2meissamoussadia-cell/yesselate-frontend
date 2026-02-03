'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EtudesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maitre-ouvrage/etudes/outlook');
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
      Redirection vers les études…
    </div>
  );
}
