import type { FeedbackContext } from './helpPanels';

export interface FeedbackSubmission {
  category: string;
  message: string;
  replyEmail?: string;
  context: FeedbackContext;
  website?: string;
}

export function normalizeFeedbackEndpoint(value?: string): string {
  if (!value?.trim()) return '';
  try {
    const endpoint = new URL(value.trim());
    const localHttp = endpoint.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(endpoint.hostname);
    if ((endpoint.protocol !== 'https:' && !localHttp) || endpoint.pathname !== '/v1/feedback' || endpoint.search || endpoint.hash || endpoint.username || endpoint.password) return '';
    return endpoint.toString().replace(/\/$/, '');
  } catch { return ''; }
}

export async function submitFeedback(endpoint: string, submission: FeedbackSubmission, request: typeof fetch = fetch): Promise<void> {
  if (!endpoint) throw new Error('Feedback delivery is not configured yet. Please try again later.');
  const response = await request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(submission),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(response.status >= 500 ? 'We could not send that just now. Your message is still here; please try again.' : 'Please check the form and try again.');
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('ok' in result) || result.ok !== true) throw new Error('We could not confirm delivery. Your message is still here; please try again.');
}
