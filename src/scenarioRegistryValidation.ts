import { ITEMS, inventoryClass } from './items';
import { validateScenarioMetadata } from './scenarioDiversity';
import { findScenarioGraphProblems } from './scenarioGraph';
import { KNOWLEDGE_FACTS_BY_ID } from './knowledgeFacts';
import type { Effects, Requirement, Scenario } from './types';

export interface ScenarioRegistryReport {
  errors: string[];
  warnings: string[];
}

/** Release-time authoring gate. It does not run during normal selection or app startup. */
export function validateScenarioRegistry(scenarios: Scenario[]): ScenarioRegistryReport {
  const errors = validateScenarioMetadata(scenarios);
  const warnings: string[] = [];
  const scenarioIds = new Set(scenarios.map(({ id }) => id));
  const titleIds = new Map<string, string>();
  const knownContacts = new Set<string>();
  const knownFavors = new Set<string>();
  const knownAssets = new Set<string>();
  const knownKnowledgeKeys = new Map<string, string>();
  const itemId = (id: string, where: string) => {
    if (!ITEMS[id]) errors.push(`${where}: unknown item ID “${id}”`);
  };

  for (const scenario of scenarios) {
    if (!scenario.title.trim()) errors.push(`${scenario.id}: missing title`);
    if (!scenario.scenes[scenario.startScene]) errors.push(`${scenario.id}: missing start scene ${scenario.startScene}`);
    for (const problem of findScenarioGraphProblems(scenario)) errors.push(`${scenario.id}: ${problem}`);
    const sceneIds = new Set<string>();
    for (const [sceneKey, scene] of Object.entries(scenario.scenes)) {
      if (sceneIds.has(scene.id)) errors.push(`${scenario.id}: duplicate scene ID ${scene.id}`);
      sceneIds.add(scene.id);
      const choiceIds = new Set<string>();
      for (const choice of scene.choices) {
        if (choiceIds.has(choice.id)) errors.push(`${scenario.id}.${sceneKey}: duplicate choice ID ${choice.id}`);
        choiceIds.add(choice.id);
      }
    }
    const priorTitleId = titleIds.get(scenario.title.trim().toLocaleLowerCase());
    if (priorTitleId) warnings.push(`Duplicate adventure title “${scenario.title}” (${priorTitleId}, ${scenario.id}); confirm this is intentional.`);
    else titleIds.set(scenario.title.trim().toLocaleLowerCase(), scenario.id);
    for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
      for (const contact of choice.effects?.gainContacts ?? []) knownContacts.add(contact.id);
      for (const favor of choice.effects?.gainFavors ?? []) knownFavors.add(favor.id);
      for (const asset of choice.effects?.gainOwnedAssets ?? []) knownAssets.add(asset.id);
      for (const fact of choice.effects?.knowledgeEntries ?? []) {
        const previousText = knownKnowledgeKeys.get(fact.id);
        if (previousText !== undefined && previousText !== fact.text) errors.push(`${scenario.id}.${scene.id}.${choice.id}: Knowledge key ${fact.id} has conflicting text`);
        knownKnowledgeKeys.set(fact.id, fact.text);
        if (!fact.id.trim() || !fact.text.trim()) errors.push(`${scenario.id}.${scene.id}.${choice.id}: Knowledge entries need a stable ID and readable text`);
        if (!KNOWLEDGE_FACTS_BY_ID[fact.id]) errors.push(`${scenario.id}.${scene.id}.${choice.id}: unknown canonical Knowledge key ${fact.id}`);
      }
    }
  }

  const itemLists: (keyof Requirement)[] = ['items', 'usableItems', 'notUsableItems', 'anyUsableItems', 'gear', 'usableGear', 'relics', 'temporaryEquipment', 'notItems', 'notOwnedItems'];
  const itemMaps: (keyof Requirement)[] = ['itemConditions', 'itemUpgrades', 'gearUpgrades', 'notItemUpgrades'];
  const inspectRequirement = (requirement: Requirement | undefined, where: string) => {
    if (!requirement) return;
    if (requirement.knowledge?.length || requirement.notKnowledge?.length) warnings.push(`${where}: exact prose Knowledge matching is legacy; use a stable knowledge key for reusable facts.`);
    for (const field of itemLists) for (const id of requirement[field] as string[] | undefined ?? []) itemId(id, `${where}.${field}`);
    for (const field of itemMaps) for (const id of Object.keys(requirement[field] as Record<string, unknown> | undefined ?? {})) itemId(id, `${where}.${field}`);
    for (const [id, quantity] of Object.entries(requirement.supplies ?? requirement.canAddSupplies ?? {})) {
      if (inventoryClass(id) !== 'SUPPLY') errors.push(`${where}: ${id} is not a Supply`);
      if (!Number.isInteger(quantity) || quantity < 1) errors.push(`${where}: Supply quantity for ${id} must be a positive integer`);
    }
    for (const [id, quantity] of Object.entries(requirement.supplies ?? {})) {
      if (inventoryClass(id) !== 'SUPPLY') errors.push(`${where}: ${id} is not a Supply`);
      if (!Number.isInteger(quantity) || quantity < 1) errors.push(`${where}: Supply quantity for ${id} must be a positive integer`);
    }
    for (const [id, quantity] of Object.entries(requirement.canAddSupplies ?? {})) {
      if (inventoryClass(id) !== 'SUPPLY') errors.push(`${where}: ${id} is not a Supply`);
      if (!Number.isInteger(quantity) || quantity < 1) errors.push(`${where}: Supply capacity for ${id} must be a positive integer`);
    }
    for (const id of requirement.ownedAssets ?? []) if (!knownAssets.has(id)) errors.push(`${where}: no registered effect grants owned asset ${id}`);
    for (const id of requirement.contacts ?? []) if (!knownContacts.has(id)) errors.push(`${where}: no registered effect grants Contact ${id}`);
    for (const id of requirement.favors ?? []) if (!knownFavors.has(id)) errors.push(`${where}: no registered effect grants Favor ${id}`);
    for (const id of requirement.knowledgeKeys ?? []) if (!knownKnowledgeKeys.has(id) && !KNOWLEDGE_FACTS_BY_ID[id]) errors.push(`${where}: unknown Knowledge key ${id}`);
    for (const id of requirement.notKnowledgeKeys ?? []) if (!knownKnowledgeKeys.has(id) && !KNOWLEDGE_FACTS_BY_ID[id]) errors.push(`${where}: unknown Knowledge key ${id}`);
  };
  const inspectEffects = (effects: Effects | undefined, where: string) => {
    if (!effects) return;
    for (const field of ['gainItems', 'loseItems', 'damageItems', 'breakItems', 'repairItems'] as const) for (const id of effects[field] ?? []) itemId(id, `${where}.${field}`);
    for (const fact of effects.knowledgeEntries ?? []) {
      if (!fact.id.trim() || !fact.text.trim()) errors.push(`${where}: Knowledge entries need a stable ID and readable text`);
      if (!KNOWLEDGE_FACTS_BY_ID[fact.id]) errors.push(`${where}: unknown canonical Knowledge key ${fact.id}`);
      if (knownKnowledgeKeys.get(fact.id) !== fact.text) errors.push(`${where}: Knowledge key ${fact.id} has conflicting text`);
    }
    for (const [field, supplies] of [['gainSupplies', effects.gainSupplies], ['consumeSupplies', effects.consumeSupplies]] as const) {
      for (const [id, quantity] of Object.entries(supplies ?? {})) {
        itemId(id, `${where}.${field}`);
        if (inventoryClass(id) !== 'SUPPLY') errors.push(`${where}.${field}: ${id} is not a Supply`);
        if (!Number.isInteger(quantity) || quantity < 1) errors.push(`${where}.${field}: quantity for ${id} must be a positive integer`);
      }
    }
    for (const favorId of effects.consumeFavors ?? []) if (!knownFavors.has(favorId)) errors.push(`${where}: unknown Favor ${favorId}`);
    for (const replacement of effects.replaceItems ?? []) { itemId(replacement.oldItemId, `${where}.replaceItems`); itemId(replacement.newItemId, `${where}.replaceItems`); }
    for (const upgrade of effects.addItemUpgrades ?? []) {
      itemId(upgrade.itemId, `${where}.addItemUpgrades`);
      if (!ITEMS[upgrade.itemId]?.upgrades?.some(({ id }) => id === upgrade.upgradeId)) errors.push(`${where}: ${upgrade.upgradeId} is not an upgrade for ${upgrade.itemId}`);
    }
    for (const contact of effects.gainContacts ?? []) if (!scenarioIds.has(contact.sourceScenarioId)) errors.push(`${where}: Contact ${contact.id} has unknown source scenario ${contact.sourceScenarioId}`);
    for (const favor of effects.gainFavors ?? []) {
      if (!scenarioIds.has(favor.sourceScenarioId)) errors.push(`${where}: Favor ${favor.id} has unknown source scenario ${favor.sourceScenarioId}`);
      if (favor.contactId && !knownContacts.has(favor.contactId)) errors.push(`${where}: Favor ${favor.id} references unknown Contact ${favor.contactId}`);
    }
  };

  for (const scenario of scenarios) for (const scene of Object.values(scenario.scenes)) for (const choice of scene.choices) {
    const where = `${scenario.id}.${scene.id}.${choice.id}`;
    inspectRequirement(choice.requirements, where);
    inspectEffects(choice.effects, where);
    if (choice.chance) {
      inspectEffects(choice.chance.successEffects, `${where}.success`);
      inspectEffects(choice.chance.failureEffects, `${where}.failure`);
      for (const id of choice.chance.bonusItems ?? []) itemId(id, `${where}.bonusItems`);
      for (const upgrade of choice.chance.bonusUpgrades ?? []) {
        itemId(upgrade.itemId, `${where}.bonusUpgrades`);
        if (!ITEMS[upgrade.itemId]?.upgrades?.some(({ id }) => id === upgrade.upgradeId)) errors.push(`${where}: ${upgrade.upgradeId} is not an upgrade for ${upgrade.itemId}`);
      }
    }
  }
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}
