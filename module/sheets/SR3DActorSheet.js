export default class SR3DActorSheet extends ActorSheet {
    
    // NOTE: I might extend with other classes later for easier handeling of 
    // NPCS and mooks. 
 
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3d/templates/sheets/playerCharacter-sheet.hbs",
            classes: ["playerCharacter"]
        });

    };
}