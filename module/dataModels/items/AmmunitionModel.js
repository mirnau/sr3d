import CommodityModel from "./components/commodity.js";
import PortabilityModel from "./components/portability.js";

export default class AmmunitionModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            ...CommodityModel.defineSchema(),
            ...PortabilityModel.defineSchema(),
            type: new foundry.data.fields.StringField({
                required: true,
                default: "regular",
            }),
            rounds: new foundry.data.fields.NumberField({
                required: true,
                default: 10,
                integer: true,
            }),
            compatibleWeaponIds: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({
                    required: false,
                })
            ),
        };
    }
}
