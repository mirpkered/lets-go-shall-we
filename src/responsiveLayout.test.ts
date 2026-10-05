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

  it('keeps the gameplay HUD crisp above the full-viewport run artwork and utilities anchored below choices', () => {
    expect(styles).toContain('.run-background { position:relative; isolation:isolate; background:transparent; }');
    expect(styles).toContain('.run-background::before { content:\'\'; position:fixed; z-index:-1; inset:0;');
    expect(styles).toContain('var(--home-scene-art)');
    expect(styles).toContain('.playing .play-header { position:relative; z-index:2; background:#10110fe3;');
    expect(styles).toContain('.playing .status-row { position:relative; z-index:1;');
    expect(styles).toContain('.icon-button span { position:absolute; top:-.4rem; right:-.4rem; min-width:1.3rem;');
    expect(styles).toContain('.playing .utility-links { flex:none; width:max-content; margin:auto auto 0;');
    expect(styles).toContain('.playing footer { margin-top:0; color:#c7bdab; text-shadow:0 1px 4px #000; }');
    expect(styles).toContain('.playing .play-header > div { min-width:0; overflow-wrap:anywhere; }');
    expect(styles).toContain('padding:max(.6rem,env(safe-area-inset-top)) 1.1rem max(.6rem,env(safe-area-inset-bottom));');
    expect(styles).toContain('min-height:44px');
    expect(mainSource).toContain('${content}${renderQaPanel(qaEnabled, state, SCENARIOS, ITEMS, qaSelectionMonth, counterDiagnostics())}${renderUtilityFeatures(feedbackContext(state, SCENARIOS, qaEnabled, window.innerWidth))}');
    expect(mainSource).toContain('<section class="choices count-${choices.length}"');
  });

  it('pins the chosen Home art to an adventure, restores it on resume, and isolates QA controls', () => {
    expect(mainSource).toContain('createHomeSceneRotation(homeSceneStorage, homeSceneStorageKey, Math.random, state.run?.homeSceneId)');
    expect(mainSource).toContain('homeSceneRotation.enterHome()');
    expect(mainSource).not.toContain('sessionStorage');
    const homeRenderer = mainSource.slice(mainSource.indexOf('function renderHome(): void'), mainSource.indexOf('function counterDiagnostics()'));
    expect(homeRenderer.match(/rotateHomeScene\(\)/g)).toHaveLength(1);
    expect(homeRenderer).toContain("if (confirm('Abandon this adventure? Your active character and everything not banked will be lost.')) { state = failCharacter(state); persist(); rotateHomeScene(); render(); }");
    expect(mainSource).toContain('if (!qaEnabled) return \'\';');
    expect(mainSource).toContain('data-home-scene-next');
    expect(mainSource).toContain('homeSceneQaControls()');
    expect(styles).toContain('.home-screen { position:relative; isolation:isolate; background-color:#101313;');
    expect(styles).toContain('var(--home-scene-art)');
    expect(styles).toContain('var(--home-scene-position,50% 50%)');
    expect(mainSource).toContain('state.run.homeSceneId = activeHomeScene.id');
    expect(mainSource).toContain('createHomeSceneRotation(homeSceneStorage, homeSceneStorageKey, Math.random, state.run?.homeSceneId)');
    expect(mainSource).toContain('`playing run-background scenario-${scenario.id}`, homeSceneStyle(runScene)');
    expect(mainSource.match(/centered ending-screen run-background/g)).toHaveLength(3);
    expect(styles).toContain('.run-background { position:relative; isolation:isolate; background:transparent; }');
    expect(styles).toContain("url('./assets/adventure-backdrop.svg')");
    expect(styles).toContain('.qa-home-scene-actions button { min-width:3.75rem; min-height:44px;');
  });

  it('anchors home About and Contact controls above the safe-area-aware footer', () => {
    expect(styles).toContain('.home-screen > .utility-links { flex:none; margin:auto auto .35rem; padding-top:.55rem; }');
    expect(styles).toContain('.home-screen > footer { margin-top:0; padding-top:1rem; color:#928a7c; text-shadow:0 1px 4px #000d; }');
    expect(styles).toContain('padding:clamp(1.2rem, 5vw, 2.5rem) 1.1rem max(1.25rem, env(safe-area-inset-bottom));');
    expect(styles).toContain('footer { margin-top:auto;');
    expect(mainSource.indexOf('${renderQaPanel(qaEnabled')).toBeLessThan(mainSource.indexOf('${renderUtilityFeatures(feedbackContext(state, SCENARIOS, qaEnabled, window.innerWidth))}'));
    expect(styles).toContain('.contact-field textarea { min-height:7.5rem;');
    expect(styles).toContain('.contact-form-actions { position:sticky; bottom:0; display:grid; grid-template-columns:1fr 1fr;');
  });

  it('keeps mobile text-entry controls above the iOS auto-zoom threshold without restricting page zoom', () => {
    const documentHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    expect(documentHtml).toContain('name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"');
    expect(styles).toContain('@media (max-width: 600px)');
    expect(styles).toContain('.app-shell :is(input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([tabindex="-1"]), textarea, select) { font-size:16px; }');
    expect(documentHtml).not.toMatch(/user-scalable\s*=\s*no|max(?:imum)?-scale\s*=\s*1/i);
    expect(styles).not.toMatch(/(?:^|[;\s])zoom\s*:/m);
    expect(styles).not.toContain('transform:scale(');
  });

  it('releases focused feedback controls before utility dialog dismissal', () => {
    expect(mainSource).toContain("dialog.addEventListener('cancel', releaseFocusedControl)");
    expect(mainSource).toContain("dialog.addEventListener('close', releaseFocusedControl)");
    expect(mainSource).toContain('blurUtilityDialogControl(dialog, active instanceof HTMLElement ? active : null)');
    expect(mainSource).toContain('dialog.close();');
    expect(mainSource).not.toContain('location.reload');
  });

  it('balances the lone Bank action when no traveler exists and keeps Bank/Retire as paired cards otherwise', () => {
    expect(mainSource).toContain('class="home-tools${hasCharacter ? \'\' : \' single-tool\'}"');
    expect(styles).toContain('.home-tools.single-tool { grid-template-columns:1fr; }');
    expect(styles).toContain('.home-tools { display:grid; grid-template-columns:1fr 1fr;');
    expect(mainSource).toContain('<button id="retire">');
  });

  it('keeps the active-run home card compact on the narrowest supported phone width without shrinking text', () => {
    expect(styles).toContain('@media (max-width: 370px)');
    expect(styles).toContain('.resume-card { padding:.95rem 1rem; }');
    expect(styles).toContain('.resume-card p { line-height:1.45; }');
    expect(styles).toContain('.resume-card .fine-print { margin-top:.65rem!important; line-height:1.35!important; }');
  });

  it('labels Gear slots separately from Supplies, Relics, available adventure gear, and owned property', () => {
    expect(mainSource).toContain('aria-label="Carried gear: ${carriedGear.length} of ${capacity} slots used"');
    expect(mainSource).toContain('Gear ${carriedGear.length}/${capacity}');
    expect(mainSource).toContain('Supplies ${supplies.length}/${SUPPLY_STACK_CAPACITY} stacks');
    expect(mainSource).toContain('Relics ${carriedRelics.length}');
    expect(mainSource).toContain("gearSection('Available Gear · not carried'");
    expect(mainSource).toContain('Owned property');
    expect(mainSource).toContain('Owned property: ${state.character.ownedAssets!.map');
    expect(mainSource).not.toContain('In your pack · Carried');
    expect(styles).toContain('.inventory-panel {');
    expect(styles).toContain('.inventory-panel .gear-group h3');
  });

  it('surfaces the traveler record during an adventure without changing gameplay state', () => {
    expect(mainSource).toContain('aria-label="Traveler and possessions"');
    expect(mainSource).toContain('${safeText(character.name)} · Traveler');
    expect(mainSource).toContain('adventures completed · Gear ${carriedGear.length}/${capacity} slots');
    expect(mainSource).toContain('· ${character.money} coin');
    expect(mainSource).toContain('Wounded during this adventure');
    expect(mainSource).toContain('No wounds in this adventure');
    expect(mainSource).toContain('Carried Gear');
    expect(mainSource).toContain('Supplies · not Bankable');
    expect(mainSource).toContain('Banked · safe deposit, not carried');
    expect(mainSource).toContain('Owned property');
    expect(mainSource).toContain('Location is not tracked here; this does not mean it is physically with you.');
    expect(mainSource).toContain('Recent Knowledge');
    expect(mainSource).toContain('Recent Lore');
    expect(mainSource).not.toContain('character.historyFlags.map');
    expect(mainSource).toContain("document.querySelector('#inventory')!.addEventListener('click', () => { inventoryOpen = !inventoryOpen; render(); });");
    expect(mainSource).toContain("document.querySelector('#closeInventory')?.addEventListener('click', () => { inventoryOpen = false; render(); });");
    expect(mainSource).not.toContain("document.querySelector('#inventory')!.addEventListener('click', () => { inventoryOpen = !inventoryOpen; persist();");
  });

  it('keeps the traveler drawer compact when empty and scrollable when continuity grows', () => {
    expect(mainSource).toContain("if (!contacts.length && !favors.length) return '';");
    expect(mainSource).toContain('No Gear carried. Starting tools do not use Gear slots.');
    expect(mainSource).toContain("const memorySection = memory.knowledge.length || memory.lore.length");
    expect(mainSource).toContain('Recent Knowledge');
    expect(mainSource).toContain('Recent Lore');
    expect(styles).toContain('max-height:calc(100dvh - 5.5rem - env(safe-area-inset-bottom))');
    expect(styles).toContain('overflow-y:auto; overscroll-behavior:contain;');
    expect(styles).toContain('min-width:44px; min-height:44px;');
    expect(styles).toContain('.traveler-overview');
  });
});
