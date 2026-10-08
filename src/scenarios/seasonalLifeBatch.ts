import { authorBatch } from './secondWaveTools';

export const SEASONAL_LIFE_ADVENTURES = authorBatch([
  {
    id: 'first-snow', title: 'First Snow', subtitle: 'A light snowfall changes the road before anyone expected it.', openingContext: 'roadside', diversity: { distinctiveHook: 'A peaceful first-snow travel vignette offers shelter, useful work, or continued travel without forcing a crisis.', riskTier: 'LOW', availability: { season: 'WINTER', weightBoost: 1.5 } },
    opening: 'The season’s first snow begins as you reach a roadside inn. It is only a few inches deep, and the main road remains visible. The keeper is bringing in firewood; two travelers are deciding whether to stay the night or continue to the next settlement.',
    routes: [
      { id: 'shelter', label: 'Stay at the inn for the evening', title: 'A Warm Room', text: 'The inn has a spare bed and a place to dry your coat. The keeper says the road will be easier to judge in the morning.', outcomes: [
        { id: 'pay', label: 'Pay for the bed and supper', title: 'A Quiet Night', text: 'You pay the ordinary rate and eat with the other travelers. The snow stays light through the evening.', requirements: { minMoney: 1 }, effects: { money: -1 } },
        { id: 'share', label: 'Share the common room bench', title: 'Company by the Stove', text: 'The keeper makes room on the bench at no charge. You trade road notes until the fire burns low.' },
      ] },
      { id: 'wood', label: 'Help the keeper bring in firewood', title: 'Dry Wood under Cover', text: 'A few armloads are stacked beneath the porch roof. The snow is not deep enough to hide the path, and the wood is dry.', outcomes: [
        { id: 'meal', label: 'Accept a bowl of stew', title: 'Supper Earned', text: 'The keeper offers a bowl of stew in thanks. You spend the evening warm and fed without treating the first snow as a crisis.' },
        { id: 'continue', label: 'Set out while the road is still clear', title: 'A Short Walk before Dark', text: 'You thank the keeper and continue on the visible road before evening. The snow dusts your shoulders but does not slow you much.' },
      ] },
      { id: 'blanket', label: 'Wrap in your Wool Travel Blanket', title: 'A Warm Layer', text: 'Your compact blanket keeps warmth around your shoulders while you choose where to stop. It is useful comfort, not shelter from a storm.', requirements: { items: ['woolTravelBlanket'] , usableItems: ['woolTravelBlanket']}, outcomes: [
        { id: 'stay', label: 'Stay until morning', title: 'A Restful Stop', text: 'You settle in before the snow thickens. By morning, the road crew has cleared the main track.' },
        { id: 'walk', label: 'Continue to the next milepost', title: 'A Few More Miles', text: 'The blanket stays over your shoulders as you walk the clear main road to a nearer farm. The farm offers a dry place to sleep.' },
      ] },
    ],
  },
  {
    id: 'the-thaw', title: 'The Thaw', subtitle: 'Spring mud asks for patience more often than courage.', diversity: { distinctiveHook: 'A quiet spring-mud maintenance vignette contrasts small repair work with choosing a safer detour.', riskTier: 'LOW', availability: { season: 'SPRING', weightBoost: 1.5 } }, opening: 'The thaw has softened the road through a small farming district. A shallow creek runs wider than usual, and a fence rail lies beside the lane where the ground slumped. No one is trapped; the farmers are simply trying to keep carts and animals off the wettest ground.',
    routes: [
      { id: 'road', label: 'Help lay boards over the soft rut', title: 'A Plank across the Mud', text: 'A farmer has two spare boards and asks you to lay them across the rut. They will help an empty cart pass, but not a heavy wagon.', outcomes: [
        { id: 'place', label: 'Set the boards and test them on foot', title: 'A Narrow Crossing', text: 'The boards hold a person and a handcart. The farmer marks them as a temporary path until the ground dries.' },
        { id: 'wait', label: 'Leave the boards for the farmer’s cart', title: 'A Path Kept for Later', text: 'You decide not to make the crossing busier. The farmer saves the boards for the cart and you take the longer firm road.' },
      ] },
      { id: 'fence', label: 'Help set the fallen fence rail aside', title: 'A Rail beside the Lane', text: 'The rail has fallen into the muddy shoulder, not across the road. The farmer can mend the fence later; moving it will leave room for carts to pass.', outcomes: [
        { id: 'lift', label: 'Carry it to the dry side', title: 'Room along the Road', text: 'You carry the rail to firm ground and lean it against a post. The lane is clear, and the farmer plans to repair the fence after the thaw.' },
        { id: 'leave', label: 'Leave it where the farmer can reach it', title: 'No Extra Mud Tracked', text: 'The farmer retrieves the rail once the cart is unloaded. You avoid dragging it through the wet shoulder.' },
      ] },
      { id: 'cloak', label: 'Use your Weatherproof Cloak on the walk', title: 'A Dry Walk', text: 'Your cloak sheds the damp while you follow the higher road around the creek. It keeps you dry but does not change the ground beneath the cart.', requirements: { items: ['weatherproofCloak'] , usableItems: ['weatherproofCloak']}, outcomes: [
        { id: 'detour', label: 'Take the higher road to town', title: 'Firm Ground', text: 'The detour adds a little distance but avoids the soft lane. You reach town without asking the cart to cross the wet ground.' },
        { id: 'return', label: 'Return to the inn for the night', title: 'Wait for Firmer Ground', text: 'You go back to the inn and leave the crossing to the farmers who know the creek. By morning the water has begun to ease.' },
      ] },
    ],
  },
  {
    id: 'before-the-frost', title: 'Before the Frost', subtitle: 'A farmer hires extra hands to save what can be gathered before night.', openingContext: 'field', diversity: { distinctiveHook: 'The traveler chooses what work to prioritize before a forecast frost, with no way to save every crop.', riskTier: 'LOW', availability: { season: 'AUTUMN', weightBoost: 1.5 } },
    opening: 'An early frost is forecast for tonight. A small orchard still holds late apples, and the farmer offers two coins for an hour of gathering. The lower branches are ready; the highest fruit would take ladders and more time than the weather allows.',
    timePhases: [{ id: 'afternoon', label: 'Late afternoon', atMinutes: 0 }, { id: 'dusk', label: 'Dusk', atMinutes: 40 }, { id: 'night', label: 'Frost settling', atMinutes: 70 }],
    routes: [
      { id: 'gather', label: 'Pick the reachable apples first', title: 'The Lower Boughs', text: 'The lower branches carry enough fruit to fill several baskets. You can work steadily without climbing or rushing.', timeCost: 20, outcomes: [
        { id: 'continue', label: 'Fill baskets until the light fades', title: 'A Partial Harvest Saved', text: 'You fill the baskets that can be gathered safely. Some fruit remains high in the trees when the frost arrives.' , effects: { money: 2 } },
        { id: 'store', label: 'Carry the first baskets to the cellar', title: 'Fruit under Cover', text: 'The farmer carries the first baskets to the cool cellar. They are saved from frost, though the rest of the crop remains outside.' , effects: { money: 1 } },
      ] },
      { id: 'cloth', label: 'Help cover the young trees', title: 'Cloth around the Saplings', text: 'The farmer has old cloth and stakes for the youngest trees. Covering a few is possible, but there is not enough material for the whole orchard.', outcomes: [
        { id: 'near', label: 'Protect the smallest trees by the shed', title: 'A Few Trees Covered', text: 'The youngest trees near the shed are wrapped before dusk. The older trees are left to the weather, and no one claims the whole orchard is saved.' },
        { id: 'choose', label: 'Let the farmer choose which trees matter most', title: 'The Farmer’s Choice', text: 'The farmer selects the trees planted for a grandchild. The rest are left uncovered, a practical choice with no perfect answer.' },
      ] },
      { id: 'shelter', label: 'Move the gathered fruit indoors', title: 'The Cellar Door', text: 'Several baskets are already under the trees. The farmer asks you to carry them to the cellar before the frost starts.', outcomes: [
        { id: 'carry', label: 'Carry what is ready', title: 'What Could Be Saved', text: 'You move the gathered apples indoors. The farmer accepts that some fruit will be lost and thanks you for saving a useful portion.' , effects: { money: 2 } },
        { id: 'stop', label: 'Stop when the path grows dark', title: 'Work Ends at Dusk', text: 'You stop before carrying a full basket down the dark steps. The farmer finishes with a lantern and pays one coin for your help.' , effects: { money: 1 } },
      ] },
    ],
  },
  {
    id: 'new-years-eve', title: 'New Year’s Eve', subtitle: 'An inn sets out a modest supper for anyone still on the road.', diversity: { distinctiveHook: 'A low-stakes New Year gathering lets the traveler share a story, secure a morning seat, or simply listen.', riskTier: 'LOW', availability: { season: 'DECEMBER', weightBoost: 1.5 } },
    opening: 'Snow stays outside a small inn while the keeper lays bread, stew, and two candles on the common-room table. A schoolteacher is waiting for the morning coach; a teamster has no plans beyond a warm meal. The gathering is simple and open to travelers.',
    routes: [
      { id: 'supper', label: 'Join the shared supper', title: 'A Table before Midnight', text: 'The keeper asks each guest to bring a bowl and make room. The meal is plain, and no one is expected to give a speech.', outcomes: [
        { id: 'story', label: 'Share a small road story', title: 'A Story for the New Year', text: 'The teamster tells a funny tale about a mule that refused a bridge. Your own story brings another laugh, and the inn welcomes the year quietly.', effects: { historyFlags: ['shared_new_year_supper_on_the_road'] } },
        { id: 'listen', label: 'Listen to the others talk', title: 'Warmth and Conversation', text: 'You hear about a new school opening in spring and a teamster hoping for lighter loads. Midnight arrives without a grand event.' },
      ] },
      { id: 'coach', label: 'Ask whether the morning coach is confirmed', title: 'A Note from the Driver', text: 'The keeper has a note from the coach driver: the road is open, and the coach will leave at the usual hour if the snow stays light.', outcomes: [
        { id: 'stay', label: 'Book a place for the morning', title: 'A Confirmed Seat', text: 'The keeper reserves your seat and writes your name in the book. You can enjoy the evening without watching the road.' },
        { id: 'leave', label: 'Choose to walk after daylight', title: 'No Ticket Needed', text: 'You decide to travel on foot after breakfast. The coach carries whoever wants it, and the keeper refunds your place.' },
      ] },
      { id: 'help', label: 'Help set the table and carry in wood', title: 'Ready for Guests', text: 'You carry two armloads of wood from the shed and set bowls on the table. It is ordinary help on a cold evening.', outcomes: [
        { id: 'eat', label: 'Stay for a bowl', title: 'A Place at the Table', text: 'The keeper seats you with the others and will not take payment for the small favor. The evening passes pleasantly.' },
        { id: 'continue', label: 'Continue your journey after supper', title: 'A Good Beginning', text: 'You eat, thank the keeper, and leave after the road is quiet. The new year begins with a few warm hours behind you.' },
      ] },
    ],
  },
]);
