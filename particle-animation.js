/* ===================================================================
   ✨ 3D PARTICLE DUST ANIMATION
   Circular motion particle system with depth effect
=================================================================== */

class ParticleDust {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 150;
        this.mouse = { x: 0, y: 0 };

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();

        // Create particles with circular motion properties
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                // Position
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,

                // Circular motion
                angle: Math.random() * Math.PI * 2,
                radius: 100 + Math.random() * 300,
                centerX: this.canvas.width / 2,
                centerY: this.canvas.height / 2,

                // Movement
                speed: 0.0005 + Math.random() * 0.002,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,

                // Appearance
                size: 1 + Math.random() * 2,
                opacity: 0.2 + Math.random() * 0.5,

                // 3D depth
                z: Math.random() * 1000,

                // Color variation (white to cyan)
                color: Math.random() > 0.7 ? '#06b6d4' : '#ffffff'
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Full clear on resize to prevent dark buildup
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Mouse interaction
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    update() {
        this.particles.forEach(p => {
            // Circular motion around center
            p.angle += p.speed;

            // Calculate circular position
            const targetX = p.centerX + Math.cos(p.angle) * p.radius;
            const targetY = p.centerY + Math.sin(p.angle) * p.radius;

            // Smooth movement toward circular path
            p.x += (targetX - p.x) * 0.02;
            p.y += (targetY - p.y) * 0.02;

            // Add floating motion
            p.x += Math.sin(p.angle * 2) * 0.5;
            p.y += Math.cos(p.angle * 2) * 0.5;

            // Mouse repulsion effect
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.x -= dx * force * 0.5;
                p.y -= dy * force * 0.5;
            }

            // 3D depth oscillation
            p.z += Math.sin(p.angle) * 5;

            // Wrap particles
            if (p.x < -50) p.x = this.canvas.width + 50;
            if (p.x > this.canvas.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.canvas.height + 50;
            if (p.y > this.canvas.height + 50) p.y = -50;
        });
    }

    draw() {
        // Clear with lighter fade effect to prevent dark buildup
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sort by z-depth for 3D effect
        this.particles.sort((a, b) => a.z - b.z);

        this.particles.forEach(p => {
            // Calculate scale based on z-depth
            const scale = 1000 / (1000 + p.z);
            const size = p.size * scale;
            const opacity = p.opacity * scale;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color === '#06b6d4'
                ? `rgba(6, 182, 212, ${opacity})`
                : `rgba(255, 255, 255, ${opacity})`;
            this.ctx.fill();

            // Draw glow
            if (p.color === '#06b6d4') {
                this.ctx.shadowBlur = 10 * scale;
                this.ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });

        // Draw connecting lines for nearby particles
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    this.ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ParticleDust('particle-canvas');
});
