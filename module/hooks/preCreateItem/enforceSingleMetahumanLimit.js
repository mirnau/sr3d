import { GoblinizationDialog } from "../../dialogs/GoblinizationDialog.js";

export async function enforceSingleMetahumanLimit(item, options, userId) {
    if (item.type === "metahuman") {
        const actor = item.parent;

        if (!actor) return;

        if (item.flags?.sr3d?.confirmedGoblinization) {
            return true;
        }

        const existingMetahuman = actor.items.find(i => i.type === "metahuman");

        if (!existingMetahuman) return false;

        if (existingMetahuman.name !== "Human") {
            ui.notifications.warn(`${actor.name} is already a part of meta-humanity.`);
            return false; // Cancel the creation
        }

        const isGoblin = await GoblinizationDialog.show(actor, item);

        if (isGoblin) {
            await actor.deleteEmbeddedDocuments("Item", [existingMetahuman.id]);
            return true;
        }

        return false;
    }

    return true;
}
