/**
 * Wrapper dynamique pour DashboardSidebar
 * Permet de charger le composant de manière dynamique si nécessaire
 */

'use client';

import { lazy, Suspense } from 'react';
import { DashboardSidebar } from '../navigation/DashboardSidebar';

// ✅ Export direct (pas besoin de lazy loading pour l'instant)
export { DashboardSidebar as DynamicSidebar };

// ✅ Alternative avec lazy loading si nécessaire
// const LazyDashboardSidebar = lazy(() => import('../navigation/DashboardSidebar').then(m => ({ default: m.DashboardSidebar })));

// export function DynamicSidebar(props: React.ComponentProps<typeof DashboardSidebar>) {
//   return (
//     <Suspense fallback={<div className="w-64 bg-slate-900 animate-pulse" />}>
//       <LazyDashboardSidebar {...props} />
//     </Suspense>
//   );
// }
