import type { Scenario } from '../types';

export const THE_BORROWED_HORSE: Scenario = {
  id: 'the-borrowed-horse', title: 'The Borrowed Horse', subtitle: 'A shorter road is not worth an animal that cannot finish it.', startScene: 'roadSigns',
  timePhases: [{ id: 'morning', label: 'Morning Road', atMinutes: 0 }, { id: 'late', label: 'Late Morning', atMinutes: 25 }, { id: 'deadline', label: 'Delivery Window Closing', atMinutes: 50 }],
  runRandomSelections: [{ id: 'horseOwner', values: ['Willa', 'Sorrel', 'Mathis', 'Tilda', 'Orin'].map((value) => ({ value })) }],
  scenes: {
    roadSigns: { id: 'roadSigns', title: 'A Shortening Stride', tone: 'warning', text: '{{horseOwner}} lent you a steady bay mare for a message run to Bellford. The village is six miles ahead; your promised delivery earns three coins if it arrives before noon. On the last slope, the mare shortened her right foreleg stride twice. You are on a level stretch and can stop safely.', choices: [
      { id: 'stopAndInspect', label: 'Stop and inspect the mare’s foreleg', hint: 'A careful look may tell you whether she can continue.', timeCost: 5, next: 'hoofCheck', effects: { knowledge: ['The borrowed mare has a tender right forehoof.'] } },
      { id: 'walkTheMare', label: 'Dismount and walk toward Bellford', hint: 'Slower, but it avoids asking the mare to carry you.', timeCost: 25, next: 'lateArrival', effects: { historyFlags: ['walked_borrowed_horse_to_safety'] } },
      { id: 'pushForNoon', label: 'Ride on before the delivery window closes', hint: 'The uneven stride is visible. Pushing may worsen the hoof and strand you both.', timeCost: 15, chance: { probability: 0.62, lateProbability: 0.4, lateAfterMinutes: 25, successNext: 'paidArrival', failureNext: 'horseNeedsRest', successMessage: 'The mare keeps a steady pace to Bellford, though you ride gently.', failureMessage: 'The mare stops and will not put weight on the foreleg. Bellford is still several miles away.', successEffects: { money: 3 }, failureEffects: { setFlags: ['mareNeedsRest'] } } },
      { id: 'turnForFarm', label: 'Take the level farm lane instead', hint: 'It leads to a stable, away from the steep road.', timeCost: 30, next: 'stableArrival', effects: { historyFlags: ['prioritized_borrowed_horse'] } },
    ] },
    hoofCheck: { id: 'hoofCheck', title: 'A Tender Foot', tone: 'warning', text: 'The shoe is sound, but the mare flinches when you brush packed grit from the edge of the hoof. {{horseOwner}} had said the stable is two miles back; Bellford is four miles ahead. Heavy gloves protect your hands from the rough shoe, not the mare from more strain.', choices: [
      { id: 'clearGritAndRest', label: 'Clear the grit and let her rest', hint: 'A short rest costs time; if the limp remains, stop riding.', timeCost: 15, next: 'restedMare', effects: { setFlags: ['mareRested'], historyFlags: ['inspected_borrowed_horse'] } },
      { id: 'walkAfterCheck', label: 'Walk her to the farm stable', timeCost: 30, next: 'stableArrival', effects: { historyFlags: ['prioritized_borrowed_horse'] } },
      { id: 'rideAfterCheck', label: 'Ride slowly to Bellford', hint: 'Even a slow ride may worsen a tender hoof.', timeCost: 20, chance: { probability: 0.72, lateProbability: 0.5, lateAfterMinutes: 25, successNext: 'paidArrival', failureNext: 'horseNeedsRest', successMessage: 'The mare carries you the remaining miles without worsening the limp.', failureMessage: 'The mare stops again, favoring the sore foot.', successEffects: { money: 3 }, failureEffects: { setFlags: ['mareNeedsRest'] } } },
    ] },
    restedMare: { id: 'restedMare', title: 'The Mare Stands Quietly', tone: 'safe', text: 'After resting, the mare stands square on level ground. The farm stable is still behind you; Bellford remains ahead. The delivery window may close before you arrive, but the animal is no worse.', choices: [
      { id: 'walkRested', label: 'Walk the mare the remaining miles', timeCost: 25, next: 'lateArrival', effects: { historyFlags: ['walked_borrowed_horse_to_safety'] } },
      { id: 'rideRested', label: 'Ride gently toward Bellford', hint: 'The hoof is still tender; the road ahead is mostly level.', timeCost: 18, chance: { probability: 0.74, lateProbability: 0.52, lateAfterMinutes: 50, successNext: 'paidArrival', failureNext: 'horseNeedsRest', successMessage: 'The mare reaches Bellford with the hoof no worse.', failureMessage: 'The mare begins limping again before the village.', successEffects: { money: 3 }, failureEffects: { setFlags: ['mareNeedsRest'] } } },
      { id: 'returnStable', label: 'Return to the stable and end the ride', timeCost: 18, next: 'stableArrival', effects: { historyFlags: ['prioritized_borrowed_horse'] } },
    ] },
    horseNeedsRest: { id: 'horseNeedsRest', title: 'The Mare Will Go No Farther', tone: 'warning', text: 'The mare is standing, breathing hard, and refusing the next step. She is not badly hurt, but riding now could turn soreness into an injury. Bellford lies ahead; the farm stable is back along the level lane.', choices: [
      { id: 'leadToStable', label: 'Lead her back to the farm stable', timeCost: 20, next: 'stableArrival', effects: { historyFlags: ['prioritized_borrowed_horse'] } },
      { id: 'waitForHelp', label: 'Wait for a farm cart to come by', hint: 'You stay with the mare; the delivery will be late.', timeCost: 20, next: 'lateArrival', effects: { historyFlags: ['waited_with_borrowed_horse'] } },
      { id: 'leaveMareForHelp', label: 'Walk to the farm and bring help back', timeCost: 25, next: 'stableArrival', effects: { historyFlags: ['sought_help_for_borrowed_horse'] } },
    ] },
    paidArrival: { id: 'paidArrival', title: 'Message Delivered', tone: 'safe', ending: 'success', choices: [], text: 'You deliver the message before noon and receive the promised three coins. {{horseOwner}} checks the mare’s hoof before taking the reins. The ride was a risk, but she reaches the stable standing soundly.' },
    lateArrival: { id: 'lateArrival', title: 'A Late Arrival', tone: 'safe', ending: 'success', choices: [], text: 'The message arrives after the delivery window, and the three-coin fee is forfeited. {{horseOwner}} sees the mare returned on foot and thanks you for not pushing her farther.' },
    stableArrival: { id: 'stableArrival', title: 'Back at the Stable', tone: 'safe', ending: 'success', choices: [], text: 'You return the mare to the farm stable. {{horseOwner}} examines the tender hoof and keeps her off the road until it settles. The message and its fee are lost, but the horse is safe.' },
  },
};
