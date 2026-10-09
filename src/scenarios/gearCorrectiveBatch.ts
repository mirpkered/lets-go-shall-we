import type { Scenario, Scene } from '../types';
import { largeAdventure, largeEnd, largeScene, largeTags } from './largeContentTools';

const tags = (hook: string, role: string, activity: string, setting: string, risk: 'LOW' | 'MODERATE' | 'HIGH', entry: string, rewards: string[] = ['money/item/knowledge/history possible', 'narrative-only payoff']) => largeTags({
  hook, role, activity, tone: risk === 'LOW' ? 'warm/hopeful' : 'adventurous', risk, setting,
  structures: ['multi-stage equipment choice', 'changing conditions', 'performance payoff'],
  entry: [entry], rewards, outcomes: ['success/partial success', 'walk-away/refusal', 'peaceful resolution'],
});
const s = (id: string, title: string, text: string, choices: Scene['choices'], tone: Scene['tone'] = 'safe', variants?: Scene['textVariants']) => largeScene(id, title, text, choices, tone, variants);
const e = (id: string, title: string, text: string) => largeEnd(id, title, text);

export const THE_SQUIRES_PACK: Scenario = largeAdventure('the-squires-pack', 'The Squire’s Pack', 'A veteran explorer asks you to prepare for a short descent—and trust your judgment.', tags('A traveler assisting an experienced explorer chooses how to distribute a limited kit, then adapts when the route changes.', 'helper/rescuer', 'travel/exploration', 'foothill survey trail', 'MODERATE', 'hired/posted work'), 'pack', {
  pack: s('pack', 'Three Useful Things', 'Mara Venn, a veteran route-finder, is taking a written survey to a ridge station. She has a rope, a Pocket Toolkit, and a Folding Trail Marker. You are helping carry and prepare the kit, not merely watching. A washout has narrowed the next stretch; Mara asks which piece she should keep immediately at hand while you carry the other two.', [
    { id: 'giveRope', label: 'Put Mara’s rope in her hand', next: 'ridge', effects: { setFlags: ['squire_rope_ready'] } },
    { id: 'giveToolkit', label: 'Put Mara’s Pocket Toolkit in her hand', next: 'ridge', effects: { setFlags: ['squire_toolkit_ready'] } },
    { id: 'giveMarker', label: 'Put Mara’s Folding Trail Marker in her hand', next: 'ridge', effects: { setFlags: ['squire_marker_ready'] } },
  ]),
  ridge: s('ridge', 'The Cut in the Trail', 'A section of trail has slumped toward a shallow ravine. The far side is reachable by a longer path along the ridge. Mara’s survey tube is safe, but a tin of numbered stakes has rolled onto a shelf below. The equipment you put in Mara’s hand changes how you can deal with the shelf.', [
    { id: 'useRopeOnShelf', label: 'Ask Mara to lower the Travel Rope as a handline', requirements: { flags: ['squire_rope_ready'] }, next: 'ropeShelf', effects: { setFlags: ['squire_retrieved_stakes', 'squire_rope_used'] } },
    { id: 'useToolkitOnMarker', label: 'Ask Mara to tighten the loose trail marker with the toolkit', requirements: { flags: ['squire_toolkit_ready'] }, next: 'toolkitMarker', effects: { setFlags: ['squire_marker_secured'] } },
    { id: 'useMarkerForReturn', label: 'Ask Mara to mark the firm return path', requirements: { flags: ['squire_marker_ready'] }, next: 'markerReturn', effects: { setFlags: ['squire_return_marked'] } },
    { id: 'retrieveByHand', label: 'Climb down carefully and retrieve the stakes', hint: 'The shelf is reachable, though loose gravel may shift.', next: 'stakes', effects: { setFlags: ['squire_retrieved_stakes'] } },
    { id: 'takeLongRoute', label: 'Use the longer ridge path', next: 'arrival' },
    { id: 'markAndLeave', label: 'Mark the washout and leave the stakes', next: 'arrival', effects: { setFlags: ['squire_left_stakes'] } },
  ], 'warning', [
    { requirements: { flags: ['squire_rope_ready'] }, text: 'Mara keeps her rope ready on the firm ridge. She can lower it while you reach for the tin; the shelf is still loose, but you will not have to climb back empty-handed.' },
    { requirements: { flags: ['squire_toolkit_ready'] }, text: 'Mara has her Pocket Toolkit ready. A trail marker above the washout has a loose clamp; securing it will keep the warning visible, but it will not retrieve the tin.' },
    { requirements: { flags: ['squire_marker_ready'] }, text: 'Mara sets her Folding Trail Marker on the firm return path before anyone approaches the shelf, trading a little time for clearer footing.' },
  ]),
  ropeShelf: s('ropeShelf', 'The Tin Comes Up Slowly', 'Mara anchors the handline around a sound tree and lowers it from firm ground. You retrieve the closed tin and climb back with the rope taking some of your weight; the line is scuffed but remains usable.', [
    { id: 'continueAfterRope', label: 'Carry the stakes to the ridge station', next: 'arrival' },
  ]),
  toolkitMarker: s('toolkitMarker', 'A Warning That Holds', 'Mara tightens the marker’s clamp with the toolkit. It stays visible in the wind, warning the next crew about the washout. The tin remains on its shelf, but no one else has to mistake the broken trail for a safe descent.', [
    { id: 'continueAfterMarker', label: 'Take the longer ridge route to the station', next: 'arrival', effects: { setFlags: ['squire_left_stakes'] } },
  ]),
  markerReturn: s('markerReturn', 'A Marked Way Back', 'Mara places the Folding Trail Marker on the firm approach, then waits while you check the shelf from above. The route is easier to recognize on return, though the tin is still below.', [
    { id: 'retrieveAfterMark', label: 'Climb down carefully for the tin', next: 'stakes', effects: { setFlags: ['squire_retrieved_stakes'] } },
    { id: 'leaveAfterMark', label: 'Leave the tin and take the ridge route', next: 'arrival', effects: { setFlags: ['squire_left_stakes'] } },
  ]),
  stakes: s('stakes', 'A Problem with the Tin', 'The tin is dented but closed. As you lift it, the shelf sheds a few stones. Mara has room to steady you, but the narrowed trail means you cannot both carry the same load at once.', [
    { id: 'secureTinWithStrap', label: 'Tie the tin to your pack and climb without a line', next: 'arrival', effects: { setFlags: ['squire_tin_secured'] } },
    { id: 'leaveTinAfterAll', label: 'Set the tin back and climb out empty-handed', next: 'arrival', effects: { setFlags: ['squire_left_stakes'] } },
  ], 'warning'),
  arrival: s('arrival', 'The Survey Reaches the Ridge', 'At the ridge station, Mara checks the survey against the surviving trail marks. The missing tin would have made the next crew’s work easier, but no one is endangered by its loss. She credits your choice: the route was slower with the kit divided, while the recovered stakes confirm one old marker was out of place.', [
    { id: 'takeRopeAsThanks', label: 'Accept Mara’s spare Travel Rope as thanks', requirements: { notOwnedItems: ['travelRope'] }, next: 'ropeGift', effects: { gainItems: ['travelRope'], historyFlags: ['earned_travel_rope_helping_surveyor'] } },
    { id: 'takeTwoCoins', label: 'Take two coins for the day’s work', next: 'paid', effects: { money: 2 } },
    { id: 'keepTheMethod', label: 'Leave the payment and remember Mara’s route-marking method', next: 'method', effects: { knowledge: ['Mara Venn marks a washed-out trail from firm ground before anyone tries to recover equipment below it.'] } },
    { id: 'declineThanks', label: 'Thank Mara and leave without payment', next: 'unpaid' },
  ]),
  ropeGift: e('ropeGift', 'A Line for Your Own Pack', 'Mara gives you her sound spare rope; the line used on the survey was hers, and this is a second one she had kept wrapped at the station. Your choice helped her finish the route, but it did not make the washout safe.'),
  paid: e('paid', 'A Day’s Wages', 'Mara pays the agreed two coins for the survey work. The recovered stakes will save the next crew a search, though one marker will still need replacing.'),
  method: e('method', 'A Method Worth Keeping', 'You leave without coin or equipment. Mara shows you how she marks a washout from firm ground before anyone goes below; it is a practical lesson, not a promise that every trail will be safe.'),
  unpaid: e('unpaid', 'The Ridge Road Continues', 'You leave without payment. Mara files the survey and notes which stakes were missing; neither of you pretends the longer route was wasted.'),
});

export const THE_LAST_SURVEY: Scenario = largeAdventure('the-last-survey', 'The Last Survey', 'A retiring mapmaker needs one final set of measurements before he gives up the road.', tags('A retiring surveyor asks the traveler to test a disputed route measurement, then decides what useful tool should pass to the next hand.', 'worker', 'investigation/mystery', 'mountain road and county survey shed', 'LOW', 'hired/posted work'), 'milepost', {
  milepost: s('milepost', 'A Mile That Will Not Agree', 'Elias Crowe has measured the same bend twice and gets two different distances. The road crew wants the map before tomorrow. He offers you his old Joiner’s Folding Rule to compare the culvert stones, or asks you to pace the stretch without touching his instrument.', [
    { id: 'measureWithSurveyChain', label: 'Use your Survey Chain to compare the longer ground line', requirements: { items: ['surveyChain'] , usableItems: ['surveyChain']}, next: 'chainMeasure', effects: { setFlags: ['survey_used_chain'] } },
    { id: 'measureStones', label: 'Use Crowe’s folding rule on the culvert stones', next: 'stoneMeasure', effects: { setFlags: ['survey_used_rule'] } },
    { id: 'paceRoad', label: 'Pace the road from the fixed milepost', next: 'paced' },
    { id: 'inspectNotebook', label: 'Compare the field notes before measuring again', next: 'notebook' },
  ]),
  stoneMeasure: s('stoneMeasure', 'The Stones Were Reset', 'The rule is accurate, but one culvert stone was reset after a wagon struck it. Crowe’s old measurement used the earlier edge. The map can be corrected without calling either survey careless.', [
    { id: 'recordNewEdge', label: 'Record the new stone edge and explain the change', next: 'settlement', effects: { setFlags: ['survey_new_edge'] } },
    { id: 'measureRoadInstead', label: 'Check the road from the milepost as well', next: 'paced', effects: { setFlags: ['survey_cross_check'] } },
  ]),
  chainMeasure: s('chainMeasure', 'A Longer Line Holds', 'Your Survey Chain confirms the road’s straight ground distance, while Crowe’s rule shows the culvert stone was moved. The two measurements answer different questions; neither cancels the other.', [
    { id: 'recordBothMeasures', label: 'Record the chain distance and the changed stone separately', next: 'settlement', effects: { setFlags: ['survey_both_lines', 'survey_used_chain'] } },
    { id: 'verifyOldMap', label: 'Check the field notes before revising the map', next: 'notebook', effects: { setFlags: ['survey_used_chain'] } },
  ]),
  paced: s('paced', 'A Long Hundred Paces', 'Your pace count differs from both entries. A team has worn a shallow bypass around the bend, so the traveled path is no longer the line Crowe first measured.', [
    { id: 'showBypass', label: 'Show Crowe where the wagon bypass begins', next: 'settlement', effects: { setFlags: ['survey_bypass_found'] } },
    { id: 'checkNotebookFromRoad', label: 'Compare the count with the field notes', next: 'notebook' },
  ]),
  notebook: s('notebook', 'A Note in the Margin', 'Crowe’s first entry says “old edge”; the later page says “after wagon strike.” The numbers are consistent once the dates are read in order. He wants the new map to distinguish the original road from the worn bypass.', [
    { id: 'drawBothLines', label: 'Draw the original road and the bypass separately', next: 'settlement', effects: { setFlags: ['survey_both_lines'] } },
    { id: 'verifyOnFoot', label: 'Walk the bend and verify the bypass', next: 'verified' },
    { id: 'protectSurveyNotes', label: 'Keep the revised field sheet in your Lockable Map Case on the walk back', requirements: { items: ['lockableMapCase'] , usableItems: ['lockableMapCase']}, next: 'settlement', effects: { setFlags: ['protected_survey_notes_in_case'] } },
  ]),
  verified: s('verified', 'The Bypass Is Plain', 'On foot, you see the wheel ruts leave the old curve and rejoin the road beyond the culvert. The map can show the bypass without claiming the older measurement was wrong.', [
    { id: 'finishVerifiedMap', label: 'Finish the map with both road lines shown', next: 'settlement', effects: { setFlags: ['survey_both_lines'] } },
    { id: 'recordOnlyCurrentRoute', label: 'Mark only the route wagons use now', next: 'settlement', effects: { setFlags: ['survey_bypass_found'] } },
  ]),
  settlement: s('settlement', 'A Map for the Next Crew', 'The map now shows what changed and when. Crowe says the rule has been his working tool for thirty years; he is retiring and has no apprentice to inherit it. He offers it to you as a deliberate hand-off, not as abandoned property.', [
    { id: 'acceptRule', label: 'Accept Crowe’s Joiner’s Folding Rule', requirements: { notOwnedItems: ['joinersFoldingRule'] }, next: 'rule', effects: { gainItems: ['joinersFoldingRule'], historyFlags: ['received_surveyors_folding_rule'] } },
    { id: 'takeWage', label: 'Take two coins instead', next: 'coins', effects: { money: 2 } },
    { id: 'declineBoth', label: 'Decline the payment and leave the map with Crowe', next: 'declined' },
  ]),
  rule: e('rule', 'A Tool with Its Dates', 'Crowe folds the rule into your hand and points to a small date cut inside the joint. The instrument did not fail; the road changed. You leave with a tool and a better habit of checking what a measurement refers to.'),
  coins: e('coins', 'The Map Is Settled', 'Crowe pays two coins for the day’s work. He keeps the rule for the county shed, and the map records both the old line and the newer bypass.'),
  declined: e('declined', 'Crowe’s Last Map', 'You take neither coin nor tool. Crowe files the corrected map with the county papers and keeps his rule in the shed for whoever measures the road next.'),
});

export const THE_QUARTERMASTERS_TALLY: Scenario = largeAdventure('the-quartermasters-tally', 'The Quartermaster’s Tally', 'A caravan has fewer dry bundles than people who need them.', tags('A caravan assistant allocates limited load-securing equipment before a storm, then responds when one bundle shifts.', 'temporary worker', 'labor/repair', 'prairie wagon camp', 'MODERATE', 'hired/posted work'), 'camp', {
  camp: s('camp', 'One Strap, Two Loads', 'A rain line is coming over the plain. The wagon carries the cook’s flour and the farrier’s tool chest; one Freightman’s Strap is sound, one has a cracked buckle, and the spare tarp is already tied down. The quartermaster asks where the good strap should go.', [
    { id: 'secureFlour', label: 'Secure the flour first', next: 'weather', effects: { setFlags: ['strap_on_flour'] } },
    { id: 'secureTools', label: 'Secure the farrier’s chest first', next: 'weather', effects: { setFlags: ['strap_on_tools'] } },
    { id: 'mendBuckle', label: 'Ask the farrier to mend the cracked buckle', next: 'mended', effects: { setFlags: ['strap_buckle_mended'] } },
  ]),
  mended: s('mended', 'A Stitch Before the Rain', 'The farrier stitches a leather loop around the cracked buckle. It may hold a light load, but should not be trusted with the heavy chest. The sky darkens while the team waits.', [
    { id: 'secureFlourAfterMend', label: 'Use the sound strap on the flour', next: 'weather', effects: { setFlags: ['strap_on_flour', 'strap_buckle_mended'] } },
    { id: 'useMendedOnTools', label: 'Use the mended strap on the chest', hint: 'It may hold, but the chest is the heavier load.', next: 'weather', effects: { setFlags: ['strap_on_tools', 'strap_buckle_mended'] } },
  ], 'warning'),
  weather: s('weather', 'The First Hard Gust', 'The storm reaches the camp before the wagons move. The chosen load stays in place; the other shifts against the wheel. No one is hurt, but the team must decide whether to unload in the rain or change the order of travel.', [
    { id: 'unloadAndRestack', label: 'Unload both bundles and restack under cover', next: 'restacked', effects: { setFlags: ['quartermaster_restaked'] } },
    { id: 'moveLightLoadFirst', label: 'Move the lighter load first, then return for the chest', next: 'staggered', effects: { setFlags: ['quartermaster_staggered'] } },
    { id: 'leaveUnsecuredLoad', label: 'Leave the shifted load for the owner to manage', next: 'leftLoad', effects: { historyFlags: ['left_caravan_load_unsecured'] } },
  ], 'warning'),
  restacked: s('restacked', 'A Better Order', 'Under the wagon awning, the quartermaster changes the loading order and the farrier keeps the chest between two tied flour sacks. The strap was useful, but the position of the weight mattered just as much.' , [
    { id: 'acceptStrap', label: 'Accept the retired spare Freightman’s Strap', requirements: { notOwnedItems: ['freightmansStrap'] }, next: 'strapGift', effects: { gainItems: ['freightmansStrap'], historyFlags: ['earned_freightmans_strap_on_caravan'] } },
    { id: 'takePay', label: 'Take one coin for the extra hour', next: 'paid', effects: { money: 1 } },
    { id: 'leaveReward', label: 'Decline payment and travel on', next: 'declined' },
  ]),
  staggered: s('staggered', 'A Slower Departure', 'The flour reaches the dry side of camp first. The chest waits while the rain passes, delaying the caravan but avoiding a risky lift on slick ground.', [
    { id: 'takeStrapAfterStagger', label: 'Accept the quartermaster’s spare Freightman’s Strap', requirements: { notOwnedItems: ['freightmansStrap'] }, next: 'strapGift', effects: { gainItems: ['freightmansStrap'], historyFlags: ['earned_freightmans_strap_on_caravan'] } },
    { id: 'coinsAfterStagger', label: 'Take one coin for the delayed work', next: 'paid', effects: { money: 1 } },
    { id: 'declineAfterStagger', label: 'Decline both and move on', next: 'declined' },
  ]),
  leftLoad: e('leftLoad', 'Not Your Load to Leave', 'The quartermaster and farrier secure the shifted chest themselves. You leave without pay or equipment; the owners keep responsibility for their cargo, and the storm passes without loss.'),
  strapGift: e('strapGift', 'A Strap Released from Service', 'The quartermaster removes a sound spare strap from the caravan stores and signs it over to you. It is no longer needed after the new loading plan; the load that shifted remains the owner’s responsibility.'),
  paid: e('paid', 'A Coin for the Extra Hour', 'The quartermaster pays one coin for the extra loading work. The caravan leaves later, with its weight secured more carefully.'),
  declined: e('declined', 'The Wagons Move', 'You take no payment. The quartermaster keeps the spare strap in the stores and makes sure the next crew sees the revised loading order.'),
});

export const THE_CLAIMED_SALVAGE: Scenario = largeAdventure('the-claimed-salvage', 'The Claimed Salvage', 'A washed-out camp leaves tools on the bank—and a name on the crate.', tags('A salvage helper must separate abandoned equipment from a tool chest whose owner may return.', 'helper/rescuer', 'moral prioritization', 'creekside prospecting camp', 'MODERATE', 'accidental encounter'), 'bank', {
  bank: s('bank', 'A Camp Below the Washout', 'A recent washout has exposed a small camp on the creek bank. A cracked shovel and split pan lie in the open; a closed tool chest is wedged under a canvas lean-to. The chest bears the initials “E.B.” and the footpath back to the road is passable. Nothing proves the owner is gone for good.', [
    { id: 'inspectCamp', label: 'Look for signs someone means to return', next: 'signs' },
    { id: 'leaveChest', label: 'Leave the chest closed and report the camp', next: 'report' },
    { id: 'salvageBrokenTools', label: 'Take the unusable shovel and split pan', next: 'brokenSalvage', effects: { setFlags: ['salvaged_broken_tools'] } },
  ]),
  signs: s('signs', 'A Dry Place Under Canvas', 'The chest’s canvas cover is tied at all four corners. A boot track ends at the creek and another begins on the road; the direction and timing are unclear. A torn receipt under a stone names Ezra Bell, but gives no address.', [
    { id: 'followRoadTrack', label: 'Follow the road track only as far as the fork', next: 'fork', effects: { setFlags: ['followed_return_track'] } },
    { id: 'leaveAndReport', label: 'Leave the chest and report Ezra Bell’s name', next: 'report' },
  ]),
  fork: s('fork', 'Two Roads from the Creek', 'The tracks reach a fork where wagon traffic has crossed both directions. You cannot identify which prints belong to Bell. The camp is still visible behind you; the chest can wait while you decide whether to search farther or report what you found.', [
    { id: 'returnToChest', label: 'Return without opening the chest', next: 'report' },
    { id: 'markCampLocation', label: 'Mark the camp location for its owner', next: 'reportedMarked', effects: { knowledge: ['A covered tool chest bearing Ezra Bell’s initials was left at a creekside camp after a washout; its ownership remained unresolved.'] } },
  ]),
  brokenSalvage: s('brokenSalvage', 'The Things No One Can Use', 'The shovel handle is split and the pan has a torn seam. These damaged pieces are not useful salvage. The chest remains covered and closed; the name on it still matters.', [
    { id: 'askBeforeTakingAnything', label: 'Leave the camp and ask at the nearest post office', next: 'report' },
    { id: 'leaveMarked', label: 'Mark the location without taking the chest', next: 'reportedMarked' },
  ]),
  report: e('report', 'A Name, Not a Claim', 'At the road post, the keeper recognizes the initials as belonging to a prospector who camps along the creek. They agree to pass the location along. The covered chest remains where its owner left it; you have not turned uncertainty into ownership.'),
  reportedMarked: e('reportedMarked', 'A Place the Owner Can Find', 'You record the camp’s location and leave the chest untouched. If Ezra Bell returns, the mark may save him a search. The salvage you found was not yours to claim.'),
});

export const THE_SOUNDING_LINE: Scenario = largeAdventure('the-sounding-line', 'The Sounding Line', 'A ferry landing has moved, but the old depth marks still hang above the water.', tags('A survey assistant uses a sounding rod to distinguish a shifted landing from a changed riverbed.', 'worker', 'travel/exploration', 'river ferry landing', 'MODERATE', 'hired/posted work'), 'landing', {
  landing: s('landing', 'Marks Above the Water', 'Ferry keeper Lott pays you to help mark a safer landing after spring water shifts the bank. A pole is available, but the old depth marks are painted on a board now standing several yards from the water. The ferry remains tied on the far side.', [
    { id: 'probeFirmEdge', label: 'Probe the firm edge with the ferry pole', next: 'edge' },
    { id: 'askAboutOldMarks', label: 'Ask where the old depth marks were taken', next: 'marks' },
    { id: 'walkDownstream', label: 'Walk downstream and inspect the bank', next: 'downstream' },
  ]),
  edge: s('edge', 'Silt Over the Old Bed', 'The pole meets firm gravel close to shore, then finds soft silt farther out. One old mark would put the ferry’s keel near the bottom, but the water level is lower today.', [
    { id: 'markOnlyFirmApproach', label: 'Mark the gravel approach and warn of soft silt', next: 'settle', effects: { setFlags: ['marked_soft_silt'] } },
    { id: 'requestLongerRod', label: 'Ask for a longer tool before setting the landing', next: 'tool', effects: { setFlags: ['needs_longer_probe'] } },
  ]),
  marks: s('marks', 'A Board Left Behind', 'The keeper says the board was measured at the landing before the bank shifted. It was moved uphill during a flood and never reset. The measurements are historical, not current depth readings.', [
    { id: 'compareCurrentWater', label: 'Take fresh readings at the present bank', next: 'edge', effects: { setFlags: ['compared_old_marks'] } },
    { id: 'findAnotherApproach', label: 'Inspect the downstream bend before deciding', next: 'downstream' },
  ]),
  downstream: s('downstream', 'The Bend Has More Room', 'Downstream, the bank slopes gently but the current turns toward a snag. The pole reaches bottom there; it does not establish how deep the narrow channel is nearer the landing.', [
    { id: 'showKeeperBend', label: 'Show Lott the wider but snagged approach', next: 'settle', effects: { setFlags: ['found_downstream_bend'] } },
    { id: 'returnForFreshReading', label: 'Return to the old landing for another reading', next: 'edge' },
  ], 'warning'),
  tool: s('tool', 'A Proper Probe', 'Lott has a collapsible brass-tipped sounding rod in the ferry chest, used for testing shallow spots from firm footing. You take fresh readings without stepping into the silt and find the narrow channel has deepened unevenly.', [
    { id: 'mapUnevenChannel', label: 'Map the shallow and deep sections separately', next: 'settle', effects: { setFlags: ['mapped_uneven_channel'] } },
    { id: 'recommendAnotherDay', label: 'Recommend waiting for a second day’s readings', next: 'waited' },
  ]),
  settle: s('settle', 'A Landing with Limits', 'Lott posts the fresh warning and moves the rope guide to the approach you checked. The ferry can use the landing at the current water level; after rain, the markings will need another look.', [
    { id: 'acceptRod', label: 'Accept Lott’s spare Collapsible Sounding Rod', requirements: { notOwnedItems: ['collapsibleSoundingRod'] }, next: 'rod', effects: { gainItems: ['collapsibleSoundingRod'], historyFlags: ['earned_sounding_rod_at_ferry'] } },
    { id: 'takeWages', label: 'Take two coins for the survey', next: 'paid', effects: { money: 2 } },
    { id: 'declineWages', label: 'Decline both and leave the warning posted', next: 'declined' },
  ]),
  rod: e('rod', 'A Tool for the Next Bank', 'Lott signs over a spare sounding rod that had been kept in the ferry chest. You leave with a practical probe, not a guarantee about every river; the landing still depends on water and current.'),
  paid: e('paid', 'Two Coins for the Readings', 'Lott pays the agreed two coins and keeps the spare rod. The current landing is marked with its limits rather than an old measurement.'),
  waited: e('waited', 'No Guess Made', 'Lott delays moving the landing until the water can be checked again. You receive no tool or pay today, but the ferry does not rely on a reading that could not answer the question.'),
  declined: e('declined', 'The Ferry Holds', 'You take no payment. Lott keeps the rod and posts the warning before the next crossing.'),
});

export const THE_WHEEL_BEFORE_DAWN: Scenario = largeAdventure('the-wheel-before-dawn', 'The Wheel Before Dawn', 'A freight wagon must leave at first light, but its hub has begun to work loose.', tags('A caravan troubleshooter decides whether to preserve time, cargo, or a worn tool while stabilizing a wagon wheel.', 'temporary worker', 'labor/repair', 'roadside wagon camp', 'MODERATE', 'hired/posted work'), 'hub', {
  hub: s('hub', 'A Warm Hub and a Loose Pin', 'The wheel is still on the wagon, but the hub has play when lifted. The driver has a Compact Wheel Wrench, an Iron Rope Clamp, and a spare pin; all belong to the freight company. A full repair takes time, and the wagon is due at a station before dawn.', [
    { id: 'checkPinWithWrench', label: 'Use the Compact Wheel Wrench to check the hub', next: 'pin', effects: { setFlags: ['wheel_checked_wrench'] } },
    { id: 'secureLoadFirst', label: 'Secure the freight before touching the wheel', next: 'load', effects: { setFlags: ['wheel_load_secured'] } },
    { id: 'askDriverForTime', label: 'Ask the driver what can safely be delayed', next: 'schedule' },
  ]),
  pin: s('pin', 'The Pin Is Not the Only Trouble', 'The pin has backed out, but the washer is scored. Tightening it alone may carry the empty wagon to the station; with a heavy load, the hub needs to cool and be inspected.', [
    { id: 'coolAndInspect', label: 'Wait for the hub to cool and inspect the washer', next: 'inspection', effects: { setFlags: ['wheel_waited'] } },
    { id: 'tightenForEmptyRun', label: 'Tighten it for an empty wagon and unload first', next: 'load', effects: { setFlags: ['wheel_short_run'] } },
  ], 'warning'),
  load: s('load', 'Cargo Before the Clock', 'The freight can be shifted to the second wagon, but doing so takes the driver and two hands away from the repair. The company’s dispatch clerk will accept a late arrival if the cargo is safe.', [
    { id: 'moveFreight', label: 'Move the heavy crates to the second wagon', next: 'inspection', effects: { setFlags: ['wheel_load_moved'] } },
    { id: 'leaveLightCrates', label: 'Leave only the light parcels on this wagon', next: 'inspection', effects: { setFlags: ['wheel_light_load'] } },
  ]),
  schedule: s('schedule', 'The Dispatch Window', 'The driver says the station can hold the freight until sunrise, but a missed connection costs the company a day. No passenger relies on this wagon tonight. Safety and speed are in real tension, not life and death.', [
    { id: 'chooseSafeDelay', label: 'Take the delay and make a full inspection', next: 'inspection', effects: { setFlags: ['wheel_delay_accepted'] } },
    { id: 'chooseLightRun', label: 'Unload the heavy freight and make a short run', next: 'load', effects: { setFlags: ['wheel_short_run'] } },
  ]),
  inspection: s('inspection', 'A Sounder Washer', 'With the load lightened, the washer can be replaced and the pin seated. The company’s mechanic confirms the repair. The Compact Wheel Wrench did the careful work; the clamp held the axle stand while the wheel was clear.', [
    { id: 'keepWrenchAsReleasedTool', label: 'Accept the company’s spare Compact Wheel Wrench', requirements: { notOwnedItems: ['compactWheelWrench'] }, next: 'wrench', effects: { gainItems: ['compactWheelWrench'], historyFlags: ['received_company_wheel_wrench'] } },
    { id: 'takeThreeCoins', label: 'Take three coins for the night repair', next: 'paid', effects: { money: 3 } },
    { id: 'returnTools', label: 'Return every tool and leave unpaid', next: 'returned' },
  ]),
  wrench: e('wrench', 'A Wrench Released from the Kit', 'The mechanic signs over the company’s spare wrench; the tool used on the axle remains in the freight kit. The wagon leaves later with its load safe, and you carry the wrench as earned compensation.'),
  paid: e('paid', 'A Repair Paid in Coin', 'The company pays three coins for the night work. The tools remain with the wagon, and the missed connection is recorded rather than hidden.'),
  returned: e('returned', 'A Safe, Late Departure', 'You return the tools to the driver. The freight leaves after sunrise; no one is paid twice, and the wheel is checked again before the road.'),
});

export const THE_APPRENTICES_LIGHT: Scenario = largeAdventure('the-apprentices-light', 'The Apprentice’s Light', 'A lamp-maker asks you to test a case where wind finds every careless seam.', tags('A lamp-maker trains a temporary apprentice to diagnose wind failure before a night procession.', 'student', 'labor/repair', 'lamp-maker workshop and open yard', 'LOW', 'hired/posted work'), 'bench', {
  bench: s('bench', 'A Flame in Still Air', 'Lamp-maker Odelia Rusk has made a brass match case and a shuttered lantern. The lamp works on her bench but goes out in the yard wind. You are hired to test the assembly, not to invent fuel or flame.', [
    { id: 'checkCaseSeam', label: 'Check whether the match case keeps its contents dry', next: 'case' },
    { id: 'turnLanternToWind', label: 'Turn the lantern into the yard wind', next: 'wind' },
    { id: 'askAboutWick', label: 'Ask whether the wick is trimmed correctly', next: 'wick' },
  ]),
  case: s('case', 'Dry Matches, Poor Airflow', 'The case stays dry, but the lantern’s lower air opening faces directly into the gust. The matches are not the cause. Rusk asks you to make one change without altering the lamp permanently.', [
    { id: 'shieldOpening', label: 'Set a board as a temporary windbreak', next: 'test', effects: { setFlags: ['apprentice_windbreak'] } },
    { id: 'rotateLantern', label: 'Rotate the lantern so the opening faces away', next: 'test', effects: { setFlags: ['apprentice_rotated'] } },
  ]),
  wind: s('wind', 'The Flame Leans', 'The flame bends sharply when the opening faces the gust, then steadies when Rusk turns the lantern sideways. The shutter is intact; the placement was wrong for this wind.', [
    { id: 'repeatSideways', label: 'Repeat the test with the lantern turned sideways', next: 'test', effects: { setFlags: ['apprentice_rotated'] } },
    { id: 'useBoardOutside', label: 'Test a board windbreak instead', next: 'test', effects: { setFlags: ['apprentice_windbreak'] } },
  ]),
  wick: s('wick', 'A Clean Wick, a Bad Angle', 'The wick is trimmed evenly and the oil is clear. Rusk shows you how the lower opening draws air; the test can isolate wind direction before anyone blames the fuel.', [
    { id: 'testAngle', label: 'Turn the lantern away from the gust', next: 'test', effects: { setFlags: ['apprentice_rotated'] } },
    { id: 'testWindbreak', label: 'Shield the opening with a board', next: 'test', effects: { setFlags: ['apprentice_windbreak'] } },
  ]),
  test: s('test', 'The Procession’s Practice Lamp', 'The flame holds long enough for the procession marshal to see the route card. A windbreak makes the lamp steadier in one place; turning it helps while walking, but the bearer must keep watching the gusts.', [
    { id: 'acceptMatchCase', label: 'Accept Rusk’s spare Windproof Match Case', requirements: { notOwnedItems: ['windproofMatchCase'] }, next: 'caseGift', effects: { gainItems: ['windproofMatchCase'], historyFlags: ['earned_match_case_apprenticeship'], knowledge: ['A shuttered lamp can go out when its air opening faces a strong gust; turning it or using a local windbreak can steady it.'] } },
    { id: 'takeTwoCoins', label: 'Take two coins for the testing shift', next: 'coins', effects: { money: 2, knowledge: ['A shuttered lamp can go out when its air opening faces a strong gust; turning it or using a local windbreak can steady it.'] } },
    { id: 'declineCompensation', label: 'Decline all compensation', next: 'lesson', effects: { knowledge: ['A shuttered lamp can go out when its air opening faces a strong gust; turning it or using a local windbreak can steady it.'] } },
  ]),
  caseGift: e('caseGift', 'A Few Matches Kept Dry', 'Rusk gives you a spare brass case that holds only a few matches. It will not create fire, but it can keep ordinary matches dry when weather threatens them.'),
  coins: e('coins', 'The Testing Shift', 'Rusk pays two coins for the testing shift. She keeps the case and adds a note about the lamp’s air opening to the shop card.'),
  lesson: e('lesson', 'A Useful Limitation', 'You leave without coin or gear. The lesson is narrow and practical: a windproof case protects matches, while a lamp still needs its opening turned out of a gust.'),
});

export const THE_BRIDGE_CREWS_WEDGE: Scenario = largeAdventure('the-bridge-crews-wedge', 'The Bridge Crew’s Wedge', 'A maintenance crew finds a brace that will not stay seated beneath a footbridge.', tags('A bridge helper chooses how to stabilize a non-public maintenance span and learns when a tool should not substitute for inspection.', 'temporary worker', 'labor/repair', 'timber footbridge and road approach', 'HIGH', 'hired/posted work'), 'approach', {
  approach: s('approach', 'Closed to Traffic', 'The bridge crew has closed a small timber footbridge while replacing a brace. One beam shifts when the jack is eased. The crew owns a Bridgewright’s Hammer, a Steel Wedge, and a rope line; no one is on the span, and the public road has a signed detour.', [
    { id: 'seatWedge', label: 'Seat the Steel Wedge from the firm bank', next: 'wedge', effects: { setFlags: ['bridge_wedge_used'] } },
    { id: 'holdLine', label: 'Take the rope line and keep the beam from rolling', next: 'line', effects: { setFlags: ['bridge_line_used'] } },
    { id: 'askCrewLead', label: 'Ask the crew lead to inspect the jack first', next: 'inspection' },
  ], 'warning'),
  wedge: s('wedge', 'A Wedge That Will Not Seat', 'The wedge catches at the outer edge. The timber is split along the grain; driving harder could enlarge the split. The rope line can steady the beam while the crew resets the jack.', [
    { id: 'stopAndReset', label: 'Stop and reset the jack before trying again', next: 'inspection', effects: { setFlags: ['bridge_stopped_work'] } },
    { id: 'steadyWithLine', label: 'Hold the rope line while the crew backs the jack off', next: 'inspection', effects: { setFlags: ['bridge_line_used'] } },
  ], 'danger'),
  line: s('line', 'The Beam Holds for Inspection', 'The rope line steadies the beam but cannot repair the split. The lead signals everyone to step back and inspect the timber from the bank before setting any new brace.', [
    { id: 'inspectSplit', label: 'Inspect the split from the bank with the crew lead', next: 'inspection' },
    { id: 'keepLineTaut', label: 'Keep the line taut while the jack is lowered', next: 'inspection', effects: { setFlags: ['bridge_line_used'] } },
  ], 'warning'),
  inspection: s('inspection', 'The Repair Is Replanned', 'A new brace fits the sound timber and the damaged board is set aside. No one crosses until the crew lead checks the whole span. Your tool choice affected how the beam was held, but it could not make split wood sound.', [
    { id: 'acceptSpareHammer', label: 'Accept the crew lead’s spare Bridgewright’s Hammer', requirements: { notOwnedItems: ['bridgewrightHammer'] }, next: 'hammer', effects: { gainItems: ['bridgewrightHammer'], historyFlags: ['received_bridgewright_hammer_from_crew'] } },
    { id: 'takeThreeCoins', label: 'Take three coins for the maintenance shift', next: 'wage', effects: { money: 3 } },
    { id: 'returnEquipment', label: 'Return the crew’s tools and leave without pay', next: 'unpaid' },
  ]),
  hammer: e('hammer', 'A Hammer for Careful Work', 'The lead releases a spare Bridgewright’s Hammer from the crew chest, with the crew’s name struck on the old one left behind. You receive the spare as payment; the bridge remains closed until the inspection is complete.'),
  wage: e('wage', 'The Shift Ends at the Detour', 'The crew pays three coins for the shift. The detour stays posted until the lead signs the bridge open, and the split brace is carried back for examination.'),
  unpaid: e('unpaid', 'The Tools Stay with the Crew', 'You return every tool. The bridge remains closed while the crew finishes the repair; your help ends without wages or a piece of equipment.'),
});

export const GEAR_CORRECTIVE_ADVENTURES = [THE_SQUIRES_PACK, THE_LAST_SURVEY, THE_QUARTERMASTERS_TALLY, THE_CLAIMED_SALVAGE, THE_SOUNDING_LINE, THE_WHEEL_BEFORE_DAWN, THE_APPRENTICES_LIGHT, THE_BRIDGE_CREWS_WEDGE] satisfies Scenario[];
