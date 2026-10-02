import type { TravelerContact, TravelerFavor } from './types';

/** Stable IDs for the deliberately small, authored Contact/Favor roster. */
export const CONTACT_IDS = {
  innCookNessa: 'inn-cook-nessa',
  cooperativeForemanIven: 'cooperative-foreman-iven',
} as const;

export const FAVOR_IDS = {
  nessaSimpleMeal: 'nessa-simple-meal',
} as const;

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
