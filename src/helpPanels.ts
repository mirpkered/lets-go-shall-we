export const CONTACT_EMAIL = 'contact@mirpworks.com';
export const CONTACT_SUBJECT = 'Let’s Go, Shall We? — Feedback';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function contactMailto(adventureTitle?: string): string {
  const body = [
    'Type: Bug / Story Idea / Feedback / Other',
    '',
    `Adventure: ${adventureTitle || '[if applicable]'}`,
    '',
    'What happened / What’s your idea?',
    '',
    'If reporting a problem:',
    'What choice did you make just before it happened?',
    '',
    'Attach a screenshot if you have one.',
  ].join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}&body=${encodeURIComponent(body)}`;
}

export function renderUtilityFeatures(adventureTitle?: string): string {
  const href = escapeHtml(contactMailto(adventureTitle));
  const title = adventureTitle ? escapeHtml(adventureTitle) : '';
  return `
    <nav class="utility-links" aria-label="Help and contact utilities">
      <button type="button" class="utility-icon" data-open-help="about" aria-label="About" title="About"><span class="utility-question" aria-hidden="true">?</span></button>
      <button type="button" class="utility-icon" data-open-help="contact" aria-label="Contact Mirpworks" title="Contact Mirpworks"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg></button>
    </nav>
    <dialog class="utility-dialog" id="about-dialog" aria-labelledby="about-heading">
      <header class="utility-dialog-header">
        <h2 id="about-heading">About / How to Play</h2>
        <button type="button" class="utility-dialog-close" data-close-help aria-label="Close About">Close</button>
      </header>
      <div class="utility-dialog-body">
        <p class="utility-lede"><em>Let’s Go, Shall We?</em> is a collection of short interactive adventures. Each run gives you a situation, a handful of choices, and whatever consequences follow. There often isn’t one correct answer.</p>
        <section><h3>A life on the road</h3><p>You travel light, take work where you find it, and rarely stay anywhere long. Some days bring ordinary work. Others bring trouble. You can accept a job, lend a hand, or keep moving; no one adventure makes you a hero by default.</p></section>
        <section><h3>The World</h3><p>This is a fictional travel era inspired by the late 19th century: railroads, wagons, horses, ferries, lanterns, and long roads between towns. The exact year is left open. Modern automobiles, personal phones, electronics, and instant communication do not exist here; telegraphy is available only in some settlements.</p></section>
        <section><h3>How to play</h3><p>Read the situation and tap an available action. Choices move the story forward; paths can branch and end differently. No typing or parser is needed. Clues, preparation, equipment, knowledge, and your adventurer’s past may open safer or different options. Some risky actions involve chance, and danger is usually signaled; a failed choice may cost time, health, or an opportunity, but it does not always mean death. Several approaches may work. Sometimes the safest answer is not the most rewarding, and sometimes there is no perfect outcome.</p></section>
        <section><h3>Take your time</h3><p>There is no real-world timer. Read and decide at your own pace. Some actions take minutes or hours inside the story, and events may change if your adventurer spends time investigating. Time away from the game never advances the adventure clock.</p></section>
        <section><h3>Your adventurer and equipment</h3><p>A surviving adventurer can continue into later adventures with their money, lore, knowledge, carried item, and history of important decisions. There are no permanent stat levels. After a successful adventure, you may be offered items and choose one eligible item to carry. Carried gear can create options, but is not required, and not every item helps in every story.</p></section>
        <section><h3>The bank, death, and retirement</h3><p>Banked items are stored separately and survive death or retirement. If an adventurer dies or is retired, their carried gear, money, lore, knowledge, and personal history are lost; banked items remain. You can manage the bank between adventures.</p></section>
        <section><h3>Saving and leaving</h3><p>The game autosaves after meaningful choices. Closing the tab or app is safe: return later and choose <strong>Continue Adventure</strong>. Real-world time away does not pass in the story. <strong>Abandon Adventure</strong> intentionally ends the active run and loses that adventurer’s current progress and possessions; the bank stays safe.</p></section>
        <section><h3>Stories that remember</h3><p>A surviving adventurer carries a small history of important choices into future stories. People may occasionally have heard of something you did, but there is no fame score and recognition is never required. <strong>Begin Adventure</strong> selects a story for you, usually avoiding the one you played most recently when another is available. The surprise is intentional.</p></section>
        <section class="mirpworks-note"><h3>Mirpworks</h3><p>“Let’s play a game.”</p><a href="https://mirpworks.com/" target="_blank" rel="noopener noreferrer">Visit mirpworks.com <span aria-hidden="true">↗</span></a></section>
      </div>
    </dialog>
    <dialog class="utility-dialog contact-dialog" id="contact-dialog" aria-labelledby="contact-heading">
      <header class="utility-dialog-header">
        <h2 id="contact-heading">Contact Mirpworks</h2>
        <button type="button" class="utility-dialog-close" data-close-help aria-label="Close Contact">Close</button>
      </header>
      <div class="utility-dialog-body">
        <p class="utility-lede">Found a bug? A choice that doesn’t work, a continuity or text mistake, a layout problem, save trouble, or a balance concern? Useful feedback of every kind is welcome.</p>
        <p>If something looks wrong, screenshots are especially helpful. Attach one to your email if you can; this page does not upload screenshots.</p>
        <p>Got an idea for an adventure? Send it. Weird, serious, funny, dangerous—we want to hear it.</p>
        <p class="contact-adventure">${title ? `Adventure: <strong>${title}</strong>` : 'Adventure: Add the story name if it applies.'}</p>
        <a class="primary contact-email" href="${href}">Email Mirpworks</a>
        <p class="contact-address">Or email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      </div>
    </dialog>`;
}
