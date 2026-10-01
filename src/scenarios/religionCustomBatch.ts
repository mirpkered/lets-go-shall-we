import { authorBatch } from './secondWaveTools';

export const RELIGION_CUSTOM_ADVENTURES = authorBatch([
  {
    id: 'the-wake', title: 'The Wake', subtitle: 'A family keeps a quiet evening in the house of a neighbor who has died.',
    opening: 'The innkeeper invites you to a neighbor’s wake in the front room. The neighbor died after a long illness, and family and friends have gathered with bread, tea, and stories. No one expects you to solve anything; your presence is enough if you choose to stay.',
    routes: [
      { id: 'listen', label: 'Listen to the stories', title: 'Remembered in Company', text: 'Two neighbors recall the same person differently: one remembers a patient gardener, another a sharp card player. Both stories bring a smile.', outcomes: [
        { id: 'share', label: 'Offer one small memory of your own', title: 'A Story Added', text: 'You share a modest kindness the neighbor showed a traveler years ago. The family thanks you for remembering it.', effects: { historyFlags: ['shared_a_memory_at_a_wake'] } },
        { id: 'quiet', label: 'Let the family continue', title: 'A Quiet Place to Sit', text: 'You listen without taking the floor. The family keeps its stories, and the room remains gentle.' },
      ] },
      { id: 'help', label: 'Help carry cups and bread', title: 'An Ordinary Task', text: 'A relative is busy welcoming people and asks you to help keep the tea table supplied. The work is simple and gives the family one less thing to mind.', outcomes: [
        { id: 'stay', label: 'Stay until the visitors begin to leave', title: 'The Evening Settles', text: 'You help clear the last cups. The family thanks each visitor as the room grows quiet.' },
        { id: 'leave', label: 'Leave when the family is settled', title: 'A Respectful Departure', text: 'You say good night to the host and return to the inn. No ceremony needs to be prolonged for your sake.' },
      ] },
      { id: 'request', label: 'Ask whether the family needs anything', title: 'A Small Request', text: 'The eldest daughter asks you to place a framed photograph on the mantel where everyone can see it. She gives it to you herself.', outcomes: [
        { id: 'place', label: 'Set the photograph on the mantel', title: 'In the Family Room', text: 'The photograph is placed beside the lamp, and relatives pause to look at it. The daughter thanks you.' },
        { id: 'return', label: 'Return it to the daughter', title: 'Kept Close', text: 'She changes her mind and keeps the photograph in her hands for a while. You give her the space she needs.' },
      ] },
    ],
  },
  {
    id: 'the-church-supper', title: 'The Church Supper', subtitle: 'A community meal, a long table, and a place to lend a hand.',
    opening: 'A small church holds its yearly supper in the meeting room. Stew and pies cover two tables, and neighbors are still arriving after work. The steward says a coin contribution is welcome but not required; there is room to eat either way.',
    routes: [
      { id: 'serve', label: 'Help carry dishes to the tables', title: 'A Place at the Long Table', text: 'The older volunteers show you which dishes go where. There are enough hands once the last tray arrives.', outcomes: [
        { id: 'eat', label: 'Sit down when the meal begins', title: 'Supper Together', text: 'You take a seat among people from several farms. Talk turns to the harvest and the road, and the meal goes on pleasantly.' },
        { id: 'clear', label: 'Stay to help clear afterward', title: 'The Work After Supper', text: 'You help stack plates and wipe the tables. The steward thanks you and sends you off with a wrapped piece of pie.' },
      ] },
      { id: 'contribute', label: 'Give a coin to the supper fund', title: 'A Small Contribution', text: 'The steward records the coin in the same book as every other gift. No one asks how much you can afford.', requirements: { minMoney: 1 }, effects: { money: -1 }, outcomes: [
        { id: 'meal', label: 'Join the meal', title: 'A Seat and a Bowl', text: 'You share stew with the neighbors. The contribution helps buy winter flour, but does not make you responsible for the fund.' , effects: { historyFlags: ['contributed_to_a_community_supper'] } },
        { id: 'talk', label: 'Ask what the fund supports', title: 'A Local Purpose', text: 'The steward says the money buys flour for the next gathering and leaves a little for the meeting-room roof. You leave with an ordinary piece of local knowledge.' , effects: { lore: ['The church supper fund buys flour for shared meals and helps maintain the meeting room.'] } },
      ] },
      { id: 'talk', label: 'Talk with people at the door', title: 'Names and News', text: 'A neighbor tells you who grows apples on the north road; another asks whether the ferry is running. Nobody needs an urgent answer tonight.', outcomes: [
        { id: 'join', label: 'Join the conversation at supper', title: 'An Easy Evening', text: 'You sit with the group and trade ordinary road stories. The gathering is its own reward.' },
        { id: 'depart', label: 'Thank the steward and continue on', title: 'A Pleasant Stop', text: 'You thank the volunteers and leave before the room grows crowded. The church supper carries on without you.' },
      ] },
    ],
  },
  {
    id: 'the-old-burial-ground', title: 'The Old Burial Ground', subtitle: 'A boundary question beside a quiet cemetery.',
    opening: 'A new road ditch has reached the edge of an old burial ground. The graveyard fence lies on one side of the marked plots, and a stone marker stands several paces inside the field. A farm owner says the marker marks the boundary; the church warden says it marks one family plot.',
    routes: [
      { id: 'records', label: 'Ask the warden for the old plot book', title: 'A Book of Names', text: 'The warden brings a worn ledger listing graves but no survey. The marker’s name appears in the book, though its exact position is not given.', outcomes: [
        { id: 'pause', label: 'Ask the road crew to pause beside the plots', title: 'Room to Check', text: 'The crew agrees not to dig near the marked graves until the parish and landowner compare their records. The roadwork can continue elsewhere.' },
        { id: 'copy', label: 'Copy the entry for both neighbors', title: 'A Shared Record', text: 'Both neighbors receive the same name and date from the ledger. They can discuss the boundary without relying on memory alone.' },
      ] },
      { id: 'marker', label: 'Look at the marker without moving it', title: 'A Stone in the Grass', text: 'The stone is weathered and sits in undisturbed ground. You do not shift it; its position may matter more than its inscription.', outcomes: [
        { id: 'describe', label: 'Describe its position to the warden', title: 'A Clear Description', text: 'You note its distance from the fence and the road ditch. The warden marks the spot so the crew can avoid it while the question is reviewed.' },
        { id: 'leave', label: 'Leave the decision to the neighbors', title: 'No Stone Moved', text: 'You step away from the graveyard. The warden and owner agree to speak with the parish before any fence is moved.' },
      ] },
      { id: 'road', label: 'Ask the crew where work can continue', title: 'A Different Stretch', text: 'The crew can shift its digging to the far end of the ditch for one day. It costs time but avoids the disputed strip.', outcomes: [
        { id: 'shift', label: 'Help mark the safe stretch', title: 'Work Away from the Graves', text: 'You set simple stakes along ground both sides agree is clear. The crew works there while the boundary question waits.' },
        { id: 'leave', label: 'Let the crew choose its next task', title: 'A Careful Pause', text: 'The foreman sends the crew to another section of the road. No grave is disturbed, and no one is asked to settle the claim on the spot.' },
      ] },
    ],
  },
]);
