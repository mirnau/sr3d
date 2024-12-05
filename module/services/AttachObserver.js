
export function attachObserver(masonryInstance, gridElement, selector) {

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => masonryInstance.layout());
    resizeObserver.observe(gridElement);

    gridElement.querySelectorAll('details').forEach((details) => {
        details.addEventListener('toggle', () => {
            masonryInstance.layout();
        });
    });

    SR3DLog.success(`Masonry observer attached for Selector ${selector}`, attachObserver.name);

    return resizeObserver;
}
