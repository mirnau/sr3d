export async function injectCreationSidebar(app, html) {
    const namespace = "sr3d";
    const creationStateFlag = "creation.complete";

    if (!app.actor.getFlag(namespace, creationStateFlag)) {
        const creationData = app.actor.system.creation;

        // Render the creation points template
        const templatePath = "systems/sr3d/templates/injections/creation-points.hbs";
        const renderedHTML = await renderTemplate(templatePath, { creation: creationData });

        // Inject after the header
        const header = html[0].querySelector("header.window-header");
        if (header) {
            header.insertAdjacentHTML("afterend", renderedHTML);
        }
    }
}