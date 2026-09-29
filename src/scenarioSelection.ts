import type { Scenario } from './types';

export function selectScenario(scenarios: Scenario[], mostRecentScenarioId: string | null | undefined, random = Math.random): Scenario | undefined {
  const eligible = scenarios.filter((scenario) => scenario.id !== mostRecentScenarioId);
  const choices = eligible.length ? eligible : scenarios;
  if (!choices.length) return undefined;
  const index = Math.min(choices.length - 1, Math.floor(random() * choices.length));
  return choices[index];
}

export function isQaMode(search: string): boolean {
  return new URLSearchParams(search).get('qa') === '1';
}
