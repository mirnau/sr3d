import SR3DLog from '../SR3DLog.js'

export function initializeMasonry(gridElement, selector, fitWidth, isPercentPosition) {
    if (!gridElement) return;

    let masonryInstance = gridElement.masonryInstance;

    if (!masonryInstance) {
        masonryInstance = new Masonry(gridElement, {
            itemSelector: selector,
            fitWidth: fitWidth,
            percentPosition: isPercentPosition,
            originLeft: true,
            gutter: 10,
        });

        gridElement.masonryInstance = masonryInstance;

        const resizeObserver = new ResizeObserver(() => masonryInstance.layout());
        resizeObserver.observe(gridElement);

        gridElement.querySelectorAll('details').forEach((details) => {
            details.addEventListener('toggle', () => {
                masonryInstance.layout();
            });
        });

        SR3DLog.success(`Masonry Initiated for selector ${selector}`, initializeMasonry.name);
    }

    // Ensure layout is called on the instance
    masonryInstance.layout();
}
