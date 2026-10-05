export type GearCapacityMilestone = 10 | 20;

export function gearCapacityMilestoneCopy(milestone: GearCapacityMilestone): string {
  if (milestone === 10) {
    return 'Ten adventures behind you. Gear capacity increased to 2 slots, leaving room for another useful item if one comes your way.';
  }
  return 'Twenty adventures behind you. Gear capacity increased to 3 slots, leaving more room for the equipment you choose to carry.';
}

export function endedTravelerMilestoneCopy(milestone: GearCapacityMilestone): string {
  return `This traveler completed ${milestone} adventures. Their journey ends here.`;
}
