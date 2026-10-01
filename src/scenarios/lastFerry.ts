import type { Scenario } from '../types';

export const THE_LAST_FERRY: Scenario = {
  id: 'the-last-ferry', title: 'The Last Ferry', subtitle: 'The crossing is closed, and evening is settling over the river.', startScene: 'ferryLanding',
  timePhases: [{ id: 'evening', label: 'Last Crossing Hour', atMinutes: 0 }, { id: 'closing', label: 'Ferry Day Nearly Done', atMinutes: 15 }, { id: 'night', label: 'Night at the Landing', atMinutes: 30 }],
  runRandomSelections: [{ id: 'ferryman', values: ['Lavinia', 'Hob', 'Merrick', 'Anselm', 'Della'].map((value) => ({ value })) }],
  scenes: {
    ferryLanding: { id: 'ferryLanding', title: 'The Ferry Is Held', tone: 'warning', text: 'You reach the river landing near dusk. The flat ferryboat is secured against the near bank; its guiding rope has parted at a wooden post. The ferryman, {{ferryman}}, keeps two travelers on the far bank away from the water. The current is swift, and this is the last scheduled crossing.', choices: [
      { id: 'inspectFerryLine', label: 'Inspect the broken ferry post', timeCost: 2, next: 'lineDamage', effects: { knowledge: ['The ferry line failed at its shore post; the boat is still secured.'] } },
      { id: 'offerRope', label: 'Offer your rope and clamp', requirements: { items: ['travelRope'] }, hint: 'The ferryman can supply a spare line; your clamp may secure the shore end.', timeCost: 3, chance: { probability: 0.78, lateProbability: 0.58, lateAfterMinutes: 15, bonusItems: ['ironRopeClamp', 'freightmansStrap'], bonusProbability: 0.12, successNext: 'ferryReset', failureNext: 'lineDamage', successMessage: 'The line holds against the post while {{ferryman}} tests the boat.', failureMessage: 'The wet post splits under the strain. The ferry remains tied to shore.' } },
      { id: 'walkToUpperCrossing', label: 'Take the longer road to the upper ford', hint: 'The ford is shallow but adds several miles; do not enter if the current rises.', timeCost: 20, next: 'fordArrival', effects: { historyFlags: ['took_long_route_around_closed_ferry'] } },
      { id: 'waitForMorning', label: 'Stay at the landing until morning', hint: 'The safe crossing can wait until the ferryman replaces the post.', next: 'nightAtLanding', effects: { historyFlags: ['waited_for_ferry_repair'] } },
    ] },
    lineDamage: { id: 'lineDamage', title: 'A Split Shore Post', tone: 'warning', text: 'The rope did not part; the wooden post split where it was sunk in the bank. {{ferryman}} has a spare length of line but no sound post. A stone ring is fixed into the landing wall, and the ferry is still held at shore.', choices: [
      { id: 'secureAtStoneRing', label: 'Secure the spare line to the stone ring', hint: 'A clamp or strap helps keep the wet line from slipping.', timeCost: 8, chance: { probability: 0.62, lateProbability: 0.43, lateAfterMinutes: 15, bonusItems: ['ironRopeClamp', 'freightmansStrap', 'travelRope'], bonusProbability: 0.14, successNext: 'ferryReset', failureNext: 'ferryCloses', successMessage: 'The stone ring holds as the ferryman tests the replacement line.', failureMessage: 'The rope slips on the wet stone. The ferry cannot be opened before dark.' } },
      { id: 'askFerrymanToWait', label: 'Wait while the ferryman resets the line', timeCost: 12, next: 'ferryReset' },
      { id: 'takeRoadInstead', label: 'Leave for the upper ford', timeCost: 20, next: 'fordArrival' },
    ] },
    ferryReset: { id: 'ferryReset', title: 'The Boat Can Cross', tone: 'warning', text: 'The spare line is secured to the stone ring. {{ferryman}} tests the boat close to the bank before taking anyone aboard. The far-bank travelers can cross in one trip, but the current still pulls hard on the rope.', choices: [
      { id: 'crossWithFerryman', label: 'Cross with the ferryman at the tiller', hint: 'The ferry is tested and controlled; stay seated while the line is under load.', timeCost: 8, next: 'crossedEnding', effects: { historyFlags: ['helped_reopen_last_ferry'] } },
      { id: 'helpFarBankTravelers', label: 'Let the far-bank travelers cross first', timeCost: 8, next: 'crossedEnding', effects: { historyFlags: ['helped_stranded_ferry_travelers'] } },
      { id: 'stopForTheNight', label: 'Let the ferryman close for the night', next: 'ferryCloses' },
    ] },
    ferryCloses: { id: 'ferryCloses', title: 'The Landing Closes', tone: 'safe', text: 'The current is too strong to test the line after dark. {{ferryman}} leads the far-bank travelers to a lit farmhouse and offers you shelter on this side. The crossing will reopen after a proper post is fitted.', choices: [
      { id: 'stayOnNearBank', label: 'Stay at the landing until morning', next: 'nightAtLanding', effects: { historyFlags: ['waited_for_ferry_repair'] } },
      { id: 'useUpperFord', label: 'Walk to the upper ford before dark', hint: 'The route is longer, but it avoids the damaged ferry line.', timeCost: 20, next: 'fordArrival' },
    ] },
    crossedEnding: { id: 'crossedEnding', title: 'Across the River', tone: 'safe', ending: 'success', choices: [], text: 'The ferry reaches the far bank under {{ferryman}}’s hand. The two waiting travelers board after you, and the damaged post is left marked for repair before the next crossing.' },
    fordArrival: { id: 'fordArrival', title: 'The Upper Ford', tone: 'warning', text: 'The upper ford is ankle-deep at the edge and slower in midstream. Rain has not raised the current yet. You can cross carefully now or wait for daylight.', choices: [
      { id: 'crossFordCarefully', label: 'Cross at the shallow markers', hint: 'The stones are slick; use the marked, shallow route.', timeCost: 10, chance: { probability: 0.76, successNext: 'fordEnding', failureNext: 'waitFord', successMessage: 'You keep to the shallow stones and reach the far bank.', failureMessage: 'A stone rolls underfoot. You regain the near bank wet and bruised.', failureEffects: { health: -1 } } },
      { id: 'waitFordMorning', label: 'Wait for the water and light to improve', next: 'nightAtLanding', effects: { historyFlags: ['waited_for_ferry_repair'] } },
    ] },
    waitFord: { id: 'waitFord', title: 'Wet Boots, Firm Ground', tone: 'safe', text: 'You are back on firm ground with wet boots. The water is not worth another rushed crossing. The landing house is open for the night.', choices: [
      { id: 'waitForDay', label: 'Wait until morning', next: 'nightAtLanding', effects: { historyFlags: ['waited_for_ferry_repair'] } },
      { id: 'tryFordAgain', label: 'Try the shallows once more', hint: 'The markers are clear, but the stones remain slick.', timeCost: 5, chance: { probability: 0.65, successNext: 'fordEnding', failureNext: 'nightAtLanding', successMessage: 'You cross at the markers without stepping into the deeper current.', failureMessage: 'The ford remains unsafe, so you return to the landing for the night.', failureEffects: { historyFlags: ['waited_for_ferry_repair'] } } },
    ] },
    fordEnding: { id: 'fordEnding', title: 'The Far Bank', tone: 'safe', ending: 'success', choices: [], text: 'You reach the far bank by the upper ford. The ferryman’s crossing remains closed, but the longer route carried you safely across.' },
    nightAtLanding: { id: 'nightAtLanding', title: 'A Night Beside the River', tone: 'safe', countsForProgression: false, text: 'You settle in the landing house on the near bank. The ferryman checks the line once before turning in; across the water, the two travelers are safe at the farmhouse. The current keeps up its steady noise through the dark. At first light, {{ferryman}} brings a sound post down to the shore.', choices: [
      { id: 'crossAtFirstLight', label: 'Cross once the new post is tested', next: 'morningFerry' },
    ] },
    morningFerry: { id: 'morningFerry', title: 'The Ferry Opens Again', tone: 'safe', ending: 'success', choices: [], text: 'At first light the ferryman sets the new post and tests the line. The boat holds steady, and you cross without hurry. Waiting cost you an evening, but the river stayed between you and the night.' },
  },
};
