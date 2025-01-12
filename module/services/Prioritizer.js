export default class Randomizer {
    static VALID_PRIORITIES = ["A", "B", "C", "D", "E"];

    generatePriorityCombination() {

        const priorities = [...Randomizer.VALID_PRIORITIES]; // Clone valid priorities
        const combination = {};

        console.log(`sr3d | Randomizer | Initial Priorities: ${priorities.join(", ")}`);

        // Step 1: Randomize Metahuman
        combination.metahuman = this._assignMetahumanPriority(priorities);
        console.log(`sr3d | Randomizer | Metahuman Priority: ${combination.metahuman}`);

        // Step 2: Randomize Magic
        combination.magic = this._assignMagicPriority(priorities);
        console.log(`sr3d | Randomizer | Magic Priority: ${combination.magic}`);

        // Step 3: Randomize the Rest
        combination.attribute = this._assignRemainingPriority(priorities);
        combination.skills = this._assignRemainingPriority(priorities);
        combination.resources = this._assignRemainingPriority(priorities);

        console.log(`sr3d | Randomizer | Final Combination:`, combination);

        return combination;
    }

    _assignMetahumanPriority(priorities) {

        const weights = {
            E: 64,
            C: 18,
            D: 18
        };

        const metahumans = game.items.filter(item => item.type === "metahuman");
        const availablePriorities = metahumans.map(m => m.system.priority);

        const validMetahumanPriorities = priorities.filter((p) => ["E", "C", "D"].includes(p));

        const weightedPool = validMetahumanPriorities.flatMap((priority) => Array(weights[priority]).fill(priority));
        let chosenPriority = weightedPool[Math.floor(Math.random() * weightedPool.length)];

        ["E", "C", "D"].forEach((element) => {
            if(chosenPriority === element && !availablePriorities.includes(chosenPriority)) {
                return chosenPriority = this._assignMetahumanPriority(priorities);
            }
        });

        return chosenPriority;
    }

    _assignMagicPriority(priorities) {
        const weights = {
            A: 2,
            B: 2,
            C: 32,
            D: 32,
            E: 32,
        };

        const magics = game.items.filter(item => item.type === "magic");
        const availablePriorites = magics.map(m => m.system.priority);
  
        const weightedPool = priorities.flatMap((priority) => Array(weights[priority]).fill(priority));

        let chosenPriority = weightedPool[Math.floor(Math.random() * weightedPool.length)];

        ["A", "B"].forEach((element) => {
            if(chosenPriority === element && !availablePriorites.includes(chosenPriority)) {
                return chosenPriority = this._assignMagicPriority(priorities);
            }
        });
  
        return chosenPriority;
    }

    _assignRemainingPriority(priorities) {
        const chosenPriority = priorities[Math.floor(Math.random() * priorities.length)];
        return chosenPriority;
    }
}