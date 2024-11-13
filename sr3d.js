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
    
    // NOTE: Language Config
    CONFIG.sr3d = sr3d;
   
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("sr3d", SR3DItemSheet, { makeDefault: true });
    
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("sr3d", SR3DActorSheet, { makeDefault: true });

    AsyncRegisterComponentTemplates();

    // NOTE: for repeating HTML-elements n times
    Handlebars.registerHelper("repeat", function(n, content) {
        let result ="";
        for (let i = 0; i < n; ++i)
        {
            result += content.fn(i);
        }

        return result;
    })
});

Hooks.on("renderSR3DActorSheet", (app, html, data) => {
    console.log("MASONRY | Initializing after SR3DActorSheet render");

    const gridElement = html[0].querySelector('.sheet-masonry-grid');
    
    if (!gridElement) {
        console.error(`${app.constructor.name} | .sheet-masonry-grid was not found in the rendered HTML.`);
        return;
    }

    // Get the column width from the CSS variable and parse it as an integer
    const columnWidth = parseInt(getComputedStyle(gridElement).getPropertyValue('--masonry-column-width').trim(), 10);

    // Initialize Masonry with the retrieved column width
    new Masonry(gridElement, {
        itemSelector: '.sheet-component',
        columnWidth: columnWidth,
        gutter: 10
    });

    console.log("MASONRY | Masonry grid initialized successfully.");
});

