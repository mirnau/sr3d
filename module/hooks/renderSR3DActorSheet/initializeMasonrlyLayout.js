import { initializeMasonry } from "../../services/initializeMasonry.js";

export function initializeMasonrlyLayout(app, html, data) {
    console.log("MASONRY | Initializing after sheet render");

    const selector = '.sheet-component';

    const gridElement = html[0]?.querySelector('.sheet-masonry-grid');
    if (gridElement) initializeMasonry(gridElement,selector, false, false);

}


