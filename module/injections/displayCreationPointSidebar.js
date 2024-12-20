import { flags } from "../helpers/CommonConsts.js"

export async function injectCreationSidebar(app, html) {

    if (app.actor.getFlag(flags.namespace, flags.isCharacterCreationState)) {
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