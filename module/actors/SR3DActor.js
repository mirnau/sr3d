import { flags } from '../helpers/CommonConsts.js'
import SR3DLog from '../SR3DLog.js'
import { LockAttributesDialog } from '../dialogs/LockAttributesDialog.js';
import { baseAttributes } from '../helpers/CommonConsts.js';
import ItemDataService from '../services/ItemDataService.js'

export default class SR3DActor extends Actor {

  async silentUpdate(propertyPath, newValue, elementSelector) {
    // Update the database silently
    await this.update({ [propertyPath]: newValue }, { render: false });

    // Dynamically update the DOM
    const element = this.sheet.element.find(elementSelector);
    if (element.length) {
      element.text(newValue);
    }
  }

  async handleCreationPoints(attributeName, element, direction) {

    const attributeSelector = ".attribute-point-value.attributePoints";

    this.silentUpdateAttributes(attributeName, element, direction);
    this.silentUpdateDerivedValues(attributeName, element, direction);

    const attributePoints = this.getCreationPoints(attributeSelector);

    if (attributePoints < 1) {
      new LockAttributesDialog(this).render(true);
    }
  }

  getCreationPoints(selector) {
    return parseInt(document.querySelector(selector).textContent.trim(), 10);
  }

  setCreationPoints(value, pointsName, selector) {
    document.querySelector(selector).textContent = value;
    this.update({ [`system.creation.${pointsName}`]: value }, { render: false });
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

  async recalculateAttribute() {
    const system = this.system;

    const metahumanItem = this.items.find(item => item.type === "metahuman");

    system.attributes.body.meta = metahumanItem.system.modifiers.body;
    system.attributes.quickness.meta = metahumanItem.system.modifiers.quickness;
    system.attributes.strength.meta = metahumanItem.system.modifiers.strength;
    system.attributes.charisma.meta = metahumanItem.system.modifiers.charisma;
    system.attributes.intelligence.meta = metahumanItem.system.modifiers.intelligence;
    system.attributes.willpower.meta = metahumanItem.system.modifiers.willpower;

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

    await this.update({ system: system }, { render: true });

    SR3DLog.info("Stats recalculated", this.name);

    return system;
  }


  awakenToMagic() {
    this.update({ ['system.attributes.magic.value']: 6 });
    SR3DLog.success("Character Awakened To Magic", this.name);
  }

  async characterSetup() {

    SR3DLog.info("characterSetup entered", this.name);

    const attributes = this.system.attributes;
    const creation = this.system.creation;

    baseAttributes.forEach((attr) => {
      if (attributes[attr].value === 0) {
        attributes[attr].value += 3;
        creation.attributePoints -= 3;
      }
    });

    attributes.essence.value = 6;

    let magic = this.items.find(item => item.type === "magic") || [];
    attributes.magic.value = magic.length > 0 ? 6 : 0; 
    
    this.recalculateAttribute();

    await this.update({
      [`system.creation`]: creation
    }, { render: true });

  }

  async silentUpdateAttributes(attributeName, element, direction) {
    const attrsSelector = ".attribute-point-value.attributePoints";
    let attributePoints = this.getCreationPoints(attrsSelector);

    if (attributePoints > 0 || direction < 0) {
        const attributes = this.system.attributes;
        let total = attributes[attributeName].total;
        let mod = attributes[attributeName].mod;

        total += direction;
        mod += direction;

        if (total > 1) {
            attributePoints -= direction;
            this.setCreationPoints(attributePoints, attributeName, attrsSelector);

            await this.update({ [`system.attributes.${attributeName}.total`]: total }, { render: false });
            await this.update({ [`system.attributes.${attributeName}.mod`]: mod }, { render: false });

            if (attributeName === "intelligence") {
                const knowledgePoints = total * 5;
                const languagePoints = Math.floor(total * 1.5);
                const kptsSelector = ".attribute-point-value.knowledgePoints";
                const lptsSelector = ".attribute-point-value.languagePoints";
                this.setCreationPoints(knowledgePoints, "knowledgePoints", kptsSelector);
                this.setCreationPoints(languagePoints, "languagePoints", lptsSelector);
            }

            const elementSelector = `[data-attribute="${attributeName}"] .stat-value h1`;
            element.find(elementSelector).text(`${total} / ${mod}`);
        }
    }
}

  async silentUpdateDerivedValues(attributeName, html, direction) {
    const attributes = this.system.attributes;
    const quickness = attributes.quickness?.total || 0;
    const intelligence = attributes.intelligence?.total || 0;
    const charisma = attributes.intelligence?.total || 0;
    const willpower = attributes.willpower?.total || 0;
    const magic = attributes.magic?.total || 0;
    let reaction = 0;

    if (["quickness", "intelligence"].includes(attributeName)) {
      reaction = Math.floor((quickness + intelligence + direction) * .5);
      await this.update({
        [`system.attributes.reaction.total`]: reaction,
        [`system.attributes.reaction.mod`]: reaction
      }, { render: false });

      const elementSelector = `[data-attribute="reaction"] .stat-value h1`;
      html.find(elementSelector).text(`${reaction} / ${reaction}`);
    }

    // Combat Pool (as an attribute)
    if (["quickness", "intelligence", "willpower"].includes(attributeName)) {
      const combatPool = Math.floor((quickness + intelligence + willpower + direction) * 0.5);
      await this.update({
        [`system.attributes.combat.total`]: combatPool,
        [`system.attributes.combat.mod`]: combatPool
      }, { render: false });

      const elementSelector = `[data-attribute="combat"] .stat-value h1`;
      html.find(elementSelector).text(`${combatPool} / ${combatPool}`);
    }

    // Astral Pool (as an attribute)
    if (["charisma", "intelligence", "willpower"].includes(attributeName)) {
      const astralPool = Math.floor((charisma + intelligence + willpower + direction) * 0.5);
      await this.update({
        [`system.attributes.astral.total`]: astralPool,
        [`system.attributes.astral.mod`]: astralPool
      }, { render: false });

      const elementSelector = `[data-attribute="astral"] .stat-value h1`;
      html.find(elementSelector).text(`${astralPool} / ${astralPool}`);
    }

    //Spell Pool (as an attribute)
    if (["magic", "intelligence", "willpower"].includes(attributeName)) {
      const spellPool = Math.floor((intelligence + willpower + magic + direction) * 0.3333);
      await this.update({ [`system.attributes.spell.total`]: spellPool }, { render: false });
      const elementSelector = `[data-attribute="spell"] .stat-value h1`;
      html.find(elementSelector).text(`${spellPool} / ${spellPool}`);
    }


    // Hacking Pool (as an attribute)
    if (["intelligence"].includes(attributeName)) {
      const mpcp = this.system.cyberdeck?.mpcp || 0; // Assume MPCP value is stored in the cyberdeck system
      const hackingPool = Math.floor((intelligence + mpcp + direction) * 0.3333);
      await this.update({
        [`system.attributes.hacking.total`]: hackingPool,
        [`system.attributes.hacking.mod`]: hackingPool
      }, { render: false });

      const elementSelector = `[data-attribute="hacking"] .stat-value h1`;
      html.find(elementSelector).text(`${hackingPool} / ${hackingPool}`);
    }

    // Control Pool (as an attribute)
    if (["reaction"].includes(attributeName)) {
      const vcrModifier = this.system.cyberware?.vcr || 0; // Assume VCR value is stored in cyberware system
      const controlPool = Math.floor(reaction + vcrModifier);
      await this.update({
        [`system.attributes.control.total`]: controlPool,
        [`system.attributes.control.mod`]: controlPool
      }, { render: false });

      const elementSelector = `[data-attribute="control"] .stat-value h1`;
      html.find(elementSelector).text(`${controlPool} / ${controlPool}`);
    }
  }
}
