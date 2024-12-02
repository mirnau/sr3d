import { flags } from '../helpers/CommonConsts.js';

export default async function displayShoppingStateButton(app, html, data) {
    const templatePath = "systems/sr3d/templates/injections/shopping-cart-button.hbs";

    // Render the initial shopping cart button
    const renderShoppingCart = async () => {
        const templateData = { actor: app.object }; // Include the app in the template context
        const renderedHTML = await renderTemplate(templatePath, templateData);

        // Replace or insert the button into the header
        const header = html.find('.window-header');
        const existingButton = header.find('.shopping-cart');
        if (existingButton.length) {
            existingButton.replaceWith(renderedHTML); // Replace existing button
        } else {
            html.find('.window-title').after(renderedHTML); // Insert initially
        }

        // Reattach click listener to the updated button
        header.find('.shopping-cart').on('click', async () => {
            let isActive = app.object.getFlag(flags.namespace, flags.isShoppingStateActive);
            isActive = !isActive;
            await app.object.setFlag(flags.namespace, flags.isShoppingStateActive, isActive);
            ui.notifications.info(`Shopping is now ${isActive ? 'enabled' : 'disabled'}.`);

            // Re-render the shopping cart button to reflect state change
            await renderShoppingCart();
        });
    };

    // Initial render of the shopping cart button
    await renderShoppingCart();
}
