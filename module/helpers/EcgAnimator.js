export default class EcgAnimator {
    constructor(canvas, {
        freq = 1,   // ~60 BPM
        amp = 20,   // wave amplitude
        color = 'lime',
        lineWidth = 2
    } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Dimensions
        this.width = canvas.width;
        this.height = canvas.height;

        // Animation vars
        this.phase = 0;    // Tracks horizontal offset
        this.freq = freq;  // Initial frequency
        this.amp = amp;    // Amplitude of the wave

        // Styling
        this.color = color;
        this.lineWidth = lineWidth;

        this._isAnimating = false;
        this._animFrame = null;

        // Data buffer for previously drawn points
        this.points = [];
    }

    // Start the animation loop
    start() {
        if (this._isAnimating) return;
        this._isAnimating = true;
        this._animate();
    }

    // Stop the animation loop
    stop() {
        this._isAnimating = false;
        if (this._animFrame) cancelAnimationFrame(this._animFrame);
    }

    // Adjust frequency and amplitude on the fly
    setFrequency(freq) { this.freq = freq; }
    setAmplitude(amp) { this.amp = amp; }

    _animate = () => {
        if (!this._isAnimating) return;
        this._drawEcg();
        this._animFrame = requestAnimationFrame(this._animate);
    }

    _drawEcg() {
        const ctx = this.ctx;

        // Shift canvas content to the left
        const imageData = ctx.getImageData(1, 0, this.width - 1, this.height);
        ctx.clearRect(0, 0, this.width, this.height); // Clear the canvas
        ctx.putImageData(imageData, 0, 0); // Move content left by 1 pixel

        // Calculate the new point at the rightmost edge
        const x = this.width - 1;
        const y = (this.height / 2) - this._getHeartY(this.phase);

        // If there's no previous point, set it to the current point
        if (this.prevY === undefined) {
            this.prevY = y;
        }

        // Draw the new line segment connecting the last point to the current one
        ctx.beginPath();
        ctx.moveTo(x - 1, this.prevY); // Start from the last point
        ctx.lineTo(x, y); // Draw to the current point
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        // Update the previous Y-value for the next frame
        this.prevY = y;

        // Increment the phase to progress the wave
        this.phase += 0.04 * this.freq; // Adjust phase increment based on frequency
    }



    _getHeartY(phase) {
        const t = phase;
        const cycle = (t % (2 * Math.PI)) / (2 * Math.PI);

        let y = 0;

        // P wave
        if (cycle < 0.1) {
            const alpha = cycle / 0.1;
            y = 0.1 * Math.sin(alpha * Math.PI) * this.amp;
        }
        // Q dip
        else if (cycle < 0.15) {
            const alpha = (cycle - 0.1) / 0.05;
            y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
        }
        // R spike
        else if (cycle < 0.2) {
            const alpha = (cycle - 0.15) / 0.05;
            y = 0.8 * Math.sin(alpha * Math.PI) * this.amp;
        }
        // S dip
        else if (cycle < 0.25) {
            const alpha = (cycle - 0.2) / 0.05;
            y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
        }
        // T wave
        else if (cycle < 0.55) {
            const alpha = (cycle - 0.4) / 0.15;
            y = 0.3 * Math.sin(alpha * Math.PI) * this.amp;
        }

        return y;
    }
}
