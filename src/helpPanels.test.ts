import { describe, expect, it } from 'vitest';
import { newCharacter, startRun } from './engine';
import { contactMailto, CONTACT_EMAIL, CONTACT_SUBJECT, feedbackAdventureTitle, renderUtilityFeatures } from './helpPanels';
import { COLD_STORAGE } from './scenarios/coldStorage';
import { SCENARIOS } from './scenarios';
import type { SaveData } from './types';

describe('About and Contact utilities', () => {
  it('offers both utilities on the title screen when no adventure is active', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('data-open-help="about"');
    expect(markup).toContain('data-open-help="contact"');
    expect(markup).toContain('aria-label="About"');
    expect(markup).toContain('aria-label="Contact and game feedback"');
    expect(markup).toContain('class="utility-question" aria-hidden="true">?</span>');
    expect(markup).toContain('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">');
    expect(markup).toContain('aria-label="Help and contact utilities"');
    expect(markup).toContain('id="about-dialog"');
    expect(markup).toContain('id="contact-dialog"');
    expect(markup).toContain('Adventure: General Feedback');
    expect(markup).toContain('<h2 id="contact-heading">Contact &amp; Feedback</h2>');
    expect(markup).toContain('data-feedback-category');
  });

  it('keeps both utilities available during an active adventure without changing state or fictional time', () => {
    const character = newCharacter();
    const state: SaveData = { version: 1, bank: ['smallKnife'], character, run: startRun(character, COLD_STORAGE) };
    state.run!.elapsedMinutes = 23;
    state.run!.qualifyingStoryTransitions = 4;
    const before = JSON.stringify(state);
    const markup = renderUtilityFeatures(feedbackAdventureTitle(state, SCENARIOS));
    expect(markup).toContain('data-open-help="about"');
    expect(markup).toContain('data-open-help="contact"');
    expect(markup).toContain('<strong>Cold Storage</strong>');
    expect(JSON.stringify(state)).toBe(before);
    expect(state.run?.elapsedMinutes).toBe(23);
    expect(state.run?.qualifyingStoryTransitions).toBe(4);
  });

  it('targets the public Mirpworks address with the requested subject and structured body', () => {
    const mailto = contactMailto('Cold Storage');
    expect(mailto.startsWith(`mailto:${CONTACT_EMAIL}?`)).toBe(true);
    const query = mailto.slice(mailto.indexOf('?') + 1);
    const params = new URLSearchParams(query);
    expect(params.get('subject')).toBe(CONTACT_SUBJECT);
    expect(params.get('subject')).toBe('Let’s Go, Shall We? — Feedback');
    expect(params.get('body')).toContain('Game: Let’s Go, Shall We?');
    expect(params.get('body')).toContain('Adventure: Cold Storage');
    expect(params.get('body')).toContain('Feedback:');
    expect(params.get('body')).toContain('If reporting a problem, what happened just before it?');
    expect(params.get('body')).toContain('A screenshot may help; attach one if you have it.');
    expect(params.get('body')).not.toContain('flags');
    expect(params.get('body')).not.toContain('roll');
    expect(params.get('body')).not.toContain('inventory');
    expect(mailto).not.toContain('attach=');
  });

  it('supports general feedback and an optional category without requiring adventure context', () => {
    const general = new URLSearchParams(contactMailto().split('?')[1]).get('body')!;
    expect(general).toContain('Adventure: General Feedback');
    expect(general).not.toContain('Category:');
    const categorized = new URLSearchParams(contactMailto(undefined, 'Something felt unfair').split('?')[1]).get('body')!;
    expect(categorized).toContain('Category: Something felt unfair');
  });

  it('uses the active adventure or most recently played display title, never an internal ID', () => {
    const activeState: SaveData = { version: 1, bank: [], character: newCharacter(), run: startRun(newCharacter(), COLD_STORAGE) };
    expect(feedbackAdventureTitle(activeState, SCENARIOS)).toBe(COLD_STORAGE.title);
    expect(feedbackAdventureTitle({ run: null, mostRecentScenarioId: COLD_STORAGE.id }, SCENARIOS)).toBe(COLD_STORAGE.title);
    expect(feedbackAdventureTitle({ run: null, mostRecentScenarioId: null }, SCENARIOS)).toBeUndefined();
    expect(renderUtilityFeatures(COLD_STORAGE.title)).toContain('<strong>Cold Storage</strong>');
    expect(renderUtilityFeatures(COLD_STORAGE.title)).not.toContain(COLD_STORAGE.id);
  });

  it('explicitly invites screenshots and story ideas without claiming to upload attachments', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('Found something odd, unfair, confusing, or especially fun? Feedback is welcome.');
    expect(markup).toContain('stories you liked or disliked');
    expect(markup).toContain('item interactions that felt useful or forced');
    expect(markup).toContain('Screenshots can help with a problem');
    expect(markup).toContain('This page does not upload them');
  });

  it('describes the implemented adventure, choice, risk, and no-parser loop', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('collection of short interactive adventures');
    expect(markup).toContain('tap an available action');
    expect(markup).toContain('No typing or parser is needed');
    expect(markup).toContain('paths can branch and end differently');
    expect(markup).toContain('Some risky actions involve chance');
    expect(markup).toContain('danger is usually signaled');
    expect(markup).toContain('Several approaches may work');
    expect(markup).toContain('there is no perfect outcome');
    expect(markup).toContain('There is no real-world timer');
    expect(markup).toContain('Time away from the game never advances the adventure clock');
    expect(markup).toContain('You travel light, take work where you find it, and rarely stay anywhere long. Some days bring ordinary work. Others bring trouble.');
    expect(markup).toContain('You can accept a job, lend a hand, or keep moving');
    expect(markup).toContain('This is a fictional travel era inspired by the late 19th century');
    expect(markup).toContain('The exact year is left open');
    expect(markup).toContain('telegraphy is available only in some settlements');
  });

  it('explains the anonymous completion counter accurately and distinguishes it from save data', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('The anonymous adventure count');
    expect(markup).toContain('a random ID for that completed run');
    expect(markup).toContain('does not require an account');
    expect(markup).toContain('does not require an account or record story choices, inventory, character identity, or save data');
    expect(markup).toContain('Abandoned runs and QA play are not counted');
    expect(markup).toContain('your adventure still completes normally');
  });

  it('explains traveler carry milestones, bank, death, retirement, abandonment, and autosave accurately', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('money, lore, knowledge, equipment, and history');
    expect(markup).toContain('two after ten completed adventures, and three after twenty');
    expect(markup).toContain('prepare a loadout from eligible gear and relics');
    expect(markup).toContain('Gear and relics stored in the five-place Bank survive death or retirement');
    expect(markup).toContain('Supplies, like other unbanked belongings, stay with their traveler');
    expect(markup).toContain('If an adventurer dies or is retired');
    expect(markup).toContain('The game autosaves after meaningful choices');
    expect(markup).toContain('Closing the tab or app is safe');
    expect(markup).toContain('<strong>Abandon Adventure</strong> intentionally ends the active run');
    expect(markup).toContain('A surviving adventurer carries a small history of important choices into future stories');
    expect(markup).toContain('there is no fame score');
    expect(markup).not.toContain('reputation score');
    expect(markup).not.toContain('karma');
    expect(markup).not.toContain('cloud sync');
  });

  it('uses labelled native dialogs with reachable close controls and a safe external link', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('<dialog class="utility-dialog" id="about-dialog" aria-labelledby="about-heading">');
    expect(markup).toContain('<dialog class="utility-dialog contact-dialog" id="contact-dialog" aria-labelledby="contact-heading">');
    expect(markup).toContain('data-close-help aria-label="Close About"');
    expect(markup).toContain('data-close-help aria-label="Close Contact and Feedback"');
    expect(markup).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
