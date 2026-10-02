import type { CombatPresence, Scenario } from '../types';
import { largeAdventure, largeEnd as end, largeScene as scene, largeTags as tags } from './largeContentTools';

const W = (id: string, title: string, subtitle: string, activity: string, risk: 'MODERATE' | 'HIGH' | 'SEVERE', hook: string, scenes: Scenario['scenes'], start: string, role = 'traveler/passenger', authoredCombat?: CombatPresence) => {
  const allowedActivities = ['labor/repair', 'rescue/care', 'survival', 'negotiation/trade', 'investigation/mystery', 'travel/exploration', 'social interaction', 'animals', 'combat/defense', 'puzzle/problem-solving', 'moral prioritization', 'communication/witness'];
  const activityTag = allowedActivities.includes(activity) ? activity : 'investigation/mystery';
  const sceneText = `${title} ${subtitle} ${Object.values(scenes).map(({ title: sceneTitle, text, choices }) => `${sceneTitle} ${text} ${choices.map(({ label, hint }) => `${label} ${hint ?? ''}`).join(' ')}`).join(' ')}`;
  const setting = /bar|jail|street|table|mother|poster|creek|red creek|town/i.test(sceneText) ? 'town/market/inn' : 'road/bridge';
  const combat = authoredCombat ?? (/(armed|revolver|firearm|gunman|shot|weapon)/i.test(sceneText) ? 'AVOIDABLE' : 'NONE');
  return largeAdventure(id, title, subtitle, tags({ hook, activity: activityTag, role, tone: 'tense/dangerous', risk, setting, combat, structures: ['branching narrative', 'multi-stage sequence'], outcomes: ['success/partial success', 'walk-away/refusal', ...(risk === 'HIGH' || risk === 'SEVERE' ? ['escape/survival', 'costly success/no-perfect-outcome possible'] : [])] }), start, scenes);
};

export const WANTED_IN_RED_CREEK = W('wanted-in-red-creek', 'Wanted in Red Creek', 'A wanted notice describes a traveler who could be you—or half the road.', 'mistaken identity', 'MODERATE', 'A vague poster turns resemblance into public suspicion until witnesses and a real sighting change the question.', {
  street: scene('street', 'The Poster on the Pump', 'A deputy stops you beside a wanted poster. The fugitive is described as wearing a dark coat and carrying a canvas bag—both common. The reward is large, but the sketch has no clear scar or mark. A shopkeeper has seen the actual fugitive near the livery.', [
    { id: 'giveName', label: 'Give your name and ask what is known', next: 'questions' },
    { id: 'showTravelNote', label: 'Show your dated travel receipt', next: 'receipt', requirements: { anyItems: ['railwayMap'] } },
    { id: 'askShopkeeper', label: 'Ask the shopkeeper about the sighting', next: 'sighting' },
    { id: 'leaveCreek', label: 'Decline and leave town', next: 'leave' },
  ]),
  questions: scene('questions', 'Not Quite the Same Face', 'The deputy admits the sketch was copied from a hurried statement. A ranch hand says the wanted person limps; you have not been asked to prove anything, only whether you saw someone near the livery.', [
    { id: 'stateNoLimp', label: 'Say what you know, not what you guess', next: 'sighting', effects: { historyFlags: ['gave a careful account during a mistaken-identity inquiry'] } },
    { id: 'askForWitness', label: 'Ask the deputy to hear the ranch hand', next: 'witnesses' },
    { id: 'walkQuestions', label: 'Leave before rumor becomes a charge', next: 'leave' },
  ]),
  receipt: scene('receipt', 'A Dated Arrival', 'The receipt shows you reached Red Creek after the reported robbery. The deputy checks its date and admits the poster cannot be used to hold you. The shopkeeper still remembers a limping rider near the livery.', [
    { id: 'receiptTell', label: 'Pass the livery sighting to the deputy', next: 'sighting' },
    { id: 'receiptGo', label: 'Ask for the receipt back and go', next: 'cleared' },
  ]),
  sighting: scene('sighting', 'A Rider at the Livery', 'The shopkeeper saw a rider with a torn right sleeve leave behind the livery. The poster shows neither a limp nor a torn sleeve. The deputy can ask the stable hand, but the rider may already be on the south road.', [
    { id: 'askStableHand', label: 'Ask the stable hand what left town', next: 'stableEvidence' },
    { id: 'sendDeputy', label: 'Give the deputy the rider’s direction', next: 'warrant' },
    { id: 'leaveSighting', label: 'Leave the search to the deputy', next: 'cleared' },
  ]),
  witnesses: scene('witnesses', 'Two Accounts', 'The ranch hand confirms a limp; the shopkeeper saw a torn sleeve but not the rider’s face. Together they narrow the description without proving who committed the robbery.', [
    { id: 'witnessFindStable', label: 'Check the livery’s departure book', next: 'stableEvidence' },
    { id: 'witnessCaution', label: 'Ask the deputy not to name a suspect yet', next: 'cleared' },
  ]),
  stableEvidence: scene('stableEvidence', 'A Horse Paid in Cash', 'The stable hand remembers a rider matching both details. The horse was paid for under a false name and headed south. It is evidence of a hurried departure, not proof of the robbery.', [
    { id: 'stableSend', label: 'Give the details to the deputy', next: 'warrant', effects: { knowledge: ['A limping rider with a torn right sleeve left Red Creek south on a bay horse; the sighting is not proof of guilt.'] } },
    { id: 'stableLeave', label: 'Leave without making an accusation', next: 'cleared' },
  ]),
  warrant: scene('warrant', 'A Search, Not a Verdict', 'The deputy sends a rider south to check the description. No one arrests the person on the strength of a coat alone. Your own resemblance is no longer the only account in town.', [{ id: 'warrantGo', label: 'Take the north road out of Red Creek', next: 'cleared' }]),
  leave: end('leave', 'No Charge Made', 'You leave before the deputy can turn a resemblance into a claim. The real fugitive remains unidentified; your departure is not treated as guilt.'),
  cleared: end('cleared', 'A Description Is Not Proof', 'The deputy removes your name from the inquiry. The rider on the south road may be the fugitive, but only further evidence can establish that. You leave with your own identity intact.'),
}, 'street');

export const THE_MAN_AT_THE_END_OF_THE_BAR = W('the-man-at-the-end-of-the-bar', 'The Man at the End of the Bar', 'An armed stranger asks the room about someone who has your name.', 'crime/tension', 'HIGH', 'A single-room threat makes position, information, and a safe exit more valuable than bravado.', {
  bar: scene('bar', 'A Question over the Glasses', 'A man at the end of the bar keeps one hand beside a revolver and asks the keeper whether anyone named you has come through. The keeper does not know your name. The rear kitchen door is open; two ranch hands are playing cards by the front windows.', [
    { id: 'quietKitchen', label: 'Leave through the kitchen while he looks away', next: 'backAlley' },
    { id: 'askReason', label: 'Ask why he is looking for that name', next: 'answer' },
    { id: 'tellKeeper', label: 'Ask the keeper to stand as a witness', next: 'witnesses' },
    { id: 'drawFirst', label: 'Reach for the revolver', hint: 'His hand is already beside a loaded weapon; drawing may be fatal.', chance: { probability: 0.28, successNext: 'gunTurn', failureNext: 'barDeath', successMessage: 'You knock the table into his arm and reach the kitchen door.', failureMessage: 'He fires before you can reach him.', failureEffects: { health: -5 } } },
  ], 'danger'),
  answer: scene('answer', 'A Name from the Freight Book', 'The man says a freight clerk claimed you carried a missing strongbox. You have not seen a strongbox. He wants you to ride with him to the depot; the keeper says the clerk is in town and can be asked.', [
    { id: 'askClerk', label: 'Ask to hear the clerk’s account here', next: 'clerk' },
    { id: 'refuseRide', label: 'Refuse to leave the room with him', next: 'witnesses' },
    { id: 'offerExit', label: 'Walk out with both ranch hands watching', next: 'backAlley' },
  ], 'warning'),
  witnesses: scene('witnesses', 'The Room Takes Notice', 'The keeper and ranch hands have turned toward the stranger. His revolver remains on the bar, not yet drawn. The front door opens onto the lit street; the kitchen exit reaches a narrow alley.', [
    { id: 'witnessStreet', label: 'Leave by the lit front door', next: 'streetSafe' },
    { id: 'witnessClerk', label: 'Ask the keeper to fetch the clerk', next: 'clerk' },
    { id: 'witnessConfront', label: 'Tell him to put the gun away', hint: 'A direct challenge may make him draw.', chance: { probability: 0.52, successNext: 'gunTurn', failureNext: 'barDeath', successMessage: 'The witnesses close in and he backs away from the weapon.', failureMessage: 'He draws before the keeper can speak.', failureEffects: { health: -4 } } },
  ]),
  clerk: scene('clerk', 'The Clerk’s Mistake', 'The clerk arrives and admits the strongbox was loaded onto another coach. He described the messenger by a name that sounded like yours. The armed man has been threatening the wrong traveler, but his hand is still near the revolver.', [
    { id: 'clerkDemandApology', label: 'Ask him to leave with the clerk', next: 'streetSafe', effects: { historyFlags: ['stood witness while a false accusation was corrected'] } },
    { id: 'clerkSlipOut', label: 'Use the distraction to leave safely', next: 'backAlley' },
  ]),
  backAlley: scene('backAlley', 'Behind the Kitchen', 'You reach the alley without crossing the man’s reach. His voice continues inside, but no shot follows. A stable boy has seen the exchange and can carry word to the constable if you choose to report it.', [
    { id: 'alleyReport', label: 'Ask the stable boy to find the constable', next: 'streetSafe' },
    { id: 'alleyLeave', label: 'Leave town while the road is clear', next: 'safeEnd' },
  ]),
  gunTurn: scene('gunTurn', 'The Weapon Falls', 'The revolver skids beneath a table. The man is alive, the keeper has called the constable, and the ranch hands keep distance rather than attack him.', [{ id: 'gunLeave', label: 'Leave the room before the constable arrives', next: 'safeEnd' }]),
  streetSafe: scene('streetSafe', 'Outside the Bar', 'The constable arrives with the clerk’s correction. The armed stranger is disarmed and held for questioning about the threats, not for the missing strongbox. Your name is entered as a witness, not a suspect.', [{ id: 'barWitness', label: 'Give a short account, then go', next: 'safeEnd', effects: { knowledge: ['The missing strongbox was placed on another coach; the barroom threat began with a mistaken name.'] } }]),
  safeEnd: end('safeEnd', 'No Ride to the Depot', 'You leave under your own power. The clerk’s account corrects the accusation; the man’s threat remains a separate matter for the constable. You did not need to draw a weapon to keep your name.'),
  barDeath: end('barDeath', 'The First Shot', 'The revolver fires before you can get behind cover.', 'death'),
}, 'bar', 'traveler/passenger');

export const THE_STAGE_WAS_HIT = W('the-stage-was-hit', 'The Stage Was Hit', 'A robbed coach waits on the road with injured passengers and one empty seat.', 'rescue/care', 'HIGH', 'At a fresh robbery scene, the traveler must choose rescue, warning, pursuit, or guarding evidence.', {
  coach: scene('coach', 'The Empty Driver’s Seat', 'A stagecoach stands skewed across the road. The driver is conscious with a cut brow; a passenger holds a broken wrist; a third seat is empty. The horses are still hitched and trembling. Fresh hoofprints lead west, while the next town lies east.', [
    { id: 'treatPassenger', label: 'Help the passenger with the broken wrist', next: 'passengerHelp', effects: { historyFlags: ['assisted injured passengers after a stage robbery'] } },
    { id: 'steadyHorses', label: 'Hold the team while the driver climbs down', next: 'teamSteady' },
    { id: 'followHooves', label: 'Follow the westbound hoofprints', next: 'tracks' },
    { id: 'rideTown', label: 'Take the driver’s horse to warn town', next: 'townWarn' },
  ], 'warning'),
  passengerHelp: scene('passengerHelp', 'A Wrist Set against a Splint', 'The passenger can walk once the wrist is supported. The driver says the missing traveler was taken west on foot, but no one knows whether the robbers are still nearby. The horses are calmer now.', [
    { id: 'helpMissing', label: 'Search the roadside for the missing passenger', next: 'tracks' },
    { id: 'helpWarnTown', label: 'Send word to the next town', next: 'townWarn' },
    { id: 'helpStayCoach', label: 'Stay with the injured until help arrives', next: 'survivors' },
  ]),
  teamSteady: scene('teamSteady', 'The Horses Stop Shaking', 'The team stands at the roadside while the driver gets down. He points out the missing passenger’s hat in the dust; the westbound tracks may belong to the robbers or to the person who ran.', [
    { id: 'steadySearch', label: 'Look for a second set of footprints', next: 'tracks' },
    { id: 'steadyWarn', label: 'Take a horse to the town for help', next: 'townWarn' },
    { id: 'steadyGuard', label: 'Keep the coach and passengers together', next: 'survivors' },
  ]),
  tracks: scene('tracks', 'Two Lines in the Dust', 'One set of hoofprints turns west; a lighter set of bootprints leaves the road toward a shallow wash. The wash is close and visible, but the riders are farther away. Pursuing the riders means leaving the injured passengers behind.', [
    { id: 'searchWash', label: 'Check the nearby wash for the passenger', next: 'passengerFound' },
    { id: 'pursueRobbers', label: 'Follow the riders toward the ridge', hint: 'They may be armed and have a head start.', chance: { probability: 0.4, successNext: 'riderSight', failureNext: 'pursuitCutOff', successMessage: 'You glimpse the riders before they reach the ridge.', failureMessage: 'The tracks divide in rocky ground and you lose their direction.', failureEffects: { health: -1 } } },
    { id: 'tracksReturn', label: 'Return and keep the injured together', next: 'survivors' },
  ]),
  passengerFound: scene('passengerFound', 'The Passenger in the Wash', 'The missing passenger hid under the bank with a bruised shoulder. They saw one robber fall from a horse but cannot say whether the rider was injured or captured. The survivors can travel east only after the team is checked.', [
    { id: 'bringPassenger', label: 'Bring them back to the coach', next: 'survivors', effects: { setFlags: ['stagePassengerFound'] } },
  ]),
  riderSight: scene('riderSight', 'A Rider at the Ridge', 'You see one rider leading a loose horse over the ridge. They have not seen you. The missing passenger is still unaccounted for, and the coach party needs help.', [
    { id: 'rideBack', label: 'Return to the coach with the direction', next: 'survivors', effects: { knowledge: ['One rider left the robbed stagecoach west toward the ridge; the missing passenger’s location was separate.'] } },
    { id: 'callRider', label: 'Call out from behind the stone bank', next: 'pursuitCutOff' },
  ]),
  pursuitCutOff: scene('pursuitCutOff', 'No Safe Shot', 'The riders disappear into broken ground. You return without a capture; the stage passengers are still waiting, and no one was harmed by a chase.', [{ id: 'cutOffReturn', label: 'Go back to the coach', next: 'survivors' }]),
  townWarn: scene('townWarn', 'Word Ahead', 'The town sends a constable and a doctor back along the road. They can take the injured and secure the coach, but the missing traveler may move before anyone searches the wash.', [{ id: 'warnJoinSearch', label: 'Join the doctor’s search along the wash', next: 'passengerFound' }, { id: 'warnStay', label: 'Stay with the injured passengers', next: 'survivors' }]),
  survivors: scene('survivors', 'The Coach Party Regroups', 'The driver, injured passenger, and missing traveler are counted separately. The horses are safe if steadied; the strongbox is gone. A town doctor is on the road if you sent warning.', [{ id: 'stageAccount', label: 'Give the constable the details you saw', next: 'stageEnd', effects: { historyFlags: ['gave aid and a careful account after a stage robbery'] } }]),
  stageEnd: end('stageEnd', 'The Road Is Not a Pursuit', 'The coach party travels east under escort. The robbers may remain free, the strongbox is lost, and the missing passenger is safe only if found. Your account helps the town search without turning a glimpse into a conviction.'),
}, 'coach');

export const THE_BOUNTY_POSTER = W('the-bounty-poster', 'The Bounty Poster', 'A generous reward is offered for a person whose guilt is not settled by the paper.', 'moral prioritization', 'MODERATE', 'A wanted notice tempts the traveler to profit from incomplete and possibly false information.', {
  notice: scene('notice', 'A Reward with Small Print', 'A poster offers thirty coins for a local named Tomas Vale, accused of stealing a rancher’s horse. The sketch resembles a man you spoke with at a water stop, but the printed charge includes no witness statement. The rancher is at the livery; a schoolteacher says she saw Tomas returning a horse.', [
    { id: 'askRancher', label: 'Ask the rancher what was taken', next: 'rancher' },
    { id: 'askTeacher', label: 'Hear the teacher’s account first', next: 'teacher' },
    { id: 'seekTomas', label: 'Find Tomas before anyone else does', next: 'roadside' },
    { id: 'ignorePoster', label: 'Leave the notice alone', next: 'leave' },
  ]),
  rancher: scene('rancher', 'One Horse, Two Stories', 'The rancher says a bay mare vanished overnight and Tomas had worked nearby. He admits he never saw Tomas take it. He wants the reward to cover the lost animal, but the mare may have been returned.', [
    { id: 'rancherTeacher', label: 'Ask the teacher when she saw the mare', next: 'teacher' },
    { id: 'rancherPost', label: 'Tell the rancher not to claim more than he saw', next: 'rancherWait', effects: { historyFlags: ['questioned an unverified bounty claim'] } },
    { id: 'rancherSearch', label: 'Check the livery for the bay mare', next: 'livery' },
  ]),
  teacher: scene('teacher', 'Returned before Sunrise', 'The teacher saw Tomas lead a bay mare to the livery before sunrise. She does not know whether it was the rancher’s horse or whether permission had been given. Her account does not prove theft, but it gives a place to check.', [
    { id: 'teacherLivery', label: 'Ask the livery keeper to identify the mare', next: 'livery' },
    { id: 'teacherMeet', label: 'Speak with Tomas before the rancher', next: 'roadside' },
    { id: 'teacherLeave', label: 'Refuse to claim a reward without proof', next: 'leave' },
  ]),
  roadside: scene('roadside', 'Tomas by the Fence', 'Tomas says the rancher lent him the mare to carry a sick child, then changed his mind after she returned. He can name the child’s household. The poster offers payment for capture, not for asking questions.', [
    { id: 'askHousehold', label: 'Check the child’s household account', next: 'witness' },
    { id: 'tellTomasLeave', label: 'Tell Tomas to settle it with the rancher', next: 'rancherWait' },
    { id: 'takeTomas', label: 'Bring Tomas to the livery for questioning', next: 'livery', effects: { setFlags: ['bountyTomasHeld'] } },
  ]),
  livery: scene('livery', 'The Mare at the Rail', 'The bay mare is in a stall with a fresh blanket, but the brand is hidden beneath the mane. The keeper says both men handled the horse this morning and cannot say who owns it.', [
    { id: 'liveryBrand', label: 'Ask the rancher to show the mare’s mark', next: 'witness' },
    { id: 'liveryNoClaim', label: 'Leave the horse and decline the bounty', next: 'leave' },
  ]),
  witness: scene('witness', 'A Household Remembers', 'The child’s family confirms Tomas brought the mare to carry the child during the night. The rancher had lent her but expected her before dawn. The charge may have grown from a missed return, not a theft.', [
    { id: 'witnessTellRancher', label: 'Tell the rancher the full account', next: 'rancherWait', effects: { knowledge: ['Tomas used the bay mare to carry a sick child with the rancher’s permission; the dispute was over the late return.'] } },
    { id: 'witnessKeepQuiet', label: 'Leave the bounty unclaimed', next: 'leave' },
  ]),
  rancherWait: scene('rancherWait', 'The Poster Comes Down', 'The rancher hears the account and withdraws the theft claim, though he still wants the mare returned earlier next time. The reward is not paid. Tomas agrees to mend the stable fence as repayment for the delay.', [{ id: 'bountyClose', label: 'Leave them to settle the fence work', next: 'settled' }]),
  leave: end('leave', 'No Reward Claimed', 'You leave without turning a resemblance or a poster into proof. Tomas’s status remains uncertain to you; the rancher and teacher may still disagree about the mare.'),
  settled: end('settled', 'A Claim Corrected', 'No bounty changes hands. The horse returns to the ranch, the child’s family keeps its privacy, and the traveler’s account helped replace an accusation with a practical debt.'),
}, 'notice');

export const THE_EMPTY_JAIL = W('the-empty-jail', 'The Empty Jail', 'A jailer leaves you beside one prisoner and fails to return.', 'crime/tension', 'HIGH', 'A prisoner’s account, an empty cell, and a possibly corrupt jailer make restraint costly and uncertain.', {
  cell: scene('cell', 'The Key on the Desk', 'The jailer asks you to watch the single prisoner while he checks a broken wagon. He leaves the cell key on the desk and does not return after half an hour. The prisoner says the charge is a land dispute; a fresh bruise shows beneath one eye.', [
    { id: 'askPrisoner', label: 'Ask for the prisoner’s account', next: 'account' },
    { id: 'waitJailer', label: 'Wait beside the locked cell', next: 'wait' },
    { id: 'sendDeputy', label: 'Find another town officer', next: 'officer' },
    { id: 'openCell', label: 'Unlock the cell and step aside', next: 'release' },
  ]),
  account: scene('account', 'A Bruise without a Record', 'The prisoner says the jailer’s cousin claims a spring the prisoner has used for years. There is no charge sheet on the desk. You have heard one side only; the prisoner asks you not to leave them alone with the jailer.', [
    { id: 'accountOfficer', label: 'Find the town clerk to check the charge', next: 'officer' },
    { id: 'accountWait', label: 'Keep the door locked until the jailer returns', next: 'wait' },
    { id: 'accountRelease', label: 'Open the cell and take them to the clerk', next: 'release' },
  ]),
  wait: scene('wait', 'A Bootstep in the Hall', 'A bootstep pauses outside, then moves away. The prisoner remains inside. You can see the street through the barred window; the key is still on the desk, and no officer has answered your call.', [
    { id: 'waitClerk', label: 'Leave to find the town clerk', next: 'officer' },
    { id: 'waitRelease', label: 'Open the door and walk to the clerk together', next: 'release' },
    { id: 'waitStay', label: 'Stay until someone arrives', next: 'jailerBack' },
  ]),
  officer: scene('officer', 'The Clerk’s Book', 'The clerk finds no charge entered for the prisoner. The jailer has authority to hold someone briefly, but not without recording why. The clerk agrees to go with you rather than send you back alone.', [
    { id: 'clerkReturn', label: 'Return to the jail with the clerk', next: 'jailerBack' },
    { id: 'clerkRelease', label: 'Ask the clerk to open the cell', next: 'release' },
  ]),
  release: scene('release', 'Outside the Cell', 'The prisoner steps into the hall but does not run. The clerk is on the way if you found them; the jailer may return with a different account. The prisoner agrees to wait in the public office, not disappear into the road.', [
    { id: 'releaseOffice', label: 'Walk with them to the public office', next: 'recorded' },
    { id: 'releaseRoad', label: 'Let them leave town now', hint: 'Without a charge record, leaving avoids a false hold but may look like flight.', next: 'departed' },
  ]),
  jailerBack: scene('jailerBack', 'The Jailer Returns', 'The jailer returns with a split lip and says the prisoner attacked him. The clerk finds no entry in the book and asks both of them to wait apart while a constable is called.', [
    { id: 'jailerClerk', label: 'Give the clerk what you observed', next: 'recorded', effects: { historyFlags: ['witnessed an unrecorded detention and asked for a written account'] } },
    { id: 'jailerLeave', label: 'Leave before the dispute becomes violent', next: 'departed' },
  ]),
  recorded: scene('recorded', 'A Charge Put on Paper', 'The clerk records the detention and the jailer’s account. The prisoner is released pending a hearing because the original charge was never entered. The bruise is noted; no one declares who caused it.', [{ id: 'jailEnd', label: 'Leave the clerk to finish the record', next: 'jailEnd' }]),
  departed: end('departed', 'An Unsettled Door', 'You leave without deciding whether the prisoner’s story or the jailer’s was complete. The town must answer for an empty charge book; the prisoner’s road and the jailer’s complaint remain unresolved.'),
  jailEnd: end('jailEnd', 'A Cell Left Empty', 'The prisoner leaves under the clerk’s written release. The jailer remains on duty while the town reviews his account. Your part was to insist that a claim be recorded, not to decide the land dispute.'),
}, 'cell');

export const THREE_MEN_AT_THE_WATER_TROUGH = W('three-men-at-the-water-trough', 'Three Men at the Water Trough', 'Three armed strangers mistake you for someone they expect.', 'crime/tension', 'HIGH', 'Observation and misdirection can avoid a fight, but three visible firearms make a wrong move dangerous.', {
  trough: scene('trough', 'A Name You Do Not Know', 'Three riders wait beside a public water trough. Each has a revolver in a holster; none is drawn. One calls you “Cal” and says the others have been waiting on your word. The road behind you is open, and a freight wagon is approaching from the west.', [
    { id: 'askWhoCal', label: 'Ask who they believe you are', next: 'question' },
    { id: 'playAlong', label: 'Ask what word they are waiting for', next: 'bluff' },
    { id: 'warnWagon', label: 'Signal the wagon to take the far road', next: 'wagon' },
    { id: 'backAway', label: 'Step back toward the open road', next: 'retreat' },
  ], 'warning'),
  question: scene('question', 'The Wrong Coat', 'One rider says Cal wears a brown coat like yours. Another says the expected man has a scar across the chin; no one has looked closely at your face. Their horses are between you and the trough.', [
    { id: 'questionShowFace', label: 'Turn your face into the daylight', next: 'recognition' },
    { id: 'questionWagon', label: 'Point out the approaching freight wagon', next: 'wagon' },
    { id: 'questionLeave', label: 'Keep backing toward the road', next: 'retreat' },
  ]),
  bluff: scene('bluff', 'A Word Held Back', 'The riders say they need to know whether the south bridge is watched. You do not know. One studies your hands while another watches the road; their weapons remain holstered.', [
    { id: 'bluffFalse', label: 'Say the bridge is watched by a deputy', chance: { probability: 0.62, successNext: 'retreat', failureNext: 'challenge', successMessage: 'The riders exchange a look and decide not to risk the crossing.', failureMessage: 'One asks which deputy and where; your answer has no detail.' } },
    { id: 'bluffAsk', label: 'Ask why the bridge matters to them', next: 'challenge' },
    { id: 'bluffExit', label: 'Leave without answering', next: 'retreat' },
  ]),
  wagon: scene('wagon', 'A Witness Comes Near', 'The wagoner sees the three riders and slows. The strangers may leave now or believe you arranged an ambush. Their hands move closer to their holsters, but no weapon is drawn.', [
    { id: 'wagonClear', label: 'Tell the wagoner to keep rolling west', next: 'retreat' },
    { id: 'wagonSpeak', label: 'Call both parties to keep their hands clear', next: 'challenge' },
  ], 'danger'),
  recognition: scene('recognition', 'Not Cal', 'The rider who spoke first sees the difference and lowers his voice. The others look annoyed rather than convinced. They ask if you have seen Cal; you have not.', [
    { id: 'recognitionNo', label: 'Say you have not seen him', next: 'parting', effects: { knowledge: ['Three riders were waiting at the trough for someone called Cal, described as wearing a brown coat and chin scar.'] } },
    { id: 'recognitionLeave', label: 'Say nothing more and take the road', next: 'retreat' },
  ]),
  challenge: scene('challenge', 'Hands near Leather', 'One rider stands between you and the road. Another watches the wagon. The group has not drawn, but the distance is short and the trough leaves little cover.', [
    { id: 'handsSurrender', label: 'Raise your hands and step back', next: 'retreat' },
    { id: 'handsTalk', label: 'Offer to leave if they lower their hands', chance: { probability: 0.54, successNext: 'parting', failureNext: 'troughDeath', successMessage: 'The oldest rider waves you away.', failureMessage: 'A rider draws when the group thinks the wagon is closing in.', failureEffects: { health: -4 } } },
    { id: 'handsRun', label: 'Run for the wagon’s moving cover', hint: 'Three armed men have a clear line to the road.', chance: { probability: 0.31, successNext: 'retreat', failureNext: 'troughDeath', successMessage: 'You reach the far wheel as the wagon passes.', failureMessage: 'A shot catches you in the open.', failureEffects: { health: -5 } } },
  ], 'danger'),
  retreat: scene('retreat', 'The Open Road', 'You reach the road without crossing between the riders and their horses. They remain at the trough. The freight wagon can pass if you warned it; otherwise the driver is still approaching them.', [
    { id: 'retreatTellWagon', label: 'Warn the wagoner to keep distance', next: 'parting' },
    { id: 'retreatGo', label: 'Continue down the road alone', next: 'parting' },
  ]),
  parting: end('parting', 'Not Your Meeting', 'The strangers remain a danger to someone else, but you are no longer between them and the road. You were not Cal, and the confusion did not prove that anyone there was a criminal.'),
  troughDeath: end('troughDeath', 'At the Trough', 'A rider fires before you reach cover.', 'death'),
}, 'trough', 'traveler/passenger', 'AVOIDABLE');

export const THE_RUSTLED_HERD = W('the-rustled-herd', 'The Rustled Herd', 'Fresh hoofprints leave a pasture, but ownership is not as simple as the fence suggests.', 'property/crime', 'MODERATE', 'A herd’s deliberate movement may be theft, a worker’s choice, or a disputed claim.', {
  pasture: scene('pasture', 'An Open Gate', 'Thirty cattle are gone from a pasture. The gate is open but unbroken; hoofprints lead toward an old creek road. The rancher says every animal was his. A hired hand says several belonged to a neighbor under a share agreement.', [
    { id: 'readTracks', label: 'Follow the hoofprints to the creek road', next: 'tracks' },
    { id: 'askHand', label: 'Ask the hired hand about the agreement', next: 'agreement' },
    { id: 'inspectBrands', label: 'Compare the brands on the remaining herd', next: 'brands' },
    { id: 'declineHerd', label: 'Leave the dispute to the rancher', next: 'leave' },
  ]),
  tracks: scene('tracks', 'A Turn at the Creek', 'The hoofprints divide at the creek: one set continues toward market, while another turns to a fenced holding pasture. No blood or drag marks appear. Whoever moved the cattle knew how to keep them together.', [
    { id: 'marketTrack', label: 'Follow the trail toward market', next: 'market' },
    { id: 'holdingTrack', label: 'Check the fenced holding pasture', next: 'holding' },
    { id: 'returnTrack', label: 'Bring the split tracks back to the rancher', next: 'brands' },
  ]),
  agreement: scene('agreement', 'A Share Written in Chalk', 'The hired hand says the neighbor’s calves were to be separated after the sale, but the agreement was never copied into the ranch book. The rancher says the hand moved more cattle than agreed.', [
    { id: 'agreementNeighbor', label: 'Ask the neighbor for their count', next: 'holding' },
    { id: 'agreementBook', label: 'Check the ranch ledger for the sale', next: 'brands' },
  ]),
  brands: scene('brands', 'Two Marks in One Herd', 'The remaining cattle show two brands. The rancher’s ledger lists a sale of calves last month but does not state which animals were paid for. A buyer at market may have the bill of sale.', [
    { id: 'brandsBuyer', label: 'Ask the market buyer to check the bill', next: 'market' },
    { id: 'brandsNeighbor', label: 'Take the brands to the neighbor', next: 'holding' },
    { id: 'brandsReport', label: 'Tell both parties what the marks show', next: 'settlement' },
  ]),
  market: scene('market', 'Cattle at the Sale Yard', 'The buyer has paid for twelve calves and kept the receipt. Those animals match the smaller brand, but the buyer has not seen the rest of the herd. The rancher’s missing count is still larger than twelve.', [
    { id: 'marketReceipt', label: 'Carry the receipt back to the ranch', next: 'settlement', effects: { knowledge: ['The market buyer paid for twelve calves with the neighbor’s smaller brand; the rest of the missing herd remains unaccounted for.'] } },
    { id: 'marketFollow', label: 'Ask where the remaining cattle went', next: 'holding' },
  ]),
  holding: scene('holding', 'A Gate Shut from Inside', 'The holding pasture contains eighteen cattle, including the neighbor’s smaller brand. The neighbor says they gathered the animals to keep them from a dry creek bed; the rancher never received the message.', [
    { id: 'holdingConfer', label: 'Bring both owners together at the gate', next: 'settlement' },
    { id: 'holdingLeave', label: 'Leave the cattle held until they agree', next: 'unsettled' },
  ]),
  settlement: scene('settlement', 'A Count beside the Ledger', 'The sale receipt accounts for twelve calves; the holding pasture accounts for eighteen. The rancher’s original count was six too high. No one can prove who left the pasture gate open, but the cattle and payment now have separate records.', [{ id: 'settlementLeave', label: 'Leave the corrected count with them', next: 'settled' }]),
  leave: end('leave', 'No Trail Taken', 'You leave before joining the search. The open gate and missing herd remain the rancher’s problem; no one has shown you proof of theft.'),
  unsettled: end('unsettled', 'Held until the Count Is Settled', 'The cattle stay behind a closed gate while the rancher and neighbor compare their records. Your choice prevents another movement but does not settle ownership; both parties lose a day of work.'),
  settled: end('settled', 'The Herd Is Counted', 'The cattle are divided by brand and receipt, while the open gate remains unexplained. The traveler’s count does not prove who moved them, but it prevents a sale from being mistaken for a rustling.'),
}, 'pasture');

export const A_GUN_ON_THE_TABLE = W('a-gun-on-the-table', 'A Gun on the Table', 'Two neighbors argue over a debt with a revolver between them.', 'social tension', 'HIGH', 'An unholstered firearm makes mediation a lethal positioning problem, not a standard dispute.', {
  room: scene('room', 'Between the Accounts', 'A rancher and a former partner argue over a debt of twelve coins. A revolver lies on the table between them, unloaded only by assumption; neither has touched it. The door is behind the rancher, a window behind the partner, and you stand beside the stove.', [
    { id: 'askAccounts', label: 'Ask each to state the debt separately', next: 'accounts' },
    { id: 'moveGun', label: 'Ask them to step away from the revolver', next: 'distance' },
    { id: 'leaveRoom', label: 'Leave and call the innkeeper', next: 'outside' },
    { id: 'grabGun', label: 'Grab the revolver first', hint: 'Both parties are close enough to reach it; a sudden move may be fatal.', chance: { probability: 0.32, successNext: 'weaponSafe', failureNext: 'gunDeath', successMessage: 'You slide the weapon off the table as both men recoil.', failureMessage: 'One man reaches for the weapon at the same moment.', failureEffects: { health: -4 } } },
  ], 'danger'),
  accounts: scene('accounts', 'One Loan, Two Memories', 'The rancher says the partner borrowed twelve coins for seed. The partner says eight were repaid after harvest. Neither has a receipt. The revolver remains between them; the window and door are each within one stride.', [
    { id: 'accountsWitness', label: 'Ask the innkeeper to witness the discussion', next: 'outside' },
    { id: 'accountsSeparate', label: 'Ask them to step to opposite sides', next: 'distance' },
    { id: 'accountsLeave', label: 'Refuse to arbitrate an armed debt', next: 'outside' },
  ]),
  distance: scene('distance', 'Three Steps from the Table', 'Both men move away from the revolver, but neither leaves the room. The rancher stands near the door; the partner stands by the window. They agree to compare the old harvest book if someone fetches it.', [
    { id: 'fetchBook', label: 'Ask the innkeeper to bring the book', next: 'book' },
    { id: 'distanceTalk', label: 'Have each state what they can prove', next: 'book' },
    { id: 'distanceLeave', label: 'Leave while they remain apart', next: 'outside' },
  ]),
  outside: scene('outside', 'The Innkeeper in the Hall', 'The innkeeper stands in the hall and has heard the raised voices. They will call the constable but will not enter while the revolver is on the table. The two men remain inside.', [
    { id: 'hallCall', label: 'Ask the innkeeper to bring a witness', next: 'book' },
    { id: 'hallWait', label: 'Wait outside until they put the gun away', next: 'armedEnd' },
  ]),
  book: scene('book', 'A Mark beside the Harvest', 'The harvest book shows a payment of eight coins from the partner, but no notation that it settled the whole loan. The rancher admits he remembers the remaining amount differently. Neither has drawn the revolver.', [
    { id: 'bookInstallment', label: 'Suggest a written balance and date', next: 'weaponSafe' },
    { id: 'bookConstable', label: 'Ask the constable to witness the balance', next: 'weaponSafe' },
  ]),
  weaponSafe: scene('weaponSafe', 'The Revolver Put Away', 'The innkeeper takes the revolver only after both men step outside. The old book supports an eight-coin payment but cannot settle the remaining four. They agree to write the disputed balance rather than threaten each other over it.', [{ id: 'gunDepart', label: 'Leave them with the written account', next: 'settled' }]),
  armedEnd: end('armedEnd', 'No Judgment Made', 'You leave the debt unresolved and the revolver untouched. The innkeeper calls the constable; neither party’s version is treated as proven.'),
  settled: end('settled', 'Four Coins Still Disputed', 'The partner owes four coins if the rancher’s account is right, but the paper does not prove it. They accept a date to compare the next harvest book. No one is declared innocent or guilty, and the weapon is no longer between them.'),
  gunDeath: end('gunDeath', 'The Table Turns', 'A hand closes over the revolver before you can move clear.', 'death'),
}, 'room');

export const THE_OUTLAWS_MOTHER = W('the-outlaws-mother', 'The Outlaw’s Mother', 'A mother asks you to carry a message to her wanted son.', 'social interaction', 'MODERATE', 'A message may urge surrender, repair harm, or offer family news; carrying it is not the same as helping someone escape.', {
  porch: scene('porch', 'A Letter Folded Twice', 'At a roadside house, an older woman asks you to carry a sealed letter to her son, who is wanted for robbing a freight office. She does not ask you to hide him or help him flee. A deputy patrol passed west this morning.', [
    { id: 'askLetterPurpose', label: 'Ask what she wants the letter to say', next: 'purpose' },
    { id: 'carrySealed', label: 'Carry it unopened to the marked canyon', next: 'canyon' },
    { id: 'declineLetter', label: 'Decline to carry a message to a fugitive', next: 'decline' },
  ]),
  purpose: scene('purpose', 'News, Not a Plan', 'She says the letter tells her son his younger sister is leaving for school and asks him to return the stolen account book. She hopes he will surrender, but cannot promise he will. The letter is addressed to a waystation, not a hiding place.', [
    { id: 'carryOpen', label: 'Carry the family news as written', next: 'canyon' },
    { id: 'tellDeputy', label: 'Ask the deputy to deliver it safely', next: 'deputy' },
  ]),
  canyon: scene('canyon', 'A Man by the Dry Wash', 'The wanted man meets you in the open beside the waystation. He is unarmed in view, but a horse is saddled nearby. He asks if the deputy followed you; the letter remains sealed unless you opened it.', [
    { id: 'handLetter', label: 'Hand him the letter and step away', next: 'readLetter' },
    { id: 'askReturnBook', label: 'Ask about returning the account book', next: 'choice' },
    { id: 'refuseTransfer', label: 'Keep the letter and leave', next: 'departure' },
  ]),
  readLetter: scene('readLetter', 'The Letter Read', 'He reads the family news twice. He says the book is in the saddlebag and can be returned through the waystation, but he will not go with a deputy today. The letter has changed his plan, not erased the robbery.', [
    { id: 'bookDrop', label: 'Ask him to leave the book at the station', next: 'bookReturned' },
    { id: 'surrender', label: 'Offer to carry word that he will surrender', next: 'surrendered' },
    { id: 'leaveMan', label: 'Leave without promising anything', next: 'departure' },
  ]),
  choice: scene('choice', 'A Book in the Saddlebag', 'He admits the account book is with him and offers to return it if the family is left out of the charge. You cannot promise that. A deputy patrol may reach the waystation before night.', [
    { id: 'returnBook', label: 'Take the book to the waystation', next: 'bookReturned', effects: { knowledge: ['The wanted man offered to return the freight account book but would not surrender at the canyon.'] } },
    { id: 'reportMan', label: 'Give the deputy his location', next: 'deputy' },
    { id: 'leaveChoice', label: 'Refuse to broker the terms', next: 'departure' },
  ]),
  deputy: scene('deputy', 'The Patrol at the Waystation', 'The deputy listens and asks for only what you actually saw. He will take the letter or the returned book, but he will not promise the family immunity from questioning.', [
    { id: 'deputyLetter', label: 'Give the letter to the deputy', next: 'departure', effects: { historyFlags: ['carried family news to a wanted traveler without helping him escape'] } },
    { id: 'deputyLead', label: 'Share the canyon location', next: 'departure' },
  ]),
  bookReturned: scene('bookReturned', 'The Account Book at the Desk', 'The waystation keeper takes the freight account book and writes down who returned it. The wanted man is gone before the deputy arrives; the book may help identify what was stolen, but it does not settle his guilt.', [{ id: 'bookFinish', label: 'Leave the record with the keeper', next: 'departure', effects: { historyFlags: ['returned a freight account book through a waystation'] } }]),
  surrendered: scene('surrendered', 'A Choice Made after Reading', 'He asks for one night to reach the county seat and says he will meet the deputy there. You have no guarantee he will keep his word. The patrol can be told what he promised without calling it a surrender already completed.', [{ id: 'surrenderReport', label: 'Carry his stated intention to the deputy', next: 'departure', effects: { knowledge: ['The wanted man said he intended to meet the deputy at the county seat tomorrow; it had not happened yet.'] } }]),
  departure: end('departure', 'A Message Delivered', 'The family news reaches its destination, but the robbery remains a public matter. The man’s later choice is not yours to claim; your account records only what you carried or heard.'),
  decline: end('decline', 'A Letter Kept at Home', 'You decline the errand. The mother keeps the letter and may send it through the post. You have not helped the fugitive evade the law or accused him yourself.'),
}, 'porch');

export const THE_FALSE_DEPUTY = W('the-false-deputy', 'The False Deputy', 'A badge on a lonely road may be authority, theft, or something in between.', 'crime/authority', 'HIGH', 'A badge is a claim to authority, not proof; the traveler must weigh verification against an armed roadside demand.', {
  road: scene('road', 'A Badge at the Wheel', 'A man with a deputy’s badge stops your wagonless walk and demands a two-coin road fine for traveling after the toll gate closes. He carries a revolver but has not drawn it. A real toll house is visible up the road; a blacksmith’s shop stands behind you.', [
    { id: 'askWarrant', label: 'Ask which toll rule he is enforcing', next: 'terms' },
    { id: 'payFine', label: 'Pay the two coins and continue', requirements: { minMoney: 2 }, next: 'paid' , effects: { money: -2 } },
    { id: 'walkSmith', label: 'Walk back toward the blacksmith’s shop', next: 'smith' },
    { id: 'challengeBadge', label: 'Demand he prove the badge is real', hint: 'He is armed and close; a direct challenge may provoke him.', next: 'threat' },
  ], 'warning'),
  terms: scene('terms', 'No Written Fine', 'He cannot name a clerk or show a written toll. He says the badge is enough and rests his thumb on the holster. The toll house is open, but reaching it means passing him.', [
    { id: 'termsPay', label: 'Pay to pass without an argument', requirements: { minMoney: 2 }, next: 'paid', effects: { money: -2 } },
    { id: 'termsSmith', label: 'Back away toward the blacksmith', next: 'smith' },
    { id: 'termsTollhouse', label: 'Call to the toll house from the road', next: 'verified' },
  ], 'danger'),
  smith: scene('smith', 'A Witness from the Shop', 'The blacksmith saw the man take coins from a carter earlier, but did not see the badge clearly. They offer to walk with you to the toll house, where the keeper knows the county deputies.', [
    { id: 'smithToll', label: 'Go together to the toll house', next: 'verified' },
    { id: 'smithStay', label: 'Stay by the forge until the road clears', next: 'threat' },
  ]),
  threat: scene('threat', 'The Holster Hand', 'The man steps closer and asks again for the fine. The smith is within shouting distance if you walked back; the toll house keeper is farther uphill. The revolver remains holstered but ready.', [
    { id: 'threatCall', label: 'Call the smith to witness the demand', next: 'verified' },
    { id: 'threatLeave', label: 'Leave by the open field track', next: 'departed' },
    { id: 'threatResist', label: 'Push past him toward the toll house', hint: 'He may draw when you close the distance.', chance: { probability: 0.4, successNext: 'verified', failureNext: 'deputyDeath', successMessage: 'The smith steps between you and the road while you reach the keeper.', failureMessage: 'The badge-holder draws before you pass.', failureEffects: { health: -5 } } },
  ], 'danger'),
  verified: scene('verified', 'The Keeper Knows the Badge', 'The toll keeper says this man is not assigned to the road. A county deputy is due in the next village; the badge may be stolen or used outside its authority. The keeper will record your account but cannot detain an armed man alone.', [
    { id: 'verifyRecord', label: 'Leave a description for the real deputy', next: 'report' },
    { id: 'verifyFollow', label: 'Ask the smith to escort you past the road', next: 'report' },
  ]),
  paid: scene('paid', 'Two Coins for Passage', 'The man takes two coins and steps aside. At the toll house, the keeper says no fee was due; the badge-holder was not assigned there. The money is gone, but the keeper can send word to the county deputy.', [{ id: 'paidReport', label: 'Give the keeper the man’s description', next: 'report', effects: { historyFlags: ['paid a false road fine and reported the badge-holder'] } }]),
  report: end('report', 'A Badge Questioned', 'The real deputy receives a witness account and a description. The armed man has left before they arrive; whether he stole the badge or misused it remains unproven. You have not turned a suspicion into a verdict.'),
  departed: end('departed', 'The Field Track', 'You leave without paying or confronting him. The road fine remains uncertain to anyone who did not check the toll house; the man’s badge and weapon remain his own risk.'),
  deputyDeath: end('deputyDeath', 'The False Fine', 'The armed man fires when you try to pass him at close range.', 'death'),
}, 'road', 'traveler/passenger', 'AVOIDABLE');

export const ONE_HORSE_TWO_RIDERS = W('one-horse-two-riders', 'One Horse, Two Riders', 'A wounded stranger and an approaching posse leave one sound horse between you.', 'survival', 'HIGH', 'The horse can carry two only at a slow pace; the player chooses who rides, what is abandoned, or whether to face pursuit.', {
  draw: scene('draw', 'Hoofbeats behind the Ridge', 'A wounded stranger lies beside a saddled horse. Armed riders are coming from the east at a steady pace. The horse is sound but can carry two only at a slow walk; your pack and travel gear will make that harder. A dry wash offers cover but no exit on the far side.', [
    { id: 'rideTogether', label: 'Ride together and leave the pack', next: 'together', effects: { setFlags: ['oneHorsePackLeft'] } },
    { id: 'sendStranger', label: 'Send the stranger ahead alone', next: 'strangerAhead' },
    { id: 'hideWash', label: 'Hide both of you in the dry wash', next: 'wash' },
    { id: 'surrenderRiders', label: 'Stay visible and ask what they want', next: 'surrender' },
  ], 'warning'),
  together: scene('together', 'A Slow Ride West', 'The stranger mounts behind you. The horse can carry both at a walk; the riders are faster, and the pack is still on the ground. The stranger says the posse wants a stolen payroll pouch, but you have not seen one.', [
    { id: 'togetherDropPouch', label: 'Ask the stranger to show their hands', next: 'challenge' },
    { id: 'togetherRoad', label: 'Take the open western road', chance: { probability: 0.58, successNext: 'safeTrack', failureNext: 'horseStumbles', successMessage: 'The horse keeps its footing and reaches a rise before the posse.', failureMessage: 'The second rider’s weight slows the horse on loose stones.', failureEffects: { health: -1 } } },
    { id: 'togetherWash', label: 'Turn into the dry wash before pursuit closes', next: 'wash' },
  ]),
  strangerAhead: scene('strangerAhead', 'One Rider Goes First', 'The wounded stranger takes the horse and rides west alone. You are on foot with your gear; the posse is closer now. The stranger may reach shelter, or may be caught before the next ridge.', [
    { id: 'footCover', label: 'Hide your own tracks among the rocks', next: 'wash' },
    { id: 'footSurrender', label: 'Wait in view and explain your part', next: 'surrender' },
    { id: 'footFollow', label: 'Follow the horse tracks at a distance', next: 'safeTrack' },
  ]),
  wash: scene('wash', 'A Wash with One Exit', 'The dry wash hides you from the ridge but narrows to a rock fall ahead. The horse can be led through, not ridden; the posse is checking the road above. The stranger is weak but alert.', [
    { id: 'walkWash', label: 'Lead the horse through the rock fall', next: 'safeTrack', effects: { health: -1 } },
    { id: 'leaveHorse', label: 'Leave the horse and climb out unseen', next: 'footEscape' },
    { id: 'washWait', label: 'Wait until the riders pass', chance: { probability: 0.54, successNext: 'safeTrack', failureNext: 'challenge', successMessage: 'The posse rides past without checking the wash.', failureMessage: 'A rider spots the horse tracks at the wash mouth.' } },
  ], 'warning'),
  horseStumbles: scene('horseStumbles', 'Loose Stones under the Hooves', 'The horse stumbles on the rocky rise but stays upright. The posse closes the distance; the stranger can dismount and hide, or you can leave the road before the next bend.', [
    { id: 'stumbleHide', label: 'Leave the road and hide together', next: 'wash' },
    { id: 'stumbleSplit', label: 'Let the stranger dismount and continue', next: 'strangerAhead' },
  ], 'warning'),
  surrender: scene('surrender', 'The Posse Reaches the Road', 'The leader says the stranger is wanted for the payroll pouch. The wounded person says the pouch belongs to a mine crew and was never stolen; nobody has shown you the pouch. The posse has kept its guns lowered but ready.', [
    { id: 'surrenderSeparate', label: 'Ask them to question you separately', next: 'account' },
    { id: 'surrenderRide', label: 'Let the wounded traveler answer first', next: 'account' },
    { id: 'surrenderRun', label: 'Run when the leader looks aside', hint: 'The posse is armed and the horse is within reach.', chance: { probability: 0.3, successNext: 'footEscape', failureNext: 'westernDeath', successMessage: 'You reach the wash before the riders turn.', failureMessage: 'A shot drops you in the open.', failureEffects: { health: -5 } } },
  ], 'danger'),
  challenge: scene('challenge', 'The Pouch in the Saddlebag', 'The stranger admits carrying a sealed pouch but says it holds his own pay. You do not know whose mark is on it. The posse is close enough to see the horse.', [
    { id: 'challengeShow', label: 'Ask the stranger to open it before witnesses', next: 'account' },
    { id: 'challengeLeave', label: 'Step away from the pouch and the dispute', next: 'footEscape' },
  ]),
  account: scene('account', 'A Receipt, Not a Story', 'The pouch bears a mine payroll seal and a receipt for an advance. The posse leader recognizes it as disputed property, not proof of robbery. They agree to take the pouch to the mine office and leave the wounded stranger for a doctor.', [{ id: 'accountFinish', label: 'Help the stranger reach the doctor', next: 'safeEnd', effects: { historyFlags: ['helped a wounded traveler without deciding a disputed payroll claim'] } }]),
  safeTrack: scene('safeTrack', 'Beyond the Ridge', 'You reach a ranch track ahead of the posse. The horse is tired but sound; the stranger is alive if they traveled with you or reached shelter alone. The pack is lost only if you left it behind.', [{ id: 'trackDoctor', label: 'Take the stranger to the ranch house', next: 'safeEnd' }]),
  footEscape: end('footEscape', 'No Horse on the Road', 'You leave the horse or the stranger behind according to your choice, but escape the immediate pursuit. The payroll claim remains unsettled, and any abandoned gear stays where you left it.'),
  safeEnd: end('safeEnd', 'Two Riders, One Slow Horse', 'The stranger reaches a doctor and the posse takes the disputed pouch for verification. The horse needs rest; you keep only the gear you did not abandon. No one was cleared by reputation alone.'),
  westernDeath: end('westernDeath', 'The Roadside Pursuit', 'A rider fires before you reach the wash.', 'death'),
}, 'draw', 'traveler/passenger', 'AVOIDABLE');

export const THE_LAST_SHOT = W('the-last-shot', 'The Last Shot', 'A confrontation narrows to cover, distance, and a revolver with one cartridge.', 'crime/tension', 'SEVERE', 'A single cartridge is not a combat system; the player may retreat, bluff, surrender, negotiate, or fire under lethal pressure.', {
  yard: scene('yard', 'One Cartridge', 'A ranch yard is pinned between a stone well and an open gate. A hired gun has fired into the dirt to keep the owner from reaching the gate; his revolver may have only one cartridge left. You have no firearm established. The gunman is watching the owner, not you.', [
    { id: 'useCover', label: 'Move the owner behind the stone well', next: 'cover' },
    { id: 'callWitness', label: 'Call to the neighbors across the lane', next: 'witness' },
    { id: 'negotiate', label: 'Offer a way out without a shot', next: 'terms' },
    { id: 'holdPosition', label: 'Keep your hands visible', next: 'terms' },
  ], 'danger'),
  cover: scene('cover', 'Stone between Them', 'The owner reaches the well. The hired gun has a clear path to the gate but no clear shot at the owner. You can keep the gunman talking, call the neighbors, or leave the yard while the owner stays behind stone.', [
    { id: 'coverCall', label: 'Call the neighbors to witness', next: 'witness' },
    { id: 'coverTalk', label: 'Ask who hired him and why', next: 'terms' },
    { id: 'coverLeave', label: 'Leave by the side path', next: 'retreat' },
  ]),
  witness: scene('witness', 'Voices across the Lane', 'A neighbor answers from the porch but has not entered the yard. The gunman looks toward the voice; his revolver remains in hand. The owner can reach the side gate if the gunman turns away.', [
    { id: 'witnessOwner', label: 'Signal the owner toward the side gate', next: 'retreat' },
    { id: 'witnessTerms', label: 'Ask the gunman to name his employer', next: 'terms' },
  ], 'warning'),
  terms: scene('terms', 'A Paid Threat', 'The gunman says the owner owes money for a fence line. The owner says the bill is false. Neither has a paper present. The neighbor has heard the threat; nobody has a clear view of the gunman’s other hand.', [
    { id: 'termsStandDown', label: 'Ask him to leave before more witnesses arrive', chance: { probability: 0.57, successNext: 'weaponSafe', failureNext: 'weaponDrop', successMessage: 'He backs toward the road rather than face witnesses.', failureMessage: 'He turns the revolver toward the well.' } },
    { id: 'termsOwnerLeave', label: 'Guide the owner out through the side gate', next: 'retreat' },
    { id: 'termsSurrender', label: 'Step back and let the owner leave first', next: 'retreat' },
  ], 'danger'),
  weaponDrop: scene('weaponDrop', 'The Revolver Hits Dirt', 'The hired gun’s revolver falls. He is alive and reaches for his shoulder; the neighbors are now at the gate. The owner is behind the well, and no one approaches the dropped weapon.', [{ id: 'dropSecure', label: 'Keep everyone back until the constable arrives', next: 'aftermath', effects: { setFlags: ['lastShotWeaponSecured'] } }]),
  retreat: scene('retreat', 'Outside the Yard', 'You reach the side lane. The owner is safe only if they followed your signal; the neighbor has seen the armed threat. The gunman remains in the yard and may leave before the constable arrives.', [
    { id: 'retreatReport', label: 'Send the neighbor for the constable', next: 'aftermath', effects: { historyFlags: ['helped a rancher leave an armed debt dispute'] } },
    { id: 'retreatGo', label: 'Leave while the lane is open', next: 'escaped' },
  ]),
  weaponSafe: scene('weaponSafe', 'The Gunman Leaves', 'The gunman backs out of the yard without firing. The neighbor records the direction he takes; the debt and fence line remain disputed, but no one was shot.', [{ id: 'safeReport', label: 'Wait for the constable with the owner', next: 'aftermath' }]),
  aftermath: scene('aftermath', 'A Statement beside the Well', 'The constable takes the owner’s account and the neighbor’s account separately. The fence bill is still unproven; the gunman’s threat and weapon are recorded as a separate matter.', [{ id: 'lastReport', label: 'Give only what you saw', next: 'safeEnd', effects: { knowledge: ['A hired gun threatened a rancher over a disputed fence bill; a neighbor witnessed the weapon.'] } }]),
  escaped: end('escaped', 'No Shot Fired', 'You leave the yard while the immediate route is open. The dispute and the gunman remain unresolved; the owner’s safety is not assumed if they did not leave with you.'),
  safeEnd: end('safeEnd', 'The Last Shot Was Not Yours', 'The constable has a witness account, not a verdict on the fence debt. No one was shot if the gunman left or was disarmed; the yard remains a place the owner will not enter alone tonight.'),
  lastShotDeath: end('lastShotDeath', 'The Cartridge Spent', 'The gunman fires before you can get behind the stone well.', 'death'),
}, 'yard', 'traveler/passenger', 'AVOIDABLE');

export const WESTERN_OUTLAW_ADVENTURES: Scenario[] = [WANTED_IN_RED_CREEK, THE_MAN_AT_THE_END_OF_THE_BAR, THE_STAGE_WAS_HIT, THE_BOUNTY_POSTER, THE_EMPTY_JAIL, THREE_MEN_AT_THE_WATER_TROUGH, THE_RUSTLED_HERD, A_GUN_ON_THE_TABLE, THE_OUTLAWS_MOTHER, THE_FALSE_DEPUTY, ONE_HORSE_TWO_RIDERS, THE_LAST_SHOT];
