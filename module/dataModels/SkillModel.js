export default class SkillModel extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        skillType: new foundry.data.fields.StringField({
          required: true,
          default: "activeSkill"
        }),
  
        activeSkill: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          linkedAttribute: new foundry.data.fields.StringField({
            required: true,
            default: ""
          }),
          specializations: new foundry.data.fields.ArrayField(
            new foundry.data.fields.StringField({ required: false })
          )
        }),
  
        knowledgeSkill: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          linkedAttribute: new foundry.data.fields.StringField({
            required: true,
            default: "intelligence"
          }),
          specializations: new foundry.data.fields.ArrayField(
            new foundry.data.fields.StringField({ required: false })
          )
        }),
  
        languageSkill: new foundry.data.fields.SchemaField({
          speak: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            specializations: new foundry.data.fields.ArrayField(
              new foundry.data.fields.StringField({ required: false })
            )
          }),
          read: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            specializations: new foundry.data.fields.ArrayField(
              new foundry.data.fields.StringField({ required: false })
            )
          }),
          write: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            specializations: new foundry.data.fields.ArrayField(
              new foundry.data.fields.StringField({ required: false })
            )
          })
        }),
  
        description: new foundry.data.fields.StringField({
          required: false,
          default: ""
        })
      };
    }
  }
  