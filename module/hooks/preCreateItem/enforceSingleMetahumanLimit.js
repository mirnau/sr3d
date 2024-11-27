import { GoblinizationDialog } from "../../dialogs/GoblinizationDialog.js";

export function enforceSingleMetahumanLimit(item, options, userId) {
    if (item.type === "metahuman") {
        const actor = item.parent;


        if (!actor) return; // If the item is not linked to an actor, allow creation.


        // Check if this is already a confirmed action (from dialog)
        if (item.flags?.sr3d?.confirmedGoblinization) {
            return true; // Allow item creation
        }

        // Check if the actor already has a metahuman item
        const existingMetahuman = actor.items.find(i => i.type === "metahuman");
        if (existingMetahuman) {
            // Warn the user and prevent the item creation
            ui.notifications.warn(`${actor.name} is already a part of meta-humanity.`);
            return false; // Cancel the creation
        }

        new GoblinizationDialog(actor, item).render(true);

        return false; // Prevent the item from being created automatically
    }

    return true;
}
