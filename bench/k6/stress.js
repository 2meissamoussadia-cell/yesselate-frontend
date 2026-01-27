// bench/k6/stress.js
// P19 – Stress : ramp-up pour trouver breakpoint (10–20 min)

import http from 'k6/http';
import { check, sleep } from 'k6';
import { headers, dashboardRoutes, dashboardUrl, exportUrl } from './config.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '3m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const route = pick(dashboardRoutes);
  const r = http.get(dashboardUrl(route), { headers });
  check(r, { 'ok': (r) => r.status >= 200 && r.status < 500 });
  if (Math.random() < 0.1) {
    http.get(exportUrl('csv', route.main, route.sub, route.leaf), { headers });
  }
  sleep(2 + Math.random() * 4);
}
