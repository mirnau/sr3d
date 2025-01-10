import CharacterCreationDialog from '../../dialogs/CharacterCreationDialog.js'
import ActorDataService from '../../services/ActorDataService.js'
import ItemDataService from '../../services/ItemDataService.js';
import SR3DLog from '../../SR3DLog.js';

export async function doNotRenderSheet(document, actor, options, userId) {
    if (actor.type !== "character") return true;
    options.renderSheet = false;
}

export async function displayCreationDialog(actor, options, userId) {

    if (actor.type !== "character") return true;

    SR3DLog.info("Running Character Dialog", displayCreationDialog.name);

    const dialogResult = await _showCharacterCreationDialog(actor);

    if (!dialogResult) {
        console.log(`Character creation canceled for actor: ${actor.name}. Deleting actor.`);
        await actor.delete();
        return false;
    }

    actor.sheet.render(true);

    SR3DLog.success("Character Dialog Completed", displayCreationDialog.name);
}


async function _showCharacterCreationDialog(actor) {

    let metahumans = game.items.filter(item => item.type === "metahuman");

    if (metahumans.length === 0) {
        const humanItem = ItemDataService.getDefaultHumanItem();
        Item.create(humanItem);
        metahumans = game.items.filter(item => item.type === "metahuman");
    }

    let magics = game.items.filter(item => item.type === "magic");

    if(magics.length === 0 ) {
        const magicItem = ItemDataService.getDefaultMagic();
        Item.create(magicItem);
        magics = game.items.filter(item => item.type === "magic");
    }

    const allMetahumans = ActorDataService.getAllMetaHumans(metahumans);
    const allMagics = ActorDataService.getAllMagics(magics);
    const priorities = ActorDataService.getPriorities();

    const dialogData = {
        actor: actor,
        metahumans: allMetahumans,
        magics: allMagics,
        ...priorities
    };
    
    const content = await renderTemplate('systems/sr3d/templates/dialogs/character-creation-dialog.hbs', dialogData);

    return new Promise((resolve) => {
        new CharacterCreationDialog(dialogData, content, resolve).render(true);
    });
}