import { observeMasonryResize } from "../../services/observeMasonryResize.js";

/**
 * Initializes masonry layout for actor karmas.
 * @param {Object} app - The application instance containing actor data.
 * @param {HTMLElement[]} html - The HTML content for the application.
 * @param {Object} data - Additional data passed to the app.
 */
export function initKarmaMasonry(app, html, data) {
    const actor = app.actor;

    // Ensure previous observer is cleared
    if (!actor.karmaSkillsResizeObserver) {
        actor.karmaSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.karma-masonry-grid',
        childSelector: '.karma-card',
        gridSizerSelector: '.karma-grid-sizer',
        gutterSizerSelector: '.karma-gutter-sizer',
        itemCSSVar: '--karma-grid-sizer',
        observer: actor.karmaSkillsResizeObserver
    };

    // Assign a new observer to the actor
    actor.karmaSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}