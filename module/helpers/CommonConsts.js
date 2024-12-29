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
    renderCharacterSheet: "renderCharacterSheet",
    renderSR3DItemSheet: "renderSR3DItemSheet",
    renderDialog: "renderDialog",
    createActor: "createActor",
    updateActor: "updateActor",
    ready: "ready"
};

export const skillConfig = {
    activeSkill: {
        pointsKey: "system.creation.activePoints",
        skillKey: "system.activeSkill.value",
        currentPointsKey: "currentActivePoints"
    },
    knowledgeSkill: {
        pointsKey: "system.creation.knowledgePoints",
        skillKey: "system.knowledgeSkill.value",
        currentPointsKey: "currentKnowledgePoints"
    },
    languageSkill: {
        speak: {
            pointsKey: "system.creation.languagePoints",
            skillKey: "system.languageSkill.speak.value",
            currentPointsKey: "currentSpeakPoints"
        },
        read: {
            pointsKey: "system.creation.languagePoints",
            skillKey: "system.languageSkill.read.value",
            currentPointsKey: "currentReadPoints"
        },
        write: {
            pointsKey: "system.creation.languagePoints",
            skillKey: "system.languageSkill.write.value",
            currentPointsKey: "currentWritePoints"
        }
    }
};

export const skillPathMap = {
    activeSkill: "system.activeSkill.specializations",
    knowledgeSkill: "system.knowledgeSkill.specializations",
    languageSkill: {
        speak: "system.languageSkill.speak.specializations",
        read: "system.languageSkill.read.specializations",
        write: "system.languageSkill.write.specializations"
    }
};

export const itemCategory = {
    general: "general",
    abstract: "abstract",
    expendable: "expendable",
    arsenal: "arsenal",
    arcane: "arcane",
    garage: "garage",
    implants: "implants"
};