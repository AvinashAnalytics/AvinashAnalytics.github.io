/* =====================================================
   🌌 PREMIUM PARTICLE ANIMATION - v6.0
   Enhanced with Dust, Gravity Wells & Neural Effects
===================================================== */

class ParticleAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.dustParticles = [];
        this.particleCount = 100;
        this.dustCount = 50;
        this.mouse = { x: null, y: null, active: false };
        this.centerX = 0;
        this.centerY = 0;
        this.gravityStrength = 0.0003;

        this.init();
        this.animate();

        // Enhanced mouse interaction
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
            this.mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });

        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();

        // Main orbital particles - Polar Coordinates
        for (let i = 0; i < this.particleCount; i++) {
            const radius = 150 + Math.random() * 350;
            const angle = Math.random() * Math.PI * 2;

            this.particles.push({
                angle: angle,
                radius: radius,
                baseRadius: radius,
                angularSpeed: (0.001 + Math.random() * 0.002) * (Math.random() < 0.5 ? 1 : -1),
                oscillationSpeed: 0.01 + Math.random() * 0.02,
                oscillationOffset: Math.random() * Math.PI * 2,
                x: 0,
                y: 0,
                size: 1 + Math.random() * 2,
                baseSize: 1 + Math.random() * 2,
                opacity: 0.2 + Math.random() * 0.5,
                color: Math.random() > 0.7 ? '#06b6d4' : '#ffffff',
                vx: 0,
                vy: 0
            });
        }

        // Dust particles - Ambient floating effect
        for (let i = 0; i < this.dustCount; i++) {
            this.dustParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: 0.5 + Math.random() * 1.5,
                opacity: 0.1 + Math.random() * 0.3,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.01 + Math.random() * 0.02
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
        // Update main particles with gravity well
        this.particles.forEach(p => {
            p.angle += p.angularSpeed;

            let targetRadius = p.baseRadius;

            // Mouse gravity well effect
            if (this.mouse.active) {
                const dx = this.mouse.x - (this.centerX + Math.cos(p.angle) * p.radius);
                const dy = this.mouse.y - (this.centerY + Math.sin(p.angle) * p.radius);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                    const force = (1 - dist / 200) * 50;
                    targetRadius = p.baseRadius - force;

                    // Size pulse on proximity
                    p.size = p.baseSize * (1 + (1 - dist / 200) * 0.5);
                } else {
                    p.size = p.baseSize;
                }
            } else {
                p.size = p.baseSize;
            }

            const oscillation = Math.sin(Date.now() * 0.001 * p.oscillationSpeed + p.oscillationOffset) * 20;
            p.radius += (targetRadius + oscillation - p.radius) * 0.05;

            p.x = this.centerX + Math.cos(p.angle) * p.radius;
            p.y = this.centerY + Math.sin(p.angle) * p.radius;
        });

        // Update dust particles
        this.dustParticles.forEach(d => {
            d.wobble += d.wobbleSpeed;
            d.x += d.vx + Math.sin(d.wobble) * 0.1;
            d.y += d.vy + Math.cos(d.wobble) * 0.1;

            // Wrap around screen
            if (d.x < 0) d.x = this.canvas.width;
            if (d.x > this.canvas.width) d.x = 0;
            if (d.y < 0) d.y = this.canvas.height;
            if (d.y > this.canvas.height) d.y = 0;
        });
    }

    draw() {
        // Particle trail effect - fade instead of clear
        this.ctx.fillStyle = 'rgba(5, 7, 17, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw dust particles first (background layer)
        this.dustParticles.forEach(d => {
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity})`;
            this.ctx.fill();
        });

        // Draw connecting lines between nearby particles
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

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

        // Draw main particles
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color === '#06b6d4'
                ? `rgba(6, 182, 212, ${p.opacity})`
                : `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.fill();

            // Enhanced glow for cyan particles
            if (p.color === '#06b6d4') {
                this.ctx.shadowBlur = 15;
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
