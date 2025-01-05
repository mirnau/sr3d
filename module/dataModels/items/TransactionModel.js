export default class TransactionModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      amount: new foundry.data.fields.NumberField({
        required: true,
        initial: 0.0,
      }),
      recurrent: new foundry.data.fields.BooleanField({
        required: true,
        initial: false,
      }),
      type: new foundry.data.fields.StringField({
        required: true,
        choices: ["Payment", "Income", "Expense", "Debt"],
        initial: "Income",
      }),
      description: new foundry.data.fields.StringField({
        required: true,
        initial: "",
      }),
      creditorID: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),
      creditorName: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),
      interestPerMonth: new foundry.data.fields.NumberField({
        required: true,
        initial: 0.0,
      }),
    };
  }
}