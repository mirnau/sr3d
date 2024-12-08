import { observeMasonryResize } from "../../services/observeMasonryResize.js";

/**
 * Initializes masonry layout for actor attributes.
 * @param {Object} app - The application instance containing actor data.
 * @param {HTMLElement[]} html - The HTML content for the application.
 * @param {Object} data - Additional data passed to the app.
 */
export function initActiveSkillMasonry(app, html, data) {
    const actor = app.actor;

    // Ensure previous observer is cleared
    if (!actor.activeSkillsResizeObserver) {
        actor.activeSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.active-skills-masonry-grid',
        childSelector: '.active-skill-category',
        gridSizerSelector: '.active-grid-sizer',
        gutterSizerSelector: '.active-gutter-sizer',
        itemCSSVar: '--active-computed-item-width',
        gutterCSSVar: '--active-gutter-width',
        observer: actor.activeSkillsResizeObserver //keeping the reference so we can reach it from the actor
    };

    // Assign a new observer to the actor
    actor.attributeSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}