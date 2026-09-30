import type { Scenario } from '../types';

const REPUTATION = 'You have come back for someone before. I suppose I can tell you what I know.';
const ROOM_TOOL = ['pocketToolkit', 'foremanMultiTool', 'foldingPryTool', 'brassBottleOpener'];
const PRY_TOOLS = [...ROOM_TOOL, 'brassCandlestick', 'steelWedge'];
const CELLAR_LIGHTS = ['lantern', 'minerHeadlamp'];
const REWARD_ENDING = 'quietEnding';

export const THE_LAST_ROOM: Scenario = {
  id: 'the-last-room',
  title: 'The Last Room on the Left',
  subtitle: 'A roadside inn. A missing guest. A door no one wants opened.',
  startScene: 'arrival',
  timePhases: [
    { id: 'evening', label: 'Evening at the Inn', atMinutes: 0 },
    { id: 'storm', label: 'The Storm Is Rising', atMinutes: 15 },
    { id: 'late', label: 'Late Night', atMinutes: 35 },
  ],
  scenes: {
    arrival: {
      id: 'arrival', title: 'A Light in the Rain', tone: 'warning',
      text: 'Rain has turned the road to black mud by the time you reach the Lantern House. The innkeeper says one guest, Silas Vale, is missing; the last room on the left is barricaded from within. He insists it is a private misunderstanding and asks you not to stir up the other guests. A gust rattles the shutters. No one seems eager to meet your eye.',
      choices: [
        { id: 'askInnkeeper', label: 'Ask the innkeeper what happened', timeCost: 3, next: 'hostAccount' },
        { id: 'askGuests', label: 'Listen to the other guests', timeCost: 5, next: 'commonRoom' },
        { id: 'inspectRegister', label: 'Look at the guest register', timeCost: 4, next: 'guestRegister' },
        { id: 'walkAway', label: 'Leave it alone and continue on', timeCost: 1, effects: { historyFlags: ['walked_away_from_inn_problem'] }, next: 'walkAwayEnding' },
      ],
    },
    hostAccount: {
      id: 'hostAccount', title: 'The Innkeeper’s Account',
      text: 'The innkeeper says Vale checked out before the rain grew heavy. His room key was left on the desk, though the register has no departure time. He keeps glancing toward a narrow service passage behind the kitchen. He says the passage is only used for deliveries.',
      textVariants: [{ requirements: { historyFlags: ['returned_for_help'] }, text: `${REPUTATION} The innkeeper says Vale checked out before the rain grew heavy. His room key was left on the desk, though the register has no departure time. He keeps glancing toward a narrow service passage behind the kitchen. He says the passage is only used for deliveries.` }],
      choices: [
        { id: 'askAboutRoom', label: 'Ask about the barricaded room', next: 'corridor' },
        { id: 'askServicePassage', label: 'Ask about the service passage', next: 'serviceHall' },
        { id: 'buyRope', label: 'Buy a coil of travel rope — 2 coins', requirements: { minMoney: 2, notItems: ['travelRope'] }, effects: { money: -2, gainItems: ['travelRope'] }, next: 'corridor' },
        { id: 'acceptHisAccount', label: 'Take him at his word and go', next: 'walkAwayEnding', effects: { historyFlags: ['trusted_testimony_over_evidence', 'walked_away_from_inn_problem'] } },
      ],
    },
    commonRoom: {
      id: 'commonRoom', title: 'Accounts by the Stove',
      text: 'A carter says he heard a door slam toward the yard. A cook insists the hall was quiet all evening. An older guest remembers Vale carrying a damp travel case toward the back of the inn, but cannot say when. The stories could fit together—or not.',
      choices: [
        { id: 'compareRegister', label: 'Check their accounts against the register', next: 'guestRegister' },
        { id: 'followYardAccount', label: 'Look for the door the carter heard', next: 'yardAccount' },
        { id: 'visitRoom', label: 'Speak to the guest behind the barricade', next: 'corridor' },
        { id: 'accuseGuest', label: 'Accuse the barricaded guest of hiding Vale', effects: { setFlags: ['prematureAccusation'] }, next: 'guestAccused' },
      ],
    },
    guestRegister: {
      id: 'guestRegister', title: 'A Line Left Blank',
      text: 'Vale’s name is written in the register, but the checkout line is empty. His room key hangs on its numbered hook. The innkeeper said it had been left on the desk. Nearby, a narrow service door carries fresh scrape marks around its latch.',
      choices: [
        { id: 'checkRoom', label: 'Take a closer look at the last room on the left', next: 'corridor', effects: { knowledge: ['Silas Vale’s checkout line is blank, and his key is on its hook despite the innkeeper saying he checked out.'] } },
        { id: 'checkServiceDoor', label: 'Inspect the service passage', next: 'serviceHall', effects: { knowledge: ['The inn’s service passage has fresh scrape marks at the cellar latch.'] } },
        { id: 'leaveAfterRegister', label: 'Leave before the storm worsens', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    yardAccount: {
      id: 'yardAccount', title: 'The Yard Door',
      text: 'The yard door is latched from inside. The carter may have heard a slam, but the mud outside it is unbroken. From here you can see a narrow cellar vent below the kitchen window; rainwater has pooled around its stone lip.',
      choices: [
        { id: 'followMudMarks', label: 'Check the cellar vent and muddy stones', next: 'yardTracks', effects: { knowledge: ['The yard door was not used; muddy scuffs lead to the cellar vent instead.'] } },
        { id: 'returnToRoomFromYard', label: 'Speak to the barricaded guest', next: 'corridor' },
        { id: 'leaveFromYard', label: 'Go back out onto the road', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    yardTracks: {
      id: 'yardTracks', title: 'Scuffs Beneath the Window',
      text: 'The marks do not lead away from the inn. They end at the cellar vent, where the stone is scraped from the inside. Something heavy shifted below it. The rain has blurred any finer detail.',
      choices: [
        { id: 'goToServiceHall', label: 'Reach the cellar from inside', next: 'serviceHall', effects: { setFlags: ['foundCellarScuffs'] } },
        { id: 'askRoomAboutKnocks', label: 'Ask whether anyone heard something below', next: 'corridor', effects: { setFlags: ['foundCellarScuffs'] } },
        { id: 'leaveTracks', label: 'Leave the inn without getting involved', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    corridor: {
      id: 'corridor', title: 'The Last Room on the Left', tone: 'warning',
      text: 'The corridor smells of wet wool and lamp oil. A chair and a narrow table have been pushed against the last door on the left. There is no sound from within. The door frame is old, but not splintered.',
      choices: [
        { id: 'knockGently', label: 'Knock and ask to speak', timeCost: 2, next: 'doorTalk' },
        { id: 'inspectBarricade', label: 'Study the latch and the barricade', timeCost: 5, next: 'latchClue' },
        { id: 'forceDoor', label: 'Shoulder the door aside', timeCost: 10, hint: 'The furniture is heavy and the old frame may break; whoever is inside will hear you coming.', chance: { probability: 0.56, successNext: 'roomEntered', failureNext: 'doorBacklash', successMessage: 'The chair skids away and the door opens with a crack.', failureMessage: 'The frame holds. The impact shakes the wall and someone inside cries out.', successEffects: { setFlags: ['forcedEntry', 'intervenedAtInn'], historyFlags: ['forced_entry_without_proof', 'intervened_in_inn_dispute'], knowledge: ['The guest behind the barricade is alive and frightened, not missing.'] }, failureEffects: { health: -1, setFlags: ['forcedEntry', 'intervenedAtInn'], historyFlags: ['forced_entry_without_proof', 'intervened_in_inn_dispute'] } } },
      ],
    },
    doorTalk: {
      id: 'doorTalk', title: 'A Voice Through the Door',
      text: 'A woman answers from inside: “I’m safe. Don’t let him in.” She will not say who “him” is. There is a small pause, then a faint tapping somewhere below the floorboards.',
      textVariants: [{ requirements: { historyFlags: ['rescued_missing_person'] }, text: 'A woman answers from inside: “I’m safe. Don’t let him in.” She listens as you explain that you have helped someone in danger before. Her voice softens, but she will not say who “him” is. A faint tapping comes from somewhere below the floorboards.' }],
      choices: [
        { id: 'offerToListen', label: 'Promise to listen before judging', next: 'doorConfides', effects: { setFlags: ['intervenedAtInn'] } },
        { id: 'tellHerTheInnkeeperIsWaiting', label: 'Tell her the innkeeper wants the door opened', next: 'guestAccused' },
        { id: 'followTapping', label: 'Follow the tapping toward the service hall', next: 'serviceHall', effects: { setFlags: ['heardTapping'] } },
      ],
    },
    latchClue: {
      id: 'latchClue', title: 'A Barricade from Within',
      text: 'The chair legs have been wedged from the inside. The wood around the latch is intact. Someone chose to block the door; no one appears to have forced their way in. A key lies just beyond reach under the gap.',
      choices: [
        { id: 'quietToolEntry', label: 'Use a small tool to lift the latch quietly', timeCost: 3, requirements: { anyItems: ROOM_TOOL }, next: 'roomEntered', effects: { setFlags: ['quietEntry', 'intervenedAtInn'], knowledge: ['The room’s barricade was set from inside; there is no sign of a forced entry.'] } },
        { id: 'hookKey', label: 'Reach for the dropped key with your hook', timeCost: 2, requirements: { items: ['ratCatchersHook'] }, next: 'keyRecovered', effects: { gainItems: ['innCellarKey'], setFlags: ['intervenedAtInn'], knowledge: ['A cellar key had been left under the barricaded room door.'] } },
        { id: 'goToServiceHall', label: 'Leave the room alone and inspect the service hall', next: 'serviceHall' },
        { id: 'forceFromHall', label: 'Force the door despite the warning', timeCost: 10, hint: 'You have seen no sign of a break-in; forcing it may frighten the person inside.', chance: { probability: 0.56, successNext: 'roomEntered', failureNext: 'doorBacklash', successMessage: 'The door swings open against the furniture.', failureMessage: 'The old frame groans but holds; the person inside shouts for you to stop.', successEffects: { setFlags: ['forcedEntry', 'intervenedAtInn'], historyFlags: ['forced_entry_without_proof', 'intervened_in_inn_dispute'] }, failureEffects: { health: -1, setFlags: ['forcedEntry', 'intervenedAtInn'], historyFlags: ['forced_entry_without_proof', 'intervened_in_inn_dispute'] } } },
      ],
    },
    keyRecovered: {
      id: 'keyRecovered', title: 'The Key Under the Door',
      text: 'The hook brings the key within reach. Its tag is rubbed blank, but it fits the service door downstairs. The room remains barricaded; whatever happened inside is still the occupant’s to tell.',
      choices: [
        { id: 'useKeyAtServiceHall', label: 'Take the key to the service passage', next: 'serviceHall' },
        { id: 'knockAfterKey', label: 'Tell the occupant you found the key', next: 'doorConfides' },
      ],
    },
    doorConfides: {
      id: 'doorConfides', title: 'What She Heard',
      text: 'The guest gives her name as Nell. She barricaded herself after hearing the innkeeper tell someone that Vale had “gone out the back.” A few moments later she heard three slow knocks from below the kitchen floor. She never saw Vale leave. She is afraid that if she opens the door, the innkeeper will blame her.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'Nell gives her account in a low, tired voice. She barricaded herself after hearing the innkeeper tell someone that Vale had “gone out the back.” A few moments later she heard three slow knocks from below the kitchen floor. She is still afraid the innkeeper will blame her, and the rain has made the old house groan around her.' }],
      choices: [
        { id: 'believeNell', label: 'Believe her and follow the sound below', timeCost: 2, next: 'serviceHall', effects: { setFlags: ['guestConfided', 'believedNell'], historyFlags: ['intervened_in_inn_dispute', 'trusted_testimony_over_evidence', 'protected_hidden_guest'], knowledge: ['Nell heard three knocks below the kitchen after the innkeeper said Vale had gone out the back.'] } },
        { id: 'askNellToWait', label: 'Ask her to stay put while you check the passage', timeCost: 2, next: 'serviceHall', effects: { setFlags: ['guestConfided'], knowledge: ['Nell heard three knocks below the kitchen after the innkeeper said Vale had gone out the back.'] } },
        { id: 'tellInnkeeperAboutNell', label: 'Confront the innkeeper with her account', timeCost: 4, next: 'hostConfrontation', effects: { setFlags: ['guestConfided'], knowledge: ['Nell heard three knocks below the kitchen after the innkeeper said Vale had gone out the back.'] } },
        { id: 'leaveNell', label: 'Respect her request and leave', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    roomEntered: {
      id: 'roomEntered', title: 'Inside the Barricade', tone: 'warning',
      text: 'Nell stands between you and the room’s small window, frightened but unhurt. A travel blanket is folded beside her. She says she blocked the door after the innkeeper told her to keep quiet about the tapping below. The room is otherwise ordinary; there is no sign that Vale has been here.',
      textVariants: [{ requirements: { flags: ['quietEntry'] }, text: 'Nell stands beside the door, frightened but unhurt. Your careful work left the frame intact. She says she blocked the door after the innkeeper told her to keep quiet about the tapping below. The room is otherwise ordinary; there is no sign that Vale has been here.' }],
      choices: [
        { id: 'listenToNell', label: 'Explain yourself and hear her account', next: 'doorConfides', effects: { setFlags: ['guestConfided'] } },
        { id: 'accuseNellNow', label: 'Accuse her of helping Vale disappear', next: 'guestAccused', effects: { setFlags: ['prematureAccusation'] } },
        { id: 'goCheckBelow', label: 'Leave her room and check the service hall', next: 'serviceHall' },
      ],
    },
    doorBacklash: {
      id: 'doorBacklash', title: 'A Frame Shaken', tone: 'warning',
      text: 'The door holds, and the impact bruises your shoulder. Nell is silent now. From farther down the hall the innkeeper calls that the old floor is not safe to pound on. The door can still be approached, but trust has been spent.',
      choices: [
        { id: 'apologizeAfterImpact', label: 'Apologize and step away', next: 'doorConfides', effects: { setFlags: ['forcedEntry'] } },
        { id: 'leaveAfterImpact', label: 'Stop and inspect the service passage', next: 'serviceHall' },
        { id: 'giveUpAfterImpact', label: 'Leave the inn', next: 'walkAwayEnding', effects: { historyFlags: ['walked_away_from_inn_problem'] } },
      ],
    },
    guestAccused: {
      id: 'guestAccused', title: 'An Accusation in the Hall', tone: 'warning',
      text: 'Nell answers that she did not take Vale or make him vanish. The innkeeper steps between you and the door, asking you to stop making claims without evidence. A few guests have heard the exchange.',
      choices: [
        { id: 'doubleDownOnNell', label: 'Repeat the accusation and leave', next: 'wrongAccusationEnding', effects: { historyFlags: ['wrongly_accused_guest', 'intervened_in_inn_dispute'] } },
        { id: 'apologizeToNell', label: 'Apologize and ask what she heard', next: 'doorConfides', effects: { clearFlags: ['prematureAccusation'], setFlags: ['guestConfided'] } },
        { id: 'inspectServiceInstead', label: 'Set the argument aside and check below', next: 'serviceHall' },
      ],
    },
    hostConfrontation: {
      id: 'hostConfrontation', title: 'The Innkeeper’s Admission', tone: 'warning',
      text: 'The innkeeper looks at the blank checkout line, then gives up on the story. Vale slipped on the cellar stairs while retrieving his case and is pinned behind a fallen shelf. The innkeeper heard him knocking. He lied because the cellar steps have been unsafe for months and he fears the inn will be shut down. Nell barricaded herself after he told her to stay quiet. The lie was real; an assault was not.',
      choices: [
        { id: 'helpWithInnkeeper', label: 'Get the cellar door open together', next: 'cellarEntry', effects: { setFlags: ['hostConfessed', 'innkeeperHelping'], historyFlags: ['intervened_in_inn_dispute'], knowledge: ['Vale is trapped in the cellar after an accidental fall; the innkeeper concealed the accident to protect the inn.'] } },
        { id: 'callAuthorities', label: 'Send for the constable and a doctor', timeCost: 35, next: 'authoritiesCalled', effects: { setFlags: ['hostConfessed'], historyFlags: ['returned_for_authorities'], knowledge: ['Vale is trapped in the cellar after an accidental fall; the innkeeper concealed the accident to protect the inn.'] } },
        { id: 'leaveAfterConfession', label: 'Tell him to answer for it and leave', next: 'walkAwayEnding', effects: { historyFlags: ['uncovered_inn_truth', 'walked_away_from_inn_problem'] } },
      ],
    },
    serviceHall: {
      id: 'serviceHall', title: 'The Service Passage', tone: 'warning',
      text: 'The passage ends at a swollen cellar door with an old iron latch. Wet scuffs mark the stones on both sides. The innkeeper says the door has stuck before; from below, you hear a faint, deliberate knock.',
      textVariants: [
        { requirements: { flags: ['heardTapping'], minElapsedMinutes: 35 }, text: 'The passage ends at a swollen cellar door with an old iron latch. The three slow knocks Nell described have grown faint beneath your feet. Rainwater creeps under the door, and the innkeeper says the old frame will not hold forever.' },
        { requirements: { flags: ['heardTapping'] }, text: 'The passage ends at a swollen cellar door with an old iron latch. The three slow knocks Nell described sound again beneath your feet. The innkeeper says the door has stuck before.' },
        { requirements: { minElapsedMinutes: 35 }, text: 'The passage ends at a swollen cellar door with an old iron latch. The knock from below has grown faint. Rainwater creeps under the door, and the innkeeper says the old frame will not hold forever.' },
      ],
      choices: [
        { id: 'inspectCellarScuffs', label: 'Study the marks around the cellar door', timeCost: 5, next: 'cellarClues' },
        { id: 'tryCellarLatch', label: 'Lift the swollen latch by hand', timeCost: 8, hint: 'The wood is wet and the frame is shifting; forcing it may hurt you.', chance: { probability: 0.6, successNext: 'cellarEntry', failureNext: 'cellarStuck', successMessage: 'The latch rises and the swollen door gives enough to open.', failureMessage: 'The door jerks back; the latch catches your hand.', successEffects: { setFlags: ['roughAccess'] }, failureEffects: { health: -1, setFlags: ['roughAccess'] } } },
        { id: 'useRecoveredKey', label: 'Use the key pulled from under the room door', timeCost: 1, requirements: { items: ['innCellarKey'] }, next: 'cellarEntry', effects: { setFlags: ['quietAccess'] } },
        { id: 'askInnkeeperForTruth', label: 'Ask the innkeeper to explain the knocks', timeCost: 4, next: 'hostConfrontation' },
      ],
    },
    cellarClues: {
      id: 'cellarClues', title: 'The Marks at the Threshold',
      text: 'One set of scuffs goes down the steps; none come back up. Near the latch, the wood is scraped from the cellar side. Someone below has been trying to move the door. A short length of broken handrail lies nearby.',
      choices: [
        { id: 'openAfterClues', label: 'Try the latch with the handrail for leverage', timeCost: 7, next: 'cellarEntry', effects: { setFlags: ['roughAccess'], knowledge: ['The cellar door was pushed at from below; someone may be trapped there.'] } },
        { id: 'lightAndListen', label: 'Listen and light the gap before opening', timeCost: 3, requirements: { anyItems: CELLAR_LIGHTS }, next: 'cellarEntry', effects: { setFlags: ['quietAccess'], knowledge: ['The marks at the cellar door suggest someone below has been trying to open it.'] } },
        { id: 'callHostToDoor', label: 'Ask the innkeeper to help with the door', timeCost: 4, next: 'hostConfrontation' },
      ],
    },
    cellarEntry: {
      id: 'cellarEntry', title: 'Below the Inn', tone: 'danger',
      text: 'A fallen shelf pins a man’s coat to the cellar floor. Silas Vale is conscious, cold, and unable to free one leg. His travel case lies open beside him. The shelf fell across his path to the door; there is no weapon, no stolen property, and no second person below. The cellar steps creak under the weight of the building.',
      textVariants: [
        { requirements: { items: ['minerHeadlamp'], minElapsedMinutes: 30 }, text: 'Your headlamp picks out the whole cellar at once: a fallen shelf pins Silas Vale to the floor. He is conscious, but cold and visibly weaker after the long wait. His case lies open beside him. The shelf fell across his path to the door; the cellar steps creak under the weight of the building.' },
        { requirements: { items: ['minerHeadlamp'] }, text: 'Your headlamp picks out the whole cellar at once: a fallen shelf pins a man’s coat to the floor. Silas Vale is conscious, cold, and unable to free one leg. His travel case lies open beside him. The shelf fell across his path to the door; there is no weapon, no stolen property, and no second person below. The cellar steps creak under the weight of the building.' },
        { requirements: { minElapsedMinutes: 30 }, text: 'A fallen shelf pins Silas Vale to the cellar floor. He is conscious, but cold and visibly weaker after the long wait. His case lies open beside him. The shelf fell across his path to the door; the cellar steps creak under the weight of the building.' },
      ],
      choices: [
        { id: 'rigRopeForSilas', label: 'Rig your rope to shift the shelf', timeCost: 8, requirements: { items: ['travelRope'] }, chance: { probability: 0.68, bonusItems: ['travelRope'], bonusProbability: 0.12, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'The rope holds while you ease the shelf clear.', failureMessage: 'The shelf rolls before the rope is secure; you stumble hard.', successEffects: { setFlags: ['ropeRescue'] }, failureEffects: { health: -2 } } },
        { id: 'pryShelf', label: 'Use a carried tool to lever the shelf aside', timeCost: 4, requirements: { anyItems: PRY_TOOLS }, chance: { probability: 0.61, bonusItems: PRY_TOOLS, bonusProbability: 0.14, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'A careful lift opens enough space for Vale to pull free.', failureMessage: 'The leverage shifts the shelf and sends you against the stone wall.', successEffects: { setFlags: ['carefulRescue'] }, failureEffects: { health: -2 } } },
        { id: 'getHelpForSilas', label: 'Call the innkeeper and Nell to help lift', timeCost: 5, next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
        { id: 'dropThroughVent', label: 'Climb down through the narrow cellar vent', timeCost: 10, hint: 'The wet stone is slick and the drop is awkward; a fall here could be serious.', chance: { probability: 0.55, bonusItems: ['travelRope'], bonusProbability: 0.2, successNext: 'silasFree', failureNext: 'cellarSlip', successMessage: 'You land on the dry edge and reach Vale.', failureMessage: 'Your foot slips on the wet lip and you fall against the cellar wall.', successEffects: { health: -1, setFlags: ['ventRescue'] }, failureEffects: { health: -4 } } },
      ],
    },
    cellarStuck: {
      id: 'cellarStuck', title: 'The Latch Bites Back', tone: 'danger',
      text: 'The latch has caught your fingers, and the door is still shut. The knock comes again, weaker. The old frame is beginning to split; one more hard pull may open it, but the step above it is shifting.',
      choices: [
        { id: 'pullAgain', label: 'Pull once more and brace for the door', hint: 'The damaged frame may give way suddenly.', chance: { probability: 0.7, successNext: 'cellarEntry', failureNext: 'cellarSlip', successMessage: 'The frame cracks and the door opens.', failureMessage: 'The step drops as the latch tears loose.', failureEffects: { health: -3 } } },
        { id: 'callForInnHelp', label: 'Call the innkeeper to help open it', next: 'hostConfrontation' },
        { id: 'leaveCellarDoor', label: 'Stop and send for outside help', timeCost: 35, next: 'authoritiesCalled', effects: { historyFlags: ['returned_for_authorities'] } },
      ],
    },
    cellarSlip: {
      id: 'cellarSlip', title: 'A Shift in the Cellar', tone: 'danger',
      text: 'The shelf shifts and the old steps groan above you. You are bruised, and the route back is narrowing. Vale is still alive. A second unbraced attempt could bring the shelf or the step down on you.',
      choices: [
        { id: 'summonHelpAfterSlip', label: 'Call the innkeeper and guests to help', next: 'sharedRescue', effects: { setFlags: ['askedForHelp'] } },
        { id: 'retryWithTool', label: 'Make one more attempt with your tool', requirements: { anyItems: PRY_TOOLS }, chance: { probability: 0.58, bonusItems: PRY_TOOLS, bonusProbability: 0.12, successNext: 'silasFree', failureNext: 'cellarSlipAgain', successMessage: 'The tool gives you a stable point of leverage.', failureMessage: 'The shelf shifts again and the stair above cracks.', failureEffects: { health: -3 } } },
        { id: 'climbOutAlone', label: 'Climb out and leave the rescue to others', next: 'leftSilasEnding', effects: { historyFlags: ['uncovered_inn_truth', 'walked_away_from_inn_problem'] } },
      ],
    },
    cellarSlipAgain: {
      id: 'cellarSlipAgain', title: 'The Stair Gives Way', tone: 'danger',
      text: 'A stair breaks loose above you. The cellar is no longer safe to work in. You can still climb toward the service passage, but another attempt here risks being crushed.',
      choices: [
        { id: 'escapeForHelp', label: 'Get out and bring a rescue crew', next: 'authoritiesCalled', effects: { historyFlags: ['returned_for_authorities'] } },
        { id: 'tryLastLift', label: 'Attempt one final lift before the stair falls', hint: 'The danger is immediate and visible; failure could be fatal.', chance: { probability: 0.42, successNext: 'silasFree', failureNext: 'cellarFatalEnding', successMessage: 'You haul Vale clear and scramble toward the door.', failureMessage: 'The stair collapses across the cellar.', successEffects: { health: -2 }, failureEffects: { health: -10 } } },
      ],
    },
    sharedRescue: {
      id: 'sharedRescue', title: 'More Hands at the Door',
      text: 'The innkeeper and two guests arrive with a length of beam. Nell stays near the door and keeps Vale talking while you guide the lift. No one can make the cellar safe, but together you can shift the shelf without putting all the weight on one person.',
      choices: [
        { id: 'guideTheLift', label: 'Guide the shared lift', chance: { probability: 0.86, successNext: 'silasFree', failureNext: 'partialRescue', successMessage: 'The beam takes the weight and Vale pulls his leg free.', failureMessage: 'The shelf shifts, but the group gets Vale clear with a badly bruised leg.', successEffects: { setFlags: ['sharedRescue'] }, failureEffects: { health: -1, setFlags: ['sharedRescue'] } } },
        { id: 'sendForDoctorFirst', label: 'Send for a doctor before moving him', next: 'authoritiesCalled', effects: { setFlags: ['askedForHelp'], historyFlags: ['returned_for_authorities'] } },
      ],
    },
    authoritiesCalled: {
      id: 'authoritiesCalled', title: 'Help on the Road', tone: 'warning',
      text: 'A constable and a doctor arrive with a lantern and a jack. Vale is still trapped but answering. The storm has slowed their journey; the cellar cannot be left as it is, but experienced hands can work under the damaged steps.',
      choices: [
        { id: 'assistAuthorities', label: 'Help the doctor and constable lift the shelf', chance: { probability: 0.9, successNext: 'silasFree', failureNext: 'partialRescue', successMessage: 'The jack takes the load and Vale is brought out safely.', failureMessage: 'They stabilize Vale and his leg, but the shelf will take longer to move.', successEffects: { setFlags: ['outsideHelp'], historyFlags: ['returned_for_authorities'] }, failureEffects: { setFlags: ['outsideHelp'], historyFlags: ['returned_for_authorities'] } } },
        { id: 'leaveAuthoritiesToIt', label: 'Leave the cellar work to them', next: 'partialRescue', effects: { setFlags: ['outsideHelp'], historyFlags: ['returned_for_authorities'] } },
      ],
    },
    silasFree: {
      id: 'silasFree', title: 'The Missing Guest',
      text: 'Vale is out of the cellar, cold and shaken but alive. He confirms the fall was an accident: he went after his case when rainwater came under the back door, and the shelf pinned him before he could reach the stairs. The innkeeper admits he lied about the checkout to avoid an inspection. Nell opens her door on her own.',
      textVariants: [{ requirements: { flags: ['forcedEntry'] }, text: 'Vale is out of the cellar, cold and shaken but alive. He confirms the fall was an accident: he went after his case when rainwater came under the back door, and the shelf pinned him before he could reach the stairs. The innkeeper admits he lied about the checkout to avoid an inspection. Nell opens her door on her own, though the damaged frame will remain between them.' }],
      choices: [
        { id: 'acceptFoldingTool', label: 'Accept the innkeeper’s folding pry tool', requirements: { notItems: ['foldingPryTool'] }, next: 'quietEnding', effects: { gainItems: ['foldingPryTool'], historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
        { id: 'acceptBrassKey', label: 'Keep the old brass room key as a memento', requirements: { notItems: ['brassRoomKey'] }, next: 'quietEnding', effects: { gainItems: ['brassRoomKey'], historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
        { id: 'declineInnReward', label: 'Decline a reward and leave', next: 'quietEnding', effects: { historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
      ],
    },
    partialRescue: {
      id: 'partialRescue', title: 'Safe, but Not Yet Free', tone: 'warning',
      text: 'Vale is alive and the cellar is shored up, but the shelf cannot be moved safely tonight. The doctor stays with him while the constable arranges a proper rescue. Nell and the innkeeper give their accounts separately.',
      choices: [
        { id: 'takeWedgeAfterPartial', label: 'Accept the folding pry tool for your help', requirements: { notItems: ['foldingPryTool'] }, next: 'partialEnding', effects: { gainItems: ['foldingPryTool'], historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
        { id: 'declinePartialReward', label: 'Leave without taking anything', next: 'partialEnding', effects: { historyFlags: ['uncovered_inn_truth', 'intervened_in_inn_dispute'] } },
      ],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Beyond the Inn',
      text: 'You leave the Lantern House and take the road while it is still passable. Behind you, the inn’s windows glow through the rain. You do not learn what happened to Vale, and no one asks you to stay.', choices: [], ending: 'success',
    },
    wrongAccusationEnding: {
      id: 'wrongAccusationEnding', title: 'The Door Left Shut',
      text: 'Nell leaves by the yard door when the argument draws the other guests away. The innkeeper will not speak to you again. The register is still open on the desk, its checkout line blank. You leave with your accusation unanswered and the cellar still quiet.', choices: [], ending: 'success',
    },
    leftSilasEnding: {
      id: 'leftSilasEnding', title: 'A Rescue for the Morning',
      text: 'You climb out and send the others toward the cellar. Vale is alive when you last hear him answer, but the rescue will be left to the innkeeper and the constable. The cellar remains dangerous, and you do not stay to learn how it ends.', choices: [], ending: 'success',
    },
    quietEnding: {
      id: 'quietEnding', title: 'Morning at the Lantern House',
      text: 'The rain eases by morning. Vale is resting upstairs, Nell has opened her room, and the innkeeper has agreed to have the cellar steps repaired before taking another guest. The stories did not all match; the truth was smaller and more ordinary than the worst suspicion, but the lie still mattered.', choices: [], ending: 'success',
    },
    partialEnding: {
      id: 'partialEnding', title: 'A Light Kept Below',
      text: 'The doctor stays with Vale until the proper rescue arrives. Nell and the innkeeper tell their accounts separately, while the cellar door is marked off until it can be repaired. You leave before the weather clears, with the essential truth known but the consequences still unfolding.', choices: [], ending: 'success',
    },
    cellarFatalEnding: {
      id: 'cellarFatalEnding', title: 'Under the Broken Stair', tone: 'danger',
      text: 'The stair gives way before you can clear the shelf. The cellar had warned you it would not bear another attempt.', choices: [], ending: 'death',
    },
  },
};
