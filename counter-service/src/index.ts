interface Env { COMPLETION_COUNTER: any; }
interface DurableState { storage: { sql: any }; blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>; }

const ALLOWED_ORIGINS = new Set([
  'https://mirpkered.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
const RUN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200, origin: string | null = null): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') {
      if (!origin || !ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403);
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      } });
    }

    if (url.pathname !== '/v1/total' && url.pathname !== '/v1/complete') return json({ error: 'Not found' }, 404, origin);
    if (url.pathname === '/v1/total' && request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, origin);
    if (url.pathname === '/v1/complete' && request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);

    let runId: string | null = null;
    if (url.pathname === '/v1/complete') {
      let body: unknown;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      if (!body || typeof body !== 'object' || !('runId' in body) || typeof body.runId !== 'string' || !RUN_ID.test(body.runId)) {
        return json({ error: 'Invalid run ID' }, 400, origin);
      }
      runId = body.runId;
    }

    const id = env.COMPLETION_COUNTER.idFromName('global-adventure-total-v1');
    const stub = env.COMPLETION_COUNTER.get(id);
    const result = await stub.fetch(`https://counter.internal${url.pathname}`, {
      method: runId ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      ...(runId ? { body: JSON.stringify({ runId }) } : {}),
    });
    const resultBody = await result.json();
    return json(resultBody, result.status, origin);
  },
};

export class CompletionCounter {
  private readonly ready: Promise<void>;
  private readonly sql: any;

  constructor(state: DurableState) {
    this.sql = state.storage.sql;
    this.ready = state.blockConcurrencyWhile(async () => {
      this.sql.exec('CREATE TABLE IF NOT EXISTS aggregate (singleton INTEGER PRIMARY KEY CHECK (singleton = 1), total INTEGER NOT NULL)');
      this.sql.exec('INSERT OR IGNORE INTO aggregate (singleton, total) VALUES (1, 0)');
      this.sql.exec('CREATE TABLE IF NOT EXISTS completion_ids (run_id TEXT PRIMARY KEY) WITHOUT ROWID');
      this.sql.exec(`CREATE TRIGGER IF NOT EXISTS count_new_completion AFTER INSERT ON completion_ids BEGIN UPDATE aggregate SET total = total + 1 WHERE singleton = 1; END`);
    });
  }

  async fetch(request: Request): Promise<Response> {
    await this.ready;
    const url = new URL(request.url);
    if (url.pathname === '/v1/complete') {
      const body = await request.json() as { runId: string };
      this.sql.exec('INSERT OR IGNORE INTO completion_ids (run_id) VALUES (?)', body.runId);
    }
    const row = this.sql.exec('SELECT total FROM aggregate WHERE singleton = 1').toArray()[0] as { total: number };
    return new Response(JSON.stringify({ total: row.total }), { headers: { 'Content-Type': 'application/json' } });
  }
}
