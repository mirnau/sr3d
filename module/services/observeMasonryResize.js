import { getResizeObserver } from "./initializeMasonry.js";
import { cacheResizeObserverOnActor } from "../sheets/Utilities.js";
import { displayNewsFeed } from "../injections/displayNewsFeed.js";

/**
 * Observes and manages the resizing behavior for the masonry layout.
 * Sets up the observer to trigger grid adjustments on resize.
 * @param {Object} actor - The actor to associate with the observer.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 * @returns {ResizeObserver} - The resize observer instance.
 */
export function observeMasonryResize(actor, masonryResizeConfig, isMainGrid = false) {
    const { html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector, app } = masonryResizeConfig;
    const gridElement = html[0]?.querySelector(parentSelector);

    if (gridElement) {
        // Initialize Masonry if not already present
        if (!gridElement.masonryInstance && actor) {
            const masonryInstance = new Masonry(gridElement, {
                itemSelector: childSelector,
                columnWidth: gridSizerSelector,
                gutter: gutterSizerSelector,
                fitWidth: true
            });

            gridElement.masonryInstance = masonryInstance;

            if (isMainGrid) {
                gridElement.masonryInstance.on('layoutComplete', function () {
                });
            }

            let func = () => {
                adjustMasonryOnResize(masonryResizeConfig);
            };
            
            if (isMainGrid) {
                func = () => {
                    adjustMasonryOnResize(masonryResizeConfig);
                    layoutStateMachine(app, html);
                };
            }

            masonryResizeConfig.observer = getResizeObserver(masonryInstance, gridElement, childSelector, func);
        }

        // Layout the masonry instance
        if (gridElement.masonryInstance) {
            gridElement.masonryInstance.layout();
        }

        // Cache and observe the grid, so it can be discharged at distruction
        cacheResizeObserverOnActor(actor, masonryResizeConfig.observer);
        masonryResizeConfig.observer.observe(gridElement.parentNode);
    }

    return masonryResizeConfig.observer;
}/**
 * Adjusts grid items within the masonry layout on resize.
 * Ensures items fit perfectly within the parent container.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 */

export function adjustMasonryOnResize(masonryResizeConfig) {
    const { html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector } = masonryResizeConfig;
    const grid = html[0]?.querySelector(parentSelector);
    const gridItems = html[0]?.querySelectorAll(childSelector);
    const gridSizer = html[0]?.querySelector(gridSizerSelector);
    const gutter = html[0]?.querySelector(gutterSizerSelector);

    if (!grid || !gridSizer || !gridItems) return;
    if (gridItems.Length === 0) return;

    const parentPadding = parseFloat(getComputedStyle(grid.parentNode).paddingLeft) || 0;
    const gridWidthPx = grid.parentNode.offsetWidth - 2 * parentPadding;
    const gutterPx = parseFloat(getComputedStyle(gutter).width);
    const minItemWidthPx = parseFloat(getComputedStyle(gridItems[0]).minWidth);

    // Calculate the number of columns
    let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
    columnCount = Math.max(columnCount, 1); // Ensure at least one column


    // Calculate the exact item width
    const totalGutterWidthPx = gutterPx * (columnCount - 1);
    const itemWidthPx = (gridWidthPx - totalGutterWidthPx) / columnCount;

    // Adjust item width to ensure perfect fit
    const adjustedItemWidthPx = Math.floor(itemWidthPx);

    gridItems.forEach((item) => {
        item.style.width = `${adjustedItemWidthPx}px`;
    });

    // Dynamically adjust the grid sizer width
    gridSizer.style.width = `${adjustedItemWidthPx}px`;
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
        medium: 50,
        wide: 25,
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
