export default class SR3DActorSheet extends ActorSheet {

    // NOTE: I might extend with other classes later for easier handling of 
    // NPCs and mooks. 

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3d/templates/sheets/playerCharacter-sheet.hbs",
            classes: ["sr3d", "sheet", "character"],
            width: 1300,
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

    activateListeners(html) {
        super.activateListeners(html);
        
        html.find(".item-create").click(this._onItemCreate.bind(this));
        
        // Preserving original functionalty such as drag and drop
        super.activateListeners(html);
    }

    _onItemCreate(event) {
        event.preventDefault();
        let element = event.currentTraget;

        let itemData = {
            name: game.i18n.localize("sr3d.sheet.newItem"),
            type: element.dataset.type
        };

        return this.actor.createOwnedItem(itemData);
    }
}