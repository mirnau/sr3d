export default class CommodityModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            days: new foundry.data.fields.NumberField({
                required: true,
                default: 0,
            }),
            cost: new foundry.data.fields.NumberField({
                required: true,
                default: 0,
            }),
            streetIndex: new foundry.data.fields.NumberField({
                required: true,
                default: 1.0,
            }),
            legality: new foundry.data.fields.SchemaField({
                restrictionLevel: new foundry.data.fields.NumberField({
                    required: true,
                    default: 0,
                }),
                type: new foundry.data.fields.StringField({ required: false, default: "" }),
                category: new foundry.data.fields.StringField({ required: false, default: "" }),
            }),
            isBroken: new foundry.data.fields.BooleanField({ default: false }),
            description: new foundry.data.fields.StringField({
                required: false,
                default: "Enter your description",
            }),
        };
    }
}
