export async function injectFooter(app, html, data) {
    const appWindow = html.closest('.window-app');

    if (appWindow.length && !html.find('.window-app-footer').length) {
        const templatePath = "systems/sr3d/templates/injections/footer.hbs";
        const footer = await renderTemplate(templatePath);

        // Append the footer to the .window-app
        appWindow.append(footer);
    }
}
