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
    
}