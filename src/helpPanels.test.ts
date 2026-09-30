import { describe, expect, it } from 'vitest';
import { newCharacter, startRun } from './engine';
import { contactMailto, CONTACT_EMAIL, CONTACT_SUBJECT, renderUtilityFeatures } from './helpPanels';
import { COLD_STORAGE } from './scenarios/coldStorage';
import type { SaveData } from './types';

describe('About and Contact utilities', () => {
  it('offers both utilities on the title screen when no adventure is active', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('data-open-help="about"');
    expect(markup).toContain('data-open-help="contact"');
    expect(markup).toContain('aria-label="About"');
    expect(markup).toContain('aria-label="Contact Mirpworks"');
    expect(markup).toContain('class="utility-question" aria-hidden="true">?</span>');
    expect(markup).toContain('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">');
    expect(markup).toContain('aria-label="Help and contact utilities"');
    expect(markup).toContain('id="about-dialog"');
    expect(markup).toContain('id="contact-dialog"');
    expect(markup).toContain('Adventure: Add the story name if it applies.');
  });

  it('keeps both utilities available during an active adventure without changing state or fictional time', () => {
    const character = newCharacter();
    const state: SaveData = { version: 1, bank: ['smallKnife'], character, run: startRun(character, COLD_STORAGE) };
    state.run!.elapsedMinutes = 23;
    const before = JSON.stringify(state);
    const markup = renderUtilityFeatures(COLD_STORAGE.title);
    expect(markup).toContain('data-open-help="about"');
    expect(markup).toContain('data-open-help="contact"');
    expect(markup).toContain('<strong>Cold Storage</strong>');
    expect(JSON.stringify(state)).toBe(before);
    expect(state.run?.elapsedMinutes).toBe(23);
  });

  it('targets the public Mirpworks address with the requested subject and structured body', () => {
    const mailto = contactMailto('Cold Storage');
    expect(mailto.startsWith(`mailto:${CONTACT_EMAIL}?`)).toBe(true);
    const query = mailto.slice(mailto.indexOf('?') + 1);
    const params = new URLSearchParams(query);
    expect(params.get('subject')).toBe(CONTACT_SUBJECT);
    expect(params.get('subject')).toBe('Let’s Go, Shall We? — Feedback');
    expect(params.get('body')).toContain('Type: Bug / Story Idea / Feedback / Other');
    expect(params.get('body')).toContain('Adventure: Cold Storage');
    expect(params.get('body')).toContain('What happened / What’s your idea?');
    expect(params.get('body')).toContain('What choice did you make just before it happened?');
    expect(params.get('body')).toContain('Attach a screenshot if you have one.');
    expect(mailto).not.toContain('attach=');
  });

  it('explicitly invites screenshots and story ideas without claiming to upload attachments', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('screenshots are especially helpful');
    expect(markup).toContain('Attach one to your email if you can');
    expect(markup).toContain('this page does not upload screenshots');
    expect(markup).toContain('Weird, serious, funny, dangerous—we want to hear it.');
    expect(markup).toContain('Found a bug?');
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
  });

  it('explains persistence, one-item carry, bank, death, retirement, abandonment, and autosave accurately', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('money, lore, knowledge, carried item, and history');
    expect(markup).toContain('choose one eligible item to carry');
    expect(markup).toContain('Banked items are stored separately and survive death or retirement');
    expect(markup).toContain('If an adventurer dies or is retired');
    expect(markup).toContain('The game autosaves after meaningful choices');
    expect(markup).toContain('Closing the tab or app is safe');
    expect(markup).toContain('<strong>Abandon Adventure</strong> intentionally ends the active run');
    expect(markup).toContain('reputation through the things they’ve actually done');
    expect(markup).not.toContain('karma');
    expect(markup).not.toContain('cloud sync');
  });

  it('uses labelled native dialogs with reachable close controls and a safe external link', () => {
    const markup = renderUtilityFeatures();
    expect(markup).toContain('<dialog class="utility-dialog" id="about-dialog" aria-labelledby="about-heading">');
    expect(markup).toContain('<dialog class="utility-dialog contact-dialog" id="contact-dialog" aria-labelledby="contact-heading">');
    expect(markup).toContain('data-close-help aria-label="Close About"');
    expect(markup).toContain('data-close-help aria-label="Close Contact"');
    expect(markup).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
