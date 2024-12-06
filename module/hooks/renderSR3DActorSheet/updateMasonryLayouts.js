import SR3DLog from "../../SR3DLog.js";

export function updateMasonryLayouts(app, html, data) {

    const layouts = app.actor.masonryLayouts;

    if (!layouts){ 

        SR3DLog.debug("Layouts empty!", updateMasonryLayouts.name);
        return;
    };

    layouts.forEach(layout => {
        layout.layout();
    });
}
