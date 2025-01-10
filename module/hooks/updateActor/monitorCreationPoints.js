import { flags } from "../../helpers/CommonConsts.js";
import ExitPointAssignmentDialog from "../../dialogs/ExitPointAssignmentDialog.js"
import SR3DLog from "../../SR3DLog.js";

export async function monitorCreationPoints(actor, updatedData, options, userId) {

    const creation = actor.system.creation;
    if (!creation) { 
        SR3DLog.info("No points -> Early exit.", monitorCreationPoints.name);
        return; 
    }
    
    const creationStateFlag = !actor.getFlag(flags.namespace, flags.isCharacterCreationState);
    
    if (creationStateFlag) {
        SR3DLog.info("Character creation complete -> Early exit.", monitorCreationPoints.name);
        return;
    }

    const { attributePoints, activePoints, knowledgePoints, languagePoints } = creation;

    // Check if all creation points are zero
    const allPointsZero =
        attributePoints === 0 &&
        activePoints === 0 &&
        knowledgePoints === 0 &&
        languagePoints === 0;
    
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
