import SR3DItemSheet from "./module/sheets/SR3DItemSheet.js";
import SR3DActorSheet from "./module/sheets/SR3DActorSheet.js";
import SR3DActor from "./module/actors/SR3DActor.js";
import SR3DLog from "./module/SR3DLog.js";
import { onItemCreateIconChange } from "./module/hooks/preCreateItem/onItemCreateIconChange.js";
import { initializeMasonrlyLayout } from "./module/hooks/renderSR3DActorSheet/initializeMasonrlyLayout.js";
import { displayCreationPointSidebar } from "./module/injections/displayCreationPointSidebar.js";
import { updateActorCreationPoints } from "./module/hooks/updateActor/updateActorCreationPoints.js";
import displayShoppingStateButton from "./module/injections/displayShoppingStateButton.js";
import { setFlags } from "./module/hooks/createActor/setFlags.js";
import { enforceSingleMetahumanLimit } from "./module/hooks/preCreateItem/enforceSingleMetahumanLimit.js";
import { enforceSingleMagicTradition } from "./module/hooks/preCreateItem/enforceSingleMagicTradition.js";

// NOTE: Any .hbs file from these folders will be registered
async function registerTemplatesFromPathsAsync() {
    const folders = [
        "systems/sr3d/templates/components/",
        "systems/sr3d/templates/injections/",
        "systems/sr3d/templates/dialogs/"
    ];

    const paths = [];

    for (const folder of folders) {
        const fileList = await FilePicker.browse("data", folder);
        const hbsFiles = fileList.files.filter(file => file.endsWith(".hbs"));
        paths.push(...hbsFiles);
    }

    return loadTemplates(paths);
}

function registerHooks() {

    const hooks = {
        init: "init",
        preCreateItem: "preCreateItem",
        renderSR3DActorSheet: "renderSR3DActorSheet",
        renderSR3DItemSheet: "renderSR3DItemSheet",
        createActor: "createActor",
        updateActor: "updateActor"
    }

    const register = {
        core: "core",
        sr3d: "sr3d"
    }

    Hooks.on(hooks.preCreateItem, onItemCreateIconChange);
    Hooks.on(hooks.preCreateItem, enforceSingleMetahumanLimit);
    Hooks.on(hooks.preCreateItem, enforceSingleMagicTradition);
    Hooks.on(hooks.renderSR3DActorSheet, displayCreationPointSidebar);
    Hooks.on(hooks.renderSR3DActorSheet, displayShoppingStateButton);
    Hooks.on(hooks.createActor, setFlags);
    Hooks.on(hooks.updateActor, updateActorCreationPoints);
    Hooks.on(hooks.renderSR3DActorSheet, initializeMasonrlyLayout);

    Hooks.once(hooks.init, function () {
        
        console.log("sr3d | Initializing Shadowrun Third Edition Homebrew");

        Items.unregisterSheet(register.core, ItemSheet);
        Items.registerSheet(register.sr3d, SR3DItemSheet, { makeDefault: true });

        Actors.unregisterSheet(register.core, ActorSheet);
        Actors.registerSheet(register.sr3d, SR3DActorSheet, { makeDefault: true });

        CONFIG.Actor.documentClass = SR3DActor;

        registerTemplatesFromPathsAsync();

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

SR3DLog.success("Initiation Complete", "sr3d.js");