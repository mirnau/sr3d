import Randomizer from './Randomizer.js';
import { ActorDataService } from '../services/ActorDataService.js';
import { randomInRange } from './Utilities.js';

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

        const ctx = super.getData();
        ctx.system = ctx.actor.system;
        ctx.config = CONFIG.sr3d;
        ctx.cssClass = "actorSheet";

        ctx.skills = ActorDataService.prepareSkills(ctx.actor.items.contents);
        ctx.skills.language = ActorDataService.prepareLanguages(ctx.actor.items.contents);
        ctx.inventory = ActorDataService.prepareInventory(ctx.actor.items.contents);

        return ctx;
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
            const dialogResult = await showCharacterCreationDialog(game, this.actor);

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

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".delete-skill").click(this._onDeleteSkill.bind(this));
        html.find(".edit-skill").click(this._onEditSkill.bind(this));

        // Increment attribute
        html.find('.increment-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this._adjustAttribute(attribute, 1);
        });

        // Decrement attribute
        html.find('.decrement-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this._adjustAttribute(attribute, -1);
        });
    }

    _adjustAttribute(attribute, amount) {
        const system = this.actor.system; 
        const currentBase = system[attribute].base;
        const currentPoints = system.creation.attributePoints;
    
        if (amount > 0 && currentPoints < amount) {
            ui.notifications.warn("Not enough attribute points!");
            return;
        }
    
        if (amount < 0 && currentBase + amount < 0) {
            ui.notifications.warn("Attribute cannot go below 0!");
            return;
        }
    
        system[attribute].base += amount;
        system.creation.attributePoints -= amount;
    
        this.actor.update({ system }).then(() => this._updateButtons(attribute));
    }
    

    // Update Button States
    _updateButtons(attribute) {
        const decrementButton = document.querySelector(`[data-attribute="${attribute}"].decrement-attribute`);
        if (this.actor.system[attribute].base === 0) {
            decrementButton.classList.add("disabled");
        } else {
            decrementButton.classList.remove("disabled");
        }
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
                speech: { base: 0, specializations: [] },
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


async function showCharacterCreationDialog(game,actor) {
    // Fetch all items of type "metahuman" and "magicTradition"
    const metahumans = game.items.filter(item => item.type === "metahuman");
    const magicTraditions = game.items.filter(item => item.type === "magicTradition");

    const allMetahumans = ActorDataService.getAllMetaHumans(metahumans);
    const allMagicTraditions = ActorDataService.getAllMagicTraditions(magicTraditions);

    // Data for priority tables
    const priorities = ActorDataService.getPriorities();

    const dialogData = {
        metahumans: allMetahumans,
        magicTraditions: allMagicTraditions,
        ...priorities
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
                    callback: async (html) => {
                        const selectedMetahuman = html.find('[name="metahuman"]').val();
                        const selectedMagicTradition = html.find('[name="system.magicTradition.priority"]').val();
                        const selectedAttributePriority = html.find('[name="attributePriority"]').val();
                        const selectedSkillsPriority = html.find('[name="skillsPriority"]').val();
                        const selectedResourcesPriority = html.find('[name="resourcesPriority"]').val();

                        const priorities = ActorDataService.getPriorities();

                        // Define "unawakened" priorities
                        
                        // Assign selected points and resources
                        const systemUpdates = {
                            "system.creation.attributePoints": priorities.attributePriorities[selectedAttributePriority],
                            "system.creation.activePoints": priorities.skillsPriorities[selectedSkillsPriority],
                            "system.ratsrace.income.post": {
                                amount: priorities.resourcesPriorities[selectedResourcesPriority],
                                recurrent: false
                            }
                        };

                        // Create metahuman instance if not "human"
                        if (selectedMetahuman !== "E") { // Assuming "E" corresponds to "Human"
                            const metahumanItem = game.items.find(item => item.type === "metahuman" && item.system.priority === selectedMetahuman);
                            if (metahumanItem) {
                                await actor.createEmbeddedDocuments("Item", [metahumanItem.toObject()]);
                            }
                        }

                        const unawakenedPriorities = ["C", "D", "E"];
                        
                        // Create magicTradition instance if not unawakened
                        if (!unawakenedPriorities.includes(selectedMagicTradition)) {
                            const magicTraditionItem = game.items.find(item => item.type === "magicTradition" && item.system.priority === selectedMagicTradition);
                            if (magicTraditionItem) {
                                await actor.createEmbeddedDocuments("Item", [magicTraditionItem.toObject()]);
                            }
                        }

                        // Apply updates to the actor's system
                        await actor.update(systemUpdates);

                        // Force recalculation of derived stats
                        actor.prepareData();

                        // Re-render the actor sheet to reflect changes
                        if (actor.sheet.rendered) {
                            actor.sheet.render(false);
                        }

                        // Notify the user
                        ui.notifications.info("Character creation confirmed and stats recalculated!");
                        resolve(true);

                        // Notify the user
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
                setupPrioritySelectionListeners(html);
            }
        }, { render: this }).render(true);
    });
}

function setupPrioritySelectionListeners(html) {
    const prioritySelectors = html.find('.priority-select');
    const okButton = html.find('button.default');
    const randomizeButton = html.find('.priority-randomizer');
    const resetButton = html.find('.priority-reset');

    const randomizer = new Randomizer(); // Initialize the Randomizer

    // Randomize priority values for all selectors
    const randomizePriorities = () => {
        try {
            const randomCombination = randomizer.generatePriorityCombination();

            prioritySelectors.each((_, select) => {
                const fieldName = $(select).attr("name");
                const options = Array.from(select.options);

                const priorityGroups = options.reduce((groups, option) => {
                    if (Randomizer.VALID_PRIORITIES.includes(option.value)) {
                        groups[option.value] = groups[option.value] || [];
                        groups[option.value].push(option);
                    }
                    return groups;
                }, {});

                const assignRandomPriority = (priorityGroupKey) => {
                    const candidates = priorityGroups[randomCombination[priorityGroupKey]] || [];
                    if (candidates.length > 0) {
                        const randomChoice = candidates[randomInRange(0, candidates.length - 1)];

                        // Match and select the option based on the displayed text
                        $(select).find('option').each((_, option) => {
                            if (option.text === randomChoice.text) {
                                option.selected = true;
                            }
                        });

                        $(select).trigger('change');
                    } else {
                        console.warn(`No candidates found for ${priorityGroupKey} priority: ${randomCombination[priorityGroupKey]}`);
                    }
                };

                if (fieldName.includes("magic")) {
                    assignRandomPriority("magic");
                } else if (fieldName.includes("metahuman")) {
                    assignRandomPriority("metahuman");
                } else if (fieldName.includes("attribute")) {
                    select.value = randomCombination.attribute;
                } else if (fieldName.includes("skills")) {
                    select.value = randomCombination.skills;
                } else if (fieldName.includes("resources")) {
                    select.value = randomCombination.resources;
                }
            });

            updateDropdowns();
        } catch (error) {
            console.error("Error generating random priorities:", error);
        }
    };

    // Reset all priorities to empty
    const resetPriorities = () => {
        prioritySelectors.each((_, select) => {
            select.value = ""; // Clear all dropdowns
        });
        updateDropdowns(); // Recalculate states
    };

    // Validate if all selected priorities are unique and complete
    const isValidCombination = () => {
        const selectedValues = new Set();
        return Array.from(prioritySelectors).every(select => {
            const value = select.value;
            if (!value || selectedValues.has(value) || !Randomizer.VALID_PRIORITIES.includes(value)) {
                return false; // Invalid if empty, duplicate, or not valid
            }
            selectedValues.add(value);
            return true;
        });
    };

    // Update the state of dropdowns and buttons
    const updateDropdowns = () => {
        const selectedValues = new Set();

        // Collect currently selected values
        prioritySelectors.each((_, select) => {
            const value = select.value;
            if (Randomizer.VALID_PRIORITIES.includes(value)) {
                selectedValues.add(value);
            }
        });

        // Update dropdown options
        prioritySelectors.each((_, select) => {
            Array.from(select.options).forEach(opt => {
                const isOptionSelectedElsewhere = selectedValues.has(opt.value) && select.value !== opt.value;
                const isValidOption = Randomizer.VALID_PRIORITIES.includes(opt.value);
                if (isValidOption) {
                    opt.disabled = isOptionSelectedElsewhere;
                    opt.style.backgroundColor = isOptionSelectedElsewhere ? "grey" : "";
                    opt.style.color = isOptionSelectedElsewhere ? "white" : "";
                } else {
                    opt.disabled = false;
                }
            });
        });

        // Update OK button based on validity
        const isValid = isValidCombination();
        okButton.prop('disabled', !isValid).css({
            backgroundColor: isValid ? "" : "grey",
            color: isValid ? "" : "white"
        });
    };

    // Attach event listeners
    prioritySelectors.on('change', updateDropdowns);
    randomizeButton.on('click', (event) => {
        event.preventDefault();
        randomizePriorities();
    });
    resetButton.on('click', (event) => {
        event.preventDefault();
        resetPriorities();
    });

    // Initialize by resetting priorities
    resetPriorities();
}