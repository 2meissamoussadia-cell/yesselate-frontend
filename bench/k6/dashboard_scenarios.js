// bench/k6/dashboard_scenarios.js
// P19 – Scénarios séparés : browsing (UI), exports (CSV)
// On martèle les mêmes endpoints que le front (registry → API). Sans modifier l'UX.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseUrl, headers, exportUrl } from './config.js';

export const options = {
  scenarios: {
    browsing: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { target: 50, duration: '2m' },
        { target: 120, duration: '5m' },
        { target: 0, duration: '1m' },
      ],
      exec: 'browse',
    },
    exports: {
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 200,
      stages: [
        { target: 10, duration: '2m' },
        { target: 30, duration: '5m' },
        { target: 0, duration: '1m' },
      ],
      exec: 'exportCsv',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<400'],
  },
};

function get(route) {
  const res = http.get(`${baseUrl}${route}`, { headers });
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 400 });
  return res;
}

export function browse() {
  get('/api/dashboard/overview/summary/dashboard');
  sleep(Math.random() * 0.8 + 0.2);

  get('/api/dashboard/overview/kpis/projets');
  sleep(Math.random() * 0.8 + 0.2);

  get('/api/dashboard/performance/achats/dashboard');
  sleep(Math.random() * 0.8 + 0.2);

  get('/api/dashboard/performance/reporting/dashboard');
  sleep(Math.random() * 0.8 + 0.2);
}

export function exportCsv() {
  const url = exportUrl('csv', 'performance', 'reporting', 'dashboard');
  const res = http.get(url, { headers });
  check(res, { 'export ok': (r) => r.status >= 200 && r.status < 400 });
  sleep(Math.random() * 2 + 1);
}
