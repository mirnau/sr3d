console.log("sr3d | sr3d.js loaded");

//import { sr3d } from "./module/config.js";
import {defaultImages} from "./module/helpers/ItemImagePaths.js"
import SR3DItemSheet from "./module/sheets/SR3DItemSheet.js";
import SR3DActorSheet from "./module/sheets/SR3DActorSheet.js";

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

// Utility function to initialize Masonry
function initializeMasonry(gridElement) {
    if (!gridElement) return;

    if (gridElement.masonryInstance) {
        gridElement.masonryInstance.destroy();
    }

    const masonryInstance = new Masonry(gridElement, {
        itemSelector: '.sheet-component',
        originLeft: true,
        gutter: 10,
    });

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => masonryInstance.layout());
    resizeObserver.observe(gridElement);

    masonryInstance.layout();
}

function registerHooks() {

    Hooks.on("preCreateItem", async (item, options, userId) => {
    
        // Handle Metahuman Type
        if (item.type === "metahuman") {
            if (!item.img || item.img === defaultImages.default) {
                item.updateSource({ img: defaultImages.metahuman });
            }
            return; // No additional logic for metahuman
        }
    
        // Handle Weapon Type
        if (item.type === "weapon") {
            if (!item.img || item.img === defaultImages.default) {
                item.updateSource({ img: defaultImages.weapon });
            }
            return; // No additional logic for weapon
        }
 
        // Handle Weapon Type
        if (item.type === "skill") {
            if (!item.img || item.img === defaultImages.default) {
                item.updateSource({ img: defaultImages.skill.default });
            }
            return; // No additional logic for weapon
        }
    
    });
   
    Hooks.on("renderSR3DActorSheet", (app, html, data) => {
        console.log("MASONRY | Initializing after sheet render");

        const gridElement = html[0]?.querySelector('.sheet-masonry-grid');
        if (gridElement) initializeMasonry(gridElement);
    });

    Hooks.once("init", function () {
        console.log("sr3d | Initializing Shadowrun Third Edition Homebrew");

        Items.unregisterSheet("core", ItemSheet);
        Items.registerSheet("sr3d", SR3DItemSheet, { makeDefault: true });

        Actors.unregisterSheet("core", ActorSheet);
        Actors.registerSheet("sr3d", SR3DActorSheet, { makeDefault: true });

        AsyncRegisterComponentTemplates();

        Handlebars.registerHelper("repeat", function (n, content) {
            return Array(n).fill(null).map((_, i) => content.fn(i)).join('');
        });

        Handlebars.registerHelper("ifEquals", (arg1, arg2, options) =>
            arg1 === arg2 ? options.fn(this) : options.inverse(this)
        );
    });
}

registerHooks();