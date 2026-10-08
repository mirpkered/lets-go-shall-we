import './styles.css';
import { addSupply, addUpgrade, breakItem, carryCapacity, choose, consumeSupply, depositCarried, discardBankItem, emptyBank, failCharacter, finishRewardResolution, forceQaEasterEgg, getCarriedGearItems, getCarriedItems, getCarriedRelics, itemCondition, itemState, meets, newCharacter, openRewardResolution, placeReward, RELIC_SOFT_CAPACITY, removeUpgrade, repairItem, resolveSuccessfulEndingProgress, retireCharacter, runText, sceneText, setCarriedItems, setItemCondition, setSupplyQuantity, startAdventure, SUPPLY_STACK_CAPACITY, timeStatus, withdrawBanked } from './engine';
import { inventoryClass, ITEMS } from './items';
import { BANK_CAPACITY, bankCapacityLabel, bankCapacityMessage, emptyBankConfirmationText } from './bank';
import { showLaunchSplash } from './launchSplash';
import { feedbackContext, renderUtilityFeatures } from './helpPanels';
import { normalizeFeedbackEndpoint, submitFeedback } from './feedback';
import { filterQaScenarios, renderQaPanel } from './qaPanel';
import { getScenario, SCENARIOS } from './scenarios';
import { isQaMode, selectScenario, simulateScenarioSelection } from './scenarioSelection';
import { EMPTY_SAVE, loadQaSave, loadSave, QA_SAVE_KEY, SAVE_KEY, saveGame, saveQaGame } from './storage';
import type { SaveData } from './types';
import { formatGlobalTotal, normalizeCounterEndpoint, readGlobalTotal, submitGlobalCompletionWithRetry } from './completionCounter';
import { createHomeSceneRotation, HOME_SCENE_LAST_KEY, HOME_SCENES, homeSceneIndex, QA_HOME_SCENE_LAST_KEY, type HomeScene, type HomeSceneStorage } from './homeScenes';
import { EASTER_EGGS } from './easterEggs';
import { analyzeScenarioLibrary } from './scenarioDiversity';
import { auditContentQuality } from './contentQuality';
import { travelerMemoryPreview } from './travelerMemoryPresentation';
import { blurUtilityDialogControl } from './utilityDialogFocus';
import { endedTravelerMilestoneCopy, gearCapacityMilestoneCopy } from './progressionCopy';

const app = document.querySelector<HTMLDivElement>('#app')!;
const qaEnabled = isQaMode(window.location.search);
let state: SaveData = qaEnabled ? loadQaSave() : loadSave();
let screen: 'home' | 'play' | 'bank' | 'retire' = state.run?.status === 'active' ? 'home' : 'home';
let inventoryOpen = false;
let successRewardsOpen = state.run?.status === 'success' && state.run.rewardSelectionOpen === true;
let pendingBankDestructive: { kind: 'item'; itemId: string } | { kind: 'empty' } | null = null;
let bankConfirmReturnSelector = '#back';
const homeSceneStorage: HomeSceneStorage = (() => {
  try { return window.localStorage; }
  catch { return { getItem: () => null, setItem: () => undefined }; }
})();
const homeSceneStorageKey = qaEnabled ? QA_HOME_SCENE_LAST_KEY : HOME_SCENE_LAST_KEY;
const homeSceneRotation = createHomeSceneRotation(homeSceneStorage, homeSceneStorageKey, Math.random, state.run?.homeSceneId);
let activeHomeScene = homeSceneRotation.current;
const assetBaseUrl = (import.meta as ImportMeta & { env: { BASE_URL: string } }).env.BASE_URL;
const counterEndpoint = normalizeCounterEndpoint((import.meta as ImportMeta & { env: { VITE_GLOBAL_COMPLETION_COUNTER_URL?: string } }).env.VITE_GLOBAL_COMPLETION_COUNTER_URL);
const feedbackEndpoint = normalizeFeedbackEndpoint((import.meta as ImportMeta & { env: { VITE_FEEDBACK_ENDPOINT?: string } }).env.VITE_FEEDBACK_ENDPOINT);
let globalTotal: number | null = null;
let globalTotalRequested = false;
let completionFlushRunning = false;
let counterLastRequestResult = counterEndpoint ? 'Not requested' : 'Not configured';
let qaSelectionMonth: number | null = null;

function persist(): void { qaEnabled ? saveQaGame(state) : saveGame(state); }
function itemName(id: string): string { return ITEMS[id]?.name ?? id; }
function itemStateLabel(id: string): string {
  const record = itemState(state, id);
  const condition = record.condition === 'NORMAL' ? 'Sound' : record.condition === 'DAMAGED' ? 'Damaged' : 'Broken';
  const upgrades = record.upgrades.map(({ id: upgradeId }) => ITEMS[id]?.upgrades?.find(({ id: candidateId }) => candidateId === upgradeId)?.name).filter((name): name is string => !!name);
  return [condition, ...upgrades].join(' · ');
}
function itemDescription(id: string): string {
  const provenance = itemState(state, id).provenance.at(-1);
  return `${ITEMS[id]?.description ?? ''} · ${itemStateLabel(id)}${provenance ? ` · ${provenance}` : ''}`;
}
function safeText(text: string): string { return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
function continuityMarkup(character: SaveData['character'], sectionClass = 'gear-group'): string {
  const contacts = character?.contacts ?? [];
  const favors = character?.favors ?? [];
  if (!contacts.length && !favors.length) return '';
  return `<section class="${sectionClass} traveler-connections"><h3>Contacts &amp; Favors</h3>${contacts.length ? `<div class="continuity-list"><strong>Contacts</strong>${contacts.map((contact) => `<article><strong>${safeText(contact.name)} · ${safeText(contact.role)}</strong>${contact.notes ? `<small>${safeText(contact.notes)}</small>` : ''}</article>`).join('')}</div>` : ''}${favors.length ? `<div class="continuity-list"><strong>Favors</strong>${favors.map((favor) => { const contact = contacts.find(({ id }) => id === favor.contactId); return `<article><strong>${safeText(favor.description)} · ${favor.status === 'available' ? 'Available' : 'Used'}</strong><small>${contact ? `From ${safeText(contact.name)} · ` : ''}${favor.status === 'available' ? 'A specific offer this Traveler may use once.' : 'This offer has been used.'}</small></article>`; }).join('')}</div>` : ''}</section>`;
}
function activeScenario() { return state.run ? getScenario(state.run.scenarioId) : undefined; }
function startScenario(scenarioId: string): void {
  if (state.run?.status === 'active') return;
  const scenario = getScenario(scenarioId);
  if (!scenario) return;
  state = startAdventure(state, scenario, Math.random, qaEnabled);
  if (state.run) state.run.homeSceneId = activeHomeScene.id;
  persist(); screen = 'play'; inventoryOpen = false; successRewardsOpen = false; render();
}

function bindQaPanel(): void {
  const search = document.querySelector<HTMLInputElement>('[data-qa-scenario-search]');
  if (search) {
    const entries = [...document.querySelectorAll<HTMLElement>('[data-qa-picker-entry]')];
    const count = document.querySelector<HTMLElement>('[data-qa-scenario-count]');
    const empty = document.querySelector<HTMLElement>('[data-qa-search-empty]');
    const updateScenarioSearch = () => {
      const matches = new Set(filterQaScenarios(SCENARIOS, search.value).map((scenario) => scenario.id));
      let visible = 0;
      entries.forEach((entry) => {
        const button = entry.querySelector<HTMLButtonElement>('[data-qa-start]');
        entry.hidden = !button || !matches.has(button.dataset.qaStart ?? '');
        if (!entry.hidden) visible += 1;
      });
      if (count) count.textContent = `${visible} of ${entries.length}`;
      if (empty) empty.hidden = visible !== 0;
    };
    search.addEventListener('input', updateScenarioSearch);
    document.querySelector<HTMLButtonElement>('[data-qa-clear-search]')?.addEventListener('click', () => {
      search.value = '';
      updateScenarioSearch();
      search.focus();
    });
  }
  if (!qaEnabled) return;
  document.querySelectorAll<HTMLButtonElement>('[data-qa-simulate-selection]').forEach((button) => button.addEventListener('click', () => {
    const draws = Number(button.dataset.qaSimulateSelection) === 1000 ? 1000 : 100;
    const result = simulateScenarioSelection(SCENARIOS, state.recentScenarioIds ?? [], {
      adventuresCompleted: state.character?.adventuresCompleted ?? 0,
      recentRiskHistory: state.recentRiskHistory ?? [],
      categoryHistory: state.character?.scenarioCategoryHistory ?? [],
      scenarioPlayCounts: state.character?.scenarioPlayCounts ?? {},
      character: state.character,
      ...(qaSelectionMonth !== null ? { selectionMonth: qaSelectionMonth } : {}),
    }, draws);
    const output = document.querySelector<HTMLElement>('[data-qa-selection-simulation]');
    if (!output) return;
    output.textContent = JSON.stringify({ ...result, topScenarios: Object.entries(result.scenarioCounts).sort((a, b) => b[1] - a[1]).slice(0, 30) }, null, 2);
    output.hidden = false;
  }));
  document.querySelector<HTMLSelectElement>('[data-qa-season-month]')?.addEventListener('change', (event) => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    qaSelectionMonth = value ? Number(value) : null;
    render();
  });
  document.querySelector<HTMLButtonElement>('[data-qa-diversity-report]')?.addEventListener('click', () => {
    const audit = analyzeScenarioLibrary(SCENARIOS);
    const output = document.querySelector<HTMLElement>('[data-qa-diversity-output]');
    if (!output) return;
    output.textContent = JSON.stringify({
      classified: audit.classified, total: audit.total, distributions: audit.distributions,
      historicalReferenceCounts: audit.historicalReferenceCounts,
      similarityWarningCount: audit.similarityWarnings.length, exampleSimilarityWarnings: audit.similarityWarnings.slice(0, 40),
      duplicateStructuralPatternCount: audit.structuralWarnings.length, exampleStructuralWarnings: audit.structuralWarnings.slice(0, 40),
      rows: audit.rows,
    }, null, 2);
    output.hidden = false;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-qa-start]').forEach((button) => button.addEventListener('click', () => startScenario(button.dataset.qaStart!)));
  document.querySelector('[data-qa-content-quality-report]')?.addEventListener('click', () => {
    const quality = auditContentQuality(SCENARIOS);
    const diversity = analyzeScenarioLibrary(SCENARIOS);
    const output = document.querySelector<HTMLElement>('[data-qa-content-quality-output]');
    if (!output) return;
    output.textContent = JSON.stringify({ ...quality, relatedDiversity: { repeatedStructuralPatternCount: diversity.structuralWarnings.length, exampleStructuralWarnings: diversity.structuralWarnings.slice(0, 30) } }, null, 2);
    output.hidden = false;
  });
  document.querySelector('[data-qa-clear-run]')?.addEventListener('click', () => { state.run = null; persist(); rotateHomeScene(); screen = 'home'; render(); });
  document.querySelector('[data-qa-force-easter-egg]')?.addEventListener('click', () => {
    const id = document.querySelector<HTMLSelectElement>('#qa-easter-egg')?.value;
    const egg = EASTER_EGGS.find((entry) => entry.id === id);
    if (!egg || !state.run?.qaMode) return;
    state = forceQaEasterEgg(state, egg); persist(); render();
  });
  document.querySelector('[data-qa-disable-easter-eggs]')?.addEventListener('click', () => {
    if (!state.run?.qaMode) return;
    state.run.qaEasterEggDisabled = true; persist(); render();
  });
  document.querySelector('[data-qa-enable-easter-eggs]')?.addEventListener('click', () => {
    if (!state.run?.qaMode) return;
    state.run.qaEasterEggDisabled = false; persist(); render();
  });
  document.querySelector('[data-qa-reset-character]')?.addEventListener('click', () => { state.character = null; state.run = null; persist(); rotateHomeScene(); screen = 'home'; render(); });
  document.querySelector('[data-qa-clear-save]')?.addEventListener('click', () => {
    localStorage.removeItem(QA_SAVE_KEY); state = structuredClone(EMPTY_SAVE); rotateHomeScene(); screen = 'home'; render();
  });
  document.querySelector('[data-qa-set-completions]')?.addEventListener('click', () => {
    const input = document.querySelector<HTMLInputElement>('#qa-completions');
    const count = Math.max(0, Math.floor(Number(input?.value ?? 0)));
    state.character ??= newCharacter();
    state.character.adventuresCompleted = Number.isFinite(count) ? count : 0;
    persist(); render();
  });
  document.querySelector('[data-qa-set-health]')?.addEventListener('click', () => {
    if (!state.run || !state.character) return;
    const input = document.querySelector<HTMLInputElement>('#qa-health');
    const health = Math.max(0, Math.min(state.character.maxHealth, Number(input?.value ?? 10)));
    state.run.health = health;
    if (health === 0) { state.run.status = 'death'; state.run.sceneId = '__death'; state.run.visitedSceneIds = [...new Set([...(state.run.visitedSceneIds ?? []), '__death'])]; }
    persist(); render();
  });
  document.querySelector('[data-qa-set-time]')?.addEventListener('click', () => {
    if (!state.run || state.run.status !== 'active') return;
    const input = document.querySelector<HTMLInputElement>('#qa-time');
    const elapsed = Number(input?.value ?? 0);
    state.run.elapsedMinutes = Number.isFinite(elapsed) ? Math.max(0, Math.floor(elapsed)) : 0;
    persist(); render();
  });
  document.querySelector('[data-qa-reset-time]')?.addEventListener('click', () => {
    if (!state.run || state.run.status !== 'active') return;
    state.run.elapsedMinutes = 0;
    persist(); render();
  });
  document.querySelector('[data-qa-add-item]')?.addEventListener('click', () => {
    const itemId = document.querySelector<HTMLSelectElement>('#qa-item')?.value;
    if (!state.run || !itemId || !ITEMS[itemId]?.carryable) return;
    state.run.inventory = [...new Set([...state.run.inventory, itemId])];
    state.run.acquiredThisRun = [...new Set([...state.run.acquiredThisRun, itemId])];
    persist(); render();
  });
  document.querySelector('[data-qa-add-carried]')?.addEventListener('click', () => {
    const itemId = document.querySelector<HTMLSelectElement>('#qa-item')?.value;
    if (!state.run || !state.character || !itemId || !ITEMS[itemId]?.carryable) return;
    const carried = getCarriedItems(state.character);
    if (carried.includes(itemId) || (inventoryClass(itemId) === 'GEAR' && getCarriedGearItems(state.character).length >= carryCapacity(state.character.adventuresCompleted))) return;
    setCarriedItems(state.character, [...carried, itemId]);
    state.run.inventory = [...new Set([...state.run.inventory, itemId])];
    state.run.acquiredThisRun = [...new Set([...state.run.acquiredThisRun, itemId])];
    persist(); render();
  });
  document.querySelector('[data-qa-set-item-condition]')?.addEventListener('click', () => {
    const itemId = document.querySelector<HTMLSelectElement>('#qa-item')?.value;
    const condition = document.querySelector<HTMLSelectElement>('#qa-item-condition')?.value as 'NORMAL' | 'DAMAGED' | 'BROKEN' | undefined;
    if (!itemId || !condition) return;
    state = setItemCondition(state, itemId, condition); persist(); render();
  });
  document.querySelector('[data-qa-break-item]')?.addEventListener('click', () => {
    const itemId = document.querySelector<HTMLSelectElement>('#qa-item')?.value;
    if (!itemId) return;
    state = breakItem(state, itemId); persist(); render();
  });
  document.querySelector('[data-qa-repair-item]')?.addEventListener('click', () => {
    const itemId = document.querySelector<HTMLSelectElement>('#qa-item')?.value;
    if (!itemId) return;
    state = repairItem(state, itemId, 'QA repair'); persist(); render();
  });
  document.querySelector('[data-qa-add-upgrade]')?.addEventListener('click', () => {
    const choice = document.querySelector<HTMLSelectElement>('#qa-upgrade')?.value;
    if (!choice) return;
    const [itemId, upgradeId] = choice.split(':');
    state = addUpgrade(state, itemId, upgradeId, 'QA test'); persist(); render();
  });
  document.querySelector('[data-qa-remove-upgrade]')?.addEventListener('click', () => {
    const choice = document.querySelector<HTMLSelectElement>('#qa-upgrade')?.value;
    if (!choice) return;
    const [itemId, upgradeId] = choice.split(':');
    state = removeUpgrade(state, itemId, upgradeId); persist(); render();
  });
  document.querySelector('[data-qa-remove-carried]')?.addEventListener('click', () => {
    const itemId = document.querySelector<HTMLSelectElement>('#qa-item')?.value;
    if (!state.run || !state.character || !itemId || !getCarriedItems(state.character).includes(itemId)) return;
    setCarriedItems(state.character, getCarriedItems(state.character).filter((id) => id !== itemId));
    state.run.inventory = state.run.inventory.filter((id) => id !== itemId);
    state.run.acquiredThisRun = state.run.acquiredThisRun.filter((id) => id !== itemId);
    if (!state.bank.includes(itemId)) delete state.itemStates?.[itemId];
    persist(); render();
  });
  document.querySelector('[data-qa-set-gear-capacity]')?.addEventListener('click', () => {
    const capacity = Number(document.querySelector<HTMLSelectElement>('#qa-gear-capacity')?.value ?? 1);
    if (!state.character || ![1, 2, 3].includes(capacity)) return;
    state.character.adventuresCompleted = capacity === 1 ? Math.min(9, state.character.adventuresCompleted) : capacity === 2 ? Math.max(10, Math.min(19, state.character.adventuresCompleted)) : Math.max(20, state.character.adventuresCompleted);
    persist(); render();
  });
  document.querySelector('[data-qa-add-supply]')?.addEventListener('click', () => {
    const id = document.querySelector<HTMLSelectElement>('#qa-supply')?.value;
    const qty = Math.max(1, Math.floor(Number(document.querySelector<HTMLInputElement>('#qa-supply-quantity')?.value ?? 1)));
    if (!id || !state.character) return;
    state = addSupply(state, id, qty); persist(); render();
  });
  document.querySelector('[data-qa-set-supply]')?.addEventListener('click', () => {
    const id = document.querySelector<HTMLSelectElement>('#qa-supply')?.value;
    const qty = Math.max(0, Math.floor(Number(document.querySelector<HTMLInputElement>('#qa-supply-quantity')?.value ?? 0)));
    if (!id || !state.character) return;
    state = setSupplyQuantity(state, id, qty); persist(); render();
  });
  document.querySelector('[data-qa-consume-supply]')?.addEventListener('click', () => {
    const id = document.querySelector<HTMLSelectElement>('#qa-supply')?.value;
    const qty = Math.max(1, Math.floor(Number(document.querySelector<HTMLInputElement>('#qa-supply-quantity')?.value ?? 1)));
    if (!id || !state.character) return;
    state = consumeSupply(state, id, qty); persist(); render();
  });
}
function icon(name: 'bag' | 'bank' | 'heart' | 'coin'): string {
  const paths = {
    bag: '<path d="M7 8h10l1 11H6L7 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    bank: '<path d="m3 9 9-5 9 5"/><path d="M5 10v8m5-8v8m4-8v8m5-8v8M3 20h18"/>',
    heart: '<path d="M20.8 5.7c-1.8-2-4.9-2-6.8 0L12 8l-2-2.3c-1.9-2-5-2-6.8 0-1.7 1.9-1.6 4.9.2 6.7L12 21l8.6-8.6c1.8-1.8 1.9-4.8.2-6.7Z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10m3-8.5h-4.5a2 2 0 0 0 0 4H14a2 2 0 0 1 0 4H9"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function shell(content: string, extra = '', style = ''): void {
  app.innerHTML = `<main class="app-shell ${extra}"${style ? ` style="${style}"` : ''}>${content}${renderQaPanel(qaEnabled, state, SCENARIOS, ITEMS, qaSelectionMonth, counterDiagnostics())}${renderUtilityFeatures(feedbackContext(state, SCENARIOS, qaEnabled, window.innerWidth))}<footer><span>MIRPWORKS · v0.1</span><span>Saved on this device</span></footer></main>`;
  document.querySelectorAll<HTMLButtonElement>('[data-open-help]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.querySelector<HTMLDialogElement>(`#${button.dataset.openHelp}-dialog`);
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelectorAll<HTMLDialogElement>('.utility-dialog').forEach((dialog) => {
    const releaseFocusedControl = () => {
      const active = document.activeElement;
      blurUtilityDialogControl(dialog, active instanceof HTMLElement ? active : null);
    };
    // Escape/cancel and native close paths should not leave a text control focused in a closed modal.
    dialog.addEventListener('cancel', releaseFocusedControl);
    dialog.addEventListener('close', releaseFocusedControl);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-close-help]').forEach((button) => button.addEventListener('click', () => {
    const dialog = button.closest<HTMLDialogElement>('dialog');
    if (!dialog) return;
    const active = document.activeElement;
    blurUtilityDialogControl(dialog, active instanceof HTMLElement ? active : null);
    dialog.close();
  }));
  document.querySelector<HTMLFormElement>('[data-feedback-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity() || form.dataset.sending === 'true') return;
    const status = form.querySelector<HTMLElement>('[data-feedback-status]');
    const submit = form.querySelector<HTMLButtonElement>('[data-feedback-submit]');
    const contextText = form.dataset.context ?? '{}';
    let context;
    try { context = JSON.parse(contextText); }
    catch { if (status) status.textContent = 'Feedback context was invalid. Please close and reopen the form.'; return; }
    const data = new FormData(form);
    const replyEmail = String(data.get('replyEmail') ?? '').trim();
    const payload = {
      category: String(data.get('category') ?? ''),
      message: String(data.get('message') ?? ''),
      ...(replyEmail ? { replyEmail } : {}),
      context,
      website: String(data.get('website') ?? ''),
    };
    form.dataset.sending = 'true';
    form.setAttribute('aria-busy', 'true');
    if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
    if (status) status.textContent = 'Sending your feedback…';
    void submitFeedback(feedbackEndpoint, payload)
      .then(() => {
        if (status) status.textContent = 'Thanks — your feedback was sent.';
        form.dataset.sent = 'true';
        if (submit) submit.textContent = 'Sent';
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach((field) => { field.disabled = true; });
      })
      .catch((error: unknown) => {
        if (status) status.textContent = error instanceof Error ? error.message : 'We could not send that just now. Your message is still here; please try again.';
      })
      .finally(() => {
        form.dataset.sending = 'false';
        form.removeAttribute('aria-busy');
        if (submit && form.dataset.sent !== 'true') { submit.disabled = false; submit.textContent = 'Try again'; }
      });
  });
  bindQaPanel();
}

function homeSceneStyle(scene: HomeScene = activeHomeScene): string {
  return `--home-scene-art:url(${assetBaseUrl}home-scenes/${scene.file});--home-scene-position:${scene.focalPosition}`;
}

function activeRunHomeScene(): HomeScene {
  const run = state.run;
  const assigned = run && HOME_SCENES.find(({ id }) => id === run.homeSceneId);
  if (assigned) return assigned;
  if (run) {
    run.homeSceneId = activeHomeScene.id;
    persist();
  }
  return activeHomeScene;
}

function rotateHomeScene(): void {
  activeHomeScene = homeSceneRotation.enterHome();
}

function homeSceneQaControls(): string {
  if (!qaEnabled) return '';
  const index = homeSceneIndex(activeHomeScene.id);
  return `<section class="qa-home-scene" aria-label="QA home scene preview"><div><span class="eyebrow">QA · Home scene</span><strong>${safeText(activeHomeScene.name)}</strong><small>${index + 1} of ${HOME_SCENES.length} · ${safeText(activeHomeScene.description)}</small></div><div class="qa-home-scene-actions"><button type="button" data-home-scene-previous aria-label="Previous home scene">Previous</button><button type="button" data-home-scene-next aria-label="Next home scene">Next</button></div></section>`;
}

function bindHomeSceneQaControls(): void {
  if (!qaEnabled) return;
  const move = (direction: number) => {
    const index = (homeSceneIndex(activeHomeScene.id) + direction + HOME_SCENES.length) % HOME_SCENES.length;
    activeHomeScene = homeSceneRotation.preview(HOME_SCENES[index].id) ?? activeHomeScene;
    renderHome();
  };
  document.querySelector('[data-home-scene-previous]')?.addEventListener('click', () => move(-1));
  document.querySelector('[data-home-scene-next]')?.addEventListener('click', () => move(1));
}

function render(): void {
  if (screen === 'play') return renderPlay();
  if (screen === 'bank') return renderBank();
  if (screen === 'retire') return renderRetire();
  if (state.run?.status === 'death') return renderDeath();
  if (state.run?.status === 'success') return renderSuccess();
  renderHome();
}

function renderHome(): void {
  requestGlobalTotal();
  if (state.run?.status === 'active') {
    const scenario = activeScenario();
    const character = state.character!;
    const runScene = activeRunHomeScene();
    shell(`<section class="resume-card"><div class="eyebrow">An adventure waits</div><h1>Where were we?</h1><p>Your journey through <strong>${scenario?.title ?? 'an unfinished adventure'}</strong> is still waiting. Closing the page never abandons a run.</p><p class="traveler-ending-count">${character.adventuresCompleted} adventures completed · Gear capacity: ${carryCapacity(character.adventuresCompleted)}</p><div class="stack"><button class="primary" id="continue">Continue Adventure</button><button class="danger-ghost" id="abandon">Abandon Adventure</button></div><p class="fine-print">Abandoning is a failed run. This character, all unbanked gear, relics, supplies, money, lore, knowledge, and personal history will be lost. Banked items remain safe.</p></section>${homeSceneQaControls()}`, 'centered home-screen resume-home', homeSceneStyle(runScene));
    bindHomeSceneQaControls();
    document.querySelector('#continue')!.addEventListener('click', () => { screen = 'play'; render(); });
    document.querySelector('#abandon')!.addEventListener('click', () => {
      if (confirm('Abandon this adventure? Your active character and everything not banked will be lost.')) { state = failCharacter(state); persist(); rotateHomeScene(); render(); }
    });
    return;
  }

  const hasCharacter = Boolean(state.character);
  const counterLabel = globalTotal === null ? '' : `<p class="global-completions" role="status" aria-live="polite" aria-atomic="true">Adventures completed by travelers: ${formatGlobalTotal(globalTotal)}</p>`;
  const homeRelicCount = getCarriedRelics(state.character).length;
  const travelerStatus = state.character ? `<section class="traveler-status" aria-label="Traveler progress"><strong>${state.character.adventuresCompleted} adventure${state.character.adventuresCompleted === 1 ? '' : 's'} completed</strong><span>Gear capacity: ${carryCapacity(state.character.adventuresCompleted)} slot${carryCapacity(state.character.adventuresCompleted) === 1 ? '' : 's'}</span><small>Supplies: ${Object.values(state.character.supplies ?? {}).filter((qty) => qty > 0).length}/${SUPPLY_STACK_CAPACITY} stacks · Relics: ${homeRelicCount}${homeRelicCount >= RELIC_SOFT_CAPACITY ? ' (unusually many)' : ''}</small>${state.character.adventuresCompleted < 20 ? `<small>Next Gear slot at ${state.character.adventuresCompleted < 10 ? 10 : 20}</small>` : ''}${(state.character.ownedAssets ?? []).length ? `<small class="owned-property-summary">Owned property: ${state.character.ownedAssets!.map(({ name }) => safeText(name)).join(', ')}</small>` : ''}</section>` : '';
  shell(`<header class="masthead"><div class="brand-mark" aria-hidden="true">LG</div><div><div class="eyebrow">A Mirpworks adventure</div><h1>Let’s Go,<br><em>Shall We?</em></h1></div></header>
    <section class="start-card"><p>${hasCharacter ? `Welcome back, ${safeText(state.character!.name)}. A new journey is waiting.` : 'A little adventure is waiting.'}</p><button class="primary" id="begin">Begin Adventure</button></section>${travelerStatus}
    <nav class="home-tools${hasCharacter ? '' : ' single-tool'}" aria-label="Character options"><button id="bank">${icon('bank')}<span>Inventory &amp; Bank</span><small>${bankCapacityLabel(state.bank.length)} stored</small></button>${hasCharacter ? `<button id="retire"><span class="retire-icon">◇</span><span>Retire</span><small>${state.character!.name}</small></button>` : ''}</nav>${counterLabel}${homeSceneQaControls()}`, 'home-screen', homeSceneStyle());
  bindHomeSceneQaControls();
  document.querySelector('#begin')!.addEventListener('click', () => {
    const scenario = selectScenario(SCENARIOS, state.recentScenarioIds ?? state.mostRecentScenarioId, Math.random, {
      adventuresCompleted: state.character?.adventuresCompleted ?? 0,
      recentRiskHistory: state.recentRiskHistory,
      categoryHistory: state.character?.scenarioCategoryHistory ?? [],
      scenarioPlayCounts: state.character?.scenarioPlayCounts ?? {},
      character: state.character,
      ...(qaEnabled && qaSelectionMonth !== null ? { selectionMonth: qaSelectionMonth } : {}),
    });
    if (scenario) startScenario(scenario.id);
  });
  document.querySelector('#bank')!.addEventListener('click', () => { screen = 'bank'; render(); });
  document.querySelector('#retire')?.addEventListener('click', () => { screen = 'retire'; render(); });
}

function counterDiagnostics() {
  return {
    endpointConfigured: !!counterEndpoint,
    endpoint: counterEndpoint || null,
    currentGlobalTotal: globalTotal,
    currentRunId: state.run?.runId ?? null,
    currentRunQA: state.run?.qaMode ?? false,
    currentRunQueuedForSubmission: state.run?.globalCompletionQueued ?? false,
    pendingRetryCount: state.pendingGlobalCompletions?.length ?? 0,
    lastRequestResult: counterLastRequestResult,
  };
}

function updateCounterQaInspector(): void {
  if (!qaEnabled) return;
  const output = document.querySelector<HTMLElement>('[data-qa-counter-inspection]');
  if (output) output.textContent = JSON.stringify(counterDiagnostics(), null, 2);
}

function requestGlobalTotal(): void {
  if (!counterEndpoint || globalTotalRequested) return;
  globalTotalRequested = true;
  counterLastRequestResult = 'Loading current total';
  updateCounterQaInspector();
  void readGlobalTotal(counterEndpoint)
    .then((total) => {
      globalTotal = Math.max(globalTotal ?? 0, total);
      counterLastRequestResult = 'Current total loaded';
      updateCounterQaInspector();
      if (screen === 'home' && !state.run) render();
    })
    .catch(() => {
      counterLastRequestResult = 'Current total unavailable; play is unaffected';
      updateCounterQaInspector();
    });
}

function renderPlay(): void {
  const run = state.run;
  const character = state.character;
  if (!run || !character) { screen = 'home'; return render(); }
  const scenario = activeScenario();
  if (!scenario) { state.run = null; persist(); screen = 'home'; return render(); }
  if (run.status === 'death') return renderDeath();
  if (run.status === 'success') return renderSuccess();
  const runScene = activeRunHomeScene();
  const scene = scenario.scenes[run.sceneId];
  const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
  const timing = timeStatus(scenario, run.elapsedMinutes ?? 0);
  const healthPct = (run.health / character.maxHealth) * 100;
  const carriedItems = getCarriedItems(character);
  const carriedGear = getCarriedGearItems(character);
  const carriedRelics = getCarriedRelics(character);
  const capacity = carryCapacity(character.adventuresCompleted);
  const gearSection = (title: string, ids: string[], getDetails: (id: string) => string) => ids.length ? `<section class="gear-group"><h3>${title}</h3>${ids.map((id) => `<article><strong>${safeText(itemName(id))}</strong><small>${safeText(getDetails(id))}</small></article>`).join('')}</section>` : '';
  const availableThisRun = [...new Set(run.inventory)].filter((id) => !carriedItems.includes(id));
  const availableGear = availableThisRun.filter((id) => inventoryClass(id) === 'GEAR');
  const availableRelics = availableThisRun.filter((id) => inventoryClass(id) === 'RELIC');
  const temporary = availableThisRun.filter((id) => inventoryClass(id) === 'TEMPORARY' || ['borrowed', 'supplied', 'temporary'].includes(run.inventorySources?.[id] ?? ''));
  const supplies = Object.entries(character.supplies ?? {}).filter(([id, quantity]) => inventoryClass(id) === 'SUPPLY' && quantity > 0);
  const banked = [...new Set(state.bank)];
  const memory = travelerMemoryPreview(character.knowledge, character.lore);
  const conditionLabel = run.health < character.maxHealth ? 'Wounded during this adventure' : 'No wounds in this adventure';
  const memorySection = memory.knowledge.length || memory.lore.length
    ? `<section class="gear-group traveler-memory"><h3>Traveler’s memory</h3><p class="memory-count">${memory.knowledgeCount} learned fact${memory.knowledgeCount === 1 ? '' : 's'} · ${memory.loreCount} remembered tale${memory.loreCount === 1 ? '' : 's'}</p>${memory.knowledge.length ? `<details><summary>Recent Knowledge</summary>${memory.knowledge.map((entry) => `<p>${safeText(entry)}</p>`).join('')}</details>` : ''}${memory.lore.length ? `<details><summary>Recent Lore</summary>${memory.lore.map((entry) => `<p>${safeText(entry)}</p>`).join('')}</details>` : ''}</section>`
    : '';
  shell(`<header class="play-header"><div><span class="eyebrow">${scenario.title}</span><span class="scene-count">${scene.title}</span></div><button class="icon-button" id="inventory" aria-expanded="${inventoryOpen}" aria-label="Carried gear: ${carriedGear.length} of ${capacity} slots used">${icon('bag')}<span>${carriedGear.length}/${capacity}</span><b class="sr-only">Inventory</b></button></header>
    <section class="status-row"><div class="health-block">${icon('heart')}<strong>${run.health}/${character.maxHealth}</strong><div class="health-track"><i style="width:${healthPct}%"></i></div></div><div class="money">${icon('coin')}<strong>${character.money}</strong></div></section>
    ${inventoryOpen ? `<aside class="inventory-panel" aria-label="Traveler and possessions"><div><span class="eyebrow">${safeText(character.name)} · Traveler</span><button id="closeInventory" aria-label="Close traveler record">×</button></div><p class="carry-usage">${character.adventuresCompleted} adventures completed · Gear ${carriedGear.length}/${capacity} slots · ${character.money} coin${character.money === 1 ? '' : 's'} · Supplies ${supplies.length}/${SUPPLY_STACK_CAPACITY} stacks · Relics ${carriedRelics.length}${carriedRelics.length >= RELIC_SOFT_CAPACITY ? ' (unusually many)' : ''}</p><p class="traveler-condition" role="status">${conditionLabel}</p>${gearSection('Carried Gear', carriedGear, itemDescription) || '<section class="gear-group"><h3>Carried Gear</h3><p class="empty">No Gear carried. Starting tools do not use Gear slots.</p></section>'}${gearSection('Carried Relics', carriedRelics, itemDescription)}${supplies.length ? `<section class="gear-group"><h3>Supplies · not Bankable</h3>${supplies.map(([id, quantity]) => `<article><strong>${safeText(itemName(id))} ×${quantity}</strong><small>${safeText(ITEMS[id].description)} · stack limit ${ITEMS[id].stackLimit}</small></article>`).join('')}</section>` : ''}${(character.ownedAssets ?? []).length ? `<section class="gear-group owned-assets"><h3>Owned property</h3>${character.ownedAssets!.map((asset) => `<article><strong>${safeText(asset.name)} · Owned</strong><small>${safeText(asset.description)} · Location is not tracked here; this does not mean it is physically with you.</small></article>`).join('')}</section>` : ''}${continuityMarkup(character)}${banked.length ? `<section class="gear-group banked-items"><h3>Banked · safe deposit, not carried (${banked.length}/${BANK_CAPACITY})</h3>${banked.map((id) => `<article><strong>${safeText(itemName(id))}</strong><small>${safeText(inventoryClass(id))} · ${safeText(itemDescription(id))}</small></article>`).join('')}</section>` : ''}${memorySection}${gearSection('Available Gear · not carried', availableGear, itemDescription)}${gearSection('Available Relics · not carried', availableRelics, itemDescription)}${gearSection('Current adventure equipment · temporary', temporary, (id) => `${safeText(run.inventorySources?.[id] ?? 'Temporary')} · ${ITEMS[id]?.description ?? ''}`)}</aside>` : ''}
    <article class="story-card ${scene.tone ?? ''}"><div class="scene-ornament">${scene.tone === 'danger' ? '!' : '◆'}</div><h1>${scene.title}</h1>${timing.phase ? `<p class="story-time" aria-label="Story time: ${timing.phase.label}">${timing.phase.label}</p>` : ''}${run.message ? `<p class="result-message">${run.message}</p>` : ''}${run.supplyNotice ? `<p class="result-message">${safeText(run.supplyNotice)}</p>` : ''}<p class="story-text">${sceneText(scene, state)}</p></article>
    <section class="choices count-${choices.length}" aria-label="Actions">${choices.map((choice) => `<button data-choice="${choice.id}"><strong>${safeText(runText(choice.label, state))}</strong>${choice.hint ? `<small>${safeText(runText(choice.hint, state))}</small>` : ''}</button>`).join('')}</section>`, `playing run-background scenario-${scenario.id}`, homeSceneStyle(runScene));
  document.querySelector('#inventory')!.addEventListener('click', () => { inventoryOpen = !inventoryOpen; render(); });
  document.querySelector('#closeInventory')?.addEventListener('click', () => { inventoryOpen = false; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => button.addEventListener('click', () => {
    const choice = choices.find((entry) => entry.id === button.dataset.choice)!;
    state = choose(state, scenario, choice); persist(); inventoryOpen = false; render(); void flushPendingGlobalCompletions();
  }));
}

async function flushPendingGlobalCompletions(): Promise<void> {
  if (!counterEndpoint || completionFlushRunning) return;
  completionFlushRunning = true;
  try {
    for (const runId of [...(state.pendingGlobalCompletions ?? [])]) {
      // Older saves may have queued a success before its reward screen was resolved.
      if (state.run?.status === 'success' && state.run.runId === runId) continue;
      let total: number;
      try { total = await submitGlobalCompletionWithRetry(counterEndpoint, runId); }
      catch {
        counterLastRequestResult = 'Completion pending; service unavailable after retry';
        updateCounterQaInspector();
        continue;
      }
      state.pendingGlobalCompletions = (state.pendingGlobalCompletions ?? []).filter((pendingId) => pendingId !== runId);
      globalTotal = Math.max(globalTotal ?? 0, total);
      counterLastRequestResult = 'Completion counted or already counted';
      persist();
      updateCounterQaInspector();
      if (screen === 'home' && !state.run) render();
    }
  } finally { completionFlushRunning = false; }
}

function renderDeath(): void {
  const scenario = activeScenario();
  const run = state.run;
  const runScene = activeRunHomeScene();
  const scene = run && run.sceneId !== '__death' ? scenario?.scenes[run.sceneId] : null;
  const milestone = run?.completionMilestoneReached === 10
    ? `<p class="milestone-note">${endedTravelerMilestoneCopy(10)}</p>`
    : run?.completionMilestoneReached === 20 ? `<p class="milestone-note">${endedTravelerMilestoneCopy(20)}</p>` : '';
  shell(`<section class="ending death-ending"><div class="ending-mark">†</div><div class="eyebrow">The adventure ends</div><h1>${scene?.title ?? 'The Journey Ends'}</h1><p>${scene ? sceneText(scene, state) : 'Your wounds overcome you before the danger passes. Another traveler will have to take up the road.'}</p>${state.character ? `<p class="traveler-ending-count">This traveler completed ${state.character.adventuresCompleted} adventure${state.character.adventuresCompleted === 1 ? '' : 's'}.</p>` : ''}${milestone}<div class="loss-list"><span>Character lost</span><span>Unbanked Gear, Relics, Supplies, assets, money, lore, and history lost</span><strong>${state.bank.length} banked item${state.bank.length === 1 ? '' : 's'} safe</strong></div><button class="primary" id="acceptDeath">Begin Again</button></section>`, 'centered ending-screen run-background', homeSceneStyle(runScene));
  document.querySelector('#acceptDeath')!.addEventListener('click', () => { state = failCharacter(state); persist(); rotateHomeScene(); screen = 'home'; render(); void flushPendingGlobalCompletions(); });
}

function renderSuccess(): void {
  if (state.run?.authoredEndingRecorded && !state.run.completionCountRecorded) {
    state = resolveSuccessfulEndingProgress(state);
    persist();
  }
  if (successRewardsOpen && state.run?.rewardPendingItems === undefined) {
    state = openRewardResolution(state);
    persist();
  }
  const run = state.run!;
  const scenario = activeScenario()!;
  const scene = scenario.scenes[run.sceneId];
  const runScene = activeRunHomeScene();
  const capacity = carryCapacity(state.character?.adventuresCompleted ?? 0);
  const milestone = run.completionMilestoneReached === 10
    ? `<p class="milestone-note">${gearCapacityMilestoneCopy(10)}</p>`
    : run.completionMilestoneReached === 20 ? `<p class="milestone-note">${gearCapacityMilestoneCopy(20)}</p>` : '';
  if (!successRewardsOpen) {
    shell(`<section class="ending success-ending"><div class="ending-mark">✦</div><div class="eyebrow">Adventure complete</div><h1>${scene.title}</h1><p>${sceneText(scene, state)}</p>${milestone}<p class="traveler-ending-count">${state.character?.adventuresCompleted ?? 0} adventures completed · Gear capacity: ${capacity}</p><button class="primary" id="openRewards">Prepare for the road</button></section>`, 'centered ending-screen run-background', homeSceneStyle(runScene));
    document.querySelector('#openRewards')!.addEventListener('click', () => {
      state = openRewardResolution(state);
      successRewardsOpen = true;
      persist(); render();
    });
    return;
  }
  const pending = run.rewardPendingItems ?? [];
  const carried = getCarriedItems(state.character);
  const rewardId = pending[0];
  const carriedGear = getCarriedGearItems(state.character);
  const carryOpen = !!state.character && (!!rewardId && inventoryClass(rewardId) === 'RELIC' || carriedGear.length < capacity);
  const bankAlreadyHasReward = rewardId ? state.bank.includes(rewardId) : false;
  const bankOpen = state.bank.length < BANK_CAPACITY && !bankAlreadyHasReward;
  const rewardPanel = rewardId
    ? `<h1>Keep this for the road?</h1><p><strong>${itemName(rewardId)}</strong><br>${ITEMS[rewardId]?.description ?? 'A newly earned item.'}</p><div class="reward-box"><p class="carry-selection-count">Gear: ${carriedGear.length}/${capacity} · Relics: ${getCarriedRelics(state.character).length} · Bank: ${state.bank.length}/${BANK_CAPACITY}</p>${!carryOpen ? '<p class="bank-capacity-note">Gear capacity is full. No item will be replaced.</p>' : ''}${!bankOpen ? `<p class="bank-capacity-note">${bankAlreadyHasReward ? 'This item is already in the Bank.' : 'The Bank is full. No banked item will be replaced.'}</p>` : ''}<button class="primary" id="carry-reward"${carryOpen ? '' : ' disabled'}>Carry this item</button><button id="bank-reward"${bankOpen ? '' : ' disabled'}>Store this item in the Bank</button><button class="text-button" id="decline-reward">Leave this item behind</button></div>`
    : `<h1>Ready for the road</h1><p>No new persistent item remains to place. Your existing carried gear and Bank contents are unchanged.</p><button class="primary" id="finish-rewards">Complete Adventure</button>`;
  shell(`<section class="ending success-ending reward-screen"><div class="eyebrow">Prepare for the next adventure</div>${rewardPanel}</section>`, 'centered ending-screen run-background', homeSceneStyle(runScene));
  const chooseDestination = (destination: 'carry' | 'bank' | 'decline') => {
    if (!rewardId) return;
    state = placeReward(state, rewardId, destination);
    persist(); render();
  };
  document.querySelector('#carry-reward')?.addEventListener('click', () => chooseDestination('carry'));
  document.querySelector('#bank-reward')?.addEventListener('click', () => chooseDestination('bank'));
  document.querySelector('#decline-reward')?.addEventListener('click', () => chooseDestination('decline'));
  document.querySelector('#finish-rewards')?.addEventListener('click', () => {
    state = finishRewardResolution(state);
    if (state.run) return;
    successRewardsOpen = false;
    persist(); rotateHomeScene(); screen = 'home'; render(); void flushPendingGlobalCompletions();
  });
}

function renderBank(): void {
  const carriedGear = getCarriedGearItems(state.character);
  const carriedRelics = getCarriedRelics(state.character);
  const supplies = Object.entries(state.character?.supplies ?? {}).filter(([id, quantity]) => inventoryClass(id) === 'SUPPLY' && quantity > 0);
  const capacity = carryCapacity(state.character?.adventuresCompleted ?? 0);
  const memory = travelerMemoryPreview(state.character?.knowledge, state.character?.lore);
  const capacityMessage = bankCapacityMessage(state.bank.length);
  const legacyCarryNote = state.bank.length > BANK_CAPACITY && carriedGear.length ? ' Your carried Gear remains safe; withdraw into an open Gear slot to reduce the saved bank.' : '';
  const emptyBankCopy = emptyBankConfirmationText(state.bank.length);
  const confirmationText = pendingBankDestructive?.kind === 'empty'
    ? emptyBankCopy
    : pendingBankDestructive?.kind === 'item'
      ? `This permanently removes ${itemName(pendingBankDestructive.itemId)} from your bank. This cannot be undone.`
      : null;
  const confirmationTitle = pendingBankDestructive?.kind === 'empty' ? 'Empty the bank?' : `Discard ${pendingBankDestructive ? itemName(pendingBankDestructive.itemId) : 'item'}?`;
  const confirmationAction = pendingBankDestructive?.kind === 'empty' ? 'Empty Bank' : 'Discard Item';
  const carriedRows = (ids: string[]) => ids.map((id) => `<article class="item-row"><div><strong>${itemName(id)}</strong><small>${itemDescription(id)}</small></div>${state.bank.length < BANK_CAPACITY ? `<button data-deposit="${id}">Deposit</button>` : state.bank.length > BANK_CAPACITY ? '<span class="empty">Deposit unavailable while the saved Bank is above capacity.</span>' : `<details class="bank-swap-options"><summary>Swap</summary><div>${state.bank.map((bankId) => `<button data-bank-swap="${bankId}" data-carried="${id}">for ${itemName(bankId)}</button>`).join('')}</div></details>`}</article>`).join('');
  shell(`<header class="subhead"><button class="back" id="back">← <span>Back</span></button><div><span class="eyebrow">${state.character ? `${safeText(state.character.name)} · Traveler record` : 'Traveler inventory'}</span><h1>Inventory &amp; Bank</h1></div></header>${state.character ? `<section class="bank-note traveler-overview" aria-label="Traveler progress"><p><strong>${state.character.adventuresCompleted} adventures completed</strong> · ${state.character.money} coin${state.character.money === 1 ? '' : 's'} · Gear capacity ${capacity} slot${capacity === 1 ? '' : 's'}</p></section>` : ''}<section class="bank-note"><p>Gear and Relics may be Banked. Supplies belong to this traveler and cannot be stored. Death or retirement loses all unbanked possessions; the Bank survives.</p></section>${capacityMessage ? `<section class="bank-note bank-capacity-note" role="status"><p>${safeText(capacityMessage + legacyCarryNote)}</p></section>` : ''}
    <section class="bank-section"><h2>Gear (${carriedGear.length}/${capacity} slots)</h2>${carriedGear.length ? carriedRows(carriedGear) : '<p class="empty">No Gear carried. Starting tools do not use Gear slots.</p>'}</section>
    ${carriedRelics.length ? `<section class="bank-section"><h2>Relics (${carriedRelics.length}; separate from Gear capacity${carriedRelics.length >= RELIC_SOFT_CAPACITY ? ', unusually many' : ''})</h2>${carriedRows(carriedRelics)}</section>` : ''}
    <section class="bank-section"><h2>Supplies (${supplies.length}/${SUPPLY_STACK_CAPACITY} stacks · character-bound)</h2>${supplies.length ? supplies.map(([id, quantity]) => `<article class="item-row"><div><strong>${itemName(id)} ×${quantity}</strong><small>${safeText(ITEMS[id].description)} · limit ${ITEMS[id].stackLimit}; never Banked</small></div></article>`).join('') : '<p class="empty">No persistent Supplies.</p>'}</section>
    ${(state.character?.ownedAssets ?? []).length ? `<section class="bank-section"><h2>Owned assets</h2>${state.character!.ownedAssets!.map((asset) => `<article class="item-row"><div><strong>${safeText(asset.name)}</strong><small>${safeText(asset.description)} · character-bound, not Bankable</small></div></article>`).join('')}</section>` : ''}
    ${continuityMarkup(state.character, 'bank-section')}
    <section class="bank-section traveler-memory"><h2>Traveler’s memory</h2><p class="empty">${memory.knowledgeCount} learned fact${memory.knowledgeCount === 1 ? '' : 's'} · ${memory.loreCount} remembered tale${memory.loreCount === 1 ? '' : 's'}</p>${memory.knowledge.length ? `<details><summary>Recent Knowledge</summary>${memory.knowledge.map((entry) => `<p>${safeText(entry)}</p>`).join('')}</details>` : '<p class="empty">No Knowledge recorded yet.</p>'}${memory.lore.length ? `<details><summary>Recent Lore</summary>${memory.lore.map((entry) => `<p>${safeText(entry)}</p>`).join('')}</details>` : '<p class="empty">No Lore recorded yet.</p>'}</section>
    <section class="bank-section"><h2>Safe deposit (${bankCapacityLabel(state.bank.length)})</h2>${state.bank.length ? state.bank.map((id) => `<article class="item-row bank-item-row"><div><strong>${itemName(id)}</strong><small>${safeText(inventoryClass(id))} · ${itemDescription(id)}</small></div><div class="bank-item-actions">${(!state.character || inventoryClass(id) !== 'GEAR' || carriedGear.length < capacity) ? `<button data-withdraw="${id}">Withdraw</button>` : ''}<button class="bank-discard" data-bank-discard="${id}" aria-label="Discard ${safeText(itemName(id))}" title="Permanently discard this banked item">Discard</button></div></article>`).join('') : '<p class="empty">Nothing has been banked yet.</p>'}</section>
    ${emptyBankCopy ? `<section class="bank-destructive-controls"><div><h2>Permanent disposal</h2><p>Discard stored items permanently. This cannot be undone.</p></div><button type="button" class="bank-discard bank-empty-button" id="empty-bank">Empty Bank</button></section>` : ''}
    ${confirmationText ? `<dialog class="bank-confirm-dialog" id="bank-confirm-dialog" aria-labelledby="bank-confirm-title" aria-describedby="bank-confirm-message"><div class="bank-confirm-content"><span class="eyebrow">Permanent disposal</span><h2 id="bank-confirm-title">${safeText(confirmationTitle)}</h2><p id="bank-confirm-message">${safeText(confirmationText)}</p><div class="bank-confirm-actions"><button type="button" class="bank-cancel" id="cancel-bank-disposal" autofocus>Cancel</button><button type="button" class="bank-discard bank-confirm-destructive" id="confirm-bank-disposal">${confirmationAction}</button></div></div></dialog>` : ''}`, 'subscreen');
  document.querySelector('#back')!.addEventListener('click', () => { screen = 'home'; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-deposit]').forEach((button) => button.addEventListener('click', () => { state = depositCarried(state, undefined, button.dataset.deposit); persist(); render(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-bank-swap]').forEach((button) => button.addEventListener('click', () => { state = depositCarried(state, button.dataset.bankSwap, button.dataset.carried); persist(); render(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-withdraw]').forEach((button) => button.addEventListener('click', () => { state = withdrawBanked(state, button.dataset.withdraw!); persist(); render(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-bank-discard]').forEach((button) => button.addEventListener('click', () => {
    const itemId = button.dataset.bankDiscard!;
    bankConfirmReturnSelector = `[data-bank-discard="${itemId}"]`;
    pendingBankDestructive = { kind: 'item', itemId };
    renderBank();
    document.querySelector<HTMLDialogElement>('#bank-confirm-dialog')?.showModal();
  }));
  document.querySelector('#empty-bank')?.addEventListener('click', () => {
    bankConfirmReturnSelector = '#empty-bank';
    pendingBankDestructive = { kind: 'empty' };
    renderBank();
    document.querySelector<HTMLDialogElement>('#bank-confirm-dialog')?.showModal();
  });
  const confirmDialog = document.querySelector<HTMLDialogElement>('#bank-confirm-dialog');
  const cancelDisposal = () => {
    confirmDialog?.close();
    pendingBankDestructive = null;
    renderBank();
    requestAnimationFrame(() => document.querySelector<HTMLElement>(bankConfirmReturnSelector)?.focus());
  };
  document.querySelector('#cancel-bank-disposal')?.addEventListener('click', cancelDisposal);
  confirmDialog?.addEventListener('cancel', (event) => { event.preventDefault(); cancelDisposal(); });
  document.querySelector('#confirm-bank-disposal')?.addEventListener('click', () => {
    if (!pendingBankDestructive) return;
    state = pendingBankDestructive.kind === 'empty'
      ? emptyBank(state)
      : discardBankItem(state, pendingBankDestructive.itemId);
    confirmDialog?.close();
    pendingBankDestructive = null;
    persist();
    render();
  });
}

function renderRetire(): void {
  const carried = getCarriedItems(state.character);
  const retirementBankHint = carried.length && state.bank.length >= BANK_CAPACITY ? `<p class="bank-capacity-note">${safeText(bankCapacityMessage(state.bank.length) ?? '')}</p>` : '';
  shell(`<section class="resume-card"><div class="eyebrow">Voluntary retirement</div><h1>Lay down the lantern?</h1><p>This survivor’s money, lore, knowledge, Gear, Relics, Supplies, assets, and personal history will end with their story. Banked Gear and Relics remain safe. Store any equipment you want to preserve before retiring; Supplies cannot be Banked.</p>${carried.length ? `<div class="retirement-item"><strong>Unbanked equipment (${carried.length})</strong>${carried.map((id) => `<span>${itemName(id)}</span>`).join('')}${state.bank.length < BANK_CAPACITY ? carried.map((id) => `<button data-retire-deposit="${id}">Bank ${itemName(id)}</button>`).join('') : '<button id="manageBank">Manage bank</button>'}</div>${retirementBankHint}` : ''}${Object.keys(state.character?.supplies ?? {}).length ? `<p class="fine-print">Unbanked Supplies: ${Object.entries(state.character!.supplies!).filter(([, n]) => n > 0).map(([id,n]) => `${itemName(id)} ×${n}`).join(', ')} will be lost at retirement.</p>` : ''}<div class="stack"><button class="danger-ghost" id="confirmRetire">Retire Character</button><button class="text-button" id="cancel">Keep Adventuring</button></div></section>`, 'centered');
  document.querySelectorAll<HTMLButtonElement>('[data-retire-deposit]').forEach((button) => button.addEventListener('click', () => { state = depositCarried(state, undefined, button.dataset.retireDeposit); persist(); render(); }));
  document.querySelector('#manageBank')?.addEventListener('click', () => { screen = 'bank'; render(); });
  document.querySelector('#confirmRetire')!.addEventListener('click', () => { state = retireCharacter(state); persist(); rotateHomeScene(); screen = 'home'; render(); });
  document.querySelector('#cancel')!.addEventListener('click', () => { screen = 'home'; render(); });
}

render();
void flushPendingGlobalCompletions();
showLaunchSplash();
