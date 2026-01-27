// bench/k6/smoke.js
// P19 – Smoke : vérifier disponibilité des routes critiques (1–2 min)

import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseUrl, headers, dashboardRoutes, dashboardUrl, exportUrl, refreshUrl, alertsTestUrl } from './config.js';

export const options = {
  vus: 2,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  const r1 = http.get(dashboardUrl(dashboardRoutes[0]), { headers });
  check(r1, { 'dashboard 2xx': (r) => r.status >= 200 && r.status < 400 });

  const r2 = http.get(exportUrl('csv'), { headers });
  check(r2, { 'export csv 2xx': (r) => r.status >= 200 && r.status < 400 });

  const r3 = http.post(refreshUrl(), JSON.stringify({ scope: 'all' }), { headers });
  check(r3, { 'refresh 2xx': (r) => r.status >= 200 && r.status < 400 });

  sleep(2);
}
