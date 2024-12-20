import { flags } from "../../helpers/CommonConsts.js";
import ExitPointAssignmentDialog from "../../dialogs/ExitPointAssignmentDialog.js"

export async function monitorCreationPoints(actor, updatedData, options, userId) {
    console.log("monitorCreationPoints Called", { actor, updatedData });

    if (!actor) {
        console.warn("No actor provided to monitorCreationPoints");
        return;
    }

    // Ensure the flag is properly checked
    const creationStateFlag = !actor.getFlag(flags.namespace, flags.isCharacterCreationState);
    console.log("Character Creation State Flag:", creationStateFlag);

    // Skip if creation is already complete
    if (creationStateFlag) {
        console.log("Skipping monitorCreationPoints: Character creation already marked complete.");
        return;
    }

    // Check the actor's creation data
    const creation = actor.system.creation;
    if (!creation) {
        console.error("Actor does not have a creation object", actor);
        return;
    }

    const { attributePoints, activePoints, knowledgePoints, languagePoints } = creation;

    // Check if all creation points are zero
    const allPointsZero =
        attributePoints === 0 &&
        activePoints === 0 &&
        knowledgePoints === 0 &&
        languagePoints === 0;

    console.log("Creation Points Check:", {
        attributePoints,
        activePoints,
        knowledgePoints,
        languagePoints,
        allPointsZero,
    });

    if (allPointsZero) {
        const isDone = await new Promise((resolve) => {
            console.log("Rendering ExitPointAssignmentDialog...");
            new ExitPointAssignmentDialog(resolve, actor).render(true);
        });

        if (isDone) {
            console.log("User confirmed character creation is complete.");
            await actor.setFlag(flags.namespace, flags.isCharacterCreationState, false);

            // Find and fade out the meter
            const meter = document.querySelector(".attribute-position");
            if (meter) {
                meter.style.transition = "opacity 5s ease-out";
                meter.style.opacity = "0";
                setTimeout(() => meter.remove(), 5000);
            }
        } else {
            console.log("User chose to continue editing character creation.");
        }
    }
}
