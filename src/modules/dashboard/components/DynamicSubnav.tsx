/**
 * Wrapper dynamique pour DashboardSubNavigation
 * Permet de charger le composant de manière dynamique si nécessaire
 */

'use client';

import { DashboardSubNavigation } from '../navigation/DashboardSubNavigation';

// ✅ Export direct (pas besoin de lazy loading pour l'instant)
export { DashboardSubNavigation as DynamicSubnav };

// ✅ Alternative avec lazy loading si nécessaire
// const LazyDashboardSubNavigation = lazy(() => import('../navigation/DashboardSubNavigation').then(m => ({ default: m.DashboardSubNavigation })));

// export function DynamicSubnav(props: React.ComponentProps<typeof DashboardSubNavigation>) {
//   return (
//     <Suspense fallback={<div className="h-12 bg-slate-900 animate-pulse" />}>
//       <LazyDashboardSubNavigation {...props} />
//     </Suspense>
//   );
// }
