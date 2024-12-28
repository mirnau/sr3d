import { handleRenderSkills } from "./itemHandlers/handleRenderSkills.js";
import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";

export default class SkillSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/skill-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();

        ctx.attributes = baseAttributeDropdown;
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);

        return ctx;
    }

    async render(force = false, options = {}) {

        if (this.item.type === "skill") {
            await handleRenderSkills(this);
        }

        return super.render(force, options);
    }

    activateListeners(html) {
        super.activateListeners(html);

        const type = this.item.type;

        html.find('.buy-skill').click(this.item.onBuySkill.bind(this.item));
        html.find('.undo-skill').click(this.item.onUndoSkill.bind(this.item));
        html.find('.buy-specialization').click(event => this.item.onBuySpecialization(event));
        html.find('.undo-specialization').click(event => this.item.onUndoSpecialization(event));

        html.find('.add-specialization').click(this.item.onAddSpecialization.bind(this.item));
        html.find('.delete-specialization').click(this.item.onDeleteSpecialization.bind(this.item));
        html.find('select[name="system.skill.activeSkill.linkedAttribute"]').on('change', this._onActiveSkillLinkedAttributeChange.bind(this));

        html.find('.delete-owned-instance').on('click', this._deleteOwnedInstance.bind(this));

    }

    async close(options = {}) {
        this.item.onClose();
        await super.close(options);
    }

    async _deleteOwnedInstance(event) {
        event.preventDefault();

        const confirmed = await new Promise((resolve) => {
            const dialog = new ProceedWithDelete(resolve);
            dialog.render(true);
        });
        if (!confirmed) {
            ui.notifications.info("Item deletion canceled.");
            return;
        }

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
}