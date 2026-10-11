import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, sceneText, startRun } from '../engine';
import { EMPTY_SAVE, loadSave, saveGame } from '../storage';
import { SCENARIOS } from './index';
import type { SaveData, Scenario } from '../types';

const scenario = (id: string): Scenario => {
  const found = SCENARIOS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing scenario ${id}`);
  return found;
};

function fresh(adventure: Scenario, money = 0): SaveData {
  const character = newCharacter('Accounting Tester');
  character.money = money;
  return { ...structuredClone(EMPTY_SAVE), character, run: startRun(character, adventure, () => 0) };
}

function act(state: SaveData, adventure: Scenario, choiceId: string, random = () => 0): SaveData {
  const scene = adventure.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `${adventure.id}.${scene.id}.${choiceId}`).toBeTruthy();
  expect(meets(choice!.requirements, state), `${adventure.id}.${scene.id}.${choiceId}`).toBe(true);
  return choose(state, adventure, choice!, random);
}

describe('RC03 C3 compensation and accounting repairs', () => {
  it('does not pay the fen perimeter fee until the player selects coin, and does not stack it on the gear alternative', () => {
    const adventure = scenario('a-footing-in-the-fen');
    let state = act(fresh(adventure), adventure, 'circleFen');
    expect(state.character?.money).toBe(0);
    state = act(state, adventure, 'takeCoin');
    expect(state.character?.money).toBe(1);

    let gear = act(fresh(adventure), adventure, 'circleFen');
    gear = act(gear, adventure, 'takeRod');
    expect(gear.character?.money).toBe(0);
    expect(gear.run?.inventory).toContain('collapsibleSoundingRod');
  });

  it('pays Rain on the Return Path only for the coin choice, not when the cloak is selected', () => {
    const adventure = scenario('rain-on-the-return-path');
    let coin = act(fresh(adventure), adventure, 'takeValley');
    expect(coin.character?.money).toBe(0);
    coin = act(coin, adventure, 'takeCoin');
    expect(coin.character?.money).toBe(1);
    let cloak = act(fresh(adventure), adventure, 'takeValley');
    cloak = act(cloak, adventure, 'takeCloak');
    expect(cloak.character?.money).toBe(0);
    expect(cloak.run?.inventory).toContain('weatherproofCloak');
  });

  it('grants the Cold Rope route-check coin on both safe bridge routes, but not on the failed ice shortcut', () => {
    const adventure = scenario('the-cold-rope-at-dawn');
    let direct = act(fresh(adventure), adventure, 'takeBridge');
    expect(direct.character?.money).toBe(1);
    let marked = act(fresh(adventure), adventure, 'testFromBank');
    marked = act(marked, adventure, 'markIce');
    expect(marked.character?.money).toBe(1);
    expect(marked.character?.knowledge?.length).toBeGreaterThan(0);
    const failed = act(fresh(adventure), adventure, 'crossIce');
    expect(failed.character?.money).toBe(0);
  });

  it('pays for both safe Mule’s Last Step arrivals, but not the marked-trail alternative', () => {
    const adventure = scenario('the-mules-last-step');
    let guided = act(fresh(adventure), adventure, 'leadBack');
    guided = act(guided, adventure, 'guideAround');
    expect(guided.character?.money).toBe(1);
    let waited = act(fresh(adventure), adventure, 'checkChips');
    waited = act(waited, adventure, 'waitSlope');
    waited = act(waited, adventure, 'routeAround');
    expect(waited.character?.money).toBe(1);
    let marked = act(fresh(adventure), adventure, 'leadBack');
    marked = act(marked, adventure, 'signalCrew');
    expect(marked.character?.money).toBe(0);
  });

  it('pays the Fourth Mule extra-handling fee on each safe outcome only once', () => {
    const adventure = scenario('the-fourth-mule');
    for (const resolution of ['useBlanket', 'retreat']) {
      let state = act(fresh(adventure), adventure, 'leaveBedding');
      state = act(state, adventure, resolution);
      expect(state.character?.money).toBe(1);
      expect(state.run?.sceneId).toBe('safe');
    }
    const route = adventure.scenes.camp.choices.find(({ id }) => id === 'useBlanket')!;
    expect(route.effects?.money).toBe(1);
  });

  it('does not describe New Year’s Eve seat release as a refund when no fare was charged', () => {
    const adventure = scenario('new-years-eve');
    let state = act(fresh(adventure, 3), adventure, 'take-coach');
    state = act(state, adventure, 'coach-leave');
    expect(state.character?.money).toBe(3);
    expect(sceneText(adventure.scenes['coach-leave'], state)).toMatch(/unpurc?hased seat.*no fare was paid or refunded/i);
  });

  it('keeps The Borrowed Horse delivery fee consistent with elapsed travel time', () => {
    const adventure = scenario('the-borrowed-horse');
    const walked = act(fresh(adventure), adventure, 'walkTheMare');
    expect(walked.run?.elapsedMinutes).toBe(55);
    expect(walked.run?.sceneId).toBe('lateArrival');
    expect(walked.character?.money).toBe(0);

    let rested = act(fresh(adventure), adventure, 'stopAndInspect');
    rested = act(rested, adventure, 'clearGritAndRest');
    rested = act(rested, adventure, 'rideRested', () => 0);
    expect(rested.run?.elapsedMinutes).toBe(38);
    expect(rested.run?.sceneId).toBe('paidArrival');
    expect(rested.character?.money).toBe(3);
  });

  it('refunds Medium Knows Too Much only after a paid reading and does not double-refund', () => {
    const adventure = scenario('medium-knows-too-much');
    let paid = act(fresh(adventure, 3), adventure, 'payMedium');
    expect(paid.character?.money).toBe(2);
    paid = act(paid, adventure, 'askSource');
    expect(paid.character?.money).toBe(3);
    expect(sceneText(adventure.scenes.mediumConfront, paid)).toMatch(/return the one-coin reading fee now/i);
    const storage = { value: '', setItem(_key: string, value: string) { this.value = value; }, getItem(_key: string) { return this.value; } };
    saveGame(paid, storage as never);
    paid = loadSave(storage as never);
    expect(paid.character?.money).toBe(3);
    paid = act(paid, adventure, 'acceptRefund');
    expect(paid.character?.money).toBe(3);

    let unpaid = act(fresh(adventure, 3), adventure, 'watchMedium');
    unpaid = act(unpaid, adventure, 'showNote');
    expect(sceneText(adventure.scenes.mediumConfront, unpaid)).toMatch(/no reading fee was paid/i);
    expect(adventure.scenes.mediumConfront.choices.filter(({ requirements }) => meets(requirements, unpaid)).map(({ id }) => id)).not.toContain('acceptRefund');
    unpaid = act(unpaid, adventure, 'leaveWithoutRefund');
    expect(unpaid.character?.money).toBe(3);
  });
});
