//import { attachObserver } from "/systems/sr3d/services/banana.js";

export function runActiveSkillsMasonryLayout(app, html, data) {

    let actor = app.actor;

    if (!actor.masonryInstances)
        actor.masonryInstances = [];

    if (!actor.observers)
        actor.observers = [];

    if (!actor.activeSkillsResizeObserver) {
        actor.activeSkillsResizeObserver = null;

        const actorSkillsMasonryInstance = observeMasonryResize(html, '.active-skills-masonry-grid', '.active-skill-category', '.active-grid-sizer', '.active-gutter-sizer',
            actor.activeSkillsResizeObserver, '--active-computed-item-width', '--active-gutter-width');

        actor.observers.push(actor.activeSkillsResizeObserver);
        actor.masonryInstances.push(actorSkillsMasonryInstance);
    }
}

export function adjustMasonryOnResize(html, parentSelector, childSelector, gridSizerSelector, gutterSizerSelector, itemProp, gutterProp) {
    const grid = html[0]?.querySelector(parentSelector);
    const gridItems = html[0]?.querySelectorAll(childSelector);
    const gutterSizer = html[0]?.querySelector(gutterSizerSelector);
    const gridSizer = html[0]?.querySelector(gridSizerSelector);

    // Ensure required elements exist
    if (!grid || !gridItems.length || !gutterSizer || !gridSizer) return;

    // Use padding as the gutter size in pixels
    const sampleItem = gridItems[0];
    const gutterPx = parseFloat(getComputedStyle(sampleItem).padding);

    // Grid area width in pixels (excluding margins)
    const gridWidthPx = grid.offsetWidth;

    // Minimum item width from grid-sizer
    const minItemWidthPx = 184;

    // Estimate column count
    let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
    columnCount = Math.max(columnCount, 1); // At least one column

    // Calculate the actual item width in percentage
    const totalGutterWidthPx = gutterPx * (columnCount - 1);
    const availableWidthPx = gridWidthPx - totalGutterWidthPx;
    const itemWidthPx = availableWidthPx / columnCount;
    const itemWidthPercent = (itemWidthPx / gridWidthPx) * 100;
    const gutterWidthPercent = (gutterPx / gridWidthPx) * 100;

    // Update CSS variables
    grid.style.setProperty(itemProp, `${itemWidthPercent - 1.5}%`);
    grid.style.setProperty(gutterProp, `${gutterWidthPercent}%`);
}

export function observeMasonryResize(html, parent, child, gridSizer, gutterSizer, observer, itemProp, gutterProp) {
    const gridElement = html[0]?.querySelector(parent);

    if (gridElement.masonryInstance) return gridElement.masonryInstance;

    const masonryInstance = new Masonry(gridElement, {
        itemSelector: child,
        columnWidth: gridSizer, // can be hardcoded to number, implcit px
        gutter: gutterSizer,
        percentPosition: true

    });

    //observer = attachObserver(masonryInstance, gridElement, parent);

    // Attach the Masonry instance to the grid element for reuse
    gridElement.masonryInstance = masonryInstance;

    // Initialize ResizeObserver
    observer = new ResizeObserver(([entry]) => {
        const { contentRect } = entry;

        if (!contentRect) return;

        const newWidth = Math.floor(contentRect.width);

        if (gridElement.dataset.lastWidth !== newWidth.toString()) {
            gridElement.dataset.lastWidth = newWidth;

            adjustMasonryOnResize(html, parent, child, gridSizer, gutterSizer, itemProp, gutterProp);
            gridElement.masonryInstance.layout();
        }
    });

    // Observe changes in grid size
    observer.observe(gridElement);
}