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

    onAddSpecialization(event) {
        event.preventDefault();
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onAddSpecialization(event);
    }

    onDeleteSpecialization(event) {
        event.preventDefault();
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onDeleteSpecialization(event);
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

    onBuySpecialization(event) {
        event.preventDefault();

        const index = parseInt(event.currentTarget.closest(".specialization-actions").dataset.index, 10);
    
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onBuySpecialization(event, index);
    }
    
    onUndoSpecialization(event) {
        event.preventDefault();
    
        // Extract the index from the dataset
        const index = parseInt(event.currentTarget.closest(".specialization-actions").dataset.index, 10);
    
        if (isNaN(index)) {
            SR3DLog.error("Invalid specialization index provided.", "onUndoSpecialization");
            return;
        }
    
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onUndoSpecialization(event, index);
    }
    
    
}
