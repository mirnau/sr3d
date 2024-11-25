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

    static prepareInventory(contents) {
        return {
            weapons: contents.filter(item => item.type === "weapon"),
            armor: contents.filter(item => item.type === "armor"),
            consumables: contents.filter(item => item.type === "consumable"),
            others: contents.filter(item => !["weapon", "armor", "consumable"].includes(item.type)),
        };
    }

    static prepareLanguages(items) {
        return items
            .filter(item => item.type === "skill" && item.system.skillType === "languageSkill")
            .map(skill => ({
                id: skill.id,
                name: skill.name,
                subskills: {
                    Speech: skill.system.languageSkill.speach.base,
                    Read: skill.system.languageSkill.read.base,
                    Write: skill.system.languageSkill.write.base,
                },
            }));
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
        return [
            { priority: "E", name: "Human", default: true },
            ...metahumans.map(metahuman => ({
                priority: metahuman.system.priority || "N/A",
                name: metahuman.name || "Unknown",
                default: false,
            }))
        ];
    }

    static getAllMagicTraditions(magicTraditions) {
        return [
            { priority: "C", name: "Unawakened", default: true }, // Hardcoded Unawakened
            { priority: "D", name: "Unawakened", default: true }, // Hardcoded Unawakened
            { priority: "E", name: "Unawakened", default: true }, // Hardcoded Unawakened
            ...magicTraditions.map(tradition => ({
                priority: tradition.system.priority,
                name: tradition.name,
                default: false,
            }))
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