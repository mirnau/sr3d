
export default class ExitPointAssignmentDialog extends Dialog {
    constructor(resolve, actor) {
        super({
            title: "Completion Confirmation",
            content: "<p>Are you sure you have finished creating your character?</p>",
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Yes",
                    callback: () => resolve(true)
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "No",
                    callback: () => resolve(false)
                }
            },
            default: "confirm",
            close: () => resolve(false) // In case the dialog is closed without selection
        });

        this.actor = actor;
    }
}
