export class CharacterCreationDialog extends Dialog {
    constructor(actor, options = {}) {
      super(options);
      this.actor = actor; // Pass the actor for context
    }
  
    static async create(actor) {
      // Render the Handlebars template
      const html = await renderTemplate("./templates/dialogs/character-creation-dialog.hbs", {
        actor,
        priorities: ["A", "B", "C", "D", "E"], // Example data for template
      });
  
      // Create and return the dialog
      return new this(actor, {
        title: "Character Creation",
        content: html,
        buttons: {
          submit: {
            label: "Submit",
            callback: async (html) => {
              const formData = new FormData(html[0].querySelector("form"));
              const choices = Object.fromEntries(formData.entries());
  
              // Validate and update actor
              if (this.validateChoices(choices)) {
                await actor.setFlag("system", "creationComplete", true);
                await actor.update({ /* Apply creation choices */ });
                ui.notifications.info("Character creation completed!");
              } else {
                ui.notifications.error("Invalid selection. Each priority must be unique.");
              }
            },
          },
          cancel: {
            label: "Cancel",
            callback: () => ui.notifications.warn("Character creation canceled."),
          },
        },
        default: "submit",
      });
    }
  
    static validateChoices(choices) {
      const values = Object.values(choices);
      return new Set(values).size === values.length;
    }
  }
  