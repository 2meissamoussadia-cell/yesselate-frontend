// bench/k6/soak.js
// P19 – Soak : charge soutenue 30–60 min (stabilité)

import http from 'k6/http';
import { check, sleep } from 'k6';
import { headers, dashboardRoutes, dashboardUrl, exportUrl, refreshUrl } from './config.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const options = {
  vus: 25,
  duration: '30m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:dashboard}': ['p(95)<600', 'p(99)<1200'],
  },
};

export default function () {
  const route = pick(dashboardRoutes);
  const r1 = http.get(dashboardUrl(route), { headers, tags: { name: 'dashboard' } });
  check(r1, { 'dashboard ok': (r) => r.status >= 200 && r.status < 400 });
  sleep(5 + Math.random() * 12);

  if (Math.random() < 0.12) {
    const fmt = pick(['csv', 'json']);
    http.get(exportUrl(fmt, route.main, route.sub, route.leaf), { headers });
    sleep(2);
  }
  if (Math.random() < 0.05) {
    http.post(refreshUrl(), JSON.stringify({ scope: 'all' }), { headers });
    sleep(1);
  }
  sleep(2 + Math.random() * 6);
}
