import type { Scenario } from '../types';

export const THREE_MILES_TO_RAIN: Scenario = {
  id: 'three-miles-to-rain', title: 'Three Miles to Rain', subtitle: 'The inn is ahead, the storm is closer.', startScene: 'openRoad',
  timePhases: [{ id: 'clouds', label: 'Storm on the Ridge', atMinutes: 0 }, { id: 'firstRain', label: 'First Rain', atMinutes: 8 }, { id: 'downpour', label: 'The Road Soaks Through', atMinutes: 18 }],
  runRandomSelections: [{ id: 'cartTraveler', values: ['Sable', 'Devlin', 'Liora', 'Osmund', 'Maribel'].map((value) => ({ value })) }],
  scenes: {
    openRoad: { id: 'openRoad', title: 'Three Miles Ahead', tone: 'warning', text: 'A dark storm line is moving over the western ridge. You are on a broad road, with the Three Lantern Inn about three miles ahead. At a milepost, a traveler named {{cartTraveler}} struggles to pull a handcart whose canvas cover has come loose. You are still dry beneath the roadside trees.', choices: [
      { id: 'headForInn', label: 'Continue straight to the inn', hint: 'The road is clear and the shelter is three miles ahead.', timeCost: 12, next: 'innArrival', effects: { historyFlags: ['reached_shelter_before_storm'] } },
      { id: 'helpSecureCart', label: 'Help secure the traveler’s cart cover', hint: 'You will lose time before reaching the inn.', timeCost: 5, next: 'cartSecured', effects: { historyFlags: ['helped_traveler_before_storm'] } },
      { id: 'takeRidgeTrack', label: 'Try the shorter ridge track', hint: 'It saves distance but crosses an exposed slope.', timeCost: 7, chance: { probability: 0.6, lateProbability: 0.36, lateAfterMinutes: 8, bonusItems: ['trailCompass', 'weatherproofCloak'], bonusProbability: 0.12, successNext: 'ridgeCrossed', failureNext: 'ridgeBlocked', successMessage: 'The track is firm enough to cross before the rain reaches the slope.', failureMessage: 'Runoff has cut a rut across the ridge track. You turn back to the main road.' } },
      { id: 'shelterUnderTrees', label: 'Wait beneath the roadside trees', hint: 'You stay out of the open, but the inn will be farther in the rain.', timeCost: 10, next: 'rainAtRoad' },
    ] },
    cartSecured: { id: 'cartSecured', title: 'Canvas Tied Down', tone: 'warning', text: '{{cartTraveler}}’s goods are covered again. The storm now hides the ridge, and the inn is still two miles ahead. A dry stone sheep shelter stands beside the road; it is small but open.', choices: [
      { id: 'walkTogetherToInn', label: 'Walk with {{cartTraveler}} to the inn', hint: 'The rain may catch you before you arrive.', timeCost: 10, next: 'lateInn', effects: { historyFlags: ['shared_road_to_shelter'] } },
      { id: 'waitInSheepShelter', label: 'Wait in the stone shelter', hint: 'You both stay out of the worst rain; the inn can wait.', timeCost: 8, next: 'sharedShelter' },
      { id: 'leaveTravelerSheltered', label: 'Leave the traveler and continue alone', timeCost: 9, next: 'lateInn' },
    ] },
    ridgeCrossed: { id: 'ridgeCrossed', title: 'The Track Holds', tone: 'warning', text: 'You reach the lower road without slipping. Rain begins on the exposed slope behind you. The inn’s lights are visible through the trees, less than a mile away.', choices: [
      { id: 'reachInnFast', label: 'Keep moving to the inn', timeCost: 5, next: 'innArrival' },
      { id: 'markRidgeTrack', label: 'Mark the ridge track for others', requirements: { items: ['foldingTrailMarker'] }, hint: 'The marker warns the next traveler before they climb.', timeCost: 2, next: 'lateInn', effects: { historyFlags: ['marked_storm_damaged_route'] } },
    ] },
    ridgeBlocked: { id: 'ridgeBlocked', title: 'Runoff Across the Track', tone: 'danger', text: 'Water has cut a shallow channel across the ridge track. It is not a ravine, but the slick bank is too steep to cross safely. The main road is downhill, and rain is beginning.', choices: [
      { id: 'downhillToInn', label: 'Return to the main road and reach the inn', timeCost: 8, next: 'lateInn' },
      { id: 'waitForRainToEase', label: 'Wait under the rock overhang', hint: 'You stay sheltered while the first runoff passes.', timeCost: 8, next: 'shelterEnding' },
      { id: 'leaveTrackMarked', label: 'Mark the washed track and turn back', requirements: { items: ['foldingTrailMarker'] }, next: 'shelterEnding', effects: { historyFlags: ['marked_storm_damaged_route'] } },
    ] },
    rainAtRoad: { id: 'rainAtRoad', title: 'Rain on the Road', tone: 'warning', text: 'The shower reaches the road while you wait. Water runs along the wheel ruts, but the roadside shelter is sound and the inn remains ahead. You are damp, not in immediate danger.', choices: [
      { id: 'walkToInnInRain', label: 'Walk on to the inn', timeCost: 10, next: 'lateInn' },
      { id: 'staySheltered', label: 'Wait until the worst passes', timeCost: 8, next: 'shelterEnding' },
    ] },
    sharedShelter: { id: 'sharedShelter', title: 'Rain on the Stone Roof', tone: 'safe', text: 'You and {{cartTraveler}} sit beneath the low stone roof while rain drums on it. They share a heel of bread and tell you they are bound for the next market town. The cart stays dry against the wall; nothing demands your attention for a while.', choices: [
      { id: 'partAfterRain', label: 'Part when the shower eases', timeCost: 10, next: 'shelterEnding', effects: { historyFlags: ['shared_road_to_shelter'] } },
    ] },
    innArrival: { id: 'innArrival', title: 'Under a Dry Roof', tone: 'safe', ending: 'success', choices: [], text: 'You reach the Three Lantern Inn before the road turns to mud. The storm drums on the roof while you dry your clothes. The traveler and handcart are not in sight.' },
    lateInn: { id: 'lateInn', title: 'A Wet Arrival', tone: 'warning', ending: 'success', choices: [], text: 'You reach the inn in steady rain. Your cloak or blanket would have kept more of the water off, but the road is behind you. {{cartTraveler}} reaches shelter too if you walked together.' },
    shelterEnding: { id: 'shelterEnding', title: 'A Roadside Pause', tone: 'safe', ending: 'success', choices: [], text: 'You spend the worst of the shower under stone and trees. The road can wait until the ruts drain; no one is forced to cross the exposed ridge.' },
  },
};
