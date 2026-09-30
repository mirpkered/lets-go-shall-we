import type { Scenario } from '../types';

export const THE_EMPTY_WAGON: Scenario = {
  id: 'the-empty-wagon', title: 'The Empty Wagon', subtitle: 'A broken hub, a tethered horse, and fresh footprints toward the farm.', startScene: 'wagonOnRoad',
  timePhases: [{ id: 'evening', label: 'Evening Road', atMinutes: 0 }, { id: 'rain', label: 'Rain Approaching', atMinutes: 12 }, { id: 'dark', label: 'Roadside Dark', atMinutes: 24 }],
  runRandomSelections: [{ id: 'driver', values: ['Nolan', 'Eira', 'Farlan', 'Merrit', 'Bess'].map((value) => ({ value })) }],
  scenes: {
    wagonOnRoad: { id: 'wagonOnRoad', title: 'No Driver in the Seat', tone: 'warning', text: 'A loaded wagon stands well off the road. Its right rear wheel is missing; the cracked hub lies beneath the axle. The horse is tied safely to a tree on the road side. Fresh bootprints lead toward a farmhouse, and a folded tarp covers the cargo. The road is quiet, but rain is coming.', choices: [
      { id: 'followFootprints', label: 'Follow the prints toward the farmhouse', hint: 'The driver may be seeking a wheelwright.', timeCost: 10, next: 'driverFound', effects: { knowledge: ['The wagon driver went to the farmhouse for a wheelwright.'] } },
      { id: 'secureWagonLoad', label: 'Secure the tarp and stay with the wagon', hint: 'A strap or rope can keep rain off the cargo.', requirements: { anyItems: ['freightmansStrap', 'travelRope', 'waxedCanvasSheet'] }, timeCost: 3, next: 'loadSecured', effects: { historyFlags: ['secured_stranded_wagon_cargo'] } },
      { id: 'inspectTheWagon', label: 'Check the wheel and cargo', timeCost: 2, next: 'wagonChecked', effects: { knowledge: ['The wagon hub split on the road; its cargo is intact.'] } },
      { id: 'continueRoad', label: 'Leave the wagon and keep traveling', hint: 'The horse is tied and the cargo covered; the owner may return soon.', next: 'wagonLeftEnding' },
    ] },
    wagonChecked: { id: 'wagonChecked', title: 'An Ordinary Breakdown', tone: 'safe', text: 'The wheel failed cleanly; there are no signs of a struggle or hurried departure. The cargo is dry for now, and the hoofprints stay close to the wagon. Whoever owns it likely walked toward the farmhouse.', choices: [
      { id: 'walkToDriver', label: 'Find the driver before the rain', timeCost: 8, next: 'driverFound' },
      { id: 'coverCargo', label: 'Tie down the tarp with your gear', requirements: { anyItems: ['freightmansStrap', 'travelRope', 'waxedCanvasSheet'] }, next: 'loadSecured', effects: { historyFlags: ['secured_stranded_wagon_cargo'] } },
      { id: 'leaveAfterCheck', label: 'Leave the wagon as you found it', next: 'wagonLeftEnding' },
    ] },
    driverFound: { id: 'driverFound', title: 'At the Farmhouse', tone: 'safe', text: '{{driver}} is at the farmhouse asking for a wheelwright. The horse broke the hub on a rut, so {{driver}} left it tethered and covered the load before walking here. The wheelwright is preparing a handcart to recover the cargo.', choices: [
      { id: 'walkBackDriver', label: 'Walk back with {{driver}}', timeCost: 8, next: 'wagonRecovered', effects: { historyFlags: ['helped_recover_stranded_wagon'] } },
      { id: 'leaveDriverToSmith', label: 'Leave the recovery to the wheelwright', next: 'wagonLeftEnding' },
    ] },
    loadSecured: { id: 'loadSecured', title: 'The Load Tied Down', tone: 'safe', text: 'Your strap keeps the tarp snug over the cargo. The horse remains tied in the clear beside the road. The driver has not returned yet; the farm lane is visible beyond the field.', choices: [
      { id: 'waitWithWagon', label: 'Wait with the wagon for its owner', timeCost: 8, next: 'wagonRecovered' },
      { id: 'goFindOwner', label: 'Walk to the farmhouse and find the driver', timeCost: 8, next: 'driverFound' },
      { id: 'leaveSecure', label: 'Leave once the cargo is protected', next: 'wagonLeftEnding' },
    ] },
    wagonRecovered: { id: 'wagonRecovered', title: 'A Handcart for the Cargo', tone: 'safe', ending: 'success', choices: [], text: '{{driver}} and the wheelwright transfer the cargo to a handcart. The horse is led to the stable, and the broken wagon stays off the road until the hub is replaced.' },
    wagonLeftEnding: { id: 'wagonLeftEnding', title: 'Back to the Road', tone: 'safe', ending: 'success', choices: [], text: 'You continue traveling. The horse remains tethered, the tarp covers the load, and the farmhouse is close enough for the owner to arrange recovery.' },
  },
};
