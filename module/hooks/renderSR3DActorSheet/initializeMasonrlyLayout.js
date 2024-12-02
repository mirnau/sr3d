export function initializeMasonrlyLayout(app, html, data) {
    console.log("MASONRY | Initializing after sheet render");

    const gridElement = html[0]?.querySelector('.sheet-masonry-grid');
    if (gridElement) initializeMasonry(gridElement);
}

function initializeMasonry(gridElement) {
    if (!gridElement) return;

    if (gridElement.masonryInstance) {
        gridElement.masonryInstance.destroy();
    }

    const masonryInstance = new Masonry(gridElement, {
        itemSelector: '.sheet-component',
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

    masonryInstance.layout();
}

