export default class SR3DActorSheet extends ActorSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3d/templates/sheets/playerCharacter-sheet.hbs",
            classes: ["sr3d", "sheet", "character"],
            width: 1300,
            height: 600,
            tabs: [
                {
                    navSelector: ".sheet-tabs .tabs",
                    contentSelector: ".tab-content",
                    initial: "inventory"
                }
            ]
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    async getData() {
        try {
            const ctx = super.getData();
            ctx.system = ctx.actor.system;
            ctx.config = CONFIG.sr3d;
            ctx.cssClass = "actorSheet";

            ctx.skills = {
                active: this._categorizeAndSortSkills(
                    ctx.actor.items.contents.filter((item) => item.type === "skill" && item.system.skillType === "activeSkill"),
                    (item) => item.system.activeSkill.linkedAttribute
                ),
                knowledge: this._categorizeAndSortSkills(
                    ctx.actor.items.contents.filter((item) => item.type === "skill" && item.system.skillType === "knowledgeSkill"),
                    (item) => item.system.knowledgeSkill.linkedAttribute
                ),
                language: this._sortSkillsByName(
                    ctx.actor.items.contents.filter((item) => item.type === "skill" && item.system.skillType === "languageSkill")
                ),
            };

            ctx.skills.language = ctx.actor.items
            .filter((item) => item.type === "skill" && item.system.skillType === "languageSkill")
            .map((skill) => ({
              id: skill.id,  
              name: skill.name, // The name of the language skill
              subskills: {
                Speech: skill.system.languageSkill.speach.base, // Base value for Speech
                Read: skill.system.languageSkill.read.base, // Base value for Read
                Write: skill.system.languageSkill.write.base, // Base value for Write
              },
            }));

            ctx.inventory = {
                weapons: ctx.actor.items.contents.filter(item => item.type === "weapon"),
                armor: ctx.actor.items.contents.filter(item => item.type === "armor"),
                consumables: ctx.actor.items.contents.filter(item => item.type === "consumable"),
                others: ctx.actor.items.contents.filter(item => !["weapon", "armor", "consumable"].includes(item.type))
            };

            return ctx;
        } catch (error) {
            console.error("Error in SR3DActorSheet.getData:", error);
            return super.getData();
        }
    }

    _categorizeAndSortSkills(skills, keyFn) {
        const categories = skills.reduce((acc, skill) => {
            const category = keyFn(skill) || "uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill);
            return acc;
        }, {});

        Object.keys(categories).forEach((key) => {
            categories[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        return categories;
    }

    _sortSkillsByName(skills) {
        return skills.sort((a, b) => a.name.localeCompare(b.name));
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".delete-skill").click(this._onDeleteSkill.bind(this));
        html.find(".edit-skill").click(this._onEditSkill.bind(this));
    }

    _onEditSkill(event) {
        event.preventDefault();
      
        const skillId = event.currentTarget.dataset.id;
      
        const skill = this.actor.items.get(skillId);
      
        if (skill) {
          // Open the item sheet
          skill.sheet.render(true);
        } else {
          // Handle error if skill is not found
          ui.notifications.error("Skill not found.");
          console.error("Skill not found:", skillId);
        }
      }

    _onDeleteSkill(event) {
        event.preventDefault();
      
        // Get the skill ID from the clicked element
        const skillId = event.currentTarget.dataset.id;
        console.log("Skill ID:", skillId); // Log the skill ID
      
        // Fetch the skill using the ID
        const skill = this.actor.items.get(skillId);
      
        if (skill) {
          console.log("Skill Found:", skill); // Log the skill if found
          // Confirm deletion
          const confirmed = window.confirm(`Are you sure you want to delete "${skill.name}"?`);
          if (!confirmed) return;
      
          // Delete the skill
          skill.delete().then(() => {
            ui.notifications.info(`${skill.name} has been deleted.`);
          }).catch((error) => {
            ui.notifications.error("An error occurred while deleting the skill.");
            console.error(error);
          });
        } else {
          console.error("Skill not found:", skillId); // Log missing skill
          ui.notifications.error("Skill not found.");
        }
      }
      
      

    _onItemCreate(event) {
        event.preventDefault();
    
        // Get the clicked element and skill type
        const element = event.currentTarget;
        const skillType = element.dataset.skillType; // Retrieve the skill type (e.g., activeSkill)
        const itemType = element.dataset.type; // Retrieve the item type (always "skill" here)
    
        // Ensure the skill type is valid
        if (!itemType || !skillType) {
            console.error("Invalid item or skill type specified:", { itemType, skillType });
            return;
        }
    
        // Prepare the item data
        const itemData = {
            name: game.i18n.localize("sr3d.sheet.newItem"),
            type: itemType,
            system: {
                skillType: skillType // Set the specific skill type
            }
        };
    
        // Add specific default data for skill types (optional)
        if (skillType === "activeSkill") {
            itemData.system.activeSkill = { linkedAttribute: "Body", value: 0, specializations: [] };

        } else if (skillType === "knowledgeSkill") {

            itemData.system.knowledgeSkill = { linkedAttribute: "Intelligence", value: 0, specializations: [] };

        } else if (skillType === "languageSkill") {
            itemData.system.languageSkill = {
                speach: { base: 0, specializations: [] },
                read: { base: 0, specializations: [] },
                write: { base: 0, specializations: [] }
            };
        }
    
        // Create the item
        return this.actor.createEmbeddedDocuments("Item", [itemData]).then(() => {
            ui.notifications.info(`Created new ${skillType}`);
        }).catch((error) => {
            console.error("Error creating item:", error);
            ui.notifications.error(`Failed to create new ${skillType}. Check console for details.`);
        });
    }
}
