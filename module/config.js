export const sr3d = {};

sr3d.sheet ={
    addSkill: "sr3d.sheet.addSkill",
    newItem: "sr3d.sheet.newItem",
    dossier: "sr3d.sheet.dossier",
    deleteSkill: "sr3d.sheet.deleteSkill",
    purchaseSkills: "sr3d.sheet.purchaseSkills",
    deleteSpecialisation: "sr3d.sheet.deleteSpecialisation",
    undoSpecialization: "sr3d.sheet.undoSpecialization",
    confirmSkill: "sr3d.sheet.confirmSkill",
    undo: "sr3d.sheet.undo",
    notes: "sr3d.sheet.notes",
    details: "sr3d.sheet.details",
    viewbackground: "sr3d.sheet.viewbackground"
}

sr3d.itemTypes = {
    weapon: "sr3d.createItem.weapon",
    vehicle: "sr3d.createItem.vehicle",
    vehicleMods: "sr3d.createItem.vehicleMods",
    rocket: "sr3d.createItem.rocket",
    ammunition: "sr3d.createItem.ammunition",
    apparel: "sr3d.createItem.apparel",
    creditStick: "sr3d.createItem.creditStick",
    enhancer: "sr3d.createItem.enhancer",
    cyberwear: "sr3d.createItem.cyberwear",
    misc: "sr3d.createItem.misc",
    metahuman: "sr3d.createItem.metahuman",
    skill: "sr3d.createItem.skill",
    magic: "sr3d.createItem.magic",
    karma: "sr3d.createItem.karma"
}

sr3d.transaction = { 
    transaction: "sr3d.item.transaction.transaction",
    transactions: "sr3d.item.transaction.transactions",
    amount: "sr3d.item.transaction.amount",
    recurrent: "sr3d.item.transaction.recurrent",
    type: "sr3d.item.transaction.type",
    description: "sr3d.item.transaction.description",
    assets: "sr3d.item.transaction.assets",
    asset: "sr3d.item.transaction.asset",
    expenses: "sr3d.item.transaction.expenses",
    expense: "sr3d.item.transaction.expense",
    debts: "sr3d.item.transaction.debts",
    debt: "sr3d.item.transaction.debt",
    payment: "sr3d.item.transaction.payment",
    type: "sr3d.item.transaction.type",
    interest: "sr3d.item.transaction.interest",
    creditor: "sr3d.item.transaction.creditor",
    total: "sr3d.item.transaction.total",
    creditstick: "sr3d.item.transaction.creditstick"
}

sr3d.actorTypes = {
    playerCharacter: "sr3d.actorTypes.playerCharacter",
}

sr3d.health = {
    health: "sr3d.actor.health.health",
    light: "sr3d.actor.health.light",
    moderate: "sr3d.actor.health.moderate",
    severe: "sr3d.actor.health.severe",
    deadly: "sr3d.actor.health.deadly",
    penalty: "sr3d.actor.health.penalty",
    overflow: "sr3d.actor.health.overflow"
}

sr3d.ammunition = {
    ammunition: "sr3d.item.ammunition.ammunition",
    rounds: "sr3d.item.ammunition.rounds",
    types: {
        apds: "sr3d.item.ammunition.types.apds",
        belt: "sr3d.item.ammunition.types.belt",
        assaultCanon: "sr3d.item.ammunition.types.assaultCanon",
        explosive: "sr3d.item.ammunition.types.explosive",
        exexplosive: "sr3d.item.ammunition.types.exexplosive",
        flechette: "sr3d.item.ammunition.types.flechette",
        regular: "sr3d.item.ammunition.types.regular",
        tracer: "sr3d.item.ammunition.types.tracer",
        tracerdart: "sr3d.item.ammunition.types.tracerdart",
        gel: "sr3d.item.ammunition.types.gel",
    }
}

sr3d.possessions = {
    possessions: "sr3d.actor.possessions.possessions", //all items
    inventory: "sr3d.actor.possessions.inventory", //clothes, bioware, cyberwear
    loadout: "sr3d.actor.possessions.loadout", // currently equipped
    arsenal: "sr3d.actor.possessions.arsenal", //owned weapons
    arcane: "sr3d.actor.possessions.arcane", //owned magical items
    garage: "sr3d.actor.possessions.garage", // owned vehicles and drones
}

sr3d.characterCreation = {
    instruction: "sr3d.characterCreation.instruction",
    selectAnOption: "sr3d.characterCreation.selectAnOption",
    spendYourAttributPointsToProceed: "sr3d.characterCreation.spendYourAttributPointsToProceed",
    spentAllAttributePoints: "sr3d.characterCreation.spentAllAttributePoints"
}

sr3d.freeActions = {
    none: "",
    activateCyberware: "sr3d.freeActions.activateCyberware"
};

sr3d.simpleActions = {
    none: "",
    activateFocus: "sr3d.simpleActions.activateFocus"
};

sr3d.complexActions = {
    none: "",
    astralProjection: "sr3d.complexActions.astralProjection"
};

sr3d.races = {
    troll: "sr3d.actor.races.troll",
    elf: "sr3d.actor.races.elf",
    dwarf: "sr3d.actor.races.dwarf",
    orc: "sr3d.actor.races.orc",
    human: "sr3d.actor.races.human"
};

sr3d.metahuman = {
    name: "sr3d.item.metahuman.name",
    lifespan: "sr3d.item.metahuman.lifespan",
    physical: "sr3d.item.metahuman.physical",
    average: "sr3d.item.metahuman.average",
    max: "sr3d.item.metahuman.max",
    min: "sr3d.item.metahuman.min",
    age: "sr3d.item.metahuman.age",
    height: "sr3d.item.metahuman.height",
    weight: "sr3d.item.metahuman.weight",
    modifiers: "sr3d.item.metahuman.modifiers",
    attributeLimits: "sr3d.item.metahuman.attributeLimits",
    vision: "sr3d.item.metahuman.vision",
    visionType: "sr3d.item.metahuman.visionType",
    normal: "sr3d.item.metahuman.normal",
    lowlight: "sr3d.item.metahuman.lowlight",
    thermographic: "sr3d.item.metahuman.thermographic",
    description: "sr3d.item.metahuman.description",
    newMetaHuman: "sr3d.item.metahuman.newMetaHuman",
    description: "sr3d.item.metahuman.description"
}

sr3d.weapon = {
    weapon: "sr3d.item.weapon.weapon",
    weapons: "sr3d.item.weapon.weapons",
    conceal: "sr3d.item.weapon.conceal",
    clip: "sr3d.item.weapon.clip",
    mode: "sr3d.item.weapon.mode",
    damage: "sr3d.item.weapon.damage",
    range: "sr3d.item.weapon.range",
    weight: "sr3d.item.weapon.weight",
    legal: "sr3d.item.weapon.legal",
    recoilComp: "sr3d.item.weapon.recoilComp",
    newWeapon: "sr3d.item.weapon.newWeapon",

};

sr3d.firingMode = {
    singleshot: "sr3d.firingMode.singleshot",     
    semiauto: "sr3d.firingMode.semiautomatic",
    burstfire: "sr3d.firingMode.burstfire",        
    fullauto: "sr3d.firingMode.fullauto"           
};

sr3d.ammo = {
    clip: "sr3d.ammo.clip",               
    breakaction: "sr3d.ammo.breakaction", 
    magazine: "sr3d.ammo.magazine",       
    cylinder: "sr3d.ammo.cylinder",       
    belt: "sr3d.ammo.belt"                
};

sr3d.weaponDamage = {
    stun: "sr3d.weaponDamage.stun", 
    light: "sr3d.weaponDamage.light",   
    moderate: "sr3d.weaponDamage.moderate",
    serious: "sr3d.weaponDamage.serious", 
    deadly: "sr3d.weaponDamage.deadly",  
};

sr3d.legalCode = {
    permissable: "sr3d.legalCode.permissable", 
    restricted: "sr3d.legalCode.restricted",  
    forbidden: "sr3d.legalCode.forbidden",  
    exceptionbiased: "sr3d.legalCode.exceptionbiased", 
    generallegality: "sr3d.legalCode.generallegality", 
    permittedwithfineorrestriction: "sr3d.legalCode.permittedwithfineorrestriction"
};

sr3d.vehicle = {
    handling: "sr3d.item.vehicle.handling",
    speed: "sr3d.item.vehicle.speed",
    acceleration: "sr3d.item.vehicle.acceleration",
    body: "sr3d.item.vehicle.body",
    armor: "sr3d.item.vehicle.armor",
    signature: "sr3d.item.vehicle.signature",
    autoNavigation: "sr3d.item.vehicle.autoNavigation",
    pilot: "sr3d.item.vehicle.pilot",
    sensor: "sr3d.item.vehicle.sensor",
    cargo: "sr3d.item.vehicle.cargo",
    load: "sr3d.item.vehicle.load",
    seating: "sr3d.item.vehicle.seating"
};

sr3d.race = {
    race: "sr3d.actor.race.race",
    name: "sr3d.actor.race.name",
    maxAge: "sr3d.actor.race.maxAge",
    modifiers: "sr3d.actor.race.modifiers",
    strength: "sr3d.actor.race.strength",
    quickness: "sr3d.actor.race.quickness",
    body: "sr3d.actor.race.body",
    charisma: "sr3d.actor.race.charisma",
    intelligence: "sr3d.actor.race.intelligence",
    willpower: "sr3d.actor.race.willpower",
    selectVision: "sr3d.actor.race.selectVision",
    description: "sr3d.actor.race.description"
};

sr3d.character = {
    
    metahumanType: "sr3d.actor.character.metahumanType",
    name: "sr3d.actor.character.name",
    character: "sr3d.actor.character.character",
    alias: "sr3d.actor.character.alias",
    pronouns: "sr3d.actor.character.pronouns",
    age: "sr3d.actor.character.age",
    height: "sr3d.actor.character.height",
    weight: "sr3d.actor.character.weight",
    looks: "sr3d.actor.character.looks",
    quote: "sr3d.actor.character.quote",
    ratsrace: "sr3d.actor.character.ratsrace",
    asset: "sr3d.actor.character.asset",
    post: "sr3d.actor.character.post",
    expenses: "sr3d.actor.character.expenses",
    debts: "sr3d.actor.character.debts",
    creditor: "sr3d.actor.character.creditor",
    interestPerMonth: "sr3d.actor.character.interestPerMonth",
    illiquidAssets: "sr3d.actor.character.illiquidAssets"
};

sr3d.attributes = {
    attributes: "sr3d.actor.attributes.attributes",
    strength: "sr3d.actor.attributes.strength",
    quickness: "sr3d.actor.attributes.quickness",
    body: "sr3d.actor.attributes.body",
    charisma: "sr3d.actor.attributes.charisma",
    intelligence: "sr3d.actor.attributes.intelligence",
    willpower: "sr3d.actor.attributes.willpower",
    magic: "sr3d.actor.attributes.magic",
    initiative: "sr3d.actor.attributes.initiative",
    essence: "sr3d.actor.attributes.essence",
    reaction: "sr3d.actor.attributes.reaction"
};

sr3d.dicepools = {
    dicepools: "sr3d.actor.dicepools.dicepools",
    combat: "sr3d.actor.dicepools.combat",
    astral: "sr3d.actor.dicepools.astral",
    hacking: "sr3d.actor.dicepools.hacking",
    control: "sr3d.actor.dicepools.control",
    spell: "sr3d.actor.dicepools.spell"
}

sr3d.skills = {
    newSkill: "sr3D.item.skill.newSkill",
    attributePoints: "sr3d.item.skill.attributePoints",
    activePoints: "sr3d.item.skill.activePoints",
    knowledgePoints: "sr3d.item.skill.knowledgePoints",
    languagePoints: "sr3d.item.skill.languagePoints", 
    skills: "sr3d.item.skill.skills",
    placeholder: "sr3d.item.skill.placeholder", 
    name: "sr3d.item.skill.name",
    activeSkill: "sr3d.item.skill.activeSkill",
    knowledgeSkill: "sr3d.item.skill.knowledgeSkill",
    languageSkill: "sr3d.item.skill.languageSkill",
    activeSkills: "sr3d.item.skill.activeSkills",
    knowledgeSkills: "sr3d.item.skill.knowledgeSkills",
    languageSkills: "sr3d.item.skill.languageSkills",
    specialization: "sr3d.item.skill.specialization",
    specializations: "sr3d.item.skill.specializations",
    linkedAttribute: "sr3d.item.skill.linkedAttribute",
    language: "sr3d.item.skill.language",
    read: "sr3d.item.skill.read",
    write: "sr3d.item.skill.write",
    speak: "sr3d.item.skill.speak"
};


sr3d.magic = {
    type: "sr3d.item.magicTradtion.type",
    focus: "sr3d.item.magicTradtion.focus",
    drainResistanceAttribute: "sr3d.item.magicTradtion.drainResistanceAttribute",
    totem: "sr3d.item.magicTradtion.totem",
    newMagic: "sr3d.item.magic.newMagic"
}


sr3d.movement = {
    movement: "sr3d.actor.movement.movement",
    walking: "sr3d.actor.movement.walking",
    running: "sr3d.actor.movement.running"
};

sr3d.karma = {
    karma: "sr3d.actor.karma.karma",
    karmaPool: "sr3d.actor.karma.karmaPool",
    goodKarma: "sr3d.actor.karma.goodKarma"
};

sr3d.health = {
    health: "sr3d.actor.health.health",
    stun: "sr3d.actor.health.stun",
    physical: "sr3d.actor.health.physical",
    overflow: "sr3d.actor.health.owerflow"
};

sr3d.playerCharacter = "sr3d.actor.playerCharacter";

sr3d.creditStick = {
    transactionLimit: "sr3d.item.creditStick.transactionLimit",
    rating: "sr3d.item.creditStick.rating"
};

sr3d.enhancer = {
    statModifier: "sr3d.item.enhancer.statModifier",
    modifier: "sr3d.item.enhancer.modifier"
};

sr3d.cyberwear = {
    implants: "sr3d.item.cyberwear.implants",
    essence: "sr3d.item.cyberwear.essence"
};

sr3d.common = {
    availability: "sr3d.item.common.availability",
    cost: "sr3d.item.common.cost",
    days: "sr3d.item.common.days",
    hours: "sr3d.item.common.hours",
    streetIndex: "sr3d.item.common.streetIndex",
    description: "sr3d.item.common.description",
    conceal: "sr3d.item.common.conceal",
    legality: "sr3d.item.common.legality",
    weight: "sr3d.item.common.weight",
    restrictionLevel: "sr3d.item.common.restrictionLevel",
    category: "sr3d.item.common.category",
    rounds: "sr3d.item.common.rounds",
    type: "sr3d.item.common.type"
};

sr3d.legality = {
    legal: "sr3d.legality.legal",
    permissable: "sr3d.legality.permissable",
    restricted: "sr3d.legality.restricted",
    forbidden: "sr3d.legality.forbidden",
}

sr3d.category = Object.fromEntries(
    Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter => [letter.toLowerCase(), letter])
)