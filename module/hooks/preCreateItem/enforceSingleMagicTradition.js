export function enforceSingleMagicTradition(item, options, userId) {
    if (item.type === "magicTradition") {
        const actor = item.parent; // Retrieve the owning actor from item.parent

        if (!actor) {
            ui.notifications.error("Magic Tradition items must be created within an actor's inventory.");
            return false; // Cancel the creation if no actor is found
        }

        // Check if the actor already has a magic tradition item
        const existingMagicTradition = actor.items.find(i => i.type === "magicTradition");
        if (existingMagicTradition) {
            ui.notifications.warn(`${actor.name} already follows a magic tradition.`);
            return false;
        }

        actor.awakenToMagic();

        ui.notifications.info("A spark of magic has been bestowed up on you!");

        return true;
    }

    return true;
}
