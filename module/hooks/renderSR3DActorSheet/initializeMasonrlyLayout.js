
export function initializeMasonrlyLayout(app, html, data) {
    console.log("MASONRY | Initializing after sheet render");

    const gridElement = html[0]?.querySelector('.sheet-masonry-grid');
    if (gridElement) initializeMasonry(gridElement);

    ///////////////////////////////////// INJECTION HACK BEGIN /////////////////////////////////////
    if (!app.actor.system.creation.complete) {
        // Check if all points are zero and set `incomplete` to false
        const { attributePoints, activePoints, knowledgePoints, languagePoints } = app.actor.system.creation;

        // Identify the actor sheet container
        const appElement = html[0]; // The root element of the actor sheet
        const header = appElement.querySelector("header.window-header");

        // Points and their localized labels
        const pointsData = [
            { points: attributePoints, label: game.i18n.localize("sr3d.item.skill.attributePoints") },
            { points: activePoints, label: game.i18n.localize("sr3d.item.skill.activePoints") },
            { points: knowledgePoints, label: game.i18n.localize("sr3d.item.skill.knowledgePoints") },
            { points: languagePoints, label: game.i18n.localize("sr3d.item.skill.languagePoints") }
        ];


        // Generate the HTML string dynamically
        const customHTML = pointsData.map(({ points, label }) => `
    <div class="attribute-position">
        <div class="attribute-point-container">
            <div class="attribute-fake-shadow"></div>
            <div class="attribute-points">
                <div class="attribute-point-text">
                    ${label}
                </div>
                <div class="attribute-point-value">
                    ${points}
                </div>
            </div>
        </div>
    </div>
`).join(""); // Combine all generated blocks


        // Inject the HTML after the header
        if (header) {
            header.insertAdjacentHTML("afterend", customHTML);
        }
    }

    ///////////////////////////////////// INJECTION HACK END /////////////////////////////////////
}// Utility function to initialize Masonry

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

    masonryInstance.layout();
}

