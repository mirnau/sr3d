console.log("sr3d | sr3d.js loaded");

//import { sr3d } from "./module/config.js";
import { defaultImages } from "./module/helpers/ItemImagePaths.js"
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

///////////////////////////////////// INJECTION HACK BEGIN /////////////////////////////////////

if (!app.actor.system.creation.complete) {
    // Check if all points are zero and set `incomplete` to false
    const { attributePoints, activePoints, knowledgePoints, languagePoints } = app.actor.system.creation;

    // Identify the actor sheet container
    const appElement = html[0]; // The root element of the actor sheet
    const header = appElement.querySelector("header.window-header");

    // Points and their localized labels
    const pointsData = [
        { points: attributePoints, label: game.i18n.localize("sr3d.item.skill.attributePoints") },
        { points: activePoints, label: game.i18n.localize("sr3d.item.skill.activePoints") },
        { points: knowledgePoints, label: game.i18n.localize("sr3d.item.skill.knowledgePoints") },
        { points: languagePoints, label: game.i18n.localize("sr3d.item.skill.languagePoints") }
    ];
    

    // Generate the HTML string dynamically
    const customHTML = pointsData.map(({ points, label }) => `
        <div class="attribute-position">
            <div class="attribute-point-container">
                <div class="attribute-fake-shadow"></div>
                <div class="attribute-points">
                    <div class="attribute-point-text">
                        ${label}
                    </div>
                    <div class="attribute-point-value">
                        ${points}
                    </div>
                </div>
            </div>
        </div>
    `).join(""); // Combine all generated blocks

    // Inject the HTML after the header
    if (header) {
        header.insertAdjacentHTML("afterend", customHTML);
    }
}

///////////////////////////////////// INJECTION HACK END /////////////////////////////////////


    });

    Hooks.on("renderSR3DItemSheet", (app, html, data) => {
        // Check if the item exists
        const item = app.object;
        const itemExists = game.items?.get(item.id) || item.parent?.items?.get(item.id);

        if (!itemExists) {
            console.log(`Item with ID ${item.id} no longer exists. Closing the sheet.`);

            // Use a small delay to ensure the render process is completed before attempting to close
            setTimeout(() => {
                app.close();
            }, 10);
        }
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