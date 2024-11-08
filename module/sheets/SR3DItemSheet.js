export default class SR3DItemSheet extends ItemSheet {
    
    get template() {
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    getData() {

        const data = super.getData();

        // NOTE: Adding our language configs
        data.config = CONFIG.sr3d;

        return data;
    }
}