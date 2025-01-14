import SR3DLog from '../SR3DLog.js'

export default class KarmaSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "auto",
            height: "auto",
            classes: ["sr3d", "sheet", "item"],
            resizable: false
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/karma-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
    
        ctx.config = CONFIG.sr3d;
        ctx.system = ctx.item.system;
        ctx.isOwned = Boolean(this.item.parent);

        return ctx;
    }
    
    async _updateObject(event, formData) {
        console.log("Form Data Submitted:", formData);
        await this.object.update(formData);
    }
}