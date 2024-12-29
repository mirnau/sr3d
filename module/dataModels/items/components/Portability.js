export default class PortabilityModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            conceal: new foundry.data.fields.NumberField({
                required: true,
                default: 0,
            }),
            weight: new foundry.data.fields.NumberField({
                required: true,
                default: 0.0,
            }),
        };
    }
}
