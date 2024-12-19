export function attachLightEffect(html) {
    // =========================
    //       Color Definitions
    // =========================

    // Helper function to create RGB objects
    function rgb(r, g, b) {
        return { r, g, b };
    }

    // Helper function to convert RGB and alpha to an RGBA string
    function myColorAsString(rgb, alpha) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    // Define aluminum-like RGB colors
    const silverRGB = rgb(158, 158, 158);
    const lightGrayRGB = rgb(170, 170, 170);
    const darkGrayRGB = rgb(105, 105, 105);
    const highlightRGB = rgb(222, 136, 230); // Reflective highlight

    // Predefine the brushed aluminum base gradient
    const brushedAluminumBase = `repeating-linear-gradient(
        0deg,
        ${myColorAsString(silverRGB, 0.6)} 0px,
        ${myColorAsString(lightGrayRGB, 0.6)} 3px,
        ${myColorAsString(silverRGB, 0.6)} 6px
    )`;

    // =========================
    //       Event Handling
    // =========================

    // Select the .window-content container
    const windowContent = html.find('.window-content');

    // Attach the mousemove event listener
    windowContent.on("mousemove", (event) => {
        // Select all .stat-card elements within the sheet
        const statCards = html.find('.stat-card');

        // Iterate over each stat card to apply the light effect
        statCards.each((index, card) => {
            // Get the bounding rectangle of the card
            const rect = card.getBoundingClientRect();

            // Calculate the center coordinates of the card
            const cardCenterX = rect.width / 2;
            const cardCenterY = rect.height / 2;

            // Calculate the mouse position relative to the card's top-left corner
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Calculate the distance between the mouse and the card's center
            const deltaX = mouseX - cardCenterX;
            const deltaY = mouseY - cardCenterY;
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            // Define the maximum distance for the light effect
            const maxDistance = Math.max(rect.width, rect.height) * 1.5;

            // Calculate the intensity based on distance (0 to 1)
            const intensity = Math.max(0, 1 - distance / maxDistance);

            // Generate RGBA colors for the dynamic highlights
            const highlight = myColorAsString(highlightRGB, intensity);
            const radialHighlight = myColorAsString(highlightRGB, intensity * 0.5);

            // Generate the radial gradient for dynamic lighting
            const radialGradient = `radial-gradient(circle at ${mouseX}px ${mouseY}px, 
                ${highlight} 0%, 
                ${radialHighlight} 70%, 
                ${myColorAsString(silverRGB, 0)} 100%
            )`;

            // Combine the radial gradient with the brushed aluminum base
            const combinedBackground = `
                ${radialGradient},
                ${brushedAluminumBase}
            `;

            // Apply the combined background to the card
            card.style.background = combinedBackground;
            card.style.backgroundBlendMode = "overlay"; // Enhance the metallic effect
        });
    });
}
