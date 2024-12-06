import { defaultImages } from "../helpers/ItemImagePaths.js"

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
        ctx.isOwned = Boolean(this.item.parent);

        return ctx;
    }

    async render(force = false, options = {}) {
        // Check if the item is a skill
        if (this.item.type === "skill") {
            // Check if the flag exists
            let isInitialized = this.item.getFlag("sr3d", "initialized");

            // If the flag doesn't exist, initialize it
            if (isInitialized === undefined) {
                console.log("Flag 'initialized' not found. Creating and setting it to false.");
                await this.item.setFlag("sr3d", "initialized", false);
                isInitialized = false; // Explicitly set the variable
            }

            // If the flag is false, show the dialog
            if (!isInitialized) {
                console.log("Skill is not initialized. Showing skill type dialog.");
                const dialogResult = await this._showSkillTypeDialog();

                // If the dialog is canceled, delete the item and prevent rendering
                if (!dialogResult) {
                    console.log(`Skill creation canceled for item: ${this.item.name}. Deleting item.`);
                    await this.item.delete();
                    return; // Halt rendering by exiting the `render` method
                }

                // Set the flag to true after the dialog is completed
                await this.item.setFlag("sr3d", "initialized", true);
                console.log("Skill has been initialized. Flag set to true.");
            }
        }

        // Call the parent `render` method to continue rendering if initialized
        return super.render(force, options);
    }

    async _showSkillTypeDialog() {
        const htmlTemplate = await renderTemplate('systems/sr3d/templates/dialogs/skill-creation-dialog.hbs');

        return new Promise((resolve) => {
            new Dialog({
                title: "Select Skill Type",
                content: htmlTemplate,
                buttons: {
                    confirm: {
                        label: "Confirm",
                        callback: async (html) => {
                            const selectedType = html.find('input[name="skillType"]:checked').val();
                            console.log("Confirm button clicked, selectedType:", selectedType);

                            if (!selectedType) {
                                ui.notifications.error("You must select a skill type.");
                                resolve(null); // Fail gracefully if no type is selected
                                return;
                            }

                            // Update the skill type and corresponding icon
                            await this.item.update({
                                "system.skillType": selectedType,
                                img: defaultImages.skill[selectedType] || defaultImages.default,
                                "system.initialized": true
                            });

                            console.log("Skill successfully updated with type:", selectedType);
                            resolve(true); // Resolve with success
                        },
                    },
                    cancel: {
                        label: "Cancel",
                        callback: async () => {
                            console.log("Cancel button clicked. Deleting item:", this.item.name);
                            await this.item.delete();
                            resolve(null); // Resolve with cancellation
                        },
                    },
                },
                default: "confirm", // Ensure Confirm is default
            }).render(true);
        });
    }


    activateListeners(html) {
        super.activateListeners(html);

        // Bind specialization event handlers
        html.find('.add-specialization').click(this._onAddSpecialization.bind(this));
        html.find('.delete-specialization').click(this._onDeleteSpecialization.bind(this));
        html.find('.delete-owned-instance').on('click', this._deleteOwnedInstance.bind(this));

        // Bind linked attribute dropdown listeners
        html.find('select[name="system.skill.activeSkill.linkedAttribute"]').on('change', this._onActiveSkillLinkedAttributeChange.bind(this));
        html.find('select[name="system.skill.knowledgeSkill.linkedAttribute"]').on('change', this._onKnowledgeSkillLinkedAttributeChange.bind(this));
        html.find('select[name="system.metahuman.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
        html.find('select[name="system.magicTradition.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
    }

    async _deleteOwnedInstance(event) {
        event.preventDefault();

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

    // Handler for Knowledge Skill linked attribute changes
    async _onKnowledgeSkillLinkedAttributeChange(event) {
        const dropdown = event.currentTarget;
        const selectedAttribute = dropdown.value;

        // Update the item directly
        await this.item.update({
            "system.knowledgeSkill.linkedAttribute": selectedAttribute
        });

        console.log(`Updated Knowledge Skill linkedAttribute to: ${selectedAttribute}`);

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