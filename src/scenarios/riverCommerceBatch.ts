import { authorBatch } from './secondWaveTools';

const riverCommerceAdventures = authorBatch([
  {
    id: 'before-the-steamer-leaves', title: 'Before the Steamer Leaves', subtitle: 'The cargo must be ready before the riverboat casts off.', openingContext: 'landing',
    opening: 'A riverboat leaves in an hour, and the dock foreman offers you two coins to help organize freight. The passenger trunks are on the dry platform; marked crates wait closer to the gangplank. The crew has already weighed the boat and set a clear load limit.',
    timePhases: [{ id: 'dock', label: 'Loading the boat', atMinutes: 0 }, { id: 'lastCall', label: 'Last call for freight', atMinutes: 20 }, { id: 'castOff', label: 'The lines are coming aboard', atMinutes: 35 }],
    routes: [
      { id: 'manifest', label: 'Compare crate marks with the list', title: 'A Count by the Gangplank', text: 'The manifest lists twelve flour crates and twelve are on the platform. One bears a smudged mark, but the number is still clear.', timeCost: 8, outcomes: [
        { id: 'load', label: 'Load the counted crates with the crew', title: 'A Correct Count', text: 'The crew loads the crates in the marked section and keeps the walkway clear. The foreman pays the agreed two coins.', effects: { money: 2 } },
        { id: 'ask', label: 'Ask the clerk to check the smudged mark', title: 'A Mark Confirmed', text: 'The clerk confirms the blurred mark belongs to the flour order. The crate goes aboard in its proper place.', effects: { money: 2 } },
      ] },
      { id: 'trunks', label: 'Keep passenger trunks apart from freight', title: 'The Dry Platform', text: 'A porter has set two trunks beside the freight crates by mistake. One tag is damp and its surname is hard to read; the boat leaves in less than half an hour. The porter can hold the trunks while you check the chalked passenger list or ask their owners to identify them.', timeCost: 6, outcomes: [
        { id: 'sort', label: 'Move the trunks to the passenger rack', title: 'Baggage Sorted', text: 'You move both trunks to the covered rack before the boat calls its passengers. As they settle, the porter notices the damp tag is too blurred to read from the gangplank.' , effects: { money: 2 } },
        { id: 'askOwner', label: 'Ask the waiting passengers to identify theirs', title: 'Owners Found', text: 'The passengers identify their luggage and thank the porter. The freight crew keeps to the marked crates.' , effects: { money: 2 } },
      ] },
      { id: 'lines', label: 'Help coil the spare mooring lines', title: 'Rope Along the Landing', text: 'The deckhand asks you to coil spare line on the shore side, away from the cargo path. It is ordinary dock work, not a task aboard the moving boat.', timeCost: 5, outcomes: [
        { id: 'paid', label: 'Finish the coil before the call', title: 'Ready to Cast Off', text: 'The line is neatly coiled and the landing stays clear. The foreman pays you two coins for the shift.', effects: { money: 2 } },
        { id: 'stop', label: 'Leave the rest to the deckhand', title: 'A Partial Shift', text: 'You coil the line within reach and step clear as the crew prepares to depart. The foreman pays one coin for the help.', effects: { money: 1 } },
      ] },
    ],
  },
  {
    id: 'the-missing-crate', title: 'The Missing Crate', subtitle: 'A tally has a gap between the warehouse and the vessel.', openingContext: 'landing',
    opening: 'A warehouse clerk hires you to help count a delivery before a riverboat departs. The bill lists six crates of glassware; five are on the dock. You saw a covered wagon arrive but did not watch it unload. The carrier and clerk both want a fair tally before signing.',
    runRandomSelections: [{ id: 'crateWhere', values: [{ value: 'wrongShed' }, { value: 'otherBoat' }, { value: 'damaged' }] }],
    routes: [
      { id: 'paper', label: 'Check the warehouse and dock tallies', title: 'Two Lists Compared', text: 'The warehouse copy records six crates leaving; the dock copy records five arriving. Neither list names the wagon driver who signed at the gate.', outcomes: [
        { id: 'holdSign', label: 'Ask both parties to wait before signing', title: 'A Count Left Open', text: 'The clerk and carrier agree to mark the bill as incomplete until the missing crate is located. Neither is charged on a guess.' },
        { id: 'note', label: 'Write down the exact difference', title: 'A Clear Record', text: 'You record the count of six sent and five received. The parties can make a claim later with the same facts in front of them.' },
      ] },
      { id: 'look', label: 'Search the nearby storage row', title: 'Crates by the Wall', text: 'Several covered crates wait in the wrong receiving row. One has the same painted color as the missing shipment, but its chalk mark is different.', outcomes: [
        { id: 'compare', label: 'Ask the clerk to compare the shipping mark', title: 'A Crate Found', text: 'The clerk recognizes the glassware mark on a crate placed in the wrong row. The tally is corrected and the carrier is cleared.' },
        { id: 'leave', label: 'Do not move it without the clerk', title: 'No Crate Disturbed', text: 'You point out the color and leave the crate in place. The clerk checks it and finds it belongs to another boat.' },
      ] },
      { id: 'ask', label: 'Ask the carrier where the wagon stopped', title: 'A Route Recalled', text: 'The carrier remembers stopping at a second landing to let a passenger board. They cannot say whether the crate was left there or transferred to another cart.', outcomes: [
        { id: 'message', label: 'Send a note to the second landing', title: 'A Message Downriver', text: 'A clerk agrees to check their shed when the next boat arrives. The missing crate may be found, but it is not yet accounted for.' },
        { id: 'claim', label: 'Let the carrier and clerk settle the bill', title: 'No Blame Assigned', text: 'You give both parties the route you heard and step aside. They agree to pause payment until the next tally arrives.' },
      ] },
    ],
  },
  {
    id: 'locked-through', title: 'Locked Through', subtitle: 'A canal boat waits while a lock keeper checks a stubborn gate.', openingContext: 'landing',
    opening: 'A canal boat waits above a lock while the keeper checks why the lower gate will not swing freely. Water remains within its banks. The keeper has sent for a mechanic and asks passengers to stay clear of the gate machinery.',
    routes: [
      { id: 'passengers', label: 'Help passengers wait on the towpath', title: 'A Patient Queue', text: 'You keep the footpath clear and tell passengers that a mechanic is coming. No one needs to climb on the gate or handle the lock gear.', outcomes: [
        { id: 'wait', label: 'Wait for the mechanic', title: 'The Gate Moves', text: 'The mechanic finds a loose piece of timber at the edge and removes it with the keeper. The boat continues through at the usual pace.' },
        { id: 'leave', label: 'Take the footpath to the next landing', title: 'On Foot beside the Canal', text: 'You walk the towpath toward the next landing. The boat remains safely moored while the keeper finishes the inspection.' },
      ] },
      { id: 'line', label: 'Help the crew keep the boat moored', title: 'A Line Held Fast', text: 'The boat’s deckhand shows you the safe shore post and asks you to watch the slack in a mooring line. The lock keeper keeps everyone away from the gate.', outcomes: [
        { id: 'steady', label: 'Hold the line while the boat settles', title: 'A Steady Mooring', text: 'The boat stays clear of the lock wall while the keeper works. The crew takes the line back when the mechanic arrives.' },
        { id: 'crew', label: 'Hand the line back to the deckhand', title: 'The Crew Takes Over', text: 'You return the line before it pulls tight. The trained deckhand keeps the vessel secured.' },
      ] },
      { id: 'message', label: 'Carry the keeper’s note to the next landing', title: 'Word Ahead', text: 'The keeper writes a short delay notice for the next landing, where passengers may be waiting to board. The road path follows the canal bank.', outcomes: [
        { id: 'deliver', label: 'Take the note by the towpath', title: 'Notice Delivered', text: 'The next keeper posts the delay notice on the landing board. Travelers can choose to wait or walk to the road.' },
        { id: 'return', label: 'Wait for the mechanic’s report', title: 'A Useful Update', text: 'You return with word that the gate is being checked, not abandoned. The passengers settle in for a short wait.' },
      ] },
    ],
  },
  {
    id: 'at-the-landing', title: 'At the Landing', subtitle: 'A delayed boat leaves passengers deciding how to spend the wait.', openingContext: 'landing',
    opening: 'A riverboat is an hour late at a quiet landing. A family with two trunks holds tickets for the next stop; a farm worker has no ticket but needs the same boat to reach a market before closing. The boat has room for all, but boarding order is disputed.',
    routes: [
      { id: 'tickets', label: 'Ask the clerk to check the ticket order', title: 'A Number on Paper', text: 'The clerk checks the tickets and confirms that no passenger has a reserved seat. The boat’s captain decides the order when the vessel arrives.', outcomes: [
        { id: 'wait', label: 'Leave the order to the captain', title: 'Boarding in Turn', text: 'The captain arrives and boards the family first because their trunks need stowing, then the farm worker. All travel together.' },
        { id: 'carry', label: 'Help the family move their trunks aside', title: 'Room at the Rail', text: 'The trunks are moved clear of the gangplank. When the boat arrives, everyone can board without blocking one another.' },
      ] },
      { id: 'market', label: 'Ask whether the worker can use the road', title: 'Another Way to Market', text: 'A farm cart is traveling toward town in an hour. It will arrive later than the boat but before the market closes.', outcomes: [
        { id: 'offer', label: 'Pass along the cart driver’s offer', title: 'A Second Route', text: 'The worker accepts the cart ride and leaves the landing. The family boards the boat without a dispute over priority.' },
        { id: 'decline', label: 'Let the worker decide privately', title: 'No Pressure', text: 'You give the worker the driver’s name but do not press. They decide whether waiting or walking better suits them.' },
      ] },
      { id: 'company', label: 'Keep the waiting passengers company', title: 'An Hour by the Water', text: 'You help keep the children away from the gangplank and share the bench with the worker. The delay is inconvenient, not dangerous.', outcomes: [
        { id: 'talk', label: 'Trade stories until the boat comes', title: 'A Shared Wait', text: 'The worker tells you about the market stalls, and the family joins in. The boat arrives to an easier crowd.' },
        { id: 'leave', label: 'Continue along the river road', title: 'The Boat Can Wait', text: 'You leave the landing before the boat appears. The clerk keeps your name in the book if a message comes.' },
      ] },
    ],
  },
]);

// This route has one extra authored judgment after the physical sorting: verify
// the unclear tag with the clerk, or ask the passengers and accept a slower check.
const steamer = riverCommerceAdventures.find(({ id }) => id === 'before-the-steamer-leaves')!;
const trunks = steamer.scenes.trunks;
const sortChoice = trunks.choices.find(({ id }) => id === 'trunks-sort')!;
sortChoice.next = 'baggageTally';
sortChoice.effects = undefined;
steamer.scenes.baggageTally = {
  id: 'baggageTally', title: 'One Tag Blurred', tone: 'warning',
  text: 'The trunks are on the covered passenger rack, but one tag has run into a gray blur. The clerk’s chalk list is still legible. A quick check can protect the right owner’s luggage, though the boat is beginning its final call.',
  choices: [
    { id: 'verifyBaggageTag', label: 'Compare the tag with the clerk’s list', timeCost: 5, next: 'baggageVerified', effects: { money: 2, historyFlags: ['carefully_verified_passenger_baggage'] } },
    { id: 'askBaggageOwners', label: 'Ask the passengers to identify each trunk', timeCost: 8, next: 'baggageOwnersConfirm', effects: { money: 1 } },
    { id: 'trustPorterBaggage', label: 'Trust the porter and leave the check for arrival', next: 'trunks-sort', effects: { money: 1 } },
  ],
};
steamer.scenes['trunks-sort'].text = 'The trunks go into the covered passenger rack, but the damp tag remains unreadable. The porter leaves a note for the far-stop clerk to confirm the owner before unloading. No trunk is lost, though the question travels with the boat; the foreman pays one coin for the work.';
steamer.scenes.baggageVerified = {
  id: 'baggageVerified', title: 'The Right Trunk Aboard', tone: 'safe', ending: 'success',
  text: 'The clerk matches the blurred tag to the passenger list before the trunk is carried aboard. The porter thanks you for catching the uncertainty; both owners find their luggage in the proper rack, and the foreman pays the agreed two coins.', choices: [],
};
steamer.scenes.baggageOwnersConfirm = {
  id: 'baggageOwnersConfirm', title: 'A Slower Count', tone: 'safe', ending: 'success',
  text: 'The passengers identify their own trunks, though one has to return from the ticket queue to do it. Both pieces go aboard safely; the delay costs part of your pay, and the foreman gives you one coin for the careful work.', choices: [],
};

export const RIVER_COMMERCE_ADVENTURES = riverCommerceAdventures;
