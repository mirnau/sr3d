import { flags } from "../helpers/CommonConsts.js";

export class LockAttributesDialog extends Dialog {
    constructor(actor, options = {}) {
        const dialogContent = `
            <p>Lock in your attribute points?</p>
            <p>Once locked, no further adjustments will be allowed.</p>
        `;

        const buttons = {
            yes: {
                label: "Yes",
                icon: `<i class="fas fa-check"></i>`,
                callback: async () => {
                    await actor.setFlag(flags.namespace, flags.attributesDone, true);
                    ui.notifications.info("Attributes have been locked.");
                }
            },
            no: {
                label: "No",
                icon: `<i class="fas fa-times"></i>`,
                callback: () => {
                    ui.notifications.info("Attribute adjustments canceled.");
                }
            }
        };

        super({
            title: "Lock Attributes",
            content: dialogContent,
            buttons,
            default: "no",
            ...options
        });
    }

    // Optionally, you can add additional custom behavior or methods here
}
