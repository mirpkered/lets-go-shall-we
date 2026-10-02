import type { Scenario, ScenarioDiversity, Scene } from '../types';
import { largeAdventure, largeEnd, largeScene, largeTags } from './largeContentTools';

type Shape = 'trace' | 'claim' | 'salvage' | 'hazard' | 'occupant';
export interface FrontierCard {
  id: string; title: string; subtitle: string; shape: Shape; risk: ScenarioDiversity['riskTier']; setting: string;
  hook: string; opening: string; clue: string; turn: string; cautious: string; bold: string; leave: string;
  insight: string; closure?: string; activity?: string; role?: string; tone?: string; danger?: number;
  entry?: string; endingTitle?: string; endingText?: string; boldRisk?: boolean; fatalFailure?: boolean; failureMessage?: string; fatalText?: string; boldEffects?: Scene['choices'][number]['effects']; cautiousEffects?: Scene['choices'][number]['effects'];
}

/** Each record supplies its own evidence, dilemma and consequence; the small graph templates only keep scene plumbing consistent. */
export function frontierAdventure(card: FrontierCard): Scenario {
  const { id } = card;
  const start = `${id}Start`, evidence = `${id}Evidence`, decision = `${id}Decision`;
  const claimCounter = `${id}CounterAccount`, hazardEdge = `${id}HazardEdge`;
  const cautiousEnd = `${id}Cautious`, boldEnd = `${id}Bold`, leftEnd = `${id}Left`, mishap = `${id}Mishap`;
  const fatalEnd = `${id}Fatal`;
  const closure = card.closure ?? 'You leave the site as you found it. The trail back remains clear, and the evidence does not prove more than you observed.';
  const activities: Record<Shape, string> = {
    trace: 'travel/exploration', claim: 'negotiation/trade', salvage: 'investigation/mystery', hazard: 'survival', occupant: 'social interaction',
  };
  const tones: Record<Shape, string> = {
    trace: 'adventurous', claim: 'mysterious/eerie', salvage: 'tense/dangerous', hazard: 'tense/dangerous', occupant: 'mysterious/eerie',
  };
  const structures: Record<Shape, string> = {
    trace: 'environmental inference and route discovery', claim: 'competing evidence and negotiated disposition',
    salvage: 'provenance decision with optional risk escalation', hazard: 'retreat window and escalating structure risk',
    occupant: 'hidden presence and uncertain purpose',
  };
  const diversity = largeTags({
    hook: card.hook, activity: card.activity ?? activities[card.shape], role: card.role ?? ({ trace: 'investigator/explorer', claim: 'witness', salvage: 'investigator/explorer', hazard: 'traveler/passenger', occupant: 'investigator/explorer' } satisfies Record<Shape, string>)[card.shape],
    tone: card.tone ?? tones[card.shape], risk: card.risk, setting: card.setting,
    structures: [structures[card.shape]], fantasy: 'NONE', combat: 'NONE',
    entry: [card.shape === 'claim' && id === 'claim-jumpers-at-sundown' ? 'hired/posted work' : 'voluntary curiosity'],
    rewards: ['knowledge/history', ...(card.shape === 'salvage' ? ['optional salvage'] : [])],
    outcomes: ['success/partial success', 'walk-away/refusal', 'unresolved mystery', ...(card.risk === 'HIGH' || card.risk === 'SEVERE' ? ['escape/survival', 'costly success/no-perfect-outcome possible'] : [])],
    consequences: ['time/opportunity', ...(card.risk === 'HIGH' || card.risk === 'SEVERE' ? ['health/injury', 'gear/property/objective'] : [])],
  });
  diversity.structures = ({
    trace: ['short focused sequence', 'branching narrative'],
    claim: ['multi-stage sequence', 'branching narrative'],
    salvage: ['branching narrative', 'other structure'],
    hazard: ['time-pressure sequence', 'multi-stage sequence'],
    occupant: ['other structure', 'branching narrative'],
  } satisfies Record<Shape, string[]>)[card.shape];
  diversity.rewardShapes = card.shape === 'salvage' ? ['money/item/knowledge/history possible'] : ['narrative-only payoff'];
  diversity.outcomeShapes = card.shape === 'claim' ? ['success/partial success', 'negotiated compromise', 'walk-away/refusal', 'unresolved mystery']
    : card.shape === 'hazard' ? ['success/partial success', 'escape/survival', 'costly success/no-perfect-outcome possible']
      : ['success/partial success', 'peaceful resolution', 'walk-away/refusal', ...(card.shape === 'occupant' ? ['unresolved mystery'] : [])];
  diversity.consequenceShapes = card.risk === 'HIGH' || card.risk === 'SEVERE' ? ['health/injury', 'time/opportunity', 'gear/property/objective'] : ['time/opportunity', 'scenario-defined consequence'];
  diversity.length = card.shape === 'trace' ? 'VIGNETTE' : card.risk === 'HIGH' ? 'EXTENDED' : 'STANDARD';
  diversity.entryShapes = [card.entry ?? (id === 'claim-jumpers-at-sundown' ? 'hired/posted work' : 'voluntary curiosity')];
  const choicesForEvidence: Scene['choices'] = card.shape === 'hazard'
    ? [
      { id: 'testGround', label: card.cautious, next: hazardEdge, effects: { knowledge: [card.insight] } },
      ...(card.boldRisk === false
        ? [{ id: 'inspectSafely', label: card.bold, next: decision, effects: card.boldEffects ?? { knowledge: [card.insight] } }]
        : [{ id: 'pressOn', label: card.bold, hint: 'The visible structure is already shifting; retreat remains possible.', chance: { probability: card.danger ?? 0.56, successNext: decision, failureNext: card.fatalFailure ? fatalEnd : mishap, successMessage: card.turn, failureMessage: card.failureMessage ?? 'The structure shifts under the work; you pull back with a painful impact.', failureEffects: card.fatalFailure ? undefined : { health: -3 } } }]),
      { id: 'withdrawEarly', label: card.leave, next: leftEnd },
    ]
    : [
      { id: 'readEvidence', label: card.cautious, next: decision, effects: { knowledge: [card.insight] } },
      { id: 'followEvidence', label: card.bold, hint: 'Going farther may clarify the find, but costs time and leaves the easy route behind.', next: card.shape === 'claim' ? claimCounter : decision, effects: { historyFlags: [`investigated ${card.title.toLowerCase()} beyond the first clues`] } },
      { id: 'leaveEvidence', label: card.leave, next: leftEnd },
    ];
  const finalChoices: Scene['choices'] = card.shape === 'claim'
    ? [
      { id: 'shareRecord', label: 'Give both sides the same account', next: cautiousEnd, effects: { historyFlags: [`shared evidence about ${card.title.toLowerCase()}`] } },
      { id: 'keepRecord', label: 'Keep your finding private', next: boldEnd, effects: { knowledge: [card.insight] } },
      { id: 'walkFromClaim', label: 'Leave the claim unsettled', next: leftEnd },
    ]
    : card.shape === 'salvage'
      ? [
        { id: 'takeCareful', label: card.cautious, next: cautiousEnd, effects: card.cautiousEffects ?? { knowledge: [card.insight] } },
        { id: 'takeRisk', label: card.bold, hint: card.boldRisk === false ? undefined : 'The evidence does not establish that the object is yours to take.', ...(card.boldRisk === false ? { next: boldEnd, effects: card.boldEffects } : { chance: { probability: card.danger ?? 0.58, successNext: boldEnd, failureNext: mishap, successMessage: card.turn, successEffects: card.boldEffects, failureMessage: 'The material shifts and the object slips beyond safe reach.', failureEffects: { health: -2 } } }) },
        { id: 'leaveSalvage', label: card.leave, next: leftEnd },
      ]
      : [
        { id: 'closeCarefully', label: card.cautious, next: cautiousEnd, effects: { historyFlags: [`left a clear account of ${card.title.toLowerCase()}`], knowledge: [card.insight] } },
        { id: 'continueSearch', label: card.bold, next: boldEnd, effects: { knowledge: [card.insight] } },
        { id: 'departNow', label: card.leave, next: leftEnd },
      ];
  const scenes: Record<string, Scene> = {
    [start]: largeScene(start, card.title, card.opening, [
      { id: 'approach', label: card.shape === 'claim' ? 'Look at the physical evidence' : 'Inspect what the place shows', next: evidence },
      { id: 'markAndLeave', label: card.shape === 'hazard' ? 'Mark the danger and leave' : 'Mark the place and move on', next: leftEnd },
      { id: 'turnAway', label: 'Leave without investigating', next: leftEnd },
    ], 'warning'),
    [evidence]: largeScene(evidence, card.shape === 'occupant' ? 'Signs of Another Life' : card.shape === 'claim' ? 'What the Ground Can Prove' : 'What the Evidence Shows', card.clue, choicesForEvidence, 'warning'),
    [decision]: largeScene(decision, card.shape === 'claim' ? 'A Finding, Not a Verdict' : card.shape === 'salvage' ? 'Take, Leave, or Risk More' : 'What the Place Means', `${card.turn} ${card.closure}`, finalChoices, card.risk === 'HIGH' || card.risk === 'SEVERE' ? 'warning' : 'safe'),
    [cautiousEnd]: largeEnd(cautiousEnd, card.endingTitle ?? 'A Careful Account', card.endingText ?? `${closure} You leave with the important distinction that ${card.insight.toLowerCase()}`),
    [boldEnd]: largeEnd(boldEnd, card.endingTitle ?? 'The Find Has a Cost', card.endingText ?? `${card.turn} ${closure} What you learned is useful; what happens to the place after you go is not yours to decide.`),
    [leftEnd]: largeEnd(leftEnd, 'No Further In', `You decide not to go farther into ${card.title.toLowerCase()}. The visible signs were enough to make you stop, but not enough to settle what the place means. You return to the road without claiming what you have not examined.`),
  };
  if (card.shape === 'claim') scenes[claimCounter] = largeScene(claimCounter, 'The Other Side of the Record', `You take time to compare what the site itself can show. ${card.turn} The evidence adds context, but it does not settle title by itself.`, [
    { id: 'bringBothAccounts', label: 'Share the evidence without choosing sides', next: decision, effects: { knowledge: [card.insight] } },
    { id: 'keepBothAccounts', label: 'Keep both accounts and leave', next: leftEnd },
  ], 'safe');
  if (card.shape === 'hazard') scenes[hazardEdge] = largeScene(hazardEdge, 'A Stable Place to Decide', `From the sound ground, the risk is easier to read. ${card.turn} The way back is still open.`, [
    { id: 'advanceFromStable', label: 'Continue only as far as the firm edge', next: decision },
    { id: 'retreatFromStable', label: 'Retreat while the way is clear', next: leftEnd },
  ], 'warning');
  if ((card.shape === 'salvage' && card.boldRisk !== false) || (card.shape === 'hazard' && card.boldRisk !== false && !card.fatalFailure)) scenes[mishap] = largeEnd(mishap, 'A Warning from the Ground', `You retreat from ${card.title.toLowerCase()} hurt but alive. ${card.closure}`);
  if (card.fatalFailure) scenes[fatalEnd] = largeEnd(fatalEnd, 'The Structure Gives Way', card.fatalText ?? `The warned hazard becomes fatal before you can reach the return path at ${card.title.toLowerCase()}.`, 'death');
  return largeAdventure(id, card.title, card.subtitle, diversity, start, scenes);
}
