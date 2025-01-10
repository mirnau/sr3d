import MetahumanModel from "../dataModels/items/MetahumanModel.js";
export default class ItemDataService {

    static lifespan(ctx) {
        return [
            {
                label: game.i18n.localize(ctx.config.metahuman.min),
                value: ctx.system.lifespan.min,
            },
            {
                label: game.i18n.localize(ctx.config.metahuman.average),
                value: ctx.system.lifespan.average,
            },
            {
                label: game.i18n.localize(ctx.config.metahuman.max),
                value: ctx.system.lifespan.max,
            },
        ];
    }

    static height(ctx) {
        return [
            {
                label: game.i18n.localize(ctx.config.metahuman.min),
                value: ctx.system.physical.height.min,
            },
            {
                label: game.i18n.localize(ctx.config.metahuman.average),
                value: ctx.system.physical.height.average,
            },
            {
                label: game.i18n.localize(ctx.config.metahuman.max),
                value: ctx.system.physical.height.max,
            },
        ];
    }
    static weight(ctx) {
        return [
            {
                label: game.i18n.localize(ctx.config.metahuman.min),
                value: ctx.system.physical.weight.min,
            },
            {
                label: game.i18n.localize(ctx.config.metahuman.average),
                value: ctx.system.physical.weight.average,
            },
            {
                label: game.i18n.localize(ctx.config.metahuman.max),
                value: ctx.system.physical.weight.max,
            },
        ];
    }

    static attributeModifiers(ctx) {
        return [
            {
                label: game.i18n.localize(ctx.config.attributes.strength),
                value: ctx.system.modifiers.strength,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.quickness),
                value: ctx.system.modifiers.quickness,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.body),
                value: ctx.system.modifiers.body,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.charisma),
                value: ctx.system.modifiers.charisma,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.intelligence),
                value: ctx.system.modifiers.intelligence,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.willpower),
                value: ctx.system.modifiers.willpower,
            },
        ];
    }

    static attributeLimits(ctx) {
        return [
            {
                label: game.i18n.localize(ctx.config.attributes.strength),
                value: ctx.system.attributeLimits.strength,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.quickness),
                value: ctx.system.attributeLimits.quickness,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.body),
                value: ctx.system.attributeLimits.body,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.charisma),
                value: ctx.system.attributeLimits.charisma,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.intelligence),
                value: ctx.system.attributeLimits.intelligence,
            },
            {
                label: game.i18n.localize(ctx.config.attributes.willpower),
                value: ctx.system.attributeLimits.willpower,
            },
        ];

    }

    static compatibleWeapons(ctx) {
        const ids = ctx.system.compatibleWeaponIds || [];
        return ids.map(id => game.items.get(id)).filter(i => i);
    }

    static availableWeapons(ctx) {
        const ids = ctx.system.compatibleWeaponIds || [];
        return game.items.filter(item => item.type === "weapon" && !ids.includes(item.id));
    }

    // NOTE: returns the translation of the type of the damage
    static weaponDamage(ctx) {
        const damageKeys = Object.keys(ctx.config.weaponDamage);
        return damageKeys.map(key => ({
            key,
            label: game.i18n.localize(ctx.config.weaponDamage[key])
        }));
    }

    static getDefaultMagic() {
        return {
            name: "Full Shaman",
            type: "magic",
            system: {
                type: "Full",
                priority: "A",
                focus: "None",
                drainResistanceAttribute: "Charisma",
                totem: "Bear"
            }
        };
    }

    static getDefaultHumanItem() {
        return (
            {
                name: "Human",
                type: "metahuman",
                system: {
                    lifespan: { min: 10, average: 30, max: 100 },
                    physical: {
                        height: { min: 150, average: 170, max: 200 },
                        weight: { min: 50, average: 70, max: 120 }
                    },
                    modifiers: {
                        strength: 0,
                        quickness: 0,
                        body: 0,
                        charisma: 0,
                        intelligence: 0,
                        willpower: 0
                    },
                    attributeLimits: {
                        strength: 6,
                        quickness: 6,
                        body: 6,
                        charisma: 6,
                        intelligence: 6,
                        willpower: 6
                    },
                    karmaAdvancementFraction: { value: 0.1 },
                    vision: {
                        visionType: "Normal",
                        description: "Standard human vision",
                        rules: { darknessPenaltyNegation: "" }
                    },
                    priority: "E",
                    description: "Humans are the baseline metatype, versatile and adaptive."
                }
            }
        );
    }
}