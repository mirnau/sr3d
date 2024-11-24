import { defaultImages } from "../../helpers/ItemImagePaths.js";

export async function onItemCreateIconChange(item, options, userId) {
    const itemSubtype = {
        metahuman: {
            name: "metahuman",
            localization: "sr3d.item.metahuman.newMetaHuman",
            defaultImg: defaultImages.metahuman
        },
        weapon: {
            name: "weapon",
            localization: "sr3d.item.weapon.newWeapon",
            defaultImg: defaultImages.weapon
        },
        magicTradition: {
            name: "magicTradition",
            localization: "sr3d.item.magicTradition.newMagicTradition",
            defaultImg: defaultImages.magicTradition
        },
        skill: {
            name: "skill",
            localization: "sr3d.item.skill.newSkill",
            defaultImg: defaultImages.skill.default
        }
    };

    // Generalized Handling for All Item Types
    for (const typeKey in itemSubtype) {
        const typeConfig = itemSubtype[typeKey];

        // Match the item type
        if (item.type === typeConfig.name) {
            if (!item.img || item.img === defaultImages.default) {
                // Get the incremented name with count as a string
                let countAsString = _getNextFreeNumber(typeConfig);
                let incrementedName = game.i18n.localize(typeConfig.localization) + " " + countAsString;

                // Update the item source
                item.updateSource({
                    img: typeConfig.defaultImg,
                    name: incrementedName
                });
            }
            return; // No additional logic for this item type
        }
    }

    // Helper function to find the next free number
    function _getNextFreeNumber(itemType) {
        const localizedName = game.i18n.localize(itemType.localization);

        // Filter items of the given type that match the localized name
        const matchingItems = game.items.filter(item => item.type === itemType.name && item.name.startsWith(localizedName));

        // Extract assigned numbers and detect unnumbered items in a single pass
        const assignedNumbers = matchingItems.reduce((numbers, item) => {
            const match = item.name.match(/\((\d+)\)$/);
            if (match) numbers.push(parseInt(match[1], 10));
            return numbers;
        }, []);

        const hasUnnumberedItem = matchingItems.some(item => item.name === localizedName);

        if (matchingItems.length === 0) return "";

        let nextNumber = hasUnnumberedItem ? 2 : 1;

        while (assignedNumbers.includes(nextNumber)) nextNumber++;

        return nextNumber === 1 ? "" : `(${nextNumber})`;
    }
}
