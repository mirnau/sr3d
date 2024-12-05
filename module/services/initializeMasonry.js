import SR3DLog from '../SR3DLog.js'

export function getResizeObserver(masonryInstance, gridElement, selector) {

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => masonryInstance.layout());
    resizeObserver.observe(gridElement);

    gridElement.querySelectorAll('details').forEach((details) => {
        details.addEventListener('toggle', () => {
            masonryInstance.layout();
        });
    });

    SR3DLog.success(`Masonry Initiated for selector ${selector}`, getResizeObserver.name);

    return resizeObserver;
}