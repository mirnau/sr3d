import Randomizer from './Randomizer.js';
import { ActorDataService } from '../services/ActorDataService.js';
import { randomInRange } from './Utilities.js';
import { LockAttributesDialog } from '../dialogs/LockAttributesDialog.js';
import SR3DLog from '../SR3DLog.js';

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


            this.actor.adjustAttribute(attribute, 1);
            this._updateButtons(attribute);

        });

        // Decrement attribute
        html.find('.decrement-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this.actor.adjustAttribute(attribute, -1);
            this._updateButtons(attribute);
        });
    }

    // Update Button States
    _updateButtons(attribute) {
        const decrementButton = document.querySelector(`[data-attribute="${attribute}"].decrement-attribute`);
        if (this.actor.system[attribute].value === 0) {
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
                speech: { value: 0, specializations: [] },
                read: { value: 0, specializations: [] },
                write: { value: 0, specializations: [] }
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


async function showCharacterCreationDialog(game, actor) {
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
                        const selectedMetahumanId = html.find('[name="metahuman"]').val();
                        const selectedMagicTraditionId = html.find('[name="magic"]').val();
                        const selectedAttributePriority = html.find('[name="attributePriority"]').val();
                        const selectedSkillsPriority = html.find('[name="skillsPriority"]').val();
                        const selectedResourcesPriority = html.find('[name="resourcesPriority"]').val();

                        // Assign selected points and resources
                        const systemUpdates = {
                            "system.creation.attributePoints": priorities.attributePriorities[selectedAttributePriority],
                            "system.creation.activePoints": priorities.skillsPriorities[selectedSkillsPriority],
                            "system.ratsrace.income.post": {
                                amount: priorities.resourcesPriorities[selectedResourcesPriority],
                                recurrent: false
                            }
                        };

                        SR3DLog.inspect("selectedMetahumanId", selectedMetahumanId);
                        SR3DLog.inspect("selectedMagicTraditionId", "selectedMagicTraditionId");

                        if (selectedMetahumanId) {
                            const metahumanItem = game.items.get(selectedMetahumanId) || null;
                            if (metahumanItem){

                                await actor.createEmbeddedDocuments("Item", [metahumanItem.toObject()]);
                                SR3DLog.success(`Metahuman item created on actor: ${metahumanItem.name}`, "Actor Creation");
                            }
                        }

                        if (selectedMagicTraditionId) {
                            const magicTraditionItem = game.items.get(selectedMagicTraditionId) || null;
                            if(magicTraditionItem) {
                                
                                await actor.createEmbeddedDocuments("Item", [magicTraditionItem.toObject()]);
                                SR3DLog.success(`Magic Tradition item created on actor: ${magicTraditionItem.name}`, "Actor Creation");
                            }
                        }

                        // Apply updates to the actor's system
                        await actor.update(systemUpdates);

                        // Force recalculation of derived stats
                        actor.characterSetup();

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
    const prioritySelectors = Array.from(html.find('.priority-select'));
    const itemSelectors = Array.from(html.find('.item-select'));
    const okButton = html.find('button.default');
    const randomizeButton = html.find('.priority-randomizer');
    const resetButton = html.find('.priority-reset');

    // Add empty default options to all dropdowns
    [...prioritySelectors, ...itemSelectors].forEach(select => {
        const emptyOption = document.createElement('option');
        emptyOption.value = ""; // Empty value
        emptyOption.textContent = "Select an option"; // Placeholder text
        emptyOption.selected = true; // Make it the default selected option
        select.prepend(emptyOption); // Add it to the beginning of the dropdown
    });

    // Reset button listener to reset all fields to default ("")
    resetButton.on('click', () => {
        [...prioritySelectors, ...itemSelectors].forEach(select => {
            select.value = ""; // Reset to the default empty option
            select.dispatchEvent(new Event('change')); // Trigger change event to update logic
        });
        okButton.prop('disabled', true); // Disable OK button after reset
    });

    const handleMutualExclusivity = async () => {
        const allSelectors = [...prioritySelectors, ...itemSelectors];
    
        // Step 1: Collect selected priorities
        const selectedPriorities = new Set();
    
        // Add priorities from prioritySelectors
        prioritySelectors.forEach(select => {
            if (select.value !== "") selectedPriorities.add(select.value);
        });
    
        // Fetch and add priorities from itemSelectors
        const itemPriorityPromises = itemSelectors.map(async select => {
            if (select.value !== "") {
                const item = await game.items.get(select.value);
                if (item && item.system.priority) {
                    return item.system.priority; // Return valid priority from item lookup
                }
                // Handle the fringe case: extract priority from the first character
                if (/^[A-Z]-/.test(select.value)) { // Match "A-", "B-", etc.
                    return select.value.charAt(0); // Extract the first character as priority
                }
            }
            return null; // No value or no valid priority
        });
    
        const itemPriorities = await Promise.all(itemPriorityPromises);
        itemPriorities.filter(priority => priority !== null).forEach(priority => {
            selectedPriorities.add(priority);
        });
    
        console.debug("Selected Priorities:", Array.from(selectedPriorities));
    
        // Step 2: Disable conflicting options
        allSelectors.forEach(select => {
            Array.from(select.options).forEach(option => {
                let optionPriority;
    
                if (prioritySelectors.includes(select)) {
                    // PrioritySelectors directly use the option value as the priority
                    optionPriority = option.value;
                } else {
                    // For itemSelectors, resolve the item's priority
                    const item = game.items.get(option.value);
                    if (item && item.system.priority) {
                        optionPriority = item.system.priority; // Valid priority from item
                    } else if (/^[A-Z]-/.test(option.value)) {
                        optionPriority = option.value.charAt(0); // Extract priority from pattern
                    }
                }
    
                const isCurrentSelection = select.value === option.value;
    
                if (optionPriority && selectedPriorities.has(optionPriority)) {
                    option.disabled = !isCurrentSelection; // Disable if conflicting
                    option.classList.toggle('disabled-option', !isCurrentSelection); // Add visual cue
                } else {
                    option.disabled = false; // Enable non-conflicting
                    option.classList.remove('disabled-option'); // Remove visual cue
                }
            });
        });
    
        // Step 3: Enable OK button only if all selectors have a valid value
        const allSelected = allSelectors.every(select => select.value !== "");
        okButton.prop('disabled', !allSelected);
        okButton.toggleClass('disabled', !allSelected); // Optionally toggle visual disable
    }
    
    // Attach change listeners to enforce exclusivity
    [...prioritySelectors, ...itemSelectors].forEach(select => {
        select.addEventListener('change', handleMutualExclusivity);
    });

    randomizeButton.on('click', () => {
        const random = new Randomizer();
        const randomPriority = random.generatePriorityCombination();

        const metahumanDropdown = html.find('[name="metahuman"] option');
        const metahumanDropdownItems = Array.from(metahumanDropdown)
            .filter(option => option.value !== "")
            .map(option => {
                const item = game.items.get(option.value);
                return {
                    id: option.value,
                    priority: item?.system.priority || option.value.charAt(0),
                    name: option.textContent
                };
            });

        if (randomPriority.metahuman === "E") {

            console.log("Random Priority (metahuman):", randomPriority.metahuman);
            console.log("Metahuman Items:", metahumanDropdownItems);

            const humanDropdownItem = metahumanDropdownItems.find(dropdownItem => dropdownItem.priority === randomPriority.metahuman);

            html.find('[name="metahuman"]').val(humanDropdownItem.id).change();

        } else {
            const randomMetahuman = metahumanDropdownItems.find(item => item.priority === randomPriority.metahuman);
            const metahumanPriority = randomMetahuman?.priority;
            const listOfAllDuplicatesWithTheSamePriority = metahumanDropdownItems.filter(item => item.priority === metahumanPriority);
            const selection = listOfAllDuplicatesWithTheSamePriority[randomInRange(0, listOfAllDuplicatesWithTheSamePriority.length - 1)];
            if (selection) {
                html.find('[name="metahuman"]').val(selection.id).change();
            }
        }

        const magicTraditionDropdown = html.find('[name="magic"] option');

        const magicTraditionDropdownItems = Array.from(magicTraditionDropdown)
            .filter(option => option.value !== "")
            .map(option => {
                const item = game.items.get(option.value);

                return {
                    id: option.value,
                    priority: item?.system.priority || option.value.charAt(0),
                    name: option.textContent
                };
            });

        if (randomPriority.magic !== "A" || randomPriority.magic !== "B") {

            console.log("Random Priority (magicTradition):", randomPriority.magic);
            console.log("MagicTradition Items:", magicTraditionDropdownItems);
            const unawakenedDropdownItem = magicTraditionDropdownItems.find(dropdownItem => dropdownItem.priority === randomPriority.magic);
            html.find('[name="magic"]').val(unawakenedDropdownItem.id).change();

        } else {
            // Handle awakened magicTraditions (may have duplicates)
            const randomMagicTradition = magicTraditionDropdownItems.find(item => item.priority === randomPriority.magic);
            const magicTraditionPriority = randomMagicTradition?.priority;
            const listOfAllDuplicatesWithTheSamePriority = magicTraditionDropdownItems.filter(item => item.priority === magicTraditionPriority);
            const selection = listOfAllDuplicatesWithTheSamePriority[randomInRange(0, listOfAllDuplicatesWithTheSamePriority.length - 1)];
            if (selection) {
                html.find('[name="magic"]').val(selection.id).change();
            }
        }

        const selected = [
            randomPriority.attribute,
            randomPriority.skills,
            randomPriority.resources
        ]

        // Assign the rest of the random priorities
        prioritySelectors.forEach((select, index) => {
            select.value = selected[index]; 
            select.dispatchEvent(new Event('change'));
        });

        handleMutualExclusivity();
    });


    // Initialize by disabling OK button
    okButton.prop('disabled', true);
}
