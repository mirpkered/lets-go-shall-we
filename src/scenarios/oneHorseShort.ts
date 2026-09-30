import type { Scenario } from '../types';

export const ONE_HORSE_SHORT: Scenario = {
  id: 'one-horse-short', title: 'One Horse Short', subtitle: 'The remaining horse cannot safely pull the whole load.', startScene: 'roadsideParty',
  timePhases: [{ id: 'morning', label: 'Cool Morning', atMinutes: 0 }, { id: 'warm', label: 'The Day Warms', atMinutes: 25 }, { id: 'late', label: 'Late Arrival', atMinutes: 50 }],
  runRandomSelections: [{ id: 'driver', values: ['Tavish', 'Ilse', 'Malkin', 'Beryl', 'Corbett'].map((value) => ({ value })) }],
  scenes: {
    roadsideParty: { id: 'roadsideParty', title: 'One Horse Will Not Pull', tone: 'warning', text: 'You travel with a small wagon party led by {{driver}}. One of the two horses has thrown a shoe and favors the hoof; the other stands sound. The wagon carries flour and bedding. The mill is eight miles ahead, and a farm is a mile behind.', choices: [
      { id: 'lightenLoad', label: 'Leave some flour in a marked stack', hint: 'The healthy horse can pull less weight without strain.', timeCost: 8, next: 'lightenedWagon', effects: { historyFlags: ['left_cargo_to_protect_draft_horse'] } },
      { id: 'walkBesideWagon', label: 'Walk beside the wagon and spare the horse', hint: 'The full load moves slowly; no one rides.', timeCost: 25, next: 'slowJourney', effects: { historyFlags: ['walked_with_limited_team'] } },
      { id: 'returnForHorse', label: 'Take the lame horse back to the farm', hint: 'The party loses time but avoids working the injured hoof.', timeCost: 20, next: 'farmStable', effects: { historyFlags: ['sought_replacement_for_draft_horse'] } },
      { id: 'pushFullLoad', label: 'Ask the sound horse to pull the full wagon', hint: 'The harness is already pulled tight. This may exhaust or injure the remaining horse.', timeCost: 10, chance: { probability: 0.48, lateProbability: 0.3, lateAfterMinutes: 25, successNext: 'lateMill', failureNext: 'teamStops', successMessage: 'The horse pulls the wagon to a level stretch, but it is tired and needs a long rest.', failureMessage: 'The sound horse balks and the wagon does not move. There is no safe way to force the load onward.' } },
    ] },
    lightenedWagon: { id: 'lightenedWagon', title: 'A Smaller Load', tone: 'safe', text: '{{driver}} agrees to leave four flour sacks beneath a canvas cover by the milepost. A folding trail marker or strap can mark the stack for recovery. The sound horse now has a lighter wagon to pull.', choices: [
      { id: 'markCargo', label: 'Mark the sacks for later recovery', requirements: { items: ['foldingTrailMarker'] }, next: 'lateMill', effects: { historyFlags: ['marked_left_cargo_for_recovery'] } },
      { id: 'lashLighterLoad', label: 'Secure the remaining sacks with a strap', requirements: { items: ['freightmansStrap'] }, next: 'lateMill', effects: { historyFlags: ['secured_reduced_wagon_load'] } },
      { id: 'leaveUnmarkedLoad', label: 'Leave the sacks covered and continue', next: 'lateMill', effects: { historyFlags: ['left_cargo_to_protect_draft_horse'] } },
    ] },
    slowJourney: { id: 'slowJourney', title: 'A Long Walk', tone: 'warning', text: 'The sound horse pulls at a walking pace while you and {{driver}} walk beside the wheel. The lame horse follows on a loose lead. No one is being forced to ride or pull, but the mill’s receiving window is closing.', choices: [
      { id: 'keepSlowPace', label: 'Keep the careful pace to the mill', timeCost: 20, next: 'lateMill', effects: { historyFlags: ['walked_with_limited_team'] } },
      { id: 'stopAtFarm', label: 'Stop at the next farm and rest the horses', timeCost: 8, next: 'farmStable' },
    ] },
    teamStops: { id: 'teamStops', title: 'The Horse Refuses the Load', tone: 'warning', text: 'The sound horse lowers its head and will not pull again. It is tired, not injured. {{driver}} can leave part of the flour here or take both horses to the farm stable for help.', choices: [
      { id: 'unloadAfterStop', label: 'Leave flour under cover and continue lightly', next: 'lateMill', effects: { historyFlags: ['left_cargo_to_protect_draft_horse'] } },
      { id: 'seekFarmAfterStop', label: 'Walk the horses back to the farm', timeCost: 12, next: 'farmStable' },
      { id: 'abandonWagon', label: 'Leave the wagon and keep the horses safe', next: 'farmStable', effects: { historyFlags: ['abandoned_wagon_to_protect_horses'] } },
    ] },
    farmStable: { id: 'farmStable', title: 'A Resting Place', tone: 'safe', ending: 'success', choices: [], text: 'The farmer gives the lame horse a stall and says the sound horse should rest before pulling again. The mill delivery will be late or lost, but neither animal is pushed beyond what it can safely do.' },
    lateMill: { id: 'lateMill', title: 'A Lighter Arrival', tone: 'safe', ending: 'success', choices: [], text: '{{driver}} reaches the mill late with the sound horse still willing to walk. Some cargo remains behind, but the animal is rested before the road continues.' },
  },
};
