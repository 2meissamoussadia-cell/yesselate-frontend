'use client';

/**
 * Analytics intégrés — BI (Power BI, SAP, Qlik), KPIs temps réel, drill-downs.
 */

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { IntegratedAnalytics } from '@/components/analytics';

export default function AnalyticsPage() {
  return (
    <PageTemplate
      title="Analytics intégrés"
      description="Dashboards dynamiques, KPIs financiers et supply chain en temps réel."
    >
      <div className="space-y-6">
        <IntegratedAnalytics height={500} />
      </div>
    </PageTemplate>
  );
}
