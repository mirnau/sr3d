import { observeMasonryResize } from "../../services/observeMasonryResize.js";

/**
 * Initializes masonry layout for item attributes.
 * @param {Object} app - The application instance containing item data.
 * @param {HTMLElement[]} html - The HTML content for the application.
 * @param {Object} data - Additional data passed to the app.
 */
export function initMetahumanMasonry(app, html, data) {
    const item = app.item;

    // Ensure previous observer is cleared
    if (!item.activeSkillsResizeObserver) {
        item.activeSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.etahuman-gri',
        childSelector: '.metahuman-sheet-component',
        gridSizerSelector: '.metahuman-grid-sizer',
        gutterSizerSelector: '.metahuman-gutter-sizer',
        observer: item.activeSkillsResizeObserver //keeping the reference so we can reach it from the item
    };

    // Assign a new observer to the item
    item.attributeSkillsResizeObserver = observeMasonryResize(item, masonryResizeConfig);
}