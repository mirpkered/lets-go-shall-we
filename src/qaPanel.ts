import type { Item, SaveData, Scenario } from './types';
import { timeStatus } from './engine';

function safeText(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export function renderQaPanel(enabled: boolean, state: SaveData, scenarios: Scenario[], items: Record<string, Item>): string {
  if (!enabled) return '';
  const run = state.run;
  const character = state.character;
  const active = run?.status === 'active';
  const scenario = scenarios.find((entry) => entry.id === run?.scenarioId);
  const timing = run && scenario ? timeStatus(scenario, run.elapsedMinutes ?? 0) : null;
  const inspection = {
    scenario: run ? scenario?.title ?? run.scenarioId : null,
    sceneId: run?.sceneId ?? null,
    visitedSceneIds: run?.visitedSceneIds ?? (run ? [run.sceneId] : []),
    inventory: run?.inventory ?? [], flags: run?.flags ?? [], money: character?.money ?? null,
    health: run?.health ?? null, lore: character?.lore ?? [], knowledge: character?.knowledge ?? [], historyFlags: character?.historyFlags ?? [], bank: state.bank,
    mostRecentScenarioId: state.mostRecentScenarioId ?? null,
    elapsedMinutes: run?.elapsedMinutes ?? 0,
    timePhase: timing?.phase?.label ?? null,
    nextTimeThreshold: timing?.nextThreshold ?? null,
  };
  const directLaunch = active ? '<p class="qa-note">Clear the active run before launching another scenario.</p>' : `<div class="qa-launches">${scenarios.map((entry) => `<button type="button" data-qa-start="${entry.id}">Start ${entry.title}</button>`).join('')}</div>`;
  const activeTools = active ? `<section class="qa-timing"><strong>Fictional time</strong><span>Elapsed: ${run?.elapsedMinutes ?? 0} min</span><span>Phase: ${safeText(timing?.phase?.label ?? 'Untracked')}</span><span>Next threshold: ${timing?.nextThreshold === null ? 'none' : `${timing?.nextThreshold} min`}</span><label>Set elapsed minutes <input id="qa-time" type="number" min="0" value="${run?.elapsedMinutes ?? 0}" inputmode="numeric"></label><button type="button" data-qa-set-time>Set fictional time</button><button type="button" data-qa-reset-time>Reset fictional time</button></section><button type="button" data-qa-clear-run>Clear active run</button><label>Set health <input id="qa-health" type="number" min="0" max="${character?.maxHealth ?? 10}" value="${run?.health ?? 10}" inputmode="numeric"></label><button type="button" data-qa-set-health>Apply health</button><label>Carryable item <select id="qa-item">${Object.values(items).filter((item) => item.carryable).map((item) => `<option value="${item.id}">${item.name}</option>`).join('')}</select></label><button type="button" data-qa-add-item>Force add item</button>` : '';
  return `<details class="qa-panel"><summary>QA Tools</summary><div class="qa-body">${directLaunch}<div class="qa-actions">${activeTools}<button type="button" data-qa-reset-character>Reset character and run</button><button type="button" class="danger-ghost" data-qa-clear-save>Clear all local save data</button></div><pre>${safeText(JSON.stringify(inspection, null, 2))}</pre></div></details>`;
}
