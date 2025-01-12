import { observeMasonryResize } from "../../services/observeMasonryResize.js";

export function initActiveSkillMasonry(app, html, data) {
    const actor = app.actor;

    if (actor.activeSkillsResizeObserver) {
        actor.activeSkillsResizeObserver.disconnect();
        actor.activeSkillsResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.active-skills-masonry-grid',
        childSelector: '.active-skill-category',
        gridSizerSelector: '.active-grid-sizer',
        gutterSizerSelector: '.active-gutter-sizer',
        observer: actor.activeSkillsResizeObserver //keeping the reference so we can reach it from the actor
    };

    // Assign a new observer to the actor
    actor.activeSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}