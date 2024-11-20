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
        "active-skill.hbs",
        "knowledge-skill.hbs",
        "language-skill.hbs"
    ].map(filename => basePath + filename);

    return loadTemplates(paths);
};

Hooks.once("init", function () {
    console.log("sr3d | Initializing Shadowrun Third Edition Homebrew");

    // NOTE: Language Config
    CONFIG.sr3d = sr3d;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("sr3d", SR3DItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("sr3d", SR3DActorSheet, { makeDefault: true });

    AsyncRegisterComponentTemplates();

    // NOTE: for repeating HTML-elements n times
    Handlebars.registerHelper("repeat", function (n, content) {
        let result = "";
        for (let i = 0; i < n; ++i) {
            result += content.fn(i);
        }

        return result;
    })

    Handlebars.registerHelper("ifEquals", (arg1, arg2, options) => arg1 === arg2 ? options.fn(this) : options.inverse(this));
});

let masonryInstance;
let resizeObserver;

Hooks.on("renderSR3DActorSheet", (app, html, data) => {
    console.log("MASONRY | Initializing after sheet render");

    const gridElement = html[0]?.querySelector('.sheet-masonry-grid');
    if (gridElement) {
        initializeMasonry(gridElement);
    }
});

Hooks.on("createItem", (item, options, userId) => {
    const actor = item.parent;

    if (actor?.sheet?.rendered && game.user.id === userId) {
        console.log("MASONRY | Reinitializing after item creation");

        const gridElement = actor.sheet.element[0]?.querySelector('.sheet-masonry-grid');
        if (gridElement) {
            initializeMasonry(gridElement);
        }
    }
});

function initializeMasonry(gridElement) {
    if (gridElement) {
        
        if (gridElement.masonryInstance) {
            gridElement.masonryInstance.destroy();
        }
       
        const columnWidth = parseInt(
            getComputedStyle(gridElement).getPropertyValue('--masonry-column-width').trim(),
            10
        );
        
        const masonryInstance = new Masonry(gridElement, {
            itemSelector: '.sheet-component',
            columnWidth: columnWidth,
            originLeft: true,
            gutter: 10,
        });
       
        gridElement.masonryInstance = masonryInstance;
        
        const resizeObserver = new ResizeObserver(() => {
            masonryInstance.layout();
        });

        resizeObserver.observe(gridElement);
       
        masonryInstance.layout();

        console.log("MASONRY | Initialized with column width:", columnWidth);
    }
}