import type { SaveData, Scenario } from './types';

export const FEEDBACK_CATEGORIES = ['Bug', 'Confusing', 'Too short / weak payoff', 'Too repetitive', 'Balance / danger', 'UI / mobile', 'Story / content suggestion', 'Other'] as const;

export interface FeedbackContext {
  gameVersion: string;
  scenarioId?: string;
  scenarioTitle?: string;
  sceneId?: string;
  qaMode: boolean;
  activeRun: boolean;
  viewportClass: 'small' | 'large';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function feedbackContext(state: SaveData, scenarios: Scenario[], qaMode: boolean, viewportWidth: number): FeedbackContext {
  const scenarioId = state.run?.scenarioId ?? state.mostRecentScenarioId ?? undefined;
  const scenario = scenarios.find((entry) => entry.id === scenarioId);
  return {
    gameVersion: '0.1.0',
    ...(scenario ? { scenarioId: scenario.id, scenarioTitle: scenario.title } : {}),
    ...(state.run?.sceneId ? { sceneId: state.run.sceneId } : {}),
    qaMode,
    activeRun: state.run?.status === 'active',
    viewportClass: viewportWidth < 600 ? 'small' : 'large',
  };
}

export function feedbackAdventureTitle(state: Pick<SaveData, 'run' | 'mostRecentScenarioId'>, scenarios: Scenario[]): string | undefined {
  const scenarioId = state.run?.scenarioId ?? state.mostRecentScenarioId;
  return scenarios.find((scenario) => scenario.id === scenarioId)?.title;
}

export function renderUtilityFeatures(context?: FeedbackContext): string {
  const title = context?.scenarioTitle ? escapeHtml(context.scenarioTitle) : '';
  const contextJson = escapeHtml(JSON.stringify(context ?? { gameVersion: '0.1.0', qaMode: false, activeRun: false, viewportClass: 'small' }));
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
        <section><h3>The anonymous adventure count</h3><p>If the counter is available, an authored ending sends a random ID for that completed run so it can be counted only once. The counter stores those IDs and the shared total; it does not require an account or record story choices, inventory, character identity, or save data. Abandoned runs and QA play are not counted. If the counter is unavailable, your adventure still completes normally.</p></section>
        <section><h3>Stories that remember</h3><p>A surviving adventurer carries a small history of important choices into future stories. People may occasionally have heard of something you did, but there is no fame score and recognition is never required. <strong>Begin Adventure</strong> selects a story for you, usually avoiding the one you played most recently when another is available. The surprise is intentional.</p></section>
        <section><h3>Contact &amp; feedback privacy</h3><p>You can send feedback anonymously inside the game; no mail app opens. An optional reply address is used only if you ask for a response. Feedback goes to Mirpworks with the current adventure and scene IDs, game version, QA mode, active-run status, and a broad viewport class. No save file or traveler history is sent.</p></section>
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
        <p class="contact-privacy">Feedback can be anonymous. No mail app opens; only what you submit and the minimal diagnostic context below are sent to Mirpworks.</p>
        <p class="contact-adventure" data-feedback-adventure>${title ? `Adventure: <strong>${title}</strong>` : 'Adventure: General Feedback'}</p>
        <p class="contact-context-note">Current adventure information will be included to help diagnose the issue.</p>
        <form data-feedback-form data-context="${contextJson}">
          <label class="contact-category" for="feedback-category">Feedback type
            <select id="feedback-category" name="category" data-feedback-category required>
              ${FEEDBACK_CATEGORIES.map((entry) => `<option value="${escapeHtml(entry)}">${escapeHtml(entry)}</option>`).join('')}
            </select>
          </label>
          <label class="contact-field" for="feedback-message">Message <span>Required · up to 4,000 characters</span>
            <textarea id="feedback-message" name="message" data-feedback-message maxlength="4000" rows="5" required></textarea>
          </label>
          <label class="contact-field" for="feedback-reply">Optional reply email
            <input id="feedback-reply" name="replyEmail" type="email" maxlength="254" autocomplete="off" data-feedback-reply>
            <small>If you want a reply, enter an email address. Leave blank to stay anonymous.</small>
          </label>
          <label class="feedback-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabindex="-1" autocomplete="off" data-feedback-honeypot></label>
          <p class="feedback-status" data-feedback-status role="status" aria-live="polite">Ready to send. Your adventure will not be changed.</p>
          <div class="contact-form-actions">
            <button type="submit" class="primary" data-feedback-submit>Send feedback</button>
            <button type="button" class="text-button" data-close-help>Cancel</button>
          </div>
        </form>
      </div>
    </dialog>`;
}
