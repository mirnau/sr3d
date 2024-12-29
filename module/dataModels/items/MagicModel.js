export default class MagicModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      type: new foundry.data.fields.StringField({
        required: false,
        default: ""
      }),
      focus: new foundry.data.fields.StringField({
        required: false,
        default: ""
      }),
      drainResistanceAttribute: new foundry.data.fields.StringField({
        required: false,
        default: ""
      }),
      totem: new foundry.data.fields.StringField({
        required: false,
        default: ""
      }),
      priority: new foundry.data.fields.StringField({
        required: false,
        default: ""
      })
    };
  }
}
