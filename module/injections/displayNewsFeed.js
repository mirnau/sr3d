export async function displayNewsFeed(app, html, data) {
    // INFO: Clear window of unwanted stuff
    const title = html.find('h4.window-title'); // Use jQuery object

    if (title.length) {
        title.empty(); // Clear the content inside <h4>
    }

    //html.find('i.fa-solid.fa-passport').remove(); // Remove unwanted icon


    // INFO: Set up the handlebars data context and html
    const htmlTemplate = "systems/sr3d/templates/injections/news-feed.hbs";
    const hbsDataContext = { actor: app.object };
    const renderedHTML = await renderTemplate(htmlTemplate, hbsDataContext);

    // INFO: Inject the HTML as content inside the <h4>
    title.html(renderedHTML);
}
