import { observeMasonryResize } from "../../services/observeMasonryResize.js";

export function initializeMasonryLayout(app, html, data) {

    const actor = app.actor;

    // Ensure previous observer is cleared
    if (actor.mainLayoutResizeObserver) {
        actor.mainLayoutResizeObserver.disconnect();
        actor.mainLayoutResizeObserver = null;
    }

    // Configuration for masonry resize behavior
    const masonryResizeConfig = {
        html: html,
        parentSelector: '.sheet-masonry-grid',
        childSelector: '.sheet-component',
        gridSizerSelector: '.layout-grid-sizer ',
        gutterSizerSelector: '.layout-gutter-sizer',
        observer: actor.mainLayoutResizeObserver, //keeping the reference so we can reach it from the actor
        app: app
    };

    // Assign a new observer to the actor
    actor.mainLayoutResizeObserver?.disconnect();
    actor.mainLayoutResizeObserver = observeMasonryResize(actor, masonryResizeConfig, true);
}