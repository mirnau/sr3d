import { observeMasonryResize } from "../../services/observeMasonryResize.js";

export function initLanguageSkillMasonry(app, html, data) {

    const actor = app.actor;

    if (actor.languageSkillsResizeObserver) 
        actor.languageSkillsResizeObserver.disconnect();
        actor.languageSkillsResizeObserver = null;


        const masonryResizeConfig = {
            html: html,
            parentSelector: '.language-skills-masonry-grid',
            childSelector: '.language-skill-category',
            gridSizerSelector: '.language-grid-sizer',
            gutterSizerSelector: '.language-gutter-sizer',
            observer: actor.languageSkillsResizeObserver //keeping the reference so we can reach it from the actor
        };

        actor.languageSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}