import type { Scenario } from '../types';

export const AFTER_THE_STORM: Scenario = {
  id: 'after-the-storm', title: 'After the Storm', subtitle: 'The rain has passed. The damage is still there.', startScene: 'damagedFarm',
  timePhases: [{ id: 'clearing', label: 'Storm Clearing', atMinutes: 0 }, { id: 'nextShower', label: 'Another Shower Nears', atMinutes: 12 }, { id: 'evening', label: 'Light Fading', atMinutes: 24 }],
  runRandomSelections: [{ id: 'farmhand', values: ['Petronel', 'Darius', 'Enid', 'Leontine', 'Wes'].map((value) => ({ value })) }],
  scenes: {
    damagedFarm: { id: 'damagedFarm', title: 'Three Problems in the Yard', tone: 'warning', text: 'A storm has just passed over a farm. A roof corner is peeled back, two goats have slipped through a broken gate, and the farmhand {{farmhand}} sits under the porch with a cut forearm. The lane to the house is clear. Dark clouds remain west of the fields.', choices: [
      { id: 'treatFarmhand', label: 'Clean and wrap {{farmhand}}’s arm', hint: 'A bandage helps; a clean strip of cloth is available if you have none.', timeCost: 4, next: 'armWrapped', effects: { historyFlags: ['treated_farmhand_after_storm'] } },
      { id: 'secureRoof', label: 'Tie the loose roof corner down', hint: 'The roof is low from the porch side; a rope or strap can hold the canvas until repair.', requirements: { anyItems: ['travelRope', 'freightmansStrap'] }, timeCost: 5, next: 'roofSecured', effects: { historyFlags: ['secured_roof_after_storm'] } },
      { id: 'findGoats', label: 'Bring the two goats back from the lane', hint: 'They are visible beyond the broken gate, heading toward the orchard.', timeCost: 5, next: 'goatsReturned', effects: { historyFlags: ['recovered_loose_goats_after_storm'] } },
      { id: 'askFarmhandPriority', label: 'Ask {{farmhand}} which need is most urgent', hint: 'You can help with one task before the next shower.', next: 'farmhandPriority' },
    ] },
    farmhandPriority: { id: 'farmhandPriority', title: 'The Farmhand Chooses', tone: 'warning', text: '{{farmhand}} says the goats are heading toward the road; the arm is bleeding but not deeply, and the roof can wait for another hour. The farmhand decides what matters most to the household. You can still choose what you are able to do.', choices: [
      { id: 'followFarmhandPriority', label: 'Bring the goats back first', timeCost: 5, next: 'goatsReturned', effects: { historyFlags: ['recovered_loose_goats_after_storm'] } },
      { id: 'wrapAfterPriority', label: 'Treat the arm before the rain returns', timeCost: 4, next: 'armWrapped', effects: { historyFlags: ['treated_farmhand_after_storm'] } },
      { id: 'leaveFarmAfterStorm', label: 'Leave after checking the lane is clear', next: 'leftFarm', effects: { historyFlags: ['left_storm_damaged_farm'] } },
    ] },
    armWrapped: { id: 'armWrapped', title: 'A Clean Wrap', tone: 'safe', text: '{{farmhand}} holds the bandage in place. The goats are still beyond the broken gate, and the roof corner still flaps in the west wind. You have time to help with one more task.', choices: [
      { id: 'goatsAfterArm', label: 'Bring the goats back', timeCost: 5, next: 'goatsReturned' },
      { id: 'roofAfterArm', label: 'Secure the roof corner', requirements: { anyItems: ['travelRope', 'freightmansStrap'] }, timeCost: 5, next: 'roofSecured' },
      { id: 'leaveAfterArm', label: 'Leave the remaining work to the family', next: 'helpedOnceEnding' },
    ] },
    goatsReturned: { id: 'goatsReturned', title: 'The Gate Is Closed', tone: 'safe', text: 'The goats are back inside the yard, and {{farmhand}} closes the broken gate with a board. They keep a clean cloth over the cut arm; the roof still needs repair before the next shower.', choices: [
      { id: 'treatAfterGoats', label: 'Finish wrapping the cut arm', timeCost: 3, next: 'helpedOnceEnding' },
      { id: 'leaveAfterGoats', label: 'Leave the roof to the farm family', next: 'helpedOnceEnding' },
    ] },
    roofSecured: { id: 'roofSecured', title: 'The Roof Held', tone: 'safe', text: 'Your line holds the loose roof corner against the eaves. The goats are still beyond the broken gate; {{farmhand}} keeps cloth over the cut arm. The family can repair the roof properly when the sky clears.', choices: [
      { id: 'fetchGoatsAfterRoof', label: 'Bring the goats back before dark', timeCost: 5, next: 'helpedOnceEnding' },
      { id: 'leaveAfterRoof', label: 'Leave the family to finish repairs', next: 'helpedOnceEnding' },
    ] },
    helpedOnceEnding: { id: 'helpedOnceEnding', title: 'One Less Problem', tone: 'safe', ending: 'success', choices: [], text: 'The farm family has one fewer problem to face before evening. Other repairs remain, but the storm has passed and no one expects you to save everything.' },
    leftFarm: { id: 'leftFarm', title: 'Back to the Lane', tone: 'safe', ending: 'success', choices: [], text: 'You leave the farm to its family. The goats, roof, and cut arm remain for them to handle; the lane is clear for travel.' },
  },
};
