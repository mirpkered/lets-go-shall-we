import type { Scenario } from './types';

export function findScenarioGraphProblems(scenario: Scenario): string[] {
  const problems: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  for (const [id, scene] of Object.entries(scenario.scenes)) {
    if (scene.id !== id) problems.push(`Scene key ${id} does not match scene id ${scene.id}`);
    for (const choice of scene.choices) {
      const destinations = [choice.next, choice.chance?.successNext, choice.chance?.failureNext,
        choice.effects?.combat?.winNext, choice.effects?.combat?.lossNext].filter((value): value is string => Boolean(value));
      for (const destination of destinations) {
        if (!scenario.scenes[destination]) problems.push(`${id}.${choice.id} targets missing scene ${destination}`);
      }
    }
  }

  const visit = (sceneId: string, path: string[]) => {
    if (visiting.has(sceneId)) {
      problems.push(`Cycle: ${[...path, sceneId].join(' → ')}`);
      return;
    }
    if (visited.has(sceneId) || !scenario.scenes[sceneId]) return;
    visiting.add(sceneId);
    const scene = scenario.scenes[sceneId];
    for (const choice of scene.choices) {
      const destinations = [choice.next, choice.chance?.successNext, choice.chance?.failureNext,
        choice.effects?.combat?.winNext, choice.effects?.combat?.lossNext].filter((value): value is string => Boolean(value));
      for (const destination of destinations) visit(destination, [...path, sceneId]);
    }
    visiting.delete(sceneId);
    visited.add(sceneId);
  };
  for (const sceneId of Object.keys(scenario.scenes)) visit(sceneId, []);
  return problems;
}
