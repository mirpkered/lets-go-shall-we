import type { Effects, Requirement, Scenario, ScenarioDiversity, TimePhase } from '../types';

export interface EndingOption {
  id: string;
  label: string;
  title: string;
  text: string;
  requirements?: Requirement;
  textVariants?: { requirements: Requirement; text: string }[];
  effects?: Effects;
}

export interface StoryRoute {
  id: string;
  label: string;
  hint?: string;
  title: string;
  text: string;
  textVariants?: { requirements: Requirement; text: string }[];
  requirements?: Requirement;
  effects?: Effects;
  outcomes: [EndingOption, EndingOption];
  timeCost?: number;
}

export interface AdventureDraft {
  id: string;
  title: string;
  subtitle: string;
  opening: string;
  openingTitle?: string;
  openingContext?: 'depot' | 'market' | 'fair' | 'inn' | 'roadside' | 'field' | 'wagon' | 'newspaper' | 'landing';
  openingVariants?: { requirements: Requirement; text: string }[];
  timePhases?: TimePhase[];
  runRandomSelections?: Scenario['runRandomSelections'];
  diversity?: Partial<ScenarioDiversity>;
  routes: [StoryRoute, StoryRoute, StoryRoute] | [StoryRoute, StoryRoute, StoryRoute, StoryRoute];
}

/** Small authoring helper: every route is a forward-only beat ending in two authored outcomes. */
export function authorAdventure(draft: AdventureDraft): Scenario {
  const startScene = 'opening';
  const scenes: Scenario['scenes'] = {
    [startScene]: {
      id: startScene,
      title: draft.openingTitle ?? draft.title,
      text: draft.opening,
      textVariants: draft.openingVariants,
      tone: 'safe',
      easterEggContext: draft.openingContext,
      choices: draft.routes.map((route) => ({
        id: `take-${route.id}`,
        label: route.label,
        hint: route.hint,
        requirements: route.requirements,
        effects: route.effects,
        timeCost: route.timeCost,
        next: route.id,
      })),
    },
  };

  for (const route of draft.routes) {
    scenes[route.id] = {
      id: route.id,
      title: route.title,
      text: route.text,
      textVariants: route.textVariants,
      tone: 'safe',
      choices: route.outcomes.map((outcome) => ({
        id: `${route.id}-${outcome.id}`,
        label: outcome.label,
        next: `${route.id}-${outcome.id}`,
        requirements: outcome.requirements,
        effects: outcome.effects,
      })),
    };
    for (const outcome of route.outcomes) {
      const id = `${route.id}-${outcome.id}`;
      scenes[id] = { id, title: outcome.title, text: outcome.text, textVariants: outcome.textVariants, tone: 'safe', ending: 'success', choices: [] };
    }
  }

  return {
    id: draft.id,
    title: draft.title,
    subtitle: draft.subtitle,
    startScene,
    timePhases: draft.timePhases,
    runRandomSelections: draft.runRandomSelections,
    diversity: draft.diversity,
    scenes,
  };
}

export function authorBatch(drafts: AdventureDraft[]): Scenario[] {
  return drafts.map(authorAdventure);
}
