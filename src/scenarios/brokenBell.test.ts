import { describe, expect, it } from 'vitest';
import { choose, meets, newCharacter, startRun } from '../engine';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';
import type { SaveData } from '../types';
import { BROKEN_BELL } from './brokenBell';

function fresh(): SaveData {
  const character = newCharacter('Chapel Visitor');
  return { version: 1, bank: [], character, run: startRun(character, BROKEN_BELL) };
}

function act(state: SaveData, choiceId: string): SaveData {
  const scene = BROKEN_BELL.scenes[state.run!.sceneId];
  const choice = scene.choices.find((entry) => entry.id === choiceId);
  expect(choice, `Choice ${choiceId} in ${scene.id}`).toBeDefined();
  expect(meets(choice!.requirements, state), `Choice ${choiceId} should be available`).toBe(true);
  return choose(state, BROKEN_BELL, choice!, () => 0);
}

describe('For Whom the Bell Tolls — route-proven warning Knowledge', () => {
  it('does not persist the inscription from a call-out or the priest’s notes, and grants it after studying the inscription', () => {
    let state = act(fresh(), 'callOut');
    expect(state.character?.knowledgeKeys).not.toContain(KNOWLEDGE_FACTS.chapelInscription.id);
    state = act(state, 'enterAfterCall');
    state = act(state, 'searchVestry');
    state = act(state, 'readNotes');
    expect(state.character?.knowledgeKeys).not.toContain(KNOWLEDGE_FACTS.chapelInscription.id);
    state = act(state, 'inspectRugAfterNotes');
    state = act(state, 'descendHiddenStair');
    state = act(state, 'readWarning');
    expect(state.character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.chapelInscription.id);
  });
});
