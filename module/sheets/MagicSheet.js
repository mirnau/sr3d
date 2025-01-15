import { handleCreateSkill } from "./itemHandlers/handleRenderSkills.js";
import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import ItemDataService from "../services/ItemDataService.js";

import SR3DLog from '../SR3DLog.js'

export default class MagicSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/magic-sheet.hbs`;
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
        super.activateListeners(html);

        html.find('select[name="system.metahuman.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
        html.find('select[name="system.magic.priority"]').on('change', this._onDynamicPriorityChange.bind(this));

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

    _onDynamicPriorityChange(event) {
        event.preventDefault();

        // Determine the correct field from the name attribute
        const fieldName = event.target.name; // e.g., "system.metahuman.priority" or "system.magic.priority"
        const selectedPriority = event.target.value;

        // Update the correct field dynamically
        this.item.update({
            [fieldName]: selectedPriority // Use computed property name to dynamically set the field
        }).then(() => {
            console.log(`Successfully updated ${fieldName} to: ${selectedPriority}`);
            console.log("Updated item data:", this.item.system);

            // Re-render the sheet to reflect the changes
            this.render();
            ui.notifications.info(`Priority updated to: ${selectedPriority}`);
        }).catch(err => {
            console.error(`Failed to update ${fieldName}:`, err);
            ui.notifications.error('Could not update priority. Check the console for details.');
        });
    }

    async _updateObject(event, formData) {
        console.log("Form Data Submitted:", formData);
        await this.object.update(formData);
    }
}