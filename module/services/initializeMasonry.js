import SR3DLog from '../SR3DLog.js'

export function getResizeObserver(masonryInstance, gridElement, selector, func = null) {

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => {
        
        //Must be called inside the resize observer
        if(func) {
            
            func();
        }
        
        //Must be called inside the resize observer
        masonryInstance.layout()
    });
    
    resizeObserver.observe(gridElement);

    //SR3DLog.success(`Masonry Initiated for selector ${selector}`, getResizeObserver.name);

    return resizeObserver;
}