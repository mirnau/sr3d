export default class SR3DItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 600,
            height: 300,
            classes: ["sr3d", "sheet", "item"]
        });
    };

    get template() {
        return `systems/sr3d/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        // Only apply the dialog logic for items of type 'skill'
        if (this.item.type === "skill" && !this.object.system.initialized) {
            await this._showSkillTypeDialog();
        }

        const ctx = super.getData();
        ctx.attributes = ["Body", "Quickness", "Strength", "Intelligence", "Willpower", "Charisma"];
        ctx.system = ctx.item.system;
        ctx.config = CONFIG.sr3d;
        return ctx;
    }

    async _showSkillTypeDialog() {
        return new Promise((resolve) => {
            new Dialog({
                title: "Select Skill Type",
                content: `
                    <form>
                        <fieldset>
                            <legend>Choose Skill Type</legend>
                            <label>
                                <input type="radio" name="skillType" value="skill"> Active Skill
                            </label>
                            <label>
                                <input type="radio" name="skillType" value="knowledgeSkill"> Knowledge Skill
                            </label>
                            <label>
                                <input type="radio" name="skillType" value="languageSkill"> Language Skill
                            </label>
                        </fieldset>
                    </form>
                `,
                buttons: {
                    confirm: {
                        label: "Confirm",
                        callback: (html) => {
                            const selectedType = html.find('input[name="skillType"]:checked').val();
                            if (selectedType) {
                                this.object.update({
                                    "system.skillType": selectedType,
                                    "system.initialized": true,
                                });
                            }
                            resolve();
                        },
                    },
                    cancel: {
                        label: "Cancel",
                        callback: () => {
                            this.object.delete();
                            resolve();
                        },
                    },
                },
                default: "confirm",
            }).render(true);
        });
    }
}
