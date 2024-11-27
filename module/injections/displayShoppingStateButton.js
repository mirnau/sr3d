import { flags } from '../helpers/CommonConsts.js';

export default async function displayShoppingStateButton(app, html, data) {
    const templatePath = "systems/sr3d/templates/injections/shopping-cart-button.hbs";
    const renderedHTML = await renderTemplate(templatePath);
    html.find('.window-title').after(renderedHTML);

    html.find('.shopping-cart').on('click', async () => {
        let shoppingState = app.object.getFlag(flags.namespace, flags.shoppingState) ?? false;
        shoppingState = !shoppingState;
        await app.object.setFlag(flags.namespace, flags.shoppingState, shoppingState);
        ui.notifications.info(`Shopping is now ${shoppingState ? 'enabled' : 'disabled'}.`);
    });
}
