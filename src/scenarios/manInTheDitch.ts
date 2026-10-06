import type { Scenario } from '../types';

const HAND_TOOLS = ['pocketToolkit', 'foremanMultiTool', 'compactWheelWrench', 'foldingPryTool', 'brassCandlestick', 'gateHook'];
const LIGHT_TOOLS = ['minerHeadlamp', 'lantern', 'roadmansLantern'];
const HAULING_TOOLS = ['travelRope', 'freightmansStrap', 'ironRopeClamp'];

export const THE_MAN_IN_THE_DITCH: Scenario = {
  id: 'the-man-in-the-ditch',
  title: 'The Man in the Ditch',
  subtitle: 'An injured stranger, a plausible story, and evidence that refuses to agree.',
  startScene: 'roadsideDiscovery',
  timePhases: [
    { id: 'stable', label: 'Late Afternoon', atMinutes: 0 },
    { id: 'worsening', label: 'Light Thinning', atMinutes: 8 },
    { id: 'dangerous', label: 'Dusk', atMinutes: 20 },
    { id: 'critical', label: 'After Dark', atMinutes: 38 },
    { id: 'aftermath', label: 'Night', atMinutes: 55 },
  ],
  scenes: {
    roadsideDiscovery: {
      id: 'roadsideDiscovery', title: 'A Voice Below the Road', tone: 'warning',
      text: 'Late afternoon, after a brief shower, a man lies in the shallow ditch beside the mile road, one sleeve dark with blood. The rain has eased, but the ground is soft and the wagon ruts hold muddy water. He is awake, bruised, and breathing hard. “Robbed,” he says. “Two men. They took my purse and dragged me off the road.” The ruts run toward a gap beneath the orchard trees. Cloud keeps the light flat; for now, you can still read the ground.',
      textVariants: [{ requirements: { historyFlags: ['helped_injured_stranger'] }, text: 'You remember the weight of an injured stranger before you know his name. This man is awake in the ditch, bruised, and bleeding through one sleeve. “Robbed,” he says. “Two men. They took my purse and dragged me off the road.” Wagon ruts cross the grass; the light is already thinning.' }],
      choices: [
        { id: 'helpImmediately', label: 'Give him immediate aid', hint: 'You may steady him, but the road evidence will have less of your attention.', timeCost: 5, next: 'aidBeforeQuestions', effects: { setFlags: ['helpedFirst', 'manStabilized', 'helpedRowanDirectly'], historyFlags: ['helped_injured_stranger'] } },
        { id: 'askWhatHappened', label: 'Ask what happened before moving him', hint: 'A few questions may preserve details, but he is still bleeding.', timeCost: 3, next: 'firstAccount', effects: { setFlags: ['questionedBeforeAid', 'investigated_before_helping'], historyFlags: ['investigated_before_helping'], knowledge: ['The injured man says two attackers took his purse and pulled him from the road.'] } },
        { id: 'inspectRoadside', label: 'Read the ground around the ditch', hint: 'The ruts and blood are visible now; a close search will take longer.', timeCost: 4, next: 'firstEvidence', effects: { setFlags: ['investigatedBeforeAid', 'investigated_before_helping'], historyFlags: ['investigated_before_helping'] } },
        { id: 'leaveImmediately', label: 'Leave him and continue down the road', hint: 'You can go. The man cannot follow you in his condition.', timeCost: 1, next: 'walkAwayEnding', effects: { historyFlags: ['left_injured_man_behind'] } },
      ],
    },
    aidBeforeQuestions: {
      id: 'aidBeforeQuestions', title: 'Hands Before Questions', tone: 'safe',
      text: 'You fold cloth over the cut and help him sit above the wet grass. His breathing eases. He gives his name as Rowan and grips your wrist once in thanks. The light is still good, but the tracks cross a stony shoulder where rain and passing wheels can erase them.',
      textVariants: [{ requirements: { anyItems: ['fieldBandageRoll'] }, text: 'Your field bandage roll makes the first aid clean and quick. Rowan’s breathing steadies, and he gives his name. The tracks still cross the road, but rain is starting to stipple the dust.' }],
      choices: [
        { id: 'letRowanExplain', label: 'Ask Rowan to tell the whole story', timeCost: 4, next: 'rowanAccountHelped', effects: { knowledge: ['Rowan says two attackers took his purse and pulled him from the road.'], setFlags: ['manStabilized'] } },
        { id: 'useFieldBandageNow', label: 'Use your field bandage roll', requirements: { items: ['fieldBandageRoll'] }, hint: 'A clean wrap steadies him quickly; the roll will be spent.', timeCost: 2, next: 'rowanAccountHelped', effects: { loseItems: ['fieldBandageRoll'], setFlags: ['manStabilized', 'bandageRollUsed'] } },
        { id: 'searchAfterAid', label: 'Search the roadside while he rests', hint: 'The ground is disturbed in more than one direction.', timeCost: 6, next: 'evidenceAfterAid', effects: { setFlags: ['evidenceSearched', 'manStabilized'] } },
        { id: 'goForHelpAfterAid', label: 'Go for help while he is stable', hint: 'The nearest farm is a long walk; the tracks may be gone when you return.', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned', 'manStabilized'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    firstAccount: {
      id: 'firstAccount', title: 'Two Men on the Road', tone: 'warning',
      text: 'Rowan says the attackers came from the tree line. One struck him; the other took a leather purse. He says a wagon was passing, and he thinks they pulled him aside to keep it from stopping. He answers plainly, though he looks toward the road each time a wheel sounds in the distance.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'Rowan repeats that two men took his purse, but the words come slower now. His sleeve is wet through and he shivers in the ditch. The wagon ruts are still visible; the finer marks beside them are not.' },
        { requirements: { minElapsedMinutes: 8 }, text: 'Rowan’s account is still plausible: two men, a stolen purse, a blow from behind. His voice is less steady than before, and blood has seeped past his sleeve.' },
      ],
      choices: [
        { id: 'treatAfterQuestions', label: 'Bandage him before asking more', timeCost: 7, next: 'aidAfterQuestions', effects: { setFlags: ['manStabilized', 'helpedAfterQuestions', 'helpedRowanDirectly'], historyFlags: ['helped_injured_stranger'] } },
        { id: 'searchTracksAfterQuestions', label: 'Inspect the ruts and footprints', hint: 'This delays treatment; the blood loss is visible.', timeCost: 6, next: 'evidenceAfterQuestions', effects: { setFlags: ['evidenceSearched', 'investigatedBeforeAid'] } },
        { id: 'fetchHelpBeforeQuestions', label: 'Go to the farm for help', hint: 'The walk there and back will take time; Rowan may worsen before you return.', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    firstEvidence: {
      id: 'firstEvidence', title: 'Ruts, Blood, and One Clean Patch', tone: 'warning',
      text: 'The wagon ruts leave the road toward a visible gap in the orchard trees, then turn back onto it. A blood smear begins at the ditch, but the crushed grass suggests someone stood beside Rowan before he fell. One set of boot prints goes toward the trees; another is hard to separate from the wheel marks. It could be an ambush, an argument beside a wagon, or a fall. Rowan watches you work.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'Rain has blurred the small prints, though the deep wagon ruts remain. The blood smear still begins at the ditch. Rowan’s sleeve is wetter now; the scene is giving you fewer answers as he loses strength.' },
        { requirements: { minElapsedMinutes: 8 }, text: 'The ruts are plain, but the fine heel marks are already softening in damp dust. The blood starts at the ditch, not the road. Rowan is still watching you, jaw tight against the pain.' },
      ],
      choices: [
        { id: 'treatAfterSearch', label: 'Stop searching and bandage Rowan', timeCost: 7, next: 'aidAfterInvestigation', effects: { setFlags: ['manStabilized', 'helpedAfterInvestigation', 'helpedRowanDirectly'], historyFlags: ['helped_injured_stranger'] } },
        { id: 'followBootprints', label: 'Follow the clearer prints toward the trees', hint: 'The light is fading and Rowan remains untreated.', timeCost: 9, next: 'treeLineEvidence', effects: { setFlags: ['followedTracks', 'investigatedBeforeAid'] } },
        { id: 'inspectWagonRuts', label: 'Trace the wagon ruts to their turnoff', timeCost: 6, next: 'wagonTurnoff', effects: { setFlags: ['foundWagonTurnoff', 'investigatedBeforeAid'] } },
        { id: 'searchBeyondTheDitch', label: 'Search beyond the first clear marks', hint: 'A longer search may reveal more, while Rowan waits untreated.', timeCost: 5, next: 'evidenceAfterInvestigation', effects: { setFlags: ['evidenceSearched', 'investigatedBeforeAid'] } },
      ],
    },
    rowanAccountHelped: {
      id: 'rowanAccountHelped', title: 'A Plausible Account', tone: 'warning',
      text: 'With the cut covered, Rowan speaks more steadily. He says two men came from behind, took his purse, and hauled him out of the road. The wagon had stopped nearby, he insists, but belonged to no one he knew. He cannot say why one boot print seems to point back toward the ruts.',
      choices: [
        { id: 'inspectNowThatHeIsStable', label: 'Check the ground while the light holds', timeCost: 6, next: 'evidenceAfterAid', effects: { setFlags: ['evidenceSearched', 'manStabilized'] } },
        { id: 'askAboutHisBoots', label: 'Ask why his boot is muddy above the ankle', hint: 'The mud may have come from the ditch—or elsewhere.', timeCost: 3, next: 'contradictionWithTrust', effects: { setFlags: ['bootContradictionNoticed', 'questionedAccount'] } },
        { id: 'goForHelpFromAccount', label: 'Get a doctor and let others investigate', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned', 'manStabilized'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    aidAfterQuestions: {
      id: 'aidAfterQuestions', title: 'A Late Bandage', tone: 'warning',
      text: 'You wrap the cut as firmly as the cloth allows. Rowan’s color is poor, but he can sit without swaying. The long pause before treatment cost him strength; now there is time for one careful line of inquiry, not a thorough search.',
      textVariants: [{ requirements: { anyItems: ['fieldBandageRoll'] }, text: 'The field bandage roll gives you a cleaner wrap, though the delay still shows in Rowan’s pale face. He can sit without swaying. There is time for one careful inquiry, not a thorough search.' }],
      choices: [
        { id: 'askAboutWagonLate', label: 'Ask about the wagon he mentioned', timeCost: 3, next: 'contradictionWithTrust', effects: { setFlags: ['questionedAccount'] } },
        { id: 'followTracksLate', label: 'Follow the prints before the light fails', hint: 'The tracks are faint and Rowan is not ready to travel.', timeCost: 8, next: 'treeLineEvidence', effects: { setFlags: ['followedTracks', 'investigatedBeforeAid'] } },
        { id: 'escortFromLateAid', label: 'Take him toward the farm now', hint: 'Without a splint or help, the uneven road may be hard on his leg.', timeCost: 8, next: 'escortAttempt', effects: { setFlags: ['escortAttempted', 'manStabilized'], historyFlags: ['escorted_injured_man'] } },
      ],
    },
    evidenceAfterQuestions: {
      id: 'evidenceAfterQuestions', title: 'The Marks Do Not Agree', tone: 'danger',
      text: 'The first footprints you can trust are both Rowan’s. One set comes out of the trees; another begins beside the wagon ruts. The purse could have been taken here, but the clean patch of ground near the wheel looks deliberately swept. Rowan’s breathing has turned shallow while you searched.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'The rain has washed away the finer prints. You can still see a swept patch beside the wheel ruts, but not who made it. Rowan’s breathing is shallow now; the search has cost him.' },
        { requirements: { minElapsedMinutes: 8 }, text: 'Two sets of prints overlap by the ruts, but the finer edges are softening in rain. A patch beside the wheel looks swept. Rowan’s breathing has turned shallow while you searched.' },
      ],
      choices: [
        { id: 'bandageAtEvidence', label: 'Treat Rowan now', timeCost: 7, next: 'aidAfterInvestigation', effects: { setFlags: ['manStabilized', 'helpedAfterInvestigation', 'helpedRowanDirectly'], historyFlags: ['helped_injured_stranger'] } },
        { id: 'inspectTurnoffFromEvidence', label: 'Follow the ruts to their turnoff', timeCost: 6, next: 'wagonTurnoff', effects: { setFlags: ['foundWagonTurnoff'] } },
        { id: 'confrontFromPrints', label: 'Ask Rowan to explain the second trail', hint: 'He may take an accusation badly, especially while hurt.', timeCost: 3, next: 'contradictionWithSuspicion', effects: { setFlags: ['bootContradictionNoticed', 'confrontedStory'], historyFlags: ['confronted_false_robbery_story'] } },
      ],
    },
    aidAfterInvestigation: {
      id: 'aidAfterInvestigation', title: 'The Search Has a Cost', tone: 'warning',
      text: 'You bind Rowan’s sleeve and help him sit upright. He is conscious, but the delay has made him weak and the last clean prints are gone. He does not thank you; he asks what you found. You can answer honestly, or wait for help to arrive.',
      textVariants: [{ requirements: { minElapsedMinutes: 20 }, text: 'Rowan’s blood has soaked through the first fold. Your bandage slows it, but cannot replace the time lost. Rain has erased the small prints. He asks what you found, and whether help is coming.' }],
      choices: [
        { id: 'tellRowanEvidence', label: 'Tell him what the ground showed', timeCost: 2, next: 'contradictionWithSuspicion', effects: { setFlags: ['bootContradictionNoticed'] } },
        { id: 'escortFromInvestigation', label: 'Help him toward the farm', hint: 'The road shoulder is uneven; a splint or hauling line would help.', timeCost: 9, next: 'escortAttempt', effects: { setFlags: ['escortAttempted'], historyFlags: ['escorted_injured_man'] } },
        { id: 'sendHelpFromSearch', label: 'Go for help and leave him sheltered', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    evidenceAfterAid: {
      id: 'evidenceAfterAid', title: 'The Road Keeps Its Marks', tone: 'warning',
      text: 'The blood begins at the ditch, but the shoe prints do not show a struggle. A leather strap lies under the hedge, cut cleanly rather than torn. The shallow rut leads to the gap under the orchard trees you saw from the road. Rowan says nothing while you turn the strap over.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'The rain has softened the prints, though the cut strap and orchard rut remain. Rowan is stable but pale. Whatever happened, you have missed the finer details.' },
        { requirements: { minElapsedMinutes: 8 }, text: 'The blood begins at the ditch, but there are no scuff marks from a struggle. A leather strap lies under the hedge, cut cleanly rather than torn. Rain begins to blur the shoe prints.' },
      ],
      choices: [
        { id: 'followOrchardRut', label: 'Trace the rut toward the orchard lane', timeCost: 8, next: 'wagonTurnoff', effects: { setFlags: ['foundWagonTurnoff'] } },
        { id: 'askRowanAboutStrap', label: 'Ask Rowan about the cut strap', timeCost: 3, next: 'contradictionWithTrust', effects: { setFlags: ['bootContradictionNoticed', 'questionedAccount'] } },
        { id: 'goForHelpFromEvidence', label: 'Get help before the light fails', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    evidenceAfterInvestigation: {
      id: 'evidenceAfterInvestigation', title: 'A Search Made Before the Rain', tone: 'warning',
      text: 'You find one clean boot print on the far side of the rut and a narrow leather purse strap caught in a thorn. The pouch itself is gone. The prints could belong to a robber leaving with it—or to someone returning to a wagon. Rowan’s sleeve is soaked through; the delay has not been harmless.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'Most prints have melted into the mud. The thorn still holds a cut leather strap, and the pouch is gone. Rowan’s sleeve is soaked through; any delay now carries a visible cost.' },
        { requirements: { minElapsedMinutes: 8 }, text: 'Rain has softened the print edges, but a cut leather strap remains in a thorn. The pouch is gone. You cannot tell whether its owner fled or returned to the wagon.' },
      ],
      choices: [
        { id: 'treatFromEvidence', label: 'Stop and treat Rowan', timeCost: 7, next: 'aidAfterInvestigation', effects: { setFlags: ['manStabilized', 'helpedAfterInvestigation', 'helpedRowanDirectly'], historyFlags: ['helped_injured_stranger'] } },
        { id: 'inspectTurnoff', label: 'Follow the wagon ruts', timeCost: 6, next: 'wagonTurnoff', effects: { setFlags: ['foundWagonTurnoff'] } },
        { id: 'askAboutStrap', label: 'Show Rowan the cut strap', timeCost: 3, next: 'contradictionWithSuspicion', effects: { setFlags: ['bootContradictionNoticed', 'confrontedStory'], historyFlags: ['confronted_false_robbery_story'] } },
      ],
    },
    contradictionWithTrust: {
      id: 'contradictionWithTrust', title: 'The Strap Was Cut', tone: 'warning',
      text: 'Rowan says the strap must belong to the robbers. Then he remembers saying they took his purse, not his pack. The detail is small, and pain can scramble a story. The clean cut, the wagon rut, and a muddy boot all admit more than one explanation.',
      textVariants: [{ requirements: { historyFlags: ['rescued_stranded_traveler'] }, text: 'You have learned before that a frightened account can be true and incomplete. Rowan says the strap belongs to the robbers, then corrects himself: they took his purse, not his pack. The cut, rut, and muddy boot still point in several directions.' }],
      choices: [
        { id: 'giveRowanBenefit', label: 'Accept his account for now and escort him', hint: 'A wrong assumption may cost you time, but he is still hurt.', timeCost: 8, next: 'escortAttempt', effects: { setFlags: ['trustedRowan'], historyFlags: ['protected_man_despite_suspicion', 'escorted_injured_man'] } },
        { id: 'traceWagonWithRowan', label: 'Ask him to show you where the wagon stopped', timeCost: 5, next: 'wagonTurnoff', effects: { setFlags: ['questionedAccount'] } },
        { id: 'goForOfficialHelp', label: 'Fetch the road warden before deciding', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    contradictionWithSuspicion: {
      id: 'contradictionWithSuspicion', title: 'An Answer That Changes', tone: 'danger',
      text: 'You ask Rowan why his boot is muddy above the ankle when the ditch is shallow. He says he was dragged, then says he stumbled beside a wagon. He grips the grass as if to rise, but his injured leg gives way. That contradiction matters; it does not yet prove what happened.',
      choices: [
        { id: 'steadyBeforeConfronting', label: 'Help him sit before pressing the point', timeCost: 3, next: 'steadyingConfrontation', effects: { setFlags: ['keptRowanSafe', 'manStabilized'] } },
        { id: 'pressHardOnStory', label: 'Demand the truth now', hint: 'He is injured and may panic; keep clear of his hands.', timeCost: 2, next: 'confrontationReveal', effects: { setFlags: ['confrontedStory', 'confronted_false_robbery_story'], historyFlags: ['confronted_false_robbery_story'] } },
        { id: 'leaveForWardenFromContradiction', label: 'Leave him sheltered and fetch the warden', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    steadyingConfrontation: {
      id: 'steadyingConfrontation', title: 'Room to Answer', tone: 'warning',
      text: 'You keep Rowan from falling and loosen your grip. He is less defensive now, though still guarded. He admits the wagon was in the orchard lane, not on the road. That could mean he was chased there—or that he has been leaving out the part he played.',
      choices: [
        { id: 'askWhatWagonCarried', label: 'Ask what the wagon was carrying', timeCost: 3, next: 'confrontationReveal', effects: { setFlags: ['confrontedStory'] } },
        { id: 'searchOrchardLane', label: 'Check the wagon turnoff yourself', timeCost: 6, next: 'wagonTurnoff', effects: { setFlags: ['foundWagonTurnoff'] } },
        { id: 'escortToFarmFromSteady', label: 'Get him to the farm before asking more', timeCost: 8, next: 'escortAttempt', effects: { setFlags: ['trustedRowan'], historyFlags: ['escorted_injured_man', 'protected_man_despite_suspicion'] } },
      ],
    },
    treeLineEvidence: {
      id: 'treeLineEvidence', title: 'Prints Beneath the Hawthorn', tone: 'danger',
      text: 'The prints reach a hawthorn and stop. A length of cord hangs from a branch; beneath it, the soil is scuffed as if someone climbed out of the ditch. There is no sign of a second attacker in the trees. Behind you, Rowan calls once, then falls silent.',
      textVariants: [{ requirements: { minElapsedMinutes: 20 }, text: 'Rain has erased most of the hawthorn prints. A cord remains snagged on the branch, and the soil below is scuffed. Rowan does not answer when you call back; the distance and delay have changed the risk.' }],
      choices: [
        { id: 'returnToRowanAfterTracks', label: 'Go back and check Rowan', timeCost: 5, next: 'confrontationReveal', effects: { setFlags: ['foundCordEvidence'] } },
        { id: 'followCordBeyondTree', label: 'Follow the cord toward the orchard', hint: 'You are leaving the injured man alone longer.', timeCost: 7, next: 'wagonTurnoff', effects: { setFlags: ['foundCordEvidence', 'foundWagonTurnoff'] } },
        { id: 'callForHelpFromTrees', label: 'Call toward the farm and go for help', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned', 'foundCordEvidence'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    wagonTurnoff: {
      id: 'wagonTurnoff', title: 'The Orchard Lane', tone: 'danger',
      text: 'The wagon ruts leave the road through the gap in the orchard trees and end behind a shed. A broken harness buckle lies under the wheel. The buckle is bent from strain, not cut. There are two sets of boot prints here, one matching Rowan’s muddy heel. A small canvas pouch is wedged beneath the axle.',
      textVariants: [
        { requirements: { minElapsedMinutes: 20 }, text: 'The rain has filled the ruts. You still find a bent harness buckle and a canvas pouch under the axle, but the boot prints are gone. Rowan is alone by the road unless you have already sought help.' },
        { requirements: { anyItems: HAND_TOOLS }, text: 'Your carried tool lets you lift the bent harness buckle without cutting the leather. The damage came from strain, not a blade. Two sets of prints—one like Rowan’s—lead to a canvas pouch beneath the axle.' },
      ],
      choices: [
        { id: 'retrievePouchByHand', label: 'Reach beneath the axle for the pouch', hint: 'The wheel is unstable on the soft shoulder.', timeCost: 3, chance: { probability: 0.7, bonusItems: ['heavyLeatherGloves', ...HAND_TOOLS], bonusProbability: 0.2, successNext: 'pouchRecovered', failureNext: 'axleSlip', successMessage: 'You ease the pouch out without shifting the wheel.', failureMessage: 'The wheel settles with a jolt; you wrench your wrist and lose time.', failureEffects: { health: -1 } } },
        { id: 'useRatHookForPouch', label: 'Draw it out with a hook', hint: 'The hook keeps your hand away from the unstable wheel.', requirements: { anyItems: ['ratCatchersHook', 'drainageHook', 'gateHook'] }, timeCost: 2, next: 'pouchRecovered', effects: { setFlags: ['pouchRecovered', 'evidenceSearched'] } },
        { id: 'inspectBuckleAtWagon', label: 'Inspect the buckle and wheel marks', requirements: { notItems: HAND_TOOLS }, timeCost: 4, next: 'wagonEvidence', effects: { setFlags: ['harnessInspected', 'evidenceSearched'] } },
        { id: 'useToolOnBuckle', label: 'Use your tool to inspect the buckle', requirements: { anyItems: HAND_TOOLS }, hint: 'Careful leverage exposes the stress marks without cutting the leather.', timeCost: 2, next: 'wagonEvidence', effects: { setFlags: ['harnessInspected', 'evidenceSearched'], knowledge: ['The harness failed under tension rather than being sliced.'] } },
        { id: 'returnToRowanFromLane', label: 'Go back to Rowan before the light fades', timeCost: 5, next: 'confrontationReveal', effects: { setFlags: ['foundWagonTurnoff'] } },
      ],
    },
    axleSlip: {
      id: 'axleSlip', title: 'The Wheel Shifts', tone: 'danger',
      text: 'The wheel drops a finger’s width into soft earth and catches your sleeve. You pull free with a bruised wrist; the canvas pouch remains under the axle. The rut has deepened, but the wheel is no longer moving.',
      choices: [
        { id: 'tryPouchWithTool', label: 'Use a tool to reach beneath it', requirements: { anyItems: [...HAND_TOOLS, 'ratCatchersHook', 'drainageHook', 'gateHook'] }, timeCost: 3, next: 'pouchRecovered', effects: { setFlags: ['pouchRecovered', 'evidenceSearched'] } },
        { id: 'leavePouchAndReturn', label: 'Leave the pouch and return to Rowan', timeCost: 4, next: 'confrontationReveal', effects: { setFlags: ['foundWagonTurnoff'] } },
        { id: 'steadyWheelBarehanded', label: 'Brace the wheel and reach again', hint: 'The axle is unstable; another shift could injure your hand.', timeCost: 3, chance: { probability: 0.47, successNext: 'pouchRecovered', failureNext: 'axleStrain', successMessage: 'You hold the wheel long enough to take the pouch.', failureMessage: 'The axle slips again, forcing you back with a strained hand.', failureEffects: { health: -2 } } },
      ],
    },
    axleStrain: {
      id: 'axleStrain', title: 'A Hand Pinned Briefly', tone: 'danger',
      text: 'You wrench your hand free before the axle settles. It is swollen and painful, but the wheel stops shifting. The pouch stays where it is. The light is nearly gone; Rowan is still waiting on the road.',
      choices: [
        { id: 'leavePouchAfterStrain', label: 'Leave the pouch and return to Rowan', timeCost: 3, next: 'confrontationReveal', effects: { setFlags: ['foundWagonTurnoff'] } },
        { id: 'callForHelpAfterStrain', label: 'Go to the farm for help', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned', 'foundWagonTurnoff'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    pouchRecovered: {
      id: 'pouchRecovered', title: 'A Pouch with a Broken Seal', tone: 'warning',
      text: 'The pouch contains a brass tally seal, a folded pay list, and several silver coins. The pay list bears the orchard mill’s mark. Nothing is hidden inside the lining. Rowan said his purse was stolen; this could be his—or property from the wagon.',
      textVariants: [{ requirements: { flags: ['confrontedStory'] }, text: 'The pouch contains a brass tally seal, a folded mill pay list, and silver coins. Its property mark belongs to the orchard mill, not to Rowan. His account was false, but the pouch does not yet explain why he was hurt.' }],
      choices: [
        { id: 'readPayList', label: 'Compare the pay list and tally seal', timeCost: 4, next: 'wagonEvidence', effects: { setFlags: ['readPayList', 'pouchRecovered'], knowledge: ['The pouch is marked for the orchard mill payroll, not Rowan.'] } },
        { id: 'keepPouchForWarden', label: 'Keep the pouch intact for the warden', hint: 'It may be evidence; do not spend or pocket the coins.', timeCost: 2, next: 'confrontationReveal', effects: { setFlags: ['propertySecured', 'pouchRecovered'] } },
        { id: 'returnPouchToRowan', label: 'Ask Rowan whether the pouch is his', timeCost: 3, next: 'confrontationReveal', effects: { setFlags: ['propertySecured', 'pouchRecovered', 'questionedAccount'] } },
        { id: 'takeTwoCoins', label: 'Take two coins from the pouch', hint: 'The pay list marks it as mill property; these coins will be yours to keep.', timeCost: 1, next: 'confrontationReveal', effects: { money: 2, setFlags: ['tookCoinsFromPouch', 'pouchRecovered'] } },
      ],
    },
    wagonEvidence: {
      id: 'wagonEvidence', title: 'Two Hands at the Buckle', tone: 'warning',
      text: 'The buckle was forced under load, not cut. The wheel tracks show the wagon was turned off the road deliberately, then dragged back toward the mill lane. Rowan’s boot size matches one of the prints beside the axle. The evidence points to a theft, but not yet to who carried it out.',
      textVariants: [{ requirements: { minElapsedMinutes: 20 }, text: 'The buckle is bent under load, and the wagon was turned off the road. Rain has blurred the prints, though Rowan’s boot still matches the one you noticed. The details point toward a theft, not a roadside ambush.' }],
      choices: [
        { id: 'confrontWithWagonEvidence', label: 'Show Rowan the buckle and pay list', requirements: { flags: ['pouchRecovered'] }, timeCost: 3, next: 'confrontationReveal', effects: { setFlags: ['confrontedStory'], historyFlags: ['confronted_false_robbery_story'] } },
        { id: 'confrontWithBuckle', label: 'Ask Rowan why his boot is at the wagon', timeCost: 3, next: 'confrontationReveal', effects: { setFlags: ['confrontedStory'], historyFlags: ['confronted_false_robbery_story'] } },
        { id: 'getWardenWithEvidence', label: 'Take the evidence to the road warden', timeCost: 18, next: 'wardenAndRowan', effects: { setFlags: ['helpSummoned', 'evidenceSearched'], historyFlags: ['sought_help_for_injured_stranger', 'turned_man_over_to_authorities'] } },
      ],
    },
    confrontationReveal: {
      id: 'confrontationReveal', title: 'The Part He Left Out', tone: 'danger',
      text: 'Rowan looks from the cut strap to the wagon marks. His account shifts: he was near the wagon, but says the strap and pouch are not his. Without the pouch or a witness, you cannot tell whether pain has confused his account, whether he is withholding something, or whether the other man acted alone.',
      textVariants: [
        { requirements: { flags: ['pouchRecovered', 'helpedRowanDirectly'] }, text: 'With the pay list and pouch in view, Rowan stops denying the wagon. He admits he and a partner tried to divert the mill payroll. The harness broke under load and threw him into the ditch; his partner fled with the pouch and left him hurt. You bandaged him before knowing this, and the injury is no less real for it.' },
        { requirements: { flags: ['pouchRecovered'] }, text: 'With the pay list and pouch in view, Rowan stops denying the wagon. He admits he and a partner tried to divert the mill payroll. The harness broke under load and threw him into the ditch; his partner fled with the pouch and left him hurt. The injury is real, though his first account was not.' },
      ],
      choices: [
        { id: 'keepHelpingAfterReveal', label: 'Keep helping Rowan despite the theft', hint: 'He is still hurt; help does not excuse what happened.', timeCost: 6, next: 'resolutionChoice', effects: { setFlags: ['protectedManAfterReveal'], historyFlags: ['protected_man_despite_suspicion'] } },
        { id: 'takeEvidenceToWarden', label: 'Bring Rowan and the evidence to the warden', timeCost: 8, next: 'wardenAndRowan', effects: { setFlags: ['helpSummoned', 'evidenceSearched'], historyFlags: ['turned_man_over_to_authorities'] } },
        { id: 'followPartnerTracks', label: 'Follow the partner’s tracks toward the mill', hint: 'The pay list and recovered pouch point to someone fleeing with the payroll.', requirements: { flags: ['pouchRecovered'] }, timeCost: 10, next: 'partnerTrail', effects: { setFlags: ['followedPartner'] } },
        { id: 'leaveAfterReveal', label: 'Leave Rowan and the evidence here', timeCost: 1, next: 'walkAwayAfterReveal', effects: { historyFlags: ['left_injured_man_behind'] } },
      ],
    },
    resolutionChoice: {
      id: 'resolutionChoice', title: 'What Help Means Now', tone: 'warning',
      text: 'Rowan cannot walk unaided, and his account still has gaps. The mill owner is due back along the lane; the road warden’s post is farther away. You can get Rowan help or leave him sheltered. Without the pouch, you cannot settle what happened to the wagon or its contents. There is no way to undo the time already spent or the choice that came before the truth.',
      textVariants: [{ requirements: { flags: ['pouchRecovered'] }, text: 'The pay list and pouch have made Rowan’s part clear: he and a partner tried to divert the mill payroll, and the partner fled. Rowan cannot walk unaided. The owner is due back along the lane, and the warden’s post is farther away; you can return the pouch, hold it as evidence, or focus on Rowan.' }],
      choices: [
        { id: 'escortRowanToFarm', label: 'Escort Rowan to the farm for treatment', hint: 'A rope or splint makes the uneven shoulder safer.', timeCost: 12, next: 'escortSuccess', effects: { historyFlags: ['escorted_injured_man', 'helped_injured_stranger'] } },
        { id: 'waitForOwner', label: 'Wait for the mill owner with the pouch', requirements: { flags: ['pouchRecovered'] }, timeCost: 8, next: 'ownerArrives', effects: { setFlags: ['awaitedOwner'], historyFlags: ['recovered_stolen_property'] } },
        { id: 'sendForWarden', label: 'Leave Rowan sheltered and fetch the warden', timeCost: 18, next: 'wardenAndRowan', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger', 'turned_man_over_to_authorities'] } },
      ],
    },
    partnerTrail: {
      id: 'partnerTrail', title: 'One Trail Leaves the Orchard', tone: 'danger',
      text: 'The prints run toward the mill, then split at a stone culvert. A silver coin and a strip of pay-list paper lie in the grass. The partner is gone. You can take the evidence back, continue to the mill, or call for the warden. It is now dark enough that every hurried step carries risk.',
      choices: [
        { id: 'returnEvidenceFromTrail', label: 'Return to the orchard with the evidence', timeCost: 8, next: 'ownerArrives', effects: { setFlags: ['pouchRecovered', 'recoveredProperty'], historyFlags: ['recovered_stolen_property'] } },
        { id: 'continueToMill', label: 'Continue to the mill for help', timeCost: 12, next: 'ownerArrives', effects: { setFlags: ['helpSummoned', 'recoveredProperty'], historyFlags: ['sought_help_for_injured_stranger', 'recovered_stolen_property'] } },
        { id: 'callWardenFromTrail', label: 'Call for the warden and stay clear', timeCost: 18, next: 'wardenAndRowan', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger', 'turned_man_over_to_authorities'] } },
        { id: 'descendCulvertBank', label: 'Climb down to the millrace', hint: 'The bank is undercut above fast water; a slip could be fatal.', timeCost: 5, chance: { probability: 0.58, bonusItems: LIGHT_TOOLS, bonusProbability: 0.15, successNext: 'millRaceLanding', failureNext: 'culvertFall', successMessage: 'You reach the lower path without losing your footing.', failureMessage: 'The bank crumbles and drops you hard against the stone edge.', failureEffects: { health: -4 } } },
      ],
    },
    culvertFall: {
      id: 'culvertFall', title: 'The Bank Gives Way', tone: 'danger',
      text: 'You catch a stone lip before the runoff takes you. Your ribs ache and one hand is numb. The millrace is loud below; another hurried climb could send you into it. The partner’s tracks continue along the high bank, but they can wait.',
      choices: [
        { id: 'climbBackSlowly', label: 'Climb back slowly and leave the trail', hint: 'You are hurt, and falling again may be fatal.', timeCost: 5, next: 'ownerArrives', effects: { setFlags: ['recoveredProperty'] } },
        { id: 'callWardenFromCulvert', label: 'Call for the warden from safe ground', timeCost: 12, next: 'wardenAndRowan', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
        { id: 'riskSecondCulvertClimb', label: 'Try one more climb toward the partner', hint: 'The bank already failed once; a second fall into the millrace could kill you.', timeCost: 4, chance: { probability: 0.63, bonusItems: LIGHT_TOOLS, bonusProbability: 0.12, successNext: 'millRaceLanding', failureNext: 'culvertDeath', successMessage: 'You find a stable foothold and regain the high path.', failureMessage: 'The bank shears away beneath you and the millrace takes you.', failureEffects: { health: -10 } } },
      ],
    },
    millRaceLanding: {
      id: 'millRaceLanding', title: 'Below the Orchard Wall', tone: 'warning',
      text: 'You reach the lower path with scraped palms and a soaked hem. The partner’s tracks are visible near the mill gate, but no one is there. A farm lantern is moving along the road above; you can climb toward it or call the warden from here.',
      choices: [
        { id: 'climbToFarmLantern', label: 'Climb toward the farm lantern', hint: 'The bank is still slick; take the visible route slowly.', timeCost: 7, chance: { probability: 0.76, bonusItems: LIGHT_TOOLS, bonusProbability: 0.1, successNext: 'ownerArrives', failureNext: 'outsideHelpEnding', successMessage: 'You reach the orchard path and wave the farmer over.', failureMessage: 'You stop on the lower path and call until the farmer hears you.' } },
        { id: 'callFromMillrace', label: 'Call for the warden from the lower path', timeCost: 10, next: 'wardenAndRowan', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    culvertDeath: {
      id: 'culvertDeath', title: 'The Millrace', tone: 'danger', ending: 'death',
      text: 'The undercut bank breaks a second time. You fall into the fast millrace and cannot reach the stone edge. The danger was visible and the first fall gave you a chance to turn back; the water is stronger than your last attempt.',
      choices: [],
    },
    escortAttempt: {
      id: 'escortAttempt', title: 'The Uneven Shoulder', tone: 'danger',
      text: 'Rowan can stand only with your shoulder under his arm. The farm lights are visible beyond a rutted slope; his injured leg buckles on loose stones. The route is possible, but a fall could worsen both of your injuries.',
      choices: [
        { id: 'carryWithStretcher', label: 'Use the Folding Field Stretcher with a second pair of hands', requirements: { items: ['foldingFieldStretcher'] }, hint: 'The stretcher keeps Rowan level, but you still need help lifting it.', timeCost: 12, chance: { probability: 0.9, successNext: 'escortSuccess', failureNext: 'escortStrain', successMessage: 'With the farmer lifting the far end, the stretcher carries Rowan over the uneven shoulder.', failureMessage: 'The stretcher catches on loose stones and you stop before Rowan is hurt further.', failureEffects: { health: -1 } } },
        { id: 'escortWithRope', label: 'Rig a support line and move slowly', requirements: { anyItems: [...HAULING_TOOLS], maxElapsedMinutes: 37 }, hint: 'The line will keep him from falling, though it costs time.', timeCost: 12, chance: { probability: 0.88, bonusItems: ['heavyLeatherGloves', 'weatherproofCloak', 'weatherproofBlanket'], bonusProbability: 0.08, successNext: 'escortSuccess', failureNext: 'escortStrain', successMessage: 'The line steadies Rowan across the slope.', failureMessage: 'The line catches, but Rowan’s leg twists before you can stop the fall.', failureEffects: { health: -1 } } },
        { id: 'escortWithSplint', label: 'Brace his leg and take the flatter lane', requirements: { anyItems: ['fieldBandageRoll', 'icehouseTongs', 'bridgewrightHammer'], maxElapsedMinutes: 37 }, hint: 'A firm brace reduces the risk, though the walk remains long.', timeCost: 14, chance: { probability: 0.84, bonusItems: ['travelRope'], bonusProbability: 0.08, successNext: 'escortSuccess', failureNext: 'escortStrain', successMessage: 'The brace holds across the uneven shoulder.', failureMessage: 'The brace slips on the stones; Rowan’s leg twists painfully.', failureEffects: { health: -1 } } },
        { id: 'lateEscortWithGear', label: 'Use your gear for a slower, safer carry', requirements: { anyItems: [...HAULING_TOOLS, 'fieldBandageRoll', 'icehouseTongs', 'bridgewrightHammer'], minElapsedMinutes: 38 }, hint: 'The delay has weakened Rowan; even good gear cannot remove the risk.', timeCost: 15, chance: { probability: 0.68, bonusItems: ['travelRope', 'freightmansStrap', 'fieldBandageRoll'], bonusProbability: 0.12, successNext: 'escortSuccess', failureNext: 'escortStrain', successMessage: 'Your gear steadies Rowan through the slow climb.', failureMessage: 'Rowan’s injured leg gives way before the gear can take his full weight.', failureEffects: { health: -1 } } },
        { id: 'escortBarehanded', label: 'Take his weight and try the slope', hint: 'The ground is loose and Rowan’s leg cannot bear much weight.', timeCost: 10, chance: { probability: 0.61, bonusItems: [...HAULING_TOOLS, 'fieldBandageRoll', 'weatherproofBlanket'], bonusProbability: 0.16, successNext: 'escortSuccess', failureNext: 'escortStrain', successMessage: 'You take the slope one careful step at a time.', failureMessage: 'A stone rolls underfoot; Rowan falls hard and you hit the ground too.', failureEffects: { health: -2 } }, },
        { id: 'abandonEscortForHelp', label: 'Stop and go for the warden instead', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    escortStrain: {
      id: 'escortStrain', title: 'A Fall on the Slope', tone: 'danger',
      text: 'Rowan cries out as his injured leg twists. You both stop before the slope can take you farther. He is conscious, but he cannot continue unaided. The farm is still visible; going for help will take time, and forcing another attempt would be reckless.',
      choices: [
        { id: 'callFarmFromSlope', label: 'Call toward the farm and wait in shelter', timeCost: 8, next: 'outsideHelpEnding', effects: { historyFlags: ['helped_injured_stranger'] } },
        { id: 'goGetWardenFromSlope', label: 'Go for the warden', timeCost: 18, next: 'helpReturns', effects: { setFlags: ['helpSummoned'], historyFlags: ['sought_help_for_injured_stranger'] } },
        { id: 'retryWithRopeFromSlope', label: 'Use a line for one careful final attempt', requirements: { anyItems: [...HAULING_TOOLS] }, hint: 'The rope gives a safer hold, but Rowan’s leg is now more fragile.', timeCost: 10, chance: { probability: 0.62, bonusItems: ['weatherproofBlanket', 'weatherproofCloak'], bonusProbability: 0.16, successNext: 'escortSuccess', failureNext: 'outsideHelpEnding', successMessage: 'The line keeps Rowan upright through the final stretch.', failureMessage: 'You stop before he falls again and call for help from the slope.' } },
      ],
    },
    escortSuccess: {
      id: 'escortSuccess', title: 'The Farmhouse Lamp', tone: 'safe',
      text: 'You reach the farmhouse. The farmer lays Rowan on a bench and sends for the road warden. His leg is badly strained, but the cut is clean and the bleeding is under control. Whether he told the whole truth is no longer a question you had to answer before helping.',
      textVariants: [{ requirements: { flags: ['confrontedStory'] }, text: 'You get Rowan to the farmhouse with the evidence still intact. The farmer sends for the warden and begins treatment. Rowan’s story was false; his injury was not. Both facts arrive together.' }],
      choices: [{ id: 'acceptBandageReward', label: 'Accept the farmer’s field bandage roll', requirements: { notItems: ['fieldBandageRoll'] }, effects: { gainItems: ['fieldBandageRoll'], historyFlags: ['helped_injured_stranger'] }, next: 'escortRewardEnding' }, { id: 'declineBandageReward', label: 'Thank the farmer and leave the bandage', next: 'escortRewardEnding' }],
    },
    escortRewardEnding: {
      id: 'escortRewardEnding', title: 'A Mile Marker Behind You', tone: 'safe', ending: 'success',
      text: 'The warden takes Rowan’s statement while the farmer keeps him warm. The mill will be told about the missing pay pouch. You leave without deciding whether trust or suspicion should have come first.' ,
      textVariants: [{ requirements: { flags: ['pouchRecovered'] }, text: 'The warden takes Rowan’s statement and the recovered pouch. The mill’s money can be returned; Rowan will answer for his part when he is well enough. You leave without deciding whether trust or suspicion should have come first.' }],
      choices: [],
    },
    ownerArrives: {
      id: 'ownerArrives', title: 'The Mill Owner Comes Back', tone: 'safe',
      text: 'A mill owner arrives by lantern light and reports that the payroll pouch is missing. Rowan’s role is no longer hidden. If you have found the pouch, the owner waits for you to decide what to do with it; otherwise, the warden will search the lane.',
      textVariants: [
        { requirements: { flags: ['pouchRecovered', 'tookCoinsFromPouch'] }, text: 'The mill owner confirms the pouch bears the payroll seal. Two coins are missing; you took them before the owner arrived. Rowan’s role is no longer hidden, and the owner waits for your decision about the pouch.' },
        { requirements: { flags: ['pouchRecovered'] }, text: 'The mill owner confirms the pouch bears the payroll seal. Rowan’s role is no longer hidden, and the owner waits for your decision about the pouch.' },
        { requirements: { flags: ['helpedFirst', 'pouchRecovered'] }, text: 'The mill owner confirms the pouch bears the payroll seal. You helped Rowan before learning his part in the theft. The owner does not ask you to regret the bandage, only to decide what should happen to the pouch.' },
      ],
      choices: [
        { id: 'returnPouchToOwner', label: 'Return the pouch to the mill owner', requirements: { flags: ['pouchRecovered'] }, hint: 'The owner can count and seal the payroll openly.', timeCost: 2, next: 'propertyReturnedEnding', effects: { historyFlags: ['recovered_stolen_property'] } },
        { id: 'holdPouchForWarden', label: 'Keep the pouch sealed for the warden', requirements: { flags: ['pouchRecovered'] }, timeCost: 5, next: 'wardenResolution', effects: { historyFlags: ['recovered_stolen_property', 'turned_man_over_to_authorities'] } },
        { id: 'acceptSignalMirror', label: 'Return the pouch and accept a signal mirror', requirements: { flags: ['pouchRecovered'], notItems: ['roadsideSignalMirror'] }, timeCost: 1, next: 'mirrorRewardEnding', effects: { gainItems: ['roadsideSignalMirror'], historyFlags: ['recovered_stolen_property'] } },
        { id: 'waitWithoutPouch', label: 'Wait for the warden to investigate the lane', requirements: { notFlags: ['pouchRecovered'] }, timeCost: 5, next: 'wardenResolution', effects: { historyFlags: ['turned_man_over_to_authorities'] } },
      ],
    },
    wardenAndRowan: {
      id: 'wardenAndRowan', title: 'The Warden Takes Over', tone: 'safe',
      text: 'The road warden arrives with a handcart and a lantern. Rowan is alive and able to answer questions. The warden takes the details you can provide and sends for the mill owner. If no pouch was recovered, the missing payroll remains an open question.',
      textVariants: [
        { requirements: { flags: ['pouchRecovered'], minElapsedMinutes: 38 }, text: 'The road warden arrives after dark with a handcart and lantern. Rowan is weak, but conscious; the recovered pouch and torn harness give the warden something firmer than either accusation. A blanket keeps Rowan warm while the mill owner is sent for.' },
        { requirements: { flags: ['pouchRecovered'] }, text: 'The road warden arrives with a handcart and lantern. Rowan is alive and able to answer questions; the recovered pouch and torn harness give the warden something firmer than either accusation. The mill owner is sent for.' },
        { requirements: { minElapsedMinutes: 38 }, text: 'The road warden reaches the lane after dark. Rowan is weak, but conscious; a blanket and the handcart keep him warm while the warden takes his statement. The evidence survived, though the night made the work harder.' },
      ],
      choices: [
        { id: 'leaveAfterWarden', label: 'Leave once Rowan is in the warden’s care', timeCost: 2, next: 'wardenEnding', effects: { historyFlags: ['turned_man_over_to_authorities', 'sought_help_for_injured_stranger'] } },
        { id: 'stayForMillOwner', label: 'Wait for the mill owner to identify the pouch', timeCost: 8, next: 'wardenResolution', effects: { historyFlags: ['recovered_stolen_property', 'turned_man_over_to_authorities'] } },
        { id: 'takeSignalMirrorFromWarden', label: 'Accept a signal mirror for helping', requirements: { notItems: ['roadsideSignalMirror'] }, next: 'mirrorRewardEnding', effects: { gainItems: ['roadsideSignalMirror'], historyFlags: ['sought_help_for_injured_stranger'] } },
      ],
    },
    wardenResolution: {
      id: 'wardenResolution', title: 'Two Statements, One Pouch', tone: 'safe',
      text: 'The warden takes Rowan’s statement and the mill owner reports the missing payroll. Rowan’s account remains incomplete; the warden will investigate, but no one can promise the pouch will be recovered.',
      textVariants: [{ requirements: { flags: ['pouchRecovered'] }, text: 'The owner identifies the pouch and the warden takes Rowan’s statement. Rowan admits he and a partner tried to steal the payroll. The partner escaped; Rowan was left hurt. The warden will look for him, but no one can promise the money will all be recovered.' }],
      choices: [{ id: 'takeBandageFromWarden', label: 'Accept a field bandage roll for the road', requirements: { notItems: ['fieldBandageRoll'] }, effects: { gainItems: ['fieldBandageRoll'] }, next: 'wardenRewardEnding' }, { id: 'declineWardenBandage', label: 'Decline the spare bandage', next: 'wardenRewardEnding' }],
    },
    wardenEnding: {
      id: 'wardenEnding', title: 'The Road Is Quieter', tone: 'safe', ending: 'success',
      text: 'The warden has Rowan, the mill has been notified, and you carry no money or property from the scene. You leave knowing the story was more complicated than the first account—and that the injury was real.' ,
      choices: [],
    },
    wardenRewardEnding: {
      id: 'wardenRewardEnding', title: 'A Useful Thing, Honestly Given', tone: 'safe', ending: 'success',
      text: 'The warden records Rowan’s statement and the mill owner’s report. Your bandage roll is a modest thank-you for staying through the handoff. The warden will investigate the missing payroll and Rowan’s account in daylight.',
      textVariants: [{ requirements: { flags: ['pouchRecovered'] }, text: 'The warden records the pouch and gives the owner a receipt. Your bandage roll is a modest thank-you for staying through the handoff. Rowan will answer for the failed theft; the partner is still somewhere beyond the orchard.' }],
      choices: [],
    },
    propertyReturnedEnding: {
      id: 'propertyReturnedEnding', title: 'The Pay List Reconciled', tone: 'safe', ending: 'success',
      text: 'The mill owner counts the coins and seals the pouch. Rowan is taken to the farmhouse under guard, where his injury can be treated. The warden will hear both accounts in daylight.' ,
      choices: [],
    },
    mirrorRewardEnding: {
      id: 'mirrorRewardEnding', title: 'A Signal for the Long Road', tone: 'safe', ending: 'success',
      text: 'The roadside mirror is offered openly as thanks for returning the evidence and waiting for help. The mill keeps its pay; Rowan is treated and held for the warden. You leave with one useful object, not a share of stolen money.' ,
      choices: [],
    },
    helpReturns: {
      id: 'helpReturns', title: 'Help Comes from the Farm', tone: 'safe',
      text: 'A farmer arrives with a handcart and a clean cloth. Rowan’s bleeding is under control, but he is shivering and too weak to walk. The farmer recognizes the harness marks from the mill road and says the owner is already looking for a missing pay pouch.',
      textVariants: [{ requirements: { flags: ['helpedFirst'] }, text: 'The farmer arrives with a handcart. Rowan’s cut is still controlled because you treated it before leaving. The farmer recognizes the harness marks from the mill road and mentions a missing pay pouch.' }, { requirements: { minElapsedMinutes: 20 }, text: 'The farmer arrives after a long wait. Rowan is pale and shivering; the delay has made the trip harder, but the clean cloth stops the bleeding. The farmer says the mill is missing its pay pouch.' }],
      choices: [
        { id: 'letFarmerTakeRowan', label: 'Let the farmer take Rowan for treatment', timeCost: 3, next: 'helpedByFarmerEnding', effects: { historyFlags: ['sought_help_for_injured_stranger', 'helped_injured_stranger'] } },
        { id: 'tellFarmerAboutEvidence', label: 'Show the farmer what you found', requirements: { anyItems: ['fieldBandageRoll', 'roadsideSignalMirror'] }, timeCost: 3, next: 'farmerEvidenceEnding', effects: { historyFlags: ['sought_help_for_injured_stranger'] } },
        { id: 'askFarmerAboutMill', label: 'Ask about the missing pay pouch', timeCost: 2, next: 'farmerEvidenceEnding', effects: { historyFlags: ['sought_help_for_injured_stranger'] } },
        { id: 'walkAwayFromHelp', label: 'Leave once help has arrived', timeCost: 1, next: 'walkAwayAfterHelp', effects: { historyFlags: ['left_injured_man_behind'] } },
      ],
    },
    helpedByFarmerEnding: {
      id: 'helpedByFarmerEnding', title: 'A Ride to the Farm', tone: 'safe',
      text: 'The farmer takes Rowan to the farmhouse and sends for the warden. You do not learn whether the robbery account was true. You did not need to settle that question before helping him.' ,
      textVariants: [{ requirements: { flags: ['foundWagonTurnoff'] }, text: 'The farmer takes Rowan to the farmhouse and sends for the warden. You know the wagon was turned off the road, but not exactly why. You helped before the evidence was complete.' }],
      choices: [{ id: 'takeFarmBandage', label: 'Accept the farmer’s field bandage roll', requirements: { notItems: ['fieldBandageRoll'] }, effects: { gainItems: ['fieldBandageRoll'] }, next: 'farmAidRewardEnding' }, { id: 'declineFarmBandage', label: 'Decline the spare bandage', next: 'farmAidRewardEnding' }],
    },
    farmAidRewardEnding: {
      id: 'farmAidRewardEnding', title: 'Help Before Certainty', tone: 'safe', ending: 'success',
      text: 'The farmer writes the warden’s name on a card and gives you a clean roll of field bandages. Rowan is being treated; the missing mill pouch remains unresolved.' ,
      choices: [],
    },
    farmerEvidenceEnding: {
      id: 'farmerEvidenceEnding', title: 'A Familiar Harness Mark', tone: 'warning', ending: 'success',
      text: 'The farmer recognizes the bent harness as belonging to the mill wagon. The pay pouch was taken during a failed theft, and Rowan was involved; his partner left him hurt. The farmer takes Rowan and the evidence to the warden. No one asks you to pretend the first story was true.' ,
      choices: [],
    },
    outsideHelpEnding: {
      id: 'outsideHelpEnding', title: 'A Handcart on the Lane', tone: 'safe', ending: 'success',
      text: 'Your call reaches the farm. The farmer brings a handcart and a blanket, and Rowan is taken for treatment. The delay has left him cold and weak, but not abandoned. The warden will ask questions when he is warm.' ,
      choices: [],
    },
    walkAwayEnding: {
      id: 'walkAwayEnding', title: 'The Road Goes On', tone: 'warning', ending: 'success',
      text: 'You continue down the road. Rowan’s voice fades behind you; you do not learn whether his story was true or whether help reached him. The evening keeps no verdict on your behalf.' ,
      choices: [],
    },
    walkAwayAfterReveal: {
      id: 'walkAwayAfterReveal', title: 'The Road Goes On', tone: 'warning', ending: 'success',
      text: 'You leave Rowan where he fell. You know he lied about the robbery and that his partner took the mill pouch, but you do not know if the warden found either of them. His injury remains real, and your choice remains yours.' ,
      choices: [],
    },
    walkAwayAfterHelp: {
      id: 'walkAwayAfterHelp', title: 'Help Has Arrived', tone: 'safe', ending: 'success',
      text: 'The farmer has Rowan and the handcart. You leave before learning the whole account. The choice to seek help mattered; so did leaving the rest to someone else.' ,
      choices: [],
    },
  },
};
