export async function displayCreationPointSidebar(app, html) {
    if (!app.actor.system.creation.complete) {
        // Fetch the creation data
        const creationData = app.actor.system.creation;

        // Define the path to the Handlebars template
        const templatePath = "systems/sr3d/templates/injections/creation-points.hbs";


        // Render the template with the creation data
        const renderedHTML = await renderTemplate(templatePath, { creation: creationData });

        // Identify the actor sheet container
        const appElement = html[0]; // Root element of the actor sheet
        const header = appElement.querySelector("header.window-header");

        // Inject the rendered HTML after the header
        if (header) {
            header.insertAdjacentHTML("afterend", renderedHTML);
        }
    }
}
