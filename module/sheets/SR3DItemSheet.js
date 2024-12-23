import { handleRenderSkills } from "./itemHandlers/handleRenderSkills.js";
import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import ItemDataService from "../services/ItemDataService.js";
import { itemCategory } from "../helpers/CommonConsts.js";

import SR3DLog from '../SR3DLog.js'

export default class SR3DItemSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
    
        // Add attributes to the context
        ctx.attributes = baseAttributeDropdown;
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);
    
        if (ctx.item.type === "metahuman") {
            this._getMetahumanData(ctx);
        }
        else if (ctx.item.type === "ammunition") {
            ctx.availableWeapons = ItemDataService.availableWeapons(ctx);
            ctx.compatibleWeapons = ItemDataService.compatibleWeapons(ctx);
            SR3DLog.inspect(ctx.system.category);
        }
        else if (ctx.item.type === "weapon") {
            ctx.weaponDamage = ItemDataService.weaponDamage(ctx);
            ctx.system.category = "apple";
        }
    
        return ctx;
    }
    

    _getMetahumanData(ctx) {
        ctx.lifespan = ItemDataService.lifespan(ctx);
        ctx.height = ItemDataService.height(ctx);
        ctx.weight = ItemDataService.weight(ctx);
        ctx.attributeModifiers = ItemDataService.attributeModifiers(ctx);
        ctx.attributeLimits = ItemDataService.attributeLimits(ctx);
    }

    async render(force = false, options = {}) {

        if (this.item.type === "skill") {
            await handleRenderSkills(this);
        }

        return super.render(force, options);
    }

    close(options = {}) {
        if (this.item.observers) {
            this.item.observers.forEach((observer, index) => {
                if (observer) {
                    observer.disconnect();
                    this.item.observers[index] = null;
                }
            });
        }
        return super.close(options);
    }

    activateListeners(html) {
        super.activateListeners(html);

        const type = this.item.type;

        if (type === "skill") {

            html.find('.buy-skill').click(this.item.onBuySkill.bind(this.item));
            html.find('.undo-skill').click(this.item.onUndoSkill.bind(this.item));
            html.find('.buy-specialization').click(event => this.item.onBuySpecialization(event));
            html.find('.undo-specialization').click(event => this.item.onUndoSpecialization(event));


            html.find('.add-specialization').click(this.item.onAddSpecialization.bind(this.item));
            html.find('.delete-specialization').click(this.item.onDeleteSpecialization.bind(this.item));
            html.find('select[name="system.skill.activeSkill.linkedAttribute"]').on('change', this._onActiveSkillLinkedAttributeChange.bind(this));
        } else if (type === "magicTradition") {
            html.find('select[name="system.metahuman.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
            html.find('select[name="system.magicTradition.priority"]').on('change', this._onDynamicPriorityChange.bind(this));
        } else if (type === "ammunition") {
            html.find('#to-compatible').click(() => this._moveToCompatible(html));
            html.find('#to-available').click(() => this._moveToAvailable(html));
            html.find('.rounds-editable, .cost-editable').on('input', this._updateTotalCost.bind(this, html));
        }        

        html.find('.delete-owned-instance').on('click', this._deleteOwnedInstance.bind(this));
       
    }

  
    

    _updateTotalCost(html, event) {
        const target = event.currentTarget;
        let fieldName;
    
        if (target.classList.contains('rounds-editable')) {
            fieldName = 'system.rounds';
        } else if (target.classList.contains('cost-editable')) {
            fieldName = 'system.cost';
        } else {
            return; 
        }
        
        let newValue = target.textContent.trim();

        newValue = parseFloat(newValue);
        if (isNaN(newValue) || newValue < 0) {
            newValue = 0;
            target.textContent = newValue;
        }
    
        html.find(`input[name="${fieldName}"]`).val(newValue);
    
        const rounds = parseFloat(html.find('input[name="system.rounds"]').val()) || 0;
        const cost = parseFloat(html.find('input[name="system.cost"]').val()) || 0;
    
        const totalCost = rounds * cost;
    
        html.find('.total-cost h1').text(`${totalCost}`);
    }
    
    _moveToCompatible(html) {
        const selectedIds = [...html.find('#available-weapons option:selected')].map(o => o.value);
        if (!selectedIds.length) return;
      
        const currentCompatible = foundry.utils.getProperty(this.object, 'system.compatibleWeaponIds') || [];
        const updatedCompatible = [...new Set([...currentCompatible, ...selectedIds])];
      
        this.object.update({ 'system.compatibleWeaponIds': updatedCompatible })
          .then(() => {
            this.render(false);
          });
      }
      
      _moveToAvailable(html) {
        const selectedIds = [...html.find('#compatible-weapons option:selected')].map(o => o.value);
      
        if (!selectedIds.length) return;
      
        const currentCompatible = foundry.utils.getProperty(this.object, 'system.compatibleWeaponIds') || [];
        const updatedCompatible = currentCompatible.filter(id => !selectedIds.includes(id));
      
        this.object.update({ 'system.compatibleWeaponIds': updatedCompatible })
          .then(() => {
            this.render(false);
          });
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

    _onDynamicPriorityChange(event) {
        event.preventDefault();

        // Determine the correct field from the name attribute
        const fieldName = event.target.name; // e.g., "system.metahuman.priority" or "system.magicTradition.priority"
        const selectedPriority = event.target.value;

        // Update the correct field dynamically
        this.item.update({
            [fieldName]: selectedPriority // Use computed property name to dynamically set the field
        }).then(() => {
            console.log(`Successfully updated ${fieldName} to: ${selectedPriority}`);
            console.log("Updated item data:", this.item.system);

            // Re-render the sheet to reflect the changes
            this.render();
            ui.notifications.info(`Priority updated to: ${selectedPriority}`);
        }).catch(err => {
            console.error(`Failed to update ${fieldName}:`, err);
            ui.notifications.error('Could not update priority. Check the console for details.');
        });
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

    /*
    _resolveSpecializationsPath(skillType, subfield = null) {
        if (skillType === "languageSkill" && subfield) {
            return `system.skill.languageSkill.${subfield}.specializations`;
        }
        return `system.skill.${skillType}.specializations`;
    }

   */
}