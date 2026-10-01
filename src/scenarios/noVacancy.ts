import type { Scenario } from '../types';

const REPAIR_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'compactStoveTool', 'waxedCanvasSheet', 'bridgewrightHammer', 'heavyLeatherGloves', 'minerHeadlamp', 'ratCatchersHook', 'brassCandlestick'];
const CARRIED_REPAIR_TOOLS = REPAIR_TOOLS;

export const NO_VACANCY: Scenario = {
  id: 'no-vacancy',
  title: 'No Vacancy',
  subtitle: 'One dry room, a rising creek, and no easy way to divide safety.',
  startScene: 'innArrival',
  timePhases: [
    { id: 'steady', label: 'Rain at the Inn', atMinutes: 0 },
    { id: 'worsening', label: 'The Creek Is Rising', atMinutes: 15 },
    { id: 'strained', label: 'The House Is Straining', atMinutes: 30 },
    { id: 'critical', label: 'The Yard Is Flooding', atMinutes: 45 },
  ],
  scenes: {
    innArrival: {
      id: 'innArrival', title: 'No Vacancy', tone: 'warning',
      text: 'The Lantern House is full before you reach the door. Rainwater runs down the road toward the creek, and the lower bridge has been closed. Innkeeper Ada is trying to keep a family with a young child, an injured carter, and a wet traveler named Vale from arguing over the last dry room. “I can use another pair of hands,” she says. The house is crowded, but still holding.',
      textVariants: [{ requirements: { historyFlags: ['organized_emergency_shelter'] }, text: 'The Lantern House is full before you reach the door. Ada recognizes you as someone who has organized shelter before. Rainwater runs down the road toward the creek, and the lower bridge has been closed. A family with a young child, an injured carter, and a wet traveler named Vale are arguing over the last dry room. “I can use another pair of hands,” she says. The house is crowded, but still holding.' }],
      choices: [
        { id: 'askAda', label: 'Ask Ada what space is still safe', timeCost: 3, next: 'keeperAccount' },
        { id: 'hearGuests', label: 'Hear the guests’ claims', timeCost: 4, next: 'guestAccounts' },
        { id: 'inspectHouse', label: 'Check the house for a practical risk', timeCost: 4, next: 'houseInspection' },
        { id: 'earnSupplyMoney', label: 'Help unload the last dry supplies', hint: 'You can earn a few coins, but the creek will keep rising.', timeCost: 6, effects: { money: 3, setFlags: ['earnedInnMoney'] }, next: 'supplyPayment' },
      ],
    },
    keeperAccount: {
      id: 'keeperAccount', title: 'Ada’s Count',
      text: 'Ada counts beds, then counts again. There is one dry private room upstairs, above the rooms already taking water. It is safe for now, not a refuge if the creek reaches the stair or the house shifts. Vale again asks that it be kept for the rescue crew he expects; no crew has arrived and he cannot say when they will. Two reserve blankets remain, and Ada leaves the difficult allocation to you.',
      textVariants: [{ requirements: { historyFlags: ['gave_up_shelter_for_other'] }, text: 'Ada recognizes you as someone who once gave up a safe place for another traveler. She still counts the beds carefully: one dry private room remains, two reserve blankets, and crowded common-room floor above the waterline. She leaves the decision with you.' }],
      choices: [
        { id: 'reserveRoom', label: 'Pay two coins to reserve the room', timeCost: 2, requirements: { minMoney: 2 }, effects: { money: -2, setFlags: ['roomReservedForPlayer'] }, next: 'shelterAllocation' },
        { id: 'offerBlanket', label: 'Lend a reserve blanket to Lena’s child', timeCost: 2, requirements: { notItems: ['reserveBlanket'] }, effects: { gainItems: ['reserveBlanket'], setFlags: ['blanketAvailable', 'blanketToFamily'] }, next: 'shelterAllocation' },
        { id: 'giveUpRoom', label: 'Give up any claim to the dry room', effects: { setFlags: ['roomGivenUp'], historyFlags: ['gave_up_shelter_for_other'] }, next: 'shelterAllocation' },
        { id: 'askAboutWindow', label: 'Ask which part of the house is weakest', timeCost: 3, next: 'houseInspection' },
      ],
    },
    guestAccounts: {
      id: 'guestAccounts', title: 'Three Different Needs',
      text: 'The carter, Amos, keeps weight off one ankle and says he can manage if he stays warm. Lena holds her child close; both are soaked through. Vale says he is a county marshal and asks Ada to keep the dry upstairs room for a rescue crew he expects. He gives no arrival time, and Ada has seen no crew on the road. Each need is real; none makes the room larger.',
      choices: [
        { id: 'checkValeClaim', label: 'Ask Ada to verify Vale’s authority', timeCost: 5, next: 'valeRevealed' },
        { id: 'askLena', label: 'Ask Lena what the child needs most', timeCost: 3, effects: { knowledge: ['Lena and her child are wet and cold; a dry room would help them recover.'], setFlags: ['familyNeedKnown'] }, next: 'shelterAllocation' },
        { id: 'askAmos', label: 'Ask Amos how badly he is hurt', timeCost: 3, effects: { knowledge: ['Amos has a painful ankle injury but can move with support; he needs warmth, not isolation.'], setFlags: ['injuryNeedKnown'] }, next: 'shelterAllocation' },
        { id: 'leaveInn', label: 'Leave before the road closes', timeCost: 2, effects: { historyFlags: ['abandoned_overcrowded_inn'] }, next: 'walkAwayEnding' },
      ],
    },
    valeRevealed: {
      id: 'valeRevealed', title: 'A Title and a Warning', tone: 'warning',
      text: 'Ada quietly checks Vale’s wet papers. He is a schoolteacher and volunteer, not a county marshal. He admits he used the title because people listen when he says the creek gauge has crossed its red mark. The gauge warning is real; he saw it himself. Ada asks whether to correct him publicly or keep everyone focused on getting upstairs.',
      choices: [
        { id: 'exposeVale', label: 'Correct his claim in front of the guests', timeCost: 3, effects: { setFlags: ['claimChecked', 'claimExposed'], knowledge: ['Vale is a schoolteacher and volunteer, not a marshal; his warning about the creek gauge is accurate.'], historyFlags: ['exposed_false_claim'] }, next: 'shelterAllocation' },
        { id: 'keepValeConfidence', label: 'Keep the warning, leave his title aside', effects: { setFlags: ['claimChecked', 'trustedVale'], knowledge: ['Vale is a volunteer, not a marshal, and his warning about the creek gauge is accurate.'], historyFlags: ['trusted_local_warning'] }, next: 'shelterAllocation' },
        { id: 'tellAdaToHandleIt', label: 'Let Ada correct the record her way', effects: { setFlags: ['claimChecked'], knowledge: ['Vale is a volunteer, not a marshal, and his warning about the creek gauge is accurate.'] }, next: 'shelterAllocation' },
      ],
    },
    houseInspection: {
      id: 'houseInspection', title: 'A House Under Strain', tone: 'warning',
      text: 'The back window bows inward with each gust. A dark line of water seeps under its frame, and the sill flexes when you press it. The attic stair is visibly sound, but this window will not hold a hard surge for long. Ada has spare boards; a carried tool could make a quick brace safer.',
      textVariants: [{ requirements: { minElapsedMinutes: 30 }, text: 'The back window bows inward with each gust. Water has spread across the floor beneath it, and the sill flexes under light pressure. The attic stair remains sound, but the window will not hold another hard surge for long. Ada has spare boards; a carried tool could make a quick brace safer.' }],
      choices: [
        { id: 'repairWithGear', label: 'Brace the window with your carried tool', hint: 'A tool gives you a quicker, steadier repair.', timeCost: 5, requirements: { anyItems: CARRIED_REPAIR_TOOLS }, chance: { probability: 0.88, successNext: 'shelterAllocation', failureNext: 'repairSlip', successMessage: 'The tool seats the board before the next gust.', failureMessage: 'The wet frame shifts while you work, but the brace catches part of the strain.', successEffects: { setFlags: ['windowBraced'], knowledge: ['The window brace is secure.'] }, failureEffects: { health: -1, setFlags: ['windowWeakened'], knowledge: ['The window is weaker after the frame shifted.'] } } },
        { id: 'repairByHand', label: 'Brace it with Ada’s boards by hand', hint: 'Possible without special gear, but slower and harder in the wet.', timeCost: 12, requirements: { notItems: REPAIR_TOOLS }, chance: { probability: 0.62, successNext: 'shelterAllocation', failureNext: 'repairSlip', successMessage: 'The boards hold after a hard, careful effort.', failureMessage: 'The sill bucks; you catch yourself, but the frame is worse.', successEffects: { setFlags: ['windowBraced'] }, failureEffects: { health: -2, setFlags: ['windowWeakened'] } } },
        { id: 'moveBedding', label: 'Move bedding away from the window', timeCost: 7, effects: { setFlags: ['beddingMoved'] }, next: 'shelterAllocation' },
        { id: 'stepBack', label: 'Warn Ada and leave the repair for now', next: 'shelterAllocation', effects: { setFlags: ['windowRiskKnown'], knowledge: ['The back window and sill are weakened by the storm.'] } },
      ],
    },
    repairSlip: {
      id: 'repairSlip', title: 'The Frame Shifts', tone: 'danger',
      text: 'The board slips and the swollen frame jumps. You take a scrape, and water pushes farther into the room. The risk was visible, but the repair has made the window more urgent. Ada pulls you back before you try again.',
      choices: [
        { id: 'continueAfterSlip', label: 'Help move bedding, then decide who gets the room', timeCost: 4, effects: { setFlags: ['beddingMoved', 'windowRiskKnown'] }, next: 'shelterAllocation' },
        { id: 'leaveAfterSlip', label: 'Get clear and leave the inn', effects: { historyFlags: ['abandoned_overcrowded_inn'] }, next: 'walkAwayEnding' },
      ],
    },
    supplyPayment: {
      id: 'supplyPayment', title: 'Three Coins for a Hand',
      text: 'You help stack the last dry crates above the flood line. Ada counts three coins into your palm for the work. She also offers two practical items from the supply chest, each for the cost of the materials. Whatever you choose, time and space are still short.',
      choices: [
        { id: 'buyCanvas', label: 'Buy a waxed canvas sheet — 2 coins', timeCost: 2, requirements: { minMoney: 2, notItems: ['waxedCanvasSheet'] }, effects: { money: -2, gainItems: ['waxedCanvasSheet'] }, next: 'shelterAllocation' },
        { id: 'buyStoveTool', label: 'Buy a compact stove tool — 3 coins', timeCost: 2, requirements: { minMoney: 3, notItems: ['compactStoveTool'] }, effects: { money: -3, gainItems: ['compactStoveTool'] }, next: 'shelterAllocation' },
        { id: 'keepCoins', label: 'Keep the coins for whatever comes next', next: 'shelterAllocation' },
        { id: 'leaveWithPay', label: 'Take your pay and leave', effects: { historyFlags: ['abandoned_overcrowded_inn'] }, next: 'walkAwayEnding' },
      ],
    },
    shelterAllocation: {
      id: 'shelterAllocation', title: 'The Last Dry Room', tone: 'warning',
      text: 'The rain drums harder on the roof. The only dry private room is upstairs, above the common room now exposed to the back window. It offers shelter for the moment, but the stairs still lead through the vulnerable lower floor. Vale again says he expects a rescue crew, though none has arrived. Two blankets remain unless one has already been lent out; none of the guests has an easy claim to dismiss.',
      textVariants: [
        { requirements: { flags: ['claimExposed', 'roomReservedForPlayer'] }, text: 'The rain drums harder on the roof. Ada is holding the one dry private room at your paid reservation, though Vale’s false title is now known and his creek warning was true. Two blankets remain unless one has already been lent out. Giving the room away also means giving up the coins.' },
        { requirements: { flags: ['roomForFamily'] }, text: 'The rain drums harder on the roof. Lena and her child have the dry upstairs room you chose for them; it is above the wet common room and safe for now. Vale repeats that he expects a rescue crew, but none has arrived. The stairs and lower floor are still passable, and the creek is rising.' },
        { requirements: { flags: ['claimExposed'] }, text: 'The rain drums harder on the roof. Ada confirms there is only one dry private room. Vale’s false title is now known, though his creek warning was true. Two blankets remain unless one has already been lent out; the common room is crowded and exposed to the back window. You must decide who gets the room.' },
        { requirements: { flags: ['roomReservedForPlayer'] }, text: 'The rain drums harder on the roof. Ada is holding the one dry private room at your paid reservation. Two blankets remain unless one has already been lent out; the common room is crowded and exposed to the back window. Giving the room to someone else also means giving up the coins.' },
        { requirements: { items: ['reserveBlanket'] }, text: 'The rain drums harder on the roof. Ada confirms there is only one dry private room. Lena’s child has one of the reserve blankets; one remains. The common room is crowded and exposed to the back window. You must decide who gets the room.' },
        { requirements: { flags: ['windowBraced'] }, text: 'Your brace steadies the back window for now. There is still only one dry private room, and two blankets remain unless one has been lent out. Ada asks you to decide who gets the room before the creek rises further.' },
      ],
      choices: [
        { id: 'roomForFamily', label: 'Give the room to Lena and her child', timeCost: 3, effects: { setFlags: ['roomForFamily'], historyFlags: ['prioritized_child_and_family'] }, next: 'roofCrisis' },
        { id: 'roomForAmos', label: 'Give the room to the injured carter', timeCost: 3, effects: { setFlags: ['roomForAmos'], historyFlags: ['protected_injured_guest'] }, next: 'roofCrisis' },
        { id: 'roomForVale', label: 'Honor Vale’s request for the rescue crew', timeCost: 3, effects: { setFlags: ['roomForVale'] }, next: 'roofCrisis' },
        { id: 'keepDryRoom', label: 'Keep the dry room for yourself', timeCost: 3, requirements: { notFlags: ['roomGivenUp'] }, effects: { setFlags: ['roomForPlayer'], historyFlags: ['prioritized_own_shelter'] }, next: 'roofCrisis' },
      ],
    },
    roofCrisis: {
      id: 'roofCrisis', title: 'The Next Surge', tone: 'danger',
      text: 'A surge hits the house. Water floods the common room and reaches the bottom stair; the upstairs room you chose is still dry. It has protected its occupants so far, but another rise could cut off the stairs. Ada points to the higher road: leave while the porch is reachable, or shelter upstairs and risk losing the route.',
      textVariants: [
        { requirements: { flags: ['roomForFamily'], minElapsedMinutes: 45 }, text: 'The yard is a moving sheet of water. Lena and her child remain dry upstairs, where your choice sheltered them from the first surge. Water now covers the lower stairs. Ada points to the higher road: leave while the porch remains reachable, or stay upstairs and risk being trapped.' },
        { requirements: { minElapsedMinutes: 45 }, text: 'The yard is a moving sheet of water. The upstairs room remains dry, but water covers the lower stairs. The shelter helped through the first surge; another rise could trap its occupants. Ada points to the higher road: leave while the porch remains reachable, or stay upstairs and risk losing the route.' },
        { requirements: { flags: ['windowBraced'] }, text: 'A hard pulse of water hits the back of the house. Your brace holds the window; water covers the common-room floor and reaches the bottom stair. The upstairs room is still dry, but another surge could cut off the route. Ada can evacuate everyone now or shelter them upstairs.' },
      ],
      choices: [
        { id: 'secureWindowWithGear', label: 'Use your tool or canvas to secure the window', hint: 'The supplies fit the damaged frame; success should hold through the surge.', timeCost: 5, requirements: { anyItems: REPAIR_TOOLS, notFlags: ['windowBraced'], maxElapsedMinutes: 44 }, chance: { probability: 0.82, successNext: 'orderRestoredEnding', failureNext: 'costlySuccessEnding', successMessage: 'The window holds and the upper landing stays dry.', failureMessage: 'The brace buys time, but water ruins part of the common room.', successEffects: { setFlags: ['windowBraced', 'organizedShelter'], historyFlags: ['organized_emergency_shelter'] }, failureEffects: { health: -1, setFlags: ['organizedShelter'], historyFlags: ['organized_emergency_shelter'] } } },
        { id: 'secureWindowByHand', label: 'Set another brace with the remaining boards', hint: 'The soaked frame may not hold.', timeCost: 10, requirements: { notItems: REPAIR_TOOLS, notFlags: ['windowBraced'], maxElapsedMinutes: 44 }, chance: { probability: 0.58, successNext: 'orderRestoredEnding', failureNext: 'costlySuccessEnding', successMessage: 'The boards bite into the frame and hold.', failureMessage: 'The repair only partly holds; everyone must crowd upstairs.', successEffects: { setFlags: ['windowBraced', 'organizedShelter'], historyFlags: ['organized_emergency_shelter'] }, failureEffects: { health: -1, setFlags: ['organizedShelter'], historyFlags: ['organized_emergency_shelter'] } } },
        { id: 'evacuateHouse', label: 'Move everyone to the higher road', hint: 'The yard is flooded; staying may soon be worse.', timeCost: 5, effects: { setFlags: ['evacuatedGuests'], historyFlags: ['evacuated_guests'] }, next: 'floodedYard' },
        { id: 'holdTogether', label: 'Keep everyone upstairs', hint: 'The lower rooms and supplies may be lost.', requirements: { notFlags: ['windowBraced'] }, effects: { setFlags: ['organizedShelter'], historyFlags: ['organized_emergency_shelter'] }, next: 'costlySuccessEnding' },
        { id: 'trustTheBrace', label: 'Trust the brace and keep everyone upstairs', requirements: { flags: ['windowBraced'] }, effects: { setFlags: ['organizedShelter'], historyFlags: ['organized_emergency_shelter'] }, next: 'orderRestoredEnding' },
      ],
    },
    floodedYard: {
      id: 'floodedYard', title: 'The Road Above the Creek', tone: 'danger',
      text: 'The upper road is only a short distance away, but the yard between is under fast, knee-high water. You can see the stone wall that marks the safe side. A careful crossing may get everyone out; a fall in this current could be serious. Ada points to the porch post: a carried rope or a clamp for her short line could give the group a steadier guide.',
      choices: [
        { id: 'ropeGuidedCrossing', label: 'Guide people along the rope', timeCost: 6, requirements: { anyItems: ['travelRope', 'ironRopeClamp'] }, chance: { probability: 0.84, successNext: 'evacuationEnding', failureNext: 'washedStep', successMessage: 'The line gives everyone a steady guide to the road.', failureMessage: 'The current pulls hard; one step goes under before the line catches you.', successEffects: { historyFlags: ['evacuated_guests'] }, failureEffects: { health: -3 } } },
        { id: 'crossWithoutRope', label: 'Cross slowly, keeping to the stone wall', hint: 'The path is visible but the water is fast; a fall could injure you.', timeCost: 6, requirements: { notItems: ['travelRope', 'ironRopeClamp'] }, chance: { probability: 0.58, successNext: 'evacuationEnding', failureNext: 'washedStep', successMessage: 'You keep to the wall and reach the higher road.', failureMessage: 'The current knocks you down before you can reach the wall.', successEffects: { historyFlags: ['evacuated_guests'] }, failureEffects: { health: -4 } } },
        { id: 'waitForRescue', label: 'Wait on the upper landing for help', hint: 'Safer for the group, but the inn and its supplies will take more damage.', timeCost: 8, effects: { historyFlags: ['organized_emergency_shelter'] }, next: 'costlySuccessEnding' },
      ],
    },
    washedStep: {
      id: 'washedStep', title: 'Swept Off Your Feet', tone: 'danger',
      text: 'The water knocks you against the stone edging. Your health is worsening and the current keeps tugging at your legs. The wall is within reach, but trying to stand in the current again risks another hard impact. Ada and Vale are holding the line from the porch.',
      choices: [
        { id: 'crawlToWall', label: 'Crawl along the stones to the wall', hint: 'You can reach safety, but another fall may overwhelm you.', chance: { probability: 0.62, successNext: 'evacuationEnding', failureNext: 'washedStepAgain', successMessage: 'You get a hand on the wall and pull yourself clear.', failureMessage: 'A second surge drives you back into the stones.', failureEffects: { health: -5 } } },
        { id: 'pullBackToPorch', label: 'Let the others haul you back to the porch', effects: { health: -1 }, next: 'costlySuccessEnding' },
      ],
    },
    washedStepAgain: {
      id: 'washedStepAgain', title: 'The Current Takes Hold', tone: 'danger',
      text: 'You are badly hurt, and the water is carrying you toward the culvert. The porch rope still reaches the edge of the yard, but you have one chance to catch it before the next surge.',
      choices: [
        { id: 'catchPorchLine', label: 'Reach for the porch line', hint: 'This is a desperate, clearly dangerous attempt.', chance: { probability: 0.42, successNext: 'evacuationEnding', failureNext: 'death', successMessage: 'Your hand closes on the line; the others drag you clear.', failureMessage: 'Your grip slips as the surge pulls you under.', failureEffects: { health: -10 } } },
        { id: 'stayAgainstWall', label: 'Brace against the wall and call for help', effects: { health: -2 }, next: 'costlySuccessEnding' },
      ],
    },
    orderRestoredEnding: {
      id: 'orderRestoredEnding', title: 'Room to Breathe', ending: 'success',
      text: 'The brace holds through the next surge. Ada moves the family, Amos, and Vale between the dry room, the upper landing, and the reserve blankets. No arrangement is comfortable, and the common room is damaged, but everyone has shelter above the water. Ada remembers that you helped people make a plan before the house forced one on them.',
      textVariants: [{ requirements: { flags: ['roomForVale'], notFlags: ['claimChecked'] }, text: 'The brace holds through the next surge, and everyone reaches shelter above the water. Afterward, Ada tells you Vale was a schoolteacher and volunteer, not a marshal. His warning was sound, though the title he used to make people listen was not.' }],
      choices: [],
    },
    costlySuccessEnding: {
      id: 'costlySuccessEnding', title: 'A Crowded Night Upstairs', ending: 'success',
      text: 'Everyone who stayed reaches the upper landing. Water spoils bedding and part of the common room, and the last dry room cannot protect everyone. The guests argue about your choice, but Ada gets them through the night.',
      textVariants: [
        { requirements: { flags: ['roomForFamily'], items: ['reserveBlanket'] }, text: 'Lena and her child get the only dry room, and the child keeps the blanket you lent earlier. Amos rests on the crowded upper landing, and Vale helps keep the way clear. Water spoils bedding and part of the common room; it was a defensible priority, not a painless one.' },
        { requirements: { flags: ['roomForFamily'] }, text: 'Lena and her child get the only dry room. Amos rests on the crowded upper landing, and Vale helps keep the way clear. Water spoils bedding and part of the common room; it was a defensible priority, not a painless one.' },
        { requirements: { flags: ['roomForAmos'], items: ['reserveBlanket'] }, text: 'Amos gets the only dry room and can keep weight off his injured ankle. Lena and her child take the upper landing with the blanket you lent earlier. Water spoils bedding and part of the common room; everyone stays sheltered, though Lena is still cold.' },
        { requirements: { flags: ['roomForAmos'] }, text: 'Amos gets the only dry room and can keep weight off his injured ankle. Lena and her child take the upper landing with the reserve blanket. Water spoils bedding and part of the common room; everyone stays sheltered, though Lena is still cold.' },
        { requirements: { flags: ['roomForVale'], notFlags: ['claimChecked'] }, text: 'Vale gets the room he requested. Only after the storm do you learn he was a volunteer, not a marshal; his warning about the creek was right, but the room had been assigned on a title he did not hold. Lena and her child spend the night on the wet side of the landing.' },
        { requirements: { flags: ['roomForVale', 'claimChecked'] }, text: 'Vale gets the room as a volunteer coordinating the evacuation. Lena and her child share the upper landing with Amos. The decision gives Vale a dry place to organize help, though the family remains cold.' },
        { requirements: { flags: ['roomForPlayer'] }, text: 'You keep the dry room while the guests crowd the upper landing. Ada does not pretend the choice was neutral: Lena and her child are still wet, and Amos has to keep his ankle elevated on a crate. Everyone survives the night, but they remember who had the room.' },
      ],
      choices: [],
    },
    evacuationEnding: {
      id: 'evacuationEnding', title: 'Higher Ground', ending: 'success',
      text: 'You guide the group to the high road before another surge reaches the house. The rooms and most of the supplies are lost to floodwater, but the guests reach the old schoolhouse above the creek. No one gets everything they needed. No one is left behind.',
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Out', ending: 'success',
      text: 'You leave the crowded inn to Ada and the people already sheltering there. The road is still open behind you. You cannot know how the night will go for them, only that staying would have made you responsible for a decision you did not feel ready to make.',
      choices: [],
    },
    death: {
      id: 'death', title: 'Taken by the Flood', ending: 'death',
      text: 'The water pulls you beneath the porch line before anyone can reach you. Ada and the others make it to higher ground, but your journey ends in the flood.',
      choices: [],
    },
  },
};
