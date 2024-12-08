import { getResizeObserver } from "./initializeMasonry.js";
import { cacheResizeObserverOnActor } from "../sheets/Utilities.js";

/**
 * Observes and manages the resizing behavior for the masonry layout.
 * Sets up the observer to trigger grid adjustments on resize.
 * @param {Object} actor - The actor to associate with the observer.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 * @returns {ResizeObserver} - The resize observer instance.
 */
export function observeMasonryResize(actor, masonryResizeConfig) {
    const { html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector } = masonryResizeConfig;
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

            // Bind resize adjustment function
            const func = () => adjustMasonryOnResize(masonryResizeConfig);
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
    const { html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector, itemCSSVar } = masonryResizeConfig;
    const grid = html[0]?.querySelector(parentSelector);
    const gridItems = html[0]?.querySelectorAll(childSelector);
    const gridSizer = html[0]?.querySelector(gridSizerSelector);
    const gutter = html[0]?.querySelector(gutterSizerSelector);

    if (!grid || !gridSizer) return;

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
    grid.style.setProperty(itemCSSVar, `${adjustedItemWidthPx}px`);

    gridItems.forEach((item) => {
        item.style.width = `${adjustedItemWidthPx}px`;
    });

    // Dynamically adjust the grid sizer width
    gridSizer.style.width = `${adjustedItemWidthPx}px`;
}