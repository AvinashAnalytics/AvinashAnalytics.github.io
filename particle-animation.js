/* =====================================================
   🌌 MODERN PARTICLE ANIMATION - v5.0
   Circular Ring Gravity - Stable Polar Orbits
===================================================== */

class ParticleAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100; // Optimal count for rings
        this.mouse = { x: null, y: null };
        this.centerX = 0;
        this.centerY = 0;

        this.init();
        this.animate();

        // Mouse interaction
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();

        // v5.0: Circular Ring Gravity - Polar Coordinates
        // Particles orbit in stable rings, never collapsing to center
        for (let i = 0; i < this.particleCount; i++) {
            const radius = 150 + Math.random() * 350; // Ring distribution
            const angle = Math.random() * Math.PI * 2;

            this.particles.push({
                // Polar coordinates
                angle: angle,
                radius: radius,
                baseRadius: radius,

                // Orbital speed (closer = faster, like gravity)
                angularSpeed: (0.001 + Math.random() * 0.002) * (Math.random() < 0.5 ? 1 : -1),

                // "Breathing" effect parameters
                oscillationSpeed: 0.01 + Math.random() * 0.02,
                oscillationOffset: Math.random() * Math.PI * 2,

                // Cartesian (calculated in update)
                x: 0,
                y: 0,

                // Appearance
                size: 1 + Math.random() * 2,
                opacity: 0.2 + Math.random() * 0.5,
                color: Math.random() > 0.7 ? '#06b6d4' : '#ffffff'
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Full clear on resize
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        this.particles.forEach(p => {
            // Update angle (orbit)
            p.angle += p.angularSpeed;

            // Interaction with mouse (gravity well or repulsion)
            let targetRadius = p.baseRadius;

            // Smoothly move radius (breathing + interaction)
            const oscillation = Math.sin(Date.now() * 0.001 * p.oscillationSpeed + p.oscillationOffset) * 20;
            p.radius += (targetRadius + oscillation - p.radius) * 0.05;

            // Convert Polar -> Cartesian for drawing
            p.x = this.centerX + Math.cos(p.angle) * p.radius;
            p.y = this.centerY + Math.sin(p.angle) * p.radius;
        });
    }

    draw() {
        // v5.0: FULL CLEAR - Keeps it clean, no accumulation
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connecting lines between nearby particles
        // This creates a "network" effect within the rings
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Connect if close enough
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(100, 200, 255, ${0.1 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });
        });

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color === '#06b6d4'
                ? `rgba(6, 182, 212, ${p.opacity})`
                : `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.fill();

            // Subtle glow for cyan particles
            if (p.color === '#06b6d4') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#06b6d4';
                this.ctx.fill();
                this.ctx.shadowBlur = 0; // Reset
            }
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new ParticleAnimation('particle-canvas');
});
