
export async function showCharacterCreationDialog(data, onConfirm, onCancel) {
    const htmlTemplate = await renderTemplate('systems/sr3d/templates/dialogs/character-creation-dialog.hbs', data);

    return new Promise((resolve) => {
        new Dialog({
            title: "Character Creation",
            content: htmlTemplate,
            buttons: {
                ok: {
                    label: "OK",
                    callback: async (html) => {
                        if (onConfirm) await onConfirm(html);
                        resolve(true);
                    },
                },
                cancel: {
                    label: "Cancel",
                    callback: () => {
                        if (onCancel) onCancel();
                        resolve(false);
                    },
                },
            },
            default: "ok",
        }).render(true);
    });
}
