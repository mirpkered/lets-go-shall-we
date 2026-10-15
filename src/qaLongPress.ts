export const QA_BANNER_HOLD_MS = 3_000;

export type LongPressOptions = {
  durationMs?: number;
  onProgressChange?: (active: boolean) => void;
  onActivate: () => void;
};

/** Attach a cancel-safe primary-pointer long press to a single target. */
export function attachLongPress(target: HTMLElement, options: LongPressOptions): () => void {
  const durationMs = options.durationMs ?? QA_BANNER_HOLD_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let activePointerId: number | null = null;
  let activated = false;

  const cancel = (): void => {
    if (activePointerId === null) return;
    const pointerId = activePointerId;
    activePointerId = null;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    options.onProgressChange?.(false);
    try {
      if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
    } catch {
      // Pointer capture can already be released by the browser during cancellation.
    }
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (activated || activePointerId !== null || !event.isPrimary || event.button !== 0) return;
    activePointerId = event.pointerId;
    try { target.setPointerCapture?.(event.pointerId); }
    catch { /* Capture is optional; pointerup/cancel and pointerleave still clean up. */ }
    options.onProgressChange?.(true);
    timer = setTimeout(() => {
      timer = null;
      if (activePointerId === null) return;
      activePointerId = null;
      activated = true;
      options.onProgressChange?.(false);
      options.onActivate();
    }, durationMs);
  };

  const cancelForPointer = (event: Event): void => {
    if ((event as PointerEvent).pointerId === activePointerId) cancel();
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== activePointerId) return;
    const rect = target.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancel();
  };

  target.addEventListener('pointerdown', onPointerDown);
  target.addEventListener('pointerup', cancelForPointer);
  target.addEventListener('pointercancel', cancelForPointer);
  target.addEventListener('pointerleave', cancelForPointer);
  target.addEventListener('lostpointercapture', cancelForPointer);
  target.addEventListener('pointermove', onPointerMove);

  return () => {
    cancel();
    target.removeEventListener('pointerdown', onPointerDown);
    target.removeEventListener('pointerup', cancelForPointer);
    target.removeEventListener('pointercancel', cancelForPointer);
    target.removeEventListener('pointerleave', cancelForPointer);
    target.removeEventListener('lostpointercapture', cancelForPointer);
    target.removeEventListener('pointermove', onPointerMove);
  };
}

export function buildQaEntryUrl(href: string): string {
  const url = new URL(href);
  url.searchParams.set('qa', '1');
  return url.toString();
}

export function buildNormalModeUrl(href: string): string {
  const url = new URL(href);
  url.searchParams.delete('qa');
  return url.toString();
}
