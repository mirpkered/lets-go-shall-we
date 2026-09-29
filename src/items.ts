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
};

export const STARTING_ITEMS = ['smallKnife', 'lantern'];
