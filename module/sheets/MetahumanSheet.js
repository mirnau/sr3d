import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ItemDataService from "../services/ItemDataService.js";

export default class MetahumanSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
    
        // Add attributes to the context
        ctx.attributes = baseAttributeDropdown;
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);

        this._getMetahumanData(ctx);

        console.log("Metahuman Sheet has been Called");
    
        return ctx;
    }
    

    _getMetahumanData(ctx) {
        ctx.lifespan = ItemDataService.lifespan(ctx);
        ctx.height = ItemDataService.height(ctx);
        ctx.weight = ItemDataService.weight(ctx);
        ctx.attributeModifiers = ItemDataService.attributeModifiers(ctx);
        ctx.attributeLimits = ItemDataService.attributeLimits(ctx);
    }

    activateListeners(html) {
        super.activateListeners(html);
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