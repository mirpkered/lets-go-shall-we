interface Env { COMPLETION_COUNTER: any; RESEND_API_KEY?: string; FEEDBACK_FROM?: string; }
interface DurableState { storage: { sql: any }; blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>; }

const ALLOWED_ORIGINS = new Set([
  'https://mirpkered.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
const RUN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_COMPLETION_BODY_BYTES = 128;
const MAX_FEEDBACK_BODY_BYTES = 24_000;
const FEEDBACK_TO = 'contact@mirpworks.com';
const FEEDBACK_CATEGORIES = new Set(['Bug', 'Confusing', 'Too short / weak payoff', 'Too repetitive', 'Balance / danger', 'UI / mobile', 'Story / content suggestion', 'Other']);

interface FeedbackPayload {
  category: string;
  message: string;
  replyEmail?: string;
  context: { gameVersion: string; scenarioId?: string; scenarioTitle?: string; sceneId?: string; qaMode: boolean; activeRun: boolean; viewportClass: 'small' | 'large' };
  website?: string;
}

async function readCompletionBody(request: Request): Promise<{ runId: string } | Response> {
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return json({ error: 'JSON required' }, 415);
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_COMPLETION_BODY_BYTES)) return json({ error: 'Request too large' }, 413);
  if (!request.body) return json({ error: 'Invalid JSON' }, 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_COMPLETION_BODY_BYTES) {
        await reader.cancel();
        return json({ error: 'Request too large' }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !('runId' in body) || typeof body.runId !== 'string' || !RUN_ID.test(body.runId)) {
      return json({ error: 'Invalid run ID' }, 400);
    }
    return { runId: body.runId };
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  } finally {
    reader.releaseLock();
  }
}

function json(body: unknown, status = 200, origin: string | null = null): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function readBoundedBody(request: Request, limit: number): Promise<unknown | Response> {
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return json({ error: 'JSON required' }, 415);
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > limit)) return json({ error: 'Request too large' }, 413);
  if (!request.body) return json({ error: 'Invalid JSON' }, 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); return json({ error: 'Request too large' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch { return json({ error: 'Invalid JSON' }, 400); }
  finally { reader.releaseLock(); }
}

function validShortText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

function validateFeedback(body: unknown): FeedbackPayload | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  if (Object.keys(value).some((key) => !['category', 'message', 'replyEmail', 'context', 'website'].includes(key))) return null;
  if (typeof value.category !== 'string' || !FEEDBACK_CATEGORIES.has(value.category)) return null;
  if (typeof value.message !== 'string' || !value.message.trim() || value.message.length > 4000) return null;
  if (value.replyEmail !== undefined && (typeof value.replyEmail !== 'string' || value.replyEmail.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.replyEmail))) return null;
  if (value.website !== undefined && (typeof value.website !== 'string' || value.website.length > 200)) return null;
  if (!value.context || typeof value.context !== 'object' || Array.isArray(value.context)) return null;
  const context = value.context as Record<string, unknown>;
  const allowedContext = ['gameVersion', 'scenarioId', 'scenarioTitle', 'sceneId', 'qaMode', 'activeRun', 'viewportClass'];
  if (Object.keys(context).some((key) => !allowedContext.includes(key))) return null;
  if (!validShortText(context.gameVersion, 32) || typeof context.qaMode !== 'boolean' || typeof context.activeRun !== 'boolean' || !['small', 'large'].includes(String(context.viewportClass))) return null;
  for (const key of ['scenarioId', 'scenarioTitle', 'sceneId']) if (context[key] !== undefined && (typeof context[key] !== 'string' || context[key].length > 120 || /[\r\n\u0000-\u001f]/.test(context[key] as string))) return null;
  return {
    category: value.category,
    message: value.message.trim(),
    ...(typeof value.replyEmail === 'string' && value.replyEmail.trim() ? { replyEmail: value.replyEmail.trim() } : {}),
    context: {
      gameVersion: context.gameVersion,
      ...(typeof context.scenarioId === 'string' ? { scenarioId: context.scenarioId } : {}),
      ...(typeof context.scenarioTitle === 'string' ? { scenarioTitle: context.scenarioTitle } : {}),
      ...(typeof context.sceneId === 'string' ? { sceneId: context.sceneId } : {}),
      qaMode: context.qaMode,
      activeRun: context.activeRun,
      viewportClass: context.viewportClass as 'small' | 'large',
    },
    ...(typeof value.website === 'string' ? { website: value.website } : {}),
  };
}

async function deliverFeedback(payload: FeedbackPayload, env: Env): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.FEEDBACK_FROM) return false;
  const context = payload.context;
  const lines = [
    'Let’s Go, Shall We? — player feedback',
    `Type: ${payload.category}`,
    `Version: ${context.gameVersion}`,
    `Mode: ${context.qaMode ? 'QA' : 'Normal'}`,
    `Active run: ${context.activeRun ? 'yes' : 'no'}`,
    `Viewport class: ${context.viewportClass}`,
    `Scenario: ${context.scenarioTitle ?? 'General feedback'}${context.scenarioId ? ` (${context.scenarioId})` : ''}`,
    `Scene: ${context.sceneId ?? 'Not in an active scene'}`,
    '', 'Message:', payload.message,
  ];
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.FEEDBACK_FROM,
      to: [FEEDBACK_TO],
      subject: `Let’s Go, Shall We? feedback — ${payload.category}`,
      text: lines.join('\n'),
      ...(payload.replyEmail ? { reply_to: payload.replyEmail } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  return response.ok;
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

    if (url.pathname === '/v1/feedback') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);
      if (!origin || !ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin required' }, 403);
      const raw = await readBoundedBody(request, MAX_FEEDBACK_BODY_BYTES);
      if (raw instanceof Response) return withAllowedOrigin(raw, origin);
      const payload = validateFeedback(raw);
      if (!payload) return json({ error: 'Invalid feedback' }, 400, origin);
      if (payload.website) return json({ ok: true }, 200, origin);
      if (!env.RESEND_API_KEY || !env.FEEDBACK_FROM) return json({ error: 'Feedback delivery is not configured' }, 503, origin);
      try {
        if (!await deliverFeedback(payload, env)) return json({ error: 'Feedback delivery is unavailable' }, 502, origin);
        return json({ ok: true }, 200, origin);
      } catch {
        return json({ error: 'Feedback delivery is unavailable' }, 502, origin);
      }
    }
    if (url.pathname !== '/v1/total' && url.pathname !== '/v1/complete') return json({ error: 'Not found' }, 404, origin);
    if (url.pathname === '/v1/total' && request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, origin);
    if (url.pathname === '/v1/complete' && request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin);

    let runId: string | null = null;
    if (url.pathname === '/v1/complete') {
      const body = await readCompletionBody(request);
      if (body instanceof Response) return withAllowedOrigin(body, origin);
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

function withAllowedOrigin(response: Response, origin: string | null): Response {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return response;
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  return new Response(response.body, { status: response.status, headers });
}

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
