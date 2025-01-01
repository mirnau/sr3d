import SkillHandler from "../services/SkillHandler.js";
import KarmaHandler from "../services/KarmaHandler.js";
import { flags } from "../helpers/CommonConsts.js";
import SR3DLog from "../SR3DLog.js";

export class WeaponItem extends Item {
    constructor(data, context = {}) {
        super(data, context);

        this.currentActivePoints = this.system.activeSkill?.value || 0;
        this.currentKnowledgePoints = this.system.knowledgeSkill?.value || 0;

        this.skillHandler = null;
        this.karmaHandler = null;

        this.isNotCharacterCreation = false;

        console.log("WEAPON ITEM has been called");
    }

    prepareData() {
        super.prepareData();
        console.log("WEAPON ITEM has been called");
    }
    
    static get schema() {
        console.log("WEAPON ITEM has been called");
        return WeaponDataModel;
    }

    _isNotCharacterCreation() {
        return !this.parent.getFlag(flags.namespace, flags.isCharacterCreationState);
    }
    
    
    onClose() {
        if (this.system.skillType === 'activeSkill') {
            this.currentActivePoints = this.system.activeSkill?.value || 0;
        } else if (this.system.skillType === 'knowledgeSkill') {
            this.currentKnowledgePoints = this.system.knowledgeSkill?.value || 0;
        }

        this.skillHandler = null;
        this.karmaHandler = null;


    }

    onAddSpecialization(event) {
        event.preventDefault();

        if(this._isNotCharacterCreation()) {
            this.karmaHandler ||= new KarmaHandler(this);
            this.karmaHandler.onAddSpecialization(event);
            return;
        }

        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onAddSpecialization(event);
    }

    onDeleteSpecialization(event) {

        if(this._isNotCharacterCreation()) {
            this.karmaHandler ||= new KarmaHandler(this);
            this.karmaHandler.onDeleteSpecialization(event);
            return;
        }

        event.preventDefault();
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onDeleteSpecialization(event);
    }

    onBuySkill(event) {

        if(this._isNotCharacterCreation()) {
            this.karmaHandler ||= new KarmaHandler(this);
            this.karmaHandler.onBuySkill(event);
            return;
        }

        event.preventDefault();
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onBuySkill(event);
    }

    onUndoSkill(event) {
        event.preventDefault();

        if(this._isNotCharacterCreation()) {
            this.karmaHandler ||= new KarmaHandler(this);
            this.karmaHandler.onUndoSkill(event);
            return;
        }

        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onUndoSkill(event);
    }

    onBuySpecialization(event) {
        event.preventDefault();

        const index = parseInt(event.currentTarget.closest(".specialization-actions").dataset.index, 10);

        if(this._isNotCharacterCreation()) {
            this.karmaHandler ||= new KarmaHandler(this);
            this.karmaHandler.onBuySpecialization(event, index);
            return;
        }
    
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onBuySpecialization(event, index);
    }
    
    onUndoSpecialization(event) {
        event.preventDefault();
    
        const index = parseInt(event.currentTarget.closest(".specialization-actions").dataset.index, 10);

        if(this._isNotCharacterCreation()) {
            this.karmaHandler ||= new KarmaHandler(this);
            this.karmaHandler.onUndoSpecialization(event, index);
            return;
        }
       
        this.skillHandler ||= new SkillHandler(this);
        this.skillHandler.onUndoSpecialization(event, index);
    }
  
}
