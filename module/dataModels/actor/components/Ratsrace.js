export default class Ratsrace extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        // Income Array
        income: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            post: new foundry.data.fields.SchemaField({
              amount: new foundry.data.fields.NumberField({
                required: true,
                initial: 0.0,
              }),
              recurrent: new foundry.data.fields.BooleanField({
                required: true,
                initial: false,
              }),
            }),
          }),
          {
            required: true,
            initial: [],
          }
        ),
  
        // Expenses Array
        expenses: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            post: new foundry.data.fields.SchemaField({
              amount: new foundry.data.fields.NumberField({
                required: true,
                initial: 0.0,
              }),
              recurrent: new foundry.data.fields.BooleanField({
                required: true,
                initial: false,
              }),
            }),
          }),
          {
            required: true,
            initial: [],
          }
        ),
  
        // Debts Array
        debts: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            creditor: new foundry.data.fields.StringField({
              required: false,
              initial: "",
            }),
            interestPerMonth: new foundry.data.fields.NumberField({
              required: true,
              initial: 0.0,
            }),
            debt: new foundry.data.fields.NumberField({
              required: true,
              initial: 0.0,
            }),
          }),
          {
            required: true,
            initial: [],
          }
        ),
  
        // Illiquid Assets
        illiquidAssets: new foundry.data.fields.NumberField({
          required: true,
          initial: 0.0,
        }),
      };
    }
  }