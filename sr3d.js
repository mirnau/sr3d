console.log("sr3d | sr3d.js loaded");

import { sr3d } from "./module/config.js";
import SR3DItemSheet from "./module/sheets/SR3DItemSheet.js";
import SR3DActorSheet from "./module/sheets/SR3DActorSheet.js";

async function AsyncRegisterComponentTemplates() {
    const basePath = "systems/sr3d/templates/components/";
    const paths = [
        "attributes.hbs",
        "skills.hbs",
        "dice-pools.hbs",
        "movement.hbs",
        "weapon.hbs",
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

    Handlebars.registerHelper("ifEquals", (arg1, arg2, options) => arg1 === arg2 ? options.fn(this) : options.inverse(this));
});

Hooks.on("renderSR3DActorSheet", (app, html, data) => {
    console.log("MASONRY | Initializing after SR3DActorSheet render");

    const gridElement = html[0].querySelector('.sheet-masonry-grid');
    const formElement = html[0].querySelector('form');

    if (!gridElement || !formElement) {
        console.error(`${app.constructor.name} | .sheet-masonry-grid or form not found.`);
        return;
    }

    const masonryInstance = new Masonry(gridElement, {
        itemSelector: '.sheet-component',
        columnWidth: parseInt(getComputedStyle(gridElement).getPropertyValue('--masonry-column-width').trim(), 10),
        originLeft: true,
        gutter: 10,
    });

    // INFO: Adjust column width and re-layout after resizing
    const adjustColumnWidth = () => {
        const formWidth = formElement.clientWidth;
        let columnWidth;
        
        if (formWidth < 600) {
            columnWidth = "150px";
        } else if (formWidth < 900) {
            columnWidth = "200px";
        } else if (formWidth < 1200) {
            columnWidth = "250px";
        } else {
            columnWidth = "300px";
        }

        masonryInstance.layout();
    };

    const resizeObserver = new ResizeObserver(() => {
        adjustColumnWidth();
        masonryInstance.layout();  
    });

    resizeObserver.observe(formElement);
    
    adjustColumnWidth();
    masonryInstance.layout();
});


