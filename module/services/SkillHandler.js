export default class SkillHandler {
    constructor(item) {
        this.item = item; // Reference to the parent SR3DItem instance
        this.actor = item.parent; // The actor associated with the item
    }

    onBuySkill(event) {
        event.preventDefault();

        const { skillType } = this.item.system;

        // Define mapping for skill types
        const skillConfig = {
            activeSkill: {
                pointsKey: "system.creation.activePoints",
                skillKey: "system.activeSkill.value",
                currentPointsKey: "currentActivePoints"
            }
        };

        const config = skillConfig[skillType];

        if (!config) {
            console.error(`Unknown skill type: ${skillType}`);
            return;
        }

        const availablePoints = this.actor.system.creation[config.pointsKey.split(".").pop()];
        const currentPoints = this.item[config.currentPointsKey] || 0;
        const skillValue = this.item.system.activeSkill?.value || 0;

        if (availablePoints > currentPoints) {
            const updatedActorData = {
                [config.pointsKey]: availablePoints - 1,
            };
            const updatedItemData = {
                [config.skillKey]: skillValue + 1,
            };

            // Update actor and item
            Promise.all([
                this.actor.update(updatedActorData),
                this.item.update(updatedItemData)
            ]).catch(error => console.error(`Failed to update: ${error.message}`));
        } else {
            console.warn('Not enough points to purchase the skill.');
            // TODO: Implement shopping with karma points
        }
    }

    onUndoSkill(event) {
        event.preventDefault();

        const { skillType } = this.item.system;

        // Define mapping for skill types
        const skillConfig = {
            activeSkill: {
                pointsKey: "system.creation.activePoints",
                skillKey: "system.activeSkill.value",
                currentPointsKey: "currentActivePoints"
            }
        };

        const config = skillConfig[skillType];

        if (!config) {
            console.error(`Unknown skill type: ${skillType}`);
            return;
        }

        const availablePoints = this.actor.system.creation[config.pointsKey.split(".").pop()];
        const currentPoints = this.item[config.currentPointsKey] || 0;
        const skillValue = this.item.system.activeSkill?.value || 0;

        if (skillValue > currentPoints) {
            const updatedActorData = {
                [config.pointsKey]: availablePoints + 1,
            };
            const updatedItemData = {
                [config.skillKey]: skillValue - 1,
            };

            // Update actor and item
            Promise.all([
                this.actor.update(updatedActorData),
                this.item.update(updatedItemData)
            ]).catch(error => console.error(`Failed to update: ${error.message}`));
        } else {
            console.warn('Skill value cannot be reduced further.');
            // Additional logic if needed
        }
    }
}
