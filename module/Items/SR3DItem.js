import SkillHandler from "../services/SkillHandler.js";

export class SR3DItem extends Item {
    constructor(data, context = {}) {
        super(data, context);

        this.currentActivePoints = this.system.activeSkill?.value || 0;
        this.currentKnowledgePoints = this.system.knowledgeSkill?.value || 0;

        this.skillHandler = null;
    }
    
    onClose() {
        if (this.system.skillType === 'activeSkill') {
            this.currentActivePoints = this.system.activeSkill?.value || 0;
        } else if (this.system.skillType === 'knowledgeSkill') {
            this.currentKnowledgePoints = this.system.knowledgeSkill?.value || 0;
        }

        this.skillHandler = null;
    }

    onBuySkill(event) {
        event.preventDefault();

        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onBuySkill(event);
    }

    onUndoSkill(event) {
        event.preventDefault();

        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onUndoSkill(event);
    }
}
