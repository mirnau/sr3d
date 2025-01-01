export default class SimpleStat extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        total: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        mod: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      };
    }
  }