import type { Scenario } from '../types';

export const A_SEAT_BY_THE_FIRE: Scenario = {
  id: 'a-seat-by-the-fire', title: 'A Seat by the Fire', subtitle: 'There is warmth enough for some, not all.', startScene: 'crowdedRoom',
  diversity: { depthClass: 'ENCOUNTER', riskTier: 'LOW' },
  runRandomSelections: [{ id: 'parentName', values: ['Velma', 'Rafe', 'Celia', 'Bastian', 'Juno'].map((value) => ({ value })) }],
  scenes: {
    crowdedRoom: { id: 'crowdedRoom', title: 'One Dry Cot Left', tone: 'warning', text: 'Rain has filled the small inn’s common room. The keeper introduces {{parentName}}, a parent with a sleeping child, and a laborer whose shift begins before dawn. The keeper offers the only dry cot beside the stove to you or either traveler. A bench by the door is dry but cold; no one is hurt.', choices: [
      { id: 'offerCot', label: 'Offer the cot to {{parentName}} and the child', hint: 'They get the warm place; you will sleep on the cold bench.', next: 'benchNight', effects: { historyFlags: ['gave_up_warm_bed_for_travelers'] } },
      { id: 'askForRotation', label: 'Suggest taking turns near the stove', hint: 'It may share the warmth, though nobody gets a full night’s rest.', next: 'sharedWarmth' },
      { id: 'shareBlanket', label: 'Share your blanket if you have one', requirements: { anyItems: ['woolTravelBlanket', 'weatherproofBlanket'] }, hint: 'A blanket helps on the bench but cannot make more beds.', next: 'sharedWarmth', effects: { historyFlags: ['shared_blanket_at_inn'] } },
      { id: 'keepCot', label: 'Keep the cot the keeper offered you', hint: 'The others must settle for the bench and the stove-side floor.', next: 'keptCot' },
    ] },
    sharedWarmth: { id: 'sharedWarmth', title: 'A Night in Shifts', tone: 'safe', text: 'The keeper moves the bench nearer the stove and agrees to two-hour turns. {{parentName}} and the child take the first warm stretch; the laborer offers the last turn before dawn. It is cramped, but everyone has a chance to dry out.', choices: [
      { id: 'acceptRotation', label: 'Take your turn and keep the arrangement', next: 'sharedEnding', effects: { historyFlags: ['shared_warmth_at_inn'] } },
      { id: 'volunteerColdTurn', label: 'Take the coldest turn yourself', hint: 'The other travelers get more sleep; you will be tired tomorrow.', next: 'coldTurnEnding', effects: { historyFlags: ['took_cold_turn_for_travelers'] } },
    ] },
    benchNight: { id: 'benchNight', title: 'The Cold Bench', tone: 'warning', text: 'The child sleeps beside the stove. You have a dry bench by the door and your own clothing; the night is uncomfortable, not dangerous. The laborer offers to wake you if the room frees up.', choices: [
      { id: 'sleepBench', label: 'Sleep on the bench', next: 'sharedEnding', effects: { historyFlags: ['gave_up_warm_bed_for_travelers'] } },
      { id: 'askForBlanket', label: 'Ask the keeper for an extra blanket', requirements: { minMoney: 1 }, hint: 'You can pay one coin for the inn’s spare wool blanket.', next: 'sharedEnding', effects: { money: -1 } },
      { id: 'changeMindCot', label: 'Ask to take the cot after all', next: 'keptCot' },
    ] },
    keptCot: { id: 'keptCot', title: 'A Warm Place for You', tone: 'safe', ending: 'success', choices: [], text: 'You sleep in the dry cot beside the stove. {{parentName}} settles the child on the floor near the warmth, while the laborer takes the bench. In the morning everyone leaves for their own road; no one owes you gratitude, and no one is harmed.' },
    sharedEnding: { id: 'sharedEnding', title: 'Morning at the Inn', tone: 'safe', ending: 'success', choices: [], text: 'The room is still crowded at dawn, but everyone has dried clothes and some sleep. You leave without a gift or reward. For one wet night, a little space and the stove’s warmth were enough to share.' },
    coldTurnEnding: { id: 'coldTurnEnding', title: 'Cold Before Dawn', tone: 'warning', ending: 'success', choices: [], text: 'You take the coldest turn and wake stiff, but the others get a longer rest. The laborer thanks you quietly; {{parentName}} is already packing for the road.' },
  },
};
