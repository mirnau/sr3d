import { flags } from '../helpers/CommonConsts.js'
import SR3DLog from '../SR3DLog.js'
import { LockAttributesDialog } from '../dialogs/LockAttributesDialog.js';
import { baseAttributes } from '../helpers/CommonConsts.js';

export default class SR3DActor extends Actor {

  adjustAttribute(attribute, amount) {

    const system = this.system;
    const value = system[attribute].value;
    const currentPoints = system.creation.attributePoints;

    if (amount > 0 && currentPoints < amount) {
      new LockAttributesDialog(this).render(true);
      return;
    }

    if (amount < 0 && value + amount < 0) {
      ui.notifications.warn("Attribute cannot go below 0!");
      return;
    }

    if ((amount > 0) || (amount < 0 && system[attribute].value > 1)) {
      system[attribute].value += amount;
      system.creation.attributePoints -= amount;
    }


    this.update({ system: system });

    this.recalculateAttribute();
  }

  async recalculateAttribute() {
    const character = this.system;

    let metahumanItem = this.items.find(item => item.type === "metahuman") || null;

    if (metahumanItem) {

      SR3DLog.info("Attribute adjustment for metahumanity", this.name);

      character.body.meta = metahumanItem.system.modifiers.body;
      character.quickness.meta = metahumanItem.system.modifiers.quickness;
      character.strength.meta = metahumanItem.system.modifiers.strength;
      character.charisma.meta = metahumanItem.system.modifiers.charisma;
      character.intelligence.meta = metahumanItem.system.modifiers.intelligence;
      character.willpower.meta = metahumanItem.system.modifiers.willpower;
    }

    character.body.total = character.body.value + character.body.meta;
    character.quickness.total = character.quickness.value + character.quickness.meta;
    character.strength.total = character.strength.value + character.strength.meta;
    character.charisma.total = character.charisma.value + character.charisma.meta;
    character.intelligence.total = character.intelligence.value + character.intelligence.meta;
    character.willpower.total = character.willpower.value + character.willpower.meta;
    character.essence.total = character.essence.value;

    character.magic.total = character.magic.value;
    
    const attributesDone = this.getFlag(flags.namespace, flags.attributesDone);

    if(!attributesDone || character.creation.attributePoints > 0) {

      character.creation.knowledgePoints = character.intelligence.value * 5;
      character.creation.languagePoints = Math.floor(character.intelligence.value * 1.5);
    }

    character.body.mod = character.body.total;
    character.quickness.mod = character.quickness.total;
    character.strength.mod = character.strength.total;
    character.charisma.mod = character.charisma.total;
    character.intelligence.mod = character.intelligence.total;
    character.willpower.mod = character.willpower.total;

    character.reaction.total = Math.floor((character.quickness.mod + character.intelligence.mod) * 0.5);
    character.reaction.total = Math.floor((character.quickness.mod + character.intelligence.mod) * 0.5);


    this.update({ system: character });
  }

  canGoblinizeTo(metaHumanItem) {
  
    const character = this.system;
 
    for (const a of baseAttributes) {
      if (metaHumanItem.system.modifiers[a] < 0 && character[a].value + metaHumanItem.system.modifiers[a] < 1) {
          return false; // Prevent goblinization if the result would drop below 1
      }
  }
  

    return true; // All validations passed
}

  awakenToMagic() {
    const character = this.system;
    character.magic.value = 6;
    this.recalculateAttribute();
  }


  characterSetup() {

    SR3DLog.info("characterSetup entered", this.name);
    const character = this.system

    baseAttributes.forEach((attr) => {
      if (character[attr].value === 0) {
        character[attr].value += 3;
        character.creation.attributePoints -= 3;
      }
    });

    character.essence.value = 6;
    character.magic.value = 0;

    this.recalculateAttribute();
    this.update({ system: character });
  }
}