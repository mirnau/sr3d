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

    // Define base RGB colors
    const lightBlueRGB = rgb(63, 114, 131);       // Light Blue
    const grayRGB = rgb(51, 51, 51);               // Dark Gray
    const lightColor = rgb(121, 121, 121);   // Cherry Blossom Pink
    const brushedBlackRGB1 = { r: 26, g: 26, b: 26 }; // #1a1a1a
    const brushedBlackRGB2 = { r: 77, g: 77, b: 77 }; // #4d4d4d

    // Predefine the brushed black gradient base
    const brushedBlackBase = `linear-gradient(30deg, rgb(${brushedBlackRGB1.r}, ${brushedBlackRGB1.g}, ${brushedBlackRGB1.b}), rgb(${brushedBlackRGB2.r}, ${brushedBlackRGB2.g}, ${brushedBlackRGB2.b}))`;

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
            const maxDistance = Math.max(rect.width, rect.height) * 1.5; // Adjust as needed

            // Calculate the intensity based on distance (0 to 1)
            const intensity = Math.max(0, 1 - distance / maxDistance);

            // Generate RGBA colors using helper functions
            const lightBlue = myColorAsString(lightBlueRGB, intensity);                // Light blue opacity increases as mouse approaches
            const gray = myColorAsString(grayRGB, 1 - intensity);                     // Gray opacity increases as mouse moves away
            const cherryBlossom = myColorAsString(lightColor, intensity);        // Cherry blossom pink light opacity

            // Generate the radial gradient for the light effect
            const radialGradient = `radial-gradient(circle at ${mouseX}px ${mouseY}px, 
                ${cherryBlossom} 0%, 
                ${myColorAsString(lightColor, 0)} 80%
            )`;

            // Generate the repeating linear gradient for the light and gray pattern
            const repeatingLinearGradient = `repeating-linear-gradient(
                45deg,
                ${lightBlue} 1px, 
                ${lightBlue} 2px, 
                ${lightBlue} 1px, 
                ${gray} 3px, 
                ${gray} 1px, 
                ${gray} 2px
            )`;

            // Combine all gradients with the brushed black base
            const combinedBackground = `
                ${radialGradient},
                ${repeatingLinearGradient},
                ${brushedBlackBase}
            `;

            // Apply the combined background to the card
            card.style.background = combinedBackground;
        });
    });
}
