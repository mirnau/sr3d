import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import ItemDataService from "../services/ItemDataService.js";

export default class WeaponSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/weapon-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();

        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);

        ctx.weaponDamage = ItemDataService.weaponDamage(ctx);
        ctx.system.category = "apple";
        this.item.prepareData();
        return ctx;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.delete-owned-instance').on('click', this._deleteOwnedInstance.bind(this));
    }

    async close(options = {}) {
        this.item.onClose();
        await super.close(options);
    }

    async _deleteOwnedInstance(event) {
        event.preventDefault();

        const confirmed = await new Promise((resolve) => {
            const dialog = new ProceedWithDelete(resolve);
            dialog.render(true);
        });
        if (!confirmed) {
            ui.notifications.info("Item deletion canceled.");
            return;
        }

        const itemId = this.item.id;
        const actor = this.item.actor;

        if (actor) {
            try {
                await actor.deleteEmbeddedDocuments("Item", [itemId]);
                ui.notifications.info(`Deleted item ${this.item.name}`);
            } catch (error) {
                ui.notifications.error(`Failed to delete item ${this.item.name}: ${error.message}`);
            }
        }
    }

    async _updateObject(event, formData) {
        console.log("Form Data Submitted:", formData);

        await this.object.update(formData);
    }
}