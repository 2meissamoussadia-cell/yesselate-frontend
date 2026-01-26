import { NextResponse } from 'next/server';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP latency',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
registry.registerMetric(httpDuration);

export function observeHttp(method: string, route: string, status: number, seconds: number) {
  httpDuration.labels({ method, route, status: String(status) }).observe(seconds);
}

export async function GET() {
  return new NextResponse(await registry.metrics(), {
    status: 200,
    headers: { 'Content-Type': registry.contentType },
  });
}
