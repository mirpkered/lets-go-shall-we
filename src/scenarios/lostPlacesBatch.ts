import type { Scenario } from '../types';
import { largeAdventure, largeEnd as end, largeScene as scene, largeTags as tags } from './largeContentTools';

const E = (id: string, title: string, subtitle: string, activity: string, risk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE', hook: string, scenes: Scenario['scenes'], start: string, setting: string, structures: string[] = ['branching narrative', 'multi-stage exploration']) => {
  const allowedActivities = ['labor/repair', 'rescue/care', 'survival', 'negotiation/trade', 'investigation/mystery', 'travel/exploration', 'social interaction', 'animals', 'combat/defense', 'puzzle/problem-solving', 'moral prioritization', 'communication/witness'];
  const activityTag = allowedActivities.includes(activity) ? activity : /travel|exploration|survival/i.test(activity) ? 'travel/exploration' : 'investigation/mystery';
  return largeAdventure(id, title, subtitle, tags({ hook, activity: activityTag, role: 'investigator/explorer', tone: 'mysterious/eerie', risk, setting, structures, fantasy: 'NONE', outcomes: ['success/partial success', 'walk-away/refusal', 'unresolved mystery', ...(risk === 'HIGH' || risk === 'SEVERE' ? ['escape/survival', 'costly success/no-perfect-outcome possible'] : [])], rewards: ['money/item/knowledge/history possible', 'narrative-only payoff'], consequences: ['time/opportunity', ...(risk === 'HIGH' || risk === 'SEVERE' ? ['health/injury', 'gear/property/objective'] : [])] }), start, scenes);
};

export const THE_MAP_IN_THE_LEDGER = E('the-map-in-the-ledger', 'The Map in the Ledger', 'A mill account book hides a drawing that may not point to money.', 'travel/exploration', 'MODERATE', 'A ledger map yields layered evidence and a genuine choice to stop after partial discovery.', {
  ledger: scene('ledger', 'Ink beneath the Accounts', 'A retired miller offers an old account book for copying. A folded map has been drawn beneath the totals: a creek bend, a split pine, and a mark beside “third stone.” No sum or name explains what is there.', [
    { id: 'askMiller', label: 'Ask the miller what the mark means', next: 'miller' },
    { id: 'traceCreek', label: 'Follow the creek bend to the pine', next: 'creek' },
    { id: 'copyMap', label: 'Copy the map and leave it with the book', next: 'copied' },
    { id: 'leaveLedger', label: 'Decline the errand and move on', next: 'leave' },
  ]),
  miller: scene('miller', 'A Mark for the Old Crew', 'The miller remembers a crew using the creek road to reach a cut bank before the rail spur was built. He never heard of a cache. The third stone may be a boundary marker, not a promise of valuables.', [
    { id: 'millerGo', label: 'Walk to the marked creek bend', next: 'creek' },
    { id: 'millerStop', label: 'Keep the account and ask no more', next: 'copied' },
  ]),
  creek: scene('creek', 'The Split Pine', 'The split pine still stands above the creek. Three stones are set along its roots; the third bears a shallow chisel mark. A narrow track climbs to an old work shelf, while the creek path returns to the road.', [
    { id: 'checkStone', label: 'Read the chisel mark', next: 'stone' },
    { id: 'takeTrackBack', label: 'Return to the road with the location', next: 'copied' },
    { id: 'climbShelf', label: 'Follow the track to the old shelf', next: 'shelf' },
  ]),
  stone: scene('stone', 'A Survey Mark, Not a Lock', 'The chisel mark matches an old mill tally symbol for a water gate. Beneath the stone are rotted boards, not a buried chest. The old work shelf may show where the crew diverted the creek.', [
    { id: 'stoneRecord', label: 'Record the symbol and stop here', next: 'copied', effects: { knowledge: ['The third stone at the split pine marks an old mill water gate, not a buried cache.'] } },
    { id: 'stoneShelf', label: 'Climb to the work shelf', next: 'shelf' },
  ]),
  shelf: scene('shelf', 'The Cut Bank', 'The shelf shows a dry channel cut to protect the mill wheel. A rusted iron pin and a workers’ date are still set in the stone; there is no chest. The date predates the ledger by a generation.', [
    { id: 'shelfSketch', label: 'Sketch the old water channel', next: 'discovery', effects: { knowledge: ['The ledger map marks a diverted mill channel used before the present wheel was built.'] } },
    { id: 'shelfDig', label: 'Search the loose bank for a cache', hint: 'The bank is crumbly and the map promised no valuables.', chance: { probability: 0.5, successNext: 'discovery', failureNext: 'shelfFall', successMessage: 'You uncover a dated mill token in the loose soil.', failureMessage: 'The bank slumps and buries the lower mark.', failureEffects: { health: -1 } } },
    { id: 'shelfLeave', label: 'Leave before the bank shifts', next: 'copied' },
  ], 'warning'),
  shelfFall: scene('shelfFall', 'The Marking Slips', 'The bank sheds soil beneath your boots. You retreat with a bruised shin; the mill token remains below the slumped earth, and the cut channel is still visible from the path.', [{ id: 'fallLeave', label: 'Return to the road', next: 'copied', effects: { health: -1 } }], 'warning'),
  discovery: scene('discovery', 'What the Ledger Meant', 'The drawing marks a forgotten water diversion, not treasure. The miller can use the old channel date to explain why the present wheel floods in spring; the token is a crew marker, not payment.', [{ id: 'discoveryShare', label: 'Take the dated note back to the miller', next: 'revealed', effects: { historyFlags: ['found a mill crew marker beneath a ledger map'] } }]),
  copied: end('copied', 'A Map with a Use', 'You leave with the map’s location and what it may mean. No treasure is claimed; the ledger remains with its owner, and the old water-gate mark can guide a later repair.'),
  revealed: end('revealed', 'The Mill’s Earlier Course', 'The miller recognizes the old channel date and adds it to the account book. The map has recovered a piece of working history, not a fortune.'),
  leave: end('leave', 'The Book Stays Shut', 'You decline the errand. The miller keeps the ledger, and the map remains an unexplained drawing beneath old accounts.'),
}, 'ledger', 'mill/creek', ['evidence interpretation', 'optional deeper exploration', 'knowledge payoff']);

export const THE_TOWN_THAT_MOVED = E('the-town-that-moved', 'The Town That Moved', 'A traveler’s directions lead to foundations, not the settlement named on the map.', 'travel/exploration', 'LOW', 'Evidence distinguishes relocation after flood, rail change, and fire without forcing a supernatural answer.', {
  crossroads: scene('crossroads', 'The Missing Main Street', 'A hand-drawn route says Mill Crossing lies beyond the cottonwoods, but the road ends at grass-covered foundations. A well curb remains; no roofs or chimneys stand. The rail line now runs two miles east.', [
    { id: 'inspectWell', label: 'Read the old well stones', next: 'well' },
    { id: 'followRail', label: 'Follow the newer rail road east', next: 'rail' },
    { id: 'askFarm', label: 'Ask at the nearest farmhouse', next: 'farm' },
    { id: 'leaveTown', label: 'Mark the foundations and continue', next: 'leave' },
  ]),
  well: scene('well', 'A Flood Line in Stone', 'A pale mineral line circles the well above the old water mark. The low foundations all face the same direction, and gravel has filled the former street. Nothing suggests the town vanished overnight.', [
    { id: 'wellLook', label: 'Search the raised ground for a marker', next: 'marker' },
    { id: 'wellAsk', label: 'Take the flood mark to the farmhouse', next: 'farm' },
  ]),
  rail: scene('rail', 'A Station Two Miles East', 'A newer station stands beside the rail line. Its clerk says Mill Crossing moved after repeated floods, then lost most trade when the line bypassed its old road. A few families still live nearby.', [
    { id: 'railRecords', label: 'Check the old station ledger', next: 'records' },
    { id: 'railReturn', label: 'Walk back to the foundations', next: 'marker' },
  ]),
  farm: scene('farm', 'The House above the Floodplain', 'A farmer’s family moved uphill after a flood took the mill bridge. The rail later brought shops to the eastern station. They can name two families who stayed, but cannot say where every former resident went.', [
    { id: 'farmMarker', label: 'Ask for the town relocation marker', next: 'marker' },
    { id: 'farmRecords', label: 'Ask the station for its old ledger', next: 'records' },
  ]),
  marker: scene('marker', 'A Name Cut into the Ridge', 'A stone above the floodplain lists the families who moved the school and meeting hall uphill. Several names are scratched through where households left for the rail settlement. The town did not disappear; it split.', [
    { id: 'markerRecord', label: 'Copy the names for the station clerk', next: 'discovery', effects: { knowledge: ['Mill Crossing moved uphill after flood damage and split again when the rail station opened east.'] } },
    { id: 'markerLeave', label: 'Keep the route and continue on', next: 'leave' },
  ]),
  records: scene('records', 'A Ledger of Departures', 'The station ledger records the school moving uphill after the bridge flood and several shops shifting east after the railway arrived. It lists no single date when the old town ended.', [{ id: 'recordShare', label: 'Give the clerk the ridge names', next: 'discovery', effects: { historyFlags: ['traced the move of Mill Crossing from its foundations'] } }]),
  discovery: end('discovery', 'A Town in Three Places', 'The old foundations, uphill marker, and rail-side settlement belong to different chapters of Mill Crossing. The route on the hand-drawn map was not false; it simply ended at the oldest site.'),
  leave: end('leave', 'The Foundations Remain', 'You leave the old street without searching every stone. The well, grassed foundations, and newer rail road are enough to show the settlement changed places.'),
}, 'crossroads', 'abandoned settlement');

export const THE_OLD_SURVEY_STONE = E('the-old-survey-stone', 'The Old Survey Stone', 'An old boundary mark contradicts the fence line people use today.', 'property/history', 'MODERATE', 'A survey stone exposes conflicting property histories and opens an old road, not a guaranteed cache.', {
  fence: scene('fence', 'A Stone beyond the Fence', 'A farmer asks you to find a lost calf along a boundary fence. The old survey stone stands thirty paces beyond the present fence, beside a narrow lane neither household uses. Two neighbors both say the lane belongs to the other.', [
    { id: 'checkStone', label: 'Read the cut marks on the stone', next: 'marks' },
    { id: 'followLane', label: 'Follow the old lane to its end', next: 'lane' },
    { id: 'askNeighbors', label: 'Hear both neighbors separately', next: 'accounts' },
    { id: 'declineBoundary', label: 'Look only for the calf and leave', next: 'calf' },
  ]),
  marks: scene('marks', 'A Line before the Fence', 'The stone has two dates cut into it. The older line follows the lane; a later mark shifts the boundary toward the present fence. A chipped corner makes the exact direction uncertain.', [
    { id: 'marksLedger', label: 'Ask the schoolmaster about old maps', next: 'accounts' },
    { id: 'marksLane', label: 'Follow the older road', next: 'lane' },
  ]),
  lane: scene('lane', 'Where the Lane Ends', 'The lane reaches an abandoned orchard and the remains of a small loading shed. It once served a mill path before the newer fence was built. A calf’s tracks turn into the orchard, while an old plank bears a property mark.', [
    { id: 'laneCalf', label: 'Follow the calf into the orchard', next: 'calf' },
    { id: 'lanePlank', label: 'Show the plank mark to both neighbors', next: 'accounts' },
    { id: 'laneRetreat', label: 'Leave the boundary question alone', next: 'leave' },
  ]),
  accounts: scene('accounts', 'Two Fences, Two Memories', 'One neighbor says the old lane was sold with the mill parcel; the other says the fence was moved after the mill closed. The schoolmaster can check a copy of the survey, but the original deed is kept in the county seat.', [
    { id: 'askSurveyCopy', label: 'Ask the schoolmaster for the survey copy', next: 'survey' },
    { id: 'askCounty', label: 'Carry the question to the county seat', next: 'record' },
  ]),
  survey: scene('survey', 'A Copy with a Missing Corner', 'The schoolmaster’s copy shows the older lane but not the later fence shift. It supports neither neighbor’s full claim. The calf tracks and loading shed can be described without deciding title.', [
    { id: 'surveyShare', label: 'Give both neighbors the same account', next: 'resolved', effects: { knowledge: ['An older survey includes the orchard lane; the later fence shift is not shown on the available copy.'] } },
    { id: 'surveyCounty', label: 'Recommend checking the county deed', next: 'record' },
  ]),
  record: scene('record', 'The County Entry', 'The county book shows the mill parcel kept a right to use the lane, but not ownership of the orchard. The calf is found inside the orchard fence; the boundary remains shared in practice until the neighbors agree on a gate.', [{ id: 'recordTell', label: 'Return the calf and read the entry aloud', next: 'resolved', effects: { historyFlags: ['found an old shared lane in a boundary record'] } }]),
  calf: scene('calf', 'A Calf in the Orchard', 'The calf stands under a bare apple tree with no injury. The orchard gate can be opened from this side. The old lane reaches the gate, but the boundary itself remains disputed.', [{ id: 'calfReturn', label: 'Lead the calf back through the open gate', next: 'resolved' }]),
  resolved: scene('resolved', 'A Gate instead of a Verdict', 'The neighbors agree to leave the orchard gate unlatched for the calf and to check the county deed before moving the fence. Neither yields the land claim; the animal is home, and the lane stays passable for now.', [{ id: 'surveyEnd', label: 'Leave the boundary in their hands', next: 'settled' }]),
  settled: end('settled', 'The Line Still Needs a Deed', 'The old stone changes the discussion but cannot establish the later fence shift by itself. The calf is returned and the lane remains usable while the neighbors seek the original record.'),
  leave: end('leave', 'Only the Calf', 'You leave the boundary argument untouched. The calf may be found by someone else; the old survey stone remains beyond the fence.'),
}, 'fence', 'orchard and boundary');

export const THE_SEALED_MINE_OFFICE = E('the-sealed-mine-office', 'The Sealed Mine Office', 'A boarded office may explain why a small mine was abandoned in haste.', 'investigation/mystery', 'HIGH', 'The player explores an abandoned surface office with permission-sensitive evidence and an optional unstable route.', {
  porch: scene('porch', 'Boards over the Office Door', 'A small mine office stands above the old cut. The front door is boarded from the outside; one shutter hangs open. A notice names the mine owner, whose daughter now runs the nearby store. No one is known to be underground.', [
    { id: 'askOwner', label: 'Ask the owner’s daughter for permission', next: 'permission' },
    { id: 'readNotice', label: 'Read the mine closure notice', next: 'notice' },
    { id: 'lookShutter', label: 'Look through the open shutter', next: 'window' },
    { id: 'leaveOffice', label: 'Leave the sealed office alone', next: 'leave' },
  ]),
  permission: scene('permission', 'A Key after the Ledger', 'The owner’s daughter says the office was boarded after a payroll dispute, not a collapse. She will lend the key if you agree not to enter the lower mine cut; old ledgers and maps are still her family’s property.', [
    { id: 'acceptKey', label: 'Open the office with her key', next: 'inside' },
    { id: 'declineKey', label: 'Ask her to bring the records outside', next: 'records' },
  ]),
  notice: scene('notice', 'The Notice Names a Flood', 'The closure notice cites a flooded lower drift and unpaid wages. It orders the office sealed pending an account review. It does not say anyone was trapped.', [
    { id: 'noticeAsk', label: 'Take the notice to the owner’s daughter', next: 'permission' },
    { id: 'noticeCopy', label: 'Copy the date and leave', next: 'discovery', effects: { knowledge: ['The mine office was sealed during a payroll review after a lower drift flooded; no entrapment was reported.'] } },
  ]),
  window: scene('window', 'Papers on the Desk', 'From the open shutter you can see a ledger on the desk and a map pinned to the wall. The sill is sound, but entering through it would damage the shutter and cross a room you do not own.', [
    { id: 'windowAsk', label: 'Ask permission before entering', next: 'permission' },
    { id: 'windowLeave', label: 'Copy only the map title from outside', next: 'discovery' },
  ]),
  inside: scene('inside', 'The Office Kept Dry', 'The ledger is dry and the map shows two old surface routes, one now hidden under brush. A drawer is locked; the daughter says it may contain private wage accounts. The map is already enough to locate the old drainage channel.', [
    { id: 'copyMap', label: 'Copy the surface route and close the book', next: 'discovery', effects: { knowledge: ['The old mine office map marks a surface drainage channel separate from the flooded lower drift.'] } },
    { id: 'openDrawer', label: 'Ask the daughter to open the wage drawer', next: 'records' },
    { id: 'checkCut', label: 'Follow the map toward the drainage cut', next: 'drain' },
  ]),
  records: scene('records', 'The Wages Were Paid Late', 'The daughter opens the drawer herself. The wage book shows payments made two weeks late after the flood, and a list of miners who transferred to another claim. Nothing records a missing worker.', [{ id: 'recordShare', label: 'Return the ledger to the family', next: 'discovery', effects: { historyFlags: ['helped recover a family wage ledger from a sealed mine office'] } }]),
  drain: scene('drain', 'The Surface Channel', 'The map’s channel ends at a dry culvert outside the mine. It diverted rain away from the office and never entered the lower workings. A stone marker dates the work; no treasure or secret tunnel lies beyond it.', [
    { id: 'drainMeasure', label: 'Measure the outlet for the owner', next: 'discovery', effects: { knowledge: ['The sealed office map’s drainage route ends at a surface culvert and does not enter the mine.'] } },
    { id: 'drainEnter', label: 'Climb into the narrow culvert', hint: 'The passage is not a mine entrance and may trap you.', chance: { probability: 0.48, successNext: 'discovery', failureNext: 'culvertInjury', successMessage: 'You reach the outlet bend and find only old water marks.', failureMessage: 'Loose stones jam the narrow return.', failureEffects: { health: -2 } } },
  ], 'warning'),
  culvertInjury: scene('culvertInjury', 'A Narrow Return', 'You wriggle free with a scraped shoulder. The culvert is a drainage outlet, not a safe passage; the owner’s daughter will have it checked before the next rain.', [{ id: 'culvertLeave', label: 'Return the key and leave', next: 'discovery', effects: { health: -1 } }], 'warning'),
  discovery: end('discovery', 'Records, Not a Hidden Mine', 'The office explains the sealing: a flooded lower drift, late wages, and a move to another claim. The surviving map and ledger belong to the family; you leave with permission-based knowledge, not an unexplained hoard.'),
  leave: end('leave', 'Boards Left in Place', 'You leave the office sealed. The notice records a flood and payroll review; no rescue is waiting underground.'),
}, 'porch', 'abandoned mine surface');

export const THE_ROOM_BEHIND_THE_CHIMNEY = E('the-room-behind-the-chimney', 'The Room Behind the Chimney', 'A renovation exposes a narrow room where the house plans show a solid wall.', 'investigation/mystery', 'MODERATE', 'A hidden room reveals personal correspondence and ownership questions rather than a guaranteed treasure chest.', {
  house: scene('house', 'A Wall without a Plan', 'A mason repairing an old farmhouse chimney finds an empty space behind the brick. The householder has asked you to hold the lamp while the mason checks the opening. No one has entered; loose mortar still rests on the sill.', [
    { id: 'askHouseholder', label: 'Ask who owned the room before', next: 'history' },
    { id: 'inspectOpening', label: 'Look through the opening from outside', next: 'opening' },
    { id: 'braceChimney', label: 'Ask the mason to brace the chimney first', next: 'braced' },
    { id: 'leaveHouse', label: 'Leave the household to the repair', next: 'leave' },
  ]),
  history: scene('history', 'A Family Name in the Deed', 'The householder says the upper room was added by an aunt who kept a sewing business. The deed lists her name but says nothing about a hidden space. The mason warns that the chimney must not be leaned on.', [
    { id: 'historyBrace', label: 'Wait for the mason to brace the wall', next: 'braced' },
    { id: 'historyLook', label: 'Ask to view the opening without entering', next: 'opening' },
  ]),
  opening: scene('opening', 'A Shelf beyond the Brick', 'A narrow shelf holds a tin sewing box and a bundle of letters tied with faded ribbon. The opening is shoulder-wide; the chimney bricks are still settling. The householder asks you not to take anything without looking together.', [
    { id: 'openingBrace', label: 'Have the mason secure the chimney', next: 'braced' },
    { id: 'reachBox', label: 'Reach for the tin box from the sill', hint: 'The brick edge is loose; leaning into it may bring part of the chimney down.', chance: { probability: 0.61, successNext: 'boxFound', failureNext: 'brickFall', successMessage: 'You draw the box out without putting weight on the wall.', failureMessage: 'A loosened brick falls against your arm.', failureEffects: { health: -2 } } },
    { id: 'leaveLetters', label: 'Leave everything in place', next: 'braced' },
  ], 'warning'),
  braced: scene('braced', 'The Mason Sets a Prop', 'A timber props the chimney while the mason widens the opening by hand. The letters name the aunt’s former business partners; the sewing box bears a maker’s mark from this county.', [
    { id: 'openLetters', label: 'Ask the householder to open the letters', next: 'letters' },
    { id: 'removeBox', label: 'Let the householder take the sewing box', next: 'boxFound' },
    { id: 'bracedLeave', label: 'Leave the contents for the family', next: 'discovery' },
  ]),
  boxFound: scene('boxFound', 'The Sewing Box', 'The tin contains needles, a thimble, and a small account slip—not coin. Its maker’s mark matches the aunt’s shop. The householder recognizes the handwriting on the ribbon but cannot yet identify the letters’ recipients.', [
    { id: 'boxRead', label: 'Compare the account slip with the letters', next: 'letters' },
    { id: 'boxReturn', label: 'Return the box to the household', next: 'discovery', effects: { historyFlags: ['helped recover a sewing box from a hidden wall space'] } },
  ]),
  brickFall: scene('brickFall', 'Mortar on the Floor', 'A brick strikes your forearm and drops harmlessly to the floor. The mason braces the chimney before anyone reaches in again. The box remains inside, and the letters have not been disturbed.', [{ id: 'fallBrace', label: 'Let the mason secure the opening', next: 'braced', effects: { health: -1 } }], 'warning'),
  letters: scene('letters', 'A Debt Paid in Stitching', 'The letters show the aunt lent her sewing room to a neighbor after a shop fire. The hidden room served as dry storage, not a secret escape. The account slip shows the neighbor repaid her in work over two winters.', [{ id: 'lettersShare', label: 'Give the letters back to the family', next: 'discovery', effects: { knowledge: ['The room behind the chimney was dry storage used by a sewing business after a neighboring shop fire.'] } }]),
  discovery: end('discovery', 'A Room Kept for Dry Work', 'The family learns why the small space was built and returns the box and letters to their proper place. The discovery changes the house’s history, not the traveler’s inventory.'),
  leave: end('leave', 'A Wall Left Undisturbed', 'You leave before the mason opens the space. The householder keeps the repair small; whatever lies behind the chimney remains their concern.'),
}, 'house', 'farmhouse interior');

export const THE_ISLAND_WHEN_THE_WATER_FALLS = E('the-island-when-the-water-falls', 'The Island When the Water Falls', 'Low water exposes a midstream island for only a short part of the day.', 'travel/exploration', 'HIGH', 'A temporary river window rewards limited investigation while the return crossing becomes progressively unsafe.', {
  bank: scene('bank', 'A Strip of Dry Gravel', 'The river has fallen enough to expose a gravel bar in midstream. The far bank lies beyond a narrow channel; water is still running between both sides. A broken boat rib and a survey post stand on the bar. Clouds upstream may bring another rise.', [
    { id: 'readPost', label: 'Read the survey post from shore', next: 'post' },
    { id: 'crossRope', label: 'Cross with your rope as a handline', requirements: { usableItems: ['travelRope'] }, next: 'island', effects: { damageItems: ['travelRope'] } },
    { id: 'waitWater', label: 'Wait for the river to fall farther', next: 'wait' },
    { id: 'leaveIsland', label: 'Leave the island alone', next: 'leave' },
  ], 'warning'),
  post: scene('post', 'A Marker for the Old Channel', 'The post marks an earlier river channel. The island was once connected to the north bank, but the channel shifted. The boat rib is from a small freight skiff, not a bridge.', [
    { id: 'postCross', label: 'Cross while the shallow channel holds', next: 'island' },
    { id: 'postRecord', label: 'Copy the marker and turn back', next: 'discovery', effects: { knowledge: ['The midstream gravel bar was once joined to the north bank before the river shifted its channel.'] } },
  ]),
  wait: scene('wait', 'The Water Rises Again', 'The river has not fallen farther. A brown line of branches appears upstream, and the gravel bar is narrowing. The near bank remains safe; the island can still be reached, but the return window may close first.', [
    { id: 'waitTurnBack', label: 'Keep the safe bank and record the marker', next: 'discovery' },
    { id: 'waitRisk', label: 'Cross quickly before the debris arrives', hint: 'The channel is moving and the return may become dangerous.', chance: { probability: 0.48, successNext: 'island', failureNext: 'islandStranded', successMessage: 'You reach the gravel bar before the first debris.', failureMessage: 'The channel rises between you and the near bank.', failureEffects: { health: -2 } } },
  ], 'danger'),
  island: scene('island', 'Dry Ground between Channels', 'The gravel bar holds a low stone foundation and the stern rib of a skiff. A rusted tin is wedged beneath the foundation; the water line is rising on the far side. You have time to inspect one feature before retreating.', [
    { id: 'islandFoundation', label: 'Inspect the stone foundation', next: 'foundation' },
    { id: 'islandTin', label: 'Take the tin from beneath the stone', chance: { probability: 0.58, successNext: 'tinFound', failureNext: 'islandStranded', successMessage: 'The tin slides free with a dry scrape.', failureMessage: 'The stone shifts and the water reaches the bar.', failureEffects: { health: -1 } } },
    { id: 'islandReturn', label: 'Return to the near bank now', next: 'discovery' },
  ], 'warning'),
  foundation: scene('foundation', 'A Landing, Not a House', 'The stones form a small landing used to tie skiffs, not a dwelling. A scratched date and freight initials match the old survey post. There are no graves or valuables in the foundation.', [
    { id: 'foundationRecord', label: 'Copy the freight initials and leave', next: 'discovery', effects: { knowledge: ['The midstream island foundation was a skiff landing whose freight initials match the old survey post.'] } },
    { id: 'foundationTin', label: 'Look beneath the lowest stone', next: 'tinFound' },
  ]),
  tinFound: scene('tinFound', 'A Tin of Ferry Tokens', 'The tin holds two old ferry tokens and a water-stained receipt. The tokens are too corroded to spend; the receipt dates the landing to a freight route long abandoned. The gravel bar is shrinking.', [
    { id: 'tinReturn', label: 'Take the tokens and return to shore', next: 'discovery', effects: { knowledge: ['Old ferry tokens and a receipt show the island served a freight landing before the river shifted.'] } },
    { id: 'tinDeeper', label: 'Search the far edge for more remains', hint: 'The water is rising on that side and the bar is narrowing.', chance: { probability: 0.42, successNext: 'discovery', failureNext: 'islandStranded', successMessage: 'You find only a second marker and reach shore in time.', failureMessage: 'The channel closes behind the bar.', failureEffects: { health: -2 } } },
  ], 'warning'),
  islandStranded: scene('islandStranded', 'Water between You and Shore', 'The shallow channel is now too strong to wade. The far bank is farther but has a ferry landing; the gravel bar is still above water for a little while. A signal can be seen from the road.', [
    { id: 'strandSignal', label: 'Signal the road from the survey post', requirements: { anyUsableItems: ['conductorWhistle', 'roadsideSignalMirror', 'roadmansLantern'] }, next: 'rescued' },
    { id: 'strandWait', label: 'Wait on the high stone foundation', next: 'rescued', effects: { health: -1 } },
    { id: 'strandSwim', label: 'Swim for the near bank', hint: 'The current is carrying debris through the channel.', chance: { probability: 0.29, successNext: 'discovery', failureNext: 'islandDeath', successMessage: 'You catch the gravel edge and crawl onto the near bank.', failureMessage: 'The current pulls you away from the bar.', failureEffects: { health: -4 } } },
  ], 'danger'),
  rescued: scene('rescued', 'A Boat from the Far Landing', 'A ferryman sees the signal from the north bank and brings a shallow boat downstream. You reach the near shore with the record or tokens you actually recovered; the exposed landing goes under again.', [{ id: 'islandRescueEnd', label: 'Tell the ferryman what the post marked', next: 'discovery' }]),
  discovery: end('discovery', 'The Channel Shifts Back', 'The island is a former freight landing, not a hidden settlement. The river covers it again before evening. You leave with only what you inspected or recovered, and the next safe visit will depend on the water.'),
  leave: end('leave', 'The River Keeps Its Island', 'You stay on the near bank. The gravel bar is visible for now, but the river remains strong enough to make a crossing a decision rather than an invitation.'),
  islandDeath: end('islandDeath', 'Under the Rising Channel', 'The current pulls you from the gravel bar before the ferry can reach it.', 'death'),
}, 'bank', 'river island', ['temporary access window', 'optional deepening risk', 'retreat before return closes']);

export const THE_FORGOTTEN_STATION = E('the-forgotten-station', 'The Forgotten Station', 'A disused rail stop still stands beyond the timetable’s last listed spur.', 'investigation/mystery', 'MODERATE', 'An abandoned station’s records show who still uses the spur and why the schedule omits it.', {
  platform: scene('platform', 'Beyond the Timetable', 'A narrow rail spur leaves the main line and ends at a station absent from the current schedule. The platform is swept clean, but the signal lamp is dark. A locked freight door faces the track; the public waiting room is open.', [
    { id: 'inspectPlatform', label: 'Read the platform chalk marks', next: 'marks' },
    { id: 'enterWaiting', label: 'Look through the public waiting room', next: 'room' },
    { id: 'askRailman', label: 'Ask the track worker nearby', next: 'worker' },
    { id: 'leaveStation', label: 'Return to the main line', next: 'leave' },
  ]),
  marks: scene('marks', 'Fresh Chalk, Old Name', 'The platform marks show a load count from yesterday, not a passenger schedule. A small “L” means local freight. The marks are fresh enough that someone still services the spur.', [
    { id: 'marksRoom', label: 'Check the open waiting room', next: 'room' },
    { id: 'marksWorker', label: 'Ask the track worker who made them', next: 'worker' },
  ]),
  room: scene('room', 'The Public Notice Board', 'A notice asks workers to leave freight under the awning for a weekly cart. The old station book lies on a public shelf with its cover open; no personal papers or sealed office are exposed.', [
    { id: 'readBook', label: 'Read the public station book', next: 'book' },
    { id: 'lookAwning', label: 'Inspect the freight awning', next: 'awning' },
    { id: 'roomLeave', label: 'Leave the station as you found it', next: 'discovery' },
  ]),
  worker: scene('worker', 'A Spur Kept for Freight', 'The track worker says the passenger stop closed when a newer station opened east. A weekly medicine and mail cart still uses the spur, so the lamp is kept dark except on freight day.', [
    { id: 'workerAsk', label: 'Ask who is allowed to collect freight', next: 'book' },
    { id: 'workerAwning', label: 'Check the public loading awning', next: 'awning' },
  ]),
  book: scene('book', 'A Route Kept off the Timetable', 'The public book records weekly deliveries to the mining families north of the spur. No passenger names are listed. The last entry notes a delayed medicine crate but no theft or emergency.', [
    { id: 'bookFindCrate', label: 'Check whether the medicine arrived', next: 'awning', effects: { knowledge: ['The forgotten station remains active for weekly mail and medicine freight even though passenger service ended.'] } },
    { id: 'bookCopy', label: 'Copy the schedule and close the book', next: 'discovery' },
  ]),
  awning: scene('awning', 'A Crate under Canvas', 'A medicine crate sits under the awning with its seal intact. The cart arrives on freight day; the station is forgotten by passengers, not abandoned by the families it serves.', [
    { id: 'awningWait', label: 'Wait for the local cart to collect it', next: 'payoff' },
    { id: 'awningNotify', label: 'Tell the track worker the crate is sound', next: 'payoff', effects: { historyFlags: ['checked a medicine delivery at a disused station'] } },
  ]),
  payoff: scene('payoff', 'The Cart Comes at Noon', 'The local cart collects the sealed crate and leaves a signed note in the book. The medicine will reach the northern families on the route it has used for years.', [{ id: 'stationFinish', label: 'Take the main line road onward', next: 'discovery' }]),
  discovery: end('discovery', 'Forgotten by the Schedule', 'The station is an active freight link hidden by a passenger timetable. The book and chalk marks explain its use; no secret train or criminal operation was needed.'),
  leave: end('leave', 'Back to the Main Line', 'You leave the quiet spur without entering the locked freight room. The platform is swept and the lamp remains dark.'),
}, 'platform', 'disused rail spur');

export const THE_CAVE_WITH_WORKED_STONE = E('the-cave-with-worked-stone', 'The Cave with Worked Stone', 'Natural limestone gives way to a hand-cut passage above the creek.', 'travel/exploration', 'HIGH', 'A cave reveals human work and conflicting possible uses; the traveler can retreat at the first narrow passage.', {
  mouth: scene('mouth', 'A Straight Edge in the Rock', 'A natural cave opens above a dry creek. Ten paces inside, a straight chisel line cuts across the limestone. Your lantern is lit; the air is still near the mouth, and no voice answers from beyond the mark.', [
    { id: 'inspectCut', label: 'Inspect the worked stone from the entrance', next: 'cut' },
    { id: 'markMouth', label: 'Mark the entrance and leave', next: 'leave' },
    { id: 'stepInside', label: 'Follow the cut passage carefully', next: 'passage' },
  ]),
  cut: scene('cut', 'Tool Marks, Not a Door', 'The chisel marks run in parallel rows and stop at a low arch. This is a worked passage, not a natural crack. Old charcoal flecks may be from a work crew; nothing here proves burial or ritual.', [
    { id: 'cutReturn', label: 'Record the marks and return outside', next: 'discovery', effects: { knowledge: ['The cave’s straight passage was cut by hand, but the tool marks alone do not identify its purpose.'] } },
    { id: 'cutUnder', label: 'Crawl beneath the low arch', next: 'passage' },
  ]),
  passage: scene('passage', 'Beyond the Low Arch', 'The passage slopes to a small chamber with a dry storage niche and a second opening above the creek. A stone brace has cracked; grit falls from it when the wind moves outside. The exit back is still clear.', [
    { id: 'chamberNiche', label: 'Inspect the storage niche', next: 'niche' },
    { id: 'chamberUpper', label: 'Look toward the creek opening', next: 'upper' },
    { id: 'chamberLeave', label: 'Turn back before the brace shifts', next: 'discovery' },
  ], 'warning'),
  niche: scene('niche', 'A Dry Place for Tools', 'The niche contains a broken hand drill and a clay lamp. No valuables remain. A maker’s stamp on the drill matches an old quarry mark used in this district.', [
    { id: 'nicheRecord', label: 'Copy the quarry mark and retreat', next: 'discovery', effects: { knowledge: ['The cave was likely used by a quarry crew; a broken hand drill bears the local quarry mark.'] } },
    { id: 'nicheDeeper', label: 'Search behind the stone brace', hint: 'The brace is cracked and loose grit is falling.', chance: { probability: 0.48, successNext: 'upper', failureNext: 'braceSlip', successMessage: 'You find the upper opening beyond the brace.', failureMessage: 'The brace shifts and blocks part of the passage.', failureEffects: { health: -2 } } },
  ], 'warning'),
  upper: scene('upper', 'A Second Way Out', 'The upper opening exits onto the creek bank beyond a thorn thicket. It is a real second exit, but the drop is shoulder-high and the stone lip is narrow. The entrance route remains safer.', [
    { id: 'upperClimb', label: 'Climb out to the creek bank', chance: { probability: 0.66, successNext: 'discovery', failureNext: 'climbInjury', successMessage: 'You reach the bank without striking the stone lip.', failureMessage: 'You land hard on the creek gravel.', failureEffects: { health: -2 } } },
    { id: 'upperBack', label: 'Return through the worked passage', next: 'discovery' },
  ], 'warning'),
  braceSlip: scene('braceSlip', 'The Brace Moves', 'Stone shifts and partly blocks the niche. You retreat toward the entrance with a scraped shoulder; the upper opening is still visible but no longer safe to reach from here.', [{ id: 'braceBack', label: 'Follow your marks out of the cave', next: 'discovery', effects: { health: -1 } }], 'danger'),
  climbInjury: scene('climbInjury', 'A Hard Landing', 'You reach the creek bank with a bruised ankle. The worked passage remains above you; the entrance route can no longer be seen from the thicket, but the daylight direction leads back downstream.', [{ id: 'climbGo', label: 'Follow the creek back to the road', next: 'discovery', effects: { health: -1 } }], 'warning'),
  discovery: end('discovery', 'A Quarry Crew’s Passage', 'The tool marks and drill suggest a quarry crew cut the passage, though its later use is unknown. You leave with a location and an honest uncertainty, not a treasure claim.'),
  leave: end('leave', 'The Mark at the Entrance', 'You mark the cave mouth and continue. The worked line remains a clue for another day; there was no need to cross it to leave safely.'),
}, 'mouth', 'limestone cave', ['threshold exploration', 'optional secondary exit', 'retreat before deeper hazard']);

export const THE_LOST_PAYROLL = E('the-lost-payroll', 'The Lost Payroll', 'A faded story about a vanished pay chest gains one piece of new evidence.', 'investigation/mystery', 'MODERATE', 'The search separates credible records from a repeated legend; the cache may be empty or not exist.', {
  notice: scene('notice', 'A Date in the Work Ledger', 'A retired rail hand shows you an old ledger entry: a payroll chest was marked delivered to an unfinished siding, then crossed out. A local story says it was buried near the creek. Two other searchers have asked about the same date.', [
    { id: 'askRailHand', label: 'Ask what “crossed out” meant', next: 'ledger' },
    { id: 'followCreek', label: 'Check the unfinished siding', next: 'siding' },
    { id: 'speakSearchers', label: 'Ask the other searchers what they know', next: 'rivals' },
    { id: 'leavePayroll', label: 'Leave the old story alone', next: 'leave' },
  ]),
  ledger: scene('ledger', 'A Reversed Delivery', 'The rail hand says “crossed out” usually meant the chest was returned to the pay office, not hidden. The clerk who wrote the entry died years ago, and no receipt survives.', [
    { id: 'ledgerOffice', label: 'Check the old pay office record', next: 'office' },
    { id: 'ledgerSiding', label: 'Inspect the unfinished siding anyway', next: 'siding' },
  ]),
  siding: scene('siding', 'A Track that Never Opened', 'The siding stops at a low embankment and has no platform. A shallow depression beside it may be a drainage trench, not a grave. The other searchers arrive with a hand-drawn map copied from the same ledger story.', [
    { id: 'sidingCompare', label: 'Compare the map to the rail marks', next: 'rivals' },
    { id: 'sidingTrench', label: 'Inspect the drainage trench', next: 'trench' },
    { id: 'sidingStop', label: 'Stop before disturbing the embankment', next: 'discovery' },
  ]),
  rivals: scene('rivals', 'Three People, One Rumor', 'The other searchers are siblings of a former rail clerk. They want proof of what happened to their family’s wages, not necessarily coin. Their map marks the same trench but cannot distinguish it from the drainage cut.', [
    { id: 'rivalsOffice', label: 'Take the ledger date to the pay office', next: 'office' },
    { id: 'rivalsDig', label: 'Dig where the map marks the trench', hint: 'The embankment is loose and the mark may be a drain.', next: 'trench' },
  ]),
  trench: scene('trench', 'Water, Not a Chest', 'The depression is a drainage trench lined with old stone. It carries water beneath the siding. You find a brass payroll seal in the silt, but no chest; the seal could have fallen from a returned delivery.', [
    { id: 'trenchPreserve', label: 'Keep the seal and stop digging', next: 'discovery', effects: { knowledge: ['The alleged payroll trench was a drain; a brass seal there supports a delivery return but proves no hidden chest.'] } },
    { id: 'trenchSearch', label: 'Search the embankment beyond the drain', hint: 'Further digging risks a small collapse and may damage the old track.', chance: { probability: 0.4, successNext: 'discovery', failureNext: 'trenchSlip', successMessage: 'You find only old ballast and an intact drainage channel.', failureMessage: 'Loose ballast slides into the cut.', failureEffects: { health: -1 } } },
  ]),
  office: scene('office', 'The Paymaster’s Duplicate', 'An old duplicate book records the chest returned to the pay office the same week. The account was paid out later under the rail hand’s signature. The lost-payroll story began with a crossed-out delivery, not a buried fortune.', [{ id: 'officeShare', label: 'Show the siblings the duplicate entry', next: 'discovery', effects: { knowledge: ['The payroll chest was returned and paid out later; the crossed-out siding entry did not record a burial.'], historyFlags: ['resolved a lost-payroll legend with a pay-office record'] } }]),
  trenchSlip: scene('trenchSlip', 'The Embankment Gives', 'A small slide fills part of the drain. You escape with a bruised wrist; the brass seal remains in your pocket only if you preserved it earlier.', [{ id: 'slipLeave', label: 'Leave the trench to the rail crew', next: 'discovery', effects: { health: -1 } }], 'warning'),
  discovery: end('discovery', 'No Chest beneath the Siding', 'The record shows the payroll was returned and paid. The siblings gain an answer about their ancestor’s account; the rumored chest is not found, and the drainage cut is left intact.'),
  leave: end('leave', 'The Legend Left Behind', 'You leave before searching the siding. The payroll story remains a story, and no one has asked you to disturb the rail embankment.'),
}, 'notice', 'rail siding');

export const THE_HOUSE_UNDER_THE_HILL = E('the-house-under-the-hill', 'The House under the Hill', 'A slide exposes one buried wall of an old house and a dangerous entrance.', 'survival', 'SEVERE', 'A newly exposed house presents a narrowing exit window and a choice between records, belongings, and retreat.', {
  slope: scene('slope', 'A Window in the Earth', 'A landslide has exposed the upper half of a stone house beneath the hill. The slope above it is cracked and still shedding pebbles. Through a broken window you can see a table and a stair going down; daylight reaches only the upper room.', [
    { id: 'markSlope', label: 'Mark the crack and fetch the landholder', next: 'landholder' },
    { id: 'lookWindow', label: 'Inspect the upper room from outside', next: 'room' },
    { id: 'enterHouse', label: 'Enter through the exposed window', hint: 'The slope is still moving; a second slide could seal the opening.', next: 'upper' },
    { id: 'leaveHill', label: 'Leave before the hill shifts again', next: 'leave' },
  ], 'warning'),
  landholder: scene('landholder', 'The Hill’s Old House', 'The landholder says the house was abandoned after the spring flood undermined its lower wall. A family record book may remain inside, but the hill has slid twice this week.', [
    { id: 'landholderWait', label: 'Ask the landholder to brace the window', next: 'room' },
    { id: 'landholderRetreat', label: 'Leave the records for a safer day', next: 'leave' },
  ]),
  room: scene('room', 'A Table under Soil', 'The table is trapped against the uphill wall; a drawer hangs open with damp papers inside. The stair descends under the hill, but no support is visible at its first turn. The window remains the only clear exit.', [
    { id: 'takePapers', label: 'Take the loose papers from the window side', next: 'papers' },
    { id: 'checkStair', label: 'Look down the stair from the threshold', next: 'stair' },
    { id: 'roomRetreat', label: 'Leave without entering farther', next: 'discovery' },
  ], 'warning'),
  upper: scene('upper', 'Inside the Exposed Room', 'The window remains behind you. A family name is carved into the table; the drawer holds a deed fragment and a child’s wooden toy. The lower stair is dark, and grit now falls steadily from the ceiling.', [
    { id: 'upperPapers', label: 'Take the deed fragment and retreat', next: 'papers' },
    { id: 'upperToy', label: 'Take the small toy for the landholder', next: 'papers' },
    { id: 'upperDown', label: 'Descend toward the lower room', hint: 'The ceiling is shedding grit and the stair has no visible support.', chance: { probability: 0.46, successNext: 'stair', failureNext: 'slide', successMessage: 'The first steps hold beneath your weight.', failureMessage: 'The stair shifts as soil falls across the window.', failureEffects: { health: -2 } } },
    { id: 'upperOut', label: 'Climb back through the window now', next: 'discovery' },
  ], 'danger'),
  papers: scene('papers', 'A Name and a Flood Date', 'The deed fragment names the household and records a move to higher ground after the flood. The toy belongs to the same family; it is not a hidden treasure. The hill continues to settle.', [{ id: 'paperReturn', label: 'Return the papers or toy to the landholder', next: 'discovery', effects: { knowledge: ['The buried house was abandoned after a spring flood undermined the lower wall; the family moved uphill.'], historyFlags: ['recovered a family deed fragment from a landslide-exposed house'] } }]),
  stair: scene('stair', 'The Lower Turn', 'The stair reaches a room still buried in earth. A narrow air gap continues beyond the turn, but the ceiling there is unsupported. You can retreat with the upper-room evidence or take one more look.', [
    { id: 'stairBack', label: 'Return to the window with what you found', next: 'discovery' },
    { id: 'stairDeeper', label: 'Crawl under the low stone arch', hint: 'The only exit is behind you and the ceiling is unsupported.', chance: { probability: 0.38, successNext: 'lowerRoom', failureNext: 'slide', successMessage: 'You reach a small dry niche below the stair.', failureMessage: 'The ceiling drops across the turn.', failureEffects: { health: -3 } } },
  ], 'danger'),
  lowerRoom: scene('lowerRoom', 'A Dry Niche', 'The niche holds a jar of seed corn and a rusted key. The jar is spoiled by damp; the key opens nothing you can identify. The return stair is still visible but dust is thickening.', [
    { id: 'lowerReturn', label: 'Take the key and climb out', next: 'discovery', effects: { knowledge: ['A small lower niche held seed storage and an unidentified key, not valuables.'] } },
    { id: 'lowerStay', label: 'Search behind the fallen boards', hint: 'The exit is narrowing and the hill continues to move.', chance: { probability: 0.32, successNext: 'discovery', failureNext: 'slide', successMessage: 'You find a second family mark before turning back.', failureMessage: 'The passage closes under fresh soil.', failureEffects: { health: -3 } } },
  ], 'danger'),
  slide: scene('slide', 'The Window Narrows', 'Earth pours across the exposed room. You can still reach the window if you move now; anything left below will stay buried until the slope is secured.', [
    { id: 'slideClimb', label: 'Climb through the remaining window', chance: { probability: 0.56, successNext: 'discovery', failureNext: 'houseDeath', successMessage: 'You reach the slope as the opening narrows.', failureMessage: 'The window is buried before you clear the sill.', failureEffects: { health: -3 } } },
    { id: 'slideDig', label: 'Dig beneath the settling lintel', hint: 'The lintel is carrying loose soil and may collapse.', chance: { probability: 0.22, successNext: 'discovery', failureNext: 'houseDeath', successMessage: 'You open a gap through the loose edge.', failureMessage: 'The lintel drops with the next slide.', failureEffects: { health: -4 } } },
  ], 'danger'),
  discovery: end('discovery', 'A Household Moved Uphill', 'The exposed rooms show a family left after a flood damaged the foundation. The landholder will mark the slope closed until it is shored. You leave with only the paper, toy, or knowledge you actually recovered.'),
  leave: end('leave', 'The Hill Still Moves', 'You leave without entering. The opening remains unstable, and the landholder is warned that the slope needs shoring before anyone searches the lower rooms.'),
  houseDeath: end('houseDeath', 'Buried Window', 'The hill gives way over the only open exit.', 'death'),
}, 'slope', 'landslide-exposed house', ['threshold then optional descent', 'narrowing retreat window', 'stateful evidence recovery']);

export const THE_RIVERBOAT_CACHE = E('the-riverboat-cache', 'The Riverboat Cache', 'A wreck’s cargo locker emerges as the river drops, claimed by more than one person.', 'salvage/property', 'HIGH', 'A river wreck creates competing salvage claims and a limited safe window; a rumored cache may hold records instead of valuables.', {
  bank: scene('bank', 'A Locker above the Waterline', 'A riverboat wreck lies against a gravel bank. Falling water has exposed a metal locker in the stern. A ferryman says the boat belonged to a trading company; a local farmer says the wreck drifted from his land. The current is still pulling at loose boards.', [
    { id: 'askFerryman', label: 'Ask what the boat carried', next: 'claims' },
    { id: 'checkMark', label: 'Read the company mark from shore', next: 'mark' },
    { id: 'tieRope', label: 'Secure a line to the locker', requirements: { usableItems: ['travelRope'] }, next: 'secured', effects: { damageItems: ['travelRope'] } },
    { id: 'leaveWreck', label: 'Leave the wreck for its owners', next: 'leave' },
  ], 'warning'),
  claims: scene('claims', 'Two Claims, No Receipt', 'The ferryman says the company never recovered the boat after a flood. The farmer says the stern has rested against his bank for years. Neither has a salvage paper; the locker is still partly under water.', [
    { id: 'claimsCompany', label: 'Find the company mark on the hull', next: 'mark' },
    { id: 'claimsWait', label: 'Wait for the water to drop farther', next: 'window' },
    { id: 'claimsOpen', label: 'Try to open the locker now', hint: 'The hull shifts when the current catches it.', next: 'secured' },
  ]),
  mark: scene('mark', 'A Trading House Stamp', 'A faded stamp matches a trading house still operating upstream. The farmer’s bank may establish where the wreck sits, but the hull mark identifies who owned the boat. The locker may be salvage, cargo, or abandoned records.', [
    { id: 'markAskHouse', label: 'Ask the trading house for its claim', next: 'window' },
    { id: 'markSecure', label: 'Secure the locker before water rises', next: 'secured' },
  ]),
  window: scene('window', 'The Current Turns', 'The trading house confirms the boat was lost, but asks that any papers be returned before cargo is claimed. The current is rising against the stern; the locker is accessible only while the wreck stays pinned.', [
    { id: 'windowSecure', label: 'Tie the locker before opening it', requirements: { usableItems: ['travelRope'] }, next: 'secured', effects: { damageItems: ['travelRope'] } },
    { id: 'windowRetreat', label: 'Leave before the stern shifts', next: 'discovery' },
    { id: 'windowRisk', label: 'Reach the locker without a line', hint: 'The stern is shifting and the water is rising.', chance: { probability: 0.41, successNext: 'contents', failureNext: 'riverFall', successMessage: 'You reach the locker while the wreck holds.', failureMessage: 'The stern swings away from the bank.', failureEffects: { health: -2 } } },
  ], 'warning'),
  secured: scene('secured', 'A Line on the Stern', 'The rope steadies the locker but cannot hold the whole wreck. The lid is jammed by silt. You can work the hinge from the bank or stop now and let the owners bring proper tackle.', [
    { id: 'openLocker', label: 'Work the locker lid from the bank', next: 'contents' },
    { id: 'securedStop', label: 'Leave it tied for the trading house', next: 'discovery' },
  ]),
  contents: scene('contents', 'A Book in Oilskin', 'The locker contains an oilskin ledger, two corroded trade weights, and no coin. The ledger lists cargo delivered before the wreck and a small shipment marked “returned to sender.”', [
    { id: 'contentsLedger', label: 'Return the ledger to the trading house', next: 'resolved', effects: { knowledge: ['The riverboat locker held an oilskin cargo ledger and trade weights, not a cache of coin.'], historyFlags: ['returned a riverboat cargo ledger to its trading house'] } },
    { id: 'contentsWeights', label: 'Show the farmer the salvage weights', next: 'resolved' },
    { id: 'contentsKeep', label: 'Leave all contents with the hull', next: 'resolved' },
  ]),
  riverFall: scene('riverFall', 'The Stern Turns Out', 'The wreck shifts and water closes over the locker. You scramble onto the gravel bank with a bruised shoulder. The rope is damaged only if you used it; the ledger remains out of reach.', [{ id: 'fallReport', label: 'Tell both claimants the hull shifted', next: 'discovery', effects: { health: -1 } }], 'warning'),
  resolved: scene('resolved', 'Salvage Recorded', 'The trading house records the ledger and weights as recovered freight. The farmer is paid only if the company confirms the wreck rested on his bank; the river has taken the remaining loose cargo.', [{ id: 'riverFinish', label: 'Leave the salvage list with the company', next: 'salvaged' }]),
  discovery: end('discovery', 'The River Keeps the Rest', 'The wreck’s history is clearer, but no treasure is guaranteed. The river remains the strongest claimant to anything not recovered before the water rose.'),
  salvaged: end('salvaged', 'Cargo Account Closed', 'The ledger corrects a long-missing shipment entry. The trading house records what was found; no one claims the corroded weights are valuable, and the wreck is left for a proper salvage crew.'),
  leave: end('leave', 'No Claim Taken', 'You leave the wreck alone. Its owner and the farmer can settle salvage rights before anyone opens the locker.'),
}, 'bank', 'river wreck', ['salvage rights', 'time-window exploration', 'provenance resolution']);

export const THE_LAST_ROOM_IN_THE_FORT = E('the-last-room-in-the-fort', 'The Last Room in the Fort', 'A forgotten inventory lists one room that was never opened after the garrison left.', 'history/exploration', 'MODERATE', 'A mostly grounded fort exploration separates documentary discovery from military treasure hunting.', {
  gate: scene('gate', 'The Room without an Entry', 'The old fort is now a county storehouse. A caretaker shows you an inventory with one room marked “sealed pending review.” The corridor is open, but the iron door is still locked. The document says nothing about a hidden weapon or treasure.', [
    { id: 'askCaretaker', label: 'Ask why the room stayed sealed', next: 'account' },
    { id: 'readInventory', label: 'Compare the room number to the plan', next: 'plan' },
    { id: 'leaveFort', label: 'Leave the storehouse alone', next: 'leave' },
  ]),
  account: scene('account', 'A Disputed Store Room', 'The caretaker says two old inventories list different room numbers. One was written after a fever outbreak; the other after the garrison left. The county clerk can authorize opening it, but is not expected until tomorrow.', [
    { id: 'accountWait', label: 'Wait for the clerk’s written permission', next: 'permission' },
    { id: 'accountPlan', label: 'Check the public floor plan', next: 'plan' },
    { id: 'accountLeave', label: 'Return when the clerk is present', next: 'leave' },
  ]),
  plan: scene('plan', 'Room Seven on the Plan', 'The plan places room seven beside the old infirmary, not the armory. A narrow vent leads outside; a date on its stone matches the fever inventory. The door can be opened only with the caretaker’s key.', [
    { id: 'planPermission', label: 'Ask the clerk to authorize the key', next: 'permission' },
    { id: 'planVent', label: 'Inspect the vent from the courtyard', next: 'vent' },
  ]),
  vent: scene('vent', 'A Vent for Air', 'The vent is too narrow to enter. Dust and paper fibers at the opening suggest the room was aired, not bricked shut. You can return the observation to the caretaker or wait for the clerk.', [
    { id: 'ventReport', label: 'Tell the caretaker the vent is clear', next: 'permission', effects: { knowledge: ['The sealed fort room was beside the infirmary, and its vent remained open for air.'] } },
    { id: 'ventLeave', label: 'Leave the door unopened', next: 'leave' },
  ]),
  permission: scene('permission', 'The Clerk Arrives', 'The clerk compares the plans and authorizes the caretaker to open the door with a witness present. The room may contain public stores or private effects; the inventory will be read before anything is moved.', [
    { id: 'openRoom', label: 'Witness the room inventory', next: 'room' },
    { id: 'waitOutside', label: 'Wait outside while they open it', next: 'records' },
  ]),
  room: scene('room', 'A Room of Field Blankets', 'The room holds folded blankets, a broken cot, and a packet of letters addressed to a field surgeon. No weapons or payroll lie inside. The letters have been kept dry but are private until the clerk identifies their owner.', [
    { id: 'roomLetters', label: 'Ask the clerk to identify the letters', next: 'records' },
    { id: 'roomCount', label: 'Record the blankets and cot only', next: 'discovery' },
  ]),
  records: scene('records', 'A Fever Ward, Briefly', 'The letters show room seven served as a temporary infirmary during the fever year. The blankets were counted as public stores; the letters belong to a surgeon’s descendants. The fort inventory omitted the room because it was sealed during the review.', [{ id: 'fortRecord', label: 'Return the letters for family notice', next: 'discovery', effects: { knowledge: ['Room seven at the old fort was a temporary infirmary during a fever year, not an armory.'], historyFlags: ['helped open and correctly inventory a sealed fort room'] } }]),
  discovery: end('discovery', 'An Inventory Completed', 'The county adds room seven to the fort record. The blankets remain public property and the letters are referred to the surgeon’s family. The room’s history matters more than anything hidden inside.'),
  leave: end('leave', 'A Door Still Sealed', 'You leave the room closed until the clerk can be present. The inventory remains incomplete, but no private property is disturbed.'),
}, 'gate', 'abandoned military post', ['document-led exploration', 'permission before entry', 'historical reveal']);

export const LOST_PLACES_ADVENTURES: Scenario[] = [THE_MAP_IN_THE_LEDGER, THE_TOWN_THAT_MOVED, THE_OLD_SURVEY_STONE, THE_SEALED_MINE_OFFICE, THE_ROOM_BEHIND_THE_CHIMNEY, THE_ISLAND_WHEN_THE_WATER_FALLS, THE_FORGOTTEN_STATION, THE_CAVE_WITH_WORKED_STONE, THE_LOST_PAYROLL, THE_HOUSE_UNDER_THE_HILL, THE_RIVERBOAT_CACHE, THE_LAST_ROOM_IN_THE_FORT];
