import type { TravelerContact, TravelerFavor } from './types';

/** Stable IDs for the deliberately small, authored Contact/Favor roster. */
export const CONTACT_IDS = {
  innCookNessa: 'inn-cook-nessa',
  cooperativeForemanIven: 'cooperative-foreman-iven',
} as const;

export const FAVOR_IDS = {
  nessaSimpleMeal: 'nessa-simple-meal',
} as const;

export const OUTCOME_HISTORY_FLAGS = {
  awardedHestersPie: 'awarded_hesters_pie_the_ribbon_at_fair',
  acceptedFamilyVerse: 'accepted_family_transmitted_verse_at_last_verse_contest',
  favoredPrintedVerse: 'favored_printed_version_at_last_verse_contest',
} as const;

export const LOTTE_PIE_CONTACT: TravelerContact = {
  id: 'lotte-pie-baker',
  name: 'Lotte',
  role: 'Baker',
  sourceScenarioId: 'the-pie-with-no-recipe',
  notes: 'Asked to compare memories of Mrs. Orrow’s disputed pie method after Hester’s plum pie took the fair ribbon.',
};

export const ANSEL_PRINTER_CONTACT: TravelerContact = {
  id: 'ansel-reed-printer',
  name: 'Ansel Reed',
  role: 'Printer',
  sourceScenarioId: 'a-line-for-the-broadside',
  notes: 'Met while considering how a family-transmitted verse should be represented beside a town broadside.',
};

export const NESSA_CONTACT: TravelerContact = {
  id: CONTACT_IDS.innCookNessa,
  name: 'Nessa',
  role: 'Inn cook',
  sourceScenarioId: 'the-last-clean-apron',
  notes: 'Met while improvising a safe substitute for the only clean apron.',
};

export const NESSA_MEAL_FAVOR: TravelerFavor = {
  id: FAVOR_IDS.nessaSimpleMeal,
  contactId: CONTACT_IDS.innCookNessa,
  description: 'One simple meal at the inn cook’s table',
  sourceScenarioId: 'the-last-clean-apron',
  status: 'available',
};

export const IVEN_CONTACT: TravelerContact = {
  id: CONTACT_IDS.cooperativeForemanIven,
  name: 'Iven',
  role: 'Rural cooperative foreman',
  sourceScenarioId: 'cold-storage',
  notes: 'Met while helping rescue a worker from the cooperative cold store.',
};

/** Exact legacy evidence is sufficient for these two authored callbacks; other History is not inferred. */
export const LEGACY_CONTINUITY_MIGRATIONS = [
  {
    historyFlag: 'improvised_a_kitchen_work_cloth_from_clean_sack',
    contact: NESSA_CONTACT,
    favor: NESSA_MEAL_FAVOR,
  },
  {
    historyFlag: 'rescued_cold_storage_worker',
    contact: IVEN_CONTACT,
  },
] as const;

/** Exact legacy Knowledge proves this one source decision; do not infer the unrecorded printed-version outcome. */
export const LEGACY_HISTORY_FROM_KNOWLEDGE_MIGRATIONS = [
  {
    knowledgeText: 'The recitation contest accepted a family-transmitted verse absent from the printed broadside.',
    historyFlag: OUTCOME_HISTORY_FLAGS.acceptedFamilyVerse,
  },
] as const;
