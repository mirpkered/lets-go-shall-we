import { describe, expect, it, vi } from 'vitest';
import { formatGlobalTotal, readGlobalTotal, submitGlobalCompletion } from './completionCounter';

describe('global completion counter client', () => {
  it('reads the aggregate total', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"total":1284}', { status: 200 }));
    await expect(readGlobalTotal('https://counter.example/', request)).resolves.toBe(1284);
    expect(request).toHaveBeenCalledWith('https://counter.example/v1/total', expect.objectContaining({ method: 'GET' }));
  });
  it('submits only the opaque run ID and formats the count locally', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"total":9}', { status: 200 }));
    await expect(submitGlobalCompletion('https://counter.example', '5c4a9c8b-9ec0-42b6-a470-20a7a1bf7488', request)).resolves.toBe(9);
    expect(JSON.parse(String(request.mock.calls[0][1]?.body))).toEqual({ runId: '5c4a9c8b-9ec0-42b6-a470-20a7a1bf7488' });
    expect(formatGlobalTotal(1284)).toBe(new Intl.NumberFormat().format(1284));
  });
  it('surfaces offline and invalid responses for bounded retry without throwing into gameplay', async () => {
    await expect(readGlobalTotal('https://counter.example', vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline');
    await expect(readGlobalTotal('https://counter.example', vi.fn<typeof fetch>().mockResolvedValue(new Response('{"total":0}', { status: 503 })))).rejects.toThrow('Counter unavailable');
    await expect(readGlobalTotal('https://counter.example', vi.fn<typeof fetch>().mockResolvedValue(new Response('{"total":"0"}', { status: 200 })))).rejects.toThrow('Invalid counter response');
  });
});
