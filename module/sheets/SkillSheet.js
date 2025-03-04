import { handleRenderSkills } from "./itemHandlers/handleRenderSkills.js";
import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import ItemDataService from "../services/ItemDataService.js";

import SR3DLog from '../SR3DLog.js'

export default class SR3DItemSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/skill-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();

        // Add attributes to the context
        ctx.attributes = baseAttributeDropdown;
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);

        console.log("SKILL ITEM");
        console.log(this.item);

        return ctx;
    }
    async render(force = false, options = {}) {
        await handleRenderSkills(this);
        return super.render(force, options);
    }

    close(options = {}) {
        if (this.item.observers) {
            this.item.observers.forEach((observer, index) => {
                if (observer) {
                    observer.disconnect();
                    this.item.observers[index] = null;
                }
            });
        }
        console.log("Final State of Specializations on Close:", this.item.system.activeSkill.specializations);
        this.item.onClose();
        console.log("Final State of Specializations on Close:", this.item.system.activeSkill.specializations);
        return super.close(options);
    }

    activateListeners(html) {
        super.activateListeners(html);

        //Works as expected
        html.find('.buy-skill').click(this.item.onBuySkill.bind(this.item));
        html.find('.undo-skill').click(this.item.onUndoSkill.bind(this.item));

        //Left to check:
        html.find('.buy-specialization').click(event => this.item.onBuySpecialization(event));
        html.find('.undo-specialization').click(event => this.item.onUndoSpecialization(event));


        html.find('.add-specialization').click(this.item.onAddSpecialization.bind(this.item));
        html.find('.delete-specialization').click(this.item.onDeleteSpecialization.bind(this.item));
        html.find('select[name="system.skill.activeSkill.linkedAttribute"]').on('change', this._onActiveSkillLinkedAttributeChange.bind(this));

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
        try {
            console.log("DEBUG: Form Data Submitted:", formData);
    
            // Check if the object is embedded or standalone
            if (this.object.isEmbedded) {
                console.log("Updating embedded object:", this.object);
            } else {
                console.log("Updating standalone object:", this.object);
            }
    
            // Call the update method
            await this.object.update(formData);
    
            console.log("Form Data Successfully Updated:", formData);
        } catch (error) {
            console.error("Error while updating object:");
            console.error("Form Data:", formData);
            console.error("Error Message:", error.message);
            console.error("Error Stack:", error.stack);
            throw error; // Propagate the error for further handling if necessary
        }
    }
    
    // Handler for Active Skill linked attribute changes
    async _onActiveSkillLinkedAttributeChange(event) {
        const dropdown = event.currentTarget;
        const selectedAttribute = dropdown.value;

        // Update the item directly
        await this.item.update({
            "system.activeSkill.linkedAttribute": selectedAttribute
        });

        console.log(`Updated Active Skill linkedAttribute to: ${selectedAttribute}`);

        // Notify the parent actor sheet to re-sort and re-render
        const actor = this.item.parent;
        if (actor && actor.sheet.rendered) {
            actor.sheet.render(); // Trigger a re-render of the actor sheet
        }
    }

    /*
    _resolveSpecializationsPath(skillType, subfield = null) {
        if (skillType === "languageSkill" && subfield) {
            return `system.skill.languageSkill.${subfield}.specializations`;
        }
        return `system.skill.${skillType}.specializations`;
    }

   */
}