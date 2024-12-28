import { baseAttributes, itemCategory } from "../helpers/CommonConsts.js";
import SR3DLog from "../SR3DLog.js";

export class ActorDataService {
    static prepareSkills(contents) {
        return {
            active: this._categorizeAndSortSkills(
                contents.filter(item => item.type === "skill" && item.system.skillType === "activeSkill"),
                item => item.system.activeSkill.linkedAttribute
            ),
            knowledge: this._categorizeAndSortSkills(
                contents.filter(item => item.type === "skill" && item.system.skillType === "knowledgeSkill"),
                item => item.system.knowledgeSkill.linkedAttribute
            ),
            language: this._sortSkillsByName(
                contents.filter(item => item.type === "skill" && item.system.skillType === "languageSkill")
            ),
        };
    }


    static prepareLanguages(items) {
        return items
            .filter(item => item.type === "skill" && item.system.skillType === "languageSkill")
            .map(item => {
                const languageData = {
                    id: item.id,
                    name: item.name,
                    skills: [
                        {
                            type: game.i18n.localize("sr3d.item.skill.speak"),
                            value: item.system.languageSkill.speak?.value,
                            specializations: item.system.languageSkill.speak.specializations,
                        },
                        {
                            type: game.i18n.localize("sr3d.item.skill.write"),
                            value: item.system.languageSkill.read?.value,
                            specializations: item.system.languageSkill.read.specializations,
                        },
                        {
                            type: game.i18n.localize("sr3d.item.skill.read"),
                            value: item.system.languageSkill.write?.value,
                            specializations: item.system.languageSkill.write.specializations,
                        },
                    ],
                };
                return languageData;
            });
    }

    static _categorizeAndSortSkills(skills, keyFn) {
        const categories = skills.reduce((acc, skill) => {
            const category = keyFn(skill) || "uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill);
            return acc;
        }, {});
        Object.keys(categories).forEach(key => categories[key].sort((a, b) => a.name.localeCompare(b.name)));
        return categories;
    }

    static _sortSkillsByName(skills) {
        return skills.sort((a, b) => a.name.localeCompare(b.name));
    }

    // NOTE: Character Creation starts here

    static getAllMetaHumans(metahumans) {
        console.log("Input metahumans data:", metahumans); // Log the input data
        return [
            { priority: "E", name: "Human", foundryitemid: "E-foundryItemId" }, // Hardcoded option without an ID
            ...metahumans.map(metahuman => {
                const foundryitemid = metahuman.id; // Extract the ID

                return {
                    foundryitemid, // Foundry's built-in object ID
                    priority: metahuman.priority, // Extract priority from system data
                    name: metahuman.name, // Use the object's name
                };
            })
        ];
    }

    static getAllMagics(magics) {
        console.log("Input magics data:", magics); // Log the input data
        return [
            { priority: "E", name: "Unawakened", foundryitemid: "E-foundryItemId" }, // Hardcoded option without an ID
            { priority: "D", name: "Unawakened", foundryitemid: "D-foundryItemId" },
            { priority: "C", name: "Unawakened", foundryitemid: "C-foundryItemId" },
            ...magics.map(tradition => {
                const foundryitemid = tradition.id; // Extract the ID

                return {
                    foundryitemid, // Foundry's built-in object ID
                    priority: tradition.priority, // Extract priority from system data
                    name: tradition.name, // Use the object's name
                };
            })
        ];
    }

    static getPriorities() {
        return {
            attributePriorities: { A: 30, B: 27, C: 24, D: 21, E: 18 },
            skillsPriorities: { A: 50, B: 40, C: 34, D: 30, E: 27 },
            resourcesPriorities: { A: 1000000, B: 400000, C: 90000, D: 20000, E: 5000 }
        };
    }
}