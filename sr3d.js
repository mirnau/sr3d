console.log("sr3d | sr3d.js loaded");

import { sr3d } from "./module/config.js";
import SR3DItemSheet from "./module/sheets/SR3DItemSheet.js";
import SR3DActorSheet from "./module/sheets/SR3DActorSheet.js";

async function AsyncRegisterComponentTemplates() {
    const basePath = "systems/sr3d/templates/components/";
    const paths = [
        "attributes.hbs",
        "dice-pools.hbs",
        "movement.hbs",
        "weapon.hbs",
        "inventory.hbs"
    ].map(filename => basePath + filename);

    return loadTemplates(paths);
};

Hooks.once("init", function() {
    console.log("sr3d | Initializing Shadowrun Third Edition Homebrew");
    
    // Language Config
    CONFIG.sr3d = sr3d;
   
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("sr3d", SR3DItemSheet, { makeDefault: true });
    
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("sr3d", SR3DActorSheet, { makeDefault: true });

    AsyncRegisterComponentTemplates();


    // NOTE: for repeating html elements n times
    Handlebars.registerHelper("repeat", function(n, content) {
        let result ="";
        for (let i = 0; i < n; ++i)
        {
            result += content.fn(i);
        }

        return result;
    })
});
