import { describe, expect, it } from 'vitest';
import worker, { CompletionCounter } from './index';

const RUN_ID = '5c4a9c8b-9ec0-42b6-a470-20a7a1bf7488';

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
});
