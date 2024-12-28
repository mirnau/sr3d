import { baseAttributeDropdown } from "../helpers/CommonConsts.js";
import ProceedWithDelete from "../dialogs/ProcedeWithDelete.js";
import ItemDataService from "../services/ItemDataService.js";

import SR3DLog from '../SR3DLog.js'

export default class AmmunitionSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/ammunition-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
    
        // Add attributes to the context
        ctx.attributes = baseAttributeDropdown;
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);
    
            ctx.availableWeapons = ItemDataService.availableWeapons(ctx);
            ctx.compatibleWeapons = ItemDataService.compatibleWeapons(ctx);
            SR3DLog.inspect(ctx.system.category);

        console.log("AmmunitionSheet has been Called");
    
        return ctx;
    }
    
    activateListeners(html) {
        super.activateListeners(html);

            html.find('#to-compatible').click(() => this._moveToCompatible(html));
            html.find('#to-available').click(() => this._moveToAvailable(html));
            html.find('.rounds-editable, .cost-editable').on('input', this._updateTotalCost.bind(this, html));
       
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
}