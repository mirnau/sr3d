export default class ProceedWithDelete extends Dialog {
    constructor(callback, options = {}) {
        const defaultOptions = {
            title: "Confirm Delete",
            content: "<p>Are you sure you want to delete this item?</p>",
            buttons: {
                yes: {
                    label: "Yes",
                    icon: '<i class="fas fa-check"></i>',
                    callback: () => callback(true)
                },
                no: {
                    label: "No",
                    icon: '<i class="fas fa-times"></i>',
                    callback: () => callback(false)
                }
            },
            default: "no",
            close: () => callback(false)
        };
        super(Object.assign(defaultOptions, options));
    }
}
