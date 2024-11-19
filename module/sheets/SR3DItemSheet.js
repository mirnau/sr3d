export default class SR3DItemSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 600,
            height: 300,
            classes: ["sr3d", "sheet", "item"]
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();

        // Add attributes to the context
        ctx.attributes = ["Body", "Quickness", "Strength", "Intelligence", "Willpower", "Charisma"];
        ctx.system = ctx.item.system;
        ctx.config = CONFIG.sr3d;

        Hooks.on("createItem", async (item, options, userId) => {
            if (item.type === "skill" && item.system.skill?.activeSkill?.value === undefined) {
                await item.update({ "system.skill.activeSkill.value": 0 });
                console.log(`Initialized activeSkill.value to 0 for ${item.name}`);
            }
        });

        // Only apply the dialog logic for items of type 'skill' and not yet initialized
        if (this.item.type === "skill" && !ctx.system.initialized) {
            await this._showSkillTypeDialog();
        }

        return ctx;
    }

    async _showSkillTypeDialog() {
        return new Promise((resolve) => {
            new Dialog({
                title: "Select Skill Type",
                content: `
                    <form>
                        <fieldset>
                            <legend>Choose Skill Type</legend>
                            <label>
                                <input type="radio" name="skillType" value="activeSkill" checked> Active Skill
                            </label>
                            <label>
                                <input type="radio" name="skillType" value="knowledgeSkill"> Knowledge Skill
                            </label>
                            <label>
                                <input type="radio" name="skillType" value="languageSkill"> Language Skill
                            </label>
                        </fieldset>
                    </form>
                `,
                buttons: {
                    confirm: {
                        label: "Confirm",
                        callback: (html) => {
                            const selectedType = html.find('input[name="skillType"]:checked').val();
                            if (selectedType) {
                                // Update the item's skillType and set initialized to true
                                this.object.update({
                                    "system.skillType": selectedType,
                                    "system.initialized": true
                                });
                            }
                            resolve(selectedType);
                        }
                    },
                    cancel: {
                        label: "Cancel",
                        callback: () => {
                            // Delete the item if canceled
                            this.object.delete().then(() => resolve());
                        }
                    }
                },
                default: "confirm"
            }).render(true);
        });
    }


    activateListeners(html) {
        super.activateListeners(html);

        html.find('.add-specialization').click(this._onAddSpecialization.bind(this));
        html.find('.delete-specialization').click(this._onDeleteSpecialization.bind(this));
    }


    _resolveSpecializationsPath(skillType, subfield = null) {
        if (skillType === "languageSkill" && subfield) {
            return `system.skill.languageSkill.${subfield}.specializations`;
        }
        return `system.skill.${skillType}.specializations`;
    }

    async _onAddSpecialization(event) {
        event.preventDefault();
    
        // Locate the button and the fieldset
        const element = event.currentTarget;
        const fieldset = element.closest('fieldset[data-skill-type]'); // Ensure we target the right fieldset
    
        // Debugging to check if fieldset is found
        if (!fieldset) {
            console.error("Could not find parent fieldset with data-skill-type.");
            ui.notifications.error("Failed to add specialization: Missing fieldset context.");
            return;
        }
    
        const skillType = fieldset.dataset.skillType;
        const subSkill = fieldset.dataset.subSkill || null;
    
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
        const inputField = element.previousElementSibling;
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
    
        const button = event.currentTarget; // Get the clicked button
        const container = button.closest(".specialization-container"); // Locate the container for the specialization
        const index = parseInt(container.dataset.index, 10); // Retrieve the specialization index
    
        // Resolve skill type and sub-skill (if applicable)
        const fieldset = button.closest("fieldset[data-skill-type]");
        const skillType = fieldset.dataset.skillType;
        const subSkill = fieldset.dataset.subSkill || null; // Resolve sub-skill if present
    
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