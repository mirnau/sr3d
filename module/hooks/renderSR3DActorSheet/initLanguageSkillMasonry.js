import { observeMasonryResize } from "../../services/observeMasonryResize.js";

export function initLanguageSkillMasonry(app, html, data) {

    const actor = app.actor;

    if (!actor.languageSkillsResizeObserver) 
        actor.languageSkillsResizeObserver = null; //I assume this has to be destroyed from the actor


        const masonryResizeConfig = {
            html: html,
            parentSelector: '.language-skills-masonry-grid',
            childSelector: '.language-skill-category',
            gridSizerSelector: '.language-grid-sizer',
            gutterSizerSelector: '.language-gutter-sizer',
            itemCSSVar: '--language-computed-item-width',
            gutterCSSVar: '--language-gutter-width',
            observer: actor.languageSkillsResizeObserver //keeping the reference so we can reach it from the actor
        };

        actor.languageSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}