console.log("sr3d | sr3d.js loaded");

import { sr3d } from "./module/config.js";
import SR3DItemSheet from "./module/sheets/SR3DItemSheet.js";
import SR3DActorSheet from "./module/sheets/SR3DActorSheet.js";


Hooks.once("init", function() {
    console.log("sr3d | Initializing Shadowrun Third Edition Homebrew");
    
    // Language Config
    CONFIG.sr3d = sr3d;
    
    // Items
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("sr3d", SR3DItemSheet, { makeDefault: true });
    
    // Actors
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("sr3d", SR3DActorSheet, { makeDefault: true });
});
