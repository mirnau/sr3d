export async function displayNewsFeed(app, html, data) {
    
    const title = html.find('h4.window-title');

    // NOTE: Could not find a way to get rid of the h4 tag,
    // which is injected by the core over and over
    // therefore I hid it in css/less with display: none

    const htmlTemplate = "systems/sr3d/templates/injections/news-feed.hbs";
    const hbsDataContext = { actor: app.object };
    const renderedHTML = await renderTemplate(htmlTemplate, hbsDataContext);

    title.before(renderedHTML);

    const injectedLink = html.find('.document-id-link-injection');
    injectedLink.on('click', async (event) => {
        event.preventDefault();

        const actorUuid = app.object.uuid;
        await navigator.clipboard.writeText(actorUuid);
        ui.notifications.info(`Copied UUID: ${actorUuid}`);
    });
}
