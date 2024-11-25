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
                        callback: async (html) => {
                            const selectedMetahuman = html.find('[name="metahuman"]').val();
                            const selectedMagicTradition = html.find('[name="system.magicTradition.priority"]').val();
                            const selectedAttributePriority = html.find('[name="attributePriority"]').val();
                            const selectedSkillsPriority = html.find('[name="skillsPriority"]').val();
                            const selectedResourcesPriority = html.find('[name="resourcesPriority"]').val();

                            // Priority tables
                            const attributePriorities = { A: 30, B: 27, C: 24, D: 21, E: 18 };
                            const skillsPriorities = { A: 50, B: 40, C: 34, D: 30, E: 27 };
                            const resourcesPriorities = { A: 1000000, B: 400000, C: 90000, D: 20000, E: 5000 };

                            // Define "unawakened" priorities
                            const unawakenedPriorities = ["C", "D", "E"];

                            // Assign selected points and resources
                            const systemUpdates = {
                                "system.creation.attributePoints": attributePriorities[selectedAttributePriority],
                                "system.creation.activePoints": skillsPriorities[selectedSkillsPriority],
                                "system.ratsrace.income.post": {
                                    amount: resourcesPriorities[selectedResourcesPriority],
                                    recurrent: false
                                }
                            };

                            // Create metahuman instance if not "human"
                            if (selectedMetahuman !== "E") { // Assuming "E" corresponds to "Human"
                                const metahumanItem = game.items.find(item => item.type === "metahuman" && item.system.priority === selectedMetahuman);
                                if (metahumanItem) {
                                    await this.actor.createEmbeddedDocuments("Item", [metahumanItem.toObject()]);
                                }
                            }

                            // Create magicTradition instance if not unawakened
                            if (!unawakenedPriorities.includes(selectedMagicTradition)) {
                                const magicTraditionItem = game.items.find(item => item.type === "magicTradition" && item.system.priority === selectedMagicTradition);
                                if (magicTraditionItem) {
                                    await this.actor.createEmbeddedDocuments("Item", [magicTraditionItem.toObject()]);
                                }
                            }

                            // Apply updates to the actor's system
                            await this.actor.update(systemUpdates);

                            // Force recalculation of derived stats
                            this.actor.prepareData();

                            // Re-render the actor sheet to reflect changes
                            if (this.actor.sheet.rendered) {
                                this.actor.sheet.render(false);
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
                    this._setupPrioritySelectionListeners(html);
                }
            }, { render: this }).render(true);
        });
    }

    _setupPrioritySelectionListeners(html) {
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

        // Increment attribute
        html.find('.increment-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this._incrementAttribute(attribute);
        });

        // Decrement attribute
        html.find('.decrement-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this._decrementAttribute(attribute);
        });
    }

    // Increment Attribute Method
    _incrementAttribute(attribute) {
        const basePath = `system.${attribute}.base`; // Path to the attribute base
        const pointsPath = `system.creation.attributePoints`; // Path to attributePoints

        // Ensure there are enough attribute points
        if (this.actor.system.creation.attributePoints > 0) {
            const updates = {
                [basePath]: this.actor.system[attribute].base + 1, // Increment attribute base
                [pointsPath]: this.actor.system.creation.attributePoints - 1 // Decrement attribute points
            };

            // Update the actor with the specific paths
            this.actor.update(updates).then(() => this._updateButtons(attribute));
        } else {
            ui.notifications.warn("Not enough attribute points!");
        }
    }


    // Decrement Attribute Method
    _decrementAttribute(attribute) {
        const system = this.actor.system; // Access actor's system data
        if (system[attribute].base > 0) {
            system[attribute].base -= 1; // Decrease base value
            system.creation.attributePoints += 1; // Increase available points
            this.actor.update({ system }).then(() => this._updateButtons(attribute)); // Update actor data
        } else {
            ui.notifications.warn("Attribute cannot go below 0!");
        }
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

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
