import { describe, expect, it } from 'vitest';
import { choose, newCharacter, startAdventure } from '../engine';
import { classifyScenario } from '../scenarioDiversity';
import { SCENARIOS } from './index';
import { THE_MISPLACED_PIGEONHOLE, THE_WARDROBE_ON_THE_ROOF } from './comedyAbsurdityBatch';
const THE_LAST_TRAIN_MESSAGE = SCENARIOS.find(({ id }) => id === 'the-last-train-message')!;
import { THE_THREE_RING_TOSS } from './surpriseCompetitionBatch';
import { WHAT_DID_YOU_SEE } from './communityBatch';
import { UNLOAD_BEFORE_DARK } from './honestWorkBatch';
import { ONE_HORSE_TWO_RIDERS } from './westernOutlawBatch';
const THE_CLAIM_WITH_NO_NAME = SCENARIOS.find(({ id }) => id === 'the-claim-with-no-name')!;
import { ITEMS } from '../items';

function fresh(scenario: (typeof SCENARIOS)[number], random = () => 0.5) {
  return startAdventure({ version: 1, bank: [], itemStates: {}, character: newCharacter('Playtest'), run: null }, scenario, random);
}
function act(state: ReturnType<typeof fresh>, scenario: (typeof SCENARIOS)[number], id: string, random = () => 0.5) {
  const scene = scenario.scenes[state.run!.sceneId];
  const action = scene.choices.find((choice) => choice.id === id);
  if (!action) throw new Error(`Missing choice ${scenario.id}/${scene.id}/${id}`);
  return choose(state, scenario, action, random);
}

describe('confirmed normal-play feedback and reward clarity', () => {
  it('makes the laundry basket reachable from firm ground and clarifies its landing', () => {
    const opening = THE_WARDROBE_ON_THE_ROOF.scenes.yard.text;
    const broom = THE_WARDROBE_ON_THE_ROOF.scenes.broom.text;
    expect(opening).toMatch(/sideways against the stable’s low porch roof/i);
    expect(opening).toMatch(/broom to reach from firm ground/i);
    expect(broom).toMatch(/catch the basket’s rim at the eave/i);
  });

  it('makes The Form Was Waiting for a Name verify the form’s meaning before a signature', () => {
    const scenario = SCENARIOS.find(({ id }) => id === 'the-clerks-second-stamp')!;
    let state = fresh(scenario);
    state = act(state, scenario, 'explainNeed');
    expect(state.run?.sceneId).toBe('purpose');
    state = act(state, scenario, 'signNow');
    expect(state.run?.sceneId).toBe('signatureCheck');
    expect(scenario.scenes.signatureCheck.text).toMatch(/your own name and arrival date, one for a witness/i);
    state = act(state, scenario, 'signCorrectLine');
    expect(state.run?.sceneId).toBe('signed');
    expect(state.character?.adventuresCompleted).toBe(1);
    expect(scenario.scenes.signed.text).toMatch(/instead of a false witness record/i);
  });

  it('shows the passenger’s decision after the last-train note and preserves privacy', () => {
    let state = fresh(THE_LAST_TRAIN_MESSAGE);
    state = act(state, THE_LAST_TRAIN_MESSAGE, 'take-deliver');
    state = act(state, THE_LAST_TRAIN_MESSAGE, 'deliver-private');
    expect(state.run?.sceneId).toBe('passengerDecision');
    expect(THE_LAST_TRAIN_MESSAGE.scenes.passengerDecision.text).toMatch(/will stay for the next one/i);
    state = act(state, THE_LAST_TRAIN_MESSAGE, 'carryReceipt');
    expect(state.run?.sceneId).toBe('receiptCarried');
    expect(state.character?.historyFlags).toContain('carried a private receipt after a passenger chose to miss the last train');
    expect(state.character?.adventuresCompleted).toBe(1);
  });

  it('gives civilian help at the junction human acknowledgment without forcing a material reward', () => {
    const ending = SCENARIOS.flatMap(({ scenes }) => Object.values(scenes)).find(({ title }) => title === 'Held Before the Junction');
    expect(ending?.text).toMatch(/passenger grips your hand and thanks you/i);
    expect(ending?.text).toMatch(/gave the crews time to act/i);
  });

  it('makes Unload Before Dark present its shifted freight complication on new runs', () => {
    const state = fresh(UNLOAD_BEFORE_DARK, () => 0);
    expect(state.run?.randomSelections?.shift).toBe('complication');
    let working = act(state, UNLOAD_BEFORE_DARK, 'beginWork');
    expect(UNLOAD_BEFORE_DARK.scenes.work.textVariants?.[0].text).toMatch(/crate of household pots has shifted/i);
    expect(UNLOAD_BEFORE_DARK.scenes.work.choices.map(({ id }) => id)).toContain('addressIssue');
  });

  it('makes the held letter’s privacy and practical consequence explicit', () => {
    const ending = THE_MISPLACED_PIGEONHOLE.scenes.held;
    expect(ending.text).toMatch(/stays sealed/i);
    expect(ending.text).toMatch(/preventing the next batch from repeating the mistake/i);
  });

  it('awards Knowledge on the investigated but cautious Claim with No Name exit', () => {
    let state = fresh(THE_CLAIM_WITH_NO_NAME);
    state = act(state, THE_CLAIM_WITH_NO_NAME, 'approach');
    state = act(state, THE_CLAIM_WITH_NO_NAME, 'leaveEvidence');
    expect(state.run?.sceneId).toBe('the-claim-with-no-nameEvidenceLeft');
    expect(state.character?.knowledge).toContain('A recently worked creek cut had no visible claim markers or owner’s name.');
    expect(THE_CLAIM_WITH_NO_NAME.scenes[state.run!.sceneId].text).toMatch(/grounded observation/i);
    expect(state.character?.adventuresCompleted).toBe(1);
  });

  it('classifies What Did You See? as a compact Encounter, not a thin Adventure', () => {
    const metadata = classifyScenario(WHAT_DID_YOU_SEE);
    expect(metadata.depthClass).toBe('ENCOUNTER');
    expect(metadata.length).toBe('VIGNETTE');
    let state = fresh(WHAT_DID_YOU_SEE, () => 0);
    state = act(state, WHAT_DID_YOU_SEE, 'rememberWheelStone');
    state = act(state, WHAT_DID_YOU_SEE, 'clarifyUncertainty');
    expect(state.run?.sceneId).toBe('uncertainAccount');
    expect(state.run?.status).toBe('success');
  });

  it('establishes that the posse is present before seeing the opened pouch', () => {
    let state = fresh(ONE_HORSE_TWO_RIDERS);
    expect(ONE_HORSE_TWO_RIDERS.scenes.draw.text).toMatch(/posse of armed riders is already visible/i);
    state = act(state, ONE_HORSE_TWO_RIDERS, 'rideTogether');
    state = act(state, ONE_HORSE_TWO_RIDERS, 'togetherDropPouch');
    expect(ONE_HORSE_TWO_RIDERS.scenes.challenge.text).toMatch(/dismounted within earshot/i);
    state = act(state, ONE_HORSE_TWO_RIDERS, 'challengeShow');
    expect(ONE_HORSE_TWO_RIDERS.scenes.account.text).toMatch(/leader and the wounded stranger both beside the horse/i);
  });

  it('explains the toss line and records the duck as a narrative prize, not Gear', () => {
    let state = fresh(THE_THREE_RING_TOSS);
    expect(THE_THREE_RING_TOSS.scenes.toss.text).toMatch(/waist-high shelf/i);
    expect(THE_THREE_RING_TOSS.scenes.line.text).toMatch(/official toe-line/i);
    state = act(state, THE_THREE_RING_TOSS, 'inspectLine');
    state = act(state, THE_THREE_RING_TOSS, 'argueForDuck');
    expect(state.run?.status).toBe('success');
    expect(state.character?.historyFlags).toContain('won_a_painted_duck_that_was_not_travel_gear');
    expect(THE_THREE_RING_TOSS.scenes.duck.text).toMatch(/not usable travel Gear/i);
    expect(ITEMS).not.toHaveProperty('paintedDuck');
    expect(state.run?.acquiredThisRun).not.toContain('paintedDuck');
  });
});
