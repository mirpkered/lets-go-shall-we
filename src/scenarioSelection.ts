import type { Scenario } from './types';

export const RECENT_SCENARIO_WINDOW = 5;

export function selectScenario(scenarios: Scenario[], recentScenarioIds: string[] | string | null | undefined, random = Math.random): Scenario | undefined {
  const recent = Array.isArray(recentScenarioIds) ? recentScenarioIds : recentScenarioIds ? [recentScenarioIds] : [];
  const knownRecent = [...new Set(recent)].filter((id) => scenarios.some((scenario) => scenario.id === id)).slice(0, RECENT_SCENARIO_WINDOW);
  let excluded = knownRecent.length;
  let choices = scenarios.filter((scenario) => !knownRecent.slice(0, excluded).includes(scenario.id));
  while (!choices.length && excluded > 0) {
    excluded -= 1;
    choices = scenarios.filter((scenario) => !knownRecent.slice(0, excluded).includes(scenario.id));
  }
  if (!choices.length) return undefined;
  const index = Math.min(choices.length - 1, Math.floor(random() * choices.length));
  return choices[index];
}

export function isQaMode(search: string): boolean {
  return new URLSearchParams(search).get('qa') === '1';
}
