import { getResizeObserver } from "../../services/initializeMasonry.js";
import { cacheMasonryOnActor, cacheResizeObserverOnActor } from "../../sheets/Utilities.js";

export function initializeMasonryLayout(app, html, data) {
    console.log("MASONRY | Initializing on start");

    const selector = '.sheet-component';

    const gridElement = html[0]?.querySelector('.sheet-masonry-grid');

    if (gridElement) {
        
        let masonryInstance = null;
        let resizeObserver = null;
        
        if (!gridElement.masonryInstance) {
            masonryInstance = new Masonry(gridElement, {
                itemSelector: selector,
                originLeft: true,
                gutter: 7,
            });
           
            resizeObserver = getResizeObserver(masonryInstance, gridElement, selector);

            const actor = app.actor;

            cacheMasonryOnActor(actor, masonryInstance);
            cacheResizeObserverOnActor(actor, resizeObserver);
        }
    }
}