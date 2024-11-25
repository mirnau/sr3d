export default class SR3DActor extends Actor {
  /** Override the prepareData method */
  prepareData() {
    super.prepareData();

    // Only prepare derived stats for player characters
    if (this.type === "playerCharacter") {
      const character = this.system;
      this._prepareDerivedStatsPlayerCharacter(character);
      this._updateAttributeMods(character);
      this._updateDerivedAttributes(character);
    }
  }

  /** Calculate derived stats */
  _prepareDerivedStatsPlayerCharacter(character) {

    if (character.creation.attributePoints > 0) {
      
      const attributes = ["body", "quickness", "strength", "intelligence", "charisma", "willpower"];

      // Ensure minimum base value and adjust attribute points
      attributes.forEach((attr) => {
        if (character[attr].base === 0) {
          character[attr].base += 1;
          character.creation.attributePoints -= 1;
        }
      });

      character.essence.base = 6;
      character.magic.base = 6;
    }

    if (character.creation.knowledgePoints > 0) {
      character.creation.knowledgePoints = character.intelligence.base * 20;

    }

    if (character.creation.languagePoints > 0) {
      character.creation.languageSkills = Math.floor(character.intelligence.base * 1.5);

    }

    if (character.creation.activePoints > 0) {
    }
  }

  _updateAttributeMods(character) {

    character.body.mod = character.body.base;
    character.quickness.mod = character.quickness.base;
    character.strength.mod = character.strength.base;
    character.charisma.mod = character.charisma.base;
    character.intelligence.mod = character.intelligence.base;
    character.willpower.mod = character.willpower.base;

    console.log("sr3d | TODO | update mod calulations in actor")
  }

  _updateDerivedAttributes(character) {
    
    character.reaction.base = Math.floor((character.quickness.mod + character.intelligence.mod)*0.5);
  }
}
