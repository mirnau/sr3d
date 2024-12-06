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

            const func = () => layoutStateMachine(app, html);
           
            resizeObserver = getResizeObserver(masonryInstance, gridElement, selector, func);

            const actor = app.actor;

            cacheMasonryOnActor(actor, masonryInstance);
            cacheResizeObserverOnActor(actor, resizeObserver);
        }
    }
}

function layoutStateMachine(app, html) {

    const sheetWidth = app.position?.width || 1400; // Default width
    const maxWidth = 1400;

    // Define thresholds for layout
    const lowerLimit = 0.5 * maxWidth; // 33% of maxWidth
    const middleLimit = 0.66 * maxWidth; // 60% of maxWidth

    // Determine layout state
    let layoutState = "small"; // Default to small layout
    if (sheetWidth > middleLimit) {
        layoutState = "wide";
    } else if (sheetWidth > lowerLimit) {
        layoutState = "medium";
    }

    // Column width percentages for each layout state
    const columnWidthPercent = {
        small: 100,
        medium: 49,
        wide: 32,
    };

    // Apply column width globally
    const columnWidth = columnWidthPercent[layoutState];
    html[0].style.setProperty("--column-width", `${columnWidth}%`);

    // Query components
    const twoSpanComponents = html[0].querySelectorAll(".two-span-selectable");
    const threeSpanComponents = html[0].querySelectorAll(".three-span-selectable");

    // State machine for component layout
    switch (layoutState) {
        case "small":
            // Small layout: Reset all spans to single column
            twoSpanComponents.forEach((component) => {
                component.style.width = `var(--column-width)`;
            });
            threeSpanComponents.forEach((component) => {
                component.style.width = `var(--column-width)`;
            });
            break;

        case "medium":
            // Medium layout: Two-span components span two columns
            twoSpanComponents.forEach((component) => {
                component.style.width = `calc(2 * var(--column-width) - 10px)`;
            });
            threeSpanComponents.forEach((component) => {
                component.style.width = `var(--column-width)`; // Reset to single column
            });
            break;

        case "wide":
            // Wide layout: Three-span components span three columns
            twoSpanComponents.forEach((component) => {
                component.style.width = `calc(2 * var(--column-width) - 10px)`;
            });
            threeSpanComponents.forEach((component) => {
                component.style.width = `calc(3 * var(--column-width) - 20px)`;
            });
            break;
    }
}
