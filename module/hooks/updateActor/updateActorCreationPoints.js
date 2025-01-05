export function updateActorCreationPoints(actor, data, options, userId) {
    
    if (actor.system.type === "character") {
    _handleCreationPoints(actor);
    }
}

function _handleCreationPoints(actor) {
    const app = Object.values(ui.windows).find(
        (window) => window.actor && window.actor.id === actor.id
    );

    if (app) {
        const html = document.querySelector(`[data-appid="${app.appId}"]`);
        if (html) {
            _updateCreationPointValues(app, html);
        }
    }
}

function _updateCreationPointValues(app, html) {
    const creationData = app.actor.system.creation;

    for (const [key, value] of Object.entries(creationData)) {
        const element = html.querySelector(`[data-creation-key="${key}"] .attribute-point-value`);
        if (element) {
            element.textContent = value; // Update the text content with the new value
        }
    }
}