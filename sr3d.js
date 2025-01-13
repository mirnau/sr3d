import CharacterSheet from "./module/sheets/CharacterSheet.js";
import SR3DActor from "./module/actors/SR3DActor.js";
import SR3DLog from "./module/SR3DLog.js";
import displayShoppingStateButton from "./module/injections/displayShoppingStateButton.js";
import { SR3DItem } from "./module/Items/SR3DItem.js";
import { onItemCreateIconChange } from "./module/hooks/preCreateItem/onItemCreateIconChange.js";
import { initializeMasonryLayout } from "./module/hooks/renderSR3DActorSheet/initializeMasonrlyLayout.js";
import { injectCreationSidebar } from "./module/injections/displayCreationPointSidebar.js";
import { updateActorCreationPoints } from "./module/hooks/updateActor/updateActorCreationPoints.js";
import { setActorFlags } from "./module/hooks/createActor/setFlags.js";
import { enforceSingleMetahumanLimit } from "./module/hooks/preCreateItem/enforceSingleMetahumanLimit.js";
import enforceSingleMagic from "./module/hooks/preCreateItem/enforceSingleMagic.js";
import { flags, hooks } from "./module/helpers/CommonConsts.js";
import { scopeCssToProject } from "./module/hooks/ready/scopeCssToProject.js";
import { initActiveSkillMasonry } from "./module/hooks/renderSR3DActorSheet/initActiveSkillMasonry.js";
import { initKnowledgeSkillMasonry } from "./module/hooks/renderSR3DActorSheet/initKnowledgeSkillMasonry.js";
import { initLanguageSkillMasonry } from "./module/hooks/renderSR3DActorSheet/initLanguageSkillMasonry.js";
import { displayNeonName } from "./module/injections/displayNeonName.js";
import { displayNewsFeed } from "./module/injections/displayNewsFeed.js";
import { initAttributesMasonry } from "./module/hooks/renderSR3DActorSheet/initAttributesMasonry.js";
import { initDicepoolMasonry } from "./module/hooks/renderSR3DActorSheet/initDicepoolMasonry.js";
import { initMovementMasonry } from "./module/hooks/renderSR3DActorSheet/initMovementMasonry.js";
import { initKarmaMasonry } from "./module/hooks/renderSR3DActorSheet/initKarmaMasonry.js";
import { monitorCreationPoints } from "./module/hooks/updateActor/monitorCreationPoints.js";
import { sr3d } from "./module/config.js";
import { transferKarmatoActor } from "./module/hooks/createItem/transferKarmatoActor.js";
import { initMetahumanMasonry } from "./module/hooks/renderSR3DItemSheet/initMetahumanMasonry.js";
import { attachLightEffect } from "./attachLightEffect.js";
import { itemCategory } from "./module/helpers/CommonConsts.js";
import { injectFooter } from "./module/injections/injectFooter.js";
import { WeaponItem } from "./module/Items/WeaponItem.js";
import AmmunitionSheet from "./module/sheets/AmmunitionSheet.js";
import WeaponSheet from "./module/sheets/WeaponSheet.js";
import MetahumanSheet from "./module/sheets/MetahumanSheet.js";
import MagicSheet from "./module/sheets/MagicSheet.js";
import SkillSheet from "./module/sheets/SkillSheet.js";
import KarmaSheet from "./module/sheets/KarmaSheet.js";
import WeaponModel from "./module/dataModels/items/WeaponModel.js";
import AmmunitionModel from "./module/dataModels/items/SkillModel.js";
import SkillModel from "./module/dataModels/items/SkillModel.js";
import KarmaModel from "./module/dataModels/items/KarmaModel.js";
import MetahumanModel from "./module/dataModels/items/MetahumanModel.js";
import MagicModel from "./module/dataModels/items/MagicModel.js";
import CharacterModel from "./module/dataModels/actor/CharacterModel.js";
import NewsBroadcastModel from "./module/dataModels/actor/NewsBroadcastModel.js";
import NewsBroadcastSheet from "./module/sheets/NewsBroadcastSheet.js";
import TransactionSheet from "./module/sheets/TransactionSheet.js";
import TransactionModel from "./module/dataModels/items/TransactionModel.js";
import { displayCreationDialog, doNotRenderSheet } from "./module/hooks/preCreateActor/displayCreationDialog.js";

//NOTE: Recursively gather .hbs files from the folder structure
async function registerTemplatesFromPathsAsync() {
    const rootFolder = "systems/sr3d/templates/";
    const paths = [];

    async function gatherFiles(folder) {
        const { files, dirs } = await FilePicker.browse("data", folder);
        paths.push(...files.filter(file => file.endsWith(".hbs")));
        await Promise.all(dirs.map(gatherFiles));
    }

    await gatherFiles(rootFolder);
    return loadTemplates(paths);
}

function registerHooks() {


    Hooks.on(hooks.renderCharacterSheet, (app, html, data) => {
        initializeMasonryLayout(app, html, data);
        initActiveSkillMasonry(app, html, data);
        initKnowledgeSkillMasonry(app, html, data);
        initLanguageSkillMasonry(app, html, data);
        initAttributesMasonry(app, html, data);
        initDicepoolMasonry(app, html, data);
        initMovementMasonry(app, html, data);
        initKarmaMasonry(app, html, data);

        //NOTE: intital computation
        app.actor.silentUpdateDerivedValues("intelligence", html, 0);
        app.actor.silentUpdateDerivedValues("reaction", html, 0);
        app.updateHealthOnStart(html);
    });

    Hooks.on(hooks.renderSR3DItemSheet, (app, html, data) => {
        initMetahumanMasonry(app, html, data);
    });


    Hooks.on(hooks.preCreateItem, onItemCreateIconChange);
    Hooks.on(hooks.preCreateItem, enforceSingleMetahumanLimit);
    Hooks.on(hooks.preCreateItem, enforceSingleMagic);
    Hooks.on(hooks.createItem, setItemFlags);
    Hooks.on(hooks.createItem, transferKarmatoActor);
    Hooks.on(hooks.updateActor, updateActorCreationPoints);
    Hooks.on(hooks.updateActor, monitorCreationPoints);
    Hooks.on(hooks.renderCharacterSheet, injectCreationSidebar);
    Hooks.on(hooks.renderCharacterSheet, displayShoppingStateButton);
    Hooks.on(hooks.renderCharacterSheet, displayNeonName);
    Hooks.on(hooks.renderCharacterSheet, displayNewsFeed);
    Hooks.on(hooks.renderCharacterSheet, injectFooter);
    Hooks.once(hooks.ready, scopeCssToProject); //Redundant?

    Hooks.on(hooks.createActor, setActorFlags);
    Hooks.on(hooks.createActor, displayCreationDialog);
    Hooks.on(hooks.preCreateActor, doNotRenderSheet);

    Hooks.once(hooks.ready, () => {
        const savedTheme = game.settings.get("sr3d", "theme") || "chummer-dark";
        setTheme(savedTheme); // Apply the saved theme on startup
    });


    // Attach Hooks for ActorSheet and ItemSheet
    Hooks.on(hooks.renderCharacterSheet, (app, html) => {
        const activeTheme = game.settings.get("sr3d", "theme");
        if (["chummer-dark", "chummer-light"].includes(activeTheme)) {
            attachLightEffect(html, activeTheme);
        }
    });

    Hooks.on(hooks.renderCharacterSheet, (app, html) => {
        const activeTheme = game.settings.get("sr3d", "theme");
        if (["chummer-dark", "chummer-light"].includes(activeTheme)) {
            attachLightEffect(html, activeTheme);
        }
    });

    ////////////////////////////////////////////////////////

    //Updating the healthboxes on start
    Hooks.on("renderCharacterSheet", (app, html, data) => {
        let actor = app.actor;

        const stunArray = [...actor.system.health.stun];
        const physicalArray = [...actor.system.health.physical];

        for (let i = 1; i <= 10; i++) {
            const checkbox = html.find(`#healthBox${i}`)[0];
            if (!checkbox) {
                console.warn(`Checkbox healthBox${i} not found`);
                continue;
            }

            const isChecked = stunArray[i - 1];
            checkbox.checked = isChecked;

            const siblingH4 = checkbox.closest(".damage-input")?.querySelector("h4");
            if (siblingH4) {
                siblingH4.classList.toggle("lit", isChecked);
                siblingH4.classList.toggle("unlit", !isChecked);
            }
        }

        for (let i = 11; i <= 20; i++) {
            const checkbox = html.find(`#healthBox${i}`)[0];
            if (!checkbox) {
                console.warn(`Checkbox healthBox${i} not found`);
                continue;
            }

            const isChecked = physicalArray[i - 11];
            checkbox.checked = isChecked;

            const siblingH4 = checkbox.closest(".damage-input")?.querySelector("h4");
            if (siblingH4) {
                siblingH4.classList.toggle("lit", isChecked);
                siblingH4.classList.toggle("unlit", !isChecked);
            }
        }
    });

    ////////////////////////////////////////////////////////


    function setItemFlags(item, options, userId) {
        SR3DLog.info("Initiating Item Flags", "setItemFlags.js");

        item.setFlag(flags.namespace, flags.isInitialized, false);
    }

    Hooks.once(hooks.init, function () {

        CONFIG.sr3d = sr3d;
        CONFIG.Actor.documentClass = SR3DActor;
        CONFIG.Item.documentClass = SR3DItem;

        // TODO: Investigate if this should be moved to system.json
        /*
        CONFIG.Item.typeLabels = {};
        for (const [type, locKey] of Object.entries(CONFIG.sr3d.itemTypes)) {
            CONFIG.Item.typeLabels[type] = game.i18n.localize(locKey);
        }
    
        // NOTE: Updating FVVT's Actor dropdown menus
        CONFIG.Actor.typeLabels = {};
        for (const [type, locKey] of Object.entries(CONFIG.sr3d.actorTypes)) {
            CONFIG.Actor.typeLabels[type] = game.i18n.localize(locKey);
        }
        */

        Items.unregisterSheet(flags.core, ItemSheet);
        Actors.unregisterSheet(flags.core, ActorSheet);

        // NOTE: Following pattern is necessary for databinding to work
        // https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html
        CONFIG.Actor.dataModels = {
            "character": CharacterModel,
            "newsbroadcast": NewsBroadcastModel
        };

        CONFIG.Item.dataModels = {
            "weapon": WeaponModel,
            "ammunition": AmmunitionModel,
            "skill": SkillModel,
            "karma": KarmaModel,
            "metahuman": MetahumanModel,
            "magic": MagicModel,
            "transaction": TransactionModel
        }

        Items.registerSheet(flags.namespace, WeaponSheet, { types: ["weapon"], makeDefault: true });
        Items.registerSheet(flags.namespace, AmmunitionSheet, { types: ["ammunition"], makeDefault: true });
        Items.registerSheet(flags.namespace, KarmaSheet, { types: ["karma"], makeDefault: true });
        Items.registerSheet(flags.namespace, MetahumanSheet, { types: ["metahuman"], makeDefault: true });
        Items.registerSheet(flags.namespace, SkillSheet, { types: ["skill"], makeDefault: true });
        Items.registerSheet(flags.namespace, TransactionSheet, { types: ["transaction"], makeDefault: true });

        Items.registerSheet(flags.namespace, MagicSheet, { types: ["magic"], makeDefault: true });

        Actors.registerSheet(flags.namespace, CharacterSheet, { types: ["character"], makeDefault: true });
        Actors.registerSheet(flags.namespace, NewsBroadcastSheet, { types: ["newsbroadcast"], makeDefault: true });

        registerTemplatesFromPathsAsync();

        Handlebars.registerHelper('sum', function (field, ...args) {
            args.pop(); // Remove the options argument

            let total = 0;

            args.forEach(array => {
                if (Array.isArray(array)) {
                    array.forEach(item => {
                        const value = parseFloat(foundry.utils.getProperty(item, field));
                        if (!isNaN(value)) {
                            total += value;
                        }
                    });
                }
            });

            return Number(total);
        });

        Handlebars.registerHelper('add', function (...args) {
            // Remove the last argument (options object from Handlebars)
            args.pop();

            // Parse all arguments as numbers and sum them
            const total = args.reduce((sum, value) => {
                const number = parseFloat(value);
                return !isNaN(number) ? sum + number : sum;
            }, 0);

            return total; // Return the numeric sum
        });


        Handlebars.registerHelper('multiply', (value, factor) => {
            return Number((value * factor).toFixed(2)); // Converts and limits to 1 decimal places
        });

        Handlebars.registerHelper("currency", function (value) {
            return `¥${Number(value).toLocaleString()}`;
        });


        Handlebars.registerHelper("repeat", function (n, content) {
            return Array(n).fill(null).map((_, i) => content.fn(i)).join('');
        });

        Handlebars.registerHelper("ifEquals", (arg1, arg2, options) =>
            arg1 === arg2 ? options.fn(this) : options.inverse(this)
        );


        Handlebars.registerHelper("isDossierOpen", function (actor) {
            return actor.getFlag(flags.namespace, flags.isDossierPanelOpened);
        });

        Handlebars.registerHelper("isShoppingStateActive", function (actor) {
            return actor.getFlag(flags.namespace, flags.isShoppingStateActive);
        });

        Handlebars.registerHelper('log', function (value) {
            SR3DLog.inspect(`Handlebars log ${value}:`, "handlebars helper");
            return ''; // Handlebars requires the helper to return something
        });

        Handlebars.registerHelper("validateTime", function (value) {
            const timeRegex = /^(\d+):([0-1]?[0-9]|2[0-3])$/; // Match `days:hours`
            return timeRegex.test(value) ? value : "00:00";
        });


        const themeChoices = {
            "chummer-dark": "Chummer Dark",
            "chummer-light": "Chummer Light"
        };

        registerThemeSelectionFunctionality(themeChoices);

    });
}

function registerThemeSelectionFunctionality(themeChoices) {
    game.settings.register("sr3d", "theme", {
        name: "Theme", // Setting name
        hint: "Choose your preferred theme for the SR3D system.", // Setting description
        scope: "client", // Client-side setting (individual for each user)
        config: true, // Exposed in the settings UI
        type: String, // Data type
        choices: themeChoices,
        default: "chummer-dark", // Default value
        onChange: theme => setTheme(theme)
    });
}

function setTheme(theme) {
    let themeLink = document.getElementById("theme-stylesheet");

    if (themeLink) themeLink.remove();

    themeLink = document.createElement("link");
    themeLink.id = "theme-stylesheet";
    themeLink.rel = "stylesheet";
    themeLink.href = `systems/sr3d/styles/sr3d-${theme}.css`; // Ensure correct path
    document.head.appendChild(themeLink);
}

registerHooks();

SR3DLog.success("Initiation Complete", "sr3d.js");