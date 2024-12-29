export default class MetahumanModel extends foundry.abstract.DataModel {
    static defineSchema() {
      return {
        // Array of strings
        templates: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({ required: false })
        ),
  
        // Simple string
        name: new foundry.data.fields.StringField({
          required: false,
          default: ""
        }),
  
        // Lifespan
        lifespan: new foundry.data.fields.SchemaField({
          min: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          average: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          max: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          })
        }),
  
        // Physical: height & weight
        physical: new foundry.data.fields.SchemaField({
          height: new foundry.data.fields.SchemaField({
            min: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            average: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            max: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            })
          }),
          weight: new foundry.data.fields.SchemaField({
            min: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            average: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            }),
            max: new foundry.data.fields.NumberField({
              required: true,
              default: 0,
              integer: true
            })
          })
        }),
  
        // Modifiers
        modifiers: new foundry.data.fields.SchemaField({
          strength: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          quickness: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          body: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          charisma: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          intelligence: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          willpower: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          })
        }),
  
        // Attribute limits
        attributeLimits: new foundry.data.fields.SchemaField({
          strength: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          quickness: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          body: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          charisma: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          intelligence: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          }),
          willpower: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          })
        }),
  
        // Karma advancement fraction
        karmaAdvancementFraction: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({
            required: true,
            default: 0,
            integer: true
          })
        }),
  
        // Vision
        vision: new foundry.data.fields.SchemaField({
          visionType: new foundry.data.fields.StringField({
            required: false,
            default: ""
          }),
          description: new foundry.data.fields.StringField({
            required: false,
            default: ""
          }),
          rules: new foundry.data.fields.SchemaField({
            darknessPenaltyNegation: new foundry.data.fields.StringField({
              required: false,
              default: ""
            })
          })
        }),
  
        // Priority
        priority: new foundry.data.fields.StringField({
          required: false,
          default: ""
        }),
  
        // Description
        description: new foundry.data.fields.StringField({
          required: false,
          default: ""
        })
      };
    }
  }
  