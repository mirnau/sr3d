export default class SR3DItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
            height: 300,
            classes: ["sr3d", "sheet", "item"]
        });
    };

    get template() {
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const ctx = super.getData();
        ctx.system = ctx.item.system;
        ctx.config = CONFIG.sr3d;
        return ctx;
    }
}