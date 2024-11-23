import { defaultImages } from "../../helpers/ItemImagePaths.js";

export async function onItemCreateIconChange(item, options, userId) {

    // Handle Metahuman Type
    if (item.type === "metahuman") {
        if (!item.img || item.img === defaultImages.default) {
            item.updateSource({ img: defaultImages.metahuman });
        }
        return; // No additional logic for metahuman
    }

    // Handle Weapon Type
    if (item.type === "weapon") {
        if (!item.img || item.img === defaultImages.default) {
            item.updateSource({ img: defaultImages.weapon });
        }
        return; // No additional logic for weapon
    }

    // Handle Weapon Type
    if (item.type === "skill") {

        if (!item.img || item.img === defaultImages.default) {
            item.updateSource({ img: defaultImages.skill.default });
        }
        return; // No additional logic for weapon
    }
}
