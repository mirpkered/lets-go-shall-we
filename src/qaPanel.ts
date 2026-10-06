import type { Item, SaveData, Scenario } from './types';
import { carryCapacity, getCarriedGearItems, getCarriedItems, getCarriedRelics, supplyStackCount, SUPPLY_STACK_CAPACITY, timeStatus } from './engine';
import { inventoryClass } from './items';
import { BANK_CAPACITY } from './bank';
import { EASTER_EGGS } from './easterEggs';
import { scenarioRiskTier } from './riskClassification';
import { selectionDiagnostics, selectionTierSummary } from './scenarioSelection';
import { classifyScenario, getSeasonAvailability, scenarioAvailableInMonth } from './scenarioDiversity';

export interface CounterDiagnostics {
  endpointConfigured: boolean;
  endpoint: string | null;
  currentGlobalTotal: number | null;
  currentRunId: string | null;
  currentRunQA: boolean;
  currentRunQueuedForSubmission: boolean;
  pendingRetryCount: number;
  lastRequestResult: string;
}

export const QA_BUILD_ID = 'expansion-rc-2026-10-06';

function safeText(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export function renderQaPanel(enabled: boolean, state: SaveData, scenarios: Scenario[], items: Record<string, Item>, monthOverride: number | null = null, counter?: CounterDiagnostics): string {
  if (!enabled) return '';
  const run = state.run;
  const character = state.character;
  const active = run?.status === 'active';
  const scenario = scenarios.find((entry) => entry.id === run?.scenarioId);
  const timing = run && scenario ? timeStatus(scenario, run.elapsedMinutes ?? 0) : null;
  const actualDate = new Date();
  const actualMonth = actualDate.getMonth() + 1;
  const selectionMonth = monthOverride ?? actualMonth;
  const selectorPressure = { adventuresCompleted: character?.adventuresCompleted ?? 0, recentRiskHistory: state.recentRiskHistory ?? [], categoryHistory: character?.scenarioCategoryHistory ?? [], scenarioPlayCounts: character?.scenarioPlayCounts ?? {}, selectionMonth };
  const selection = selectionDiagnostics(scenarios, state.recentScenarioIds ?? state.mostRecentScenarioId, selectorPressure);
  const riskTier = run?.riskTier ?? (scenario ? scenarioRiskTier(scenario) : null);
  const inspection = {
    counter: counter ?? { endpointConfigured: false, endpoint: null, currentGlobalTotal: null, currentRunId: run?.runId ?? null, currentRunQA: !!run?.qaMode, currentRunQueuedForSubmission: !!run?.globalCompletionQueued, pendingRetryCount: state.pendingGlobalCompletions?.length ?? 0, lastRequestResult: 'Not configured' },
    scenario: run ? scenario?.title ?? run.scenarioId : null,
    riskTier,
    diversity: run && scenario ? classifyScenario(scenario) : null,
    seasonalEligibilityMonth: selectionMonth,
    seasonalEligibleNow: scenario ? scenarioAvailableInMonth(scenario, selectionMonth) : null,
    sceneId: run?.sceneId ?? null,
    visitedSceneIds: run?.visitedSceneIds ?? (run ? [run.sceneId] : []),
    randomSelections: run?.randomSelections ?? {},
    inventory: run?.inventory ?? [], carriedItems: getCarriedItems(character), inventoryClasses: Object.fromEntries(Object.keys(items).map((id) => [id, inventoryClass(id)])), supplies: character?.supplies ?? {}, itemStates: state.itemStates ?? {}, ownedAssets: character?.ownedAssets ?? [], gearCapacity: carryCapacity(character?.adventuresCompleted ?? 0), carriedGear: getCarriedGearItems(character), carriedRelics: getCarriedRelics(character), supplyStackCapacity: SUPPLY_STACK_CAPACITY, travelerAdventuresCompleted: character?.adventuresCompleted ?? null, flags: run?.flags ?? [], money: character?.money ?? null,
    health: run?.health ?? null, lore: character?.lore ?? [], knowledge: character?.knowledge ?? [], knowledgeKeys: character?.knowledgeKeys ?? [], historyFlags: character?.historyFlags ?? [], contacts: character?.contacts ?? [], favors: character?.favors ?? [], bank: state.bank, bankCount: state.bank.length, bankCapacity: BANK_CAPACITY,
    mostRecentScenarioId: state.mostRecentScenarioId ?? null,
    recentScenarioIds: state.recentScenarioIds ?? [],
    recentRiskHistory: state.recentRiskHistory ?? [],
    nextSelectionRiskWeights: selectionTierSummary(scenarios, state.recentScenarioIds ?? state.mostRecentScenarioId, selectorPressure),
    selectionCategoryHistory: character?.scenarioCategoryHistory ?? [],
    scenarioPlayCounts: character?.scenarioPlayCounts ?? {},
    nextSelection: { eligibleCount: selection.eligibleCount, seasonEligibleCount: selection.seasonEligibleCount, relaxedRecentIds: selection.relaxedRecentIds, categoryWeights: selection.categoryWeights, scenarioWeights: selection.scenarios.map(({ scenario: entry, category, tier, riskWeight, weight, seasonalWeight, historicalWeight, replayWeight, completedPlays }) => ({ id: entry.id, title: entry.title, category, tier, riskWeight, weight, seasonalWeight, historicalWeight, replayWeight, completedPlays })) },
    elapsedMinutes: run?.elapsedMinutes ?? 0,
    qualifyingStoryTransitions: run?.qualifyingStoryTransitions ?? 0,
    supplyRewardedThisRun: run?.supplyRewarded ?? false,
    qualifiesForTravelerProgression: !!run && !run.qaMode && run.completionQualification !== 'nonSubstantive' && (run.completionQualification === 'substantive' || (character?.money ?? 0) !== (run.startingMoney ?? character?.money) || JSON.stringify([...getCarriedItems(character)].sort()) !== JSON.stringify([...(run.startingCarriedItems ?? getCarriedItems(character))].sort()) || !!run.supplyRewarded),
    timePhase: timing?.phase?.label ?? null,
    nextTimeThreshold: timing?.nextThreshold ?? null,
    easterEggEvent: run?.easterEggEvent ?? null,
    qaEasterEggDisabled: run?.qaEasterEggDisabled ?? false,
    recentlySeenEasterEggs: state.recentEasterEggIds ?? [],
  };
  const highRisk = scenarios.find((entry) => scenarioRiskTier(entry) === 'HIGH');
  const severeRisk = scenarios.find((entry) => scenarioRiskTier(entry) === 'SEVERE');
  const directLaunch = active ? '<p class="qa-note">Clear the active run before launching another scenario.</p>' : `<section class="qa-risk-launches"><strong>Risk checks</strong><div class="qa-launches">${highRisk ? `<button type="button" data-qa-start="${highRisk.id}" data-risk-tier="HIGH">Start HIGH · ${highRisk.title}</button>` : ''}${severeRisk ? `<button type="button" data-qa-start="${severeRisk.id}" data-risk-tier="SEVERE">Start SEVERE · ${severeRisk.title}</button>` : ''}</div></section><div class="qa-launches">${scenarios.map((entry) => `<button type="button" data-qa-start="${entry.id}" data-risk-tier="${scenarioRiskTier(entry)}">Start ${entry.title} · ${scenarioRiskTier(entry)}</button>`).join('')}</div>`;
  const carryableItems = Object.values(items).filter((item) => item.carryable);
  const supplyItems = Object.values(items).filter((item) => inventoryClass(item.id) === 'SUPPLY');
  const itemOptions = carryableItems.map((item) => `<option value="${item.id}">${safeText(item.name)}</option>`).join('');
  const upgradeOptions = carryableItems.flatMap((item) => (item.upgrades ?? []).map((upgrade) => `<option value="${item.id}:${upgrade.id}">${safeText(item.name)} · ${safeText(upgrade.name)}</option>`)).join('');
  const activeTools = active ? `<section class="qa-timing"><strong>Fictional time</strong><span>Elapsed: ${run?.elapsedMinutes ?? 0} min</span><span>Phase: ${safeText(timing?.phase?.label ?? 'Untracked')}</span><span>Next threshold: ${timing?.nextThreshold === null ? 'none' : `${timing?.nextThreshold} min`}</span><label>Set elapsed minutes <input id="qa-time" type="number" min="0" value="${run?.elapsedMinutes ?? 0}" inputmode="numeric"></label><button type="button" data-qa-set-time>Set fictional time</button><button type="button" data-qa-reset-time>Reset fictional time</button></section><button type="button" data-qa-clear-run>Clear active run</button><label>Set health <input id="qa-health" type="number" min="0" max="${character?.maxHealth ?? 10}" value="${run?.health ?? 10}" inputmode="numeric"></label><button type="button" data-qa-set-health>Apply health</button><label>Gear or Relic <select id="qa-item">${itemOptions}</select></label><button type="button" data-qa-add-item>Force add item to run</button><button type="button" data-qa-add-carried>Force add to traveler inventory</button><button type="button" data-qa-remove-carried>Remove selected carried item</button><section class="qa-timing"><strong>Gear capacity test</strong><label>Set Gear capacity <select id="qa-gear-capacity"><option value="1">1 slot</option><option value="2">2 slots</option><option value="3">3 slots</option></select></label><button type="button" data-qa-set-gear-capacity>Apply capacity milestone</button></section><section class="qa-timing"><strong>Persistent Supplies · ${supplyStackCount(character)}/${SUPPLY_STACK_CAPACITY} stacks</strong><label>Supply <select id="qa-supply">${supplyItems.map((item) => `<option value="${item.id}">${safeText(item.name)} · ${character?.supplies?.[item.id] ?? 0}/${item.stackLimit}</option>`).join('')}</select></label><label>Quantity <input id="qa-supply-quantity" type="number" min="0" value="1" inputmode="numeric"></label><button type="button" data-qa-set-supply>Set quantity</button><button type="button" data-qa-add-supply>Add / replenish stack</button><button type="button" data-qa-consume-supply>Consume quantity</button></section><section class="qa-timing"><strong>Equipment state</strong><span>Exact condition, upgrade and provenance details are in the state inspection below.</span><label>Set condition <select id="qa-item-condition"><option value="NORMAL">Sound</option><option value="DAMAGED">Damaged</option><option value="BROKEN">Broken</option></select></label><button type="button" data-qa-set-item-condition>Apply condition to selected item</button><button type="button" data-qa-break-item>Break selected item</button><button type="button" data-qa-repair-item>Repair selected item</button><label>Upgrade <select id="qa-upgrade">${upgradeOptions}</select></label><button type="button" data-qa-add-upgrade>Add upgrade</button><button type="button" data-qa-remove-upgrade>Remove upgrade</button></section><section class="qa-timing"><strong>Easter egg preview</strong><label>Choose a flavor event <select id="qa-easter-egg">${EASTER_EGGS.map((egg) => `<option value="${egg.id}">${safeText(egg.label)}</option>`).join('')}</select></label><button type="button" data-qa-force-easter-egg>Show on this scene</button><button type="button" data-qa-disable-easter-eggs>Disable automatic events</button><button type="button" data-qa-enable-easter-eggs>Enable automatic events</button></section>` : '';
  const monthOptions = ['Device date', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((label, index) => `<option value="${index === 0 ? '' : index}" ${index === 0 ? monthOverride === null ? 'selected' : '' : monthOverride === index ? 'selected' : ''}>${label}${index === actualMonth ? ' · current' : ''}</option>`).join('');
    const seasonalScenarios = scenarios.filter((entry) => { const availability = getSeasonAvailability(entry); return availability.season !== 'ALL_YEAR' || (availability.months?.length ?? 0) < 12 || !!availability.affinityMonths?.length; });
  return `<details class="qa-panel"><summary>QA Tools · build ${QA_BUILD_ID}</summary><div class="qa-body">
    <section class="qa-timing"><strong>Scenario selection simulation</strong><span>Uses local copies of the displayed histories; no real save state is changed.</span><div class="qa-launches"><button type="button" data-qa-simulate-selection="100">Simulate 100 starts</button><button type="button" data-qa-simulate-selection="1000">Simulate 1,000 starts</button></div><pre data-qa-selection-simulation hidden></pre></section>
      <section class="qa-timing"><strong>Anonymous global counter</strong><span>Read-only service status; QA runs never submit completions.</span><pre data-qa-counter-inspection>${safeText(JSON.stringify(inspection.counter, null, 2))}</pre></section>
      <section class="qa-timing"><strong>Seasonal selection</strong><span>Device local date: ${actualDate.toLocaleDateString()} · month ${actualMonth}</span><span>Effective selection month: ${selectionMonth}${monthOverride === null ? ' (device date)' : ' (QA override)'}</span><label>Test selection month <select data-qa-season-month>${monthOptions}</select></label><span>Season-tagged or affinity adventures: ${seasonalScenarios.length}</span>${seasonalScenarios.map((entry) => { const meta = classifyScenario(entry); const affinityMonths = meta.availability.affinityMonths ?? []; const hasAffinity = meta.availability.season === 'ALL_YEAR' && affinityMonths.length > 0; const affinityActive = hasAffinity && affinityMonths.includes(selectionMonth); const affinityLabel = affinityMonths.length === 3 && [12, 1, 2].every((month) => affinityMonths.includes(month)) ? 'Winter affinity' : `${affinityMonths.map((month) => new Date(2000, month - 1, 1).toLocaleString('en', { month: 'long' })).join('/') || 'Season'} affinity`; const seasonalStatus = scenarioAvailableInMonth(entry, selectionMonth) ? (affinityActive ? `eligible · ${affinityLabel} ×${meta.availability.weightBoost ?? 1}` : hasAffinity ? `eligible · ${affinityLabel} inactive` : 'eligible') : 'out of season'; return `<small>${safeText(entry.title)} · ${safeText(meta.availability.season)} · ${safeText(seasonalStatus)} · direct QA launch remains available</small>`; }).join('')}</section>
    <section class="qa-timing"><strong>Library diversity</strong><span>Metadata rows and similarity warnings are generated only when requested.</span><button type="button" data-qa-diversity-report>Generate library diversity report (${scenarios.length} adventures)</button><pre data-qa-diversity-output hidden></pre></section>
    <section class="qa-timing"><strong>Content substance review</strong><span>Heuristic route warnings are for human review only; they never block play or deployment. Similar structure warnings are included for comparison.</span><button type="button" data-qa-content-quality-report>Generate content quality report (${scenarios.length} adventures)</button><pre data-qa-content-quality-output hidden></pre></section>
    ${directLaunch}<div class="qa-actions"><label>Set traveler completions <input id="qa-completions" type="number" min="0" value="${character?.adventuresCompleted ?? 0}" inputmode="numeric"></label><button type="button" data-qa-set-completions>Apply count / capacity</button>${activeTools}<button type="button" data-qa-reset-character>Reset character and run</button><button type="button" class="danger-ghost" data-qa-clear-save>Clear all local save data</button></div><pre>${safeText(JSON.stringify(inspection, null, 2))}</pre></div></details>`;
}
