export const baseAttributes = ["body", "quickness", "strength", "charisma", "intelligence", "willpower"];

export const flags = {
    namespace: "sr3d",
    flagsInitiated: "flagsInitiated",
    attributesDone: "attributesDone",
    goblinizationApplied: "goblinizationApplied",
    isDossierPanelOpened: "isDossierPanelOpened",
    isShoppingStateActive: "isShoppingStateActive",
    core: "core",
    sr3d: "sr3d"
};

export const hooks = {
    init: "init",
    preCreateItem: "preCreateItem",
    renderSR3DActorSheet: "renderSR3DActorSheet",
    renderSR3DItemSheet: "renderSR3DItemSheet",
    createActor: "createActor",
    updateActor: "updateActor",
    ready: "ready"
};
