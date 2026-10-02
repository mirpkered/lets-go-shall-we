import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, { CompletionCounter } from './index';
import { submitGlobalCompletionWithRetry } from '../../src/completionCounter';

const RUN_ID = '5c4a9c8b-9ec0-42b6-a470-20a7a1bf7488';
const GAME_ORIGIN = 'https://mirpkered.github.io';
const FEEDBACK = {
  category: 'Bug', message: 'The platform choice did not appear.',
  context: { gameVersion: '0.1.0', scenarioId: 'last-train-message', scenarioTitle: 'The Last Train Message', sceneId: 'platform', qaMode: false, activeRun: true, viewportClass: 'small' },
};

afterEach(() => vi.unstubAllGlobals());

class MemorySql {
  total = 0;
  readonly ids = new Set<string>();
  exec(sql: string, value?: string) {
    if (sql.startsWith('INSERT OR IGNORE INTO completion_ids') && value && !this.ids.has(value)) {
      this.ids.add(value);
      this.total += 1;
    }
    if (sql.startsWith('SELECT total')) return { toArray: () => [{ total: this.total }] };
    return { toArray: () => [] };
  }
}

function environment() {
  const object = new CompletionCounter({ storage: { sql: new MemorySql() }, blockConcurrencyWhile: (callback) => callback() });
  return { COMPLETION_COUNTER: { idFromName: (name: string) => name, get: () => ({ fetch: (input: RequestInfo | URL, init?: RequestInit) => object.fetch(new Request(input, init)) }) } };
}

describe('anonymous completion service', () => {
  it('starts at zero and counts repeated submissions of one run ID only once', async () => {
    const env = environment();
    const origin = 'https://mirpkered.github.io';
    const get = await worker.fetch(new Request('https://counter.example/v1/total', { headers: { Origin: origin } }), env);
    expect(await get.json()).toEqual({ total: 0 });
    for (let i = 0; i < 2; i += 1) {
      const response = await worker.fetch(new Request('https://counter.example/v1/complete', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: RUN_ID }) }), env);
      expect(await response.json()).toEqual({ total: 1 });
    }
  });

  it('rejects invalid IDs and unrelated origins without exposing mutation endpoints', async () => {
    const env = environment();
    const invalid = await worker.fetch(new Request('https://counter.example/v1/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: 'not-a-uuid' }) }), env);
    expect(invalid.status).toBe(400);
    const originDenied = await worker.fetch(new Request('https://counter.example/v1/total', { headers: { Origin: 'https://elsewhere.example' } }), env);
    expect(originDenied.status).toBe(403);
    const unknown = await worker.fetch(new Request('https://counter.example/admin/reset'), env);
    expect(unknown.status).toBe(404);
  });

  it('counts concurrent duplicate submissions atomically and distinct run IDs once each', async () => {
    const env = environment();
    const submit = (runId: string) => worker.fetch(new Request('https://counter.example/v1/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId }),
    }), env);
    const duplicateResponses = await Promise.all(Array.from({ length: 64 }, () => submit(RUN_ID)));
    const duplicateTotals = await Promise.all(duplicateResponses.map(async (response) => (await response.json() as { total: number }).total));
    expect(new Set(duplicateTotals)).toEqual(new Set([1]));

    const distinctIds = Array.from({ length: 40 }, (_, index) => `00000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`);
    await Promise.all(distinctIds.map(submit));
    const totalResponse = await worker.fetch(new Request('https://counter.example/v1/total'), env);
    expect(await totalResponse.json()).toEqual({ total: 41 });
  });

  it('bounds completion payload size and accepts only the one-field run ID payload', async () => {
    const env = environment();
    const oversized = await worker.fetch(new Request('https://counter.example/v1/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(129),
    }), env);
    expect(oversized.status).toBe(413);
    const extraData = await worker.fetch(new Request('https://counter.example/v1/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: RUN_ID, scenarioId: 'must-not-be-sent' }),
    }), env);
    expect(extraData.status).toBe(400);
    const wrongType = await worker.fetch(new Request('https://counter.example/v1/complete', {
      method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ runId: RUN_ID }),
    }), env);
    expect(wrongType.status).toBe(415);
    const total = await worker.fetch(new Request('https://counter.example/v1/total'), env);
    expect(await total.json()).toEqual({ total: 0 });
  });

  it('safely retries after the server counted but the first response was lost', async () => {
    const env = environment();
    let attempts = 0;
    const request = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      attempts += 1;
      const response = await worker.fetch(new Request(input, init), env);
      if (attempts === 1) throw new Error('response lost after durable write');
      return response;
    };
    await expect(submitGlobalCompletionWithRetry('https://counter.example', RUN_ID, request, async () => undefined)).resolves.toBe(1);
    const total = await worker.fetch(new Request('https://counter.example/v1/total'), env);
    expect(await total.json()).toEqual({ total: 1 });
    expect(attempts).toBe(2);
  });
});

describe('anonymous in-game feedback endpoint', () => {
  it('delivers anonymous feedback to the fixed Mirpworks inbox without persisting or logging it', async () => {
    const env = environment() as ReturnType<typeof environment> & { RESEND_API_KEY: string; FEEDBACK_FROM: string };
    env.RESEND_API_KEY = 'server-only-test-key';
    env.FEEDBACK_FROM = 'Let’s Go, Shall We? <feedback@example.test>';
    const provider = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ id: 'provider-message-id' }), { status: 200 }));
    vi.stubGlobal('fetch', provider);
    const response = await worker.fetch(new Request('https://counter.example/v1/feedback', {
      method: 'POST', headers: { Origin: GAME_ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify(FEEDBACK),
    }), env);
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(GAME_ORIGIN);
    expect(await response.json()).toEqual({ ok: true });
    expect(provider).toHaveBeenCalledOnce();
    const [providerUrl, init] = provider.mock.calls[0];
    expect(providerUrl).toBe('https://api.resend.com/emails');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer server-only-test-key');
    const message = JSON.parse(String(init?.body));
    expect(message.to).toEqual(['contact@mirpworks.com']);
    expect(message.reply_to).toBeUndefined();
    expect(message.text).toContain('The Last Train Message (last-train-message)');
    expect(message.text).toContain('platform');
    expect(message.text).not.toContain('save');
    expect(message).not.toHaveProperty('html');
  });

  it('uses a reply address only when voluntarily supplied and never accepts it as a mail header', async () => {
    const env = environment() as ReturnType<typeof environment> & { RESEND_API_KEY: string; FEEDBACK_FROM: string };
    env.RESEND_API_KEY = 'server-only-test-key';
    env.FEEDBACK_FROM = 'Let’s Go, Shall We? <feedback@example.test>';
    const provider = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', provider);
    const response = await worker.fetch(new Request('https://counter.example/v1/feedback', {
      method: 'POST', headers: { Origin: GAME_ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...FEEDBACK, replyEmail: 'traveler@example.net' }),
    }), env);
    expect(response.status).toBe(200);
    expect(JSON.parse(String(provider.mock.calls[0][1]?.body)).reply_to).toBe('traveler@example.net');
  });

  it('rejects wrong origins, missing origins, malformed fields, extra save data, and oversized requests', async () => {
    const env = environment();
    const post = (body: string, origin = GAME_ORIGIN) => worker.fetch(new Request('https://counter.example/v1/feedback', { method: 'POST', headers: { ...(origin ? { Origin: origin } : {}), 'Content-Type': 'application/json' }, body }), env);
    expect((await post(JSON.stringify(FEEDBACK), 'https://elsewhere.example')).status).toBe(403);
    expect((await post(JSON.stringify(FEEDBACK), '')).status).toBe(403);
    expect((await post(JSON.stringify({ ...FEEDBACK, message: '   ' }))).status).toBe(400);
    expect((await post(JSON.stringify({ ...FEEDBACK, replyEmail: 'victim@example.net\r\nBcc:attacker@example.net' }))).status).toBe(400);
    expect((await post(JSON.stringify({ ...FEEDBACK, save: { inventory: ['secret'] } }))).status).toBe(400);
    expect((await post(' '.repeat(24_001))).status).toBe(413);
  });

  it('quietly drops a filled honeypot and returns a useful unavailable response if provider setup is missing', async () => {
    const provider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', provider);
    const env = environment();
    const bot = await worker.fetch(new Request('https://counter.example/v1/feedback', {
      method: 'POST', headers: { Origin: GAME_ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...FEEDBACK, website: 'bot-filled-this' }),
    }), env);
    expect(bot.status).toBe(200);
    expect(provider).not.toHaveBeenCalled();
    const notConfigured = await worker.fetch(new Request('https://counter.example/v1/feedback', {
      method: 'POST', headers: { Origin: GAME_ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify(FEEDBACK),
    }), env);
    expect(notConfigured.status).toBe(503);
  });

  it('returns a retryable failure when Resend is unavailable and keeps provider details private', async () => {
    const env = environment() as ReturnType<typeof environment> & { RESEND_API_KEY: string; FEEDBACK_FROM: string };
    env.RESEND_API_KEY = 'server-only-test-key';
    env.FEEDBACK_FROM = 'Let’s Go, Shall We? <feedback@example.test>';
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('sensitive provider diagnostic', { status: 429 })));
    const response = await worker.fetch(new Request('https://counter.example/v1/feedback', {
      method: 'POST', headers: { Origin: GAME_ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify(FEEDBACK),
    }), env);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'Feedback delivery is unavailable' });
  });
});
