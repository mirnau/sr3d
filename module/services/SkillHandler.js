import SR3DLog from "../SR3DLog.js";
import { flags } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";

const SKILL_CONFIG = {
    activeSkill: {
        pointsKey: "system.creation.activePoints",
        skillKey: "system.activeSkill.value",
        currentPointsKey: "currentActivePoints"
    },
    knowledgeSkill: {
        pointsKey: "system.creation.knowledgePoints",
        skillKey: "system.knowledgeSkill.value",
        currentPointsKey: "currentKnowledgePoints"
    }
};

const SKILL_PATH_MAP = {
    activeSkill: "system.activeSkill.specializations",
    knowledgeSkill: "system.knowledgeSkill.specializations",
    languageSkill: {
        speech: "system.languageSkill.speech.specializations",
        read: "system.languageSkill.read.specializations",
        write: "system.languageSkill.write.specializations"
    }
};

export default class SkillHandler {
    constructor(item) {
        this.item = item;
        this.actor = item.parent;
    }

    async onBuySkill(event) {
        event.preventDefault();

        // Optionally undo any specialization if necessary
        await this.onUndoSpecialization(event, 0);

        const config = this._getSkillConfig();
        if (!config) {
            console.warn('Skill configuration not found.');
            return;
        }

        const { pointsKey, skillKey, currentPointsKey } = config;
        const availablePoints = this._getAvailablePoints(pointsKey);
        const currentPoints = this.item[currentPointsKey] || 0;
        const skillValue = this._getSkillValue(skillKey);

        if (availablePoints > currentPoints) {
            await this._updateActorAndItem(
                { [pointsKey]: availablePoints - 1 },
                { [skillKey]: skillValue + 1 }
            );
            ui.notifications.info(`Successfully purchased ${this.item.name}.`);
        } else {
            console.warn('Not enough points to purchase the skill.');
            // TODO: Implement shopping with karma points or other alternatives
            ui.notifications.warn('Not enough points to purchase this skill.');
        }
    }


    async onUndoSkill(event) {
        event.preventDefault();
        await this.onUndoSpecialization(event, 0);

        const config = this._getSkillConfig();
        if (!config) return;

        const { pointsKey, skillKey, currentPointsKey } = config;
        const availablePoints = this._getAvailablePoints(pointsKey);
        const currentPoints = this.item[currentPointsKey] || 0;
        const skillValue = this._getSkillValue(skillKey);

        if (skillValue > currentPoints) {
            await Promise.all([
                this.actor.update({ [pointsKey]: availablePoints + 1 }),
                this._updateSystemValues({ [skillKey]: skillValue - 1 })
            ]).catch(error => console.error(`Failed to update: ${error.message}`));
        } else {
            console.warn('Skill value cannot be reduced further.');
        }
    }

    async onAddSpecialization(event) {
        event.preventDefault();
        const container = event.currentTarget.closest('div[data-skill-type]');
        if (!container) {
            this._notifyError("Failed to add specialization: Missing container context.");
            return;
        }

        const { skillType, subSkill } = container.dataset;
        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);
        if (!specializationsPath) {
            this._notifyError("Unable to determine specializations path.");
            return;
        }

        let specializations = this._getSpecializations(specializationsPath);
        const inputField = container.querySelector('input[type="text"]');
        const specializationName = (inputField?.value?.trim()) || "A New Skill Specialization";

        // Check for duplicate specialization names
        if (specializations.some(spec => spec.name.toLowerCase() === specializationName.toLowerCase())) {
            this._notifyError("A specialization with this name already exists.");
            return;
        }

        specializations.push({ name: specializationName, value: 0 });

        try {
            await this.item.update({ [specializationsPath]: specializations });
            if (inputField) inputField.value = '';
            ui.notifications.info(`Specialization "${specializationName}" added successfully.`);
        } catch (error) {
            console.error(`Failed to add specialization: ${error.message}`);
            this._notifyError(`Failed to add specialization: ${error.message}`);
        }
    }

    async onDeleteSpecialization(event) {
        event.preventDefault();

        const confirmed = await this._confirmDeletion();
        if (!confirmed) {
            ui.notifications.info("Specialization deletion canceled.");
            return;
        }

        await this.onUndoSpecialization(event, 0);

        const button = event.currentTarget;
        const container = button.closest(".specialization-container");
        const index = parseInt(container.dataset.index, 10);
        const skillContainer = button.closest('div[data-skill-type]');

        if (!skillContainer) {
            this._notifyError("Failed to delete specialization: Missing skill context.");
            return;
        }

        const { skillType, subSkill } = skillContainer.dataset;
        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);
        if (!specializationsPath) {
            this._notifyError("Invalid skill type or sub-skill.");
            return;
        }

        let specializations = this._getSpecializations(specializationsPath);
        if (index >= 0 && index < specializations.length) {
            specializations = [...specializations.slice(0, index), ...specializations.slice(index + 1)];
            await this.item.update({ [specializationsPath]: specializations });
            ui.notifications.info("Specialization deleted successfully.");
        } else {
            ui.notifications.warn("Invalid specialization index. Cannot delete.");
        }
    }

    async onBuySpecialization(event, index) {
        event.preventDefault();

        // Retrieve the skill configuration dynamically
        const config = this._getSkillConfig();
        if (!config) {
            SR3DLog.error("Skill configuration not found. Cannot purchase specialization.", "onBuySpecialization");
            ui.notifications.error("Skill configuration not found. Cannot purchase specialization.");
            return;
        }

        const { pointsKey, skillKey } = config;

        // Fetch the current skill value
        const skillValue = this._getSkillValue(skillKey);
        if (skillValue <= 0) {
            SR3DLog.warning("Not enough skill points to purchase a specialization.", "onBuySpecialization");
            ui.notifications.warn("Not enough skill points to purchase a specialization.");
            return;
        }

        // Retrieve skillType from the item's system data
        const skillType = this.item.system.skillType;

        // Resolve the path to the specializations
        const specializationsPath = this._resolveSpecializationsPath(skillType);
        if (!specializationsPath) {
            SR3DLog.error("Unable to determine specializations path.", "onBuySpecialization");
            ui.notifications.error("Unable to determine specializations path.");
            return;
        }

        // Retrieve the list of specializations
        let specializations = this._getSpecializations(specializationsPath);

        // Validate the specialization index
        if (index < 0 || index >= specializations.length) {
            SR3DLog.error(`Invalid specialization index: ${index}.`, "onBuySpecialization");
            ui.notifications.error(`Invalid specialization index: ${index}.`);
            return;
        }

        const specialization = specializations[index];
        if (!this._isValidSpecialization(specialization)) {
            SR3DLog.error(`Invalid specialization at index ${index}.`, "onBuySpecialization");
            ui.notifications.error(`Invalid specialization at index ${index}.`);
            return;
        }

        // Check if the user is in the character creation phase
        const isCharacterCreation = this.actor.getFlag(flags.namespace, flags.isCharacterCreationState);
        if (!isCharacterCreation) {
            SR3DLog.warning("Specializations can only be purchased during character creation for now.", "onBuySpecialization");
            ui.notifications.warn("Specializations can only be purchased during character creation for now.");
            return;
        }

        // Apply skill type-specific constraints
        // Example: Only first specialization can be purchased during character creation
        if (index !== 0) {
            SR3DLog.warning("Only the first specialization can be purchased during character creation.", "onBuySpecialization");
            ui.notifications.warn("Only the first specialization can be purchased during character creation.");
            return;
        }

        if (specialization.value > 0) {
            SR3DLog.warning("This specialization has already been purchased during character creation.", "onBuySpecialization");
            ui.notifications.warn("This specialization has already been purchased during character creation.");
            return;
        }

        // Update the specialization and skill values
        specialization.value = skillValue + 1; // Increment specialization value by 1 + skill value (important!)
        const updatedSkillValue = skillValue - 1; // Deduct one skill point

        try {
            await this._updateSystemValues({
                [skillKey]: updatedSkillValue,
                [specializationsPath]: specializations
            });

            // Refresh the item sheet to reflect changes
            this.item.sheet.render(true);

            // Notify the user of the successful purchase
            ui.notifications.info(`Specialization "${specialization.name}" purchased successfully.`);
            SR3DLog.success(`Specialization "${specialization.name}" purchased successfully.`, "onBuySpecialization");
        } catch (error) {
            SR3DLog.error(`Failed to purchase specialization: ${error.message}`, "onBuySpecialization");
            ui.notifications.error(`Failed to purchase specialization: ${error.message}`);
        }
    }

    async onUndoSpecialization(event, index) {
        event.preventDefault();

        // Retrieve the skill configuration dynamically
        const config = this._getSkillConfig();
        if (!config) {
            this._notifyError("Skill configuration not found. Cannot undo specialization.");
            return;
        }

        const { pointsKey, skillKey } = config;

        // Fetch the current skill value
        const skillValue = this._getSkillValue(skillKey);

        // Retrieve skillType from the item's system data
        const skillType = this.item.system.skillType;
        console.log(`Undo Specialization - Skill Type: ${skillType}`); // Debugging

        // Resolve the path to the specializations
        const specializationsPath = this._resolveSpecializationsPath(skillType);
        if (!specializationsPath) {
            this._notifyError("Unable to determine specializations path.");
            return;
        }

        // Retrieve the list of specializations
        let specializations = this._getSpecializations(specializationsPath);
        console.log(`Undo Specialization - Specializations before undo:`, specializations); // Debugging

        // Validate the specialization index
        if (index < 0 || index >= specializations.length) {
            this._notifyError(`Invalid specialization index: ${index}.`);
            return;
        }

        const specialization = specializations[index];
        if (!this._isValidSpecialization(specialization)) {
            this._notifyError(`Invalid specialization at index ${index}.`);
            return;
        }

        // Check if the specialization has been purchased
        if (specialization.value <= 0) {
            this._notifyWarning("This specialization has not been purchased yet.");
            return;
        }

        // Update the specialization and skill values
        specialization.value = 0; //No calculation needed for character creation.
        const updatedSkillValue = skillValue + 1; // Restore one skill point

        try {
            await this._updateSystemValues({
                [skillKey]: updatedSkillValue,
                [specializationsPath]: specializations
            });

            // Refresh the item sheet to reflect changes
            this.item.sheet.render(true);

            // Notify the user of the successful undo
            this._notifyInfo(`Specialization "${specialization.name}" has been undone successfully.`);
        } catch (error) {
            console.error(`Failed to undo specialization: ${error.message}`);
            this._notifyError(`Failed to undo specialization: ${error.message}`);
        }
    }


    _getSkillConfig() {
        const { skillType } = this.item.system;
        const config = SKILL_CONFIG[skillType];
        if (!config) {
            console.error(`Unknown skill type: ${skillType}`);
        }
        return config;
    }

    _getAvailablePoints(pointsKey) {
        const key = pointsKey.split(".").pop();
        return this.actor.system.creation[key] || 0;
    }

    _getSkillValue(skillKey) {
        return foundry.utils.getProperty(this.item, skillKey) || 0;
    }

    _getSpecializations(path) {
        let specs = foundry.utils.getProperty(this.item, path) || [];
        return Array.isArray(specs) ? specs : Object.values(specs);
    }

    _isValidSpecialization(specialization) {
        return specialization && typeof specialization.value !== "undefined";
    }

    async _updateActorAndItem(actorData, itemData) {
        try {
            await Promise.all([this.actor.update(actorData), this.item.update(itemData)]);
        } catch (error) {
            console.error(`Failed to update: ${error.message}`);
        }
    }

    async _confirmDeletion() {
        return new Promise((resolve) => {
            const dialog = new ProceedWithDelete(resolve);
            dialog.render(true);
        });
    }

    _notifyError(message) {
        SR3DLog.error(message);
        ui.notifications.error(message);
    }

    _notifyError(message) {
        SR3DLog.info(message);
        ui.notifications.info(message);
    }

    _notifyWarning(message) {
        SR3DLog.info(message);
        ui.notifications.warn(message);
    }

    _resolveSpecializationsPath(skillType, subSkill = null) {
        if (skillType === "languageSkill") {
            if (!subSkill) {
                console.error("Sub-skill is required for language skills.");
                return null;
            }
            return SKILL_PATH_MAP.languageSkill[subSkill] || null;
        }
        return SKILL_PATH_MAP[skillType] || null;
    }

    async _updateSystemValues(updateData) {
        if (this.item.isEmbedded) {
            await this.item.actor.updateEmbeddedDocuments("Item", [
                { _id: this.item.id, ...updateData }
            ]);
        } else {
            await this.item.update(updateData);
        }
    }
}