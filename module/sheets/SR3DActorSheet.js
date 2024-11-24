import Randomizer from './Randomizer.js';

export default class SR3DActorSheet extends ActorSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3d/templates/sheets/playerCharacter-sheet.hbs",
            classes: ["sr3d", "sheet", "character"],
            width: 1300,
            height: 600,
            tabs: [
                {
                    navSelector: ".sheet-tabs .tabs",
                    contentSelector: ".tab-content",
                    initial: "inventory"
                }
            ]
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    async getData() {
        try {
            const ctx = super.getData();
            ctx.system = ctx.actor.system;
            ctx.config = CONFIG.sr3d;
            ctx.cssClass = "actorSheet";

            ctx.skills = {
                active: this._categorizeAndSortSkills(
                    ctx.actor.items.contents.filter((item) => item.type === "skill" && item.system.skillType === "activeSkill"),
                    (item) => item.system.activeSkill.linkedAttribute
                ),
                knowledge: this._categorizeAndSortSkills(
                    ctx.actor.items.contents.filter((item) => item.type === "skill" && item.system.skillType === "knowledgeSkill"),
                    (item) => item.system.knowledgeSkill.linkedAttribute
                ),
                language: this._sortSkillsByName(
                    ctx.actor.items.contents.filter((item) => item.type === "skill" && item.system.skillType === "languageSkill")
                ),
            };

            ctx.skills.language = ctx.actor.items
                .filter((item) => item.type === "skill" && item.system.skillType === "languageSkill")
                .map((skill) => ({
                    id: skill.id,
                    name: skill.name, // The name of the language skill
                    subskills: {
                        Speech: skill.system.languageSkill.speach.base, // Base value for Speech
                        Read: skill.system.languageSkill.read.base, // Base value for Read
                        Write: skill.system.languageSkill.write.base, // Base value for Write
                    },
                }));

            ctx.inventory = {
                weapons: ctx.actor.items.contents.filter(item => item.type === "weapon"),
                armor: ctx.actor.items.contents.filter(item => item.type === "armor"),
                consumables: ctx.actor.items.contents.filter(item => item.type === "consumable"),
                others: ctx.actor.items.contents.filter(item => !["weapon", "armor", "consumable"].includes(item.type))
            };

            return ctx;

        } catch (error) {
            console.error("Error in SR3DActorSheet.getData:", error);
            return super.getData();
        }

    }

    async render(force = false, options = {}) {
        // Check if the creation dialog is completed
        let creationCompleted = this.actor.getFlag("sr3d", "creationDialogCompleted");

        // If the flag doesn't exist, initialize it
        if (creationCompleted === undefined) {
            console.log("Flag 'creationDialogCompleted' not found. Creating and setting it to false.");
            await this.actor.setFlag("sr3d", "creationDialogCompleted", false);
            creationCompleted = false;
        }

        // If the creation is not completed, show the dialog
        if (!creationCompleted) {
            console.log("Character creation not completed. Showing creation dialog.");
            const dialogResult = await this._showCharacterCreationDialog();

            // If the dialog is canceled, delete the actor and prevent rendering
            if (!dialogResult) {
                console.log(`Character creation canceled for actor: ${this.actor.name}. Deleting actor.`);
                await this.actor.delete();
                return; // Halt rendering by exiting the `render` method
            }

            // Set the flag to true after the dialog is completed
            await this.actor.setFlag("sr3d", "creationDialogCompleted", true);
            console.log("Character creation completed. Flag set to true.");
        }

        return super.render(force, options);
    }

    async _showCharacterCreationDialog() {
        // Fetch all items of type "metahuman" and "magicTradition"
        const metahumans = game.items.filter(item => item.type === "metahuman");
        const magicTraditions = game.items.filter(item => item.type === "magicTradition");
    
        // Generate allMetahumans array
        const allMetahumans = [
            { priority: "E", name: "Human", default: true },
            ...metahumans.map(metahuman => ({
                priority: metahuman.system.priority || "N/A",
                name: metahuman.name || "Unknown",
                default: false,
            }))
        ];
       
        // Generate allMagicTraditions array
        const allMagicTraditions = [
            { priority: "C", name: "Unawakened", default: true }, // Hardcoded Unawakened
            { priority: "D", name: "Unawakened", default: true }, // Hardcoded Unawakened
            { priority: "E", name: "Unawakened", default: true }, // Hardcoded Unawakened
            ...magicTraditions.map(tradition => ({
                priority: tradition.system.priority,
                name: tradition.name,
                default: false,
            }))
        ];
    
        // Data for priority tables
        const attributePriorities = { A: 30, B: 27, C: 24, D: 21, E: 18 };
        const skillsPriorities = { A: 50, B: 40, C: 34, D: 30, E: 27 };
        const resourcesPriorities = { A: 1000000, B: 400000, C: 90000, D: 20000, E: 5000 };
    
        const dialogData = {
            metahumans: allMetahumans,
            magicTraditions: allMagicTraditions,
            attributePriorities,
            skillsPriorities,
            resourcesPriorities,
        };
    
        // Render template
        const htmlTemplate = await renderTemplate('systems/sr3d/templates/dialogs/character-creation-dialog.hbs', dialogData);
    
        return new Promise((resolve) => {
            new Dialog({
                title: "Character Creation",
                content: htmlTemplate,
                buttons: {
                    ok: {
                        label: "OK",
                        callback: async () => {
                            ui.notifications.info("Character creation confirmed!");
                            resolve(true);
                        }
                    },
                    cancel: {
                        label: "Cancel",
                        callback: () => {
                            ui.notifications.warn("Character creation canceled.");
                            resolve(false);
                        }
                    }
                },
                default: "ok",
                render: (html) => {
                    console.log("Dialog rendered. Setting up priority selection listeners.");
                    this._setupPrioritySelectionListeners(html);
                }
            }, { render: this }).render(true);
        });
    }
    
    _setupPrioritySelectionListeners(html) {
        const prioritySelectors = html.find('.priority-select'); // Use the provided `html` context
        const okButton = html.find('button.default'); // Locate the "OK" button
        const randomizeButton = html.find('.priority-randomizer'); // Randomize button
        const resetButton = html.find('.priority-reset'); // Reset button
    
        // Initialize the Randomizer
        const randomizer = new Randomizer();
    
        // Randomize function
        const randomizePriorities = () => {
            try {
                const randomCombination = randomizer.generatePriorityCombination();
    
                // Update the dropdowns
                prioritySelectors.each((_, select) => {
                    const fieldName = $(select).attr("name");
    
                    // Assign the correct priority to each field
                    if (fieldName.includes("magic")) {
                        select.value = randomCombination.magic;
                    } else if (fieldName.includes("metahuman")) {
                        select.value = randomCombination.metahuman;
                    } else if (fieldName.includes("attribute")) {
                        select.value = randomCombination.attribute;
                    } else if (fieldName.includes("skills")) {
                        select.value = randomCombination.skills;
                    } else if (fieldName.includes("resources")) {
                        select.value = randomCombination.resources;
                    }
                });
    
                updateDropdowns(); // Recalculate and update after randomization
            } catch (error) {
                console.error("Error generating random priorities:", error);
            }
        };
    
        // Reset function
        const resetPriorities = () => {
            prioritySelectors.each((_, select) => {
                select.value = ""; // Clear all dropdowns
            });
            updateDropdowns(); // Recalculate and update after reset
        };
    
        // Function to validate dropdown combinations
        const isValidCombination = () => {
            const selectedValues = new Set();
            let isValid = true;
    
            prioritySelectors.each((_, select) => {
                const value = select.value;
                if (value) {
                    if (selectedValues.has(value)) {
                        isValid = false; // Duplicate found
                    } else if (Randomizer.VALID_PRIORITIES.includes(value)) {
                        selectedValues.add(value);
                    }
                } else {
                    isValid = false; // Empty selection
                }
            });
    
            return isValid;
        };
    
        // Function to update the button and dropdown states
        const updateDropdowns = () => {
            const selectedValues = new Set();
    
            // Collect selected values
            prioritySelectors.each((_, select) => {
                const value = select.value;
                if (Randomizer.VALID_PRIORITIES.includes(value)) {
                    selectedValues.add(value);
                }
            });
    
            // Update all dropdowns
            prioritySelectors.each((_, select) => {
                const options = select.querySelectorAll('option');
                options.forEach(opt => {
                    const optionValue = opt.value;
                    if (Randomizer.VALID_PRIORITIES.includes(optionValue)) {
                        if (selectedValues.has(optionValue) && select.value !== optionValue) {
                            // Grey out and disable options that are selected in other dropdowns
                            opt.disabled = true;
                            opt.style.backgroundColor = "grey";
                            opt.style.color = "white"; // Optional: Change text color for better visibility
                        } else {
                            // Enable options that are not selected elsewhere
                            opt.disabled = false;
                            opt.style.backgroundColor = "";
                            opt.style.color = "";
                        }
                    }
                });
            });
    
            // Update OK button state
            const isValid = isValidCombination(); // Ensure no duplicates and all filled
            if (isValid) {
                okButton.prop('disabled', false).css({ backgroundColor: "", color: "" });
            } else {
                okButton.prop('disabled', true).css({ backgroundColor: "grey", color: "white" });
            }
        };
    
        // Attach event listeners
        prioritySelectors.each((_, select) => {
            $(select).on('change', updateDropdowns); // Recalculate on dropdown change
        });
        randomizeButton.on('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            randomizePriorities(); // Randomize priorities
        });
        resetButton.on('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            resetPriorities(); // Reset priorities
        });
    
        // Initial call to set up dropdown and button states on render
        resetPriorities();
    }
    


    
    
    
    _categorizeAndSortSkills(skills, keyFn) {
        const categories = skills.reduce((acc, skill) => {
            const category = keyFn(skill) || "uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill);
            return acc;
        }, {});

        Object.keys(categories).forEach((key) => {
            categories[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        return categories;
    }

    _sortSkillsByName(skills) {
        return skills.sort((a, b) => a.name.localeCompare(b.name));
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".delete-skill").click(this._onDeleteSkill.bind(this));
        html.find(".edit-skill").click(this._onEditSkill.bind(this));
    }

    _onEditSkill(event) {
        event.preventDefault();

        const skillId = event.currentTarget.dataset.id;

        const skill = this.actor.items.get(skillId);

        if (skill) {
            // Open the item sheet
            skill.sheet.render(true);
        } else {
            // Handle error if skill is not found
            ui.notifications.error("Skill not found.");
            console.error("Skill not found:", skillId);
        }
    }

    _onDeleteSkill(event) {
        event.preventDefault();

        // Get the skill ID from the clicked element
        const skillId = event.currentTarget.dataset.id;
        console.log("Skill ID:", skillId); // Log the skill ID

        // Fetch the skill using the ID
        const skill = this.actor.items.get(skillId);

        if (skill) {
            console.log("Skill Found:", skill); // Log the skill if found
            // Confirm deletion
            const confirmed = window.confirm(`Are you sure you want to delete "${skill.name}"?`);
            if (!confirmed) return;

            // Delete the skill
            skill.delete().then(() => {
                ui.notifications.info(`${skill.name} has been deleted.`);
            }).catch((error) => {
                ui.notifications.error("An error occurred while deleting the skill.");
                console.error(error);
            });
        } else {
            console.error("Skill not found:", skillId); // Log missing skill
            ui.notifications.error("Skill not found.");
        }
    }

    _onItemCreate(event) {
        event.preventDefault();

        // Get the clicked element and skill type
        const element = event.currentTarget;
        const skillType = element.dataset.skillType; // Retrieve the skill type (e.g., activeSkill)
        const itemType = element.dataset.type; // Retrieve the item type (always "skill" here)

        // Ensure the skill type is valid
        if (!itemType || !skillType) {
            console.error("Invalid item or skill type specified:", { itemType, skillType });
            return;
        }

        // Prepare the item data
        const itemData = {
            name: game.i18n.localize("sr3d.sheet.newItem"),
            type: itemType,
            system: {
                skillType: skillType // Set the specific skill type
            }
        };

        // Add specific default data for skill types (optional)
        if (skillType === "activeSkill") {
            itemData.system.activeSkill = { linkedAttribute: "", value: 0, specializations: [] };

        } else if (skillType === "knowledgeSkill") {

            itemData.system.knowledgeSkill = { linkedAttribute: "", value: 0, specializations: [] };

        } else if (skillType === "languageSkill") {
            itemData.system.languageSkill = {
                speach: { base: 0, specializations: [] },
                read: { base: 0, specializations: [] },
                write: { base: 0, specializations: [] }
            };
        }

        // Create the item
        return this.actor.createEmbeddedDocuments("Item", [itemData]).then(() => {
            ui.notifications.info(`Created new ${skillType}`);
        }).catch((error) => {
            console.error("Error creating item:", error);
            ui.notifications.error(`Failed to create new ${skillType}. Check console for details.`);
        });
    }
}
