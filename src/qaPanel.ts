import type { Item, SaveData, Scenario } from './types';
import { carryCapacity, getCarriedItems, timeStatus } from './engine';
import { BANK_CAPACITY } from './bank';
import { EASTER_EGGS } from './easterEggs';
import { scenarioRiskTier } from './riskClassification';
import { selectionTierSummary } from './scenarioSelection';
import { classifyScenario, getSeasonAvailability, scenarioAvailableInMonth } from './scenarioDiversity';

function safeText(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export function renderQaPanel(enabled: boolean, state: SaveData, scenarios: Scenario[], items: Record<string, Item>, monthOverride: number | null = null): string {
  if (!enabled) return '';
  const run = state.run;
  const character = state.character;
  const active = run?.status === 'active';
  const scenario = scenarios.find((entry) => entry.id === run?.scenarioId);
  const timing = run && scenario ? timeStatus(scenario, run.elapsedMinutes ?? 0) : null;
  const actualDate = new Date();
  const actualMonth = actualDate.getMonth() + 1;
  const selectionMonth = monthOverride ?? actualMonth;
  const selectorPressure = { adventuresCompleted: character?.adventuresCompleted ?? 0, recentRiskHistory: state.recentRiskHistory ?? [], selectionMonth };
  const riskTier = run?.riskTier ?? (scenario ? scenarioRiskTier(scenario) : null);
  const inspection = {
    scenario: run ? scenario?.title ?? run.scenarioId : null,
    riskTier,
    diversity: run && scenario ? classifyScenario(scenario) : null,
    seasonalEligibilityMonth: selectionMonth,
    seasonalEligibleNow: scenario ? scenarioAvailableInMonth(scenario, selectionMonth) : null,
    sceneId: run?.sceneId ?? null,
    visitedSceneIds: run?.visitedSceneIds ?? (run ? [run.sceneId] : []),
    randomSelections: run?.randomSelections ?? {},
    inventory: run?.inventory ?? [], carriedItems: getCarriedItems(character), ownedAssets: character?.ownedAssets ?? [], carryCapacity: carryCapacity(character?.adventuresCompleted ?? 0), travelerAdventuresCompleted: character?.adventuresCompleted ?? null, flags: run?.flags ?? [], money: character?.money ?? null,
    health: run?.health ?? null, lore: character?.lore ?? [], knowledge: character?.knowledge ?? [], historyFlags: character?.historyFlags ?? [], bank: state.bank, bankCount: state.bank.length, bankCapacity: BANK_CAPACITY,
    mostRecentScenarioId: state.mostRecentScenarioId ?? null,
    recentScenarioIds: state.recentScenarioIds ?? [],
    recentRiskHistory: state.recentRiskHistory ?? [],
    nextSelectionRiskWeights: selectionTierSummary(scenarios, state.recentScenarioIds ?? state.mostRecentScenarioId, selectorPressure),
    elapsedMinutes: run?.elapsedMinutes ?? 0,
    qualifyingStoryTransitions: run?.qualifyingStoryTransitions ?? 0,
    qualifiesForTravelerProgression: !!run && !run.qaMode && run.completionQualification !== 'nonSubstantive' && (run.completionQualification === 'substantive' || (character?.money ?? 0) !== (run.startingMoney ?? character?.money) || JSON.stringify([...getCarriedItems(character)].sort()) !== JSON.stringify([...(run.startingCarriedItems ?? getCarriedItems(character))].sort())),
    timePhase: timing?.phase?.label ?? null,
    nextTimeThreshold: timing?.nextThreshold ?? null,
    easterEggEvent: run?.easterEggEvent ?? null,
    qaEasterEggDisabled: run?.qaEasterEggDisabled ?? false,
    recentlySeenEasterEggs: state.recentEasterEggIds ?? [],
  };
  const highRisk = scenarios.find((entry) => scenarioRiskTier(entry) === 'HIGH');
  const severeRisk = scenarios.find((entry) => scenarioRiskTier(entry) === 'SEVERE');
  const directLaunch = active ? '<p class="qa-note">Clear the active run before launching another scenario.</p>' : `<section class="qa-risk-launches"><strong>Risk checks</strong><div class="qa-launches">${highRisk ? `<button type="button" data-qa-start="${highRisk.id}" data-risk-tier="HIGH">Start HIGH · ${highRisk.title}</button>` : ''}${severeRisk ? `<button type="button" data-qa-start="${severeRisk.id}" data-risk-tier="SEVERE">Start SEVERE · ${severeRisk.title}</button>` : ''}</div></section><div class="qa-launches">${scenarios.map((entry) => `<button type="button" data-qa-start="${entry.id}" data-risk-tier="${scenarioRiskTier(entry)}">Start ${entry.title} · ${scenarioRiskTier(entry)}</button>`).join('')}</div>`;
  const activeTools = active ? `<section class="qa-timing"><strong>Fictional time</strong><span>Elapsed: ${run?.elapsedMinutes ?? 0} min</span><span>Phase: ${safeText(timing?.phase?.label ?? 'Untracked')}</span><span>Next threshold: ${timing?.nextThreshold === null ? 'none' : `${timing?.nextThreshold} min`}</span><label>Set elapsed minutes <input id="qa-time" type="number" min="0" value="${run?.elapsedMinutes ?? 0}" inputmode="numeric"></label><button type="button" data-qa-set-time>Set fictional time</button><button type="button" data-qa-reset-time>Reset fictional time</button></section><button type="button" data-qa-clear-run>Clear active run</button><label>Set health <input id="qa-health" type="number" min="0" max="${character?.maxHealth ?? 10}" value="${run?.health ?? 10}" inputmode="numeric"></label><button type="button" data-qa-set-health>Apply health</button><label>Carryable item <select id="qa-item">${Object.values(items).filter((item) => item.carryable).map((item) => `<option value="${item.id}">${item.name}</option>`).join('')}</select></label><button type="button" data-qa-add-item>Force add item to run</button><button type="button" data-qa-add-carried>Force add to traveler loadout</button><section class="qa-timing"><strong>Easter egg preview</strong><label>Choose a flavor event <select id="qa-easter-egg">${EASTER_EGGS.map((egg) => `<option value="${egg.id}">${safeText(egg.label)}</option>`).join('')}</select></label><button type="button" data-qa-force-easter-egg>Show on this scene</button><button type="button" data-qa-disable-easter-eggs>Disable automatic events</button><button type="button" data-qa-enable-easter-eggs>Enable automatic events</button></section>` : '';
  const monthOptions = ['Device date', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((label, index) => `<option value="${index === 0 ? '' : index}" ${index === 0 ? monthOverride === null ? 'selected' : '' : monthOverride === index ? 'selected' : ''}>${label}${index === actualMonth ? ' · current' : ''}</option>`).join('');
  const seasonalScenarios = scenarios.filter((entry) => { const availability = getSeasonAvailability(entry); return availability.season !== 'ALL_YEAR' || (availability.months?.length ?? 0) < 12; });
  return `<details class="qa-panel"><summary>QA Tools</summary><div class="qa-body"><section class="qa-timing"><strong>Seasonal selection</strong><span>Device local date: ${actualDate.toLocaleDateString()} · month ${actualMonth}</span><span>Effective selection month: ${selectionMonth}${monthOverride === null ? ' (device date)' : ' (QA override)'}</span><label>Test selection month <select data-qa-season-month>${monthOptions}</select></label><span>Season-tagged adventures: ${seasonalScenarios.length}</span>${seasonalScenarios.map((entry) => { const meta = classifyScenario(entry); return `<small>${safeText(entry.title)} · ${safeText(meta.availability.season)} · ${scenarioAvailableInMonth(entry, selectionMonth) ? 'eligible' : 'out of season'} · direct QA launch remains available</small>`; }).join('')}</section><section class="qa-timing"><strong>Library diversity</strong><span>Metadata rows and similarity warnings are generated only when requested.</span><button type="button" data-qa-diversity-report>Generate library diversity report (${scenarios.length} adventures)</button><pre data-qa-diversity-output hidden></pre></section>${directLaunch}<div class="qa-actions"><label>Set traveler completions <input id="qa-completions" type="number" min="0" value="${character?.adventuresCompleted ?? 0}" inputmode="numeric"></label><button type="button" data-qa-set-completions>Apply count / capacity</button>${activeTools}<button type="button" data-qa-reset-character>Reset character and run</button><button type="button" class="danger-ghost" data-qa-clear-save>Clear all local save data</button></div><pre>${safeText(JSON.stringify(inspection, null, 2))}</pre></div></details>`;
}
