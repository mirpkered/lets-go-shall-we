export async function readGlobalTotal(endpoint: string, request: typeof fetch = fetch): Promise<number> {
  const response = await request(`${endpoint.replace(/\/$/, '')}/v1/total`, { method: 'GET', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error('Counter unavailable');
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !('total' in payload) || !Number.isSafeInteger(payload.total) || (payload.total as number) < 0) throw new Error('Invalid counter response');
  return payload.total as number;
}

export async function submitGlobalCompletion(endpoint: string, runId: string, request: typeof fetch = fetch): Promise<number> {
  const response = await request(`${endpoint.replace(/\/$/, '')}/v1/complete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ runId }), signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error('Counter unavailable');
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !('total' in payload) || !Number.isSafeInteger(payload.total) || (payload.total as number) < 0) throw new Error('Invalid counter response');
  return payload.total as number;
}

export function formatGlobalTotal(total: number): string { return new Intl.NumberFormat().format(total); }
