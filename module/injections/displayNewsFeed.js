export async function displayNewsFeed(app, html, data) {
    const title = html.find('h4.window-title');

    // Inject the HTML template
    const htmlTemplate = "systems/sr3d/templates/injections/news-feed.hbs";
    const hbsDataContext = { actor: app.object };
    const renderedHTML = await renderTemplate(htmlTemplate, hbsDataContext);

    title.before(renderedHTML);

    const newsFeed = html.find('.news-feed'); // Ensure targeting only one element
    const viewPort = html.find('.news-container');
    const newsFeedElement = html.find('.news-feed h1.no-margin');

    // Define animation control properties
    const animationControls = {
        speed: '20s', // Default animation speed
        percentBegin: '150%', // Default start position
        percentEnd: '-150%', // Default end position
    };

    // Apply initial animation properties
    newsFeed.css({
        '--seconds': animationControls.speed,
        '--percentBegin': animationControls.percentBegin,
        '--percentEnd': animationControls.percentEnd,
    });

    // Remove any existing listener to avoid duplicates
    newsFeed.off('animationend');
    newsFeed.on('animationend', (event) => {
        if (event.target !== newsFeed[0]) return; // Only handle the intended element

        const customEvent = new CustomEvent('newsFeedIterationCompleted', {
            detail: {
                actor: app.object instanceof Actor ? app.object : game.actors.get(app.object.id),
                html: newsFeedElement,
                cssElement: newsFeed,
                controls: animationControls,
                viewPort: viewPort,
            },
        });
        document.dispatchEvent(customEvent);
    });

    const injectedLink = html.find('.document-id-link-injection');
    if (!injectedLink.data('listener-added')) {
        injectedLink.on('click', async (event) => {
            event.preventDefault();

            const actorUuid = app.object.uuid;
            await navigator.clipboard.writeText(actorUuid);
            ui.notifications.info(`Copied UUID: ${actorUuid}`);
        });

        // Mark the link to indicate the listener is added
        injectedLink.data('listener-added', true);
    }
}
