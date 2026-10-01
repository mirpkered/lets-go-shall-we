import type { Requirement, Scenario, TimePhase } from '../types';

interface WorkSpec {
  id: string;
  title: string;
  subtitle: string;
  opening: string;
  quiet: string;
  complication: string;
  taskLabel: string;
  taskHint: string;
  item?: { id: string; name: string; label: string; hint: string; consumeOnSuccess?: boolean };
  additionalItem?: { id: string; name: string; label: string; hint: string };
  askForHelp: string;
  time: number;
  timePhases: TimePhase[];
  normalEnding: string;
  rushedEnding: string;
  earlyEnding: string;
  carefulEnding: string;
  helpedEnding: string;
  failedEnding: string;
  history: string;
  knowledge: string;
  questionLabel?: string;
  goodPay: number;
  reducedPay: number;
  failureHealth?: number;
}

const issue: Requirement = { selections: { shift: 'complication' } };
const quiet: Requirement = { selections: { shift: 'quiet' } };

function workAdventure(spec: WorkSpec): Scenario {
  const cleanFinish = {
    id: 'cleanFinish', title: 'A Fair Day’s Pay', text: spec.carefulEnding, ending: 'success' as const,
    choices: [] as [],
  };
  const helpedFinish = {
    id: 'helpedFinish', title: 'Hands Together', text: spec.helpedEnding, ending: 'success' as const,
    choices: [] as [],
  };
  const imperfectFinish = {
    id: 'imperfectFinish', title: 'Work, with a Cost', text: spec.failedEnding, ending: 'success' as const,
    choices: [] as [],
  };

  return {
    id: spec.id,
    title: spec.title,
    subtitle: spec.subtitle,
    startScene: 'hiring',
    timePhases: spec.timePhases,
    runRandomSelections: [{ id: 'shift', values: [{ value: 'quiet', weight: 4 }, { value: 'complication' }] }],
    scenes: {
      hiring: {
        id: 'hiring', title: 'The Day’s Work', tone: 'safe', text: spec.opening,
        choices: [
          { id: 'beginWork', label: 'Take the job', hint: 'The pay and the work are agreed before you begin.', next: 'work', timeCost: 5 },
          { id: 'askThenWork', label: spec.questionLabel ?? 'Ask what the day’s work involves, then begin', hint: spec.questionLabel ? 'Ask the foreman to explain how to handle a bound saw safely.' : 'Clarify the day’s arrangement before lifting a hand.', next: 'work', timeCost: 5, effects: { knowledge: [spec.knowledge] } },
        ],
      },
      work: {
        id: 'work', title: 'On the Job', tone: 'safe', text: spec.quiet,
        textVariants: [{ requirements: issue, text: spec.complication }],
        choices: [
          { id: 'finishQuiet', label: 'Finish the agreed work', hint: 'The shift has gone as expected.', requirements: quiet, timeCost: spec.time, next: 'ordinaryFinish', effects: { money: spec.goodPay, historyFlags: [spec.history], knowledge: [spec.knowledge] } },
          { id: 'finishRushed', label: 'Finish the shift as agreed', hint: 'You leave the new problem for the owner; pay will be reduced.', requirements: issue, timeCost: spec.time, next: 'rushedFinish', effects: { money: spec.reducedPay, historyFlags: [`${spec.history}_left_issue`], knowledge: [spec.knowledge] } },
          { id: 'addressIssue', label: spec.taskLabel, hint: spec.taskHint, requirements: issue, next: 'complication', timeCost: 5 },
          { id: 'leaveEarly', label: 'Call it a day early', hint: 'You leave safely, but earn only a small part of the agreed pay.', next: 'earlyFinish', timeCost: 5, effects: { money: 1, historyFlags: [`${spec.history}_left_early`] } },
        ],
      },
      complication: {
        id: 'complication', title: 'A Problem to Settle', tone: 'warning', text: `You pause the work and take stock before acting. The problem is manageable, but the safe approach matters. You can handle it carefully, use the tool you brought if it fits, or ask the person in charge to join you.`,
        choices: [
          { id: 'workCarefully', label: 'Take the careful approach', hint: 'It should work, though the awkward task can still go wrong.', timeCost: 15, chance: { probability: 0.82, successNext: cleanFinish.id, failureNext: imperfectFinish.id, successMessage: 'The work holds together, and the job is finished.', failureMessage: 'The fix does not hold. You stop before anyone is hurt, but some pay is lost.', successEffects: { money: spec.goodPay, historyFlags: [spec.history, `${spec.history}_handled_problem`], knowledge: [spec.knowledge] }, failureEffects: { money: 1, historyFlags: [`${spec.history}_had_setback`], knowledge: [spec.knowledge], ...(spec.failureHealth ? { health: -spec.failureHealth } : {}) } } },
          ...(spec.item ? [{ id: 'useCarriedTool', label: spec.item.label, hint: spec.item.hint, requirements: { items: [spec.item.id] }, timeCost: 10, chance: { probability: 0.94, successNext: cleanFinish.id, failureNext: imperfectFinish.id, successMessage: `Your ${spec.item.name} makes the awkward part of the work manageable.`, failureMessage: `The ${spec.item.name} helps, but the underlying problem takes more time than the shift allows.`, successEffects: { money: spec.goodPay, historyFlags: [spec.history, `${spec.history}_used_gear`], knowledge: [spec.knowledge], ...(spec.item.consumeOnSuccess ? { loseItems: [spec.item.id] } : {}) }, failureEffects: { money: spec.reducedPay, historyFlags: [`${spec.history}_had_setback`], knowledge: [spec.knowledge] } } }] : []),
          ...(spec.additionalItem ? [{ id: 'useSecondTool', label: spec.additionalItem.label, hint: spec.additionalItem.hint, requirements: { items: [spec.additionalItem.id] }, timeCost: 8, next: cleanFinish.id, effects: { money: spec.goodPay, historyFlags: [spec.history, `${spec.history}_used_joiners_rule`], knowledge: [spec.knowledge] } }] : []),
          { id: 'askForHelp', label: spec.askForHelp, hint: 'The work will take longer and the agreed pay will be smaller.', timeCost: 20, next: helpedFinish.id, effects: { money: spec.reducedPay, historyFlags: [spec.history, `${spec.history}_shared_work`], knowledge: [spec.knowledge] } },
        ],
      },
      ordinaryFinish: { id: 'ordinaryFinish', title: 'A Day Well Spent', text: spec.normalEnding, ending: 'success', completionQualification: 'substantive', choices: [] },
      rushedFinish: { id: 'rushedFinish', title: 'The Shift Is Done', text: spec.rushedEnding, ending: 'success', completionQualification: 'substantive', choices: [] },
      earlyFinish: { id: 'earlyFinish', title: 'An Early Finish', text: spec.earlyEnding, ending: 'success', completionQualification: 'substantive', choices: [] },
      cleanFinish,
      helpedFinish,
      imperfectFinish,
    },
  };
}

export const THE_LONG_DRIVE = workAdventure({
  id: 'the-long-drive', title: 'The Long Drive', subtitle: 'A paid day on the stock trail',
  opening: 'A cattle owner hires you to help move twelve head from the lower pasture to a fenced holding ground before evening. The animals are calm, the route is marked, and another hand rides at the rear. The owner states the day’s pay plainly.',
  quiet: 'The herd follows the broad track between the pastures. Dust rises in the dry ruts, but the cattle stay together and the rear hand keeps them moving at an easy pace.',
  complication: 'At a shallow stony crossing, one young steer balks and the line bunches behind it. The water is low and the bank is firm; nothing is stampeding, but forcing the herd would risk a strained leg and a long delay.',
  taskLabel: 'Ease the steer across the shallow crossing', taskHint: 'Give it room and guide it from the near bank; rushing may scatter the line.',
  item: { id: 'farmWhistle', name: 'Farm Whistle', label: 'Use your Farm Whistle to guide the herd', hint: 'Its familiar low call may keep the other cattle settled.' },
  askForHelp: 'Have the rear hand circle around and help', time: 150,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 90 }, { id: 'nearDusk', label: 'Near dusk', atMinutes: 180 }],
  normalEnding: 'The twelve cattle reach the holding ground before dusk. The owner counts them, pays the agreed wage, and thanks you for keeping a steady pace. It was honest, ordinary work—and a useful day’s pay.',
  rushedEnding: 'The steer crosses after a long pause, though the herd arrives later than planned. The owner pays less for the delay and keeps the cattle overnight. No animal is hurt.',
  earlyEnding: 'The owner pays a small amount for the hours you worked. The herd stays in the lower pasture with the other hand; the drive can resume tomorrow.',
  carefulEnding: 'The steer picks its way over the stones. The herd follows without scattering, and you finish the drive with the other hand.',
  helpedEnding: 'The rear hand circles wide while you hold the lead cattle. Together you guide the steer across without driving the herd into the water.',
  failedEnding: 'The steer slips on a stone and strains a leg, but stays on its feet. You stop the drive and help the owner settle it in a nearby pen; the day’s pay is reduced.',
  history: 'completed_paid_livestock_drive', knowledge: 'A calm, steady pace keeps cattle together at a shallow crossing.', goodPay: 4, reducedPay: 2,
});

export const FENCE_LINE = workAdventure({
  id: 'fence-line', title: 'Fence Line', subtitle: 'A farm boundary needs sound posts',
  opening: 'A farm owner hires you to replace several weak fence posts along the pasture. The boundary stakes are visible and the owner has shown you the line they agreed with the neighbor. The animals are grazing well back from the work area; you have daylight and a fair wage.',
  quiet: 'The posts stand firm as you set them. You work along the agreed boundary, tamping each one before stretching the wire. The neighboring farmer watches from his own side and raises no objection.',
  complication: 'One post comes away rotten below the ground. The neighboring farmer says the replacement should sit a little farther from his field, but the boundary stake is still visible between you. The livestock remain behind the intact section of fence.',
  taskLabel: 'Set the replacement post at the boundary stake', taskHint: 'The stake marks the agreed line; a straight, well-set post should keep the fence taut.',
  item: { id: 'bridgewrightHammer', name: 'Bridgewright’s Hammer', label: 'Set the post with your Bridgewright’s Hammer', hint: 'Its balanced head is suited to driving a small fence peg without splitting it.' },
  additionalItem: { id: 'joinersFoldingRule', name: 'Joiner’s Folding Rule', label: 'Match the spacing with your folding rule', hint: 'Compare the new post’s distance from the sound post with the spacing along the existing fence.' },
  askForHelp: 'Ask both owners to confirm the boundary together', time: 120,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'midday', label: 'Midday', atMinutes: 60 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 120 }],
  normalEnding: 'The repaired fence holds along the marked line. The owner pays you, and the neighbor gives the finished posts a brief inspection before returning to his field.',
  rushedEnding: 'The weak post is replaced on the marked line, though you do not have time to finish the neighboring loose section. The owner pays a smaller wage for the partial repair.',
  earlyEnding: 'You leave the unfinished stretch safe behind its standing fence. The owner pays for the posts you set and will hire another hand to complete the line.',
  carefulEnding: 'The post sits square on the marked boundary. You draw the wire tight and the livestock stay in the pasture.',
  helpedEnding: 'Both owners agree on the stake, then one holds the wire while you set the post. The boundary is settled without moving it.',
  failedEnding: 'The first post leans under the wire’s pull. You release the tension before it falls and reset it; the delay costs part of your pay.',
  history: 'completed_paid_fence_repair', knowledge: 'A visible boundary stake can settle a fence-line disagreement before the wire is tightened.', goodPay: 4, reducedPay: 2,
});

export const HARVEST_HAND = workAdventure({
  id: 'harvest-hand', title: 'Harvest Hand', subtitle: 'A few days in the wheat field',
  opening: 'A farm’s regular crew needs another pair of hands for the wheat harvest. The foreman shows you the cut rows and explains that the crew shares the work; the whole crop does not depend on you. You agree on day pay and start with the morning light.',
  quiet: 'The crew cuts and binds the wheat at a steady pace. Clouds gather far to the west, but the field is dry and the foreman has enough hands to cover the rows before the weather reaches them.',
  complication: 'A worker catches a palm on a broken binding hook. The cut is shallow, but it needs cleaning and wrapping. The rest of the crew can keep working; the western clouds have darkened, so taking too long may leave the last rows exposed.',
  taskLabel: 'Clean and wrap the worker’s palm', taskHint: 'The cut is visible and the worker is alert. A clean cloth and a short pause are enough.',
  item: { id: 'fieldBandageRoll', name: 'Field Bandage Roll', label: 'Use your Field Bandage Roll', hint: 'The bandage is accessible and clean; the worker can hold out their hand.', consumeOnSuccess: true },
  askForHelp: 'Ask the foreman to reassign one worker while you help', time: 300,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 180 }, { id: 'evening', label: 'Evening', atMinutes: 360 }],
  normalEnding: 'The crew finishes the planned rows before rain reaches the field. You are paid for your days’ work, and the foreman makes clear that the harvest was a team effort.',
  rushedEnding: 'You finish your assigned rows while another worker wraps the palm. The last cut wheat is covered before rain, though the crew will return for a small section tomorrow.',
  earlyEnding: 'The foreman pays you for the work already done. The crew is large enough to continue without you; no one is left depending on your strength alone.',
  carefulEnding: 'You rinse the cut with clean water, wrap it, and return the worker to light duties. The others finish the exposed rows.',
  helpedEnding: 'The foreman moves a worker to the cut rows while you clean and bind the hand. The crew stays together and the injured worker rests.',
  failedEnding: 'The first wrap slips and must be redone. The worker is safe, but the lost time leaves a few sheaves to cover after the rain begins.',
  history: 'completed_paid_harvest_work', knowledge: 'A shallow harvest cut should be cleaned and covered before the worker returns to the field.', goodPay: 4, reducedPay: 2,
});

export const FREIGHT_TO_MILLERS_FORK = workAdventure({
  id: 'freight-to-millers-fork', title: 'Freight to Miller’s Fork', subtitle: 'A routine wagon delivery',
  opening: 'A merchant pays you to ride with a wagon carrying flour sacks, bolts of cloth, and a crate of lamp glass to Miller’s Fork. The driver and two horses are introduced before you set out; the load is ordinary shop freight, and the delivery time is flexible until evening.',
  quiet: 'The wagon follows the firm road toward Miller’s Fork. The driver checks the load at each rise, and the flour, cloth, and glass remain secure beneath the canvas.',
  complication: 'After a rut, one side of the canvas slips and the glass crate shifts against the flour sacks. The wagon is stopped on level ground. The horses are standing calmly in their traces, and nothing has broken yet.',
  taskLabel: 'Settle the load before continuing', taskHint: 'The crate is within reach from the wagon’s safe side; the horses remain still.',
  item: { id: 'freightmansStrap', name: 'Freightman’s Strap', label: 'Secure the crate with your Freightman’s Strap', hint: 'The broad leather strap can hold the glass crate against the wagon rail.' },
  askForHelp: 'Have the driver hold the canvas while you settle the crate', time: 180,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 90 }, { id: 'nearDusk', label: 'Near dusk', atMinutes: 210 }],
  normalEnding: 'The wagon reaches Miller’s Fork with all the flour, cloth, and glass intact. The merchant pays your wage at the depot, and the driver takes the horses to water.',
  rushedEnding: 'The shifted crate makes the rest of the journey slower. One pane of lamp glass cracks, but the flour and cloth arrive intact; the merchant docks a small amount from your pay.',
  earlyEnding: 'You leave the wagon safely stopped at a nearby farm with the driver. The merchant pays for the portion of the journey you completed.',
  carefulEnding: 'You ease the crate back against the rail and tie the canvas down. The driver checks the horses and resumes at a slower pace.',
  helpedEnding: 'The driver holds the canvas while you wedge the crate against the sacks. The team remains calm and the load is safe to move.',
  failedEnding: 'The crate shifts again as the wagon starts. A corner pane cracks, but the crate stays aboard; you stop and secure the load before continuing for reduced pay.',
  history: 'completed_paid_freight_run', knowledge: 'A glass crate should be braced against a firm wagon rail before the team moves.', goodPay: 4, reducedPay: 2,
});

export const A_ROOF_BEFORE_RAIN = workAdventure({
  id: 'a-roof-before-rain', title: 'A Roof Before Rain', subtitle: 'Patch the shed before the weather turns',
  opening: 'A carpenter hires you to help patch a low shed roof before the evening rain. The roof can be reached from a secured ladder on firm ground. The carpenter points out the sound boards and pays a clear day rate; you are one of several workers.',
  quiet: 'You pass boards up from the ladder while the carpenter fits them. The wind is light, the roof feels firm underfoot, and the crew expects to finish before the rain arrives.',
  complication: 'Lifting a loose board reveals a rotten section along the roof edge. The ladder is still secured below, and the sound rafters are visible from the safe side. Wind is rising, so no one should stand on the unsupported section.',
  taskLabel: 'Brace the rotten edge from the sound side', taskHint: 'The weak boards are clearly marked; keep your weight over the sound rafters.',
  item: { id: 'travelRope', name: 'Travel Rope', label: 'Tie off with your Travel Rope', hint: 'The rope can secure the ladder and a worker standing on the sound side.' },
  askForHelp: 'Ask the carpenter to bring a brace before anyone climbs higher', time: 150,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 90 }, { id: 'rain', label: 'Rain', atMinutes: 180 }],
  normalEnding: 'The sound boards are fitted and the shed stays dry through the rain. The carpenter pays you and stores the unused lumber for another repair.',
  rushedEnding: 'The roof is covered before the rain, though the damaged edge only receives a temporary patch. The carpenter pays less and plans a proper repair when the weather clears.',
  earlyEnding: 'You climb down while the ladder is steady. The crew covers the opening from below with canvas, and the carpenter pays you for the hours worked.',
  carefulEnding: 'You brace the damaged edge from the sound rafters and fit a temporary board without stepping onto the rotten section.',
  helpedEnding: 'The carpenter brings a brace and holds the ladder while you secure the patch from the firm side. The roof is weather-tight, though the rotten board will need replacing.',
  failedEnding: 'A brace slips against the rotten edge. You retreat onto a sound rafter before it gives way; the crew covers the opening from below and the carpenter reduces the pay.',
  history: 'completed_paid_roof_repair', knowledge: 'A rotten roof edge should be supported from sound rafters, not stood upon.', goodPay: 4, reducedPay: 2, failureHealth: 1,
});

export const NIGHT_WATCH = workAdventure({
  id: 'night-watch', title: 'Night Watch', subtitle: 'A quiet shift beside the freight shed',
  opening: 'A depot keeper pays you to watch a small freight shed until dawn. The stored goods are canvas-covered crates and sacks, not valuables; the keeper shows you the door latch and the sheltered bench. Your task is simply to stay awake and call him if anything needs attention.',
  quiet: 'The first hours pass quietly. The shed remains locked, the covered freight stays dry, and the keeper’s lantern burns steadily on the bench beside you.',
  complication: 'A gust lifts the loose canvas at the shed’s open loading side. A corner of the cover flaps against the stacked sacks. The door is still locked; there is no sign of anyone approaching.',
  taskLabel: 'Tie down the loose canvas corner', taskHint: 'The stack is stable and the cord is hanging from its usual peg; no climbing is needed.',
  item: { id: 'freightmansStrap', name: 'Freightman’s Strap', label: 'Secure the canvas with your Freightman’s Strap', hint: 'Reach the low corner from the clear floor and keep the cover from catching the wind.' },
  askForHelp: 'Wake the keeper to help secure the cover', time: 480,
  timePhases: [{ id: 'evening', label: 'Evening', atMinutes: 0 }, { id: 'midnight', label: 'Midnight', atMinutes: 180 }, { id: 'nearDawn', label: 'Near dawn', atMinutes: 360 }],
  normalEnding: 'Nothing unusual happens before dawn. The keeper returns, checks the lock, and pays you for a quiet night’s watch.',
  rushedEnding: 'You keep watch and report the flapping canvas at dawn. A few sacks are damp at the edge, but the freight is safe; the keeper pays a smaller wage for the extra work left behind.',
  earlyEnding: 'You wake the keeper and leave before dawn. He pays you for the hours covered and takes over the watch himself.',
  carefulEnding: 'You tie the canvas to the low rail and return to the bench. The freight stays covered for the rest of the night.',
  helpedEnding: 'The keeper comes out with a second cord. Together you fasten the cover without disturbing the stacked goods.',
  failedEnding: 'The knot loosens in the next gust. The canvas is caught before it blows away, though the outside sacks get damp and the keeper docks a little pay.',
  history: 'completed_paid_night_watch', knowledge: 'A canvas cover tied at two low points is less likely to catch a gust.', goodPay: 4, reducedPay: 2,
});

export const UNLOAD_BEFORE_DARK = workAdventure({
  id: 'unload-before-dark', title: 'Unload Before Dark', subtitle: 'Temporary work at the freight platform',
  opening: 'A rail depot hires you and several other hands to unload ordinary crates and sacks before the evening train departs. The platform is level, the wagon doors open toward it, and the foreman marks a clear aisle to the covered storehouse. The agreed wage is paid at the end of the shift.',
  quiet: 'The crew passes the lighter sacks along the clear aisle. There is enough daylight to stack everything without rushing, and the heavier crates remain on the wagon until the handcart is ready.',
  complication: 'A crate of household pots has shifted near the wagon door. It is resting against the lower stack, not falling, but the aisle is narrow and the light is fading. The foreman stops the line before anyone reaches beneath it.',
  taskLabel: 'Make room and lower the crate together', taskHint: 'The crate is heavy but stable; clear the aisle before moving it.',
  item: { id: 'freightmansStrap', name: 'Freightman’s Strap', label: 'Lower the crate with your Freightman’s Strap', hint: 'The strap can give two workers a secure grip without putting hands beneath the crate.' },
  askForHelp: 'Have the foreman bring two more hands', time: 180,
  timePhases: [{ id: 'afternoon', label: 'Afternoon', atMinutes: 0 }, { id: 'lateLight', label: 'Fading light', atMinutes: 120 }, { id: 'dark', label: 'After dark', atMinutes: 240 }],
  normalEnding: 'The freight reaches the covered storehouse before dark. The crew stacks the last sacks safely, and the foreman pays everyone the agreed wage.',
  rushedEnding: 'Most of the cargo is under cover before dark. The pots arrive with one chipped rim, and the foreman reduces your pay for the damaged crate.',
  earlyEnding: 'You stop when the light becomes poor. The foreman pays for the hours worked and leaves the remaining cargo secured on the wagon until morning.',
  carefulEnding: 'You clear the aisle and lower the crate with bent knees and a steady count. The pots reach the storehouse intact.',
  helpedEnding: 'The foreman brings two more workers. With everyone on the same count, the crate comes down without anyone reaching beneath it.',
  failedEnding: 'The crate tilts and one pot breaks against the wagon rail. The crew sets it down safely and finishes the remaining loads at a slower pace.',
  history: 'completed_paid_freight_unloading', knowledge: 'A shifted crate should be stabilized and given a clear path before anyone lifts it.', goodPay: 4, reducedPay: 2,
});

export const THE_MILL_JOB = workAdventure({
  id: 'the-mill-job', title: 'The Mill Job', subtitle: 'A shift among sacks and turning gears',
  opening: 'A miller hires you to move flour sacks from the packing bench to a wagon. The millwheel and belt drive are behind a waist-high rail; the miller explains that only he touches the running machinery. You are paid by the shift, not by how fast you can carry.',
  quiet: 'You carry the sacks along the clear aisle while the mill turns at its usual pace. The rail stays between you and the gears, and the miller checks the flour weights as they come off the bench.',
  complication: 'The miller stops the wheel when a wooden scoop wedges in the feed chute. The belt has slowed to a halt, and he points out the stop lever. The jam is visible behind the rail; no one should reach toward the machinery until the wheel is fully still.',
  taskLabel: 'Wait for the miller to lock the wheel, then clear the scoop', taskHint: 'The stop lever is beside the miller. Do not reach behind the rail while the wheel moves.',
  item: { id: 'foremanMultiTool', name: 'Foreman’s Multi-tool', label: 'Use your Multi-tool after the wheel is locked', hint: 'Its narrow end can lift the wooden scoop once the miller confirms the gears are stopped.' },
  askForHelp: 'Have the miller lock the wheel and clear it himself', time: 150,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'midday', label: 'Midday', atMinutes: 75 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 150 }],
  normalEnding: 'You finish the sacks and help load the wagon. The miller pays the agreed shift wage; the machinery runs without trouble.',
  rushedEnding: 'You finish carrying the flour while the miller leaves the jam for later. The last sacks are sound, though a smaller batch is milled than planned and your pay is reduced.',
  earlyEnding: 'You step away from the machinery and collect pay for the sacks already moved. The miller handles the jam after the wheel is secured.',
  carefulEnding: 'The miller locks the wheel and confirms it is still. You lift the scoop from the chute, then step back before he starts the mill again.',
  helpedEnding: 'The miller locks and clears the wheel himself while you keep the aisle clear. The machinery starts again only after everyone is behind the rail.',
  failedEnding: 'The scoop is too tightly wedged to move by hand. You leave it for the miller to dismantle with the wheel locked; the delay reduces the shift’s pay.',
  history: 'completed_paid_mill_shift', knowledge: 'A mill jam must be cleared only after the wheel is stopped and secured.', goodPay: 4, reducedPay: 2,
});

export const CUTTING_TIMBER = workAdventure({
  id: 'cutting-timber', title: 'Cutting Timber', subtitle: 'A careful day clearing fallen pine',
  opening: 'A timber crew hires you to trim branches from a pine already felled in an open clearing, then stack the smaller lengths beside the road. The foreman has marked the clear side of the trunk and keeps the heavy timber work to the experienced sawyers. You earn a day wage for the assigned work.',
  quiet: 'You trim branches from the grounded trunk and stack manageable lengths. The experienced sawyers handle the larger cuts, and the open clearing leaves room to work without standing beneath a tree.',
  complication: 'Your hand saw binds in a thick branch. The trunk is already on the ground and stable, but the branch is under tension; pulling the blade straight back could pinch it harder or make the wood spring.',
  taskLabel: 'Free the saw by easing the branch from the clear side', taskHint: 'The foreman has marked where the branch can move; keep your body out of its path.',
  item: { id: 'heavyLeatherGloves', name: 'Heavy Leather Gloves', label: 'Use your Heavy Leather Gloves to shift the branch', hint: 'They protect your hands from bark and splinters, but not from the branch’s weight.' },
  askForHelp: 'Ask the sawyer to release the branch while you steady the blade', time: 180,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 90 }, { id: 'nearDusk', label: 'Near dusk', atMinutes: 180 }],
  normalEnding: 'The smaller lengths are stacked beside the road, ready for the cart. The foreman pays your day wage; the sawyers keep the heavy trunk work.',
  rushedEnding: 'You finish the safe trimming and leave the bound branch for the sawyer. The cart takes most of the stack before dusk, and the foreman pays a reduced wage for the unfinished section.',
  earlyEnding: 'You stop when the light falls across the marked work area. The foreman pays for the lengths already stacked; the trunk remains stable in the clearing.',
  carefulEnding: 'The sawyer shifts the branch from the marked side while you ease the blade free. You return to trimming smaller lengths.',
  helpedEnding: 'The experienced sawyer takes the branch while you steady the saw. No one stands in the springing path, and the tool comes free.',
  failedEnding: 'The branch springs a short distance and scratches your forearm. You step clear and leave the bound cut for the sawyer; the day’s pay is reduced.',
  history: 'completed_paid_timber_work', knowledge: 'A bound saw should be released by moving the wood from a clear side, not by pulling harder.', questionLabel: 'Ask how to handle a bound saw safely', goodPay: 4, reducedPay: 2, failureHealth: 1,
});

export const THE_DELIVERY_RUN = workAdventure({
  id: 'the-delivery-run', title: 'The Delivery Run', subtitle: 'A known parcel, a familiar road',
  opening: 'A shopkeeper pays you to carry a sealed parcel of lamp wicks and sewing needles to a named customer in the next settlement. The contents and recipient are written on the label in front of you; this is a straightforward delivery, not a mystery. The footpath is familiar and the agreed fee is paid on receipt.',
  quiet: 'The path stays dry and the parcel remains snug in its paper wrapping. You reach the settlement while the shop is open, and the customer is there to receive it.',
  complication: 'Rain begins before you reach the settlement. The paper wrapping is getting soft at the corners, but the parcel is still sealed and the contents are dry. The post road is shorter; a covered lane adds time but keeps the package sheltered.',
  taskLabel: 'Take the covered lane and protect the parcel', taskHint: 'It is longer but sheltered; the customer will still be there before closing.',
  item: { id: 'weatherproofCloak', name: 'Weatherproof Cloak', label: 'Wrap the parcel beneath your Weatherproof Cloak', hint: 'Keep the label visible and the sealed paper away from the rain.' },
  askForHelp: 'Ask the post-house keeper for a dry wrapping', time: 120,
  timePhases: [{ id: 'morning', label: 'Morning', atMinutes: 0 }, { id: 'afternoon', label: 'Afternoon', atMinutes: 60 }, { id: 'closing', label: 'Near closing', atMinutes: 120 }],
  normalEnding: 'You hand the sealed parcel to the named customer and return the signed receipt. The shopkeeper pays the delivery fee; the ordinary goods arrive intact.',
  rushedEnding: 'You take the shorter road. The parcel arrives before closing, though its wrapper is damp and the shopkeeper pays a little less for the poor condition.',
  earlyEnding: 'You return the parcel to the sending shop before the rain worsens. The shopkeeper pays for the attempt and will send it under cover tomorrow.',
  carefulEnding: 'The covered lane takes longer, but the label and paper wrapping stay dry. The customer accepts the sealed parcel before closing.',
  helpedEnding: 'The post-house keeper provides dry paper and a string tie. You keep the seal intact and deliver the parcel before the shop closes.',
  failedEnding: 'The wrapping tears at one corner in the rain, though the sealed contents remain dry. You deliver it with an explanation and receive a smaller fee.',
  history: 'completed_paid_delivery_run', knowledge: 'A covered lane can protect a paper-wrapped parcel when rain threatens.', goodPay: 3, reducedPay: 1,
});

export const HONEST_WORK_ADVENTURES: Scenario[] = [THE_LONG_DRIVE, FENCE_LINE, HARVEST_HAND, FREIGHT_TO_MILLERS_FORK, A_ROOF_BEFORE_RAIN, NIGHT_WATCH, UNLOAD_BEFORE_DARK, THE_MILL_JOB, CUTTING_TIMBER, THE_DELIVERY_RUN];
