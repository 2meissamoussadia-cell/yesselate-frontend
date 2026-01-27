// bench/k6/baseline.js
// P19 – Baseline : charge « normale » reproductible, mix navigation + exports + refresh (5–10 min)

import http from 'k6/http';
import { check, sleep } from 'k6';
import { headers, dashboardRoutes, dashboardUrl, exportUrl, refreshUrl } from './config.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const options = {
  vus: 10,
  duration: '5m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:dashboard}': ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{name:export}': ['p(95)<1500', 'p(99)<3000'],
  },
};

const formats = ['csv', 'json'];

export default function () {
  const route = pick(dashboardRoutes);
  const r1 = http.get(dashboardUrl(route), { headers, tags: { name: 'dashboard' } });
  check(r1, { 'dashboard ok': (r) => r.status >= 200 && r.status < 400 });
  sleep(5 + Math.random() * 10);

  if (Math.random() < 0.15) {
    const fmt = pick(formats);
    const r2 = http.get(exportUrl(fmt, route.main, route.sub, route.leaf), { headers, tags: { name: 'export' } });
    check(r2, { 'export ok': (r) => r.status >= 200 && r.status < 400 });
    sleep(3);
  }

  if (Math.random() < 0.08) {
    const r3 = http.post(refreshUrl(), JSON.stringify({ scope: 'all' }), { headers, tags: { name: 'refresh' } });
    check(r3, { 'refresh ok': (r) => r.status >= 200 && r.status < 400 });
    sleep(2);
  }

  sleep(3 + Math.random() * 7);
}
