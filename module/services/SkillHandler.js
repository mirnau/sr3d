import { skillConfig, skillPathMap } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import SkillSpecializationModel from "../dataModels/items/components/SkillSpecialization.js";

export default class SkillHandler {
    constructor(item) {
        this.item = item;
        this.actor = item.parent;
    }

    async onBuySkill(event) {
        event.preventDefault();

        // Optionally undo any specialization if necessary
        await this.onUndoSpecialization(event, 0);

        // Extract skillType and subSkill from the event target
        const { skillType, subSkill } = this._getSkillTypeAndSubSkill(event);

        const config = this._getSkillConfig(skillType, subSkill);

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
            ui.notifications.warn('Not enough points to purchase this skill.');
        }
    }

    async onUndoSkill(event) {
        event.preventDefault();

        await this.onUndoSpecialization(event, 0);

        const { skillType, subSkill } = this._getSkillTypeAndSubSkill(event);

        const config = this._getSkillConfig(skillType, subSkill);

        const { pointsKey, skillKey, currentPointsKey } = config;
        const availablePoints = this._getAvailablePoints(pointsKey);
        const skillValue = this._getSkillValue(skillKey);


        if (skillValue > 0) {
            await Promise.all([
                this.actor.update({ [pointsKey]: availablePoints + 1 }),
                this._updateSystemValues({ [skillKey]: skillValue - 1 })
            ]);
        } else {
            ui.notifications.warn('Skill value cannot be reduced further.');
        }
    }


    async onAddSpecialization(event) {
        event.preventDefault();
    
        const container = event.currentTarget.closest('div[data-skill-type]');
        const { skillType, subSkill } = container.dataset;
        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);
    
        // Get current specializations and add a new one
        let specializations = this._getSpecializations(specializationsPath);
        const inputField = container.querySelector('input[type="text"]');
        const specializationName = (inputField?.value?.trim()) || "A New Skill Specialization";
    
        // Prevent duplicates
        if (specializations.some(spec => spec.name.toLowerCase() === specializationName.toLowerCase())) {
            ui.notifications.warn("A specialization with this name already exists.");
            return;
        }
    
        // Add the new specialization
        specializations.push(new SkillSpecializationModel({ name: specializationName, value: 0 }));

    
        // Update the system values through `_updateSystemValues`
        await this._updateSystemValues({ [specializationsPath]: specializations });
    
        // Clear the input field
        if (inputField) inputField.value = '';
    
        // Refresh the sheet to reflect changes
        this.item.sheet.render(true);
    }
    
    

    async onDeleteSpecialization(event) {
        event.preventDefault();
    
        const confirmed = await this._confirmDeletion();
        if (!confirmed) {
            ui.notifications.info("Specialization deletion canceled.");
            return;
        }
    
        const button = event.currentTarget;
        const container = button.closest(".specialization-container");
        const index = parseInt(container.dataset.index, 10);
        const skillContainer = button.closest('div[data-skill-type]');
        const { skillType, subSkill } = skillContainer.dataset;
        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);
    
        // Get current specializations and remove the selected one
        let specializations = this._getSpecializations(specializationsPath);
        if (index >= 0 && index < specializations.length) {
            specializations = [...specializations.slice(0, index), ...specializations.slice(index + 1)];
            await this._updateSystemValues({ [specializationsPath]: specializations });
        }
    
        // Refresh the sheet to reflect changes
        this.item.sheet.render(true);
    }
    
    async onBuySpecialization(event, index) {
        event.preventDefault();

        const { skillType, subSkill } = this._getSkillTypeAndSubSkill(event);

        const config = this._getSkillConfig(skillType, subSkill);

        const { pointsKey, skillKey } = config;

        // Fetch the current skill value
        const skillValue = this._getSkillValue(skillKey);
        if (skillValue <= 0) {
            ui.notifications.warn("Not enough skill points to purchase a specialization.");
            return;
        }

        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);
        let specializations = this._getSpecializations(specializationsPath);

        // When no datamembers
        if (specializations.length <= 0) {
            return;
        }

        const specialization = specializations[index];

        if (index !== 0) {
            ui.notifications.warn("Only the first specialization can be purchased during character creation.");
            return;
        }

        // NOTE: according to core rulebook character creation
        specialization.value = skillValue + 1;
        const updatedSkillValue = skillValue - 1;

        await this._updateSystemValues({
            [skillKey]: updatedSkillValue,
            [specializationsPath]: specializations
        });

        this.item.sheet.render(true);
    }

    async onUndoSpecialization(event, index) {
        event.preventDefault();

        const { skillType, subSkill } = this._getSkillTypeAndSubSkill(event);

        const config = this._getSkillConfig(skillType, subSkill);

        const { pointsKey, skillKey } = config;

        const skillValue = this._getSkillValue(skillKey);

        const specializationsPath = this._resolveSpecializationsPath(skillType, subSkill);

        let specializations = this._getSpecializations(specializationsPath);

        const specialization = specializations[index];
        
        if (!this._isValidSpecialization(specialization)) {
            return;
        }

        if (specialization.value <= 0) return;

        specialization.value = 0; // INFO: Reset specialization value to indicate it's undone
        const updatedSkillValue = skillValue + 1; // INFO: Restore one skill point

                   await this._updateSystemValues({
                [skillKey]: updatedSkillValue,
                [specializationsPath]: specializations
            });

            // Refresh the item sheet to reflect changes
            this.item.sheet.render(true);
    }

    _getSkillConfig(skillType, subSkill = null) {
        if (skillType === "languageSkill") {
            if (!subSkill) {
                console.error("Sub-skill is required for language skills.");
                return null;
            }
            const subSkillConfig = skillConfig.languageSkill[subSkill];
            if (!subSkillConfig) {
                console.error(`Unknown sub-skill: "${subSkill}" for languageSkill.`);
                return null;
            }
            // Return the subSkillConfig directly for language skills
            return subSkillConfig; 
        }
    
        const config = skillConfig[skillType];
        if (!config) {
            console.error(`Unknown skill type: "${skillType}". SKILL_CONFIG does not have this key.`);
            return null;
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

    _getSkillTypeAndSubSkill(event) {
        const target = event.currentTarget.closest('[data-skill-type]');
        if (!target) {
            console.error("Unable to determine skill type from the event target.");
            return { skillType: null, subSkill: null };
        }

        const skillType = target.dataset.skillType;
        const subSkill = target.dataset.subSkill || null; // `subSkill` is optional

        return { skillType, subSkill };
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

    _resolveSpecializationsPath(skillType, subSkill = null) {
        if (skillType === "languageSkill") {
            if (!subSkill) {
                console.error("Sub-skill is required for language skills.");
                return null;
            }
            return skillPathMap.languageSkill[subSkill] || null;
        }
        return skillPathMap[skillType] || null;
    }

    async _updateSystemValues(updateData) {
        try {
            console.log("Updating System Values:", updateData);
    
            if (this.item.isEmbedded) {
                // Update the embedded item in the actor's items collection
                await this.actor.updateEmbeddedDocuments("Item", [{ _id: this.item.id, ...updateData }]);
            } else {
                // Directly update the item if it’s not embedded
                await this.item.update(updateData);
            }
    
            console.log("System Values Updated Successfully:", updateData);
        } catch (error) {
            console.error("Failed to update system values:", error);
        }
    }
    
}