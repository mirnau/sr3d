import { handleRenderSkills } from "./itemHandlers/handleRenderSkills.js";
import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import ItemDataService from "../services/ItemDataService.js";

import SR3DLog from '../SR3DLog.js'

export default class KarmaSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/karma-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
    
        // Add attributes to the context
        ctx.attributes = baseAttributeDropdown;
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);
        return ctx;
    }
    
    activateListeners(html) {
        html.find('.delete-owned-instance').on('click', this._deleteOwnedInstance.bind(this));
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