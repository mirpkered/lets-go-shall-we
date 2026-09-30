import type { Scenario } from '../types';

export const THE_BELL_AFTER_MIDNIGHT: Scenario = {
  id: 'the-bell-after-midnight', title: 'The Bell After Midnight', subtitle: 'One stroke from the town bell, then silence.', startScene: 'innAtNight',
  runRandomSelections: [{ id: 'stablehand', values: ['Violet', 'Cyrus', 'Mina', 'Rufus', 'Dell'].map((value) => ({ value })) }],
  scenes: {
    innAtNight: { id: 'innAtNight', title: 'One Bell Stroke', tone: 'warning', text: 'At the roadside inn, one hard stroke of its yard bell wakes you after midnight. The keeper told guests that three measured peals mean fire or flood; one stroke usually calls help at the stable. From your window, a dim orange glow shows near the stable.', choices: [
      { id: 'wakeTheKeeper', label: 'Wake the keeper and warn them', hint: 'You stay inside while the keeper checks the yard.', next: 'keeperWakes', effects: { historyFlags: ['answered_midnight_bell'] } },
      { id: 'takeLightOutside', label: 'Take a light outside', hint: 'The glow may be a dropped lamp near straw.', requirements: { anyItems: ['lantern', 'minerHeadlamp'] }, next: 'stableYard' },
      { id: 'stayInBed', label: 'Stay inside and let the keeper respond', hint: 'You remain safe; the keeper has heard the bell too.', next: 'morningAfterBell' },
    ] },
    keeperWakes: { id: 'keeperWakes', title: 'The Keeper Checks the Yard', tone: 'warning', text: 'The keeper sees the same glow and takes a bucket. At the stable door, a small lantern has tipped into loose straw; {{stablehand}} is sitting beside it with a twisted ankle. The stall doors are shut and the horses are safe.', choices: [
      { id: 'douseStraw', label: 'Douse the smoking straw with water', hint: 'The flame is small and the water barrel is beside the door.', next: 'stableSafe', effects: { historyFlags: ['helped_at_stable_fire'] } },
      { id: 'helpStablehand', label: 'Help {{stablehand}} stand and move clear', requirements: { anyItems: ['fieldBandageRoll', 'heavyLeatherGloves'] }, next: 'stableSafe', effects: { historyFlags: ['helped_injured_stablehand'] } },
      { id: 'wakeOtherGuests', label: 'Wake the nearest guests to bring water', timeCost: 3, next: 'stableSafe' },
    ] },
    stableYard: { id: 'stableYard', title: 'A Small Fire in Straw', tone: 'warning', text: 'At the stable door, the orange glow comes from a lantern tipped into loose straw. The flame is small but smoking. {{stablehand}} sits just outside with a twisted ankle. The doors are closed; the horses are inside and safe. A water barrel stands beside the entrance.', choices: [
      { id: 'pourWater', label: 'Use the barrel to soak the straw', hint: 'The fire is still small; keep clear of the stable door.', next: 'stableSafe', effects: { historyFlags: ['helped_at_stable_fire'] } },
      { id: 'leadStablehandClear', label: 'Help {{stablehand}} farther from the smoke', next: 'stableSafe', effects: { historyFlags: ['helped_injured_stablehand'] } },
      { id: 'callForKeeper', label: 'Call the keeper and fetch more water', timeCost: 3, next: 'stableSafe' },
    ] },
    stableSafe: { id: 'stableSafe', title: 'The Yard Settles', tone: 'safe', ending: 'success', choices: [], text: 'The straw is soaked before the fire reaches the stalls. The keeper treats {{stablehand}}’s ankle and checks the horses. The stablehand pulled the yard bell once for help, then slipped and twisted an ankle outside the stable.' },
    morningAfterBell: { id: 'morningAfterBell', title: 'Morning at the Inn', tone: 'safe', ending: 'success', choices: [], text: 'The keeper puts out the small stable fire before it reaches the stalls. In the morning, {{stablehand}} is resting with a wrapped ankle. The single bell stroke was an interrupted call for help, not a town-wide alarm.' },
  },
};
