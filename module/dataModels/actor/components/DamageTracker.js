export default class DamageTracker extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        stun: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        physical: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        overflow: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      };
    }
  }