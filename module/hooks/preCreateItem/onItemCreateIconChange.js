import { defaultImages } from "../../helpers/ItemImagePaths.js";

export async function onItemCreateIconChange(item) {
    const itemSubtype = {
        metahuman: { defaultImg: defaultImages.metahuman },
        karma: { defaultImg: defaultImages.karma },
        weapon: { defaultImg: defaultImages.weapon },
        ammunition: { defaultImg: defaultImages.ammunition },
        magicTradition: { defaultImg: defaultImages.magicTradition },
        skill: { defaultImg: defaultImages.skill.default }
    };

    for (const typeKey in itemSubtype) {
        if (item.type === typeKey && (!item.img || item.img === defaultImages.default)) {
            await item.updateSource({ img: itemSubtype[typeKey].defaultImg });
            return;
        }
    }
}