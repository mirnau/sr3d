import { observeMasonryResize } from "../../services/observeMasonryResize.js";

/**
 * Initializes masonry layout for actor dicepools.
 * @param {Object} app - The application instance containing actor data.
 * @param {HTMLElement[]} html - The HTML content for the application.
 * @param {Object} data - Additional data passed to the app.
 */
export function initDicepoolMasonry(app, html, data) {
    const actor = app.actor;

    // Ensure previous observer is cleared
    if (actor.dicepoolSkillsResizeObserver) {
        actor.dicepoolSkillsResizeObserver.disconnect();
        actor.dicepoolSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.dicepool-masonry-grid',
        childSelector: '.stat-card',
        gridSizerSelector: '.dicepool-grid-sizer',
        gutterSizerSelector: '.dicepool-gutter-sizer',
        observer: actor.dicepoolSkillsResizeObserver
    };

    // Assign a new observer to the actor
    actor.dicepoolSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}