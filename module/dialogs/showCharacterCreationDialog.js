import { ActorDataService } from "../services/ActorDataService.js";
import SR3DLog from "../SR3DLog.js";
import Randomizer from "../sheets/Randomizer.js";
import { getRandomBellCurveWithMode, lerpColor, randomInRange } from "../sheets/Utilities.js";

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
                            if (metahumanItem) {

                                await actor.createEmbeddedDocuments("Item", [metahumanItem.toObject()]);
                                SR3DLog.success(`Metahuman item created on actor: ${metahumanItem.name}`, "Actor Creation");
                            }
                        }

                        if (selectedMagicTraditionId) {
                            const magicTraditionItem = game.items.get(selectedMagicTraditionId) || null;
                            if (magicTraditionItem) {

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

                _setupPrioritySelectionListeners(html);
                _updateAgeSlider(html, null)

                //html.find('.priority-randomizer').on('click', (event) => _onMetahumanChange(event, html));
                //html.find('.priority-reset').on('click', (event) => _updateAgeSlider(html, null));

            }
        }, { render: this }).render(true);
    });
}

export function _setupPrioritySelectionListeners(html) {
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

    const collectSelectedPriorities = async () => {
        const selectedPriorities = new Set();
    
        // Add priorities from prioritySelectors
        prioritySelectors.forEach(select => {
            if (select.value !== "") selectedPriorities.add(select.value);
        });
    
        // Add priorities from itemSelectors
        const itemPriorityPromises = itemSelectors.map(async (select) => {
            if (select.value !== "") {
                const item = await game.items.get(select.value);
                if (item && item.system.priority) {
                    return item.system.priority; // Valid priority from item lookup
                }
                if (/^[A-Z]-/.test(select.value)) { // Extract priority from pattern
                    return select.value.charAt(0);
                }
            }
            return null;
        });
    
        const itemPriorities = await Promise.all(itemPriorityPromises);
        itemPriorities.filter(priority => priority !== null).forEach(priority => {
            selectedPriorities.add(priority);
        });
    
        return selectedPriorities;
    };
    
    const updateOptionStates = (allSelectors, selectedPriorities) => {
        allSelectors.forEach(select => {
            Array.from(select.options).forEach(option => {
                let optionPriority;
    
                if (prioritySelectors.includes(select)) {
                    optionPriority = option.value;
                } else {
                    const item = game.items.get(option.value);
                    if (item && item.system.priority) {
                        optionPriority = item.system.priority;
                    } else if (/^[A-Z]-/.test(option.value)) {
                        optionPriority = option.value.charAt(0);
                    }
                }
    
                const isCurrentSelection = select.value === option.value;
    
                if (optionPriority && selectedPriorities.has(optionPriority)) {
                    option.disabled = !isCurrentSelection;
                    option.classList.toggle('disabled-option', !isCurrentSelection);
                } else {
                    option.disabled = false;
                    option.classList.remove('disabled-option');
                }
            });
        });
    };
    
    const toggleOkButtonState = (allSelectors, okButton) => {
        const allSelected = allSelectors.every(select => select.value !== "");
        okButton.prop('disabled', !allSelected);
        okButton.toggleClass('disabled', !allSelected);
    };
    
    const _handleMutualExclusivity = async () => {
        const allSelectors = [...prioritySelectors, ...itemSelectors];
        const selectedPriorities = await collectSelectedPriorities();
        console.debug("Selected Priorities:", Array.from(selectedPriorities));
    
        updateOptionStates(allSelectors, selectedPriorities);
        toggleOkButtonState(allSelectors, okButton);
    };
    

    // Attach change listeners to enforce exclusivity
    [...prioritySelectors, ...itemSelectors].forEach(select => {
        select.addEventListener('change', _handleMutualExclusivity);
    });

    randomizeButton.on('click', () => {
        const random = new Randomizer();
        const randomPriority = random.generatePriorityCombination();
        let selectionId = "";

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

            selectionId = metahumanDropdownItems.find(dropdownItem => dropdownItem.priority === randomPriority.metahuman);

            html.find('[name="metahuman"]').val(selectionId.id).change();

        } else {
            const randomMetahuman = metahumanDropdownItems.find(item => item.priority === randomPriority.metahuman);
            SR3DLog.inspect("randomMetahuman", randomMetahuman);
            const metahumanPriority = randomMetahuman?.priority;
            const listOfAllDuplicatesWithTheSamePriority = metahumanDropdownItems.filter(item => item.priority === metahumanPriority);
            const selection = listOfAllDuplicatesWithTheSamePriority[randomInRange(0, listOfAllDuplicatesWithTheSamePriority.length - 1)];
            if (selection) {
                // INFO: setting the dropdown to the assigned value
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
        ];

        // Assign the rest of the random priorities
        prioritySelectors.forEach((select, index) => {
            select.value = selected[index];
            select.dispatchEvent(new Event('change'));
        });

        _handleMutualExclusivity();

        _updateAgeSlider(html, selectionId.id)
    });


    // Initialize by disabling OK button
    okButton.prop('disabled', true);
}

function _updateAgeSlider(html, selectionId) {
    
    let selectedMetahumanItem = game.items.get(selectionId);

    if (selectedMetahumanItem == null) selectedMetahumanItem = null;
    // Initialize default age range and mode
    let ageMin = 0, ageMax = 0, modeAge = 0;

    // Update age range based on the selected Metahuman item
    if (selectedMetahumanItem) {
        ageMin = selectedMetahumanItem.system.lifespan.min;
        ageMax = selectedMetahumanItem.system.lifespan.max;
    }
    else {
        ageMin= 10;
        ageMax= 100;
        modeAge = 30;
    }

    // Generate a random age within the range
    const randomAge = getRandomBellCurveWithMode(ageMin, ageMax, modeAge);

    // Retrieve slider and associated elements
    const slider = html.find("#slider-age")[0];
    const ageValue = html.find("#age-value")[0];
    const lifeStage = html.find("#life-stage")[0];

    slider.setAttribute("value", 0); // clear the value

    // Ensure slider's value, min, and max are updated correctly
    slider.setAttribute("min", ageMin); // Explicitly set min
    slider.setAttribute("max", ageMax); // Explicitly set max
    slider.setAttribute("value", randomAge); // Set initial value

    // Define life stages
    const stages = [
        { color: "#4caf50", start: ageMin, end: ageMin + (ageMax - ageMin) * 0.1, name: "Childhood" },
        { color: "#2196f3", start: ageMin + (ageMax - ageMin) * 0.1, end: ageMin + (ageMax - ageMin) * 0.19, name: "Teenagehood" },
        { color: "#ffc107", start: ageMin + (ageMax - ageMin) * 0.20, end: ageMin + (ageMax - ageMin) * 0.39, name: "Early Adulthood" },
        { color: "#ff5722", start: ageMin + (ageMax - ageMin) * 0.40, end: ageMin + (ageMax - ageMin) * 0.59, name: "Middle Age" },
        { color: "#9c27b0", start: ageMin + (ageMax - ageMin) * 0.60, end: ageMin + (ageMax - ageMin) * 0.79, name: "Golden Years" },
        { color: "#ff5722", start: ageMin + (ageMax - ageMin) * 0.80, end: ageMin + (ageMax - ageMin) * 0.89, name: "Old Age" },
        { color: "#9c27b0", start: ageMin + (ageMax - ageMin) * 0.90, end: ageMax, name: "Indeed Very Old" },
    ];

    // Generate a gradient for the slider background
    const generateGradient = () => {
        const gradientSteps = stages.flatMap((stage, index, array) => {
            const startPercent = ((stage.start - ageMin) / (ageMax - ageMin)) * 100;
            const endPercent = ((stage.end - ageMin) / (ageMax - ageMin)) * 100;
    
            // Get neighboring colors
            const prevColor = array[index - 1]?.color || stage.color; // Default to the current color if no previous
            const nextColor = array[index + 1]?.color || stage.color; // Default to the current color if no next
    
            // Blend into previous and next colors
            const blendedStartColor = lerpColor(prevColor, stage.color, 0.5); // Blend with previous at start
            const blendedEndColor = lerpColor(stage.color, nextColor, 0.5);   // Blend with next at end
    
            // Return gradient stops for this stage
            return [
                `${blendedStartColor} ${startPercent}%`, // Start blending
                `${blendedEndColor} ${endPercent}%`     // End blending
            ];
        });
    
        return gradientSteps.join(", ");
    };

    // Update slider display and life stage
    const updateSlider = () => {
        const value = parseInt(slider.value, 10);
        ageValue.textContent = value;

        // Determine the current life stage based on slider value
        const stage = stages.find(stage => value >= stage.start && value <= stage.end);
        lifeStage.textContent = stage ? `Stage: ${stage.name}` : "Unknown";

        // Update slider background with gradient
        slider.style.background = `linear-gradient(to right, ${generateGradient()})`;
    };

    // Initialize slider display
    updateSlider();

    // Add event listener for slider input changes
    slider.addEventListener("input", updateSlider);

    // Debugging output for development
    SR3DLog.inspect("Selected Metahuman Item", selectedMetahumanItem, "Update Sliders");
}
