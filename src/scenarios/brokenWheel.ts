import type { Scenario } from '../types';

const REPAIR_GEAR = ['compactWheelWrench', 'pocketToolkit', 'foremanMultiTool', 'bridgewrightHammer'];

export const THE_BROKEN_WHEEL: Scenario = {
  id: 'the-broken-wheel', title: 'The Broken Wheel', subtitle: 'A split hub has stopped a loaded wagon on the road.', startScene: 'roadsideWagon',
  timePhases: [{ id: 'afternoon', label: 'Afternoon', atMinutes: 0 }, { id: 'dusk', label: 'Dusk Approaching', atMinutes: 25 }, { id: 'dark', label: 'Road Going Dark', atMinutes: 45 }],
  runRandomSelections: [{ id: 'driver', values: ['Perrin', 'Maud', 'Alistair', 'Rosamund', 'Kit'].map((value) => ({ value })) }],
  scenes: {
    roadsideWagon: { id: 'roadsideWagon', title: 'A Wheel Out of Line', tone: 'warning', text: 'You are riding with {{driver}}’s produce wagon toward the next market. The right rear wheel has tilted inward; its wooden hub split on a rut. The wagon is stopped on level ground with the horse tethered to a roadside post. The market is four miles ahead, and daylight is fading.', choices: [
      { id: 'inspectWheel', label: 'Inspect the broken hub', timeCost: 3, next: 'hubDamage', effects: { knowledge: ['The wagon hub is split and cannot safely carry its full load.'] } },
      { id: 'walkForSmith', label: 'Walk to the smith for help', hint: 'Safe, but the wagon and its produce wait on the road.', timeCost: 20, next: 'smithReturns', effects: { setFlags: ['smithSummoned'] } },
      { id: 'unloadWagon', label: 'Unload the produce and carry essentials', hint: 'The cargo can be protected, but the market delivery will be lost.', next: 'cargoSaved', effects: { historyFlags: ['saved_wagon_cargo_after_breakdown'] } },
      { id: 'leaveWagon', label: 'Leave the wagon and continue on foot', hint: 'You remain safe; the owner must arrange another recovery.', next: 'wagonAbandoned', effects: { historyFlags: ['left_wagon_after_breakdown'] } },
    ] },
    hubDamage: { id: 'hubDamage', title: 'The Split Hub', tone: 'warning', text: 'The hub has opened along the grain. A wrench can tighten the iron band, but it cannot mend the split wood. {{driver}} has a short plank and rope in the wagon; unloading weight may let the wheel turn slowly until the smith is reached.', textVariants: [{ requirements: { items: ['compactWheelWrench'], historyFlags: ['bought_at_roadside_tinker_compactWheelWrench'] }, text: 'The hub has opened along the grain. Your Compact Wheel Wrench bears the small blue mark of the roadside tinker who sold it to you. It fits the iron band, though no wrench can mend the split wood. {{driver}} has a short plank and rope in the wagon; unloading weight may let the wheel turn slowly until the smith is reached.' }], choices: [
      { id: 'bindHub', label: 'Bind the hub for a slow trip', hint: 'A wrench or toolkit can seat the iron band; this is only a temporary repair.', timeCost: 8, chance: { probability: 0.55, lateProbability: 0.38, lateAfterMinutes: 25, bonusItems: REPAIR_GEAR, bonusProbability: 0.16, successNext: 'marketArrival', failureNext: 'hubGivesWay', successMessage: 'The band closes enough to carry the lightened wagon at a walking pace.', failureMessage: 'The band slips as the split opens. The wagon must be unloaded or hauled to a smith.', successEffects: { money: 2 } } },
      { id: 'lightenAndDrag', label: 'Unload weight and lash a drag support', hint: 'A rope or freight strap steadies the load; the wagon will move very slowly.', timeCost: 15, chance: { probability: 0.75, lateProbability: 0.58, lateAfterMinutes: 25, bonusItems: ['travelRope', 'freightmansStrap'], bonusProbability: 0.12, successNext: 'lateMarket', failureNext: 'hubGivesWay', successMessage: 'The lightened wagon rolls carefully toward the smith.', failureMessage: 'The hub shifts again. The load is safe, but the wheel cannot turn.', successEffects: { money: 1 } } },
      { id: 'sendDriverToSmith', label: 'Send {{driver}} for the smith', timeCost: 18, next: 'smithReturns', effects: { setFlags: ['smithSummoned'] } },
      { id: 'useWheelWrench', label: 'Use your Compact Wheel Wrench on the iron band', hint: 'A direct fit for the hub band; the split wood still needs a smith.', requirements: { items: ['compactWheelWrench'] }, timeCost: 8, chance: { probability: 0.72, lateProbability: 0.55, lateAfterMinutes: 25, successNext: 'marketArrival', failureNext: 'hubGivesWay', successMessage: 'The band tightens enough for the lightened wagon to roll slowly.', failureMessage: 'The split widens before the band can hold; the smith must take over.', successEffects: { money: 2, historyFlags: ['used_compact_wheel_wrench_on_wagon_hub'] } } },
    ] },
    hubGivesWay: { id: 'hubGivesWay', title: 'The Wheel Settles', tone: 'warning', text: 'The wheel is back on level ground, but the split hub will not carry the load. The produce remains under canvas. The smith is in the next village; dark is not far off.', choices: [
      { id: 'carryCargoFromWagon', label: 'Carry the produce to the farm store', next: 'cargoSaved', effects: { historyFlags: ['saved_wagon_cargo_after_breakdown'] } },
      { id: 'waitForSmith', label: 'Wait with {{driver}} for the smith', timeCost: 10, next: 'smithReturns', effects: { setFlags: ['smithSummoned'] } },
      { id: 'leaveBrokenWagon', label: 'Leave the wagon secured by the road', next: 'wagonAbandoned', effects: { historyFlags: ['left_wagon_after_breakdown'] } },
      { id: 'liftForUnloading', label: 'Use the Folding Carriage Jack to lift the wheel for unloading', requirements: { items: ['foldingCarriageJack'] }, next: 'cargoSaved', effects: { historyFlags: ['used_carriage_jack_to_unload_broken_wagon'] } },
    ] },
    smithReturns: { id: 'smithReturns', title: 'The Smith Arrives', tone: 'safe', text: 'The village smith arrives with a sound spare hub and a handcart. {{driver}} keeps the horse on firm ground while the smith checks the axle. The market window has passed, but the wagon can be repaired without rushing it.', choices: [
      { id: 'helpSmith', label: 'Help move the load onto the handcart', next: 'cargoSaved' },
      { id: 'walkToMarketLate', label: 'Walk with {{driver}} to the market', next: 'lateMarket', effects: { money: 1 } },
      { id: 'leaveWithThanks', label: 'Leave once the wagon is safe', next: 'wagonAbandoned' },
    ] },
    marketArrival: { id: 'marketArrival', title: 'The Market Reached', tone: 'safe', ending: 'success', choices: [], text: 'You reach the market at a walking pace. {{driver}} delivers the produce and pays your agreed two coins. The hub will need proper repair before another trip.' },
    lateMarket: { id: 'lateMarket', title: 'A Late Delivery', tone: 'safe', ending: 'success', choices: [], text: 'The produce reaches the village after the market closes. {{driver}} pays you one coin for staying to help; the wheel is left with the smith for a sound repair.' },
    cargoSaved: { id: 'cargoSaved', title: 'The Load Is Safe', tone: 'safe', ending: 'success', choices: [], text: 'The produce is stored under a dry roof, and the horse is returned to its stable. The market delivery is lost, but the broken hub is not allowed to destroy the load or injure the animal.' },
    wagonAbandoned: { id: 'wagonAbandoned', title: 'Back on the Road', tone: 'safe', ending: 'success', choices: [], text: 'You leave the wagon on level ground with the horse tethered and the load covered. The owner must arrange recovery. You continue on foot without pay for the unfinished trip.' },
  },
};
