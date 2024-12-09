import { defaultImages } from "../helpers/ItemImagePaths.js";

export class CreateSkillDialog extends Dialog {
    constructor(resolve, htmlTemplate, ctx) {
        super({
            title: "Select Skill Type",
            content: htmlTemplate,
            buttons: {
                confirm: {
                    label: "Confirm",
                    callback: async (html) => {
                        const selectedType = html.find('input[name="skillType"]:checked').val();
                        console.log("Confirm button clicked, selectedType:", selectedType);

                        if (selectedType) {
                            if (ctx?.item) {
                                // Update the existing item with the selected type
                                await ctx.item.update({
                                    "system.skillType": selectedType,
                                    img: defaultImages.skill[selectedType] || defaultImages.default,
                                    ...this._getItemData(selectedType), // Add structure defaults
                                    "system.initialized": true,
                                });
                                console.log("Skill successfully updated with type:", selectedType);
                                resolve(true);
                            } else {
                                // Create a new item structure based on the selected type
                                const itemData = this._getItemData(selectedType);
                                console.log("New skill data prepared:", itemData);
                                resolve(itemData);
                            }
                        } else {
                            console.warn("No skill type selected. Aborting.");
                            resolve(null);
                        }
                    },
                },
                cancel: {
                    label: "Cancel",
                    callback: async () => {
                        console.log("Cancel button clicked.");
                        if (ctx?.item) {
                            console.log("Deleting uninitialized item:", ctx.item.name);
                            await ctx.item.delete();
                        }
                        resolve(null);
                    },
                },
            },
            default: "confirm",
        });
    }

    /**
     * Returns default structure based on skill type.
     */
    _getItemData(skillType) {
        // Initialize the default structure
        let itemData = {
            img: defaultImages.skill[skillType] || defaultImages.default,
            name: `New ${game.i18n.localize(`sr3d.item.skill.${skillType}`)}`,
            type: "skill",
            system: {
                description: "",
                skillType: skillType,
            },
        };

        // Add specific data based on skill type
        switch (skillType) {
            case "activeSkill":
                itemData.system.activeSkill = {
                    value: 0,
                    linkedAttribute: "",
                    specializations: [],
                };
                break;

            case "knowledgeSkill":
                itemData.system.knowledgeSkill = {
                    value: 0,
                    linkedAttribute: "intelligence",
                    specializations: [],
                };
                break;

            case "languageSkill":
                itemData = {
                    ...itemData,
                    system: {
                        ...itemData.system,
                        skill: {
                            ...itemData.system.skill, // Preserve other potential properties under system.skill
                            languageSkill: {
                                speech: { base: 0, specializations: [] },
                                read: { base: 0, specializations: [] },
                                write: { base: 0, specializations: [] },
                            },
                        },
                    },
                };
                break;


            default:
                console.error(`Unknown skill type: ${skillType}`);
                return {};
        }

        return itemData;
    }
}
