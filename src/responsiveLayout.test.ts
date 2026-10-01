import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SCENARIOS } from './scenarios';
import { runText } from './engine';
import type { SaveData } from './types';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
const registeredScenes = SCENARIOS.flatMap((scenario) => Object.values(scenario.scenes));
const registeredVariants = registeredScenes.reduce((count, scene) => count + (scene.textVariants?.length ?? 0), 0);

function candidateCopy(): { scenario: string; scene: string; kind: string; text: string }[] {
  const candidates: { scenario: string; scene: string; kind: string; text: string }[] = [];
  for (const scenario of SCENARIOS) {
    const longestNames = Object.fromEntries((scenario.runRandomSelections ?? []).map(({ id, values }) => [
      id,
      values.map((entry) => entry.value).sort((a, b) => b.length - a.length)[0] ?? '',
    ]));
    const state = { run: { randomSelections: longestNames } } as SaveData;
    for (const scene of Object.values(scenario.scenes)) {
      candidates.push({ scenario: scenario.title, scene: scene.id, kind: 'scene text', text: runText(scene.text, state) });
      for (const [index, variant] of (scene.textVariants ?? []).entries()) {
        candidates.push({ scenario: scenario.title, scene: scene.id, kind: `text variant ${index + 1}`, text: runText(variant.text, state) });
      }
      for (const choice of scene.choices) {
        candidates.push({ scenario: scenario.title, scene: scene.id, kind: `choice ${choice.id}`, text: runText(choice.label + (choice.hint ? ` ${choice.hint}` : ''), state) });
        for (const message of [choice.chance?.successMessage, choice.chance?.failureMessage]) {
          if (message) candidates.push({ scenario: scenario.title, scene: scene.id, kind: `result ${choice.id}`, text: runText(message, state) });
        }
      }
    }
  }
  return candidates;
}

describe('global no-scroll layout contract', () => {
  it(`catalogs all ${SCENARIOS.length} adventures, ${registeredScenes.length} scenes, and ${registeredVariants} text variants`, () => {
    const candidates = candidateCopy();
    const sceneTextCount = candidates.filter((candidate) => candidate.kind === 'scene text').length;
    const variantCount = candidates.filter((candidate) => candidate.kind.startsWith('text variant')).length;
    const unresolvedNames = candidates.filter((candidate) => candidate.text.includes('{{'));

    expect(SCENARIOS.length).toBeGreaterThan(0);
    expect(sceneTextCount).toBe(registeredScenes.length);
    expect(variantCount).toBe(registeredVariants);
    expect(unresolvedNames, 'longest configured randomized names should be substituted').toEqual([]);
    expect(candidates.some((candidate) => candidate.kind.startsWith('choice'))).toBe(true);
    expect(candidates.some((candidate) => candidate.kind.startsWith('result'))).toBe(true);
  });

  it('keeps the phone shell measurable and readable instead of clipping overflow', () => {
    const phoneRules = styles.slice(styles.indexOf('@media (max-width: 559px)'), styles.indexOf('@media (max-width: 370px)'));
    const narrowPhoneRules = styles.slice(styles.indexOf('@media (max-width: 370px)'));
    expect(phoneRules).toContain('.playing .story-card { flex:none; min-width:0; min-height:0; overflow:visible;');
    expect(phoneRules).toContain('.playing .story-text { font-size:1rem; line-height:1.32;');
    expect(narrowPhoneRules).toContain('.playing .story-text { font-size:.95rem; line-height:1.3;');
    expect(phoneRules).toContain('.playing .choices button { min-width:0; min-height:3rem;');
    expect(phoneRules).toContain('.playing .choices strong { font-size:.875rem;');
    expect(phoneRules).toContain('.playing .choices.count-2,.playing .choices.count-3,.playing .choices.count-4 { grid-template-columns:1fr 1fr; }');
    expect(phoneRules).toContain('.playing .choices.count-3 button:last-child { grid-column:1/3;');
    expect(phoneRules).not.toContain('.playing { overflow:hidden;');
  });

  it('gives success prose and reward selection separate phone-sized screens', () => {
    const phoneRules = styles.slice(styles.indexOf('@media (max-width: 559px)'), styles.indexOf('@media (max-width: 370px)'));
    expect(mainSource).toContain('if (!successRewardsOpen)');
    expect(mainSource).toContain('id="carry-reward"');
    expect(mainSource).toContain('id="bank-reward"');
    expect(mainSource).toContain('id="decline-reward"');
    expect(mainSource).not.toContain('data-carry=');
    expect(mainSource).not.toContain('Manage the Bank');
    expect(phoneRules).toContain('.ending-screen { height:100vh; height:100dvh;');
    expect(phoneRules).toContain('.reward-screen .reward-box button:not(.text-button) { min-height:3rem;');
  });

  it('keeps bank disposal controls readable and confirmation bounded on narrow phones', () => {
    expect(styles).toContain('.bank-item-actions { display:flex; flex:0 0 auto; flex-direction:column;');
    expect(styles).toContain('.bank-item-actions button { width:100%; min-height:44px;');
    expect(styles).toContain('.bank-confirm-dialog { width:min(calc(100vw - 2rem), 28rem);');
    expect(mainSource).toContain('${emptyBankCopy ? `<section class="bank-destructive-controls"');
    expect(mainSource).toContain('aria-describedby="bank-confirm-message"');
    expect(mainSource).toContain('requestAnimationFrame(() => document.querySelector<HTMLElement>(bankConfirmReturnSelector)?.focus())');
  });

  it('keeps the gameplay HUD crisp above atmosphere and utilities anchored below choices', () => {
    expect(styles).toContain('.playing { position:relative; isolation:isolate; }');
    expect(styles).toContain('.playing::before { content:\'\'; position:absolute; z-index:-1;');
    expect(styles).toContain('.playing .play-header { position:relative; z-index:2; background:#10110ff2;');
    expect(styles).toContain('.playing .status-row { position:relative; z-index:1;');
    expect(styles).toContain('.icon-button span { position:absolute; top:-.4rem; right:-.4rem; min-width:1.3rem;');
    expect(styles).toContain('.playing .utility-links { flex:none; width:max-content; margin:auto auto 0;');
    expect(styles).toContain('.playing footer { margin-top:0; }');
    expect(styles).toContain('.playing .play-header > div { min-width:0; overflow-wrap:anywhere; }');
    expect(styles).toContain('padding:max(.6rem,env(safe-area-inset-top)) 1.1rem max(.6rem,env(safe-area-inset-bottom));');
    expect(styles).toContain('min-height:44px');
    expect(mainSource).toContain('${content}${renderUtilityFeatures(feedbackAdventureTitle(state, SCENARIOS))}');
    expect(mainSource).toContain('<section class="choices count-${choices.length}"');
  });

  it('keeps title-screen art session-scoped, QA-only controls hidden from players, and gameplay backdrop unchanged', () => {
    expect(mainSource).toContain('getOrCreateHomeScene(homeSceneStorage)');
    expect(mainSource).toContain('sessionStorage');
    expect(mainSource).toContain('if (!qaEnabled) return \'\';');
    expect(mainSource).toContain('data-home-scene-next');
    expect(mainSource).toContain('homeSceneQaControls()');
    expect(styles).toContain('.home-screen { position:relative; isolation:isolate; background-color:#101313;');
    expect(styles).toContain('var(--home-scene-art)');
    expect(styles).toContain('.playing { position:relative; isolation:isolate; }');
    expect(styles).toContain("url('./assets/adventure-backdrop.svg')");
    expect(styles).toContain('.qa-home-scene-actions button { min-width:3.75rem; min-height:44px;');
  });
});
