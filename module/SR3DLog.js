export default class SR3DLog {
    static success(message, sender = "Unknown") {
        console.log(
            `%c✅ | %csr3d%c | ${message} %cfrom %c${sender}`,
            "", "font-weight: bold; color: green;", "", "font-weight: bold;", "font-style: italic; color: gray;"
        );
    }

    static info(message, sender = "Unknown") {
        console.log(
            `%c🔵 | %csr3d%c | ${message} %cfrom %c${sender}`,
            "", "font-weight: bold; color: lightblue;", "", "font-weight: bold;", "font-style: italic; color: gray;"
        );
    }

    static warning(message, sender = "Unknown") {
        console.warn(
            `%c⚠️ | %csr3d%c | ${message} %cfrom %c${sender}`,
            "", "font-weight: bold; color: orange;", "", "font-weight: bold;", "font-style: italic; color: gray;"
        );
    }

    static error(message, sender = "Unknown") {
        console.error(
            `%c❌ | %csr3d%c | ${message} %cfrom %c${sender}`,
            "", "font-weight: bold; color: red;", "", "font-weight: bold;", "font-style: italic; color: gray;"
        );
    }

    static debug(message, sender = "Unknown") {
        console.log(
            `%c🐞 | %csr3d%c | ${message} %cfrom %c${sender}`,
            "", "font-weight: bold; color: purple;", "", "font-weight: bold;", "font-style: italic; color: gray;"
        );
    }

    static critical(message, sender = "Unknown") {
        console.error(
            `%c🔥 | %csr3d%c | ${message} %cfrom %c${sender}`,
            "", "font-weight: bold; color: darkred;", "", "font-weight: bold;", "font-style: italic; color: gray;"
        );
    }

    static inspect(label, variable, sender = "Unknown") {
        console.log(
            `%c🔍 | %csr3d%c | Inspecting: %c${label}%c = %o %cfrom %c${sender}`,
            "", 
            "font-weight: bold; color: teal;", // Bold teal for sr3d
            "", 
            "font-weight: bold; color: violet;", // Bold for the label
            "", 
            variable, // Output the inspected variable
            "font-weight: bold;", // Bold for from
            "font-style: italic; color: gray;" // Italic gray for sender
        );
    }
}
