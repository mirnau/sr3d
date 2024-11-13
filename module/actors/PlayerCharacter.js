export class PlayerCharacter extends Actor {

    /*
    prepareData() {
        super.prepareData();
        this._prepareAttributes();
    }*/

    _prepareAttributes() {
        const data = this.system;

        // Step 1: Apply racial modifiers to all six basic attributes
        this._applyRacialModifiers(data);

        // Step 2: Apply modifiers from cyberware and bioware to base stats
        this._applyEnhancements(data);

        // Step 3: Compute derived attributes, like Reaction and Essence
        this._computeDerivedAttributes(data);

        // Step 4: Compute dice pools, like Combat Pool and Spell Pool
        this._computeDicePools(data);

        // Step 5: Compute movement speed and walking speed
        this._computeMovement(data);
    }

    /**
     * Apply racial modifiers to the six basic attributes.
     * This setup allows for custom races with unique modifiers.
     * @param {Object} data - The actor's system data.
     */
    _applyRacialModifiers(data) {
        const race = data.details.race || "human";
        const raceModifiers = RACE_MODIFIERS[race] || {};

        // Apply each modifier to the respective base attribute
        data.attributes.strength.base += raceModifiers.strength || 0;
        data.attributes.quickness.base += raceModifiers.quickness || 0;
        data.attributes.intelligence.base += raceModifiers.intelligence || 0;
        data.attributes.charisma.base += raceModifiers.charisma || 0;
        data.attributes.willpower.base += raceModifiers.willpower || 0;
        data.attributes.body.base += raceModifiers.body || 0;
    }

    /**
     * Apply enhancements from cyberware, bioware, and other items to attributes.
     * @param {Object} data - The actor's system data.
     */
    _applyEnhancements(data) {
        let strengthMod = 0;
        let quicknessMod = 0;
        let intelligenceMod = 0;
        let charismaMod = 0;
        let willpowerMod = 0;
        let bodyMod = 0;

        // Loop through items to apply cyberware and bioware modifiers
        this.items.forEach(item => {
            if (item.type === "cyberware" || item.type === "bioware") {
                const mods = item.system.mods || {};
                strengthMod += mods.strengthMod || 0;
                quicknessMod += mods.quicknessMod || 0;
                intelligenceMod += mods.intelligenceMod || 0;
                charismaMod += mods.charismaMod || 0;
                willpowerMod += mods.willpowerMod || 0;
                bodyMod += mods.bodyMod || 0;
            }
        });

        // Apply mod enhancements to each attribute
        data.attributes.strength.mod = data.attributes.strength.base + strengthMod;
        data.attributes.quickness.mod = data.attributes.quickness.base + quicknessMod;
        data.attributes.intelligence.mod = data.attributes.intelligence.base + intelligenceMod;
        data.attributes.charisma.mod = data.attributes.charisma.base + charismaMod;
        data.attributes.willpower.mod = data.attributes.willpower.base + willpowerMod;
        data.attributes.body.mod = data.attributes.body.base + bodyMod;
    }

    /**
     * Compute derived attributes based on modified base attributes.
     * @param {Object} data - The actor's system data.
     */
    _computeDerivedAttributes(data) {
        const quickness = data.attributes.quickness.mod || data.attributes.quickness.base;
        const intelligence = data.attributes.intelligence.mod || data.attributes.intelligence.base;

        // Example: Calculate Reaction
        data.attributes.reaction = Math.floor((quickness + intelligence) / 2);

        // Example: Calculate Essence
        const essenceLoss = this.items.reduce((sum, item) => {
            return item.type === "cyberware" || item.type === "bioware" ? sum + (item.system.essenceCost || 0) : sum;
        }, 0);
        data.attributes.essence = Math.max(0, 6 - essenceLoss);
    }

    /**
     * Compute dice pools like Combat Pool or Spell Pool.
     * @param {Object} data - The actor's system data.
     */
    _computeDicePools(data) {
        const quickness = data.attributes.quickness.mod || data.attributes.quickness.base;
        const intelligence = data.attributes.intelligence.mod || data.attributes.intelligence.base;
        const willpower = data.attributes.willpower.mod || data.attributes.willpower.base;

        // Combat Pool calculation example
        data.combatPool = Math.floor((quickness + intelligence + willpower) / 2);

        // Spell Pool calculation example (if relevant)
        data.spellPool = Math.floor((data.attributes.intelligence.mod + data.attributes.willpower.mod) / 2);
    }

    /**
     * Compute movement speed based on Quickness and any relevant modifiers.
     * @param {Object} data - The actor's system data.
     */
    _computeMovement(data) {
        const quickness = data.attributes.quickness.mod || data.attributes.quickness.base;

        // Define base movement rates; modify as needed for your system's rules
        data.movement = {
            walk: quickness * 2,
            run: quickness * 4
        };
    }
}
