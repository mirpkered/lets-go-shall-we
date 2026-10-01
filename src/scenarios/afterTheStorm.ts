import type { Scenario } from '../types';

export const AFTER_THE_STORM: Scenario = {
  id: 'after-the-storm', title: 'After the Storm', subtitle: 'The rain has passed. The damage is still there.', startScene: 'damagedFarm',
  timePhases: [{ id: 'clearing', label: 'Storm Clearing', atMinutes: 0 }, { id: 'nextShower', label: 'Another Shower Nears', atMinutes: 12 }, { id: 'evening', label: 'Light Fading', atMinutes: 24 }],
  runRandomSelections: [{ id: 'farmhand', values: ['Petronel', 'Darius', 'Enid', 'Leontine', 'Wes'].map((value) => ({ value })) }],
  scenes: {
    damagedFarm: { id: 'damagedFarm', title: 'Three Problems in the Yard', tone: 'warning', text: 'A storm has just passed over a farm. A roof corner is peeled back, two goats have slipped through a broken gate, and the farmhand {{farmhand}} sits under the porch with a cut forearm. The lane to the house is clear. Dark clouds remain west of the fields.', choices: [
      { id: 'treatFarmhand', label: 'Clean and wrap {{farmhand}}’s arm', hint: 'A bandage helps; a clean strip of cloth is available if you have none.', timeCost: 4, next: 'armWrapped', effects: { setFlags: ['armTreated'], historyFlags: ['treated_farmhand_after_storm'] } },
      { id: 'secureRoof', label: 'Tie the loose roof corner down', hint: 'The roof is low from the porch side; a rope or strap can hold the canvas until repair.', requirements: { anyItems: ['travelRope', 'freightmansStrap'] }, timeCost: 5, next: 'roofSecured', effects: { setFlags: ['roofSecured'], historyFlags: ['secured_roof_after_storm'] } },
      { id: 'findGoats', label: 'Bring the two goats back from the lane', hint: 'They are visible beyond the broken gate, heading toward the orchard.', timeCost: 5, next: 'goatsReturned', effects: { setFlags: ['goatsReturned'], historyFlags: ['recovered_loose_goats_after_storm'] } },
      { id: 'askFarmhandPriority', label: 'Ask {{farmhand}} which need is most urgent', hint: 'You can help with one task before the next shower.', next: 'farmhandPriority' },
    ] },
    farmhandPriority: { id: 'farmhandPriority', title: 'The Farmhand Chooses', tone: 'warning', text: '{{farmhand}} says the goats are heading toward the road; the arm is bleeding but not deeply, and the roof can wait for another hour. The farmhand decides what matters most to the household. You can still choose what you are able to do.', choices: [
      { id: 'followFarmhandPriority', label: 'Bring the goats back first', timeCost: 5, next: 'goatsReturned', effects: { setFlags: ['goatsReturned'], historyFlags: ['recovered_loose_goats_after_storm'] } },
      { id: 'wrapAfterPriority', label: 'Treat the arm before the rain returns', timeCost: 4, next: 'armWrapped', effects: { setFlags: ['armTreated'], historyFlags: ['treated_farmhand_after_storm'] } },
      { id: 'leaveFarmAfterStorm', label: 'Leave after checking the lane is clear', next: 'leftFarm', effects: { historyFlags: ['left_storm_damaged_farm'] } },
    ] },
    armWrapped: { id: 'armWrapped', title: 'A Clean Wrap', tone: 'safe', text: '{{farmhand}} holds the bandage in place. The goats are still beyond the broken gate, and the roof corner still flaps in the west wind. You have time to help with one more task.', choices: [
      { id: 'goatsAfterArm', label: 'Bring the goats back', timeCost: 5, next: 'goatsReturned', effects: { setFlags: ['armTreated', 'goatsReturned'], historyFlags: ['recovered_loose_goats_after_storm'] } },
      { id: 'roofAfterArm', label: 'Secure the roof corner', requirements: { anyItems: ['travelRope', 'freightmansStrap'] }, timeCost: 5, next: 'roofSecured', effects: { setFlags: ['armTreated', 'roofSecured'], historyFlags: ['secured_roof_after_storm'] } },
      { id: 'leaveAfterArm', label: 'Leave the remaining work to the family', next: 'stormAftermath', effects: { setFlags: ['armTreated'] } },
    ] },
    goatsReturned: { id: 'goatsReturned', title: 'The Gate Is Closed', tone: 'safe', text: 'The goats are back inside the yard, and {{farmhand}} closes the broken gate with a board. They keep a clean cloth over the cut arm; the roof still needs repair before the next shower.', choices: [
      { id: 'treatAfterGoats', label: 'Finish wrapping the cut arm', timeCost: 3, next: 'stormAftermath', effects: { setFlags: ['goatsReturned', 'armTreated'], historyFlags: ['treated_farmhand_after_storm'] } },
      { id: 'leaveAfterGoats', label: 'Leave the roof to the farm family', next: 'stormAftermath', effects: { setFlags: ['goatsReturned'] } },
    ] },
    roofSecured: { id: 'roofSecured', title: 'The Roof Held', tone: 'safe', text: 'Your line holds the loose roof corner against the eaves. The goats are still beyond the broken gate; {{farmhand}} keeps cloth over the cut arm. The family can repair the roof properly when the sky clears.', choices: [
      { id: 'fetchGoatsAfterRoof', label: 'Bring the goats back before dark', timeCost: 5, next: 'stormAftermath', effects: { setFlags: ['roofSecured', 'goatsReturned'], historyFlags: ['recovered_loose_goats_after_storm'] } },
      { id: 'leaveAfterRoof', label: 'Leave the family to finish repairs', next: 'stormAftermath', effects: { setFlags: ['roofSecured'] } },
    ] },
    stormAftermath: { id: 'stormAftermath', title: 'The Yard Settles', tone: 'safe', text: 'The next shower passes west of the farm. {{farmhand}} checks the yard while the family takes stock of what remains.', textVariants: [
      { requirements: { flags: ['goatsReturned', 'armTreated', 'roofSecured'] }, text: 'The goats are penned, {{farmhand}}’s arm is cleanly wrapped, and your line keeps the roof corner down until proper repairs. The next shower passes west. The family can finally take stock.' },
      { requirements: { flags: ['goatsReturned', 'armTreated'], notFlags: ['roofSecured'] }, text: 'The goats are penned and {{farmhand}}’s arm is cleanly wrapped. The roof still needs proper repair, but the next shower passes west. The family thanks you for settling two urgent worries.' },
      { requirements: { flags: ['goatsReturned', 'roofSecured'], notFlags: ['armTreated'] }, text: 'The goats are penned and the loose roof corner is held for now. {{farmhand}} keeps pressure on the cut arm while the next shower passes west. Two of the storm’s problems are settled.' },
      { requirements: { flags: ['armTreated', 'roofSecured'], notFlags: ['goatsReturned'] }, text: '{{farmhand}}’s arm is wrapped, and the roof corner is held until repairs. The goats remain beyond the broken gate, but the next shower passes west. Two of the storm’s problems are settled.' },
      { requirements: { flags: ['goatsReturned'], notFlags: ['armTreated', 'roofSecured'] }, text: 'The goats are penned again. {{farmhand}} keeps a clean cloth over the cut arm, and the roof still needs repair. The family thanks you for getting one urgent problem under control.' },
      { requirements: { flags: ['armTreated'], notFlags: ['goatsReturned', 'roofSecured'] }, text: '{{farmhand}}’s arm is cleanly wrapped. The goats remain beyond the gate and the roof still needs repair, but the injured worker can rest while the family tends them.' },
      { requirements: { flags: ['roofSecured'], notFlags: ['goatsReturned', 'armTreated'] }, text: 'Your line holds the roof corner until proper repairs. The goats remain beyond the gate, and {{farmhand}} still needs a clean wrap; the family knows what remains.' },
    ], choices: [{ id: 'takeLeaveFromFarm', label: 'Thank the family and return to the lane', next: 'helpedOnceEnding' }] },
    helpedOnceEnding: { id: 'helpedOnceEnding', title: 'Before Evening', tone: 'safe', ending: 'success', choices: [], text: 'The family sees you back to the lane. The storm has passed, and the work you chose to do remains done.', textVariants: [
      { requirements: { flags: ['goatsReturned', 'armTreated', 'roofSecured'] }, text: 'The worst of the immediate storm damage is under control: the goats are in, {{farmhand}} is treated, and the roof is held until repair.' },
      { requirements: { flags: ['goatsReturned', 'armTreated'] }, text: 'Two of the storm’s problems are settled before evening: the goats are safe in the yard and {{farmhand}}’s arm is wrapped. The roof remains for the family.' },
      { requirements: { flags: ['goatsReturned', 'roofSecured'] }, text: 'The goats are safe in the yard and the roof is held until repair. {{farmhand}}’s arm still needs care.' },
      { requirements: { flags: ['armTreated', 'roofSecured'] }, text: '{{farmhand}} is treated and the roof is held until repair. The goats remain loose beyond the gate.' },
      { requirements: { flags: ['goatsReturned'] }, text: 'You brought the goats back before they reached the road. The family still has the roof and {{farmhand}}’s arm to tend.' },
      { requirements: { flags: ['armTreated'] }, text: '{{farmhand}}’s arm is cleanly wrapped. The family takes over the goats and roof while you return to the lane.' },
      { requirements: { flags: ['roofSecured'] }, text: 'Your line holds the roof corner until repairs. The family takes over the loose goats and {{farmhand}}’s arm.' },
    ] },
    leftFarm: { id: 'leftFarm', title: 'Back to the Lane', tone: 'safe', ending: 'success', choices: [], text: 'You leave the farm to its family. The goats, roof, and cut arm remain for them to handle; the lane is clear for travel.' },
  },
};
