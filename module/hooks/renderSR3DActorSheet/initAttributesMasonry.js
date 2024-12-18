import { observeMasonryResize } from "../../services/observeMasonryResize.js";

/**
 * Initializes masonry layout for actor attributes.
 * @param {Object} app - The application instance containing actor data.
 * @param {HTMLElement[]} html - The HTML content for the application.
 * @param {Object} data - Additional data passed to the app.
 */
export function initAttributesMasonry(app, html, data) {
    const actor = app.actor;

    // Ensure previous observer is cleared
    if (!actor.attributeSkillsResizeObserver) {
        actor.attributeSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.attribute-masonry-grid',
        childSelector: '.stat-card',
        gridSizerSelector: '.attribute-grid-sizer',
        gutterSizerSelector: '.attribute-gutter-sizer',
        itemCSSVar: '--attribute-grid-sizer',
        observer: actor.attributeSkillsResizeObserver
    };

    // Assign a new observer to the actor
    actor.attributeSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}