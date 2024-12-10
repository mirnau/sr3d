import { handleRenderSkills } from "./itemHandlers/handleRenderSkills.js";
import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from '../dialogs/ProcedeWithDelete.js'

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
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();

        // Add attributes to the context
        ctx.attributes = baseAttributeDropdown;
        ctx.system = ctx.item.system;
        ctx.config = CONFIG.sr3d;
        ctx.isOwned = Boolean(this.item.parent);

        return ctx;
    }

    async render(force = false, options = {}) {

        if (this.item.type === "skill") {
            await handleRenderSkills(this);
        }

        return super.render(force, options);
    }

    activateListeners(html) {
        super.activateListeners(html);

        const type = this.item.type;

        if (type === "skill") {
            html.find('.add-specialization').click(this._onAddSpecialization.bind(this));
            html.find('.delete-specialization').click(this._onDeleteSpecialization.bind(this));
            html.find('select[name="system.skill.activeSkill.linkedAttribute"]').on('change', this._onActiveSkillLinkedAttributeChange.bind(this));
        } else if (type === "magicTradition") {
            html.find('select[name="system.metahuman.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
            html.find('select[name="system.magicTradition.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
        }

        // General cases
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
        const fieldName = event.target.name; // e.g., "system.metahuman.priority" or "system.magicTradition.priority"
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

    _resolveSpecializationsPath(skillType, subfield = null) {
        if (skillType === "languageSkill" && subfield) {
            return `system.skill.languageSkill.${subfield}.specializations`;
        }
        return `system.skill.${skillType}.specializations`;
    }

    async _onAddSpecialization(event) {
        event.preventDefault();

        // Locate the button and the containing div
        const element = event.currentTarget;
        const container = element.closest('div[data-skill-type]'); // Updated selector

        // Debugging to check if container is found
        if (!container) {
            console.error("Could not find parent div with data-skill-type.");
            ui.notifications.error("Failed to add specialization: Missing container context.");
            return;
        }

        const skillType = container.dataset.skillType;
        const subSkill = container.dataset.subSkill || null;

        // Debugging skillType and subSkill
        console.log("Skill Type:", skillType);
        console.log("Sub-Skill:", subSkill);

        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);

        if (!specializationsPath) {
            ui.notifications.error("Unable to determine specializations path.");
            return;
        }

        let specializations = foundry.utils.getProperty(this.object, specializationsPath) || [];
        if (typeof specializations === "object" && !Array.isArray(specializations)) {
            specializations = Object.values(specializations);
        }

        // Retrieve the specialization name from the input field
        const inputField = container.querySelector('input[type="text"]'); // Adjusted to find text input within div
        let specializationName = inputField?.value?.trim() || "A New Skill Specialization";

        const newSpecialization = { name: specializationName, value: 0 };
        specializations.push(newSpecialization);

        const updatedData = {};
        foundry.utils.setProperty(updatedData, specializationsPath, specializations);
        await this.object.update(updatedData);

        inputField.value = '';
        ui.notifications.info("Specialization added successfully.");
    }



    async _onDeleteSpecialization(event) {
        event.preventDefault();

        const confirmed = await new Promise((resolve) => {
            const dialog = new ProceedWithDelete(resolve);
            dialog.render(true);
        });
        if (!confirmed) {
            ui.notifications.info("Specialization deletion canceled.");
            return;
        }

        const button = event.currentTarget; // Get the clicked button
        const container = button.closest(".specialization-container"); // Locate the container for the specialization
        const index = parseInt(container.dataset.index, 10); // Retrieve the specialization index

        // Resolve skill type and sub-skill (if applicable)
        const skillContainer = button.closest('div[data-skill-type]'); // Updated to locate skill context
        if (!skillContainer) {
            console.error("Could not find parent div with data-skill-type.");
            ui.notifications.error("Failed to delete specialization: Missing skill context.");
            return;
        }

        const skillType = skillContainer.dataset.skillType;
        const subSkill = skillContainer.dataset.subSkill || null; // Resolve sub-skill if present

        // Resolve the specializations path
        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);

        console.log("Resolved Path:", specializationsPath);

        // Fetch current specializations
        let specializations = foundry.utils.getProperty(this.object, specializationsPath);

        // Ensure the specializations are in array form
        if (typeof specializations === "object" && !Array.isArray(specializations)) {
            console.warn("Specializations is an object. Converting to array.");
            specializations = Object.values(specializations);
        }

        if (!Array.isArray(specializations)) {
            ui.notifications.error("Specializations data structure is invalid. Cannot delete.");
            return;
        }

        console.log("Specializations Before Deletion:", specializations);

        // Validate the index and delete the specialization
        if (index >= 0 && index < specializations.length) {
            specializations = [...specializations.slice(0, index), ...specializations.slice(index + 1)];
            console.log("Specializations After Deletion:", specializations);

            // Update the item with the new specializations array
            const updatedData = {};
            foundry.utils.setProperty(updatedData, specializationsPath, specializations);
            await this.object.update(updatedData);

            ui.notifications.info("Specialization deleted successfully.");
        } else {
            ui.notifications.warn("Invalid specialization index. Cannot delete.");
        }
    }



    _resolveSpecializationsPath(skillType, subSkill = null) {
        const skillPathMap = {
            activeSkill: "system.skill.activeSkill.specializations",
            knowledgeSkill: "system.skill.knowledgeSkill.specializations",
            languageSkill: {
                speech: "system.skill.languageSkill.speech.specializations",
                read: "system.skill.languageSkill.read.specializations",
                write: "system.skill.languageSkill.write.specializations"
            }
        };

        // Handle language skills with sub-skills
        if (skillType === "languageSkill") {
            if (!subSkill) {
                console.error("Sub-skill is required for language skills.");
                return null;
            }
            return skillPathMap.languageSkill[subSkill] || null;
        }

        // Handle activeSkill and knowledgeSkill
        if (skillPathMap[skillType]) {
            return skillPathMap[skillType];
        }

        console.error("Unknown skill type:", skillType);
        return null;
    }
}