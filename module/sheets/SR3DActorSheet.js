export default class SR3DActorSheet extends ActorSheet {

    // NOTE: I might extend with other classes later for easier handling of 
    // NPCs and mooks. 

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3d/templates/sheets/playerCharacter-sheet.hbs",
            classes: ["sr3d", "sheet", "character"],
            width: 1200,
            height: 600,
            tabs: [
                {
                    navSelector: ".sheet-tabs .tabs",
                    contentSelector: ".tab-content",
                    initial: "inventory"                 
                }
            ]
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
        ctx.system = ctx.actor.system;
        ctx.config = CONFIG.sr3d;
        ctx.cssClass = "actorSheet";

        // INFO: Filter and categorize items based on their type

        ctx.inventory = {
            weapons: ctx.actor.items.filter(item => item.type === "weapon"),
            armor: ctx.actor.items.filter(item => item.type === "armor"),
            consumables: ctx.actor.items.filter(item => item.type === "consumable"),
            others: ctx.actor.items.filter(item => !["weapon", "armor", "consumable"].includes(item.type))
        };

        return ctx;
    }

    activeListenerts(html) {
        super.activeListenerts(html);
        
        // TODO: Sheet interactivity
    }
}