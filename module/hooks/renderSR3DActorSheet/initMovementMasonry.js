import { observeMasonryResize } from "../../services/observeMasonryResize.js";

/**
 * Initializes masonry layout for actor movements.
 * @param {Object} app - The application instance containing actor data.
 * @param {HTMLElement[]} html - The HTML content for the application.
 * @param {Object} data - Additional data passed to the app.
 */
export function initMovementMasonry(app, html, data) {
    const actor = app.actor;

    // Ensure previous observer is cleared
    if (!actor.movementSkillsResizeObserver) {
        actor.movementSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.movement-masonry-grid',
        childSelector: '.movement-card',
        gridSizerSelector: '.movement-grid-sizer',
        gutterSizerSelector: '.movement-gutter-sizer',
        itemCSSVar: '--movement-grid-sizer',
        observer: actor.movementSkillsResizeObserver
    };

    // Assign a new observer to the actor
    actor.movementSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}