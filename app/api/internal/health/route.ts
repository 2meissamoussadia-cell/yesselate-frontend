// app/api/internal/health/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/lib/server/db/pool';

export async function GET() {
  const client = await pgPool.connect();
  try {
    await client.query('select 1'); // ping
    const { rows } = await client.query(`
      select view_name, refreshed_at, now() - refreshed_at as age
      from mview_refresh_log
      order by refreshed_at desc
      limit 6
    `);
    return NextResponse.json({ ok: true, mviews: rows }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}
