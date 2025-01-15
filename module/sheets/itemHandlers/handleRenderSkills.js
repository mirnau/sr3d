import { CreateSkillDialog } from "../../dialogs/CreateSkillDialog.js";

export async function handleCreateSkill(item, options, userId) {
    if (item.type !== "skill") return
    if (item.system.skillType !== "") {
        await item.update(item.toObject())
        return
    }
    const htmlTemplate = await renderTemplate("systems/sr3d/templates/dialogs/skill-creation-dialog.hbs")
    const itemData = await new Promise(resolve => {
        new CreateSkillDialog(resolve, htmlTemplate, item).render(true)
    })
    if (itemData) {
        await item.update({ ...itemData })
    } else {
        if (item.parent) {
            await item.parent.deleteEmbeddedDocuments("Item", [item.id])
        }
        else {
            await item.delete()
        }
    }
}