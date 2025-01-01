export async function injectFooter(app, html, data) {
    const appWindow = html.closest('.window-app');

    // Check if footer is already injected
    if (appWindow.length && !appWindow.find('.window-app-footer').length) {
        const templatePath = "systems/sr3d/templates/injections/footer.hbs";
        const footer = await renderTemplate(templatePath);

        // Append the footer to the .window-app
        appWindow.append(footer);
    } 
}