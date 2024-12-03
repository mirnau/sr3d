import { initializeMasonry } from "../../services/initializeMasonry.js";

export function initializeMasonrlyLayout(app, html, data) {
    console.log("MASONRY | Initializing after sheet render");

    const selector = '.sheet-component';

    const gridElement = html[0]?.querySelector('.sheet-masonry-grid');

    if (gridElement) {
        if (!gridElement.masonryInstance) {
            const masonryInstance = new Masonry(gridElement, {
                itemSelector: selector,
                originLeft: true,
                gutter: 10,
            });
           
            initializeMasonry(masonryInstance, gridElement, selector);

        }
        
        gridElement.masonryInstance.layout();
    }
}