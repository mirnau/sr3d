import { ActorDataService } from '../services/ActorDataService.js';
import { CharacterCreationDialog } from '../dialogs/CharacterCreationDialog.js';
import { flags } from '../helpers/CommonConsts.js'
import { initializeMasonry } from '../services/initializeMasonry.js';

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

    async _showCharacterCreationDialog(actor) {
        // Fetch all items of type "metahuman" and "magicTradition"
        const metahumans = game.items.filter(item => item.type === "metahuman");
        const magicTraditions = game.items.filter(item => item.type === "magicTradition");

        const allMetahumans = ActorDataService.getAllMetaHumans(metahumans);
        const allMagicTraditions = ActorDataService.getAllMagicTraditions(magicTraditions);

        // Data for priority tables
        const priorities = ActorDataService.getPriorities();

        // Store instance properties
        const dialogData = {
            actor: this.actor,
            metahumans: allMetahumans,
            magicTraditions: allMagicTraditions,
            ...priorities
        };
        const content = await renderTemplate('systems/sr3d/templates/dialogs/character-creation-dialog.hbs', dialogData);

        return new Promise((resolve) => {
            new CharacterCreationDialog(dialogData, content, resolve).render(true);
        });
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

            const dialogResult = await this._showCharacterCreationDialog(this.actor);

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
        // html.find(".delete-skill").click(this._onDeleteSkill.bind(this));
        html.find(".edit-skill").click(this._onEditSkill.bind(this));
        html.find(".component-details").on("toggle", this._onDetailPanelOpened.bind(this, "toggle"));

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

        if (!this.resizeObserver) {
            // Create and attach the ResizeObserver
            this.resizeObserver = new ResizeObserver(() => this._layoutStateMachine(html));
            this.resizeObserver.observe(html[0]);
        }

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

        this._skillResizeObserver(html);
    }

    _skillResizeObserver(html) {
        const gridElement = html[0].querySelector('.skills-masonry-grid');
        if (gridElement) {
            const resizeObserver = new ResizeObserver(([entry]) => {
                const { contentRect } = entry;
                if (!contentRect) return;
            
                const newWidth = Math.floor(contentRect.width);
                if (gridElement.dataset.lastWidth !== newWidth.toString()) {
                    gridElement.dataset.lastWidth = newWidth;
            
                    if (gridElement.masonryInstance) {
                        gridElement.masonryInstance.layout();
                    } else {
                        initializeMasonry(gridElement, '.active-skill-container', false, false);
                    }
                }
            });
    
            // Observe changes in grid size
            resizeObserver.observe(gridElement);
    
            // Trigger initial Masonry layout
            initializeMasonry(gridElement, '.active-skill-container', true, true);
    
            // Store the observer for cleanup
            this._sResizeObserver = resizeObserver;
        } else {
            console.warn("No .skills-masonry-grid element found for ResizeObserver");
        }
    }
    


    _layoutStateMachine(html) {

        const sheetWidth = this.position?.width || 1400; // Default width
        const maxWidth = 1400;

        // Define thresholds for layout
        const lowerLimit = 0.5 * maxWidth; // 33% of maxWidth
        const middleLimit = 0.66 * maxWidth; // 60% of maxWidth

        // Determine layout state
        let layoutState = "small"; // Default to small layout
        if (sheetWidth > middleLimit) {
            layoutState = "wide";
        } else if (sheetWidth > lowerLimit) {
            layoutState = "medium";
        }

        // Column width percentages for each layout state
        const columnWidthPercent = {
            small: 100,
            medium: 49,
            wide: 32,
        };

        // Apply column width globally
        const columnWidth = columnWidthPercent[layoutState];
        this.element[0].style.setProperty("--column-width", `${columnWidth}%`);

        // Query components
        const twoSpanComponents = this.element[0].querySelectorAll(".two-span-selectable");
        const threeSpanComponents = this.element[0].querySelectorAll(".three-span-selectable");

        // State machine for component layout
        switch (layoutState) {
            case "small":
                // Small layout: Reset all spans to single column
                twoSpanComponents.forEach((component) => {
                    component.style.width = `var(--column-width)`;
                });
                threeSpanComponents.forEach((component) => {
                    component.style.width = `var(--column-width)`;
                });
                break;

            case "medium":
                // Medium layout: Two-span components span two columns
                twoSpanComponents.forEach((component) => {
                    component.style.width = `calc(2 * var(--column-width) - 10px)`;
                });
                threeSpanComponents.forEach((component) => {
                    component.style.width = `var(--column-width)`; // Reset to single column
                });
                break;

            case "wide":
                // Wide layout: Three-span components span three columns
                twoSpanComponents.forEach((component) => {
                    component.style.width = `calc(2 * var(--column-width) - 10px)`;
                });
                threeSpanComponents.forEach((component) => {
                    component.style.width = `calc(3 * var(--column-width) - 20px)`;
                });
                break;
        }
    }


    // NOTE: Disconnect ResizeObserver to avoid memory leaks
    close(options = {}) {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        if (this._sResizeObserver) {
            this._sResizeObserver.disconnect();
            this._sResizeObserver = null;
        }
    
        return super.close(options);
    }

    // NOTE: This boolean is read in a hook in sr3d.js
    _onDetailPanelOpened(_, event) {
        this.actor.setFlag(flags.namespace, flags.isDossierPanelOpened, event.target.open);
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

        skill.sheet.render(true);
    }

    /*
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
    }*/

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