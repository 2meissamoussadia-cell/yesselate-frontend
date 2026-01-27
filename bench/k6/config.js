// bench/k6/config.js
// P19 – Config partagée : base URL, tenant, headers, routes critiques

const BASE = __ENV.BASE_URL || 'http://localhost:4001';
const TENANT = __ENV.TENANT_ID || 'default';
const AUTH = __ENV.AUTH_TOKEN; // Bearer JWT si nécessaire

export const baseUrl = BASE.replace(/\/$/, '');
export const tenantId = TENANT;
export const authToken = AUTH;

const baseHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-tenant-id': tenantId,
  'x-user-id': __ENV.USER_ID || 'bench-user',
  'x-roles': __ENV.ROLES || 'reader,manager',
};

/** Headers pour requêtes : Bearer si AUTH_TOKEN, sinon x-tenant-id etc. */
export const headers = AUTH
  ? { ...baseHeaders, 'Authorization': `Bearer ${AUTH}` }
  : baseHeaders;

/** Routes dashboard (main/sub/leaf) pour navigation */
export const dashboardRoutes = [
  { main: 'overview', sub: 'summary', leaf: 'dashboard' },
  { main: 'overview', sub: 'summary', leaf: 'points' },
  { main: 'overview', sub: 'kpis', leaf: 'projets' },
  { main: 'overview', sub: 'kpis', leaf: 'demandes' },
  { main: 'overview', sub: 'kpis', leaf: 'budget' },
  { main: 'performance', sub: 'achats', leaf: 'dashboard' },
  { main: 'performance', sub: 'reporting', leaf: 'dashboard' },
  { main: 'performance', sub: 'stocks', leaf: 'overview' },
  { main: 'actions', sub: 'blocked', leaf: 'dashboard' },
  { main: 'risks', sub: 'blocages', leaf: 'dashboard' },
];

export function dashboardUrl(route) {
  const { main, sub, leaf } = route;
  const path = [main, sub || '', leaf || ''].filter(Boolean).join('/');
  return `${baseUrl}/api/dashboard/${path}`;
}

export function exportUrl(format, main = 'overview', sub = 'summary', leaf = 'dashboard') {
  const params = new URLSearchParams({ format, main, sub: sub || '', leaf: leaf || '' });
  return `${baseUrl}/api/export/dashboard?${params.toString()}`;
}

export const refreshUrl = () => `${baseUrl}/api/dashboard/refresh`;
export const alertsTestUrl = () => `${baseUrl}/api/alerts/test`;
