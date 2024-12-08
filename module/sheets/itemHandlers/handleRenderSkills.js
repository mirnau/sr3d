import { flags } from "../../helpers/CommonConsts.js";
import { CreateSkillDialog } from "../../dialogs/CreateSkillDialog.js";

export async function handleRenderSkills(ctx) {
    // If the flag is false, show the dialog
    if (!ctx.item.getFlag(flags.namespace, flags.isInitialized)) {
        console.log("Skill is not initialized. Showing skill type dialog.");
        const dialogResult = await showSkillTypeDialog(ctx);

        // If the dialog is canceled, delete the item and prevent rendering
        if (!dialogResult) {
            console.log(`Skill creation canceled for item: ${ctx.item.name}. Deleting item.`);
            await ctx.item.delete();
            return; // Halt rendering by exiting the `render` method
        }

        // Set the flag to true after the dialog is completed
        await ctx.item.setFlag(flags.namespace, flags.isInitialized, true);
        console.log("Skill has been initialized. Flag set to true.");
    }
}

export async function showSkillTypeDialog(ctx) {
    const htmlTemplate = await renderTemplate('systems/sr3d/templates/dialogs/skill-creation-dialog.hbs');

    return new Promise((resolve) => {
        new CreateSkillDialog(resolve, htmlTemplate, ctx).render(true);
    });
}
