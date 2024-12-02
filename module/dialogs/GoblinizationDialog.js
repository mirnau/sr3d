export class GoblinizationDialog extends Dialog {
    constructor(actor, item) {
        // Define the dialog configuration
        const dialogConfig = {
            title: "Goblinization Confirmation",
            content: "<p>Goblinization can only be done once. Proceed?</p>",
            buttons: {
                mutate: {
                    label: "Mutate!",
                    callback: async () => {
                        const canGoblinize = actor.canGoblinizeTo(item);
                        if (canGoblinize) {
                            await actor.createEmbeddedDocuments("Item", [{
                                ...item.toObject(),
                                flags: {
                                    ...item.flags,
                                    sr3d: { confirmedGoblinization: true }
                                }
                            }]);
                            actor.recalculateAttribute();
                            ui.notifications.info("Goblinization successful!");
                        } else {
                            ui.notifications.warn("This mutation would kill you! Improve your attributes!");
                        }
                    }
                },
                cancel: {
                    label: "Not Today",
                    callback: () => ui.notifications.info("Goblinization canceled.")
                }
            },
            default: "cancel"
        };

        // Call the parent class constructor with the dialog configuration
        super(dialogConfig);

        // Save actor and item as instance properties for use in methods
        this.actor = actor;
        this.item = item;
    }
}
