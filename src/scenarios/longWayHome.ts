import type { Scenario } from '../types';

const DESCENT_GEAR = ['travelRope', 'ratCatchersHook', 'ironRopeClamp', 'minerHeadlamp'];
const GOOD_HANDLING = ['heavyLeatherGloves'];
const TRUTH = 'Anna has now told you her name is Rowan Voss. She took the mill payroll ledger to document wage deductions and fell while avoiding the foreman.';

export const THE_LONG_WAY_HOME: Scenario = {
  id: 'the-long-way-home',
  title: 'The Long Way Home',
  subtitle: 'A stranger, a storm, and a road where trust has to be earned.',
  startScene: 'encounter',
  timePhases: [
    { id: 'early', label: 'Clouds Gathering', atMinutes: 0 },
    { id: 'worsening', label: 'Cold Rain', atMinutes: 12 },
    { id: 'dangerous', label: 'The Trail Turns Slick', atMinutes: 25 },
    { id: 'critical', label: 'Night and Rising Water', atMinutes: 38 },
  ],
  scenes: {
    encounter: {
      id: 'encounter', title: 'A Stranger by the Milepost', tone: 'warning',
      text: 'A woman sits beside a rain-dark milepost, one ankle swelling beneath a torn boot. She introduces herself as Anna Bell and says a cart slid on the hill road. Northbridge is still several miles away; she asks for help reaching a doctor before the storm closes the pass. There is no blood on the road, but she keeps glancing uphill whenever the wind carries a sound.',
      textVariants: [
        { requirements: { historyFlags: ['refused_mine_rescue'] }, text: 'Anna notices your hesitation. She introduces herself as Anna Bell and says a cart slid on the hill road. One ankle is swelling beneath a torn boot, and she asks for help reaching a doctor in Northbridge before the storm closes the pass. She keeps glancing uphill whenever the wind carries a sound.' },
        { requirements: { historyFlags: ['rescued_missing_person'] }, text: 'Anna has heard you helped bring a missing miner home. She introduces herself as Anna Bell and asks for help reaching a doctor in Northbridge. One ankle is swelling beneath a torn boot. She says a cart slid on the hill road, though she keeps glancing uphill whenever the wind carries a sound.' },
      ],
      choices: [
        { id: 'inspectInjury', label: 'Ask to inspect the ankle', hint: 'A closer look may help you choose how to travel.', timeCost: 4, effects: { knowledge: ['Anna’s ankle is badly sprained, not broken. She can walk with support, but a fall or long delay will make it swell further.'], setFlags: ['examinedAnkle'] }, next: 'injuryAssessment' },
        { id: 'askAboutJourney', label: 'Ask how she came to be here', hint: 'Her account may help you decide what risks to take.', timeCost: 3, effects: { knowledge: ['Anna says she was riding a cart toward Northbridge when it overturned on the hill road. She gives no driver’s name.'], setFlags: ['heardAnnaStory'] }, next: 'firstAccount' },
        { id: 'giveBasicAid', label: 'Leave a clean wrap and point out the road', hint: 'You can help without taking responsibility for the whole journey.', timeCost: 3, effects: { historyFlags: ['gave_limited_aid_to_stranger'] }, next: 'limitedAidEnding' },
        { id: 'leaveAtMilepost', label: 'Continue on without getting involved', hint: 'The choice is yours; the storm has not made you responsible for her.', timeCost: 1, effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'abandonedEnding' },
      ],
    },
    injuryAssessment: {
      id: 'injuryAssessment', title: 'A Swollen Ankle', tone: 'warning',
      text: 'The joint is badly sprained, not broken. Anna can stand if she has something to lean on, but a slip will make the swelling worse. She winces when you test the boot and asks whether you can help her reach the doctor.',
      choices: [
        { id: 'wrapWithGloves', label: 'Support it with a careful wrap', hint: 'Your heavy gloves keep the wet cloth from slipping; this takes less time.', requirements: { items: ['heavyLeatherGloves'] }, timeCost: 5, effects: { setFlags: ['woundSupported'], knowledge: ['You wrapped Anna’s ankle firmly; it is supported, though she will still need to rest and move carefully.'] }, next: 'journeyPlan' },
        { id: 'wrapWithoutGloves', label: 'Improvise an ankle wrap', hint: 'It should help, though wet cloth is awkward to tie.', requirements: { notItems: GOOD_HANDLING }, timeCost: 8, effects: { setFlags: ['woundSupported'], knowledge: ['You wrapped Anna’s ankle firmly; it is supported, though she will still need to rest and move carefully.'] }, next: 'journeyPlan' },
        { id: 'escortUnwrapped', label: 'Help her walk without treating it first', hint: 'Saves time now, but each rough step may worsen the swelling.', timeCost: 1, next: 'journeyPlan' },
        { id: 'aidThenLeave', label: 'Give her the wrap and leave her to choose', hint: 'Basic aid without an escort is a reasonable boundary.', timeCost: 2, effects: { historyFlags: ['gave_limited_aid_to_stranger'] }, next: 'limitedAidEnding' },
      ],
    },
    firstAccount: {
      id: 'firstAccount', title: 'A Short Version',
      text: 'Anna says her cart overturned on the hill road and that she was thrown clear. She is headed to Northbridge, where she says an aunt can take her in. When you ask who was driving, she looks down at the boot and says, “Someone who is not coming back for me.” It may be fear, shame, or a reason to be careful.',
      textVariants: [{ requirements: { historyFlags: ['returned_for_help'] }, text: 'Anna notices that you have fetched help for someone before and gives you a little more room to ask. Her cart overturned on the hill road, she says; she was thrown clear and is headed to an aunt in Northbridge. When you ask who was driving, she looks down at the boot: “Someone who is not coming back for me.” It may be fear, shame, or a reason to be careful.' }],
      choices: [
        { id: 'takeHerAtHerWord', label: 'Accept the account and help her travel', timeCost: 1, effects: { setFlags: ['acceptedFirstAccount'] }, next: 'journeyPlan' },
        { id: 'askWhatSheIsAvoiding', label: 'Ask what she is afraid to say', hint: 'You can ask without accusing her.', timeCost: 3, effects: { setFlags: ['askedForMore'] }, next: 'hesitation' },
        { id: 'leaveAfterQuestions', label: 'Point out the road and continue alone', timeCost: 1, effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'abandonedEnding' },
      ],
    },
    hesitation: {
      id: 'hesitation', title: 'A Name She Swallows', tone: 'warning',
      text: 'Anna starts to answer, then stops. “I need a doctor. That part is true.” She will not say who was driving or why she was alone. Her fear seems genuine, but it does not tell you what she is hiding.',
      choices: [
        { id: 'respectHerBoundary', label: 'Respect the boundary and offer the walk', timeCost: 1, effects: { setFlags: ['respectedBoundary'] }, next: 'journeyPlan' },
        { id: 'askForNameAgain', label: 'Ask whether Anna Bell is her real name', timeCost: 2, effects: { knowledge: ['Anna paused when asked her name and has not explained why.'], setFlags: ['questionedName'] }, next: 'journeyPlan' },
        { id: 'offerLimitedHelpAfterHesitation', label: 'Leave a wrap and let her decide what to do', timeCost: 2, effects: { historyFlags: ['gave_limited_aid_to_stranger'] }, next: 'limitedAidEnding' },
      ],
    },
    journeyPlan: {
      id: 'journeyPlan', title: 'Choosing a Way Down', tone: 'warning',
      text: 'Northbridge lies beyond the ravine. The short path drops over a shale slope; the upper ridge is longer but stays away from the loose ground. A shepherd’s stone shelter is visible near the bend. Anna can manage with support, but she is already favoring the ankle.',
      textVariants: [
        { requirements: { minElapsedMinutes: 25 }, text: 'Northbridge lies beyond the ravine. Cold rain has softened the shale slope and Anna’s ankle has begun to swell again. The upper ridge is longer but avoids the loose ground. The shepherd’s stone shelter is still visible near the bend.' },
        { requirements: { flags: ['woundSupported'] }, text: 'Northbridge lies beyond the ravine. Your wrap gives Anna’s sprained ankle some support, but it will not make the shale slope safe. The upper ridge is longer; a shepherd’s stone shelter is visible near the bend.' },
      ],
      choices: [
        { id: 'directWithGear', label: 'Take the short shale descent with your gear', hint: 'Rope, a hook, clamp, or headlamp gives you something to anchor or see by; the slope remains slick.', requirements: { anyItems: DESCENT_GEAR }, timeCost: 5, chance: { probability: 0.72, bonusFlags: ['woundSupported'], bonusProbability: 0.12, successNext: 'stormTurn', failureNext: 'slopeFailure', successMessage: 'Your gear gives Anna a steady point to hold while you cross the shale.', failureMessage: 'The anchor shifts on the wet slope. You catch yourselves, but Anna’s ankle twists further.', failureEffects: { health: -3, setFlags: ['shortcutFailed'] }, successEffects: { historyFlags: ['risked_shortcut_with_injured_person'], setFlags: ['usedShortCut'] } } },
        { id: 'directWithoutGear', label: 'Try the short shale descent without an anchor', hint: 'It is quicker, but the slick slope has no handline. A fall could injure you both.', requirements: { notItems: DESCENT_GEAR }, timeCost: 6, chance: { probability: 0.5, bonusFlags: ['woundSupported'], bonusProbability: 0.14, successNext: 'stormTurn', failureNext: 'slopeFailure', successMessage: 'You find a firm seam through the shale and keep Anna on her feet.', failureMessage: 'Loose stones slide underfoot. You keep Anna from going over the edge, but land hard on one shoulder.', failureEffects: { health: -3, setFlags: ['shortcutFailed'] }, successEffects: { historyFlags: ['risked_shortcut_with_injured_person'], setFlags: ['usedShortCut'] } } },
        { id: 'takeUpperRidge', label: 'Use the longer upper trail', hint: 'It costs more time, but avoids the loose slope.', timeCost: 15, effects: { setFlags: ['choseUpperRidge'] }, next: 'ridgeJourney' },
        { id: 'reachStoneShelter', label: 'Get under shelter before choosing again', hint: 'A pause costs time but may keep the rain from worsening the injury.', timeCost: 8, effects: { setFlags: ['soughtShelter'] }, next: 'shelterStop' },
      ],
    },
    ridgeJourney: {
      id: 'ridgeJourney', title: 'The Upper Trail', tone: 'warning',
      text: 'The ridge is longer, but it keeps you away from the shale. Anna leans on your shoulder at the steeper turns. Below, the road disappears into mist; ahead, a stream cuts across the last descent to Northbridge.',
      textVariants: [
        { requirements: { flags: ['woundSupported'] }, text: 'The ridge is longer, but it keeps you away from the shale. Your wrap steadies Anna’s ankle at the steep turns. Below, the road disappears into mist; ahead, a stream cuts across the last descent to Northbridge.' },
        { requirements: { minElapsedMinutes: 25 }, text: 'The ridge is longer, and the cold has made Anna’s steps shorter. It avoids the shale, but a stream cuts across the last descent to Northbridge and the rain is still strengthening.' },
      ],
      choices: [
        { id: 'continueFromRidge', label: 'Continue to the stream crossing', timeCost: 5, next: 'stormTurn' },
        { id: 'takeRidgeShelter', label: 'Leave the trail for the stone shelter', hint: 'A further delay, but Anna is tiring.', timeCost: 4, effects: { setFlags: ['soughtShelter'] }, next: 'shelterStop' },
        { id: 'askAnnaAboutThePause', label: 'Ask why she keeps looking behind', timeCost: 2, effects: { setFlags: ['askedAboutPursuit'] }, next: 'hesitationOnRidge' },
      ],
    },
    hesitationOnRidge: {
      id: 'hesitationOnRidge', title: 'Footsteps on the Ridge', tone: 'warning',
      text: 'Anna says she heard someone following her before the cart overturned. She cannot tell whether it was the driver, a passerby, or the wind carrying sound along the rocks. Then a lantern appears on the path behind you.',
      choices: [
        { id: 'askHerPrivatelyOnRidge', label: 'Ask Anna who may be following', timeCost: 2, next: 'revelation' },
        { id: 'continueToTheStream', label: 'Keep moving toward Northbridge', timeCost: 2, next: 'stormTurn' },
        { id: 'goToShelterFromRidge', label: 'Take her to the stone shelter', timeCost: 3, effects: { setFlags: ['soughtShelter'] }, next: 'shelterStop' },
      ],
    },
    shelterStop: {
      id: 'shelterStop', title: 'The Shepherd’s Shelter', tone: 'safe',
      text: 'The stone shelter blocks the worst of the rain. Anna warms her hands against the wall and says the ankle has stopped throbbing quite so sharply. The pause is helping her; daylight is still fading outside, and the storm has not passed.',
      textVariants: [{ requirements: { minElapsedMinutes: 25 }, text: 'The stone shelter blocks the worst of the rain, but the pause has used much of the remaining daylight. Anna is shivering despite the dry wall and says the ankle is stiffening. You can ask for help, wait for the worst gusts to pass, or continue with care.' }],
      choices: [
        { id: 'restThroughSquall', label: 'Wait out the strongest gusts', hint: 'Costs time; shelter makes the next exposed stretch safer.', timeCost: 14, effects: { setFlags: ['waitedShelter'], historyFlags: ['sheltered_instead_of_pushing_on'] }, next: 'shelteredMorning' },
        { id: 'signalShepherd', label: 'Walk to the shepherd’s holding and ask for help', hint: 'You will leave Anna sheltered while you fetch someone.', timeCost: 16, effects: { historyFlags: ['sought_help_for_stranger'], setFlags: ['soughtHelp'] }, next: 'helpRendezvous' },
        { id: 'leaveShelterForUpperTrail', label: 'Continue by the upper trail', hint: 'The weather is worsening, but the longer route avoids the steep slope.', timeCost: 12, effects: { setFlags: ['choseUpperRidge'] }, next: 'stormTurn' },
        { id: 'leaveShelterAlone', label: 'Tell her where the road is and leave', effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'abandonedEnding' },
      ],
    },
    shelteredMorning: {
      id: 'shelteredMorning', title: 'A Break in the Rain', tone: 'warning',
      text: 'The worst gusts pass, though daylight has thinned to a grey strip along the ridge. Anna’s ankle is no better, but the dry pause has stopped her shivering. She thanks you for waiting without pretending it solved the journey.',
      choices: [
        { id: 'resumeAfterShelter', label: 'Take the upper trail toward the stream', timeCost: 9, effects: { setFlags: ['choseUpperRidge'] }, next: 'stormTurn' },
        { id: 'askAnnaAfterShelter', label: 'Ask what she has not told you', timeCost: 2, effects: { setFlags: ['askedAboutPursuit'] }, next: 'revelation' },
        { id: 'seekHelpAfterShelter', label: 'Fetch help from the shepherd’s holding', timeCost: 13, effects: { historyFlags: ['sought_help_for_stranger'], setFlags: ['soughtHelp'] }, next: 'helpRendezvous' },
      ],
    },
    helpRendezvous: {
      id: 'helpRendezvous', title: 'A Lantern at the Holding', tone: 'warning',
      text: 'The shepherd agrees to walk back with a handcart. At the shelter, Anna is still where you left her. As the shepherd offers the cart, a second lantern appears on the road and a man calls, “Rowan, wait.” Anna goes very still. The shepherd does not know either of them well enough to choose a side.',
      textVariants: [{ requirements: { historyFlags: ['returned_for_help'] }, text: 'The shepherd recognizes that you have fetched help before and trusts your judgment. He agrees to bring a handcart to the shelter. A second lantern appears on the road; a man calls, “Rowan, wait.” Anna goes very still. The shepherd does not know either of them well enough to choose a side.' }],
      choices: [
        { id: 'askRowanWithShepherdPresent', label: 'Ask Anna to explain before you leave', timeCost: 2, next: 'revelation' },
        { id: 'bringBothToClinic', label: 'Bring Anna and the man to the clinic together', timeCost: 12, effects: { historyFlags: ['sought_help_for_stranger'] }, next: 'townCare' },
        { id: 'leaveAnnaWithShepherd', label: 'Leave her in the shepherd’s care', hint: 'She will have shelter and help, though you will not know what follows.', effects: { historyFlags: ['sought_help_for_stranger'] }, next: 'helpEnding' },
      ],
    },
    stormTurn: {
      id: 'stormTurn', title: 'A Voice Behind You', tone: 'danger',
      text: 'At the stream crossing, a man comes down the upper path with a lantern. “Rowan, wait,” he calls. Anna flinches at the name, though she told you she was Anna Bell. The stream is higher than it looked from the ridge; the upper road to Northbridge remains open, but the short crossing is faster and visibly slick.',
      textVariants: [
        { requirements: { minElapsedMinutes: 38, flags: ['waitedShelter'] }, text: 'Night has settled along the stream. Though the shelter kept the worst rain off, the water now carries branches over the stepping stones. The lantern behind you is closer and Anna is stiff with cold. The upper road remains open; crossing here could sweep a person off their feet.' },
        { requirements: { minElapsedMinutes: 38 }, text: 'Night has settled along the stream. The lantern behind you is closer, and the water now carries branches over the stepping stones. Anna can still walk, but each step is slower. The upper road to Northbridge is open; the short crossing is dangerous and could sweep a person off their feet.' },
        { requirements: { flags: ['waitedShelter'] }, text: 'At the stream crossing, a man comes down the upper path with a lantern. “Rowan, wait,” he calls. Anna flinches at the name she did not give you. The shelter kept the worst rain off, but the stream has risen while you waited. The upper road remains open; the short crossing is slick.' },
        { requirements: { minElapsedMinutes: 38 }, text: 'Night has settled along the stream. The lantern behind you is closer, and the water now carries branches over the stepping stones. Anna can still walk, but each step is slower. The upper road to Northbridge is open; the short crossing is dangerous and could sweep a person off their feet.' },
        { requirements: { minElapsedMinutes: 25 }, text: 'The stream has risen over the lower stones. The man with the lantern is closer now and calls, “Rowan, wait.” Anna flinches at the name she did not give you. The upper road remains open; crossing here is faster but risky.' },
      ],
      choices: [
        { id: 'askAnnaAboutRowan', label: 'Ask Anna privately why he used that name', hint: 'She may explain, or refuse.', timeCost: 2, effects: { knowledge: ['A man searching the road called Anna “Rowan”; she reacted as if she knew him.'], setFlags: ['heardOtherName'] }, next: 'revelation' },
        { id: 'hearLanternMansClaim', label: 'Let the man explain why he is following', timeCost: 3, effects: { knowledge: ['The man says he is Benn Voss, foreman at the Northbridge mill, and claims Anna took the payroll ledger.'], setFlags: ['heardForemanClaim'] }, next: 'pursuerAccount' },
        { id: 'takeUpperRoadToTown', label: 'Keep to the upper road toward the clinic', hint: 'Longer, but avoids the flooded stream and gives everyone room.', timeCost: 14, effects: { setFlags: ['choseUpperRidge'] }, next: 'townCare' },
        { id: 'crossSwollenStream', label: 'Try the short stream crossing', hint: 'The water is carrying branches. A fall could seriously injure you.', timeCost: 5, chance: { probability: 0.48, bonusItems: DESCENT_GEAR, bonusFlags: ['waitedShelter', 'woundSupported'], bonusProbability: 0.2, successNext: 'townCare', failureNext: 'creekFall', successMessage: 'You hold each other against the current and reach the far bank.', failureMessage: 'A branch knocks your legs out from under you. You drag yourself to the bank, badly bruised.', successEffects: { historyFlags: ['risked_shortcut_with_injured_person', 'escorted_injured_stranger'] }, failureEffects: { health: -7, setFlags: ['streamFall'] } } },
      ],
    },
    slopeFailure: {
      id: 'slopeFailure', title: 'Loose Ground', tone: 'danger',
      text: 'The shale slides away beneath you. You keep Anna from tumbling farther, but your shoulder hits the slope and her ankle twists. The direct cut has closed. The upper trail is still passable, though the rain is colder now; you can also shelter or go for help.',
      choices: [
        { id: 'continueAfterSlip', label: 'Take the upper trail more slowly', timeCost: 12, effects: { setFlags: ['choseUpperRidge'] }, next: 'stormTurn' },
        { id: 'shelterAfterSlip', label: 'Get Anna under cover', hint: 'The slope is closed; shelter costs time but may prevent another fall.', timeCost: 8, effects: { setFlags: ['soughtShelter'] }, next: 'shelterAfterSlip' },
        { id: 'fetchHelpAfterSlip', label: 'Leave her sheltered and fetch help', timeCost: 15, effects: { historyFlags: ['sought_help_for_stranger'], setFlags: ['soughtHelp'] }, next: 'helpRendezvous' },
        { id: 'stopAfterSlip', label: 'Make sure she is safe, then leave', effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'abandonedEnding' },
      ],
    },
    shelterAfterSlip: {
      id: 'shelterAfterSlip', title: 'A Pause After the Fall', tone: 'warning',
      text: 'Under the rock overhang, you bind your shoulder and recheck Anna’s ankle. She can still walk, but the swelling has worsened. The shortcut is no longer an option. The upper road will take time; the shepherd’s holding is close enough to call for help.',
      choices: [
        { id: 'resumeUpperAfterSlip', label: 'Continue by the upper road', timeCost: 12, effects: { setFlags: ['choseUpperRidge'] }, next: 'stormTurn' },
        { id: 'seekHelpAfterSlip', label: 'Go to the shepherd’s holding for help', timeCost: 14, effects: { historyFlags: ['sought_help_for_stranger'], setFlags: ['soughtHelp'] }, next: 'helpRendezvous' },
        { id: 'endAfterSlip', label: 'Leave her with shelter and directions', effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'abandonedEnding' },
      ],
    },
    revelation: {
      id: 'revelation', title: 'Anna Is Rowan', tone: 'warning',
      text: 'She finally tells you the rest. Her name is Rowan Voss, and she works as a tally clerk at the Northbridge mill. She took the payroll ledger without permission after finding deductions she believes were falsified. Benn, the foreman and her older brother, is looking for it. She admits the theft; she says she ran because he would bring her straight back to the mill before she could show the book to anyone. She cannot prove the pages tell the whole story.',
      textVariants: [{ requirements: { flags: ['heardForemanClaim'] }, text: 'Rowan confirms that her name is Rowan Voss and that she took the payroll ledger from the mill. She says the deductions were falsified; Benn says the book belongs to the mill. Her ankle was hurt while she fled the hill road. She admits the theft and does not claim the ledger proves everything.' }],
      choices: [
        { id: 'protectRowanAtClinic', label: 'Take her to the clinic and stand witness', hint: 'The book can be reviewed without handing her back to the mill.', timeCost: 8, effects: { historyFlags: ['uncovered_strangers_truth', 'protected_stranger_from_pursuer', 'escorted_injured_stranger'], setFlags: ['rowanTruth', 'trustedRowan'] }, next: 'townCare' },
        { id: 'bringBothSidesToWarden', label: 'Ask Rowan and Benn to make their case in town', hint: 'You do not have to decide whose account is complete.', timeCost: 7, effects: { historyFlags: ['uncovered_strangers_truth', 'escorted_injured_stranger'], setFlags: ['rowanTruth', 'heardForemanClaim'] }, next: 'townCare' },
        { id: 'leaveAfterTruth', label: 'Leave Rowan with the shepherd and continue alone', hint: 'She has shelter and a chance to get help, but no escort.', effects: { historyFlags: ['uncovered_strangers_truth', 'abandoned_injured_stranger'] }, next: 'helpEnding' },
      ],
    },
    pursuerAccount: {
      id: 'pursuerAccount', title: 'Benn’s Version', tone: 'warning',
      text: 'The man introduces himself as Benn Voss, foreman at the Northbridge mill. He says the woman is his sister Rowan and that she took the payroll ledger, a book he says is company property. He insists he only wants it returned and offers no explanation for why Rowan is afraid to go back. His account fits the name she concealed; it does not settle what happened at the mill.',
      choices: [
        { id: 'askRowanToAnswerBenn', label: 'Ask Rowan to answer his claim', timeCost: 2, next: 'revelation' },
        { id: 'takeBothToTown', label: 'Bring both accounts to the town warden', timeCost: 8, effects: { setFlags: ['heardForemanClaim'] }, next: 'townCare' },
        { id: 'handLedgerToBenn', label: 'Give Benn the ledger and leave them to settle it', hint: 'He promises Rowan will see the doctor, but you will not witness what follows.', effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'handOverEnding' },
        { id: 'walkAwayFromBenn', label: 'Leave them both and take the road', effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'abandonedEnding' },
      ],
    },
    townCare: {
      id: 'townCare', title: 'Northbridge Clinic', tone: 'safe',
      text: 'You reach the clinic before the last light leaves the road. The doctor begins treating the ankle. While she waits, Anna gives her real name—Rowan Voss—and explains that she took the mill payroll ledger. She says it records false deductions; Benn says the book is stolen property. The town warden agrees to hold the ledger while both accounts are heard. You can decide what part you will play.',
      textVariants: [
        { requirements: { flags: ['rowanTruth'] }, text: 'At the clinic, Rowan repeats what she told you on the trail. The doctor treats her ankle while the town warden takes the payroll ledger for review. Benn waits outside and does not approach her. No one here can yet prove which pages tell the full story.' },
        { requirements: { flags: ['heardForemanClaim'] }, text: 'At the clinic, Rowan confirms Benn’s account that she took the payroll ledger, then disputes why. The doctor treats her ankle while the warden keeps the book for review. The two accounts remain in conflict.' },
      ],
      choices: [
        { id: 'standWithRowan', label: 'Stay as Rowan’s witness', hint: 'You can support her without claiming to know what the ledger proves.', timeCost: 3, effects: { historyFlags: ['escorted_injured_stranger', 'protected_stranger_from_pursuer', 'uncovered_strangers_truth'] }, next: 'rewardOffer' },
        { id: 'letWardenReview', label: 'Leave the decision to the town warden', hint: 'Both accounts and the ledger will be heard; you need not choose a side.', timeCost: 2, effects: { historyFlags: ['escorted_injured_stranger', 'uncovered_strangers_truth'] }, next: 'rewardOffer' },
        { id: 'returnBookToBenn', label: 'Let Benn take the ledger back to the mill', hint: 'Rowan will be treated, but the book leaves the warden’s hands.', effects: { historyFlags: ['uncovered_strangers_truth'] }, next: 'handOverEnding' },
        { id: 'leaveFromClinic', label: 'Leave Rowan in the doctor’s care', hint: 'She has medical help; you can end the escort here.', effects: { historyFlags: ['abandoned_injured_stranger', 'uncovered_strangers_truth'] }, next: 'partialHelpEnding' },
      ],
    },
    rewardOffer: {
      id: 'rewardOffer', title: 'A Thank-You, Not a Verdict', tone: 'safe',
      text: 'The doctor confirms Rowan can rest safely at the clinic. Her cousin arrives with a weatherproof cloak and asks you to take it for the walk back. The doctor also offers a small trail compass from the clinic’s returned-property drawer. Both are useful; you may accept one, or leave both here. The gift does not decide whether Rowan’s account is true.',
      choices: [
        { id: 'acceptWeatherproofCloak', label: 'Accept the weatherproof cloak', hint: 'Rowan’s cousin places the dry oilskin in your hands.', requirements: { notItems: ['weatherproofCloak'] }, effects: { gainItems: ['weatherproofCloak'] }, next: 'safeArrivalEnding' },
        { id: 'acceptTrailCompass', label: 'Accept the trail compass', hint: 'The doctor hands over the small brass compass.', requirements: { notItems: ['trailCompass'] }, effects: { gainItems: ['trailCompass'] }, next: 'safeArrivalEnding' },
        { id: 'declineAllGifts', label: 'Thank them and leave without a gift', next: 'safeArrivalEnding' },
      ],
    },
    creekFall: {
      id: 'creekFall', title: 'The Stream Takes Your Feet', tone: 'danger',
      text: 'A branch strikes your legs and the current pulls you under for a moment. You reach the bank with a bruised chest; Rowan is safe but cannot climb the far side unaided. The upper trail is still visible. Trying the water again would be reckless; you can seek help or take the slower bank path.',
      choices: [
        { id: 'climbBankTogether', label: 'Take the long bank path to the clinic', timeCost: 12, effects: { historyFlags: ['escorted_injured_stranger'] }, next: 'townCare' },
        { id: 'signalAfterFall', label: 'Call for help from high ground', timeCost: 8, effects: { historyFlags: ['sought_help_for_stranger'], setFlags: ['soughtHelp'] }, next: 'helpRendezvous' },
        { id: 'leaveAfterStreamFall', label: 'Make sure Rowan is sheltered, then leave', effects: { historyFlags: ['abandoned_injured_stranger'] }, next: 'partialHelpEnding' },
      ],
    },
    abandonedEnding: {
      id: 'abandonedEnding', title: 'The Road You Chose',
      text: 'You continue alone. Rowan has the road directions and the shelter is within sight, but you do not learn whether she reaches Northbridge or why someone called her by another name. The storm follows both paths.', choices: [], ending: 'success',
    },
    limitedAidEnding: {
      id: 'limitedAidEnding', title: 'Help Without an Escort',
      text: 'You leave a clean wrap and point out the route to the shepherd’s shelter. Anna thanks you and says she will decide whether to wait or try the road. You have helped within the boundary you chose; what she does next is hers.', choices: [], ending: 'success',
    },
    helpEnding: {
      id: 'helpEnding', title: 'Help Arrives',
      text: 'The shepherd stays with Rowan until the weather eases and the clinic sends a cart. You do not see how she and Benn settle their dispute, but she is no longer alone beside the road.', choices: [], ending: 'success',
    },
    partialHelpEnding: {
      id: 'partialHelpEnding', title: 'The Clinic Door',
      text: 'Rowan reaches the clinic and the doctor takes responsibility for her ankle. You leave before learning what happens to the ledger. She has care and a roof, though the journey ends without your further help.', choices: [], ending: 'success',
    },
    handOverEnding: {
      id: 'handOverEnding', title: 'The Ledger Returned',
      text: 'Benn takes the ledger back to the mill and says Rowan will see the doctor. The warden records what happened, but cannot force the book to stay in town. Rowan’s account may be true; you have chosen not to test it here.', choices: [], ending: 'success',
    },
    safeArrivalEnding: {
      id: 'safeArrivalEnding', title: 'A Place to Rest',
      text: 'Rowan is under a doctor’s care, and the warden has the ledger. Benn leaves without taking her back to the mill. No one calls the matter settled, but the immediate journey is over and the next decision belongs to Northbridge.', choices: [], ending: 'success',
    },
    __death: { id: '__death', title: 'The Current Wins', text: 'The stream sweeps you against the rocks before Rowan can reach you. The warning was clear, but the crossing has gone wrong beyond recovery.', choices: [], ending: 'death' },
  },
};
