export const baseAttributes = ["body", "quickness", "strength", "charisma", "intelligence", "willpower"];
export const derivedAttributes = ["reaction", "initiative", "magic", "essence"];

export const baseAttributeDropdown = 
        ["Uncategorized", 
        "Body", 
        "Quickness", 
        "Strength", 
        "Intelligence", 
        "Willpower", 
        "Charisma", 
        "Reaction"]

export const flags = {
    namespace: "sr3d",
    flagsInitiated: "flagsInitiated",
    isInitialized: "isInitialized",
    attributesDone: "attributesDone",
    goblinizationApplied: "goblinizationApplied",
    isDossierPanelOpened: "isDossierPanelOpened",
    isShoppingStateActive: "isShoppingStateActive",
    characterCreationCompleted: "characterCreationCompleted",
    isCharacterCreationState: "isCharacterCreationState",
    core: "core",
    sr3d: "sr3d"
};

export const hooks = {
    init: "init",
    preCreateItem: "preCreateItem",
    createItem: "createItem",
    renderSR3DActorSheet: "renderSR3DActorSheet",
    renderSR3DItemSheet: "renderSR3DItemSheet",
    createActor: "createActor",
    updateActor: "updateActor",
    ready: "ready"
};
