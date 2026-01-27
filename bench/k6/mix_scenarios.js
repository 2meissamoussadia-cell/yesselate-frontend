// bench/k6/mix_scenarios.js
// P19 – Mix heures de pointe : 50 % browsing / 30 % exports / 20 % alerts test

import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseUrl, headers, exportUrl, alertsTestUrl } from './config.js';

const ALERT_RULE_MINIMAL = {
  name: 'bench-rule',
  expr: {
    source: { view: 'rm_kpis_overview' },
    select: { metric: 'count' },
    condition: { op: '>', left: 'count', right: 0 },
  },
};

export const options = {
  scenarios: {
    mix: {
      executor: 'ramping-arrival-rate',
      startRate: 20,
      timeUnit: '1s',
      preAllocatedVUs: 80,
      maxVUs: 400,
      stages: [
        { target: 80, duration: '2m' },
        { target: 150, duration: '5m' },
        { target: 0, duration: '1m' },
      ],
      exec: 'mix',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<600'],
  },
};

function get(route) {
  const res = http.get(`${baseUrl}${route}`, { headers });
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 400 });
  return res;
}

function browse() {
  get('/api/dashboard/overview/summary/dashboard');
  sleep(Math.random() * 0.8 + 0.2);
  get('/api/dashboard/overview/kpis/projets');
  sleep(Math.random() * 0.8 + 0.2);
  get('/api/dashboard/performance/achats/dashboard');
  sleep(Math.random() * 0.8 + 0.2);
  get('/api/dashboard/performance/reporting/dashboard');
  sleep(Math.random() * 0.8 + 0.2);
}

function exportCsv() {
  const url = exportUrl('csv', 'performance', 'reporting', 'dashboard');
  const res = http.get(url, { headers });
  check(res, { 'export ok': (r) => r.status >= 200 && r.status < 400 });
  sleep(Math.random() * 2 + 1);
}

function alertsTest() {
  const res = http.post(
    alertsTestUrl(),
    JSON.stringify(ALERT_RULE_MINIMAL),
    { headers }
  );
  // 200 OK ou 403 si pas alerts:admin ; on évite 5xx
  check(res, { 'alerts test no 5xx': (r) => r.status < 500 });
  sleep(Math.random() * 1.5 + 0.5);
}

export function mix() {
  const r = Math.random();
  if (r < 0.5) browse();
  else if (r < 0.8) exportCsv();
  else alertsTest();
}
