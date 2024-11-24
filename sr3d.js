console.log("sr3d | sr3d.js loaded");

import SR3DItemSheet from "./module/sheets/SR3DItemSheet.js";
import SR3DActorSheet from "./module/sheets/SR3DActorSheet.js";
import SR3DActor from "./module/actors/SR3DActor.js";
import { onItemCreateIconChange } from "./module/hooks/preCreateItem/onItemCreateIconChange.js";
import { initializeMasonrlyLayout } from "./module/hooks/renderSR3DActorSheet/initializeMasonrlyLayout.js";

// Utility function to register templates
async function AsyncRegisterComponentTemplates() {
    const basePath = "systems/sr3d/templates/components/";
    const paths = [
        "attributes.hbs",
        "skills.hbs",
        "dice-pools.hbs",
        "movement.hbs",
        "weapon.hbs",
        "active-skill.hbs",
        "knowledge-skill.hbs",
        "language-skill.hbs"
    ].map(filename => basePath + filename);

    return loadTemplates(paths);
}

function registerHooks() {

    const hooks = {
        init: "init",
        preCreateItem: "preCreateItem",
        renderSR3DActorSheet: "renderSR3DActorSheet",
        renderSR3DItemSheet: "renderSR3DItemSheet",
        createActor: "createActor"

    }

    const register = {
        core: "core",
        sr3d: "sr3d"
    }

    Hooks.on(hooks.preCreateItem, onItemCreateIconChange);
    Hooks.on(hooks.renderSR3DActorSheet, initializeMasonrlyLayout);

    Hooks.once(hooks.init, function () {
        console.log("sr3d | Initializing Shadowrun Third Edition Homebrew");

        Items.unregisterSheet(register.core, ItemSheet);
        Items.registerSheet(register.sr3d, SR3DItemSheet, { makeDefault: true });

        Actors.unregisterSheet(register.core, ActorSheet);
        Actors.registerSheet(register.sr3d, SR3DActorSheet, { makeDefault: true });

        CONFIG.Actor.documentClass = SR3DActor;

        AsyncRegisterComponentTemplates();

        Handlebars.registerHelper("repeat", function (n, content) {
            return Array(n).fill(null).map((_, i) => content.fn(i)).join('');
        });

        Handlebars.registerHelper("ifEquals", (arg1, arg2, options) =>
            arg1 === arg2 ? options.fn(this) : options.inverse(this)
        );

        Handlebars.registerHelper("currency", function(value) {
            return `¥${Number(value).toLocaleString()}`;
        });
    });
}

registerHooks();