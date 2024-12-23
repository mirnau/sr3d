export function attachLightEffect(html, activeTheme) {
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

    // Define colors for light and dark themes
    const colors = {
        light: {
            silverRGB: rgb(158, 158, 158),
            lightGrayRGB: rgb(170, 170, 170),
            darkGrayRGB: rgb(105, 105, 105),
            highlightRGB: rgb(222, 136, 230), // Reflective highlight
        },
        dark: {
            silverRGB: rgb(81, 106, 134), // Bluish brushed aluminum
            lightGrayRGB: rgb(57, 77, 100),
            darkGrayRGB: rgb(31, 44, 66),
            highlightRGB: rgb(89, 120, 151), // Subtle blue highlight
        }
    };

    // Select the theme colors
    const themeColors = activeTheme === "chummer-dark" ? colors.dark : colors.light;

    // Predefine the brushed aluminum base gradient for the selected theme
    const brushedAluminumBase = `repeating-linear-gradient(
        0deg,
        ${myColorAsString(themeColors.silverRGB, 0.6)} 1px,
        ${myColorAsString(themeColors.lightGrayRGB, 0.6)} 5px,
        ${myColorAsString(themeColors.silverRGB, 0.6)} 2px
    )`;

    // =========================
    //       Event Handling
    // =========================

    // Select the .window-content container
    const windowContent = html.find('.window-content');

    // Attach the mousemove event listener
    windowContent.on("mousemove", (event) => {
        // Select all target elements within the sheet

        const selectors = [
            '.skill-specialization-card',
            '.knowledge-skill-item',
            '.language-card-container',
            '.active-skill-container',
            '.skill-card',
            '.stat-card',
            '.tab-content',
            '.item',
            '.possessions-table-header'
            
            
        ];
        
        const targetElements = html.find(selectors.join(', '));
        

        // Iterate over each target element to apply the light effect
        targetElements.each((index, element) => {
            // Get the bounding rectangle of the element
            const rect = element.getBoundingClientRect();

            // Calculate the center coordinates of the element
            const elementCenterX = rect.width / 2;
            const elementCenterY = rect.height / 2;

            // Calculate the mouse position relative to the element's top-left corner
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Calculate the distance between the mouse and the element's center
            const deltaX = mouseX - elementCenterX;
            const deltaY = mouseY - elementCenterY;
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            // Define the maximum distance for the light effect
            const maxDistance = Math.max(rect.width, rect.height) * 2.5;

            // Calculate the intensity based on distance (0 to 1)
            const intensity = Math.max(0, 1 - distance / maxDistance);

            // Generate RGBA colors for the dynamic highlights
            const highlight = myColorAsString(themeColors.highlightRGB, intensity);
            const radialHighlight = myColorAsString(themeColors.highlightRGB, intensity * 0.5);

            // Generate the radial gradient for dynamic lighting
            const radialGradient = `radial-gradient(circle at ${mouseX}px ${mouseY}px, 
                ${highlight} 0%, 
                ${radialHighlight} 70%, 
                ${myColorAsString(themeColors.silverRGB, 0)} 100%
            )`;

            // Combine the radial gradient with the brushed aluminum base
            const combinedBackground = `
                ${radialGradient},
                ${brushedAluminumBase}
            `;

            // Apply the combined background to the element
            element.style.background = combinedBackground;
        });
    });
}
