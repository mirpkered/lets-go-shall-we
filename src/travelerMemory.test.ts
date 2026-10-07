import { describe, expect, it } from 'vitest';
import { choose, failCharacter, newCharacter, retireCharacter, sceneText, startRun } from './engine';
import { loadSave, saveGame } from './storage';
import { KNOWLEDGE_FACTS } from './knowledgeFacts';
import type { SaveData, Scenario } from './types';

const memoryStory: Scenario = {
  id: 'memory-test-story', title: 'Memory Test', subtitle: 'Separate remembered facts from events.', startScene: 'start',
  scenes: {
    start: { id: 'start', title: 'Start', text: 'A fact can be learned.', choices: [{ id: 'learn', label: 'Inspect', effects: { knowledgeEntries: [KNOWLEDGE_FACTS.barnDrainToCreek], lore: ['The old keeper says the stair sings in frost.'], historyFlags: ['inspected_north_stair'] }, next: 'check' }] },
    check: { id: 'check', title: 'Check', text: 'What do you remember?', textVariants: [
      { requirements: { knowledgeKeys: [KNOWLEDGE_FACTS.barnDrainToCreek.id] }, text: 'You remember the dry stair.' },
      { requirements: { historyFlags: ['inspected_north_stair'] }, text: 'You remember inspecting the stair.' },
    ], choices: [{ id: 'learnAgain', label: 'Inspect again', effects: { knowledgeEntries: [KNOWLEDGE_FACTS.barnDrainToCreek], lore: ['The old keeper says the stair sings in frost.'], historyFlags: ['inspected_north_stair'] }, next: 'check' }] },
  },
};

function freshState(): SaveData {
  const character = newCharacter('Memory keeper');
  return { version: 1, bank: ['graveCoin'], character, run: startRun(character, memoryStory) };
}

describe('Knowledge, Lore, and History continuity', () => {
  it('acquires categories separately, deduplicates repeats, and supports exact earned-fact queries', () => {
    let state = freshState();
    state = choose(state, memoryStory, memoryStory.scenes.start.choices[0]);
    expect(state.character?.knowledge).toEqual([KNOWLEDGE_FACTS.barnDrainToCreek.text]);
    expect(state.character?.knowledgeKeys).toEqual([KNOWLEDGE_FACTS.barnDrainToCreek.id]);
    expect(state.character?.knowledgeSources).toEqual({ [KNOWLEDGE_FACTS.barnDrainToCreek.id]: ['memory-test-story'] });
    expect(state.character?.lore).toEqual(['The old keeper says the stair sings in frost.']);
    expect(state.character?.historyFlags).toEqual(['inspected_north_stair']);
    expect(sceneText(memoryStory.scenes.check, state)).toBe('You remember the dry stair.');
    state = choose(state, memoryStory, memoryStory.scenes.check.choices[0]);
    expect(state.character?.knowledge).toHaveLength(1);
    expect(state.character?.lore).toHaveLength(1);
    expect(state.character?.historyFlags).toHaveLength(1);
    expect(state.character?.knowledgeSources?.[KNOWLEDGE_FACTS.barnDrainToCreek.id]).toEqual(['memory-test-story']);
  });

  it('round-trips all three memory categories and leaves Bank state separate', () => {
    let state = freshState();
    state = choose(state, memoryStory, memoryStory.scenes.start.choices[0]);
    let saved: string | null = null;
    saveGame(state, { setItem: (_key, value) => { saved = value; } });
    const restored = loadSave({ getItem: () => saved });
    expect(restored.character?.knowledge).toEqual([KNOWLEDGE_FACTS.barnDrainToCreek.text]);
    expect(restored.character?.knowledgeKeys).toEqual([KNOWLEDGE_FACTS.barnDrainToCreek.id]);
    expect(restored.character?.knowledgeSources).toEqual({ [KNOWLEDGE_FACTS.barnDrainToCreek.id]: ['memory-test-story'] });
    expect(restored.character?.lore).toEqual(['The old keeper says the stair sings in frost.']);
    expect(restored.character?.historyFlags).toEqual(['inspected_north_stair']);
    expect(restored.bank).toEqual(['graveCoin']);
  });

  it('migrates an exact legacy prose fact to its stable key without dropping or rewriting the prose', () => {
    const character = newCharacter('Earlier traveler');
    character.knowledge = [KNOWLEDGE_FACTS.barnDrainToCreek.text, 'An unrelated old memory.'];
    const legacy = { version: 1, bank: ['graveCoin'], character: { ...character, knowledgeKeys: undefined }, run: null };
    const loaded = loadSave({ getItem: () => JSON.stringify(legacy) });
    expect(loaded.character?.knowledge).toEqual([KNOWLEDGE_FACTS.barnDrainToCreek.text, 'An unrelated old memory.']);
    expect(loaded.character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.barnDrainToCreek.id);
    expect(loaded.character?.knowledgeSources).toBeUndefined();
    expect(loaded.bank).toEqual(['graveCoin']);
  });

  it('records distinct teaching Adventures once and normalizes malformed provenance without invalidating the fact', () => {
    const secondSource = { ...memoryStory, id: 'memory-test-story-two' };
    let state = freshState();
    state = choose(state, memoryStory, memoryStory.scenes.start.choices[0]);
    state = { ...state, run: startRun(state.character!, secondSource) };
    state = choose(state, secondSource, secondSource.scenes.start.choices[0]);
    expect(state.character?.knowledgeSources?.[KNOWLEDGE_FACTS.barnDrainToCreek.id]).toEqual(['memory-test-story', 'memory-test-story-two']);
    const saved = JSON.stringify({ ...state, character: { ...state.character, knowledgeSources: { [KNOWLEDGE_FACTS.barnDrainToCreek.id]: ['memory-test-story', 'memory-test-story-two', 'memory-test-story-two', '', 4], obsolete: ['old-source'] } } });
    const restored = loadSave({ getItem: () => saved });
    expect(restored.character?.knowledgeKeys).toContain(KNOWLEDGE_FACTS.barnDrainToCreek.id);
    expect(restored.character?.knowledgeSources).toEqual({ [KNOWLEDGE_FACTS.barnDrainToCreek.id]: ['memory-test-story', 'memory-test-story-two'] });
  });

  it('clears traveler memory at death/abandonment and retirement without clearing Bank contents', () => {
    let state = freshState();
    state = choose(state, memoryStory, memoryStory.scenes.start.choices[0]);
    const ended = [failCharacter(state), retireCharacter(state)];
    for (const result of ended) {
      expect(result.character).toBeNull();
      expect(result.run).toBeNull();
      expect(result.bank).toEqual(['graveCoin']);
    }
  });
});
