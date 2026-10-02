import { describe, expect, it, vi } from 'vitest';
import { normalizeFeedbackEndpoint, submitFeedback, type FeedbackSubmission } from './feedback';

const submission: FeedbackSubmission = {
  category: 'Bug',
  message: 'The scene did not advance.',
  context: { gameVersion: '0.1.0', scenarioId: 'cold-storage', scenarioTitle: 'Cold Storage', sceneId: 'wellMouth', qaMode: false, activeRun: true, viewportClass: 'small' },
};

describe('in-game feedback submission', () => {
  it('accepts only a configured HTTPS feedback route (or local development route)', () => {
    expect(normalizeFeedbackEndpoint('https://dark-scene.example.workers.dev/v1/feedback')).toBe('https://dark-scene.example.workers.dev/v1/feedback');
    expect(normalizeFeedbackEndpoint('http://localhost:8787/v1/feedback')).toBe('http://localhost:8787/v1/feedback');
    expect(normalizeFeedbackEndpoint('http://dark-scene.example.workers.dev/v1/feedback')).toBe('');
    expect(normalizeFeedbackEndpoint('https://attacker.example/collect')).toBe('');
    expect(normalizeFeedbackEndpoint('https://user:pass@example.test/v1/feedback')).toBe('');
  });

  it('sends without an email and includes only the supplied minimal context', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(submitFeedback('https://feedback.example/v1/feedback', submission, request)).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledOnce();
    const [url, init] = request.mock.calls[0];
    expect(url).toBe('https://feedback.example/v1/feedback');
    const body = JSON.parse(String(init?.body));
    expect(body.replyEmail).toBeUndefined();
    expect(body.message).toBe(submission.message);
    expect(body.context).toEqual(submission.context);
    expect(body.save).toBeUndefined();
  });

  it('supports a voluntarily entered reply address without making it a separate identity', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await submitFeedback('https://feedback.example/v1/feedback', { ...submission, replyEmail: 'player@example.net' }, request);
    expect(JSON.parse(String(request.mock.calls[0][1]?.body)).replyEmail).toBe('player@example.net');
  });

  it('keeps a configuration or delivery failure explicit for the form to offer retry', async () => {
    await expect(submitFeedback('', submission, vi.fn())).rejects.toThrow('not configured');
    await expect(submitFeedback('https://feedback.example/v1/feedback', submission, vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 503 })))).rejects.toThrow('still here');
    await expect(submitFeedback('https://feedback.example/v1/feedback', submission, vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 })))).rejects.toThrow('confirm delivery');
  });

  it('does not claim success on an endpoint error', async () => {
    await expect(submitFeedback('https://feedback.example/v1/feedback', submission, vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 502 })))).rejects.toThrow('still here');
  });
});
