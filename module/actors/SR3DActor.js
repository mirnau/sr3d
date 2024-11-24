export default class SR3DActor extends Actor {
  /** Override the prepareData method */
  prepareData() {
    super.prepareData();

    // Only prepare derived stats for player characters
    if (this.type === "playerCharacter") {
      this._prepareDerivedStatsPlayerCharacter();
    }
  }

  /** Calculate derived stats */
  _prepareDerivedStatsPlayerCharacter() {

    const character = this.system;

    character.creation.knowledgePoints = character.intelligence.base * 20;
    character.creation.languageSkills = Math.floor(character.intelligence.base * 1.5);

    if (character.body.base === 0) {
      character.body.base += 1;
      character.creation.attributePoints -= 1;
      character.quickness.base += 1;
      character.creation.attributePoints -= 1;
      character.strength.base += 1;
      character.creation.attributePoints -= 1;
      character.intelligence.base += 1;
      character.creation.attributePoints -= 1;
      character.charisma.base += 1;
      character.creation.attributePoints -= 1;
      character.willpower.base += 1;
    }
  }
}