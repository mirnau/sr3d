export async function displayNeonName(app, html, data) {
    const actorName = data.actor.name; // Get the actor's name
    const malfunctioningIndexes = [];
    const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    if (actorName.length < 4) {
        malfunctioningIndexes.push(randomInRange(0, actorName.length - 1)); // Just one letter malfunctions
    } else {
        const malfunctionInNplaces = actorName.length % 4;

        for (let i = 0; i < malfunctionInNplaces; i++) {
            let index;
            do {
                index = randomInRange(0, actorName.length - 1);
            } while (malfunctioningIndexes.includes(index)); // Avoid duplicate indexes
            malfunctioningIndexes.push(index);
        }
    }

    // Create the HTML for the neon name with malfunctioning letters
    const neonHTML = [...actorName]
        .map((char, index) => malfunctioningIndexes.includes(index)
            ? `<div class="malfunc">${char}</div>` // Malfunctioning letter
            : `<div>${char}</div>` // Normal letter
        )
        .join("");
    const renderedHTML = `
<div class="neon-name-position">
    <div class="neon-name">${neonHTML}</div>
</div>
`;

    // Find the header element
    const header = html.find("header.window-header")[0]; // Convert to raw DOM element

    // Insert the HTML before the header element
    if (header) {
        header.insertAdjacentHTML("beforebegin", renderedHTML);
    }
}
