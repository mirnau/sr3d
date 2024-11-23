export function closeDeletedSheet(app, html, data) {
    // Check if the item exists
    const item = app.object;
    const itemExists = game.items?.get(item.id) || item.parent?.items?.get(item.id);

    if (!itemExists) {
        console.log(`Item with ID ${item.id} no longer exists. Closing the sheet.`);

        // Use a small delay to ensure the render process is completed before attempting to close
        setTimeout(() => {
            app.close();
        }, 10);
    }
}
