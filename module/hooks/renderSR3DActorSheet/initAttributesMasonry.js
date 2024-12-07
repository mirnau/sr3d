
import { cacheMasonryOnActor, cacheResizeObserverOnActor } from "../../sheets/Utilities.js";
import { getResizeObserver } from "../../services/initializeMasonry.js";

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
        itemCSSVar: '--attribute-computed-item-width',
        gutterCSSVar: '--attribute-gutter-width',
        observer: actor.attributeSkillsResizeObserver //keeping the reference so we can reach it from the actor
    };

    actor.attributeSkillsResizeObserver = attrObserveMasonryResize(actor, masonryResizeConfig);
}

function attrAdjustMasonryOnResize(html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector, itemCSSVar, gutterCSSVar) {
    const grid = html[0]?.querySelector(parentSelector);
    const gridItems = html[0]?.querySelectorAll(childSelector);
    const gutterSizer = html[0]?.querySelector(gutterSizerSelector);
    const gridSizer = html[0]?.querySelector(gridSizerSelector);

    if (!grid || !gridItems.length || !gutterSizer || !gridSizer) return;

    const sampleItem = gridItems[0];
    const gutterPx = parseFloat(getComputedStyle(sampleItem).padding);
    const gridWidthPx = grid.offsetWidth;
    const minItemWidthPx = 100;

    let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
    columnCount = Math.max(columnCount, 1);

    const totalGutterWidthPx = gutterPx * (columnCount - 1);
    const availableWidthPx = gridWidthPx - totalGutterWidthPx;
    const itemWidthPx = availableWidthPx / columnCount;
    const itemWidthPercent = (itemWidthPx / gridWidthPx) * 100;
    const gutterWidthPercent = (gutterPx / gridWidthPx) * 100;

    grid.style.setProperty(itemCSSVar, `${itemWidthPercent - 1.5}%`);
    grid.style.setProperty(gutterCSSVar, `${gutterWidthPercent}%`);
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
                percentPosition: true
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
        masonryResizeConfig.observer.observe(gridElement);
    }

    return masonryResizeConfig.observer;
}