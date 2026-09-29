import './styles.css';
import { choose, depositCarried, failCharacter, finishSuccess, meets, retireCharacter, sceneText, startAdventure, timeStatus, withdrawBanked } from './engine';
import { ITEMS } from './items';
import { showLaunchSplash } from './launchSplash';
import { renderQaPanel } from './qaPanel';
import { getScenario, SCENARIOS } from './scenarios';
import { isQaMode, selectScenario } from './scenarioSelection';
import { EMPTY_SAVE, loadSave, SAVE_KEY, saveGame } from './storage';
import type { SaveData } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
let state: SaveData = loadSave();
let screen: 'home' | 'play' | 'bank' | 'retire' = state.run?.status === 'active' ? 'home' : 'home';
let inventoryOpen = false;
const qaEnabled = isQaMode(window.location.search);

function persist(): void { saveGame(state); }
function itemName(id: string): string { return ITEMS[id]?.name ?? id; }
function safeText(text: string): string { return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
function activeScenario() { return state.run ? getScenario(state.run.scenarioId) : undefined; }
function startScenario(scenarioId: string): void {
  if (state.run?.status === 'active') return;
  const scenario = getScenario(scenarioId);
  if (!scenario) return;
  state = startAdventure(state, scenario);
  persist(); screen = 'play'; inventoryOpen = false; render();
}

function bindQaPanel(): void {
  if (!qaEnabled) return;
  document.querySelectorAll<HTMLButtonElement>('[data-qa-start]').forEach((button) => button.addEventListener('click', () => startScenario(button.dataset.qaStart!)));
  document.querySelector('[data-qa-clear-run]')?.addEventListener('click', () => { state.run = null; persist(); screen = 'home'; render(); });
  document.querySelector('[data-qa-reset-character]')?.addEventListener('click', () => { state.character = null; state.run = null; persist(); screen = 'home'; render(); });
  document.querySelector('[data-qa-clear-save]')?.addEventListener('click', () => {
    localStorage.removeItem(SAVE_KEY); state = structuredClone(EMPTY_SAVE); screen = 'home'; render();
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

function shell(content: string, extra = ''): void {
  app.innerHTML = `<main class="app-shell ${extra}">${content}${renderQaPanel(qaEnabled, state, SCENARIOS, ITEMS)}<footer><span>MIRPWORKS · v0.1</span><span>Saved on this device</span></footer></main>`;
  bindQaPanel();
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
    shell(`<section class="resume-card"><div class="eyebrow">An adventure waits</div><h1>Where were we?</h1><p>Your journey through <strong>${scenario?.title ?? 'an unfinished adventure'}</strong> is still waiting. Closing the page never abandons a run.</p><div class="stack"><button class="primary" id="continue">Continue Adventure</button><button class="danger-ghost" id="abandon">Abandon Adventure</button></div><p class="fine-print">Abandoning is a failed run. This character, carried gear, money, lore, knowledge, and personal history will be lost. Banked items remain safe.</p></section>`, 'centered');
    document.querySelector('#continue')!.addEventListener('click', () => { screen = 'play'; render(); });
    document.querySelector('#abandon')!.addEventListener('click', () => {
      if (confirm('Abandon this adventure? Your active character and everything not banked will be lost.')) { state = failCharacter(state); persist(); render(); }
    });
    return;
  }

  const hasCharacter = Boolean(state.character);
  shell(`<header class="masthead"><div class="brand-mark" aria-hidden="true">LG</div><div><div class="eyebrow">A Mirpworks adventure</div><h1>Let’s Go,<br><em>Shall We?</em></h1></div></header>
    <section class="start-card"><p>${hasCharacter ? `Welcome back, ${safeText(state.character!.name)}. A new journey is waiting.` : 'A little adventure is waiting.'}</p><button class="primary" id="begin">Begin Adventure</button></section>
    <nav class="home-tools" aria-label="Character options"><button id="bank">${icon('bank')}<span>Bank</span><small>${state.bank.length} item${state.bank.length === 1 ? '' : 's'}</small></button>${hasCharacter ? `<button id="retire"><span class="retire-icon">◇</span><span>Retire</span><small>${state.character!.name}</small></button>` : ''}</nav>`);
  document.querySelector('#begin')!.addEventListener('click', () => {
    const scenario = selectScenario(SCENARIOS, state.mostRecentScenarioId);
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
  shell(`<header class="play-header"><div><span class="eyebrow">${scenario.title}</span><span class="scene-count">${scene.title}</span></div><button class="icon-button" id="inventory" aria-expanded="${inventoryOpen}">${icon('bag')}<span>${run.inventory.length}</span><b class="sr-only">Inventory</b></button></header>
    <section class="status-row"><div class="health-block">${icon('heart')}<strong>${run.health}/${character.maxHealth}</strong><div class="health-track"><i style="width:${healthPct}%"></i></div></div><div class="money">${icon('coin')}<strong>${character.money}</strong></div></section>
    ${inventoryOpen ? `<aside class="inventory-panel"><div><span class="eyebrow">In your pack</span><button id="closeInventory" aria-label="Close inventory">×</button></div>${run.inventory.map((id) => `<article><strong>${itemName(id)}</strong><small>${ITEMS[id].description}</small></article>`).join('')}</aside>` : ''}
    <article class="story-card ${scene.tone ?? ''}"><div class="scene-ornament">${scene.tone === 'danger' ? '!' : '◆'}</div><h1>${scene.title}</h1>${timing.phase ? `<p class="story-time" aria-label="Story time: ${timing.phase.label}">${timing.phase.label}</p>` : ''}${run.message ? `<p class="result-message">${run.message}</p>` : ''}<p class="story-text">${sceneText(scene, state)}</p></article>
    <section class="choices count-${choices.length}" aria-label="Actions">${choices.map((choice) => `<button data-choice="${choice.id}"><strong>${choice.label}</strong>${choice.hint ? `<small>${choice.hint}</small>` : ''}</button>`).join('')}</section>`, 'playing');
  document.querySelector('#inventory')!.addEventListener('click', () => { inventoryOpen = !inventoryOpen; render(); });
  document.querySelector('#closeInventory')?.addEventListener('click', () => { inventoryOpen = false; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => button.addEventListener('click', () => {
    const choice = choices.find((entry) => entry.id === button.dataset.choice)!;
    state = choose(state, scenario, choice); persist(); inventoryOpen = false; render();
  }));
}

function renderDeath(): void {
  const scenario = activeScenario();
  const run = state.run;
  const scene = run && run.sceneId !== '__death' ? scenario?.scenes[run.sceneId] : null;
  shell(`<section class="ending death-ending"><div class="ending-mark">†</div><div class="eyebrow">The adventure ends</div><h1>${scene?.title ?? 'The Journey Ends'}</h1><p>${scene ? sceneText(scene, state) : 'Your wounds overcome you before the danger passes. Another traveler will have to take up the road.'}</p><div class="loss-list"><span>Character lost</span><span>Gear, money, lore, and history lost</span><strong>${state.bank.length} banked item${state.bank.length === 1 ? '' : 's'} safe</strong></div><button class="primary" id="acceptDeath">Begin Again</button></section>`, 'centered');
  document.querySelector('#acceptDeath')!.addEventListener('click', () => { state = failCharacter(state); persist(); screen = 'home'; render(); });
}

function renderSuccess(): void {
  const run = state.run!;
  const scenario = activeScenario()!;
  const scene = scenario.scenes[run.sceneId];
  const eligible = run.acquiredThisRun.filter((id) => ITEMS[id]?.carryable && run.inventory.includes(id));
  shell(`<section class="ending success-ending"><div class="ending-mark">✦</div><div class="eyebrow">Adventure complete</div><h1>${scene.title}</h1><p>${sceneText(scene, state)}</p><div class="reward-box"><span class="eyebrow">Choose one item to carry</span><p>Everything else from this run stays behind. You can bank your choice before the next adventure.</p>${eligible.length ? eligible.map((id) => `<button data-carry="${id}"><strong>${itemName(id)}</strong><small>${ITEMS[id].description}</small></button>`).join('') : '<p class="empty">No eligible carryable items were recovered.</p>'}<button class="text-button" data-carry="">Carry nothing</button></div></section>`, 'centered');
  document.querySelectorAll<HTMLButtonElement>('[data-carry]').forEach((button) => button.addEventListener('click', () => { state = finishSuccess(state, button.dataset.carry || null); persist(); screen = 'home'; render(); }));
}

function renderBank(): void {
  const carried = state.character?.carriedItem;
  shell(`<header class="subhead"><button class="back" id="back">← <span>Back</span></button><div><span class="eyebrow">Persistent storage</span><h1>The Bank</h1></div></header><section class="bank-note"><p>Banked items survive death and retirement. Lore, knowledge, and character history stay with a living character and cannot be stored here.</p></section>
    <section class="bank-section"><h2>Carried by character</h2>${state.character ? (carried ? `<article class="item-row"><div><strong>${itemName(carried)}</strong><small>${ITEMS[carried].description}</small></div><button id="deposit">Deposit</button></article>` : '<p class="empty">The carry slot is empty.</p>') : '<p class="empty">Create a traveler to withdraw an item.</p>'}</section>
    <section class="bank-section"><h2>Safe deposit</h2>${state.bank.length ? state.bank.map((id) => `<article class="item-row"><div><strong>${itemName(id)}</strong><small>${ITEMS[id].description}</small></div>${state.character && !carried ? `<button data-withdraw="${id}">Withdraw</button>` : ''}</article>`).join('') : '<p class="empty">Nothing has been banked yet.</p>'}</section>`, 'subscreen');
  document.querySelector('#back')!.addEventListener('click', () => { screen = 'home'; render(); });
  document.querySelector('#deposit')?.addEventListener('click', () => { state = depositCarried(state); persist(); render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-withdraw]').forEach((button) => button.addEventListener('click', () => { state = withdrawBanked(state, button.dataset.withdraw!); persist(); render(); }));
}

function renderRetire(): void {
  const carried = state.character?.carriedItem;
  shell(`<section class="resume-card"><div class="eyebrow">Voluntary retirement</div><h1>Lay down the lantern?</h1><p>This survivor’s money, lore, knowledge, and personal history will end with their story. Banked items remain safe.</p>${carried ? `<div class="retirement-item"><strong>${itemName(carried)}</strong><span>is still being carried</span><button id="bankFirst">Bank it first</button></div>` : ''}<div class="stack"><button class="danger-ghost" id="confirmRetire">Retire Character</button><button class="text-button" id="cancel">Keep Adventuring</button></div></section>`, 'centered');
  document.querySelector('#bankFirst')?.addEventListener('click', () => { state = depositCarried(state); persist(); render(); });
  document.querySelector('#confirmRetire')!.addEventListener('click', () => { state = retireCharacter(state); persist(); screen = 'home'; render(); });
  document.querySelector('#cancel')!.addEventListener('click', () => { screen = 'home'; render(); });
}

render();
showLaunchSplash();
