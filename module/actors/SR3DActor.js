import { flags } from '../helpers/CommonConsts.js'
import SR3DLog from '../SR3DLog.js'
import { LockAttributesDialog } from '../dialogs/LockAttributesDialog.js';
import { baseAttributes } from '../helpers/CommonConsts.js';

export default class SR3DActor extends Actor {

  adjustAttribute(attribute, amount) {

    const system = this.system;
    let value = system.attributes[attribute].value;
    let currentPoints = system.creation.attributePoints;

    if (!this.getFlag(flags.namespace, flags.attributesDone)) {

      if (currentPoints <= 0 && amount > 0) {
        ui.notifications.warn(game.i18n.localize("sr3d.characterCreation.spentAllAttributePoints"));
        new LockAttributesDialog(this).render(true);
        return;
      }

      if ((amount > 0) || (amount < 0 && system.attributes[attribute].value > 1)) {
        system.attributes[attribute].value += amount;
        system.creation.attributePoints -= amount;
      }

      value = system.attributes[attribute].value;
      currentPoints = system.creation.attributePoints;

      this.update({ system: system });
      this.recalculateAttribute();

      if (amount > 0 && currentPoints < amount) {
        new LockAttributesDialog(this).render(true);
        return;
      }

    } else {
      //Karma points!
    }
  }


  async recalculateAttribute() {
    const system = this.system;

    let metahumanItem = this.items.find(item => item.type === "metahuman") || null;

    if (metahumanItem) {

      SR3DLog.info("Attribute adjustment for metahumanity", this.name);

      system.attributes.body.meta = metahumanItem.system.modifiers.body;
      system.attributes.quickness.meta = metahumanItem.system.modifiers.quickness;
      system.attributes.strength.meta = metahumanItem.system.modifiers.strength;
      system.attributes.charisma.meta = metahumanItem.system.modifiers.charisma;
      system.attributes.intelligence.meta = metahumanItem.system.modifiers.intelligence;
      system.attributes.willpower.meta = metahumanItem.system.modifiers.willpower;
    }

    system.attributes.body.total = system.attributes.body.value + system.attributes.body.meta;
    system.attributes.quickness.total = system.attributes.quickness.value + system.attributes.quickness.meta;
    system.attributes.strength.total = system.attributes.strength.value + system.attributes.strength.meta;
    system.attributes.charisma.total = system.attributes.charisma.value + system.attributes.charisma.meta;
    system.attributes.intelligence.total = system.attributes.intelligence.value + system.attributes.intelligence.meta;
    system.attributes.willpower.total = system.attributes.willpower.value + system.attributes.willpower.meta;
    system.attributes.essence.total = system.attributes.essence.value;

    system.attributes.magic.total = system.attributes.magic.value;

    const attributesDone = this.getFlag(flags.namespace, flags.attributesDone);

    if (!attributesDone || creation.attributePoints > 0) {

      system.creation.knowledgePoints = system.attributes.intelligence.value * 5;
      system.creation.languagePoints = Math.floor(system.attributes.intelligence.value * 1.5);
    }

    system.attributes.body.mod = system.attributes.body.total;
    system.attributes.quickness.mod = system.attributes.quickness.total;
    system.attributes.strength.mod = system.attributes.strength.total;
    system.attributes.charisma.mod = system.attributes.charisma.total;
    system.attributes.intelligence.mod = system.attributes.intelligence.total;
    system.attributes.willpower.mod = system.attributes.willpower.total;

    system.attributes.reaction.total = Math.floor((system.attributes.quickness.mod + system.attributes.intelligence.mod) * 0.5);
    system.attributes.reaction.total = Math.floor((system.attributes.quickness.mod + system.attributes.intelligence.mod) * 0.5);


    this.update({ system: system });
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
    character.attributes.magic.value = 6;
    this.recalculateAttribute();
  }


  characterSetup() {

    SR3DLog.info("characterSetup entered", this.name);
    console.log(this);
    console.log(this.system);

    const attributes = this.system.attributes;
    const creation = this.system.creation;

    baseAttributes.forEach((attr) => {
      if (attributes[attr].value === 0) {
        attributes[attr].value += 3;
        creation.attributePoints -= 3;
      }
    });

    attributes.essence.value = 6;
    attributes.magic.value = 0;

    this.recalculateAttribute();
    this.update({ system: attributes });
  }
}