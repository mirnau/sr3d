export default class NewsBroadcastModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            preparedNews: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({ required: true }),
                { required: true, initial: [] } // Default to an empty array
            ),
            rollingNews: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({ required: true }),
                { required: true, initial: [] } // Default to an empty array
            ),
            isBroadcasting: new foundry.data.fields.BooleanField({
                required: true,
                initial: false // Default to false
            }),
        };
    }
}
