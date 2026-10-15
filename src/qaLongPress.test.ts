import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachLongPress, buildNormalModeUrl, buildQaEntryUrl, QA_BANNER_HOLD_MS } from './qaLongPress';

function pointer(type: string, values: Partial<PointerEvent> = {}): Event {
  const event = new Event(type);
  for (const [key, value] of Object.entries({ pointerId: 7, isPrimary: true, button: 0, clientX: 20, clientY: 20, ...values })) {
    Object.defineProperty(event, key, { value });
  }
  return event;
}

function fixture() {
  const target = new EventTarget() as HTMLElement;
  target.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) });
  const onActivate = vi.fn();
  const onProgressChange = vi.fn();
  const cleanup = attachLongPress(target, { onActivate, onProgressChange });
  return { target, onActivate, onProgressChange, cleanup };
}

describe('hidden banner QA long press', () => {
  afterEach(() => vi.useRealTimers());

  it('leaves an ordinary click and a short press inert', () => {
    vi.useFakeTimers();
    const { target, onActivate, cleanup } = fixture();
    target.dispatchEvent(new Event('click'));
    target.dispatchEvent(pointer('pointerdown'));
    vi.advanceTimersByTime(QA_BANNER_HOLD_MS - 1);
    target.dispatchEvent(pointer('pointerup'));
    vi.advanceTimersByTime(1);
    expect(onActivate).not.toHaveBeenCalled();
    cleanup();
  });

  it('activates at the three-second threshold and only once across repeated input', () => {
    vi.useFakeTimers();
    const { target, onActivate, cleanup } = fixture();
    target.dispatchEvent(pointer('pointerdown'));
    vi.advanceTimersByTime(QA_BANNER_HOLD_MS);
    target.dispatchEvent(pointer('pointerup'));
    target.dispatchEvent(pointer('pointerdown', { pointerId: 8 }));
    vi.advanceTimersByTime(QA_BANNER_HOLD_MS * 2);
    expect(onActivate).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it.each(['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture'])(
    'cancels immediately on %s before the hold completes', (eventName) => {
      vi.useFakeTimers();
      const { target, onActivate, onProgressChange, cleanup } = fixture();
      target.dispatchEvent(pointer('pointerdown'));
      vi.advanceTimersByTime(1_200);
      target.dispatchEvent(pointer(eventName));
      vi.advanceTimersByTime(QA_BANNER_HOLD_MS);
      expect(onActivate).not.toHaveBeenCalled();
      expect(onProgressChange).toHaveBeenLastCalledWith(false);
      cleanup();
    },
  );

  it('cancels when the pointer moves outside the banner bounds', () => {
    vi.useFakeTimers();
    const { target, onActivate, cleanup } = fixture();
    target.dispatchEvent(pointer('pointerdown'));
    target.dispatchEvent(pointer('pointermove', { clientX: 101 }));
    vi.advanceTimersByTime(QA_BANNER_HOLD_MS);
    expect(onActivate).not.toHaveBeenCalled();
    cleanup();
  });

  it('cleans up a pending activation when the banner is removed', () => {
    vi.useFakeTimers();
    const { target, onActivate, cleanup } = fixture();
    target.dispatchEvent(pointer('pointerdown'));
    cleanup();
    vi.advanceTimersByTime(QA_BANNER_HOLD_MS);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('builds the canonical QA URL while preserving the current page context', () => {
    expect(buildQaEntryUrl('https://example.test/game?campaign=spring#start'))
      .toBe('https://example.test/game?campaign=spring&qa=1#start');
    expect(buildQaEntryUrl('https://example.test/game?qa=0&campaign=spring'))
      .toBe('https://example.test/game?qa=1&campaign=spring');
  });

  it('returns to the normal URL without disturbing unrelated query state', () => {
    expect(buildNormalModeUrl('https://example.test/game?campaign=spring&qa=1#start'))
      .toBe('https://example.test/game?campaign=spring#start');
  });
});
