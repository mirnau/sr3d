import SR3DLog from '../SR3DLog.js'

export function getResizeObserver(masonryInstance, gridElement, selector, func = null) {

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => {
        
        if(func) {
            
            func();
        }
        
        masonryInstance.layout()
    });
    
    resizeObserver.observe(gridElement);

    gridElement.querySelectorAll('details').forEach((details) => {
        details.addEventListener('toggle', () => {
            masonryInstance.layout();
        });
    });

    SR3DLog.success(`Masonry Initiated for selector ${selector}`, getResizeObserver.name);

    return resizeObserver;
}