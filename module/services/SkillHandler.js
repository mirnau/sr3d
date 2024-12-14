import SR3DLog from "../SR3DLog.js";
import { flags } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";

export default class SkillHandler {
    constructor(item) {
        this.item = item; // Reference to the parent SR3DItem instance
        this.actor = item.parent; // The actor associated with the item
    }

    async onBuySkill(event) {
        event.preventDefault();

        await this.onUndoSpecialization(event, 0);

        const { skillType } = this.item.system;

        // Define mapping for skill types
        const skillConfig = {
            activeSkill: {
                pointsKey: "system.creation.activePoints",
                skillKey: "system.activeSkill.value",
                currentPointsKey: "currentActivePoints"
            }
        };

        const config = skillConfig[skillType];

        if (!config) {
            console.error(`Unknown skill type: ${skillType}`);
            return;
        }

        const availablePoints = this.actor.system.creation[config.pointsKey.split(".").pop()];
        const currentPoints = this.item[config.currentPointsKey] || 0;
        const skillValue = this.item.system.activeSkill?.value || 0;

        if (availablePoints > currentPoints) {
            const updatedActorData = {
                [config.pointsKey]: availablePoints - 1,
            };
            const updatedItemData = {
                [config.skillKey]: skillValue + 1,
            };

            // Update actor and item
            Promise.all([
                this.actor.update(updatedActorData),
                this.item.update(updatedItemData)
            ]).catch(error => console.error(`Failed to update: ${error.message}`));
        } else {
            console.warn('Not enough points to purchase the skill.');
            // TODO: Implement shopping with karma points
        }
    }

    async onUndoSkill(event) {
        event.preventDefault();

        await this.onUndoSpecialization(event, 0);

        const { skillType } = this.item.system;

        // Define mapping for skill types
        const skillConfig = {
            activeSkill: {
                pointsKey: "system.creation.activePoints",
                skillKey: "system.activeSkill.value",
                currentPointsKey: "currentActivePoints"
            }
        };

        const config = skillConfig[skillType];

        if (!config) {
            console.error(`Unknown skill type: ${skillType}`);
            return;
        }

        const availablePoints = this.actor.system.creation[config.pointsKey.split(".").pop()];
        const currentPoints = this.item[config.currentPointsKey] || 0;
        const skillValue = this.item.system.activeSkill?.value || 0;

        if (skillValue > currentPoints) {
            const updatedActorData = {
                [config.pointsKey]: availablePoints + 1,
            };
            const updatedItemData = {
                [config.skillKey]: skillValue - 1,
            };

            // Update actor and item
            Promise.all([
                this.actor.update(updatedActorData),
                this._updateSystemValues(updatedItemData)
            ]).catch(error => console.error(`Failed to update: ${error.message}`));
        } else {
            console.warn('Skill value cannot be reduced further.');
            // Additional logic if needed
        }
    }

    async onAddSpecialization(event) {
        event.preventDefault();

        const element = event.currentTarget;
        const container = element.closest('div[data-skill-type]');
        if (!container) {
            console.error("Could not find parent div with data-skill-type.");
            ui.notifications.error("Failed to add specialization: Missing container context.");
            return;
        }

        const skillType = container.dataset.skillType;
        const subSkill = container.dataset.subSkill || null;

        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);
        if (!specializationsPath) {
            ui.notifications.error("Unable to determine specializations path.");
            return;
        }

        // Use item data rather than object data
        let specializations = foundry.utils.getProperty(this.item, specializationsPath) || [];
        if (typeof specializations === "object" && !Array.isArray(specializations)) {
            specializations = Object.values(specializations);
        }

        const inputField = container.querySelector('input[type="text"]');
        let specializationName = inputField?.value?.trim() || "A New Skill Specialization";

        const newSpecialization = {
            name: specializationName,
            value: 0
        };

        specializations.push(newSpecialization);

        const updatedData = {};
        foundry.utils.setProperty(updatedData, specializationsPath, specializations);

        // Update the item rather than this.object
        await this.item.update(updatedData);

        inputField.value = '';
        ui.notifications.info("Specialization added successfully.");
    }

    async onDeleteSpecialization(event) {
        event.preventDefault();

        
        const confirmed = await new Promise((resolve) => {
            const dialog = new ProceedWithDelete(resolve);
            dialog.render(true);
        });
        if (!confirmed) {
            ui.notifications.info("Specialization deletion canceled.");
            return;
        }
        
        await this.onUndoSpecialization(event, 0);

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
        let specializations = foundry.utils.getProperty(this.item, specializationsPath);

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
            await this.item.update(updatedData);

            ui.notifications.info("Specialization deleted successfully.");
        } else {
            ui.notifications.warn("Invalid specialization index. Cannot delete.");
        }
    }

    async onBuySpecialization(event, index) {
        event.preventDefault();

        console.log("Specialization Index:", index);
        console.log("Raw Item Data:", this.item.toObject());
        console.log("Active Skill Specializations Before Update:", this.item.system.activeSkill.specializations);

        let skillValue = this.item.system.activeSkill.value || 0;

        if (skillValue <= 0) {
            SR3DLog.warning("Not enough skill points to purchase a specialization.", "onBuySpecialization");
            return;
        }

        // Ensure specializations is an array
        let specializations = this.item.system.activeSkill.specializations || [];
        if (!Array.isArray(specializations)) {
            specializations = Object.values(specializations);
        }

        // Validate specialization existence and structure
        let specialization = specializations[index];
        if (!specialization || typeof specialization.value === "undefined") {
            SR3DLog.error(
                `Specialization at index ${index} is undefined or missing 'value' property.`,
                "onBuySpecialization"
            );
            return;
        }

        // Character creation logic: ensure only index 0 is editable
        const isCharacterCreation = this.actor.getFlag(flags.namespace, flags.isCharacterCreationState);
        if (isCharacterCreation) {
            if (index !== 0) {
                SR3DLog.warning("Only the first specialization can be purchased during character creation.", "onBuySpecialization");
                return;
            }

            if (specialization.value > 0) {
                SR3DLog.warning("A specialization has already been purchased during character creation.", "onBuySpecialization");
                return;
            }

            // Set specialization value to skillValue + 1
            specialization.value = skillValue + 1;

            // Decrement skillValue by 1
            skillValue -= 1;
        } else {
            // TODO: Handle Karma-based specialization purchase logic for non-creation state
            SR3DLog.warning("Specializations can only be purchased during character creation for now.", "onBuySpecialization");
            return;
        }

        // Rebuild the specializations array immutably
        const updatedSpecializations = specializations.map((spec, i) => ({
            name: spec.name,
            value: i === index ? specialization.value : spec.value,
        }));

        try {
            // Prepare data for update
            const updateData = {
                'system.activeSkill.value': skillValue,
                'system.activeSkill.specializations': updatedSpecializations,
            };

            // Update the item
            await this._updateSystemValues(updateData);

            // Refresh the sheet to reflect changes
            this.item.sheet.render(true);
            SR3DLog.success(`Specialization "${specialization.name}" purchased successfully.`, "onBuySpecialization");
        } catch (error) {
            SR3DLog.critical(`Failed to update specialization: ${error.message}`, "onBuySpecialization");
        }
    }




    async onUndoSpecialization(event, index) {
        event.preventDefault();

        console.log("Undo Specialization Index:", index);
        console.log("Raw Item Data:", this.item.toObject());
        console.log("Active Skill Specializations Before Undo:", this.item.system.activeSkill.specializations);

        let skillValue = this.item.system.activeSkill.value || 0;

        // Ensure specializations is always an array
        let specializations = this.item.system.activeSkill.specializations || [];
        if (!Array.isArray(specializations)) {
            specializations = Object.values(specializations);
        }

        // Validate specialization existence and structure
        let specialization = specializations[index];
        if (!specialization || typeof specialization.value === "undefined") {
            SR3DLog.error(
                `Specialization at index ${index} is undefined or missing 'value' property.`,
                "onUndoSpecialization"
            );
            return;
        }

        // Ensure the specialization has been purchased
        if (specialization.value === 0) {
            SR3DLog.warning("Cannot undo a specialization that has not been purchased.", "onUndoSpecialization");
            return;
        }

        // Check if we are in character creation mode
        const isCharacterCreation = this.actor.getFlag(flags.namespace, flags.isCharacterCreationState);
        if (isCharacterCreation) {
            // Reverse the purchase logic during character creation
            const refundedSkillPoints = 1;
            specialization.value = 0; // Reset specialization value
            skillValue += refundedSkillPoints; // Restore 1 skill point
        } else {
            // Placeholder for future karma-based undo logic
            // TODO: Implement karma refund logic here
        }

        // Rebuild the specializations array immutably
        const updatedSpecializations = specializations.map((spec, i) => ({
            name: spec.name,
            value: i === index ? specialization.value : spec.value,
        }));

        try {
            // Prepare data for update
            const updateData = {
                'system.activeSkill.value': skillValue,
                'system.activeSkill.specializations': updatedSpecializations,
            };

            // Update the item
            await this._updateSystemValues(updateData);

            // Refresh the sheet to reflect changes
            this.item.sheet.render(true);
            SR3DLog.success(`Specialization "${specialization.name}" undo successful.`, "onUndoSpecialization");
        } catch (error) {
            SR3DLog.critical(`Failed to undo specialization: ${error.message}`, "onUndoSpecialization");
        }
    }

    
    _resolveSpecializationsPath(skillType, subSkill = null) {
        const skillPathMap = {
            activeSkill: "system.activeSkill.specializations",
            knowledgeSkill: "system.knowledgeSkill.specializations",
            languageSkill: {
                speech: "system.languageSkill.speech.specializations",
                read: "system.languageSkill.read.specializations",
                write: "system.languageSkill.write.specializations"
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
    
    async _updateSystemValues(updateData) {
        if (this.item.isEmbedded) {
            // Update via parent actor for embedded items
            await this.item.actor.updateEmbeddedDocuments("Item", [
                { _id: this.item.id, ...updateData }
            ]);
        } else {
            // Update directly for non-embedded items
            await this.item.update(updateData);
        }
    }
}