import Randomizer from '../sheets/Randomizer';
import { randomInRange } from '../sheets/Utilities';
import { ActorDataService } from './ActorDataService';


export async function showCharacterCreationDialog(game, actor) {
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
}export function setupPrioritySelectionListeners(html) {
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

