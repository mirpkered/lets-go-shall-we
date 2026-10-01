export const CONTACT_EMAIL = 'contact@mirpworks.com';
export const CONTACT_SUBJECT = 'Let’s Go, Shall We? — Feedback';
export const FEEDBACK_CATEGORIES = ['Story / Choices', 'Bug', 'Something felt unfair', 'Something I liked', 'General feedback'] as const;

import type { SaveData, Scenario } from './types';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function feedbackAdventureTitle(state: Pick<SaveData, 'run' | 'mostRecentScenarioId'>, scenarios: Scenario[]): string | undefined {
  const scenarioId = state.run?.scenarioId ?? state.mostRecentScenarioId;
  return scenarios.find((scenario) => scenario.id === scenarioId)?.title;
}

export function contactMailto(adventureTitle?: string, category?: string): string {
  const body = [
    'Game: Let’s Go, Shall We?',
    '',
    `Adventure: ${adventureTitle || 'General Feedback'}`,
    ...(category ? [`Category: ${category}`] : []),
    '',
    'Feedback:',
    '',
    'What would you like to share?',
    '',
    'If reporting a problem, what happened just before it?',
    'A screenshot may help; attach one if you have it.',
  ].join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}&body=${encodeURIComponent(body)}`;
}

export function renderUtilityFeatures(adventureTitle?: string, category?: string): string {
  const href = escapeHtml(contactMailto(adventureTitle, category));
  const title = adventureTitle ? escapeHtml(adventureTitle) : '';
  return `
    <nav class="utility-links" aria-label="Help and contact utilities">
      <button type="button" class="utility-icon" data-open-help="about" aria-label="About" title="About"><span class="utility-question" aria-hidden="true">?</span></button>
      <button type="button" class="utility-icon" data-open-help="contact" aria-label="Contact and game feedback" title="Contact and game feedback"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg></button>
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
        <section><h3>Your adventurer and equipment</h3><p>A surviving adventurer can continue into later adventures with their money, lore, knowledge, equipment, and history of important decisions. There are no permanent stat levels. Gear capacity belongs to this traveler: one gear item at the start, two after ten completed adventures, and three after twenty. Rare relics are tracked separately from gear; limited-use supplies have quantities. After a successful adventure, prepare a loadout from eligible gear and relics for the next journey. Equipment can create options, but is not required, and not every item helps in every story.</p></section>
        <section><h3>The bank, death, and retirement</h3><p>Gear and relics stored in the five-place Bank survive death or retirement. Supplies, like other unbanked belongings, stay with their traveler. If an adventurer dies or is retired, their carried gear, relics, supplies, money, lore, knowledge, and personal history are lost; banked items remain. You can manage the Bank between adventures.</p></section>
        <section><h3>Saving and leaving</h3><p>The game autosaves after meaningful choices. Closing the tab or app is safe: return later and choose <strong>Continue Adventure</strong>. Real-world time away does not pass in the story. <strong>Abandon Adventure</strong> intentionally ends the active run and loses that adventurer’s current progress and possessions; the bank stays safe.</p></section>
        <section><h3>Stories that remember</h3><p>A surviving adventurer carries a small history of important choices into future stories. People may occasionally have heard of something you did, but there is no fame score and recognition is never required. <strong>Begin Adventure</strong> selects a story for you, usually avoiding the one you played most recently when another is available. The surprise is intentional.</p></section>
        <section class="mirpworks-note"><h3>Mirpworks</h3><p>“Let’s play a game.”</p><a href="https://mirpworks.com/" target="_blank" rel="noopener noreferrer">Visit mirpworks.com <span aria-hidden="true">↗</span></a></section>
      </div>
    </dialog>
    <dialog class="utility-dialog contact-dialog" id="contact-dialog" aria-labelledby="contact-heading">
      <header class="utility-dialog-header">
        <h2 id="contact-heading">Contact &amp; Feedback</h2>
        <button type="button" class="utility-dialog-close" data-close-help aria-label="Close Contact and Feedback">Close</button>
      </header>
      <div class="utility-dialog-body">
        <p class="utility-lede">Found something odd, unfair, confusing, or especially fun? Feedback is welcome.</p>
        <p>Tell us about bugs, confusing choices, continuity, consequences, stories you liked or disliked, item interactions that felt useful or forced—or anything else. Screenshots can help with a problem; attach one to your email if you like. This page does not upload them.</p>
        <p class="contact-adventure" data-feedback-adventure>${title ? `Adventure: <strong>${title}</strong>` : 'Adventure: General Feedback'}</p>
        <label class="contact-category" for="feedback-category">Optional category
          <select id="feedback-category" data-feedback-category>
            <option value="">No category</option>
            ${FEEDBACK_CATEGORIES.map((entry) => `<option value="${escapeHtml(entry)}"${entry === category ? ' selected' : ''}>${escapeHtml(entry)}</option>`).join('')}
          </select>
        </label>
        <a class="primary contact-email" data-contact-email href="${href}">Email Mirpworks</a>
        <p class="contact-address">Or email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      </div>
    </dialog>`;
}
