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

        const validMetahumanPriorities = priorities.filter((p) => ["E", "C", "D"].includes(p));

        if (validMetahumanPriorities.length === 0) {
            throw new Error("No valid Metahuman priorities available.");
        }

        const weightedPool = validMetahumanPriorities.flatMap((priority) => Array(weights[priority]).fill(priority));
        const chosenPriority = weightedPool[Math.floor(Math.random() * weightedPool.length)];
        priorities.splice(priorities.indexOf(chosenPriority), 1);
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
    
        const weightedPool = priorities.flatMap((priority) => Array(weights[priority]).fill(priority));

        const chosenPriority = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    
        priorities.splice(priorities.indexOf(chosenPriority), 1);
    
        return chosenPriority;
    }

    _assignRemainingPriority(priorities) {
        if (priorities.length === 0) {
            throw new Error("No valid priorities remaining.");
        }

        const chosenPriority = priorities[Math.floor(Math.random() * priorities.length)];
        priorities.splice(priorities.indexOf(chosenPriority), 1);
        return chosenPriority;
    }
}
