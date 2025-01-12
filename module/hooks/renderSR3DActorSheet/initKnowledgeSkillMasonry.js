import { observeMasonryResize } from "../../services/observeMasonryResize.js";

export function initKnowledgeSkillMasonry(app, html, data) {

    const actor = app.actor;

    if (actor.knowledgeSkillsResizeObserver) 
        actor.knowledgeSkillsResizeObserver.disconnect(); //I assume this has to be destroyed from the actor
        actor.knowledgeSkillsResizeObserver = null; //I assume this has to be destroyed from the actor

        const masonryResizeConfig = {
            html: html,
            parentSelector: '.knowledge-skills-masonry-grid',
            childSelector: '.knowledge-skill-item',
            gridSizerSelector: '.knowledge-grid-sizer',
            gutterSizerSelector: '.knowledge-gutter-sizer',
            observer: actor.knowledgeSkillsResizeObserver //keeping the reference so we can reach it from the actor
        };

        actor.knowledgeSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}