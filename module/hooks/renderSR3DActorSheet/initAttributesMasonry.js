
import { cacheResizeObserverOnActor } from "../../sheets/Utilities.js";
import { getResizeObserver } from "../../services/initializeMasonry.js";
import SR3DLog from "../../SR3DLog.js";

export function initAttributesMasonry(app, html, data) {

    const actor = app.actor;

    if (!actor.attributeSkillsResizeObserver)
        actor.attributeSkillsResizeObserver = null; //I assume this has to be destroyed from the actor


    const masonryResizeConfig = {
        html: html,
        parentSelector: '.attribute-masonry-grid',
        childSelector: '.attribute-card',
        gridSizerSelector: '.attribute-grid-sizer',
        gutterSizerSelector: '.attribute-gutter-sizer',
        itemCSSVar: '--attribute-grid-sizer',
        gutterCSSVar: '--attribute-gutter-width',
        observer: actor.attributeSkillsResizeObserver //keeping the reference so we can reach it from the actor
    };

    actor.attributeSkillsResizeObserver = attrObserveMasonryResize(actor, masonryResizeConfig);
}
// Adjust grid items to fit perfectly within the parent container

function attrAdjustMasonryOnResize(html, parentSelector, childSelector, gridSizerSelector, itemCSSVar) {
    const grid = html[0]?.querySelector(parentSelector);
    const gridItems = html[0]?.querySelectorAll(childSelector);
    const gridSizer = html[0]?.querySelector(gridSizerSelector);

    if (!grid || !gridSizer) return;

    const parentPadding = parseFloat(getComputedStyle(grid.parentNode).paddingLeft) || 0;
    const gridWidthPx = grid.parentNode.offsetWidth - 2 * parentPadding; // Subtract padding from available width
    const gutterPx = 7; // Fixed gutter size in pixels
    const minItemWidthPx = parseFloat(getComputedStyle(gridItems[0]).minWidth);


    // Calculate the number of columns
    let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
    columnCount = Math.max(columnCount, 1); // Ensure at least one column

    // Calculate the exact item width
    const totalGutterWidthPx = gutterPx * (columnCount - 1);
    const itemWidthPx = (gridWidthPx - totalGutterWidthPx) / columnCount;

    // Round to ensure perfect fit (use floor or ceil as necessary)
    const adjustedItemWidthPx = Math.floor(itemWidthPx);

    // Apply the calculated item width

    SR3DLog.inspect(`adjustedItem, ${adjustedItemWidthPx}`, attrAdjustMasonryOnResize.name)

    //grid.style.setProperty(childSelector, `${adjustedItemWidthPx}px`);
    grid.style.setProperty(itemCSSVar, `${adjustedItemWidthPx}px`);

    gridItems.forEach((item) => {
        item.style.width = `${adjustedItemWidthPx}px`;
    });

    // Dynamically adjust the grid sizer width
    gridSizer.style.width = `${adjustedItemWidthPx}px`;
}





function attrObserveMasonryResize(actor, masonryResizeConfig) {
    const { html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector, itemCSSVar, gutterCSSVar } = masonryResizeConfig;
    const gridElement = html[0]?.querySelector(parentSelector);

    if (gridElement) {
        // Initialize Masonry if needed
        if (!gridElement.masonryInstance && actor) {
            const masonryInstance = new Masonry(gridElement, {
                itemSelector: childSelector,
                columnWidth: gridSizerSelector,
                gutter: gutterSizerSelector,
                fitWidth: true,
            });

            gridElement.masonryInstance = masonryInstance;
            const func = () => attrAdjustMasonryOnResize(
                html,
                parentSelector,
                childSelector,
                gridSizerSelector,
                gutterSizerSelector,
                itemCSSVar,
                gutterCSSVar
            );

            masonryResizeConfig.observer = getResizeObserver(masonryInstance, gridElement, childSelector, func);
        }

        if (gridElement.masonryInstance) {
            gridElement.masonryInstance.layout();
        }

        cacheResizeObserverOnActor(actor, masonryResizeConfig.observer);
        masonryResizeConfig.observer.observe(gridElement.parentNode);
    }

    return masonryResizeConfig.observer;
}