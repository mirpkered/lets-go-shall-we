import { describe, expect, it } from 'vitest';
import { NORMAL_SPLASH_TIMING, REDUCED_MOTION_SPLASH_TIMING } from './launchSplash';

describe('Mirpworks launch splash timing', () => {
  it('matches the canonical Word Search Adventure production sequence', () => {
    expect(Object.values(NORMAL_SPLASH_TIMING)).toEqual([750, 1950, 2800, 3000, 3150, 3750, 4550]);
  });

  it('keeps the canonical shortened reduced-motion sequence', () => {
    expect(Object.values(REDUCED_MOTION_SPLASH_TIMING)).toEqual([100, 150, 270, 320, 340, 440, 640]);
  });
});
