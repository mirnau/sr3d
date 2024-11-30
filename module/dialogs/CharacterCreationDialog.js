import SR3DLog from "../SR3DLog.js";
import Prioritizer from "../sheets/Prioritizer.js";
import { getRandomBellCurveWithMode, lerpColor, randomInRange } from "../sheets/Utilities.js";

export class CharacterCreationDialog extends Dialog {
    constructor(dialogData, content, resolve) {
        super({
            title: "Character Creation",
            content: content, // Directly use the pre-rendered content
            buttons: {
                ok: {
                    label: "OK",
                    callback: async (html) => {
                        await this._handleDialogSubmit(html, dialogData);
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
                
                const randomizeButton = html.find('.priority-randomizer');
                const resetButton = html.find('.priority-reset');
                const okButton = html.find('button.default');
                
                const prioritySelectors = Array.from(html.find('.priority-select'));
                const itemSelectors = Array.from(html.find('.item-select'));
                const allSelectors = [...prioritySelectors, ...itemSelectors];
                const metahumanDropdown = html.find('[name="metahuman"] option');
                const magicTraditionDropdown = html.find('[name="magic"] option');
                
                this._addEmptyDefaultToAllDropdowns(allSelectors);
                
                okButton.prop('disabled', true);
                
                //NOTE: Subscriptions start from here
                allSelectors.forEach(select => {
                    select.addEventListener('change', () => {
                        this._handleMutualExclusivity(allSelectors, prioritySelectors, itemSelectors);
                        this._toggleOkButtonState(allSelectors, okButton);
                    });
                });
                
                const randomizeActions = [
                    { method: this._randomizeAll, args: [metahumanDropdown, magicTraditionDropdown, prioritySelectors, html] },
                    { method: this._updateAgeSlider, args: [html, metahumanDropdown] },
                    { method: this._updatePhysicalSlider, args: [html, metahumanDropdown, "weight"] },
                    { method: this._updatePhysicalSlider, args: [html, metahumanDropdown, "height"] },
                ];
                
                randomizeActions.forEach(action => {
                    randomizeButton.on('click', action.method.bind(this, ...action.args));
                });
                
                const resetActions = [
                    { method: this._resetFields, args: [allSelectors, okButton] },
                    { method: this._updateAgeSlider, args: [html, metahumanDropdown] },
                    { method: this._updatePhysicalSlider, args: [html, metahumanDropdown, "weight"] },
                    { method: this._updatePhysicalSlider, args: [html, metahumanDropdown, "height"] },
                ];
                
                resetActions.forEach(action => {
                    resetButton.on('click', action.method.bind(this, ...action.args));
                });
            }
        });
    }
    
    _addEmptyDefaultToAllDropdowns(allSelectors) {
        allSelectors.forEach(select => {
            const emptyOption = document.createElement('option');
            emptyOption.value = "";
            emptyOption.textContent = game.i18n.format("sr3d.characterCreation.selectAnOption");
            emptyOption.selected = true;
            select.prepend(emptyOption);
        });
    }

    _toggleOkButtonState(allSelectors, okButton) {
        const allSelected = allSelectors.every(select => select.value !== "");
        okButton.prop('disabled', !allSelected);
        okButton.toggleClass('disabled', !allSelected);
    };


    async _handleMutualExclusivity(allSelectors, prioritySelectors, itemSelectors) {

        const selectedPriorities = await this._collectSelectedPriorities(prioritySelectors, itemSelectors);

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
    }

    async _collectSelectedPriorities(prioritySelectors, itemSelectors) {
        const selectedPriorities = new Set();

        prioritySelectors.forEach(select => {
            if (select.value !== "") {
                selectedPriorities.add(select.value);
            }
        });

        // Add priorities from itemSelectors
        const itemPriorityPromises = itemSelectors.map(async (select) => {
            if (select.value !== "") {
                const item = game.items.get(select.value);
                if (item?.system.priority) {
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
    }


    _randomizeAll(metahumanDropdown, magicTraditionDropdown, prioritySelectors, html) {
        const prioritizer = new Prioritizer();
        const randomPriority = prioritizer.generatePriorityCombination();
        let selectionId = "";

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
    }

    _resetFields(allSelectors, okButton) {
        allSelectors.forEach(select => {
            select.value = "";
            select.dispatchEvent(new Event('change'));
        });

        // NOTE: Humans don't have one, so priority "E" is assigned as default

        okButton.prop('disabled', true);
    }

    async _handleDialogSubmit(html, dialogData) {
    
        // Fetch selected values from the HTML
        const selectedMetahumanId = html.find('[name="metahuman"]').val();
        const selectedMagicTraditionId = html.find('[name="magic"]').val();
        const selectedAttributePriority = html.find('[name="attributePriority"]').val();
        const selectedSkillsPriority = html.find('[name="skillsPriority"]').val();
        const selectedResourcesPriority = html.find('[name="resourcesPriority"]').val();
    
        // Assign selected points and resources
        const systemUpdates = {
            "system.creation.attributePoints": dialogData.attributePriorities[selectedAttributePriority],
            "system.creation.activePoints": dialogData.skillsPriorities[selectedSkillsPriority],
            "system.ratsrace.income.post": {
                amount: dialogData.resourcesPriorities[selectedResourcesPriority],
                recurrent: false,
            },
        };
    
        // Log selected values for debugging
        SR3DLog.inspect("Selected Metahuman ID", selectedMetahumanId);
        SR3DLog.inspect("Selected Magic Tradition ID", selectedMagicTraditionId);
    
        // Handle Metahuman item creation
        if (selectedMetahumanId) {
            const metahumanItem = game.items.get(selectedMetahumanId);
            if (metahumanItem) {
                await actor.createEmbeddedDocuments("Item", [metahumanItem.toObject()]);
                SR3DLog.success(`Metahuman item created on actor: ${metahumanItem.name}`, "Actor Creation");
            }
        }
    
        // Handle Magic Tradition item creation
        if (selectedMagicTraditionId) {
            const magicTraditionItem = game.items.get(selectedMagicTraditionId);
            if (magicTraditionItem) {
                await actor.createEmbeddedDocuments("Item", [magicTraditionItem.toObject()]);
                SR3DLog.success(`Magic Tradition item created on actor: ${magicTraditionItem.name}`, "Actor Creation");
            }
        }
    
        // Apply updates to the actor's system
        await dialogData.actor.update(systemUpdates);
    
        // Force recalculation of derived stats
        if (dialogData.actor.characterSetup) {
            dialogData.actor.characterSetup();
        }
    
        SR3DLog.success("Character creation process completed successfully.", "CharacterCreationDialog");
    }
    
    _updateAgeSlider(html, metahumanDropdown) {
        if (!metahumanDropdown) return;

        const idNumberOrIdentifier = html.find('[name="metahuman"]').val();

        if (!idNumberOrIdentifier) return;

        let selectedMetahumanItem = game.items.get(idNumberOrIdentifier);

        if (!selectedMetahumanItem) selectedMetahumanItem = null;

        // Initialize default age range and mode
        let ageMin = 0, ageMax = 0, modeAge = 0;

        // Update age range based on the selected Metahuman item
        if (selectedMetahumanItem) {
            ageMin = selectedMetahumanItem.system.lifespan.min;
            modeAge = selectedMetahumanItem.system.lifespan.average;
            ageMax = selectedMetahumanItem.system.lifespan.max;
        } else {
            ageMin = 5;
            ageMax = 100;
            modeAge = 30;
        }

        // Generate a random age within the range
        const randomAge = getRandomBellCurveWithMode(ageMin, ageMax, modeAge);

        // Retrieve slider and associated elements
        const slider = html.find("#slider-age")[0];
        const ageValue = html.find("#age-value")[0];
        const lifeStage = html.find("#life-stage")[0];

        slider.setAttribute("value", 0); // Clear the slider value
        slider.setAttribute("min", ageMin); // Set min value
        slider.setAttribute("max", ageMax); // Set max value
        slider.setAttribute("value", randomAge); // Set initial value

        // Define life stages
        const stages = [
            { start: ageMin, end: ageMin + (ageMax - ageMin) * 0.1, name: "Childhood" },
            { start: ageMin + (ageMax - ageMin) * 0.1, end: ageMin + (ageMax - ageMin) * 0.19, name: "Teenagehood" },
            { start: ageMin + (ageMax - ageMin) * 0.20, end: ageMin + (ageMax - ageMin) * 0.39, name: "Early Adulthood" },
            { start: ageMin + (ageMax - ageMin) * 0.40, end: ageMin + (ageMax - ageMin) * 0.59, name: "Middle Age" },
            { start: ageMin + (ageMax - ageMin) * 0.60, end: ageMin + (ageMax - ageMin) * 0.79, name: "Golden Years" },
            { start: ageMin + (ageMax - ageMin) * 0.80, end: ageMin + (ageMax - ageMin) * 0.89, name: "Old Age" },
            { start: ageMin + (ageMax - ageMin) * 0.90, end: ageMax, name: "Indeed Very Old" },
        ];

        // Update slider display and life stage
        const updateSlider = () => {
            const value = parseInt(slider.value, 10);
            ageValue.textContent = value;

            // Determine the current life stage based on slider value
            const stage = stages.find(stage => value >= stage.start && value <= stage.end);
            lifeStage.textContent = stage ? `Stage: ${stage.name}` : "Unknown";
        };

        // Initialize slider display
        updateSlider();

        // Add event listener for slider input changes
        slider.addEventListener("input", updateSlider);

        // Debugging output for development
        SR3DLog.inspect("Selected Metahuman Item", selectedMetahumanItem, "Update Sliders");
    }

    _updatePhysicalSlider(html, metahumanDropdown, type) {
        if (!metahumanDropdown) return;

        const idNumberOrIdentifier = html.find('[name="metahuman"]').val();
        let selectedMetahumanItem = game.items.get(idNumberOrIdentifier);

        if (!selectedMetahumanItem) selectedMetahumanItem = null;

        // Initialize default ranges for height or weight
        let min = 0, max = 0, mode = 0;

        if (selectedMetahumanItem) {
            const physicalData = selectedMetahumanItem.system.physical[type]; // Access height or weight

            if (!physicalData) console.error("No Physical Data");

            min = physicalData.min;
            max = physicalData.max;
            mode = physicalData.average;
        } else {
            // Default fallback values for height or weight
            min = type === "height" ? 150 : 50;
            max = type === "height" ? 250 : 225;
            mode = type === "height" ? 170 : 72;
        }

        // Generate a random value within the range
        const randomValue = getRandomBellCurveWithMode(min, max, mode);

        // Retrieve slider and associated elements
        const slider = html.find(`#slider-${type}`)[0];
        const valueElement = html.find(`#${type}-value`)[0];

        slider.setAttribute("value", randomValue); // Set the initial value
        slider.setAttribute("min", min); // Set min value
        slider.setAttribute("max", max); // Set max value

        // Update slider display
        const updateSlider = () => {
            const value = parseInt(slider.value, 10);
            valueElement.textContent = value; // Update the display value
        };

        // Initialize slider display
        updateSlider();


        // Add event listener for slider input changes
        slider.addEventListener("input", updateSlider);

        // Debugging output for development
        SR3DLog.inspect(`Selected Metahuman Item - ${type}`, selectedMetahumanItem, "Update Physical Sliders");
    }
}