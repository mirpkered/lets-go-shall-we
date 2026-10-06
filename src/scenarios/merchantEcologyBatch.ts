import type { Choice, Scene, Scenario } from '../types';
import { KNOWLEDGE_FACTS } from '../knowledgeFacts';

type StockGear = { id: string; label: string; price: number; hint: string };
type StockSupply = { id: string; label: string; price: number; quantity: number; hint: string };
type Stock = StockGear | StockSupply;

function isSupply(stock: Stock): stock is StockSupply { return 'quantity' in stock; }

function purchase(stock: Stock, next: string, history: string): Choice {
  const priceText = `${stock.price} coin${stock.price === 1 ? '' : 's'}`;
  return {
    id: `buy_${stock.id}`,
    label: `Buy ${stock.label} — ${priceText}`,
    hint: stock.hint,
    requirements: isSupply(stock)
      ? { minMoney: stock.price, canAddSupplies: { [stock.id]: stock.quantity } }
      : { minMoney: stock.price, notOwnedItems: [stock.id] },
    next,
    effects: {
      money: -stock.price,
      ...(isSupply(stock) ? { gainSupplies: { [stock.id]: stock.quantity } } : { gainItems: [stock.id] }),
      historyFlags: [history],
    },
  };
}

function sale(id: string, label: string, price: number, history: string, next: string): Choice {
  return {
    id: `sell_${id}`,
    label: `Sell your ${label} for ${price} coin${price === 1 ? '' : 's'}`,
    hint: 'Only an item you are carrying can be sold; the Bank is not part of this table.',
    requirements: { gear: [id] },
    next,
    effects: { money: price, loseItems: [id], historyFlags: [history] },
  };
}

function ending(id: string, title: string, text: string): Scene {
  return { id, title, text, ending: 'success', choices: [] };
}

function merchant(config: {
  id: string; title: string; subtitle: string; entryTitle: string; entryText: string;
  stockTitle: string; stockText: string; stock: Stock[]; sellerText?: string;
  sales?: { id: string; label: string; price: number; history: string }[];
  departure: string; itemHistoryPrefix: string;
}): Scenario {
  const stockChoices = config.stock.map((item) => purchase(item, `receipt_${item.id}`, `${config.itemHistoryPrefix}_${item.id}`));
  const scenes: Scenario['scenes'] = {
    entry: {
      id: 'entry', title: config.entryTitle, tone: 'safe', text: config.entryText,
      choices: [
        { id: 'browseStock', label: 'Look over the posted stock and prices', next: 'stock' },
        ...(config.sales?.length ? [{ id: 'offerCarriedGear', label: 'Ask whether they will buy a tool you carry', next: 'buyer' }] : []),
        ...(config.id === 'the-retired-lampwright' ? [{ id: 'askAboutWick', label: 'Ask about the numbered wick you carry', requirements: { items: ['numberedLanternWick'] }, next: 'wickHistory' }] : []),
        { id: 'leaveMerchant', label: 'Thank the seller and move on', next: 'departure' },
      ],
    },
    stock: {
      id: 'stock', title: config.stockTitle, tone: 'safe', text: config.stockText,
      choices: [...stockChoices, { id: 'leaveStock', label: 'Leave the stock untouched', next: 'departure' }],
    },
    departure: ending('departure', 'On the Road Again', config.departure),
  };
  if (config.id === 'the-retired-lampwright') {
    scenes.wickHistory = {
      id: 'wickHistory', title: 'A Record, Not a Key', tone: 'safe',
      text: 'The lampwright recognizes the brass tag from an old travelers’ office. The numbered wick marked a registered refuge room; its number was never a key or a signal by itself. They cannot say why the cellar lamp was relit, but the tag records how the inn once guided people cut off by weather.',
      choices: [{ id: 'rememberWickSystem', label: 'Keep the lampwright’s explanation in mind', next: 'wickAccount', effects: { knowledgeEntries: [KNOWLEDGE_FACTS.numberedRefugeLampSystem] } }],
    };
    scenes.wickAccount = ending('wickAccount', 'An Old System, Carefully Read', 'You keep the numbered wick. Its place in an old refuge system is clearer, while the reason it was removed remains unknown.');
  }
  if (config.sales?.length) {
    scenes.buyer = {
      id: 'buyer', title: 'A Narrow Buying List', tone: 'safe', text: config.sellerText ?? 'The buyer names only the kinds of tools their workbench can use. They will pay for one carried item, not for anything left in the Bank.',
      choices: [
        ...config.sales.map((item) => sale(item.id, item.label, item.price, item.history, 'departure')),
        { id: 'keepYourGear', label: 'Keep what you brought', next: 'departure' },
      ],
    };
  }
  for (const item of config.stock) {
    scenes[`receipt_${item.id}`] = ending(
      `receipt_${item.id}`,
      `A Purchase Made: ${item.label}`,
      `You pay ${item.price} coin${item.price === 1 ? '' : 's'} and take the ${item.label}. The seller has no claim on it now; it is yours to carry.`,
    );
  }
  return {
    id: config.id,
    title: config.title,
    subtitle: config.subtitle,
    startScene: 'entry',
    diversity: { depthClass: 'ENCOUNTER', riskTier: 'LOW' },
    scenes,
  };
}

const sidingBoard = merchant({
  id: 'the-siding-tool-board', title: 'The Siding Tool Board', subtitle: 'A railway repair hand sells sound duplicates before transferring posts.',
  entryTitle: 'The Last Freight Siding',
  entryText: 'A rail repair hand is clearing the tool board before transfer. The posted tools are checked and priced individually; none is company property once sold. A separate tray is for small, well-kept tools travelers no longer need.',
  stockTitle: 'Tools for the Next Shift',
  stockText: 'The board holds a Pocket Toolkit for five coins, a Foreman’s Multi-tool for four, and a Joiner’s Folding Rule for three. The seller explains the differences rather than claiming one tool does every job.',
  stock: [
    { id: 'pocketToolkit', label: 'Pocket Toolkit', price: 5, hint: 'Small railway kit for careful fittings and minor repairs.' },
    { id: 'foremanMultiTool', label: 'Foreman’s Multi-tool', price: 4, hint: 'A heavier worksite tool for rugged adjustment.' },
    { id: 'joinersFoldingRule', label: 'Joiner’s Folding Rule', price: 3, hint: 'For measuring and layout, not general repair.' },
  ],
  sales: [
    { id: 'foremanMultiTool', label: 'Foreman’s Multi-tool', price: 2, history: 'sold_foreman_multitool_to_siding_hand' },
    { id: 'joinersFoldingRule', label: 'Joiner’s Folding Rule', price: 1, history: 'sold_folding_rule_to_siding_hand' },
  ],
  sellerText: 'The rail hand can use another multi-tool or folding rule for the next crew. Their offer is lower than the sale price because they will inspect and recondition it.',
  departure: 'The repair hand boards the tools that changed hands and leaves the rest for the next crew. The siding remains an ordinary work stop.',
  itemHistoryPrefix: 'bought_at_siding_board',
});

const ferryLocker = merchant({
  id: 'the-ferrymans-locker', title: 'The Ferryman’s Locker', subtitle: 'Practical line gear changes hands beside a crossing that closes at dusk.',
  entryTitle: 'At the Landing',
  entryText: 'The ferryman is replacing worn line gear before the autumn current rises. A dry locker holds three checked pieces for sale. He buys back only rope hardware and load gear he can use on this landing.',
  stockTitle: 'Line and Load', stockText: 'The Travel Rope is four coins, the Iron Rope Clamp three, and the Freightman’s Strap three. Each has been inspected for the job it was made to do.',
  stock: [
    { id: 'travelRope', label: 'Travel Rope', price: 4, hint: 'A sound twenty-foot line with a locking hook.' },
    { id: 'ironRopeClamp', label: 'Iron Rope Clamp', price: 3, hint: 'Secures a line where a wet knot is unreliable.' },
    { id: 'freightmansStrap', label: 'Freightman’s Strap', price: 3, hint: 'For binding awkward cargo, not anchoring a person.' },
  ],
  sales: [
    { id: 'travelRope', label: 'Travel Rope', price: 2, history: 'sold_travel_rope_at_ferry_landing' },
    { id: 'ironRopeClamp', label: 'Iron Rope Clamp', price: 1, history: 'sold_iron_rope_clamp_at_ferry_landing' },
  ],
  sellerText: 'The ferryman will buy one serviceable line or clamp for the public crossing. His price reflects the wear he will check before putting it back to work.',
  departure: 'The next crossing takes its turn while the sun is still up. You leave with what you chose to carry and no obligation to the ferryman.',
  itemHistoryPrefix: 'bought_at_ferryman_locker',
});

const doctorsCart = merchant({
  id: 'the-doctors-road-cart', title: 'The Doctor’s Road Cart', subtitle: 'A traveling medical worker has a few practical items, not a general store.',
  entryTitle: 'A Cart at the Waypost',
  entryText: 'A district medical worker has stopped to restock at the waypost. The cart’s small list is posted plainly. A clean bandage roll is sealed; the gloves and match case are kept for rough roads and night calls.',
  stockTitle: 'Roadside Precautions', stockText: 'One Field Bandage Roll costs two coins, Heavy Leather Gloves two, and a Windproof Match Case two. The worker recommends only what has a clear use.',
  stock: [
    { id: 'fieldBandageRoll', label: 'Field Bandage Roll', price: 2, hint: 'Clean gauze for practical first aid; it is not medicine.' },
    { id: 'heavyLeatherGloves', label: 'Heavy Leather Gloves', price: 2, hint: 'Thick leather for rough rope, splinters, and hot fittings.' },
    { id: 'windproofMatchCase', label: 'Windproof Match Case', price: 2, hint: 'A few matches kept dry; the supply is finite.' },
  ],
  departure: 'The medical worker closes the case and continues along the district road. The brief stop changes no one’s care or obligation.',
  itemHistoryPrefix: 'bought_at_doctors_cart',
});

const roadsideTinker = merchant({
  id: 'the-roadside-tinker', title: 'The Roadside Tinker', subtitle: 'A careful peddler sells small tools from a repaired wagon.',
  entryTitle: 'The Wagon under the Lean-to',
  entryText: 'A tinker has pulled beneath a lean-to to straighten a bent axle pin. A narrow case holds a few tested tools at fixed prices. The tinker will buy back a tool only if it fits the repair work they do.',
  stockTitle: 'Small Tools, Tested', stockText: 'The Compact Wheel Wrench is four coins, the Steel Wedge three, and the Brass Bottle Opener one. None is claimed as a substitute for a proper smith or carpenter.',
  stock: [
    { id: 'compactWheelWrench', label: 'Compact Wheel Wrench', price: 4, hint: 'For wheel hubs, bolts, and field adjustments.' },
    { id: 'steelWedge', label: 'Steel Wedge', price: 3, hint: 'Holds a brace or door; it does not repair broken timber.' },
    { id: 'brassBottleOpener', label: 'Brass Bottle Opener', price: 1, hint: 'A small opener with limited leverage.' },
  ],
  sales: [
    { id: 'compactWheelWrench', label: 'Compact Wheel Wrench', price: 2, history: 'sold_wheel_wrench_to_roadside_tinker' },
    { id: 'steelWedge', label: 'Steel Wedge', price: 1, history: 'sold_steel_wedge_to_roadside_tinker' },
  ],
  sellerText: 'The tinker can reuse one wheel wrench or wedge after checking for cracks and bent jaws. The offer is modest, and the item leaves your kit if you accept.',
  departure: 'The tinker’s wagon rolls on once the axle pin is straight. The tool case is latched for the next stop.',
  itemHistoryPrefix: 'bought_at_roadside_tinker',
});

const farmGate = merchant({
  id: 'the-farm-gate-auction', title: 'The Farm Gate Auction', subtitle: 'A retiring stockman sells tools that still have work left in them.',
  entryTitle: 'The Last Lot before Supper',
  entryText: 'A farmhand is helping a neighbor sell a small lot of surplus gear before moving to another county. The tools are ordinary, honestly described, and sold one at a time. The buyer’s list is limited to things the farm can reuse.',
  stockTitle: 'The Farm Lot', stockText: 'A Gate Hook and Farm Whistle each cost two coins; Heavy Leather Gloves cost three. The gloves have a sound palm but visible wear.',
  stock: [
    { id: 'gateHook', label: 'Gate Hook', price: 2, hint: 'For lifting latches and drawing wire clear of a gate.' },
    { id: 'farmWhistle', label: 'Farm Whistle', price: 2, hint: 'A low call for livestock and farmhands.' },
    { id: 'heavyLeatherGloves', label: 'Heavy Leather Gloves', price: 3, hint: 'Useful for rough farm work; not protective armor.' },
  ],
  sales: [
    { id: 'gateHook', label: 'Gate Hook', price: 1, history: 'sold_gate_hook_at_farm_auction' },
    { id: 'farmWhistle', label: 'Farm Whistle', price: 1, history: 'sold_farm_whistle_at_farm_auction' },
  ],
  sellerText: 'The farmhand wants a spare hook or whistle for the next hired worker. The offer is for one item only; the rest of your kit stays yours.',
  departure: 'The lot closes before supper. The neighbor carries the unsold tools back to the shed, not into an unclaimed pile.',
  itemHistoryPrefix: 'bought_at_farm_gate_auction',
});

const hillOutfitter = merchant({
  id: 'the-hill-outfitter', title: 'The Hill Outfitter', subtitle: 'A trail keeper sells compact navigation gear before the ridge road.',
  entryTitle: 'The Last Roof before the Ridge',
  entryText: 'At a roofed trail post, a keeper is replacing the signboard before winter. A locked chest contains a small, fixed stock of road tools. The ridge remains passable without buying anything; the gear is for travelers who prefer to prepare.',
  stockTitle: 'A Few Tools for the Ridge', stockText: 'A Trail Compass costs three coins, a Folding Trail Marker two, and a Roadside Signal Mirror four. Light, visibility, and line of sight still matter.',
  stock: [
    { id: 'trailCompass', label: 'Trail Compass', price: 3, hint: 'A steady bearing in poor visibility, not a map.' },
    { id: 'foldingTrailMarker', label: 'Folding Trail Marker', price: 2, hint: 'A durable marker for making a return route visible.' },
    { id: 'roadsideSignalMirror', label: 'Roadside Signal Mirror', price: 4, hint: 'Useful only with light, open sky, and a visible receiver.' },
  ],
  sales: [
    { id: 'trailCompass', label: 'Trail Compass', price: 2, history: 'sold_trail_compass_at_hill_post' },
    { id: 'roadsideSignalMirror', label: 'Roadside Signal Mirror', price: 2, history: 'sold_signal_mirror_at_hill_post' },
    { id: 'climbingPitons', label: 'Climbing Pitons', price: 2, history: 'sold_climbing_pitons_at_hill_post' },
  ],
  sellerText: 'The keeper accepts one compass or signal mirror for the rescue post, or a set of pitons for the ridge crew. A folded marker is too site-specific for the store.',
  departure: 'You continue along the marked public road. The keeper returns the signboard to its post before the light fades.',
  itemHistoryPrefix: 'bought_at_hill_outfitter',
});

const winterInn = merchant({
  id: 'the-winter-inn-clearance', title: 'The Winter Inn Clearance', subtitle: 'A keeper releases a few surplus travel goods after the cold snap.',
  entryTitle: 'Stores after the Frost',
  entryText: 'The inn has received its winter shipment and is clearing duplicate travel goods from a dry storeroom. The keeper posts each item and price. Nothing is borrowed from the emergency reserve kept for stranded guests.',
  stockTitle: 'Surplus Travel Goods', stockText: 'A Wool Travel Blanket costs three coins, a Weatherproof Blanket four, and a Windproof Match Case two. The keeper demonstrates the waxed outer layer and the match case seal.',
  stock: [
    { id: 'woolTravelBlanket', label: 'Wool Travel Blanket', price: 3, hint: 'Warmth on a cold road; not waterproof.' },
    { id: 'weatherproofBlanket', label: 'Weatherproof Blanket', price: 4, hint: 'A compact blanket that holds off cold rain.' },
    { id: 'windproofMatchCase', label: 'Windproof Match Case', price: 2, hint: 'A few dry matches, not a lasting fire.' },
  ],
  sales: [
    { id: 'woolTravelBlanket', label: 'Wool Travel Blanket', price: 2, history: 'sold_wool_blanket_at_winter_inn' },
    { id: 'weatherproofBlanket', label: 'Weatherproof Blanket', price: 2, history: 'sold_weatherproof_blanket_at_winter_inn' },
  ],
  sellerText: 'The keeper will take one blanket in clean condition for the common room. Emergency blankets are not bought or sold here.',
  departure: 'The inn keeps its emergency reserve intact and returns to its evening routine. The road outside has not become safer or harsher because of the sale.',
  itemHistoryPrefix: 'bought_at_winter_inn',
});

const quarryTable = merchant({
  id: 'the-quarry-survey-table', title: 'The Quarry Survey Table', subtitle: 'A retiring surveyor sells the tools they have finished using.',
  entryTitle: 'The Ledger before the Move',
  entryText: 'A surveyor is closing a rented table at the quarry office before moving to another district. They will sell a few personal tools after demonstrating them. The marked survey instruments are not quarry property or site plans.',
  stockTitle: 'For Reading Work, Not Ownership', stockText: 'An Assayer’s Loupe costs three coins, a Collapsible Sounding Rod four, and a Bridgewright’s Hammer three. The seller gives the tool’s limits along with its purpose.',
  stock: [
    { id: 'assayersLoupe', label: 'Assayer’s Loupe', price: 3, hint: 'Reads fine marks and small details; it does not identify ownership.' },
    { id: 'collapsibleSoundingRod', label: 'Collapsible Sounding Rod', price: 4, hint: 'Tests depth and hollow ground from firm footing; never a climbing support.' },
    { id: 'bridgewrightHammer', label: 'Bridgewright’s Hammer', price: 3, hint: 'Sets pegs and makes careful small repairs.' },
  ],
  sales: [
    { id: 'assayersLoupe', label: 'Assayer’s Loupe', price: 2, history: 'sold_assayers_loupe_at_quarry_table' },
    { id: 'bridgewrightHammer', label: 'Bridgewright’s Hammer', price: 1, history: 'sold_bridgewright_hammer_at_quarry_table' },
  ],
  sellerText: 'The surveyor can use one loupe or hammer as a spare after checking it. A sounding rod is too specialized for their remaining assignments.',
  departure: 'The surveyor wraps the remaining instruments and closes the ledger. The quarry’s work continues under its own crew.',
  itemHistoryPrefix: 'bought_at_quarry_survey_table',
});

const lampwright = merchant({
  id: 'the-retired-lampwright', title: 'The Retired Lampwright', subtitle: 'An old repairer sells ordinary lamps and recognizes one unusual tag.',
  entryTitle: 'The Lampwright’s Shed',
  entryText: 'A retired lampwright is clearing a small repair shed before the lease ends. Three ordinary lights remain on the shelf at fixed prices. A narrow bench is reserved for one personal tool the lampwright can reuse.',
  stockTitle: 'Lights for Ordinary Work', stockText: 'A Roadman’s Lantern costs three coins, a Miner’s Headlamp five, and a Windproof Match Case two. They are practical lights and ignition supplies, not occult protection.',
  stock: [
    { id: 'roadmansLantern', label: 'Roadman’s Lantern', price: 3, hint: 'A shuttered lantern that steadies its flame in wet air.' },
    { id: 'minerHeadlamp', label: 'Miner’s Headlamp', price: 5, hint: 'A steady carbide beam, with its burner and reflector intact.' },
    { id: 'windproofMatchCase', label: 'Windproof Match Case', price: 2, hint: 'Keeps a few matches dry; the supply is finite.' },
  ],
  sales: [
    { id: 'roadmansLantern', label: 'Roadman’s Lantern', price: 2, history: 'sold_roadmans_lantern_to_lampwright' },
    { id: 'windproofMatchCase', label: 'Windproof Match Case', price: 1, history: 'sold_match_case_to_lampwright' },
  ],
  sellerText: 'The lampwright can clean one lantern or match case for use in the remaining work. Their offer reflects the worn seals on old traveling gear.',
  departure: 'The retired lampwright shutters the shed. A lamp can help someone see; it cannot tell them what is waiting in the dark.',
  itemHistoryPrefix: 'bought_at_lampwright_shed',
});

const chapelStores = merchant({
  id: 'the-chapel-restoration-shelf', title: 'The Chapel Restoration Shelf', subtitle: 'A caretaker sells clearly prepared materials left from threshold work.',
  entryTitle: 'After the Threshold Repair',
  entryText: 'The caretaker has finished restoring the chapel’s old entry and set aside a few prepared materials. The marked chalk and sealed salt were blessed for this threshold; the cold-iron fasteners came from its dismantled warded frame. They are ordinary, specific supplies—not general protections.',
  stockTitle: 'Small Prepared Quantities', stockText: 'One marked stick of Ritual Chalk costs one coin, one sealed packet of Consecrated Salt one, and two Cold-Iron Nails two. Each has one limited, context-specific use.',
  stock: [
    { id: 'ritualChalk', label: 'Ritual Chalk ×1', price: 1, quantity: 1, hint: 'For one careful boundary or sign.' },
    { id: 'consecratedSalt', label: 'Consecrated Salt ×1', price: 1, quantity: 1, hint: 'A sealed pinch prepared for a specific ward.' },
    { id: 'coldIronNails', label: 'Cold-Iron Nails ×2', price: 2, quantity: 2, hint: 'For a known protective fastening, not as a weapon.' },
  ],
  departure: 'The caretaker records which supplies left the shelf and locks the remainder away. The chapel is open without requiring any purchase.',
  itemHistoryPrefix: 'bought_at_chapel_restoration_shelf',
});

export const FIXED_STOCK_MERCHANTS: Scenario[] = [
  sidingBoard, ferryLocker, doctorsCart, roadsideTinker, farmGate,
  hillOutfitter, winterInn, quarryTable, lampwright, chapelStores,
];

export const RETIRED_LAMPWRIGHT = lampwright;
