import Profile from "./components/Profile.js";
import Attributes from "./components/Attributes.js";
import Creation from "./components/Creation.js";
import KarmaModel from "./components/Karma.js";
import DamageTracker from "./components/DamageTracker.js";
import Ratsrace from "./components/Ratsrace.js";

export default class CharacterModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      profile: new foundry.data.fields.SchemaField(Profile.defineSchema()),
      ratsrace: new foundry.data.fields.SchemaField(Ratsrace.defineSchema()),
      attributes: new foundry.data.fields.SchemaField(Attributes.defineSchema()),
      creation: new foundry.data.fields.SchemaField(Creation.defineSchema()),
      karma: new foundry.data.fields.SchemaField(KarmaModel.defineSchema()),
      damageTracker: new foundry.data.fields.SchemaField(DamageTracker.defineSchema()),
    };
  }
}