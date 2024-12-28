export default function enforceSingleMagic(item, options, userId) {
    if (item.type === "magic") {
        const actor = item.parent; // Retrieve the owning actor from item.parent

        // Check if the actor already has a magic tradition item
        const existingMagic = actor.items.find(i => i.type === "magic");
        if (existingMagic) {
            ui.notifications.warn(`${actor.name} already follows a magic tradition.`);
            return false;
        }

        actor.awakenToMagic();

        ui.notifications.info("A spark of magic has been bestowed up on you!");

        return true;
    }

    return true;
}
