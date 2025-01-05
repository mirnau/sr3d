
export default class TransactionSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/transaction-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
    
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);
        ctx.actors = game.actors.filter(actor => actor.type === "character");

        return ctx;
    }
    
    async _updateObject(event, formData) {
        const html = this.form;
      
        const select = html.querySelector('[name="system.creditorID"]');
        const selectedOption = select?.querySelector(`option[value="${select.value}"]`);
        const actorName = selectedOption?.dataset.actorName ?? "";
      
        formData["system.creditorName"] = actorName;
      
        return super._updateObject(event, formData);
      }

}