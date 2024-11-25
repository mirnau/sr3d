
export function updateActorCreationPoints(actor, data, options, userId) {
    // Find the relevant application for this actor
    const app = Object.values(ui.windows).find(
        (window) => window.actor && window.actor.id === actor.id
    );

    if (app) {
        // Re-render the creation points dynamically
        const html = document.querySelector(`[data-appid="${app.appId}"]`);
        if (html) {
            updateCreationPointValues(app, html);
        }
    }
}

export function updateCreationPointValues(app, html) {
    const creationData = app.actor.system.creation;

    // Update each value dynamically
    for (const [key, value] of Object.entries(creationData)) {
        const element = html.querySelector(`[data-creation-key="${key}"] .attribute-point-value`);
        if (element) {
            element.textContent = value; // Update the text content with the new value
        }
    }
}