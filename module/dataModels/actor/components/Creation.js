// src/item/data/components/CreationModel.js

export default class Creation extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        attributePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        activePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        knowledgePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        languagePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      };
    }
  }
  