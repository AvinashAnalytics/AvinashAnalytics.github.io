/* =====================================================
   🌌 MODERN PARTICLE ANIMATION - v4.0
   Clean, no-trail particle system with floating motion
===================================================== */

class ParticleAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 120;
        this.mouse = { x: null, y: null, radius: 150 };

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

        // Create particles with simple floating motion
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,

                // Simple velocity-based movement (no orbits!)
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,

                // Appearance
                size: 1 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.4,

                // Color variation
                color: Math.random() > 0.7 ? '#06b6d4' : '#ffffff'
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Full clear on resize to prevent artifacts
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        this.particles.forEach(p => {
            // Simple floating movement
            p.x += p.vx;
            p.y += p.vy;

            // Mouse repulsion (subtle)
            if (this.mouse.x && this.mouse.y) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                }
            }

            // Wrap around edges
            if (p.x < -50) p.x = this.canvas.width + 50;
            if (p.x > this.canvas.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.canvas.height + 50;
            if (p.y > this.canvas.height + 50) p.y = -50;
        });
    }

    draw() {
        // v4.0: FULL CLEAR - No fade, no trails, no buildup!
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connecting lines between nearby particles
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(100, 200, 255, ${0.15 * (1 - distance / 120)})`;
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

            // Subtle glow for cyan particles only
            if (p.color === '#06b6d4') {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#06b6d4';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
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
