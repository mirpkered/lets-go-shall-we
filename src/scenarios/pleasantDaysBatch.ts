import type { Scenario } from '../types';

const ending = (id: string, title: string, text: string) => ({ id, title, text, ending: 'success' as const, choices: [] as [] });

export const MARKET_AFTERNOON: Scenario = {
  id: 'market-afternoon', title: 'Market Afternoon', subtitle: 'A few unhurried hours in a market town.', startScene: 'marketSquare',
  scenes: {
    marketSquare: { id: 'marketSquare', title: 'A Free Afternoon', tone: 'safe', text: 'The market is busy without being hurried. Baskets of apples line one stall, a cook sells hot hand pies, and a pair of musicians play beneath the guildhall eaves. You have no errand to finish before evening.', choices: [
      { id: 'browseMarket', label: 'Browse the stalls and compare wares', timeCost: 15, next: 'marketBrowsed', effects: { knowledge: ['The market town holds its main market on this square, beneath the guildhall eaves.'] } },
      { id: 'buyPie', label: 'Buy a warm hand pie for one coin', requirements: { minMoney: 1 }, timeCost: 10, effects: { money: -1 }, next: 'marketMeal' },
      { id: 'hearMarketMusic', label: 'Listen to the musicians awhile', timeCost: 12, next: 'marketMusic', effects: { historyFlags: ['spent_a_quiet_afternoon_listening_in_market'] } },
      { id: 'helpPackStall', label: 'Help a stallholder pack up a crate', timeCost: 12, next: 'marketHelped', effects: { money: 1 } },
    ] },
    marketBrowsed: ending('marketBrowsed', 'Nothing Needed', 'You compare ribbons, fruit, and small tools without finding anything you need more than your coin. The square is pleasant to wander, and the afternoon has gone by easily.'),
    marketMeal: ending('marketMeal', 'A Warm Lunch', 'The hand pie is hot from the cook’s oven, with a peppery filling and a crisp crust. You eat beneath the guildhall shade and return to the day at your own pace.'),
    marketMusic: ending('marketMusic', 'Music Under the Eaves', 'The tune changes twice while you listen. A few shoppers stop, a child claps along, and the market carries on around the music.'),
    marketHelped: ending('marketHelped', 'A Coin for the Crate', 'The stallholder pays you a coin for helping move the last crate under cover. The work is light, the goods are safe, and you have earned a little without turning the afternoon into a job.'),
  },
};

export const GONE_FISHING: Scenario = {
  id: 'gone-fishing', title: 'Gone Fishing', subtitle: 'A quiet bank, patient company, and whatever the water gives.', startScene: 'fishingBank',
  runRandomSelections: [{ id: 'fishingDay', values: [{ value: 'fish' }, { value: 'nothing' }, { value: 'oldFloat' }] }],
  scenes: {
    fishingBank: { id: 'fishingBank', title: 'A Place by the Water', tone: 'safe', text: 'A few local fishers sit along a slow, clear reach of the creek. One has room beside them and offers you a spare line. The bank is grassy and dry, and the water makes an easy sound over the stones.', choices: [
      { id: 'castLine', label: 'Try the spare line for a while', timeCost: 25, next: 'fishingResult' },
      { id: 'talkFishing', label: 'Ask about the creek and nearby places', timeCost: 10, next: 'fishingTalk', effects: { knowledge: ['Local fishers described the creek and the footpath beyond the bend.'] } },
      { id: 'sitFishing', label: 'Sit awhile and enjoy the quiet', timeCost: 15, next: 'fishingQuiet' },
      { id: 'leaveFishing', label: 'Thank them and continue down the road', next: 'fishingLeft' },
    ] },
    fishingResult: { id: 'fishingResult', title: 'A Little Time on the Line', tone: 'safe', text: 'The afternoon gives you a small, ordinary surprise.', textVariants: [
      { requirements: { selections: { fishingDay: 'fish' } }, text: 'A small trout takes the line. One of the local fishers helps you land it without a fuss; there is enough for supper if you want it.' },
      { requirements: { selections: { fishingDay: 'nothing' } }, text: 'Nothing takes the line. The fishers say that is how most afternoons go, and no one seems disappointed.' },
      { requirements: { selections: { fishingDay: 'oldFloat' } }, text: 'The line catches a carved wooden float that someone lost among the reeds. It is worn smooth and has no name on it.' },
    ], choices: [
      { id: 'sellSmallCatch', label: 'Offer the trout to a nearby cook', requirements: { selections: { fishingDay: 'fish' } }, next: 'fishSold', effects: { money: 1 } },
      { id: 'keepSmallCatch', label: 'Keep the catch for your own supper', requirements: { selections: { fishingDay: 'fish' } }, next: 'fishKept', effects: { historyFlags: ['kept_a_small_creek_catch_for_supper'] } },
      { id: 'askCreekName', label: 'Ask what locals call this stretch of creek', next: 'fishingTalk', effects: { knowledge: ['A local angler shared the name of the creek bend and a nearby footpath.'] } },
      { id: 'packFishingLine', label: 'Pack the line and head back', next: 'fishingLeft' },
    ] },
    fishingTalk: ending('fishingTalk', 'Names Along the Creek', 'The fishers tell you the creek bends around an alder stand before meeting the old footpath. They talk about a good season for trout and a better season for stories.'),
    fishingQuiet: ending('fishingQuiet', 'A Quiet Bank', 'You sit beside the creek until the light changes on the water. No catch or discovery is needed to make the pause worthwhile.'),
    fishSold: ending('fishSold', 'A Coin for Supper', 'The cook buys the small trout for a coin and promises to serve it that evening. You leave the bank with a little money and the pleasant smell of the cookfire behind you.'),
    fishKept: ending('fishKept', 'Supper from the Creek', 'You wrap the trout carefully to cook later. The local fishers wish you a good evening, and the rest of the creek can keep its own counsel.'),
    fishingLeft: ending('fishingLeft', 'Line Packed Away', 'You thank the fishers and return to the road. The creek keeps moving, whether you caught a fish or not.'),
  },
};

export const THE_COUNTY_FAIR: Scenario = {
  id: 'the-county-fair', title: 'The County Fair', subtitle: 'Music, games, food, and a little friendly competition.', startScene: 'fairGreen',
  scenes: {
    fairGreen: { id: 'fairGreen', title: 'A Day on the Fair Green', tone: 'safe', text: 'A county fair fills the green beyond town. A fiddle tune drifts from the bandstand, a baker sells buns, and a ring-toss game draws a cheerful crowd. Across the field, farmers show their patient animals and talk about feed and weather.', choices: [
      { id: 'fairRingToss', label: 'Try the ring toss for a small prize', timeCost: 10, chance: { probability: 0.48, successNext: 'fairWon', failureNext: 'fairMissed', successMessage: 'The ring settles over a peg, and the keeper hands you a small ribbon.', failureMessage: 'The ring bounces off the peg. The keeper grins and offers another player a turn.' } },
      { id: 'fairBun', label: 'Buy a bun and listen to the band', requirements: { minMoney: 1 }, timeCost: 15, effects: { money: -1 }, next: 'fairMusic' },
      { id: 'fairLivestock', label: 'Visit the livestock pens', timeCost: 12, next: 'fairPens', effects: { knowledge: ['The county fair is held on the green beyond town each autumn.'] } },
      { id: 'fairWalk', label: 'Wander the green and watch the crowd', timeCost: 12, next: 'fairWander' },
    ] },
    fairWon: ending('fairWon', 'A Small Ribbon', 'The ring lands cleanly. The keeper gives you a little blue ribbon, worth more as a keepsake than as a prize. You watch the next player try their luck.'),
    fairMissed: ending('fairMissed', 'A Near Miss', 'Your ring clips the peg and bounces away. The game costs no more than the turn you took, and the crowd keeps laughing kindly with every near miss.'),
    fairMusic: ending('fairMusic', 'A Tune and a Bun', 'You eat a warm bun near the bandstand. The tune is lively, the company easy, and no contest needs to be won.'),
    fairPens: ending('fairPens', 'The Patient Judging', 'The animals stand brushed and fed while neighbors compare the work that brought them here. You learn where the next fair is held, then leave the judging to those who raised them.'),
    fairWander: ending('fairWander', 'An Afternoon on the Green', 'Children chase a hoop along the path, a fiddler changes tunes, and the crowd thins toward the food stalls. The day has been bright and ordinary.'),
  },
};

export const A_GAME_OF_CARDS: Scenario = {
  id: 'a-game-of-cards', title: 'A Game of Cards', subtitle: 'A friendly hand in the common room.', startScene: 'cardTable',
  scenes: {
    cardTable: { id: 'cardTable', title: 'A Place at the Table', tone: 'safe', text: 'Three travelers are playing a familiar card game by the common-room stove. They invite you to join for one hand. The stakes are a single coin, and the players agree to keep it friendly; conversation is welcome even if you would rather not wager.', choices: [
      { id: 'playFriendlyHand', label: 'Play one hand for a single coin', requirements: { minMoney: 1 }, timeCost: 12, effects: { money: -1 }, chance: { probability: 0.5, successNext: 'cardsWon', failureNext: 'cardsLost', successEffects: { money: 2 }, successMessage: 'Your last card takes the hand. Your coin comes back with one more from the table.', failureMessage: 'Another player lays down the winning card. You lose only the one coin you agreed to stake.' } },
      { id: 'watchCards', label: 'Watch the hand and learn the rules', timeCost: 10, next: 'cardsWatched', effects: { knowledge: ['A friendly common-room card game used a simple trick-taking rule.'] } },
      { id: 'talkCards', label: 'Talk with the players between hands', timeCost: 10, next: 'cardsConversation' },
      { id: 'declineCards', label: 'Thank them and take your evening elsewhere', next: 'cardsDeclined' },
    ] },
    cardsWon: ending('cardsWon', 'A Narrow Win', 'You win one small pot, shake hands with the others, and let the next player take your chair. The evening remains a friendly game, not a test of fortune.'),
    cardsLost: ending('cardsLost', 'A Coin for the Table', 'You lose the single coin you chose to risk. The players thank you for the hand, and nobody presses for another.'),
    cardsWatched: ending('cardsWatched', 'The Shape of the Game', 'The rules become clear after watching one hand. You leave with no winnings, but with a new game to recognize the next time a common room grows quiet.'),
    cardsConversation: ending('cardsConversation', 'Between Hands', 'The players trade ordinary road stories and ask where you are headed. The cards wait while the talk runs on.'),
    cardsDeclined: ending('cardsDeclined', 'No Hand Tonight', 'The travelers nod and deal to the next person. There is no slight in passing on a game.'),
  },
};

export const THE_SWIMMING_HOLE: Scenario = {
  id: 'the-swimming-hole', title: 'The Swimming Hole', subtitle: 'A sheltered pool on a warm, peaceful day.', startScene: 'poolBank',
  runRandomSelections: [{ id: 'shoreCuriosity', values: [{ value: 'blueGlass' }, { value: 'smoothStone' }, { value: 'nothing' }] }],
  scenes: {
    poolBank: { id: 'poolBank', title: 'A Peaceful Pool', tone: 'safe', text: 'A broad, sheltered pool lies below the road, with a grassy bank and a shallow shelf of clean stone. A few locals are swimming and talking in the sun. The water is calm; your pack and clothes can stay on the dry bank while you wade.', choices: [
      { id: 'swimPool', label: 'Wade in and swim a little', timeCost: 20, next: 'poolSwum', effects: { historyFlags: ['spent_a_peaceful_afternoon_swimming'] } },
      { id: 'napPool', label: 'Rest in the shade above the bank', timeCost: 20, next: 'poolRested' },
      { id: 'lookPoolShore', label: 'Look among the pebbles by the water', timeCost: 8, next: 'poolShore' },
      { id: 'leavePool', label: 'Enjoy the view and continue on', next: 'poolLeft' },
    ] },
    poolShore: { id: 'poolShore', title: 'A Small Curiosity', tone: 'safe', text: 'The water laps gently at the stones. {{shoreFind}} Nothing here asks you to wade farther or risk your belongings.', textVariants: [
      { requirements: { selections: { shoreCuriosity: 'blueGlass' } }, text: 'A little blue glass has been smoothed by the water and left among the pebbles. It is pretty, though not valuable.' },
      { requirements: { selections: { shoreCuriosity: 'smoothStone' } }, text: 'You find a flat, smooth stone that would skip well across the pool. It is an ordinary bit of river stone.' },
      { requirements: { selections: { shoreCuriosity: 'nothing' } }, text: 'The pebbles are ordinary and the water is clear. There is nothing to find, which is fine.' },
    ], choices: [
      { id: 'keepPoolCuriosity', label: 'Take the small curiosity as a keepsake', next: 'poolKeepsake', effects: { historyFlags: ['kept_a_small_swimming_hole_curiosity'] } },
      { id: 'leavePoolCuriosity', label: 'Leave it where the water brought it', next: 'poolLeft' },
    ] },
    poolSwum: ending('poolSwum', 'Cool Water, Warm Sun', 'You swim where the water stays calm, then sit on the dry bank until the sun warms your shoulders. Nothing goes wrong; it is simply a pleasant stop.'),
    poolRested: ending('poolRested', 'An Easy Pause', 'You doze in the shade while the swimmers talk softly below. Your gear stays where you left it, and the afternoon asks nothing of you.'),
    poolKeepsake: ending('poolKeepsake', 'A Little Blue-Green Thing', 'You pocket the small stone or smoothed glass as a personal keepsake. It is not an upgrade or a treasure, only a reminder of a quiet place.'),
    poolLeft: ending('poolLeft', 'Back to the Road', 'You leave the pool and its calm company as you found it. The day continues without needing a surprise.'),
  },
};

export const SUPPER_WITH_STRANGERS: Scenario = {
  id: 'supper-with-strangers', title: 'Supper with Strangers', subtitle: 'A shared meal brings out a few road stories.', startScene: 'commonTable',
  runRandomSelections: [{ id: 'supperTopic', values: [{ value: 'road' }, { value: 'harvest' }, { value: 'river' }] }],
  scenes: {
    commonTable: { id: 'commonTable', title: 'A Place at the Common Table', tone: 'safe', text: 'The inn sets one long table for travelers who arrive near supper. Bread and stew are passed from hand to hand. No one asks for a grand introduction; the talk turns naturally to the roads people have taken.', choices: [
      { id: 'listenSupper', label: 'Listen to the travelers’ conversation', timeCost: 20, next: 'supperStories' },
      { id: 'shareSupperStory', label: 'Share a small story from your travels', timeCost: 12, next: 'supperShared', effects: { historyFlags: ['shared_a_travel_story_at_supper'] } },
      { id: 'askDestinationSupper', label: 'Ask where the other travelers are bound', timeCost: 8, next: 'supperDestinations' },
      { id: 'thankHostSupper', label: 'Thank the host and turn in early', next: 'supperQuiet' },
    ] },
    supperStories: { id: 'supperStories', title: 'Talk Around the Bread', tone: 'safe', text: 'One story catches your ear: {{supperTale}} The teller does not claim to know more than they saw.', textVariants: [
      { requirements: { selections: { supperTopic: 'road' } }, text: 'A carter says the old east road is dry again after last week’s rain; the low ford may still be muddy.' },
      { requirements: { selections: { supperTopic: 'harvest' } }, text: 'A farm worker says the southern villages finished cutting hay early this year and will have a lively harvest dance.' },
      { requirements: { selections: { supperTopic: 'river' } }, text: 'A ferryman says the river bends are shallow this season, though travelers should still ask locally after rain.' },
    ], choices: [
      { id: 'rememberRoadSupper', label: 'Remember the east road and ford', requirements: { selections: { supperTopic: 'road' } }, next: 'supperQuiet', effects: { knowledge: ['At supper, a carter said the east road was dry but the low ford might still be muddy.'] } },
      { id: 'rememberHarvestSupper', label: 'Remember the harvest dance', requirements: { selections: { supperTopic: 'harvest' } }, next: 'supperQuiet', effects: { lore: ['A southern village keeps a lively harvest dance after the hay is cut.'] } },
      { id: 'rememberRiverSupper', label: 'Remember the river bends', requirements: { selections: { supperTopic: 'river' } }, next: 'supperQuiet', effects: { knowledge: ['A ferryman said river bends are shallow this season, but can change after rain.'] } },
      { id: 'leaveSupperStories', label: 'Let the conversation drift on', next: 'supperQuiet' },
    ] },
    supperShared: ending('supperShared', 'A Story in Return', 'Your small story earns a laugh and another slice of bread. By the time the plates are cleared, the strangers have become easy company for an hour.'),
    supperDestinations: ending('supperDestinations', 'Different Roads Tomorrow', 'The travelers are bound to a mill, a cousin’s farm, and a town you have not visited. You leave the table with a few directions and the comfortable sense that everyone is going somewhere.'),
    supperQuiet: ending('supperQuiet', 'A Full Table', 'The stew is warm, the room is settled, and the talk can continue without you. You have learned what you wanted—or simply enjoyed hearing people speak.'),
  },
};

export const THE_MUSIC_OUTSIDE: Scenario = {
  id: 'the-music-outside', title: 'The Music Outside', subtitle: 'A few musicians have gathered where the road meets town.', startScene: 'streetMusic',
  scenes: {
    streetMusic: { id: 'streetMusic', title: 'A Tune by the Inn', tone: 'safe', text: 'Outside the inn, a fiddler and a small drum keep an easy tune. A few neighbors listen from the stoop; one couple dances on the packed earth. The musicians have set a cup nearby for anyone who wishes to leave a coin.', choices: [
      { id: 'listenStreetMusic', label: 'Listen to the tune from the stoop', timeCost: 12, next: 'musicListened', effects: { historyFlags: ['paused_to_listen_to_local_musicians'] } },
      { id: 'danceStreetMusic', label: 'Join the simple dance', timeCost: 10, next: 'musicDanced' },
      { id: 'talkStreetMusic', label: 'Ask the musicians what they play', timeCost: 7, next: 'musicTalk' },
      { id: 'tipStreetMusic', label: 'Leave a coin in their cup', requirements: { minMoney: 1 }, timeCost: 2, effects: { money: -1 }, next: 'musicTipped' },
    ] },
    musicListened: ending('musicListened', 'A Tune to Carry Along', 'The fiddler changes to a slower tune, and the drum keeps a soft beat beneath it. You listen until the last note, then carry on with the melody in your head.'),
    musicDanced: ending('musicDanced', 'A Turn on the Packed Earth', 'You join the easy steps. Someone laughs when the figures go out of order, and the musicians simply begin the refrain again.'),
    musicTalk: ending('musicTalk', 'A Tune from Home', 'The musicians explain that the tune comes from a village several days east. They play it once more for you, a little faster this time.'),
    musicTipped: ending('musicTipped', 'A Thankful Nod', 'The fiddler nods when you add a coin to the cup and continues the tune. The music belongs to the evening, not to any debt.'),
  },
};

export const THE_OLD_MANS_STORY: Scenario = {
  id: 'the-old-mans-story', title: 'The Old Man’s Story', subtitle: 'A long evening and a story told at its own pace.', startScene: 'storyBench',
  runRandomSelections: [{ id: 'eveningTale', values: [{ value: 'roadstone' }, { value: 'rainbow' }, { value: 'lostBell' }] }],
  scenes: {
    storyBench: { id: 'storyBench', title: 'The Bench by the Stove', tone: 'safe', text: 'An older traveler sits by the inn stove, polishing a small wooden whistle. They offer a story if you have time to listen. Their voice is calm and unhurried; there is no request for help or payment.', choices: [
      { id: 'hearEveningStory', label: 'Sit and listen to the story', timeCost: 25, next: 'storyHeard' },
      { id: 'askStoryOrigin', label: 'Ask where the story began', timeCost: 8, next: 'storyAsked' },
      { id: 'shareStoryBack', label: 'Share a memory of your own', timeCost: 10, next: 'storyShared' },
      { id: 'leaveStoryBench', label: 'Wish them a good evening and go', next: 'storyLeft' },
    ] },
    storyHeard: { id: 'storyHeard', title: 'A Story, Not a Promise', tone: 'safe', text: 'The traveler tells you something they remember from long ago. Whether every detail is true is left to the listener.', textVariants: [
      { requirements: { selections: { eveningTale: 'roadstone' } }, text: 'They remember a mile-marker that showed a road continuing after the old bridge had washed away. The marker was moved years later, but they still picture it at the bend.' },
      { requirements: { selections: { eveningTale: 'rainbow' } }, text: 'They once followed a rainbow to a field where a wedding feast was being packed away. The only treasure was a plate of plum cake someone had saved.' },
      { requirements: { selections: { eveningTale: 'lostBell' } }, text: 'They recall hearing a chapel bell from a hill where no chapel could be seen. They admit the sound may have carried from the next valley.' },
    ], choices: [
      { id: 'keepStoryAsLore', label: 'Keep the story as a bit of local lore', next: 'storyLeft', effects: { lore: ['An older traveler shared a remembered road tale by the inn stove.'] } },
      { id: 'askOneMoreStory', label: 'Ask one gentle question about it', timeCost: 5, next: 'storyAsked' },
      { id: 'thankStoryteller', label: 'Thank the traveler and turn in', next: 'storyLeft' },
    ] },
    storyAsked: ending('storyAsked', 'A Voice by the Stove', 'The older traveler answers what they can and admits what they cannot remember. The story has no duty to become a clue; it was pleasant to hear.'),
    storyShared: ending('storyShared', 'An Evening in Company', 'The traveler listens to your memory in turn. The stove ticks softly, and the two stories settle into the ordinary quiet of the inn.'),
    storyLeft: ending('storyLeft', 'The Last Embers', 'You leave the traveler to the stove and the rest of the evening. The story may be true, embellished, or simply remembered kindly.'),
  },
};

export const A_GOOD_NIGHTS_SLEEP: Scenario = {
  id: 'a-good-nights-sleep', title: 'A Good Night’s Sleep', subtitle: 'A comfortable inn, a wash basin, and no reason to hurry.', startScene: 'comfortableInn',
  scenes: {
    comfortableInn: { id: 'comfortableInn', title: 'A Comfortable Room', tone: 'safe', text: 'The inn is unusually quiet, the bed is clean, and the wash basin is filled with warm water. The innkeeper says supper will be ready soon and asks whether you need anything. Your pack can stay beside the bed while you settle in.', choices: [
      { id: 'takeWarmMeal', label: 'Eat the inn’s simple supper', requirements: { minMoney: 1 }, timeCost: 20, effects: { money: -1 }, next: 'sleptWell' },
      { id: 'washComfortableInn', label: 'Wash up with the warm basin water', timeCost: 12, next: 'sleptWell' },
      { id: 'talkComfortableInn', label: 'Share a little conversation downstairs', timeCost: 15, next: 'innConversation' },
      { id: 'sleepComfortableInn', label: 'Turn in early and sleep', timeCost: 30, next: 'sleptWell' },
    ] },
    innConversation: { id: 'innConversation', title: 'Quiet Talk Before Bed', tone: 'safe', text: 'The innkeeper tells you the baker starts before dawn and that the road is usually busiest after the market bell. No urgent news follows; the conversation is simply pleasant.', choices: [
      { id: 'sleepAfterTalk', label: 'Thank the innkeeper and turn in', timeCost: 20, next: 'sleptWell', effects: { knowledge: ['The baker starts before dawn, and the road is busiest after the market bell.'] } },
      { id: 'endInnConversation', label: 'Say good night and leave early', next: 'sleptWell' },
    ] },
    sleptWell: ending('sleptWell', 'Morning Comes Gently', 'You sleep in a clean bed with your belongings close at hand. Morning arrives quietly, and you have had a comfortable night.'),
  },
};

export const SKIPPING_STONES: Scenario = {
  id: 'skipping-stones', title: 'Skipping Stones', subtitle: 'A short pause beside a gentle reach of water.', startScene: 'riverbank',
  runRandomSelections: [{ id: 'shoreFind', values: [{ value: 'feather' }, { value: 'pottery' }, { value: 'nothing' }] }],
  scenes: {
    riverbank: { id: 'riverbank', title: 'A Quiet Reach', tone: 'safe', text: 'The river runs gently around a grassy bank. A traveler sits on a flat stone with a small pile of skipping stones nearby. There is room to sit without blocking the path, and no need to cross the water.', choices: [
      { id: 'skipStones', label: 'Try a few flat stones on the water', timeCost: 8, next: 'stonesSkipped', effects: { historyFlags: ['spent_a_quiet_pause_skipping_stones'] } },
      { id: 'talkBankTraveler', label: 'Ask the other traveler where they are bound', timeCost: 6, next: 'stonesConversation' },
      { id: 'inspectRiverbank', label: 'Look at the grass and stones nearby', timeCost: 4, next: 'bankCuriosity' },
      { id: 'leaveQuietRiver', label: 'Enjoy the river and continue on', next: 'bankLeft' },
    ] },
    bankCuriosity: { id: 'bankCuriosity', title: 'Something Small by the Bank', tone: 'safe', text: '{{bankFind}} It has no special value; you can leave it where it is or remember the moment and move along.', textVariants: [
      { requirements: { selections: { shoreFind: 'feather' } }, text: 'A gray feather lies caught in the grass above the waterline.' },
      { requirements: { selections: { shoreFind: 'pottery' } }, text: 'A small pottery shard, rounded at the edges, rests among the river stones.' },
      { requirements: { selections: { shoreFind: 'nothing' } }, text: 'You find only grass, stones, and the sound of the river.' },
    ], choices: [
      { id: 'rememberBankFind', label: 'Keep the little moment in mind', next: 'bankLeft', effects: { historyFlags: ['noticed_a_small_riverbank_curiosity'] } },
      { id: 'leaveBankFind', label: 'Leave it as you found it', next: 'bankLeft' },
    ] },
    stonesSkipped: ending('stonesSkipped', 'Three Skips', 'Your first stone skips once, the second three times, and the last sinks without a skip. The other traveler claims that one counted anyway.'),
    stonesConversation: ending('stonesConversation', 'Same River, Different Roads', 'The traveler is bound to a village downstream, while you have your own road to follow. You exchange a nod and let the river keep running between your destinations.'),
    bankLeft: ending('bankLeft', 'The River Keeps Moving', 'You leave the bank as quietly as you found it. It was a small pause, and that is enough.'),
  },
};

export const PLEASANT_DAY_ADVENTURES: Scenario[] = [MARKET_AFTERNOON, GONE_FISHING, THE_COUNTY_FAIR, A_GAME_OF_CARDS, THE_SWIMMING_HOLE, SUPPER_WITH_STRANGERS, THE_MUSIC_OUTSIDE, THE_OLD_MANS_STORY, A_GOOD_NIGHTS_SLEEP, SKIPPING_STONES];
