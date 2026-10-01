import './styles.css';
import { carryCapacity, choose, depositCarried, discardBankItem, emptyBank, failCharacter, finishRewardResolution, forceQaEasterEgg, getCarriedItems, meets, newCharacter, openRewardResolution, placeReward, retireCharacter, runText, sceneText, setCarriedItems, startAdventure, timeStatus, withdrawBanked } from './engine';
import { ITEMS } from './items';
import { BANK_CAPACITY, bankCapacityLabel, bankCapacityMessage, emptyBankConfirmationText } from './bank';
import { showLaunchSplash } from './launchSplash';
import { contactMailto, feedbackAdventureTitle, renderUtilityFeatures } from './helpPanels';
import { renderQaPanel } from './qaPanel';
import { getScenario, SCENARIOS } from './scenarios';
import { isQaMode, selectScenario } from './scenarioSelection';
import { EMPTY_SAVE, loadQaSave, loadSave, QA_SAVE_KEY, SAVE_KEY, saveGame, saveQaGame } from './storage';
import type { SaveData } from './types';
import { formatGlobalTotal, readGlobalTotal, submitGlobalCompletion } from './completionCounter';
import { getOrCreateHomeScene, HOME_SCENES, homeSceneIndex, setHomeSceneForSession, type SessionSceneStorage } from './homeScenes';
import { EASTER_EGGS } from './easterEggs';
import { partitionAvailableGear } from './inventoryPresentation';

const app = document.querySelector<HTMLDivElement>('#app')!;
const qaEnabled = isQaMode(window.location.search);
let state: SaveData = qaEnabled ? loadQaSave() : loadSave();
let screen: 'home' | 'play' | 'bank' | 'retire' = state.run?.status === 'active' ? 'home' : 'home';
let inventoryOpen = false;
let successRewardsOpen = state.run?.status === 'success' && state.run.rewardSelectionOpen === true;
let pendingBankDestructive: { kind: 'item'; itemId: string } | { kind: 'empty' } | null = null;
let bankConfirmReturnSelector = '#back';
const homeSceneStorage: SessionSceneStorage = (() => {
  try { return window.sessionStorage; }
  catch { return { getItem: () => null, setItem: () => undefined }; }
})();
let activeHomeScene = getOrCreateHomeScene(homeSceneStorage);
const assetBaseUrl = (import.meta as ImportMeta & { env: { BASE_URL: string } }).env.BASE_URL;
const counterEndpoint = (import.meta as ImportMeta & { env: { VITE_GLOBAL_COMPLETION_COUNTER_URL?: string } }).env.VITE_GLOBAL_COMPLETION_COUNTER_URL ?? '';
let globalTotal: number | null = null;
let globalTotalRequested = false;
let completionFlushRunning = false;

function persist(): void { qaEnabled ? saveQaGame(state) : saveGame(state); }
function itemName(id: string): string { return ITEMS[id]?.name ?? id; }
function safeText(text: string): string { return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
function activeScenario() { return state.run ? getScenario(state.run.scenarioId) : undefined; }
function startScenario(scenarioId: string): void {
  if (state.run?.status === 'active') return;
  const scenario = getScenario(scenarioId);
  if (!scenario) return;
  state = startAdventure(state, scenario, Math.random, qaEnabled);
  persist(); screen = 'play'; inventoryOpen = false; successRewardsOpen = false; render();
}

function bindQaPanel(): void {
  if (!qaEnabled) return;
  document.querySelectorAll<HTMLButtonElement>('[data-qa-start]').forEach((button) => button.addEventListener('click', () => startScenario(button.dataset.qaStart!)));
  document.querySelector('[data-qa-clear-run]')?.addEventListener('click', () => { state.run = null; persist(); screen = 'home'; render(); });
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
  document.querySelector('[data-qa-reset-character]')?.addEventListener('click', () => { state.character = null; state.run = null; persist(); screen = 'home'; render(); });
  document.querySelector('[data-qa-clear-save]')?.addEventListener('click', () => {
    localStorage.removeItem(QA_SAVE_KEY); state = structuredClone(EMPTY_SAVE); screen = 'home'; render();
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
    if (carried.includes(itemId) || carried.length >= carryCapacity(state.character.adventuresCompleted)) return;
    setCarriedItems(state.character, [...carried, itemId]);
    state.run.inventory = [...new Set([...state.run.inventory, itemId])];
    state.run.acquiredThisRun = [...new Set([...state.run.acquiredThisRun, itemId])];
    persist(); render();
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
  app.innerHTML = `<main class="app-shell ${extra}"${style ? ` style="${style}"` : ''}>${content}${renderUtilityFeatures(feedbackAdventureTitle(state, SCENARIOS))}${renderQaPanel(qaEnabled, state, SCENARIOS, ITEMS)}<footer><span>MIRPWORKS · v0.1</span><span>Saved on this device</span></footer></main>`;
  document.querySelectorAll<HTMLButtonElement>('[data-open-help]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.querySelector<HTMLDialogElement>(`#${button.dataset.openHelp}-dialog`);
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-close-help]').forEach((button) => button.addEventListener('click', () => {
    button.closest('dialog')?.close();
  }));
  document.querySelector<HTMLSelectElement>('[data-feedback-category]')?.addEventListener('change', (event) => {
    const category = (event.currentTarget as HTMLSelectElement).value;
    const email = document.querySelector<HTMLAnchorElement>('[data-contact-email]');
    if (email) email.href = contactMailto(feedbackAdventureTitle(state, SCENARIOS), category || undefined);
  });
  bindQaPanel();
}

function homeSceneStyle(): string {
  return `--home-scene-art:url(${assetBaseUrl}home-scenes/${activeHomeScene.file})`;
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
    activeHomeScene = setHomeSceneForSession(homeSceneStorage, HOME_SCENES[index].id) ?? activeHomeScene;
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
  if (state.run?.status === 'active') {
    const scenario = activeScenario();
    const character = state.character!;
    shell(`<section class="resume-card"><div class="eyebrow">An adventure waits</div><h1>Where were we?</h1><p>Your journey through <strong>${scenario?.title ?? 'an unfinished adventure'}</strong> is still waiting. Closing the page never abandons a run.</p><p class="traveler-ending-count">${character.adventuresCompleted} adventures completed · Carry capacity: ${carryCapacity(character.adventuresCompleted)}</p><div class="stack"><button class="primary" id="continue">Continue Adventure</button><button class="danger-ghost" id="abandon">Abandon Adventure</button></div><p class="fine-print">Abandoning is a failed run. This character, carried gear, money, lore, knowledge, and personal history will be lost. Banked items remain safe.</p></section>${homeSceneQaControls()}`, 'centered home-screen resume-home', homeSceneStyle());
    bindHomeSceneQaControls();
    document.querySelector('#continue')!.addEventListener('click', () => { screen = 'play'; render(); });
    document.querySelector('#abandon')!.addEventListener('click', () => {
      if (confirm('Abandon this adventure? Your active character and everything not banked will be lost.')) { state = failCharacter(state); persist(); render(); }
    });
    return;
  }

  const hasCharacter = Boolean(state.character);
  if (counterEndpoint && !globalTotalRequested) {
    globalTotalRequested = true;
    void readGlobalTotal(counterEndpoint).then((total) => { globalTotal = Math.max(globalTotal ?? 0, total); if (screen === 'home' && !state.run) render(); }).catch(() => { /* Counter outages never affect play. */ });
  }
  const counterLabel = globalTotal === null ? '' : `<p class="global-completions">Adventures completed by travelers: ${formatGlobalTotal(globalTotal)}</p>`;
  const travelerStatus = state.character ? `<section class="traveler-status" aria-label="Traveler progress"><strong>${state.character.adventuresCompleted} adventure${state.character.adventuresCompleted === 1 ? '' : 's'} completed</strong><span>Carry capacity: ${carryCapacity(state.character.adventuresCompleted)} item${carryCapacity(state.character.adventuresCompleted) === 1 ? '' : 's'}</span>${state.character.adventuresCompleted < 20 ? `<small>Next carry slot at ${state.character.adventuresCompleted < 10 ? 10 : 20}</small>` : ''}</section>` : '';
  shell(`<header class="masthead"><div class="brand-mark" aria-hidden="true">LG</div><div><div class="eyebrow">A Mirpworks adventure</div><h1>Let’s Go,<br><em>Shall We?</em></h1></div></header>
    <section class="start-card"><p>${hasCharacter ? `Welcome back, ${safeText(state.character!.name)}. A new journey is waiting.` : 'A little adventure is waiting.'}</p><button class="primary" id="begin">Begin Adventure</button></section>${travelerStatus}
    <nav class="home-tools" aria-label="Character options"><button id="bank">${icon('bank')}<span>Bank</span><small>${bankCapacityLabel(state.bank.length)} stored</small></button>${hasCharacter ? `<button id="retire"><span class="retire-icon">◇</span><span>Retire</span><small>${state.character!.name}</small></button>` : ''}</nav>${counterLabel}${homeSceneQaControls()}`, 'home-screen', homeSceneStyle());
  bindHomeSceneQaControls();
  document.querySelector('#begin')!.addEventListener('click', () => {
    const scenario = selectScenario(SCENARIOS, state.recentScenarioIds ?? state.mostRecentScenarioId);
    if (scenario) startScenario(scenario.id);
  });
  document.querySelector('#bank')!.addEventListener('click', () => { screen = 'bank'; render(); });
  document.querySelector('#retire')?.addEventListener('click', () => { screen = 'retire'; render(); });
}

function renderPlay(): void {
  const run = state.run;
  const character = state.character;
  if (!run || !character) { screen = 'home'; return render(); }
  const scenario = activeScenario();
  if (!scenario) { state.run = null; persist(); screen = 'home'; return render(); }
  if (run.status === 'death') return renderDeath();
  if (run.status === 'success') return renderSuccess();
  const scene = scenario.scenes[run.sceneId];
  const choices = scene.choices.filter((choice) => meets(choice.requirements, state));
  const timing = timeStatus(scenario, run.elapsedMinutes ?? 0);
  const healthPct = (run.health / character.maxHealth) * 100;
  const carriedItems = getCarriedItems(character);
  const capacity = carryCapacity(character.adventuresCompleted);
  const gear = partitionAvailableGear(run.inventory, carriedItems, run.inventorySources);
  const gearSection = (title: string, ids: string[], getDetails: (id: string) => string) => ids.length ? `<section class="gear-group"><h3>${title}</h3>${ids.map((id) => `<article><strong>${safeText(itemName(id))}</strong><small>${safeText(getDetails(id))}</small></article>`).join('')}</section>` : '';
  shell(`<header class="play-header"><div><span class="eyebrow">${scenario.title}</span><span class="scene-count">${scene.title}</span></div><button class="icon-button" id="inventory" aria-expanded="${inventoryOpen}" aria-label="Carried gear: ${carriedItems.length} of ${capacity} slots used">${icon('bag')}<span>${carriedItems.length}/${capacity}</span><b class="sr-only">Available Gear</b></button></header>
    <section class="status-row"><div class="health-block">${icon('heart')}<strong>${run.health}/${character.maxHealth}</strong><div class="health-track"><i style="width:${healthPct}%"></i></div></div><div class="money">${icon('coin')}<strong>${character.money}</strong></div></section>
    ${inventoryOpen ? `<aside class="inventory-panel" aria-label="Available Gear"><div><span class="eyebrow">Available Gear</span><button id="closeInventory" aria-label="Close inventory">×</button></div><p class="carry-usage">Carried by traveler · ${carriedItems.length}/${capacity} slots used</p>${gearSection('Carried gear', gear.carried, (id) => ITEMS[id]?.description ?? '')}${gearSection('Available this adventure', gear.available.map(({ id }) => id), (id) => { const item = gear.available.find((entry) => entry.id === id)!; return `${item.label} · ${ITEMS[id]?.description ?? ''}`; })}${(character.ownedAssets ?? []).length ? `<section class="gear-group owned-assets"><h3>Owned property</h3>${character.ownedAssets!.map((asset) => `<article><strong>${safeText(asset.name)}</strong><small>${safeText(asset.description)}</small></article>`).join('')}</section>` : ''}${!run.inventory.length && !(character.ownedAssets ?? []).length ? '<p class="empty">No gear or property to show.</p>' : ''}</aside>` : ''}
    <article class="story-card ${scene.tone ?? ''}"><div class="scene-ornament">${scene.tone === 'danger' ? '!' : '◆'}</div><h1>${scene.title}</h1>${timing.phase ? `<p class="story-time" aria-label="Story time: ${timing.phase.label}">${timing.phase.label}</p>` : ''}${run.message ? `<p class="result-message">${run.message}</p>` : ''}<p class="story-text">${sceneText(scene, state)}</p></article>
    <section class="choices count-${choices.length}" aria-label="Actions">${choices.map((choice) => `<button data-choice="${choice.id}"><strong>${safeText(runText(choice.label, state))}</strong>${choice.hint ? `<small>${safeText(runText(choice.hint, state))}</small>` : ''}</button>`).join('')}</section>`, `playing scenario-${scenario.id}`);
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
      let total: number;
      try { total = await submitGlobalCompletion(counterEndpoint, runId); }
      catch {
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        try { total = await submitGlobalCompletion(counterEndpoint, runId); }
        catch { continue; }
      }
      state.pendingGlobalCompletions = (state.pendingGlobalCompletions ?? []).filter((pendingId) => pendingId !== runId);
      globalTotal = Math.max(globalTotal ?? 0, total);
      persist();
    }
  } finally { completionFlushRunning = false; }
}

function renderDeath(): void {
  const scenario = activeScenario();
  const run = state.run;
  const scene = run && run.sceneId !== '__death' ? scenario?.scenes[run.sceneId] : null;
  const milestone = run?.completionMilestoneReached === 10
    ? '<p class="milestone-note">Ten adventures behind this traveler. Their journey ends here, but they learned to travel better prepared.</p>'
    : run?.completionMilestoneReached === 20 ? '<p class="milestone-note">Twenty adventures survived. This traveler knew what deserved a place in the pack.</p>' : '';
  shell(`<section class="ending death-ending"><div class="ending-mark">†</div><div class="eyebrow">The adventure ends</div><h1>${scene?.title ?? 'The Journey Ends'}</h1><p>${scene ? sceneText(scene, state) : 'Your wounds overcome you before the danger passes. Another traveler will have to take up the road.'}</p>${state.character ? `<p class="traveler-ending-count">This traveler completed ${state.character.adventuresCompleted} adventure${state.character.adventuresCompleted === 1 ? '' : 's'}.</p>` : ''}${milestone}<div class="loss-list"><span>Character lost</span><span>Gear, money, lore, and history lost</span><strong>${state.bank.length} banked item${state.bank.length === 1 ? '' : 's'} safe</strong></div><button class="primary" id="acceptDeath">Begin Again</button></section>`, 'centered ending-screen');
  document.querySelector('#acceptDeath')!.addEventListener('click', () => { state = failCharacter(state); persist(); screen = 'home'; render(); });
}

function renderSuccess(): void {
  if (successRewardsOpen && state.run?.rewardPendingItems === undefined) {
    state = openRewardResolution(state);
    persist();
  }
  const run = state.run!;
  const scenario = activeScenario()!;
  const scene = scenario.scenes[run.sceneId];
  const capacity = carryCapacity(state.character?.adventuresCompleted ?? 0);
  const milestone = run.completionMilestoneReached === 10
    ? '<p class="milestone-note">Ten adventures behind you. You’ve learned to travel better prepared. Carry capacity increased to 2 items.</p>'
    : run.completionMilestoneReached === 20 ? '<p class="milestone-note">Twenty adventures survived. You know what deserves a place in your pack. Carry capacity increased to 3 items.</p>' : '';
  if (!successRewardsOpen) {
    shell(`<section class="ending success-ending"><div class="ending-mark">✦</div><div class="eyebrow">Adventure complete</div><h1>${scene.title}</h1><p>${sceneText(scene, state)}</p>${milestone}<p class="traveler-ending-count">${state.character?.adventuresCompleted ?? 0} adventures completed · Carry capacity: ${capacity}</p><button class="primary" id="openRewards">Prepare for the road</button></section>`, 'centered ending-screen');
    document.querySelector('#openRewards')!.addEventListener('click', () => {
      state = openRewardResolution(state);
      successRewardsOpen = true;
      persist(); render();
    });
    return;
  }
  const pending = run.rewardPendingItems ?? [];
  const carried = getCarriedItems(state.character);
  const carryOpen = !!state.character && carried.length < capacity;
  const rewardId = pending[0];
  const bankAlreadyHasReward = rewardId ? state.bank.includes(rewardId) : false;
  const bankOpen = state.bank.length < BANK_CAPACITY && !bankAlreadyHasReward;
  const rewardPanel = rewardId
    ? `<h1>Keep this for the road?</h1><p><strong>${itemName(rewardId)}</strong><br>${ITEMS[rewardId]?.description ?? 'A newly earned item.'}</p><div class="reward-box"><p class="carry-selection-count">Carried: ${carried.length}/${capacity} · Bank: ${state.bank.length}/${BANK_CAPACITY}</p>${!carryOpen ? '<p class="bank-capacity-note">Your pack is full. No carried item will be replaced.</p>' : ''}${!bankOpen ? `<p class="bank-capacity-note">${bankAlreadyHasReward ? 'This item is already in the Bank.' : 'The Bank is full. No banked item will be replaced.'}</p>` : ''}<button class="primary" id="carry-reward"${carryOpen ? '' : ' disabled'}>Carry this item</button><button id="bank-reward"${bankOpen ? '' : ' disabled'}>Store this item in the Bank</button><button class="text-button" id="decline-reward">Leave this item behind</button></div>`
    : `<h1>Ready for the road</h1><p>No new persistent item remains to place. Your existing carried gear and Bank contents are unchanged.</p><button class="primary" id="finish-rewards">Complete Adventure</button>`;
  shell(`<section class="ending success-ending reward-screen"><div class="eyebrow">Prepare for the next adventure</div>${rewardPanel}</section>`, 'centered ending-screen');
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
    persist(); screen = 'home'; render();
  });
}

function renderBank(): void {
  const carried = getCarriedItems(state.character);
  const capacity = carryCapacity(state.character?.adventuresCompleted ?? 0);
  const capacityMessage = bankCapacityMessage(state.bank.length);
  const legacyCarryNote = state.bank.length > BANK_CAPACITY && carried.length ? ' Your carried items remain safe; withdraw into an open slot to reduce the saved bank.' : '';
  const emptyBankCopy = emptyBankConfirmationText(state.bank.length);
  const confirmationText = pendingBankDestructive?.kind === 'empty'
    ? emptyBankCopy
    : pendingBankDestructive?.kind === 'item'
      ? `This permanently removes ${itemName(pendingBankDestructive.itemId)} from your bank. This cannot be undone.`
      : null;
  const confirmationTitle = pendingBankDestructive?.kind === 'empty' ? 'Empty the bank?' : `Discard ${pendingBankDestructive ? itemName(pendingBankDestructive.itemId) : 'item'}?`;
  const confirmationAction = pendingBankDestructive?.kind === 'empty' ? 'Empty Bank' : 'Discard Item';
  shell(`<header class="subhead"><button class="back" id="back">← <span>Back</span></button><div><span class="eyebrow">Persistent storage</span><h1>The Bank</h1></div></header><section class="bank-note"><p>Banked items survive death and retirement. Lore, knowledge, and character history stay with a living character and cannot be stored here.</p></section>${capacityMessage ? `<section class="bank-note bank-capacity-note" role="status"><p>${safeText(capacityMessage + legacyCarryNote)}</p></section>` : ''}
    <section class="bank-section"><h2>Carried by character ${state.character ? `(${carried.length}/${capacity})` : ''}</h2>${state.character ? (carried.length ? carried.map((id) => `<article class="item-row"><div><strong>${itemName(id)}</strong><small>${ITEMS[id].description}</small></div>${state.bank.length < BANK_CAPACITY ? `<button data-deposit="${id}">Deposit</button>` : state.bank.length > BANK_CAPACITY ? '<span class="empty">Deposit unavailable while the saved bank is above capacity.</span>' : `<details class="bank-swap-options"><summary>Swap</summary><div>${state.bank.map((bankId) => `<button data-bank-swap="${bankId}" data-carried="${id}">for ${itemName(bankId)}</button>`).join('')}</div></details>`}</article>`).join('') : '<p class="empty">No items are being carried. Withdraw from the Bank to prepare for the next adventure.</p>') : '<p class="empty">No traveler is active. Withdrawing an item will prepare a new traveler for the road.</p>'}</section>
    <section class="bank-section"><h2>Safe deposit (${bankCapacityLabel(state.bank.length)})</h2>${state.bank.length ? state.bank.map((id) => `<article class="item-row bank-item-row"><div><strong>${itemName(id)}</strong><small>${ITEMS[id].description}</small></div><div class="bank-item-actions">${(!state.character || carried.length < capacity) ? `<button data-withdraw="${id}">Withdraw</button>` : ''}<button class="bank-discard" data-bank-discard="${id}" aria-label="Discard ${safeText(itemName(id))}" title="Permanently discard this banked item">Discard</button></div></article>`).join('') : '<p class="empty">Nothing has been banked yet.</p>'}</section>
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
  shell(`<section class="resume-card"><div class="eyebrow">Voluntary retirement</div><h1>Lay down the lantern?</h1><p>This survivor’s money, lore, knowledge, carry capacity, and personal history will end with their story. Banked items remain safe. Store any gear you want to preserve before retiring.</p>${carried.length ? `<div class="retirement-item"><strong>Carried gear (${carried.length})</strong>${carried.map((id) => `<span>${itemName(id)}</span>`).join('')}${state.bank.length < BANK_CAPACITY ? carried.map((id) => `<button data-retire-deposit="${id}">Bank ${itemName(id)}</button>`).join('') : '<button id="manageBank">Manage bank</button>'}</div>${retirementBankHint}` : ''}<div class="stack"><button class="danger-ghost" id="confirmRetire">Retire Character</button><button class="text-button" id="cancel">Keep Adventuring</button></div></section>`, 'centered');
  document.querySelectorAll<HTMLButtonElement>('[data-retire-deposit]').forEach((button) => button.addEventListener('click', () => { state = depositCarried(state, undefined, button.dataset.retireDeposit); persist(); render(); }));
  document.querySelector('#manageBank')?.addEventListener('click', () => { screen = 'bank'; render(); });
  document.querySelector('#confirmRetire')!.addEventListener('click', () => { state = retireCharacter(state); persist(); screen = 'home'; render(); });
  document.querySelector('#cancel')!.addEventListener('click', () => { screen = 'home'; render(); });
}

render();
void flushPendingGlobalCompletions();
showLaunchSplash();
