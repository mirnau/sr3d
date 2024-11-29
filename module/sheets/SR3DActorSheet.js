import { ActorDataService } from '../services/ActorDataService.js';
import { LockAttributesDialog } from '../dialogs/LockAttributesDialog.js';
import { showCharacterCreationDialog } from '../dialogs/showCharacterCreationDialog.js';

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