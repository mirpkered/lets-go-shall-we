import type { Choice, Scenario } from '../types';

const DOOR_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'ratCatchersHook', 'brassCandlestick', 'bridgewrightHammer'];

function doorChoice(withTool: boolean): Choice {
  return {
    id: withTool ? 'freePumpShedDoorWithTool' : 'freePumpShedDoorByHand',
    label: withTool ? 'Lift the swollen latch with your carried tool' : 'Work the swollen door by hand',
    hint: withTool ? 'A hook or lever can take pressure off the warped frame.' : 'The door is heavy and the bank is slick; forcing it may hurt your hands or shoulder.',
    requirements: withTool ? { anyItems: DOOR_TOOLS } : { notItems: DOOR_TOOLS },
    timeCost: withTool ? 4 : 8,
    effects: { setFlags: ['attempted_shed_rescue'] },
    chance: {
      probability: withTool ? 0.88 : 0.64,
      bonusItems: withTool ? ['heavyLeatherGloves', 'travelRope'] : ['heavyLeatherGloves'],
      bonusProbability: 0.08,
      successNext: 'childOut',
      failureNext: 'doorResists',
      successMessage: withTool ? 'The latch lifts clear of the warped frame. Nessa steps out into the rain.' : 'The door gives enough for Nessa to squeeze through. You keep one hand between her and the sharp frame.',
      failureMessage: 'The frame shifts but does not open. You pull back with a sore shoulder; the child remains sheltered inside.',
          successEffects: { setFlags: ['childOutOfShed'], historyFlags: ['found_missing_child', 'rescued_child_from_hazard'] },
      failureEffects: { health: withTool ? -1 : -2, setFlags: ['shedDoorShifted'] },
    },
  };
}

function rewardChoices(): Choice[] {
  return [
    { id: 'acceptTrailWhistle', label: 'Accept the Trail Whistle', requirements: { notItems: ['trailWhistle'] }, effects: { gainItems: ['trailWhistle'] }, next: 'safeReturnEnding' },
    { id: 'acceptWeatherproofBlanket', label: 'Accept the Weatherproof Blanket', requirements: { notItems: ['weatherproofBlanket'] }, effects: { gainItems: ['weatherproofBlanket'] }, next: 'safeReturnEnding' },
    { id: 'declineSearchReward', label: 'Thank the family and leave without gear', next: 'safeReturnEnding' },
  ];
}

export const THE_EMPTY_CRADLE: Scenario = {
  id: 'the-empty-cradle',
  title: 'The Empty Cradle',
  subtitle: 'A fresh trail, a rising creek, and several places a child might go.',
  startScene: 'searchAlarm',
  timePhases: [
    { id: 'recent', label: 'Recent', atMinutes: 0 },
    { id: 'fading', label: 'Fading', atMinutes: 8 },
    { id: 'worsening', label: 'Worsening', atMinutes: 18 },
    { id: 'critical', label: 'Critical', atMinutes: 30 },
    { id: 'aftermath', label: 'Aftermath', atMinutes: 42 },
  ],
  scenes: {
    searchAlarm: {
      id: 'searchAlarm', title: 'A Child Missing', tone: 'warning',
      text: 'At the small settlement of Alderbrook, seven-year-old Nessa has been missing for about twenty minutes. Her mother last saw her near the south yard gate. A cold rain has just begun, the creek beyond the lower field is rising, and the light will fail before evening. Her older brother and two neighbors are already searching, but no one agrees which way she went.',
      textVariants: [{ requirements: { historyFlags: ['found_missing_child'] }, text: 'You remember helping find a missing child before. Seven-year-old Nessa has been gone about twenty minutes. Her mother last saw her at the south yard gate; cold rain is starting, and the creek beyond the field is rising.' }],
      choices: [
        { id: 'questionFamilyFirst', label: 'Ask the family what they know', hint: 'A few minutes of testimony may narrow the search.', timeCost: 3, next: 'familyAccounts', effects: { historyFlags: ['joined_missing_child_search'] } },
        { id: 'inspectYardFirst', label: 'Read the ground around the yard gate', timeCost: 4, next: 'yardClues', effects: { historyFlags: ['joined_missing_child_search', 'prioritized_tracking_over_questioning'] } },
        { id: 'sendForSearchersEarly', label: 'Go for more searchers now', hint: 'The extra hands will take time to reach the farm.', timeCost: 12, next: 'searchPartyArrives', effects: { historyFlags: ['joined_missing_child_search', 'sought_outside_help_for_child'] } },
        { id: 'continuePastAlderbrook', label: 'Continue along the road', next: 'refusalEnding', effects: { historyFlags: ['refused_child_search'] } },
      ],
    },
    familyAccounts: {
      id: 'familyAccounts', title: 'Three Uncertain Accounts', tone: 'warning',
      text: 'Nessa’s mother last saw her with a little tin boat near the south gate. Her brother Tom thought she might have followed Bramble, the farm dog, but admits he turned away to close a fence and did not see where either went. A neighbor saw a flash of red by the lane; it may have been Nessa’s scarf or a feed sack. No one is sure.',
      textVariants: [{ requirements: { minElapsedMinutes: 8 }, text: 'The rain beads on the table as the accounts are repeated. Mother remembers the tin boat; Tom remembers Bramble by the gate but not Nessa’s direction; the neighbor still cannot tell whether the red shape was a scarf or a feed sack.' }],
      choices: [
        { id: 'inspectYardAfterQuestions', label: 'Check the gate and nearby tracks', timeCost: 4, next: 'yardClues', effects: { historyFlags: ['prioritized_tracking_over_questioning'] } },
        { id: 'followCreekAfterQuestions', label: 'Search the creek path first', hint: 'The missing toy and rising water make this plausible, but the bank is slippery.', timeCost: 3, next: 'creekSearch', effects: { historyFlags: ['followed_creek_lead'] } },
        { id: 'checkHayloftFromTestimony', label: 'Check Nessa’s familiar hiding place', timeCost: 5, next: 'hayloftFalseLead' },
        { id: 'declineAfterAccounts', label: 'Leave the search to the family', next: 'refusalEnding', effects: { historyFlags: ['refused_child_search'] } },
      ],
    },
    yardClues: {
      id: 'yardClues', title: 'At the South Gate', tone: 'warning',
      text: 'Small shoeprints cross the damp soil and then split among older marks. Pawprints lead toward the orchard; the shallow ditch runs toward the creek. A red strand is caught on the gate, but it could have come from a scarf or a feed tie. The family’s hayloft is another familiar place Nessa sometimes hides.',
      textVariants: [
        { requirements: { minElapsedMinutes: 18 }, text: 'Rain has blurred most of the small shoeprints. The dog’s deeper paw marks still angle toward the orchard, while the ditch leads toward the rising creek. The red strand on the gate may be a scarf or a feed tie; the hayloft remains a possible hiding place.' },
        { requirements: { minElapsedMinutes: 8 }, text: 'The rain has softened the shoeprints, though their direction is still uncertain. Paw marks toward the orchard remain clearer; the ditch runs toward the creek, and a red strand on the gate could be a scarf or a feed tie.' },
      ],
      choices: [
        { id: 'followCreekPrints', label: 'Follow the small prints toward the creek', timeCost: 5, next: 'creekSearch', effects: { setFlags: ['creekLeadChosen'] } },
        { id: 'followDogPrints', label: 'Follow Bramble’s pawprints toward the orchard', timeCost: 5, next: 'orchardFalseLead', effects: { setFlags: ['dogLeadChosen'] } },
        { id: 'checkKnownHayloft', label: 'Search the hayloft where she sometimes hides', timeCost: 5, next: 'hayloftFalseLead' },
        { id: 'callSearchersFromYard', label: 'Bring more people to divide the search', timeCost: 12, next: 'searchPartyArrives', effects: { historyFlags: ['sought_outside_help_for_child'] } },
      ],
    },
    creekSearch: {
      id: 'creekSearch', title: 'The Lower Bank', tone: 'danger',
      text: 'The ditch meets a shallow creek beside a low crossing. There are child-sized prints in the mud, but some may belong to the neighbor’s younger children. The current is stronger than usual and rain stipples the water. The bank is still walkable if you keep above the slick edge.',
      textVariants: [
        { requirements: { minElapsedMinutes: 30 }, text: 'The creek is high enough to cover the lowest prints. Rain keeps softening the bank; you can search the remaining silt with a lamp, work slowly from high ground, or turn toward the dog’s trail instead.' },
        { requirements: { minElapsedMinutes: 18 }, text: 'The creek has risen over part of the lower bank. Rain is softening the prints; the headlamp may pick out scuffs in the wet silt, while a careful high-bank search will take longer.' },
      ],
      choices: [
        { id: 'traceCreekEarly', label: 'Trace the prints along the bank', requirements: { maxElapsedMinutes: 17 }, timeCost: 6, next: 'creekFalseLead', effects: { setFlags: ['creekTrailChecked'] } },
        { id: 'traceCreekWithHeadlamp', label: 'Use the headlamp to read the wet silt', requirements: { items: ['minerHeadlamp'], minElapsedMinutes: 18 }, timeCost: 3, next: 'creekFalseLead', effects: { setFlags: ['creekTrailChecked'] } },
        { id: 'traceCreekSlowly', label: 'Search carefully from the high bank', requirements: { notItems: ['minerHeadlamp'], minElapsedMinutes: 18 }, hint: 'The safer line keeps you off the slick edge but costs time.', timeCost: 8, next: 'creekFalseLead', effects: { setFlags: ['creekTrailChecked'] } },
        { id: 'switchFromCreekToDog', label: 'Leave the water and follow the dog’s trail', timeCost: 3, next: 'orchardFalseLead', effects: { historyFlags: ['followed_wrong_lead'] } },
        { id: 'leaveCreekSearch', label: 'Back away from the rising water', next: 'searchWithdrawnEnding' },
      ],
    },
    creekFalseLead: {
      id: 'creekFalseLead', title: 'Prints That Stop at Water', tone: 'warning',
      text: 'The small prints end where the crossing was washed clean; there is no sign that anyone entered the water. From higher ground, you spot Bramble’s paw marks on a dry service track leading west, away from the creek. The creek theory cost time, but it has narrowed the choices rather than ended the search.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The lower prints have washed away, but you find no sign anyone entered the creek. Bramble’s deeper paw marks remain on the dry service track west. There is still a direction to follow, though the light is fading.' }],
      choices: [
        { id: 'followServiceTrackAfterCreek', label: 'Follow the dog’s prints along the service track', timeCost: 4, next: 'millApproach', effects: { historyFlags: ['followed_wrong_lead'] } },
        { id: 'takeHighGroundAfterCreek', label: 'Use the higher path toward the orchard edge', timeCost: 6, next: 'millApproach', effects: { setFlags: ['highPathTaken'] } },
        { id: 'withdrawAfterCreek', label: 'Return to the family and end your search', next: 'searchWithdrawnEnding' },
      ],
    },
    orchardFalseLead: {
      id: 'orchardFalseLead', title: 'The Orchard Path', tone: 'warning',
      text: 'The orchard is empty. Bramble’s pawprints cross the soft ground, then turn onto a narrow service track toward the old pump house. A child’s smaller prints may be there too, but the rain has mixed them with older tracks. The dog lead was reasonable; it is not proof by itself.',
      choices: [
        { id: 'continueFromOrchard', label: 'Follow the service track west', timeCost: 4, next: 'millApproach', effects: { knowledge: ['Bramble’s pawprints leave the orchard along the service track toward the old pump house.'], historyFlags: ['followed_wrong_lead'] } },
        { id: 'leaveOrchardSearch', label: 'Return to the road without going farther', next: 'searchWithdrawnEnding' },
      ],
    },
    hayloftFalseLead: {
      id: 'hayloftFalseLead', title: 'The Empty Hayloft', tone: 'warning',
      text: 'The loft is empty. Tom says Nessa has hidden there before, but no blanket or toy has been moved today. He finally admits that he had been asked to keep an eye on her and feels responsible for turning away. A wet dog track crosses the lower yard toward the orchard service path.',
      choices: [
        { id: 'followDogAfterHayloft', label: 'Take the track toward the orchard service path', timeCost: 4, next: 'millApproach', effects: { historyFlags: ['followed_wrong_lead'] } },
        { id: 'stopAfterHayloft', label: 'Tell the family what you found and step aside', next: 'searchWithdrawnEnding' },
      ],
    },
    searchPartyArrives: {
      id: 'searchPartyArrives', title: 'More Hands, More Theories', tone: 'warning',
      text: 'Two neighbors arrive with dry cloaks and a lantern. They can search different places at once, but the rain has made it harder to know which prints matter. Tom offers to guide one pair toward the hayloft; Bramble keeps circling the orchard gate.',
      choices: [
        { id: 'partySearchCreek', label: 'Send a pair along the creek bank', timeCost: 5, next: 'creekFalseLead', effects: { setFlags: ['searchPartyAtCreek'] } },
        { id: 'partyFollowDog', label: 'Go with Tom and Bramble toward the orchard', timeCost: 3, next: 'orchardFalseLead', effects: { setFlags: ['searchPartyJoined'], historyFlags: ['sought_outside_help_for_child'] } },
        { id: 'partyCheckHayloft', label: 'Check the familiar hiding place together', timeCost: 4, next: 'hayloftFalseLead', effects: { setFlags: ['searchPartyJoined'] } },
        { id: 'partyTakeDogWest', label: 'Let Bramble lead the group west', timeCost: 4, next: 'dogTrackWithParty', effects: { setFlags: ['searchPartyJoined'] } },
      ],
    },
    dogTrackWithParty: {
      id: 'dogTrackWithParty', title: 'Bramble Pulls Ahead', tone: 'warning',
      text: 'Bramble trots along the dry track and stops beside an old pump house. Tom recognizes the path but has never seen Nessa go this far alone. The dog scratches at the swollen door, then waits. You have a likely place, not yet confirmation.',
      choices: [
        { id: 'approachShedWithParty', label: 'Check the pump house with the searchers', timeCost: 2, next: 'oldPumpShed', effects: { setFlags: ['searchPartyAtShed'] } },
        { id: 'callFamilyFromTrack', label: 'Send Tom back to the family for a blanket', timeCost: 4, next: 'oldPumpShed', effects: { setFlags: ['familyComingToShed'] } },
      ],
    },
    millApproach: {
      id: 'millApproach', title: 'The Old Service Track', tone: 'warning',
      text: 'The service track runs above the creek toward an abandoned pump house. Bramble’s deeper pawprints stay visible where the smaller shoeprints have blurred. A washout has cut the lower edge of the path; the upper side remains passable.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The old service track is dim and slick. The lower edge has washed out; Bramble’s pawprints are faint but still visible on the higher side. A lamp can help read them without stepping near the drop.' }],
      choices: [
        { id: 'followDogToPumpHouse', label: 'Follow the pawprints to the pump house', timeCost: 4, next: 'oldPumpShed' },
        { id: 'checkWashoutForTracks', label: 'Look below the washout for fresh tracks', hint: 'The lower edge is soft and could give way.', timeCost: 5, chance: { probability: 0.72, bonusItems: ['travelRope', 'heavyLeatherGloves'], bonusProbability: 0.12, successNext: 'trackBelowWashout', failureNext: 'slipAtWashout', successMessage: 'You find a small shoeprint on a flat stone below the path.', failureMessage: 'The edge slumps under your weight. You catch a root and climb back with a scrape.', failureEffects: { health: -1 } } },
        { id: 'useLampAtWashout', label: 'Read the upper track with your headlamp', requirements: { items: ['minerHeadlamp'] }, timeCost: 2, next: 'trackBelowWashout' },
        { id: 'turnBackFromTrack', label: 'Leave the search to others', next: 'searchWithdrawnEnding' },
      ],
    },
    slipAtWashout: {
      id: 'slipAtWashout', title: 'A Soft Edge', tone: 'danger',
      text: 'The path edge crumbles, but a root holds. Your hand is scraped; the fall below is short but the creek is close. The upper track remains safe enough to follow, or you can stop and wait for searchers.',
      choices: [
        { id: 'continueUpperTrack', label: 'Keep to the high side of the track', timeCost: 3, next: 'oldPumpShed' },
        { id: 'callFromWashout', label: 'Signal the family, then keep to the high track', timeCost: 6, next: 'oldPumpShed', effects: { historyFlags: ['sought_outside_help_for_child'] } },
        { id: 'withdrawFromWashout', label: 'Turn back to the road', next: 'searchWithdrawnEnding' },
      ],
    },
    trackBelowWashout: {
      id: 'trackBelowWashout', title: 'A Print on Flat Stone', tone: 'warning',
      text: 'A small shoeprint sits on a flat stone above the waterline. Beside it, dog tracks climb back to the upper path. No one has gone into the creek. The prints lead toward the old pump house.',
      choices: [
        { id: 'followPrintToPumpHouse', label: 'Follow the upper track to the pump house', timeCost: 3, next: 'oldPumpShed', effects: { knowledge: ['A small shoeprint near the washout turns back uphill beside Bramble’s tracks.'] } },
        { id: 'leaveTrackBelow', label: 'Stop and leave the search to the family', next: 'searchWithdrawnEnding' },
      ],
    },
    oldPumpShed: {
      id: 'oldPumpShed', title: 'The Leaning Pump House', tone: 'warning',
      text: 'The old pump house stands above the creek. Its wooden door is swollen in the rain, and Bramble scratches once at the bottom before looking back at you. A narrow vent sits above the latch. You have not yet heard anyone inside.',
      textVariants: [{ requirements: { minElapsedMinutes: 24 }, text: 'The pump house is dark against the wet hillside. Bramble scratches at the swollen door. A headlamp could show through the narrow vent; without one, a careful call may be the clearest way to check.' }],
      choices: [
        { id: 'callAndListenAtShed', label: 'Call Nessa’s name and listen', timeCost: 3, next: 'childFound', effects: { knowledge: ['A child answers from inside the old pump house.'] } },
        { id: 'inspectVentWithHeadlamp', label: 'Look through the vent with your headlamp', requirements: { items: ['minerHeadlamp'] }, timeCost: 2, next: 'childFound', effects: { knowledge: ['A small hand and the tin boat are visible through the pump-house vent.'] } },
        { id: 'testLatchWithTool', label: 'Test the latch with a carried tool', requirements: { anyItems: DOOR_TOOLS }, timeCost: 3, next: 'childFound', effects: { knowledge: ['The pump-house door is jammed against its swollen frame.'] } },
        { id: 'bringNeighborsToShed', label: 'Go back for help to lift the door', timeCost: 12, next: 'childFoundWithHelpers', effects: { historyFlags: ['sought_outside_help_for_child'] } },
      ],
    },
    childFound: {
      id: 'childFound', title: 'A Voice Behind the Door', tone: 'warning',
      text: 'Nessa answers from inside. She is seven, frightened and cold, but alert. She says Bramble followed her tin boat after it slid off the path; she went into the pump house to retrieve it, and the swollen door shut behind her. Water is rising outside, but the shed floor is still dry. Finding her is not the same as getting her home.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'Nessa answers from inside, frightened and cold but alert. The shed floor is still dry; the swollen door will not move, and rain is now running over the lower path. She needs a safe way back across the creek.' }],
      choices: [doorChoice(true), doorChoice(false),
        { id: 'callSearchersToDoor', label: 'Call for help and stay with Nessa', timeCost: 10, next: 'childOutWithHelp', effects: { historyFlags: ['found_missing_child', 'sought_outside_help_for_child'] } },
        { id: 'shelterAndSignalAtDoor', label: 'Keep her sheltered while you signal the family', timeCost: 12, next: 'lateRescueEnding', effects: { historyFlags: ['found_missing_child', 'sought_outside_help_for_child'] } },
      ],
    },
    childFoundWithHelpers: {
      id: 'childFoundWithHelpers', title: 'Several Hands at the Frame', tone: 'warning',
      text: 'Tom and two neighbors arrive with a pry bar and a dry blanket. Nessa answers from inside: she is frightened and cold, but alert. She followed Bramble and her tin boat into the pump house, then the rain-swollen door jammed. The creek is rising beyond the shed.',
      choices: [
        { id: 'liftDoorWithSearchers', label: 'Lift the door together with the pry bar', timeCost: 4, chance: { probability: 0.9, bonusItems: ['heavyLeatherGloves', 'foldingPryTool'], bonusProbability: 0.06, successNext: 'childOutWithHelp', failureNext: 'doorResists', successMessage: 'The group takes the door’s weight and eases it clear. Nessa steps into the blanket.', failureMessage: 'The warped frame shifts but holds. Everyone pauses; Nessa remains sheltered inside.', failureEffects: { health: -1 } } },
        { id: 'keepNessaWarmWhileHelpersWork', label: 'Stay with her while they work at the latch', timeCost: 6, next: 'childOutWithHelp', effects: { historyFlags: ['found_missing_child'] } },
      ],
    },
    doorResists: {
      id: 'doorResists', title: 'The Frame Holds', tone: 'danger',
      text: 'The door shifts but stays shut. Nessa is safe in the dry shed for the moment; the creek and cold rain make repeated force a poor idea. The searchers know where she is, and you can wait with her or let them take over.',
      choices: [
        { id: 'waitWithNessaForSearchers', label: 'Stay beside the door until help arrives', timeCost: 8, next: 'childOutWithHelp', effects: { historyFlags: ['found_missing_child', 'sought_outside_help_for_child'] } },
        { id: 'leaveLocationKnown', label: 'Return to the family and guide them here', timeCost: 10, next: 'lateRescueEnding', effects: { historyFlags: ['found_missing_child', 'sought_outside_help_for_child'] } },
      ],
    },
    childOut: {
      id: 'childOut', title: 'Out of the Pump House', tone: 'warning',
      text: 'Nessa steps onto the dry threshold with her tin boat. She is cold but responsive, and the dog presses against her legs. The quickest path home crosses the creek ford; a higher ridge path is safer but longer. Do not hurry her onto the slick stones.',
      choices: [
        { id: 'returnWithRope', label: 'Secure a rope and guide her across the ford', requirements: { items: ['travelRope'] }, timeCost: 4, chance: { probability: 0.9, bonusItems: ['ironRopeClamp', 'heavyLeatherGloves'], bonusProbability: 0.06, successNext: 'familyThanks', failureNext: 'creekReturnSlip', successMessage: 'The line gives Nessa something steady to hold. You both reach the near bank.', failureMessage: 'The current pulls the line tight and knocks you down, but you keep Nessa on the safe bank.', failureEffects: { health: -1 } } },
        { id: 'guideNessaAcrossCarefully', label: 'Guide her over the shallow ford slowly', requirements: { notItems: ['travelRope'] }, hint: 'The water is rising; slow steps are safer than a rushed crossing.', timeCost: 7, chance: { probability: 0.69, bonusItems: ['minerHeadlamp', 'heavyLeatherGloves', 'weatherproofCloak'], bonusProbability: 0.1, successNext: 'familyThanks', failureNext: 'creekReturnSlip', successMessage: 'You keep to the stones and guide Nessa across without rushing her.', failureMessage: 'A slick stone shifts beneath you. You stay with Nessa on the safe side, though your shoulder takes the impact.', failureEffects: { health: -1 } } },
        { id: 'takeHighPathHome', label: 'Use the longer path above the creek', hint: 'It takes longer, but avoids the rising ford.', timeCost: 12, next: 'familyThanks', effects: { historyFlags: ['found_missing_child', 'protected_child_during_return'] } },
        { id: 'signalForEscort', label: 'Signal the searchers for an escort', timeCost: 10, next: 'familyThanks', effects: { historyFlags: ['found_missing_child', 'protected_child_during_return', 'sought_outside_help_for_child'] } },
      ],
    },
    childOutWithHelp: {
      id: 'childOutWithHelp', title: 'The Searchers Lift Together', tone: 'warning',
      text: 'The neighbors hold the door while Tom eases Nessa onto the dry threshold. She is cold but alert, wrapped in a blanket, with Bramble at her side. The creek is rising; the group can take the high path rather than risk the ford.',
      choices: [
        { id: 'takeChildHomeWithParty', label: 'Walk Nessa home with the searchers', timeCost: 8, next: 'familyThanks', effects: { historyFlags: ['found_missing_child', 'protected_child_during_return'] } },
        { id: 'letTomTakeChildHome', label: 'Let Tom and a neighbor take the high path', timeCost: 6, next: 'familyThanks', effects: { historyFlags: ['found_missing_child', 'protected_child_during_return'] } },
      ],
    },
    creekReturnSlip: {
      id: 'creekReturnSlip', title: 'A Slippery Stone', tone: 'danger',
      text: 'The crossing does not hold. You and Nessa stay on the higher bank; the water has not carried either of you, but you are bruised and the ford is no longer a reasonable shortcut. The upper path remains passable, and the searchers know the shed’s location.',
      choices: [
        { id: 'takeHighPathAfterSlip', label: 'Take the upper path home together', timeCost: 9, next: 'familyThanks', effects: { historyFlags: ['protected_child_during_return'] } },
        { id: 'waitForSearchersAfterSlip', label: 'Wait with Nessa for the search party', timeCost: 8, next: 'childOutWithHelp', effects: { historyFlags: ['sought_outside_help_for_child'] } },
        { id: 'sendTomForBlanketAfterSlip', label: 'Send Tom for a dry blanket and escort', timeCost: 6, next: 'familyThanks', effects: { historyFlags: ['protected_child_during_return'] } },
      ],
    },
    familyThanks: {
      id: 'familyThanks', title: 'Back at Alderbrook', tone: 'safe',
      text: 'Nessa is back with her family, cold and shaken but safe. She explains that she followed Bramble to retrieve her little tin boat after it slid toward the old pump house. Tom admits he felt too embarrassed to say he had looked away when she left the gate. Her mother offers you one of the family’s spare search tools for the road.',
      choices: rewardChoices(),
    },
    safeReturnEnding: {
      id: 'safeReturnEnding', title: 'The Empty Cradle Is Filled', tone: 'safe', ending: 'success',
      text: 'The family keeps Nessa warm while the rain passes. No one was taken; she followed Bramble and her tin boat into the pump house, and the swollen door trapped her there. A careful search took time, but the child is home.' ,
      choices: [],
    },
    lateRescueEnding: {
      id: 'lateRescueEnding', title: 'A Search Continues', tone: 'safe', ending: 'success',
      text: 'You have confirmed Nessa is sheltered inside the pump house and guided the searchers to her. They bring a blanket and a pry bar and take over the door and the walk home. The delay has made the night colder, but she is not left alone or unknown.' ,
      choices: [],
    },
    searchWithdrawnEnding: {
      id: 'searchWithdrawnEnding', title: 'The Search Is Left to Others', tone: 'safe', ending: 'success',
      text: 'You step away from the search and tell the family what you learned. They continue with the neighbors. You cannot know the outcome from the road, and the choice is yours to leave.' ,
      choices: [],
    },
    refusalEnding: {
      id: 'refusalEnding', title: 'The Road Goes On', tone: 'safe', ending: 'success',
      text: 'You continue down the road. The family and neighbors remain together at Alderbrook, deciding where to search next. You do not know what happened to Nessa, and the story does not judge your choice to keep going.' ,
      choices: [],
    },
  },
};
