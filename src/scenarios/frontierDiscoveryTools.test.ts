import { describe, expect, it } from 'vitest';
import { frontierAdventure } from './frontierDiscoveryTools';

describe('frontierAdventure shared endings', () => {
  it('does not resolve the story before the final choice or reuse one route’s closure on another', () => {
    const scenario = frontierAdventure({
      id: 'helper-fixture', title: 'A Test Cache', subtitle: 'A stored cache is uncertain.',
      shape: 'salvage', risk: 'LOW', setting: 'remote cabin', hook: 'A cache has uncertain ownership.',
      opening: 'A cache rests beneath a stove.', clue: 'The cache bears a name.',
      turn: 'You can restore the tin or take the counted coins.', cautious: 'Read the paper and restore the tin',
      bold: 'Take the counted coins', leave: 'Leave the compartment untouched',
      insight: 'The tin held deliberately stored property.',
      closure: 'You restore the tin beneath the stove; its initials remain visible.',
      boldEndingTitle: 'The Coins Leave with You',
      boldEndingText: 'You take the counted coins and leave the papers in place.',
      boldRisk: false,
    });

    expect(scenario.scenes['helper-fixtureDecision'].text).toBe('You can restore the tin or take the counted coins.');
    expect(scenario.scenes['helper-fixtureCautious'].text).toContain('You restore the tin');
    expect(scenario.scenes['helper-fixtureCautious'].title).not.toContain('Coins Leave');
    expect(scenario.scenes['helper-fixtureBold'].title).toBe('The Coins Leave with You');
    expect(scenario.scenes['helper-fixtureBold'].text).not.toContain('You restore the tin');
  });
});
