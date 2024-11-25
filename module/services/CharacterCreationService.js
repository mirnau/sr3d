// src/services/CharacterCreationService.js
export class CharacterCreationService {
    static prepareDialogData() {
        const metahumans = game.items.filter(item => item.type === "metahuman");
        const magicTraditions = game.items.filter(item => item.type === "magicTradition");

        const allMetahumans = [
            { priority: "E", name: "Human", default: true },
            ...metahumans.map(metahuman => ({
                priority: metahuman.system.priority || "N/A",
                name: metahuman.name || "Unknown",
                default: false,
            }))
        ];

        const allMagicTraditions = [
            { priority: "C", name: "Unawakened", default: true },
            { priority: "D", name: "Unawakened", default: true },
            { priority: "E", name: "Unawakened", default: true },
            ...magicTraditions.map(tradition => ({
                priority: tradition.system.priority,
                name: tradition.name,
                default: false,
            }))
        ];

        const attributePriorities = { A: 30, B: 27, C: 24, D: 21, E: 18 };
        const skillsPriorities = { A: 50, B: 40, C: 34, D: 30, E: 27 };
        const resourcesPriorities = { A: 1000000, B: 400000, C: 90000, D: 20000, E: 5000 };

        return {
            metahumans: allMetahumans,
            magicTraditions: allMagicTraditions,
            attributePriorities,
            skillsPriorities,
            resourcesPriorities,
        };
    }
}
