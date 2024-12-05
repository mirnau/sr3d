export function updateMasonryLayouts(app, html, data) {

    const layouts = app.actor.masonryLayouts;

    if (!layouts) return;

    layouts.forEach(layout => {
        layout.layout();
    });
}
