import { cacheMasonryOnActor, cacheResizeObserverOnActor } from "../../sheets/Utilities.js";
import { getResizeObserver } from "../../services/initializeMasonry.js";

export function initActiveSkillMasonry(app, html, data) {
    const actor = app.actor;

    if (!actor.activeSkillsResizeObserver) 
        actor.activeSkillsResizeObserver = null; //I assume this has to be destroyed from the actor


        const masonryResizeConfig = {
            html: html,
            parentSelector: '.active-skills-masonry-grid',
            childSelector: '.active-skill-category',
            gridSizerSelector: '.active-grid-sizer',
            gutterSizerSelector: '.active-gutter-sizer',
            itemCSSVar: '--active-computed-item-width',
            gutterCSSVar: '--active-gutter-width',
            observer: actor.activeSkillsResizeObserver //keeping the reference so we can reach it from the actor
        };

        actor.activeSkillsResizeObserver = observeMasonryResize(actor, masonryResizeConfig);
}

function adjustMasonryOnResize(html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector, itemCSSVar, gutterCSSVar) {
    const grid = html[0]?.querySelector(parentSelector);
    const gridItems = html[0]?.querySelectorAll(childSelector);
    const gutterSizer = html[0]?.querySelector(gutterSizerSelector);
    const gridSizer = html[0]?.querySelector(gridSizerSelector);

    if (!grid || !gridItems.length || !gutterSizer || !gridSizer) return;

    const sampleItem = gridItems[0];
    const gutterPx = parseFloat(getComputedStyle(sampleItem).padding);
    const gridWidthPx = grid.offsetWidth;
    const minItemWidthPx = 184;

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

function observeMasonryResize(actor, masonryResizeConfig) {
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
            cacheMasonryOnActor(actor, masonryInstance, parentSelector);
            
            const func = () => adjustMasonryOnResize(
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
