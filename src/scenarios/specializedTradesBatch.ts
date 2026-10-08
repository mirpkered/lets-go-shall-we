import { authorBatch } from './secondWaveTools';

export const SPECIALIZED_TRADE_ADVENTURES = authorBatch([
  {
    id: 'at-the-forge', title: 'At the Forge', subtitle: 'A blacksmith can use an extra pair of hands for ordinary work.',
    opening: 'A village blacksmith offers you half a day’s pay to sort deliveries and help customers while he works the forge. A farmer is waiting for a repaired hinge, and a carrier has brought a sack of coal. The smith will handle the hot iron himself.',
    routes: [
      { id: 'deliveries', label: 'Sort the coal and iron deliveries', title: 'At the Back of the Shop', text: 'The smith points out the coal bin and iron rack. You can stack the cool stock and keep the doorway clear, but he asks you to leave the glowing work to him.', outcomes: [
        { id: 'finish', label: 'Complete the half-day shift', title: 'A Fair Day’s Wage', text: 'The deliveries are sorted before the next customer arrives. The smith pays the agreed three coins and thanks you for careful work.', effects: { money: 3, historyFlags: ['worked_a_half_day_at_the_forge'] } },
        { id: 'leave', label: 'Stop when the deliveries are done', title: 'A Smaller Task', text: 'The smith pays one coin for the work completed. The coal is stacked, and no one pretends you have learned the trade in an afternoon.', effects: { money: 1 } },
      ] },
      { id: 'customer', label: 'Hear the farmer’s repair request', title: 'The Hinge Order', text: 'The farmer says the gate hinge should be ready today. The smith’s order book says tomorrow. Neither has the page that would settle when the promise changed.', outcomes: [
        { id: 'checkBook', label: 'Ask the smith to check his own book', title: 'The Smith Decides', text: 'The smith checks his notes and offers the farmer a temporary hinge until the proper one is ready. You do not promise work on his behalf.' },
        { id: 'carry', label: 'Carry the temporary hinge to the farm', title: 'A Useful Delivery', text: 'The smith gives you a cool, finished hinge to carry. The gate can close for the night, and the farmer agrees to return for the permanent repair.' },
      ] },
      { id: 'wait', label: 'Keep the doorway clear and greet customers', title: 'A Busy Shopfront', text: 'You direct customers to the counter and keep their horses outside the work area. The smith can finish the job without a crowd near the fire.', outcomes: [
        { id: 'paid', label: 'Stay through the agreed shift', title: 'Shop Work Finished', text: 'The smith pays the full three coins for the shift. You handled customers and stock, not the craft itself.', effects: { money: 3 } },
        { id: 'short', label: 'Leave after the morning rush', title: 'Half a Shift', text: 'The smith pays one coin for the time you worked. He has enough help for the quieter afternoon.' , effects: { money: 1 } },
      ] },
      { id: 'gloves', label: 'Use your Heavy Leather Gloves for cool stock', title: 'Rough Stock Sorted', text: 'Your gloves keep iron scale and rough edges off your hands while you stack cool stock. They do not make glowing iron safe to handle.', requirements: { items: ['heavyLeatherGloves'] , usableItems: ['heavyLeatherGloves']}, outcomes: [
        { id: 'finish', label: 'Complete the shift', title: 'A Careful Extra Hand', text: 'The smith appreciates the steady sorting and pays the agreed three coins. He still handles the forge work himself.', effects: { money: 3 } },
        { id: 'stop', label: 'Stop once the stock is stacked', title: 'A Limited Job', text: 'You finish the safe task and leave the hot work alone. The smith pays one coin for the help.' , effects: { money: 1 } },
      ] },
    ],
  },
  {
    id: 'the-morning-edition', title: 'The Morning Edition', subtitle: 'A small newspaper is short one pair of hands and one verified fact.', openingContext: 'newspaper',
    opening: 'A town printer needs help folding the morning edition and carrying bundles to the station. One advertisement accuses a rival shop of selling spoiled flour, but the editor has no source beyond an unsigned note. The train leaves in half an hour.',
    routes: [
      { id: 'bundles', label: 'Fold and bundle the printed sheets', title: 'Paper for the Road', text: 'The printer shows you how many copies go to the station and how many stay in town. Folding is easy; deciding what the paper should say belongs to the editor.', timeCost: 8, outcomes: [
        { id: 'carry', label: 'Carry the bundles to the station', title: 'The Edition Goes Out', text: 'You reach the platform before the train. The bundles arrive on time, while the editor keeps the unverified accusation out of the edition.' , effects: { money: 2 } },
        { id: 'stay', label: 'Finish the town bundles first', title: 'A Local Delivery', text: 'You deliver the copies to the shopkeepers on the square. The train leaves without the extra bundles, but the local edition is complete.' , effects: { money: 1 } },
      ] },
      { id: 'source', label: 'Ask the editor where the accusation came from', title: 'An Unsigned Note', text: 'The editor says the note was pushed under the door before dawn. No name or date supports it, and the rival shop has not been asked for a reply.', outcomes: [
        { id: 'hold', label: 'Suggest holding the accusation for now', title: 'A Claim Not Printed', text: 'The editor sets the note aside and prints only the verified market notices. They can investigate the claim later without presenting it as fact.' },
        { id: 'balance', label: 'Suggest asking the other shop first', title: 'A Chance to Answer', text: 'The editor sends a runner to request a comment. The accusation waits for another edition, and you return to the bundles.' },
      ] },
      { id: 'type', label: 'Help set a short public notice', title: 'A Notice for the Window', text: 'The printer gives you a copy of a confirmed road closure notice. You may sort the type by its marked case, but the printer checks the final line before it is set.', outcomes: [
        { id: 'print', label: 'Print the confirmed notice', title: 'Useful Information', text: 'The notice names the closed ford and the safe detour. It is posted in the window and included in the local bundles.' , effects: { knowledge: ['A confirmed newspaper notice gave travelers the ford closure and its detour.'] } },
        { id: 'fold', label: 'Leave the type to the printer', title: 'A Checked Edition', text: 'The printer sets the notice and checks each line. You fold the finished sheets for delivery.' },
      ] },
    ],
  },
  {
    id: 'hold-still', title: 'Hold Still', subtitle: 'A traveling photographer needs an assistant for a busy afternoon.', openingContext: 'fair',
    opening: 'A traveling photographer has set up a canvas studio beside the fair green. A family wants a portrait before the afternoon light changes. The photographer asks you to mind the queue and carry a covered glass plate case; the camera and chemicals remain in the photographer’s care.',
    routes: [
      { id: 'queue', label: 'Help the family take their turn', title: 'A Place Before the Backdrop', text: 'The photographer asks the family to stand close and keep still for a few seconds. You make room for the next customers and keep children from brushing the tripod.', outcomes: [
        { id: 'portrait', label: 'Wait for the exposure to finish', title: 'A Portrait Made', text: 'The plate is exposed and covered. The family leaves with a claim ticket and an appointment to collect the finished print.' },
        { id: 'carry', label: 'Carry the case to the covered wagon', title: 'The Plate Kept Safe', text: 'You carry the closed case carefully to the photographer’s wagon. The photographer checks the latch and thanks you for keeping it level.' },
      ] },
      { id: 'shade', label: 'Hold the canvas shade in place', title: 'Light on the Faces', text: 'A breeze lifts the edge of the shade. You hold the canvas pole while the photographer sets the exposure; you do not touch the glass plate or camera lens.', outcomes: [
        { id: 'finish', label: 'Keep the shade steady', title: 'A Clearer Sitting', text: 'The shade stays put long enough for the sitting. The photographer pays you a coin for the extra hand.' , effects: { money: 1 } },
        { id: 'fold', label: 'Fold the canvas after the sitting', title: 'Studio Packed Away', text: 'The sitting ends and you help fold the canvas. The photographer can pack before the wind rises.' },
      ] },
      { id: 'messenger', label: 'Carry a claim ticket to the inn', title: 'A Name on Paper', text: 'A customer left before receiving their claim ticket. The photographer gives you the paper and the inn’s location, asking you to hand it to the named guest.', outcomes: [
        { id: 'deliver', label: 'Deliver it to the guest', title: 'A Claim Returned', text: 'The guest recognizes the name and keeps the ticket for tomorrow’s print. The photographer pays you a coin for the errand.', effects: { money: 1 } },
        { id: 'return', label: 'Bring the ticket back unopened', title: 'Kept with the Photographer', text: 'The guest has already left the inn. You return the ticket to the photographer, who stores it with the day’s records.' },
      ] },
    ],
  },
  {
    id: 'the-undertakers-request', title: 'The Undertaker’s Request', subtitle: 'A practical errand helps a family prepare for a burial.',
    opening: 'An undertaker at a small town asks you to carry a sealed note to the deceased person’s sister, who lives two streets away. The funeral is tomorrow. The undertaker has arranged the service and needs the family to choose which coat should be laid out; nothing more is asked of you.',
    routes: [
      { id: 'deliver', label: 'Carry the note to the sister', title: 'A Message at Home', text: 'The sister reads the note privately and asks you to wait while she finds the family’s answer. She is composed but does not want a crowd at the door.', outcomes: [
        { id: 'return', label: 'Bring the sister’s answer back', title: 'The Coat Chosen', text: 'The sister chooses a dark coat and asks that it be returned clean. The undertaker thanks you and handles the rest.' },
        { id: 'leave', label: 'Let her deliver the answer herself', title: 'A Family Decision', text: 'She says she will visit the undertaker after supper. You return alone and leave her time to decide.' },
      ] },
      { id: 'clothes', label: 'Ask whether clothing needs collecting', title: 'A Small Bundle', text: 'The undertaker says a clean shirt and coat are at the family home. They can wait until the sister is ready; the burial arrangements are already in hand.', outcomes: [
        { id: 'carry', label: 'Offer to carry the chosen clothes', title: 'The Right Garment', text: 'The sister selects a coat and gives it to you in a cloth cover. You bring it to the undertaker without opening the bundle.' },
        { id: 'decline', label: 'Leave the errand to the family', title: 'No Hurry Tonight', text: 'The sister decides to bring the clothes herself in the morning. The undertaker says that is entirely fine.' },
      ] },
      { id: 'notice', label: 'Ask if relatives have been informed', title: 'A Name to Send For', text: 'The undertaker has written to one distant cousin but does not know whether the letter arrived. A nearby neighbor can confirm another relative’s address.', outcomes: [
        { id: 'write', label: 'Carry an address to the undertaker', title: 'A Useful Address', text: 'You bring back the neighbor’s address. The undertaker writes to the relative; whether they arrive in time is unknown.' },
        { id: 'no', label: 'Leave further messages to the family', title: 'Enough for Tonight', text: 'The sister says she will contact anyone else who needs to know. You do not turn the task into a larger search.' },
      ] },
    ],
  },
  {
    id: 'the-watchmaker', title: 'The Watchmaker', subtitle: 'A delayed repair and a timepiece that matters to its owner.', openingContext: 'market',
    opening: 'A watchmaker’s customer arrives expecting a pocket watch repaired today. The watchmaker found a worn spring and says the work needs another day. The customer says the watch belonged to their mother and must be ready before a departure tomorrow.',
    routes: [
      { id: 'listen', label: 'Hear the watchmaker’s explanation', title: 'A Small Spring', text: 'The watchmaker shows the removed spring and explains that forcing the case closed could damage the works. You cannot repair it, but you can help the customer understand the delay.', outcomes: [
        { id: 'wait', label: 'Ask the customer to return tomorrow', title: 'A Promise Kept Carefully', text: 'The customer agrees to wait one day and leaves a note with their destination in case the train schedule changes.' },
        { id: 'collect', label: 'Ask whether the watch can travel unrepaired', title: 'The Works Protected', text: 'The watchmaker packs the open case separately and explains that it should not be wound until repaired. The customer chooses to carry it carefully.' },
      ] },
      { id: 'record', label: 'Help compare the repair ticket', title: 'A Mark on the Ticket', text: 'The ticket records the day the watch was left but not a promised completion hour. The customer remembers being told “before the weekend”; the watchmaker remembers saying “by the weekend.”', outcomes: [
        { id: 'compromise', label: 'Suggest a small loan watch', title: 'A Temporary Timepiece', text: 'The watchmaker lends a simple clockwork watch for the journey. The repaired family watch stays safe on the bench.' },
        { id: 'apology', label: 'Let them agree on a new collection time', title: 'A Clearer Promise', text: 'They settle on a time tomorrow and write it on a fresh ticket. Neither has to pretend the earlier words were clearer than they were.' },
      ] },
      { id: 'loupe', label: 'Use your Assayer’s Loupe to read the maker’s mark', title: 'Letters under Glass', text: 'Your loupe makes a tiny maker’s stamp easier to read. The mark identifies the workshop that made the watch, not who owns it or how quickly it can be repaired.', requirements: { items: ['assayersLoupe'] , usableItems: ['assayersLoupe']}, outcomes: [
        { id: 'share', label: 'Read the mark aloud', title: 'A Detail Remembered', text: 'The customer recognizes the maker’s town from a family story. It brings comfort, though the watch still needs its replacement spring.' },
        { id: 'leave', label: 'Put the loupe away', title: 'No Claim Made', text: 'You return the loupe and let the customer decide how much the mark matters. The watchmaker keeps working at a careful pace.' },
      ] },
    ],
  },
]);
