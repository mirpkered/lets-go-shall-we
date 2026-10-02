import { authorBatch } from './secondWaveTools';

export const QUESTIONABLE_EMPLOYMENT_ADVENTURES = authorBatch([
  {
    id: 'collection-day', title: 'Collection Day', subtitle: 'A hired errand asks you to collect a debt with an incomplete account.',
    opening: 'A shopkeeper offers you one coin to carry a payment notice to a former customer. The customer says the balance was partly paid after the last harvest and disputes the remaining amount. The shopkeeper’s book is not with you, and no one asks you to threaten them.',
    routes: [
      { id: 'notice', label: 'Deliver the notice and hear the reply', title: 'A Note at the Door', text: 'The customer reads the amount and explains the earlier payment. They can pay one coin now but cannot settle the whole claim today.', outcomes: [
        { id: 'partial', label: 'Offer the one coin as partial payment', title: 'Part of the Account', text: 'The customer gives a coin and asks for a written receipt. You carry both the coin and the request back to the shopkeeper.', effects: { money: 1 } },
        { id: 'report', label: 'Carry back the customer’s account', title: 'A Reply, Not a Payment', text: 'You return with the customer’s words but no money. The shopkeeper agrees to check the old ledger before sending anyone again.' , effects: { money: 1 } },
      ] },
      { id: 'book', label: 'Ask the shopkeeper for the written balance', title: 'A Number in the Book', text: 'The shopkeeper shows a ledger with a balance but no note of the customer’s claimed harvest payment. The book may be incomplete, not necessarily dishonest.', outcomes: [
        { id: 'copy', label: 'Copy the amount without collecting', title: 'A Clear Account', text: 'You copy the balance and bring it to the customer. They recognize the original loan but still dispute the missing payment.' , effects: { money: 1 } },
        { id: 'return', label: 'Ask the shopkeeper to check older pages', title: 'A Search through the Ledger', text: 'The shopkeeper finds an older entry that might record the payment. They decide to speak with the customer directly.' },
      ] },
      { id: 'decline', label: 'Decline to collect without clear terms', title: 'A Job Deferred', text: 'You say you will carry a message but not demand money without a clear account. The shopkeeper can choose to check the record or hire someone else.', outcomes: [
        { id: 'message', label: 'Offer to carry a neutral message instead', title: 'A Conversation Arranged', text: 'The customer agrees to meet the shopkeeper after market close. You are paid one coin for arranging the meeting, not for taking sides.', effects: { money: 1 } },
        { id: 'leave', label: 'Walk away from the job', title: 'No Collection Made', text: 'You return the notice and continue your day. The debt and its uncertain balance remain between the two people.' },
      ] },
    ],
  },
  {
    id: 'out-by-sundown', title: 'Out by Sundown', subtitle: 'A job moving a tenant’s belongings changes when you hear their side.',
    opening: 'A landlord hires you for two coins to help a tenant move out before sundown. The tenant says they paid the month’s rent to the previous owner and has a receipt in a travel chest. Their furniture is already packed, and the landlord waits in the yard.',
    routes: [
      { id: 'receipt', label: 'Ask to see the rent receipt', title: 'A Dated Paper', text: 'The receipt bears the former owner’s signature and a date before the property changed hands. It does not say whether the new landlord accepted the account.', outcomes: [
        { id: 'show', label: 'Show the receipt to the landlord', title: 'A Question for the Owner', text: 'The landlord reads the receipt and agrees to pause the move until they ask the former owner. No belongings are put out before sundown.' },
        { id: 'keep', label: 'Let the tenant keep the receipt private', title: 'Their Paper to Share', text: 'The tenant decides to show the receipt directly to the landlord. You do not take or copy it.' },
      ] },
      { id: 'job', label: 'Ask the landlord what work was agreed', title: 'A Narrow Job', text: 'The landlord says you are paid to carry furniture to the tenant’s cousin’s wagon, not to throw anything outside. The tenant confirms the wagon is waiting.', outcomes: [
        { id: 'carry', label: 'Help load the furniture into the wagon', title: 'A Move by Agreement', text: 'You carry the packed furniture to the waiting wagon. The tenant keeps the receipt, and the landlord pays the agreed two coins.' , effects: { money: 2 } },
        { id: 'delay', label: 'Pause until the receipt is discussed', title: 'An Hour to Talk', text: 'You do not move anything until the landlord reads the receipt. They agree to continue the conversation after checking their records.' },
      ] },
      { id: 'decline', label: 'Refuse to move belongings onto the road', title: 'A Boundary to the Job', text: 'You tell the landlord you will not put a person’s property out in the lane. The landlord says that was not the request and offers to pay you for moving it to the cousin’s wagon instead.', outcomes: [
        { id: 'accept', label: 'Accept the narrower task', title: 'A Move, Not a Removal', text: 'The tenant chooses what to load, and you carry the pieces they point out. The landlord pays two coins for the agreed work.' , effects: { money: 2 } },
        { id: 'leave', label: 'Decline and leave the yard', title: 'No Work Taken', text: 'You decide not to take the job. The tenant and landlord continue their discussion without your help.' },
      ] },
    ],
  },
  {
    id: 'the-mule-is-mine', title: 'The Mule Is Mine', subtitle: 'A collateral agreement and a disputed payment meet at a stable yard.',
    opening: 'A creditor asks you to accompany them to collect a mule pledged against a loan. The lender is away until afternoon, so the creditor carries the account papers. The borrower says the last payment cleared the debt; the creditor’s copy lists one balance still due. The mule is calm in its pen with feed and water. No one asks you to take the animal by force.',
    routes: [
      { id: 'paper', label: 'Compare the payment note with the pledge', title: 'Two Papers', text: 'The pledge names the mule and the loan. The payment note has a date but no creditor’s signature; the borrower says the lender was traveling that day.', outcomes: [
        { id: 'wait', label: 'Ask both to wait for the lender’s return', title: 'No Animal Moved', text: 'The creditor agrees to keep the mule in its pen until the lender can check the payment. The borrower remains responsible for feeding it.' },
        { id: 'copy', label: 'Copy both dates for the lender', title: 'A Record to Compare', text: 'You copy the two dates and leave both papers with their owners. The lender can review them without the mule changing hands.' },
      ] },
      { id: 'animal', label: 'Ask who is caring for the mule', title: 'The Mule’s Routine', text: 'The borrower has been feeding and brushing the mule. The creditor says they are willing to pay for its care if the agreement is enforced later.', outcomes: [
        { id: 'care', label: 'Agree on who feeds it while they talk', title: 'Care Continues', text: 'Both agree the borrower will keep feeding the mule for now, and the creditor will cover the cost if the claim is upheld.' },
        { id: 'step', label: 'Leave the animal out of the argument', title: 'A Quiet Pen', text: 'You step away from the pen. The mule remains with water and feed while the two people compare accounts.' },
      ] },
      { id: 'decline', label: 'Say you will not seize an animal on disputed papers', title: 'No Repossession by Guess', text: 'You tell the creditor the payment is disputed and will not lead the mule away without a clear agreement. The creditor does not press you.', outcomes: [
        { id: 'mediate', label: 'Offer to carry a meeting request', title: 'A Meeting Arranged', text: 'The borrower agrees to meet the lender with both papers. The creditor pays you one coin for arranging the visit, not for taking the mule.' , effects: { money: 1 } },
        { id: 'leave', label: 'Leave them to settle it', title: 'Still in the Yard', text: 'You leave the creditor and borrower to speak with the lender. The mule remains in its familiar pen.' },
      ] },
    ],
  },
  {
    id: 'the-sealed-crate', title: 'The Sealed Crate', subtitle: 'A high-paying delivery comes with a request not to inspect its cargo.',
    opening: 'A carrier offers you four coins to take a sealed crate by wagon to a warehouse two towns away. The bill of lading names the sender and destination but not the contents. The carrier says the seal must remain intact; you are free to decline before loading.',
    runRandomSelections: [{ id: 'crateContents', values: [{ value: 'household' }, { value: 'tobacco' }, { value: 'papers' }] }],
    routes: [
      { id: 'terms', label: 'Ask for a written receipt and delivery record', title: 'A Signed Transfer', text: 'The carrier adds the crate’s weight and seal mark to the receipt. The contents remain private, but responsibility for the delivery is now clear.', outcomes: [
        { id: 'carry', label: 'Carry it as agreed', title: 'Delivered under Seal', text: 'You deliver the crate to the named warehouse and receive the promised payment.', effects: { money: 4 }, textVariants: [
          { requirements: { selections: { crateContents: 'household' } }, text: 'The warehouse clerk opens the crate with the sender’s key and finds ordinary household crockery packed in straw. You receive the promised payment.' },
          { requirements: { selections: { crateContents: 'tobacco' } }, text: 'The warehouse clerk checks the sealed papers and receives several bales of tobacco. Their tax marks are a matter for the clerk, not something you could verify on the road. You receive the agreed payment.' },
          { requirements: { selections: { crateContents: 'papers' } }, text: 'The warehouse clerk checks the sealed papers and receives a stack of private account books. You deliver them unopened and receive the agreed payment.' },
        ] },
        { id: 'decline', label: 'Return the crate before leaving town', title: 'No Delivery Taken', text: 'You return the signed receipt and leave the crate with the carrier. The high payment is not enough to make the job suit you.' },
      ] },
      { id: 'ask', label: 'Ask why the seal must remain intact', title: 'A Private Shipment', text: 'The carrier says the crate contains a customer’s property and was sealed by the sender. They cannot tell you more without breaking the agreement.', outcomes: [
        { id: 'accept', label: 'Accept the explanation and take the job', title: 'A Sealed Delivery', text: 'You take the crate with a written receipt, keep it covered, and deliver it to the named warehouse.', effects: { money: 4 } },
        { id: 'refuse', label: 'Decline without inspecting it', title: 'A Job Passed By', text: 'You decline rather than break a seal or carry an unknown shipment. The carrier finds another driver.' },
      ] },
      { id: 'destination', label: 'Ask the warehouse to confirm the order', title: 'The Receiving Clerk', text: 'A telegraph clerk confirms the warehouse expects a sealed crate under this bill number. They cannot verify its contents from the message.', outcomes: [
        { id: 'deliver', label: 'Carry it to the confirmed address', title: 'The Right Warehouse', text: 'The receiving clerk signs the bill and takes the crate. The contents are recorded on their ledger, not shown to you.' },
        { id: 'hold', label: 'Ask the carrier to collect it instead', title: 'No Parcel in Your Hands', text: 'The carrier agrees to make the trip themselves. You have confirmed the address without accepting the job.' },
      ] },
    ],
  },
  {
    id: 'find-her', title: 'Find Her', subtitle: 'A paid search leads to someone who left deliberately.',
    opening: 'A mill owner offers two coins to find a former employee who left without collecting her final wages. The owner says she may have gone to her sister’s boarding house. You are asked to bring back an address, not to force anyone to return.',
    routes: [
      { id: 'boarding', label: 'Ask at the sister’s boarding house', title: 'A Visitor Recognized', text: 'The keeper confirms the woman is staying there and says she asked for privacy. She is safe and has found other work in town.', outcomes: [
        { id: 'message', label: 'Offer to carry a sealed wage notice', title: 'Wages Offered', text: 'The woman accepts a sealed notice and says she will collect the wages when she chooses. You leave without sharing her room or plans.' , effects: { money: 2 } },
        { id: 'withhold', label: 'Tell the owner only that she was found', title: 'Location Kept Private', text: 'You return the two coins’ worth of search work by confirming she is safe, but do not give the owner her address without permission.' , effects: { money: 2 } },
      ] },
      { id: 'sister', label: 'Ask the sister whether a message is welcome', title: 'A Message Can Wait', text: 'The sister says the woman will write when ready. She gives no address and does not ask you to deliver one.', outcomes: [
        { id: 'report', label: 'Tell the owner she may contact them herself', title: 'No Address Shared', text: 'The owner agrees to keep the wages in the account book. The woman can decide whether to claim them.' , effects: { money: 2 } },
        { id: 'leave', label: 'Return without further questions', title: 'Search Ended', text: 'You tell the owner only that the sister did not ask for a message. The owner keeps the wages available.' },
      ] },
      { id: 'decline', label: 'Decline to search without her consent', title: 'A Boundary Set', text: 'You tell the owner you will not track someone who left deliberately. The owner says the wages remain owed and may be claimed at the mill.', outcomes: [
        { id: 'record', label: 'Carry the wage amount to the boarding house', title: 'A Claim Made Clear', text: 'You carry only the amount due, not a demand to return. The woman can decide whether to send for it.' , effects: { money: 1 } },
        { id: 'walk', label: 'Leave the matter there', title: 'No Search Made', text: 'You decline the job and continue on. The owner and former employee can settle the wages if they choose.' },
      ] },
    ],
  },
]);

// Comparing dates changes the dispute, but the comparison itself is not the resolution.
const muleDispute = QUESTIONABLE_EMPLOYMENT_ADVENTURES.find(({ id }) => id === 'the-mule-is-mine')!;
const copiedAccount = muleDispute.scenes['paper-copy'];
copiedAccount.ending = undefined;
copiedAccount.text = 'You copy both dates and leave the originals with their owners. The lender is due back this afternoon and can compare the papers without the mule changing hands.';
copiedAccount.choices = [
  { id: 'bringPapersTogether', label: 'Wait and show both papers together', next: 'muleDatesCompared' },
  { id: 'leaveCopies', label: 'Leave the copies with the creditor', next: 'muleRecordHeld' },
];
muleDispute.scenes.muleDatesCompared = {
  id: 'muleDatesCompared', title: 'The Dates Do Not Settle It',
  text: 'The lender returns and reads the copied dates beside the originals. The payment note predates the pledge, but its missing signature leaves the last payment uncertain. The lender orders the mule to remain in its familiar pen while the borrower and creditor bring any witness tomorrow.',
  choices: [
    { id: 'confirmMuleCare', label: 'Ask who will pay for the feed tonight', next: 'muleCareAgreed', effects: { setFlags: ['muleCareAgreed'] } },
    { id: 'leaveAfterComparison', label: 'Leave them with the written plan', next: 'mulePlanRecorded' },
  ],
};
muleDispute.scenes.muleCareAgreed = {
  id: 'muleCareAgreed', title: 'The Mule Is Fed',
  text: 'The borrower keeps the usual feeding routine, and the creditor agrees to pay tonight’s feed while the claim is checked. The mule stays where it knows the water trough; your comparison has prevented a disputed paper from moving the animal before the lender could read it.',
  ending: 'success', choices: [],
};
muleDispute.scenes.mulePlanRecorded = {
  id: 'mulePlanRecorded', title: 'A Plan for Morning',
  text: 'The lender writes down that the mule will remain in the borrower’s pen until both can return with a witness. The payment is still disputed, but neither side can later claim the papers or the animal vanished before review.',
  ending: 'success', choices: [],
};
muleDispute.scenes.muleRecordHeld = {
  id: 'muleRecordHeld', title: 'A Copy Left Behind',
  text: 'The creditor keeps your copy and agrees to show it to the returning lender. The mule stays in its familiar pen for now; you leave knowing the date has been preserved, though no one has yet settled what it proves.',
  ending: 'success', choices: [],
};
