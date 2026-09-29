import type { Item } from './types';

export const ITEMS: Record<string, Item> = {
  smallKnife: { id: 'smallKnife', name: 'Small Knife', description: 'Plain, sharp, and better than bare hands.', category: 'weapon', carryable: false },
  lantern: { id: 'lantern', name: 'Lantern', description: 'Its warm flame pushes back the crypt-dark.', category: 'tool', carryable: false },
  brassCandlestick: { id: 'brassCandlestick', name: 'Brass Candlestick', description: 'Heavy enough to serve as an improvised weapon.', category: 'weapon', carryable: true },
  boneKey: { id: 'boneKey', name: 'Bone Key', description: 'A finger-bone carved with tiny warding marks.', category: 'run-only', carryable: false },
  ironHandbell: { id: 'ironHandbell', name: 'Iron Handbell', description: 'Cold iron, old soil in its seams. Its clapper is missing.', category: 'run-only', carryable: false },
  blackClapper: { id: 'blackClapper', name: 'Black Iron Clapper', description: 'Far too heavy for the little handbell.', category: 'run-only', carryable: false },
  bronzeMaskFragment: { id: 'bronzeMaskFragment', name: 'Bronze Mask Fragment', description: 'Warm in moonlight. Its purpose is unknown.', category: 'artifact', carryable: true },
  graveCoin: { id: 'graveCoin', name: 'Grave Coin', description: 'A silver funeral token accepted by collectors and ferrymen.', category: 'valuable', carryable: true },
  yewCharm: { id: 'yewCharm', name: 'Yew Charm', description: 'A tiny ward tied with the priest’s red thread.', category: 'charm', carryable: true },
  pocketToolkit: { id: 'pocketToolkit', name: 'Pocket Toolkit', description: 'A compact railway kit: pliers, driver, punch, and oil.', category: 'tool', carryable: true },
  travelRope: { id: 'travelRope', name: 'Travel Rope', description: 'Twenty feet of good braided cord with a locking hook.', category: 'tool', carryable: true },
  conductorWhistle: { id: 'conductorWhistle', name: 'Conductor’s Whistle', description: 'A bright brass whistle that carries over machinery and weather.', category: 'valuable', carryable: true },
  signalLens: { id: 'signalLens', name: 'Crimson Signal Lens', description: 'Thick red glass from an old railway signal, warm at its center.', category: 'artifact', carryable: true },
  railwayMap: { id: 'railwayMap', name: 'Railway Map', description: 'A folded route map marked with gradients, sidings, and mileposts.', category: 'run-only', carryable: false },
  brakeKey: { id: 'brakeKey', name: 'Brake Cabinet Key', description: 'A square iron key on a red cord.', category: 'run-only', carryable: false },
  workGloves: { id: 'workGloves', name: 'Work Gloves', description: 'Thick leather gloves made for hot iron and rough cable.', category: 'run-only', carryable: false },
  ratBait: { id: 'ratBait', name: 'Farm Bait Tin', description: 'A small tin of seed and dried apple for setting practical traps.', category: 'run-only', carryable: false },
  wireTraps: { id: 'wireTraps', name: 'Wire Traps', description: 'Two sturdy spring traps borrowed from the farm store.', category: 'run-only', carryable: false },
  smokeBellows: { id: 'smokeBellows', name: 'Hand Bellows', description: 'A compact bellows for directing damp, cool smoke from a safe distance.', category: 'run-only', carryable: false },
  ratCatchersHook: { id: 'ratCatchersHook', name: 'Rat-Catcher’s Hook', description: 'A stout iron hook useful for shifting debris without reaching into dark spaces.', category: 'tool', carryable: true },
  heavyLeatherGloves: { id: 'heavyLeatherGloves', name: 'Heavy Leather Gloves', description: 'A well-made pair of thick farm gloves, sound enough for another hard day.', category: 'armor', carryable: true },
  minerHeadlamp: { id: 'minerHeadlamp', name: 'Miner’s Headlamp', description: 'A rugged carbide lamp with a bright, steady beam.', category: 'tool', carryable: true },
  foremanMultiTool: { id: 'foremanMultiTool', name: 'Foreman’s Multi-tool', description: 'A worn but dependable folding tool for small repairs.', category: 'tool', carryable: true },
  mineSurveyMap: { id: 'mineSurveyMap', name: 'Mine Survey Map', description: 'A folded map of the old levels and a marked side drift.', category: 'run-only', carryable: false },
};

export const STARTING_ITEMS = ['smallKnife', 'lantern'];
