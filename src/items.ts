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
};

export const STARTING_ITEMS = ['smallKnife', 'lantern'];
