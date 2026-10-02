import type { Scenario } from './types';

export type ContentWarningCode = 'OBVIOUS_ACTION_TERMINAL' | 'PROCEDURAL_TERMINAL' | 'ONE_WAGER_TERMINAL' | 'AGREEMENT_TERMINAL' | 'ROUTINE_TASK_TERMINAL' | 'NO_PERFORMANCE_FEEDBACK' | 'NO_VISIBLE_PAYOFF';
export type ContentWarningSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export interface ContentQualityWarning {
  scenarioId: string;
  scenarioTitle: string;
  sceneId: string;
  sceneTitle: string;
  code: ContentWarningCode;
  severity: ContentWarningSeverity;
  evidence: string;
  suggestion: string;
}
export interface ContentQualityReport {
  scenarioCount: number;
  routeCountReviewed: number;
  warningCounts: Record<ContentWarningCode, number>;
  severityCounts: Record<ContentWarningSeverity, number>;
  warnings: ContentQualityWarning[];
}

const CODES: ContentWarningCode[] = ['OBVIOUS_ACTION_TERMINAL', 'PROCEDURAL_TERMINAL', 'ONE_WAGER_TERMINAL', 'AGREEMENT_TERMINAL', 'ROUTINE_TASK_TERMINAL', 'NO_PERFORMANCE_FEEDBACK', 'NO_VISIBLE_PAYOFF'];
const genericEnding = /\b(finish the work|everyone thanks you|you report what happened|go on your way|the matter is settled|nothing is lost or delayed|the task is complete)\b/i;
const visibleResult = /\b(coin|pay|wage|paid|lost|saved|found|repaired|agreed|remains|returns|reaction|thanks|laugh|smile|argue|change|cost|delay|injur|row|load|trunk|stake|hand|win|lose|witness|uncertain|leave|depart|share|split|teach|part|promise|offer|choice|decide|memory|story)\b/i;
const performanceEvidence = /\b(row|load|crate|trunk|coin|pay|wage|quality|pace|time|hand|stake|won|lost|saved|recovered|delayed|damage|repair|helped|team|tally|result|mistake|output|assigned|extra)\b/i;
// Do not treat a physical stake (for example, an iron grave marker) as a wager.
const wagerContext = /\b(card|wager|bet|marble|race|contest|game|hand at the table)\b/i;
const taskContext = /\b(work|wage|job|sort|baggage|delivery|deliver|repair|cargo|load|transport|organize|cleanup|clean up|harvest|timber|task)\b/i;
const procedureContext = /\b(report|statement|sign|submit|turn in|hand over|sort|deliver|record|finish|wait for|return|agree|compromise)\b/i;

function destinations(scenario: Scenario, sceneId: string): string[] {
  const result: string[] = [];
  for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
    if (choice.next === sceneId || choice.chance?.successNext === sceneId || choice.chance?.failureNext === sceneId || choice.effects?.combat?.winNext === sceneId || choice.effects?.combat?.lossNext === sceneId) result.push(scene.id);
  }
  return result;
}

function minimumDepths(scenario: Scenario): Map<string, number> {
  const distances = new Map([[scenario.startScene, 0]]);
  const queue = [scenario.startScene];
  while (queue.length) {
    const id = queue.shift()!;
    const current = scenario.scenes[id];
    if (!current) continue;
    const nextIds = current.choices.flatMap((choice) => [choice.next, choice.chance?.successNext, choice.chance?.failureNext, choice.effects?.combat?.winNext, choice.effects?.combat?.lossNext].filter((value): value is string => !!value));
    for (const next of nextIds) if (!distances.has(next)) { distances.set(next, (distances.get(id) ?? 0) + 1); queue.push(next); }
  }
  return distances;
}

function warning(scenario: Scenario, sceneId: string, code: ContentWarningCode, severity: ContentWarningSeverity, evidence: string, suggestion: string): ContentQualityWarning {
  const scene = scenario.scenes[sceneId];
  return { scenarioId: scenario.id, scenarioTitle: scenario.title, sceneId, sceneTitle: scene.title, code, severity, evidence, suggestion };
}

/**
 * Review-only heuristics. They never affect play or block deployment. A short
 * scene graph is not itself a warning: each warning requires a text/action cue.
 */
export function auditContentQuality(scenarios: Scenario[]): ContentQualityReport {
  const warnings: ContentQualityWarning[] = [];
  let routeCountReviewed = 0;
  for (const scenario of scenarios) {
    const distances = minimumDepths(scenario);
    for (const terminal of Object.values(scenario.scenes).filter((scene) => !!scene.ending)) {
      const parentIds = destinations(scenario, terminal.id);
      const parents = parentIds.map((id) => scenario.scenes[id]).filter(Boolean);
      if (!parents.length) continue;
      routeCountReviewed++;
      const terminalDepth = Math.min(...parents.map((parent) => (distances.get(parent.id) ?? 0) + 1));
      const parentText = parents.map((parent) => [parent.title, parent.text, ...parent.choices.filter((choice) => choice.next === terminal.id || choice.chance?.successNext === terminal.id || choice.chance?.failureNext === terminal.id).map((choice) => choice.label)].join(' ')).join(' ');
      const incomingLabels = parents.flatMap((parent) => parent.choices.filter((choice) => choice.next === terminal.id || choice.chance?.successNext === terminal.id || choice.chance?.failureNext === terminal.id).map((choice) => choice.label)).join(' ');
      const endingText = `${terminal.title} ${terminal.text}`;
      const direct = terminalDepth <= 1;
      const shallow = terminalDepth <= 2;
      const explicitQuickExit = direct && /\b(decline|refuse|turn away|walk away|leave without|keep walking|continue on|not get involved|stay out|pass on)\b/i.test(incomingLabels);
      const hasPayoff = visibleResult.test(endingText) && !genericEnding.test(endingText);
      const wager = wagerContext.test(parentText) && /\b(bet|wager|race|marble|play .{0,24}hand|risk .{0,20}coin)\b/i.test(incomingLabels);
      const workOrGame = wager || taskContext.test(`${parentText} ${terminal.title}`);
      const proposal = /\b(agree|agreement|compromise|settle|split)\b/i.test(endingText)
        && /\b(suggest|propose|split|compromise|agree to share)\b/i.test(incomingLabels);
      const proceduralAction = procedureContext.test(parentText);
      const emptyPayoff = genericEnding.test(endingText) || terminal.text.trim().length < 70;

      if (direct && wager) warnings.push(warning(scenario, terminal.id, 'ONE_WAGER_TERMINAL', 'HIGH', 'A wager/game action can reach this ending without a later strategic or continue/stop decision.', 'Consider a brief next-hand, stake, or stop/continue decision before resolving the game.'));
      if (shallow && proposal && !/\b(then|after|begins|pays|repair begins|follow through|concedes|remains open|still|terms|cost|labor|materials)\b/i.test(endingText)) warnings.push(warning(scenario, terminal.id, 'AGREEMENT_TERMINAL', direct ? 'HIGH' : 'MEDIUM', 'An agreement or compromise is the last visible event, with little evidence of terms or follow-through.', 'Show the agreed terms, who contributes, what changes, or why the matter remains open.'));
      // A clearly authored death is itself a conclusive outcome; assess its fairness
      // through risk tests instead of asking it to provide an aftermath first.
      if (terminal.ending !== 'death' && !explicitQuickExit) {
        if (direct && !hasPayoff) warnings.push(warning(scenario, terminal.id, 'OBVIOUS_ACTION_TERMINAL', emptyPayoff ? 'HIGH' : 'LOW', 'One action reaches a generic or minimally consequential terminal beat.', 'Add a meaningful result, reaction, consequence, or intentionally strong vignette payoff.'));
        if (shallow && proceduralAction && (genericEnding.test(endingText) || !hasPayoff)) warnings.push(warning(scenario, terminal.id, 'PROCEDURAL_TERMINAL', 'MEDIUM', 'A report, sorting, delivery, agreement, or other procedure appears to end the route without a visible change.', 'Show what the procedure changes and who responds.'));
        if (shallow && taskContext.test(`${parentText} ${terminal.title}`) && (genericEnding.test(endingText) || !performanceEvidence.test(endingText))) warnings.push(warning(scenario, terminal.id, 'ROUTINE_TASK_TERMINAL', 'MEDIUM', 'A work/task route ends quickly and gives little concrete performance feedback.', 'Consider reporting output, quality, time, pay, cost, or another person’s reaction.'));
        if (shallow && workOrGame && !performanceEvidence.test(endingText)) warnings.push(warning(scenario, terminal.id, 'NO_PERFORMANCE_FEEDBACK', 'LOW', 'The terminal text may not tell the player how the work/game/task went.', 'Check whether a specific performance result or deliberate narrative reason to omit one belongs here.'));
        if (shallow && !hasPayoff && !genericEnding.test(endingText)) warnings.push(warning(scenario, terminal.id, 'NO_VISIBLE_PAYOFF', 'LOW', 'A short route may resolve mechanically without showing a reaction or consequence.', 'Review the route manually; concise closure is enough if the ending already feels complete.'));
      }
    }
  }
  const warningCounts = Object.fromEntries(CODES.map((code) => [code, warnings.filter((entry) => entry.code === code).length])) as Record<ContentWarningCode, number>;
  const severityCounts = { HIGH: warnings.filter(({ severity }) => severity === 'HIGH').length, MEDIUM: warnings.filter(({ severity }) => severity === 'MEDIUM').length, LOW: warnings.filter(({ severity }) => severity === 'LOW').length };
  return { scenarioCount: scenarios.length, routeCountReviewed, warningCounts, severityCounts, warnings };
}
