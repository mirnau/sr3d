export default class KarmaModel extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        value: new foundry.data.fields.NumberField({
          required: true,
          default: 0,
          integer: true
        })
      };
    }
  }
  