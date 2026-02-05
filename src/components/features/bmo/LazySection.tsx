'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazySection({
  children,
  className,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Si l'Intersection Observer n'est pas supporté, afficher immédiatement
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasBeenVisible(true);
            // Une fois visible, on peut arrêter d'observer
            observer.unobserve(element);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={cn('transition-opacity duration-300', className)}>
      {hasBeenVisible ? (
        <div className={cn(isVisible ? 'opacity-100' : 'opacity-0')}>{children}</div>
      ) : (
        fallback || (
          <div className="animate-pulse space-y-4 p-4">
            <div className="h-4 bg-slate-700 rounded w-3/4" />
            <div className="h-32 bg-slate-700 rounded" />
          </div>
        )
      )}
    </div>
  );
}
