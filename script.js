/* ============================================================
   🌐 AVINASH WEB3 MAX ENGINE — PART 1
   CORE UTILITIES • NAVIGATION • SMOOTH SCROLL • FILTERS • UI
============================================================ */

(function () {
    'use strict';

    /* ============================================================
       SMALL UTILITY HELPERS
    ============================================================ */
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

    // Throttle (prevents scroll spam)
    const throttle = (fn, wait = 80) => {
        let last = 0;
        let timeout;
        return (...args) => {
            const now = Date.now();
            const remaining = wait - (now - last);

            if (remaining <= 0) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                last = now;
                fn(...args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    last = Date.now();
                    timeout = null;
                    fn(...args);
                }, remaining);
            }
        };
    };

    /* ============================================================
       CORE INITIALIZATION
    ============================================================ */
    document.addEventListener("DOMContentLoaded", () => {
        console.log("⚡ WEB3 MAX ENGINE LOADED — PART 1");

        const navbar = $("#navbar");
        const navToggle = $("#navToggle");
        const navMenu = $("#navMenu");
        const navLinks = $$(".nav-link");
        const backToTop = $("#backToTop");
        const sections = $$("section[id]");
        const filterButtons = $$(".filter-btn");
        const projectCards = $$(".project-card");
        const statBlocks = $$(".stat");
        const yearElements = $$(".current-year");

        /* ============================================================
           FOOTER YEAR AUTO-UPDATE
        ============================================================ */
        if (yearElements.length) {
            const y = new Date().getFullYear();
            yearElements.forEach(el => el.textContent = y);
        }

        /* ============================================================
           MOBILE NAVIGATION TOGGLE
        ============================================================ */
        if (navToggle && navMenu) {
            navToggle.addEventListener("click", e => {
                e.stopPropagation();
                navMenu.classList.toggle("active");

                const spans = navToggle.querySelectorAll("span");
                if (spans.length === 3) {
                    if (navMenu.classList.contains("active")) {
                        spans[0].style.transform = "rotate(45deg) translateY(8px)";
                        spans[1].style.opacity = "0";
                        spans[2].style.transform = "rotate(-45deg) translateY(-8px)";
                    } else {
                        spans[0].style.transform = "none";
                        spans[1].style.opacity = "1";
                        spans[2].style.transform = "none";
                    }
                }
            });

            // Close menu when clicking nav links
            navLinks.forEach(link => {
                link.addEventListener("click", () => {
                    navMenu.classList.remove("active");
                    const spans = navToggle.querySelectorAll("span");
                    spans.forEach(span => {
                        span.style.transform = "none";
                        span.style.opacity = "1";
                    });
                });
            });

            // Close when clicking outside
            document.addEventListener("click", e => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove("active");
                    const spans = navToggle.querySelectorAll("span");
                    spans.forEach(span => span.style.transform = "none");
                    if (spans[1]) spans[1].style.opacity = "1";
                }
            });
        }

        /* ============================================================
           SMOOTH SCROLL FOR ANCHORS
        ============================================================ */
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", e => {
                const id = anchor.getAttribute("href");
                if (!id || id === "#") return;

                const target = document.querySelector(id);
                if (!target) return;

                e.preventDefault();

                const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                const offset = target.offsetTop - 80;

                if (prefersReduced) {
                    window.scrollTo(0, offset);
                } else {
                    window.scrollTo({
                        top: offset,
                        behavior: "smooth"
                    });
                }
            });
        });

        /* ============================================================
           ACTIVE NAVIGATION + STICKY NAVBAR
        ============================================================ */
        const highlightNav = () => {
            let current = "";
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const top = section.offsetTop - 120;
                const height = section.offsetHeight;
                const id = section.getAttribute("id");

                if (scrollY >= top && scrollY < top + height) {
                    current = id;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${current}`) {
                    link.classList.add("active");
                }
            });
        };

        const handleNavbarScroll = () => {
            if (!navbar) return;
            navbar.classList.toggle("scrolled", window.scrollY > 50);
        };

        /* ============================================================
           BACK TO TOP BUTTON
        ============================================================ */
        if (backToTop) {
            backToTop.addEventListener("click", () => {
                const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                if (prefersReduced) {
                    window.scrollTo(0, 0);
                } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            });
        }

        const showBackToTop = () => {
            if (!backToTop) return;
            if (window.scrollY > 400) backToTop.classList.add("visible");
            else backToTop.classList.remove("visible");
        };

        /* ============================================================
           PROJECT FILTERS
        ============================================================ */
        if (filterButtons.length && projectCards.length) {
            filterButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    filterButtons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    const filter = btn.getAttribute("data-filter") || "all";

                    projectCards.forEach(card => {
                        const categories = card.getAttribute("data-category") || "";
                        if (filter === "all" || categories.includes(filter)) {
                            card.style.display = "flex";
                            card.classList.add("fadeIn");
                        } else {
                            card.style.display = "none";
                        }
                    });
                });
            });
        }

        /* ============================================================
           FADE-IN OBSERVER (REVEAL ON SCROLL)
        ============================================================ */
        const fadeElements = $$(".project-card, .expertise-card, .highlight-card, .tech-category, .contact-card");

        const fadeObserver = "IntersectionObserver" in window
            ? new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("fade-in-visible");
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 })
            : null;

        fadeElements.forEach(el => {
            el.classList.add("fade-in-init");
            if (fadeObserver) fadeObserver.observe(el);
            else el.classList.add("fade-in-visible");
        });

        /* ============================================================
           LAZY LOADING IMAGES
        ============================================================ */
        if ("IntersectionObserver" in window) {
            const imgObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute("data-src");
                        if (src) {
                            img.src = src;
                            img.onload = () => img.classList.add("loaded");
                            img.removeAttribute("data-src");
                        }
                        obs.unobserve(img);
                    }
                });
            }, { rootMargin: "100px 0px" });

            $$("img[data-src]").forEach(img => imgObserver.observe(img));
        }

        /* ============================================================
           STATS COUNTER
        ============================================================ */
        const animateCounter = (element, target, duration = 2200) => {
            let current = 0;
            const increment = target / (duration / 16);

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + "+";
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + "+";
                }
            }, 16);
        };

        if ("IntersectionObserver" in window) {
            const statsObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target.querySelector(".stat-number");
                        if (el && !el.classList.contains("animated")) {
                            const value = parseInt(el.textContent, 10);
                            animateCounter(el, value);
                            el.classList.add("animated");
                        }
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.45 });

            statBlocks.forEach(stat => statsObserver.observe(stat));
        }

        /* ============================================================
           GLOBAL SCROLL HANDLER (THROTTLED)
        ============================================================ */
        const onScroll = throttle(() => {
            handleNavbarScroll();
            highlightNav();
            showBackToTop();
        }, 80);

        window.addEventListener("scroll", onScroll);

        handleNavbarScroll();
        highlightNav();
        showBackToTop();

        document.body.classList.add("loaded");
    });
})();
/* ============================================================
   🌐 AVINASH WEB3 MAX ENGINE — PART 2
   PARTICLES • DUST • MATRIX • PARALLAX • CURSOR GLOW • WARP FX
============================================================ */

(function () {
    'use strict';

    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

    /* ============================================================
       1️⃣ PARTICLE BACKGROUND (HERO #particles)
    ============================================================ */

    function injectParticleStyles() {
        if (document.getElementById('particle-style-block')) return;

        const style = document.createElement('style');
        style.id = 'particle-style-block';
        style.textContent = `
            .particle {
                position: absolute;
                background: radial-gradient(circle, rgba(56, 182, 255, 0.85) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                animation: float-particle linear infinite;
            }

            @keyframes float-particle {
                0% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(var(--drift, 0px)) scale(0.6);
                    opacity: 0;
                }
            }

            .fade-in-init {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .fade-in-visible {
                opacity: 1;
                transform: translateY(0);
            }

            @keyframes slideUp {
                from { transform: translate(-50%, 20px); opacity: 0; }
                to   { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translate(-50%, 0); opacity: 1; }
                to   { transform: translate(-50%, 20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    function createHeroParticles() {
        const container = $('#particles');
        if (!container) return;

        injectParticleStyles();

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const particleCount = prefersReduced ? 20 : 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 1;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            const drift = (Math.random() * 120 - 60).toFixed(1) + 'px';

            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = delay + 's';
            particle.style.setProperty('--drift', drift);

            container.appendChild(particle);
        }
    }

    /* ============================================================
       2️⃣ WEB3 DUST FIELD (TINY FLOATING PARTICLES)
       Uses: <div id="dustLayer"></div> inside HERO
    ============================================================ */

    function createDustField() {
        let layer = document.getElementById('dustLayer');

        // If not present in HTML, create inside hero
        if (!layer) {
            const hero = document.getElementById('home');
            if (!hero) return;
            layer = document.createElement('div');
            layer.id = 'dustLayer';
            hero.appendChild(layer);
        }

        const style = document.createElement('style');
        style.textContent = `
            #dustLayer {
                position: absolute;
                inset: 0;
                pointer-events: none;
                overflow: hidden;
                z-index: 1;
            }
            .web3-dust {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255,255,255,0.7),
                    rgba(56,182,255,0.2),
                    transparent 70%
                );
                opacity: 0.4;
                animation-name: web3DustDrift;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
            }
            @keyframes web3DustDrift {
                0% {
                    transform: translate3d(0, 0, 0) scale(1);
                    opacity: 0;
                }
                10% {
                    opacity: 0.6;
                }
                80% {
                    opacity: 0.6;
                }
                100% {
                    transform: translate3d(var(--dust-drift, 0px), -120vh, 0) scale(0.4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const totalDust = prefersReduced ? 60 : 160;

        for (let i = 0; i < totalDust; i++) {
            const d = document.createElement('div');
            d.className = 'web3-dust';

            const size = Math.random() * 3 + 1;
            d.style.width = size + 'px';
            d.style.height = size + 'px';

            d.style.left = Math.random() * 100 + '%';
            d.style.top = Math.random() * 120 + '%';

            d.style.animationDuration = (14 + Math.random() * 18) + 's';
            d.style.animationDelay = (Math.random() * 12) + 's';

            d.style.setProperty('--dust-drift', (Math.random() * 140 - 70) + 'px');

            layer.appendChild(d);
        }
    }

    /* ============================================================
       3️⃣ MATRIX RAIN BACKGROUND (GLOBAL AI CODE STREAM)
    ============================================================ */

    function initMatrixBackground() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.id = 'web3-matrix';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.12';

        document.body.appendChild(canvas);

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        const letters = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);
        let drops = new Array(columns).fill(1);

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#38B6FF';
            ctx.font = fontSize + 'px monospace';

            drops.forEach((y, i) => {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, y * fontSize);

                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            });

            requestAnimationFrame(draw);
        }

        draw();
    }

    /* ============================================================
       4️⃣ GLOBAL PARTICLE FIELD LAYER (BEHIND CONTENT)
    ============================================================ */

    function initGlobalParticleField() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const layer = document.createElement('div');
        layer.className = 'web3-particles-layer';
        layer.style.position = 'fixed';
        layer.style.inset = '0';
        layer.style.pointerEvents = 'none';
        layer.style.zIndex = '1';
        layer.style.overflow = 'hidden';
        document.body.appendChild(layer);

        const style = document.createElement('style');
        style.textContent = `
            .web3-float-particle {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(56,182,255,0.5),
                    rgba(139,92,246,0.35),
                    transparent 70%
                );
                filter: blur(2px);
                animation: web3FloatUp linear infinite;
            }
            @keyframes web3FloatUp {
                0% {
                    transform: translate3d(0, 20vh, 0) scale(0.6);
                    opacity: 0;
                }
                20% {
                    opacity: 0.7;
                }
                80% {
                    opacity: 0.7;
                }
                100% {
                    transform: translate3d(0, -120vh, 0) scale(1.1);
                    opacity: 0;
                }
            }
            .section-light-active {
                box-shadow: 0 0 60px rgba(56,182,255,0.2);
                position: relative;
                z-index: 2;
            }
        `;
        document.head.appendChild(style);

        const count = 60;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'web3-float-particle';

            const size = Math.random() * 6 + 2;
            p.style.width = size + 'px';
            p.style.height = size + 'px';

            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';

            p.style.animationDuration = (10 + Math.random() * 20) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.opacity = (0.3 + Math.random() * 0.4).toString();

            layer.appendChild(p);
        }
    }

    /* ============================================================
       5️⃣ SECTION LIGHT SCROLL + HOLOGRAM TRIGGER
    ============================================================ */

    function initSectionLights() {
        const sections = $$('section');
        if (!sections.length || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-light-active');
                }
            });
        }, { threshold: 0.25 });

        sections.forEach(sec => observer.observe(sec));
    }

    function initHologramTriggers() {
        const holograms = $$('.web3-hologram');
        if (!holograms.length || !('IntersectionObserver' in window)) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('web3-hologram-active');
                }
            });
        }, { threshold: 0.3 });

        holograms.forEach(h => obs.observe(h));
    }

    /* ============================================================
       6️⃣ CYBER GRID BACKGROUND PARALLAX
       For elements with .web3-grid-bg
    ============================================================ */

    function initGridParallax() {
        const layers = $$('.web3-grid-bg');
        if (!layers.length) return;

        window.addEventListener('scroll', () => {
            const y = window.scrollY * 0.15;
            layers.forEach(layer => {
                layer.style.transform = `translateY(${y}px)`;
            });
        });
    }

    /* ============================================================
       7️⃣ CURSOR GLOW + TRAIL (NEON)
    ============================================================ */

    function initCursorGlow() {
        const finePointer = window.matchMedia('(pointer:fine)').matches;
        if (!finePointer) return;

        const glow = document.createElement('div');
        const trail = document.createElement('div');

        glow.className = 'web3-cursor-glow';
        trail.className = 'web3-cursor-glow-trail';

        const style = document.createElement('style');
        style.textContent = `
            .web3-cursor-glow,
            .web3-cursor-glow-trail {
                position: fixed;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9992;
                mix-blend-mode: screen;
            }
            .web3-cursor-glow {
                background: radial-gradient(circle,
                    rgba(56,182,255,0.9),
                    rgba(139,92,246,0.4),
                    transparent 70%
                );
                filter: blur(4px);
                transform: translate(-9999px, -9999px);
                transition: transform 0.08s linear;
            }
            .web3-cursor-glow-trail {
                background: radial-gradient(circle,
                    rgba(56,182,255,0.5),
                    transparent 70%
                );
                filter: blur(8px);
                transform: translate(-9999px, -9999px);
                transition: transform 0.18s linear;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(glow);
        document.body.appendChild(trail);

        let lastX = window.innerWidth / 2;
        let lastY = window.innerHeight / 2;

        document.addEventListener('pointermove', e => {
            const x = e.clientX;
            const y = e.clientY;

            glow.style.transform = `translate(${x - 7}px, ${y - 7}px)`;
            trail.style.transform = `translate(${lastX - 3}px, ${lastY - 3}px)`;

            lastX = x;
            lastY = y;
        });

        document.addEventListener('pointerdown', () => {
            glow.style.transform += ' scale(0.8)';
            setTimeout(() => {
                glow.style.transform = glow.style.transform.replace(' scale(0.8)', '');
            }, 120);
        });
    }

    /* ============================================================
       8️⃣ HEAT-WARP + SHOCKWAVE + TRAIL (AI WARP ENGINE)
    ============================================================ */

    function initWarpEngine() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        // Heat warp layer
        const heatWarpLayer = document.createElement('div');
        heatWarpLayer.id = 'ai-heat-warp';
        heatWarpLayer.style.position = 'fixed';
        heatWarpLayer.style.top = '0';
        heatWarpLayer.style.left = '0';
        heatWarpLayer.style.width = '100vw';
        heatWarpLayer.style.height = '100vh';
        heatWarpLayer.style.pointerEvents = 'none';
        heatWarpLayer.style.zIndex = '9985';
        heatWarpLayer.style.mixBlendMode = 'soft-light';
        heatWarpLayer.style.opacity = '0.25';
        document.body.appendChild(heatWarpLayer);

        document.addEventListener('mousemove', e => {
            heatWarpLayer.style.background = `
                radial-gradient(
                    350px circle at ${e.clientX}px ${e.clientY}px,
                    rgba(56,182,255,0.25),
                    transparent 70%
                )
            `;
        });

        // Shockwave on click
        const rippleCSS = document.createElement('style');
        rippleCSS.textContent = `
            .ai-shockwave {
                position: fixed;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid rgba(56,182,255,0.7);
                transform: scale(0);
                opacity: 1;
                pointer-events: none;
                animation: shockwaveExpand 0.7s ease-out forwards;
                z-index: 9995;
            }
            @keyframes shockwaveExpand {
                0%   { transform: scale(0); opacity: 1; }
                100% { transform: scale(8); opacity: 0; }
            }
            .ai-trail-node {
                position: fixed;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                pointer-events: none;
                mix-blend-mode: screen;
                background: rgba(56,182,255,0.45);
                filter: blur(6px);
                z-index: 9994;
            }
            .ai-warp-wave {
                position: absolute;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(56,182,255,0.35),
                    transparent 70%
                );
                filter: blur(20px);
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
            }
            .ai-warp-wave.active {
                opacity: 1;
            }
        `;
        document.head.appendChild(rippleCSS);

        document.addEventListener('click', e => {
            const r = document.createElement('div');
            r.className = 'ai-shockwave';
            r.style.left = e.clientX - 30 + 'px';
            r.style.top = e.clientY - 30 + 'px';
            document.body.appendChild(r);
            setTimeout(() => r.remove(), 700);
        });

        // Trailing nodes
        const trailCount = 10;
        const trails = [];
        for (let i = 0; i < trailCount; i++) {
            const node = document.createElement('div');
            node.className = 'ai-trail-node';
            node.style.opacity = (0.15 + i * 0.05).toString();
            document.body.appendChild(node);
            trails.push(node);
        }

        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;

        document.addEventListener('mousemove', e => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        function animateTrail() {
            let x = cursorX;
            let y = cursorY;

            trails.forEach((node, i) => {
                node.style.transform = `translate(${x}px, ${y}px)`;
                x += (cursorX - x) * (0.15 - i * 0.008);
                y += (cursorY - y) * (0.15 - i * 0.008);
            });

            requestAnimationFrame(animateTrail);
        }
        animateTrail();

        // Warp hover elements: .ai-warp
        const warpTargets = $$('.ai-warp');
        warpTargets.forEach(el => {
            el.style.position = 'relative';
            el.style.overflow = 'hidden';
            const wave = document.createElement('div');
            wave.className = 'ai-warp-wave';
            el.appendChild(wave);

            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                wave.style.left = (e.clientX - rect.left - 50) + 'px';
                wave.style.top = (e.clientY - rect.top - 50) + 'px';
                wave.classList.add('active');
            });

            el.addEventListener('mouseleave', () => {
                wave.classList.remove('active');
            });
        });
    }

    /* ============================================================
       9️⃣ KEYBOARD NAV + FOCUS ENHANCEMENT + THEME COLOR
    ============================================================ */

    function initKeyboardAndTheme() {
        // Keyboard helpers
        document.addEventListener('keydown', e => {
            const navMenu = $('#navMenu');

            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }

            if (e.key === 'Home' && !e.shiftKey) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (e.key === 'End' && !e.shiftKey) {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });

        // Focus visible enhancement
        let usingMouse = false;
        document.addEventListener('mousedown', () => { usingMouse = true; });
        document.addEventListener('keydown', () => { usingMouse = false; });
        document.addEventListener('focusin', e => {
            if (!(e.target instanceof HTMLElement)) return;
            if (usingMouse) {
                e.target.classList.add('mouse-focus');
            } else {
                e.target.classList.remove('mouse-focus');
            }
        });

        // Dynamic theme-color for mobile browser UI
        function updateThemeColor() {
            const scrolled = window.pageYOffset;
            let meta = document.querySelector('meta[name="theme-color"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'theme-color';
                meta.content = '#0a0e27';
                document.head.appendChild(meta);
            }
            meta.content = scrolled > 50 ? '#050711' : '#0a0e27';
        }

        window.addEventListener('scroll', updateThemeColor);
        updateThemeColor();
    }

    /* ============================================================
       🔟 PERFORMANCE LOGGING + REDUCED MOTION
    ============================================================ */

    window.addEventListener('load', () => {
        const loadTime = Math.round(performance.now());
        console.log(`⚡ Page interactive in ~${loadTime}ms`);

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            document.documentElement.style.scrollBehavior = 'auto';
            console.log('♿ Reduced motion mode respected');
        }
    });

    /* ============================================================
       🔁 DOM READY BOOTSTRAP
    ============================================================ */

    function boot() {
        createHeroParticles();
        createDustField();
        initMatrixBackground();
        initGlobalParticleField();
        initSectionLights();
        initHologramTriggers();
        initGridParallax();/* ============================================================
   🌐 AVINASH WEB3 MAX ENGINE — PART 3
   HOLOGRAM • SHINE • 3D TILT • MAGNETIC • PRESS RIPPLE • CHATBOT
============================================================ */

(function () {
    'use strict';

    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

    /* ============================================================
       1️⃣ HOLOGRAM REFRACTION + GLOW
       Classes:
         - .web3-hologram
         - .web3-neon-frame
    ============================================================ */

    function initHologramRefraction() {
        const holograms = $$('.web3-hologram');

        holograms.forEach(holo => {
            holo.style.transformStyle = 'preserve-3d';
            holo.style.willChange = 'transform';

            holo.addEventListener('mousemove', e => {
                const rect = holo.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const moveX = (x - centerX) / 20;
                const moveY = (y - centerY) / 20;

                holo.style.transform =
                    `translateY(-6px) rotateX(${ -moveY }deg) rotateY(${ moveX }deg) scale(1.03)`;

                holo.style.setProperty('--holo-x', x + 'px');
                holo.style.setProperty('--holo-y', y + 'px');
            });

            holo.addEventListener('mouseleave', () => {
                holo.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
            });

            holo.addEventListener('mouseenter', () => {
                holo.classList.add('holo-pulse');
            });
            holo.addEventListener('mouseleave', () => {
                holo.classList.remove('holo-pulse');
            });
        });

        const style = document.createElement('style');
        style.textContent = `
            .web3-hologram {
                position: relative;
                overflow: hidden;
                background:
                    radial-gradient(circle at var(--holo-x, 50%) var(--holo-y, 0%),
                        rgba(56,182,255,0.25),
                        transparent 60%
                    ),
                    linear-gradient(135deg, rgba(56,182,255,0.15), rgba(139,92,246,0.15));
                box-shadow:
                    0 0 0 1px rgba(56,182,255,0.22),
                    0 0 40px rgba(56,182,255,0.35);
                transition:
                    transform 0.18s ease-out,
                    box-shadow 0.25s ease-out,
                    background 0.25s ease-out;
            }
            .web3-hologram::after {
                content: '';
                position: absolute;
                inset: -40%;
                background: conic-gradient(
                    from 180deg,
                    rgba(56,182,255,0.0),
                    rgba(56,182,255,0.25),
                    rgba(139,92,246,0.35),
                    rgba(56,182,255,0.0)
                );
                mix-blend-mode: screen;
                opacity: 0;
                transition: opacity 0.35s ease-out;
                pointer-events: none;
            }
            .web3-hologram.holo-pulse::after {
                opacity: 1;
                animation: holoSweep 2.6s linear infinite;
            }
            @keyframes holoSweep {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .web3-glow-boost {
                box-shadow:
                    0 0 0 1px rgba(56,182,255,0.35),
                    0 0 60px rgba(56,182,255,0.55);
            }
            .web3-neon-frame {
                position: relative;
                border-radius: 18px;
                overflow: hidden;
                box-shadow:
                    0 0 0 1px rgba(56,182,255,0.35),
                    0 0 30px rgba(56,182,255,0.35);
            }
        `;
        document.head.appendChild(style);

        const glowTargets = $$('.web3-hologram, .web3-neon-frame');
        if ('IntersectionObserver' in window && glowTargets.length) {
            const obs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('web3-glow-boost');
                    }
                });
            }, { threshold: 0.4 });

            glowTargets.forEach(t => obs.observe(t));
        }

        console.log('🌐 Hologram refraction initialized');
    }

    /* ============================================================
       2️⃣ SHINE TRACKING BEAM
       Class: .web3-shine
    ============================================================ */

    function initShineTracking() {
        const shineEls = $$('.web3-shine');
        if (!shineEls.length) return;

        const style = document.createElement('style');
        style.textContent = `
            .web3-shine {
                position: relative;
                overflow: hidden;
            }
            .web3-shine::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                width: 80px;
                transform: translateX(calc(var(--shine-pos, -100px) - 40px)) skewX(-20deg);
                background: linear-gradient(
                    to right,
                    transparent,
                    rgba(255,255,255,0.12),
                    rgba(255,255,255,0.3),
                    transparent
                );
                mix-blend-mode: screen;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.25s ease-out;
            }
            .web3-shine:hover::before {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        shineEls.forEach(el => {
            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                el.style.setProperty('--shine-pos', x + 'px');
            });
        });
    }

    /* ============================================================
       3️⃣ 3D GRID PANELS
       Class: .web3-grid-panel
    ============================================================ */

    function initGridPanels() {
        const panels = $$('.web3-grid-panel');
        if (!panels.length) return;

        panels.forEach(panel => {
            const perspective = parseFloat(panel.getAttribute('data-grid-perspective')) || 900;

            panel.style.transformStyle = 'preserve-3d';
            panel.style.willChange = 'transform';

            panel.addEventListener('mousemove', e => {
                const rect = panel.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                const rotateX = -y * 6;
                const rotateY = x * 6;

                panel.style.transform =
                    `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            panel.addEventListener('mouseleave', () => {
                panel.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
            });
        });
    }

    /* ============================================================
       4️⃣ FLOATING LABELS
       Class: .web3-float
    ============================================================ */

    function initFloatLabels() {
        const floaters = $$('.web3-float');
        if (!floaters.length) return;

        const style = document.createElement('style');
        style.textContent = `
            .web3-float {
                transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
            }
            .web3-float:hover {
                transform: translateY(-8px);
                box-shadow: 0 12px 30px rgba(0,0,0,0.35);
            }
        `;
        document.head.appendChild(style);
    }

    /* ============================================================
       5️⃣ MAGNETIC BUTTONS + PRESS RIPPLE + 3D TILT
       Classes:
         - .web3-magnetic [data-magnetic-strength]
         - .web3-press
         - .web3-tilt / .web3-hover-parallax
    ============================================================ */

    function initMagneticButtons() {
        const magneticElements = $$('.web3-magnetic');
        if (!magneticElements.length) return;

        magneticElements.forEach(el => {
            const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;

            el.style.willChange = 'transform';

            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const relX = e.clientX - rect.left;
                const relY = e.clientY - rect.top;

                const moveX = (relX - rect.width / 2) * strength / 10;
                const moveY = (relY - rect.height / 2) * strength / 10;

                el.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0,0) scale(1)';
            });
        });
    }

    function initPressRipple() {
        const pressElements = $$('.web3-press');
        if (!pressElements.length) return;

        const style = document.createElement('style');
        style.textContent = `
            .web3-press {
                position: relative;
                overflow: hidden;
            }
            .web3-press::after {
                content: '';
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255,255,255,0.55),
                    transparent 70%
                );
                transform: translate(-50%, -50%) scale(0);
                pointer-events: none;
                opacity: 0;
            }
            .web3-press.ripple-active::after {
                animation: web3PressRipple 0.5s ease-out;
            }
            @keyframes web3PressRipple {
                0% {
                    opacity: 0.8;
                    transform: translate(-50%, -50%) scale(0);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(8);
                }
            }
        `;
        document.head.appendChild(style);

        pressElements.forEach(el => {
            el.addEventListener('pointerdown', e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.setProperty('--x', x + 'px');
                el.style.setProperty('--y', y + 'px');

                const after = window.getComputedStyle(el, '::after');
                // Force position through CSS vars
                el.style.setProperty('--ripple-x', x + 'px');
                el.style.setProperty('--ripple-y', y + 'px');

                el.style.setProperty('--ripple-x', x + 'px');

                el.style.setProperty('--ripple-x', x + 'px');
                el.style.setProperty('--ripple-y', y + 'px');

                el.style.setProperty('--x', x + 'px');
                el.style.setProperty('--y', y + 'px');

                el.style.setProperty('--x', x + 'px');
                el.style.setProperty('--y', y + 'px');

                el.style.setProperty('--x', x + 'px');
                el.style.setProperty('--y', y + 'px');

                el.classList.remove('ripple-active');
                // Force reflow
                void el.offsetWidth;
                el.classList.add('ripple-active');
            });
        });
    }

    function initTiltCards() {
        const tiltElements = $$('.web3-tilt, .web3-hover-parallax');
        if (!tiltElements.length) return;

        tiltElements.forEach(card => {
            const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 10;
            const perspective = parseFloat(card.getAttribute('data-tilt-perspective')) || 800;

            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';

            function handleMove(e) {
                const rect = card.getBoundingClientRect();
                const relX = e.clientX - rect.left;
                const relY = e.clientY - rect.top;

                const percentX = (relX / rect.width) - 0.5;
                const percentY = (relY / rect.height) - 0.5;

                const rotateY = percentX * maxTilt;
                const rotateX = -percentY * maxTilt;

                card.style.transform =
                    `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
            }

            function resetTilt() {
                card.style.transform =
                    `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
            }

            card.addEventListener('mousemove', handleMove);
            card.addEventListener('mouseleave', resetTilt);
        });
    }

    /* ============================================================
       6️⃣ AVINASH AI DIGITAL TWIN — CHATBOT
       HTML IDs:
         - #ai-chat-button
         - #ai-chat-window
         - #ai-chat-close
         - #ai-chat-messages
         - #ai-chat-input
         - #ai-chat-send
    ============================================================ */

    function sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatMessage(text) {
        let safe = sanitizeText(text);
        safe = safe
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        return safe;
    }

    function initChatbot() {
        const aiChatButton = $('#ai-chat-button');
        const aiChatWindow = $('#ai-chat-window');
        const aiChatClose = $('#ai-chat-close');
        const aiChatMessages = $('#ai-chat-messages');
        const aiChatInput = $('#ai-chat-input');
        const aiChatSend = $('#ai-chat-send');

        const API_URL = 'https://avinashanalytics-avinash-chatbot.hf.space/chat';

        let conversationHistory = [];
        let isLoading = false;

        if (!aiChatButton || !aiChatWindow || !aiChatMessages || !aiChatInput || !aiChatSend) {
            console.warn('⚠️ Chatbot elements missing in DOM – please check IDs');
            return;
        }

        function scrollMessagesToBottom(smooth = true) {
            aiChatMessages.scrollTo({
                top: aiChatMessages.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }

        function addMessage(text, className) {
            const bubble = document.createElement('div');
            bubble.className = className;
            bubble.innerHTML = formatMessage(text);
            aiChatMessages.appendChild(bubble);
            requestAnimationFrame(() => scrollMessagesToBottom(true));
        }

        function showTyping() {
            if ($('#typing-indicator')) return;
            const indicator = document.createElement('div');
            indicator.className = 'ai-msg typing-indicator';
            indicator.id = 'typing-indicator';
            indicator.innerHTML = `
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            `;
            aiChatMessages.appendChild(indicator);
            scrollMessagesToBottom(false);
        }

        function removeTyping() {
            const indicator = $('#typing-indicator');
            if (indicator) indicator.remove();
        }

        function setChatVisible(visible) {
            aiChatWindow.style.display = visible ? 'flex' : 'none';
            if (visible) {
                setTimeout(() => aiChatInput.focus(), 100);
            }
        }

        async function sendAIMessage() {
            const rawMsg = aiChatInput.value.trim();
            if (!rawMsg || isLoading) return;

            if (!navigator.onLine) {
                addMessage('⚠️ You appear to be offline. Please check your internet connection and try again.', 'ai-msg');
                return;
            }

            aiChatInput.value = '';
            addMessage(rawMsg, 'user-msg');

            conversationHistory.push({ role: 'user', content: rawMsg });

            isLoading = true;
            showTyping();

            try {
                await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

                const payload = {
                    text: rawMsg,
                    conversation_history: conversationHistory.slice(-10)
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                removeTyping();

                const reply = data.reply || 'Sorry, I could not process that request.';
                addMessage(reply, 'ai-msg');

                conversationHistory.push({ role: 'assistant', content: reply });
                if (conversationHistory.length > 20) {
                    conversationHistory = conversationHistory.slice(-20);
                }

            } catch (error) {
                console.error('❌ Chat error:', error);
                removeTyping();

                let errorMessage = '⚠️ Oops! Something went wrong. ';
                const msg = String(error.message || '');

                if (msg.includes('422')) {
                    errorMessage += 'The request format seems off. Please try again.';
                } else if (msg.includes('500')) {
                    errorMessage += 'Server error. Please try again in a moment.';
                } else if (msg.includes('503')) {
                    errorMessage += 'The model might be waking up. Please wait a bit and retry.';
                } else if (msg.includes('Failed to fetch')) {
                    errorMessage += 'Network error. Check your internet connection.';
                } else {
                    errorMessage += 'Please try again shortly.';
                }

                addMessage(errorMessage, 'ai-msg');
            } finally {
                isLoading = false;
            }
        }

        // Button toggle
        aiChatButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = aiChatWindow.style.display === 'flex';
            setChatVisible(!isOpen);

            aiChatButton.style.transform = 'scale(0.9)';
            setTimeout(() => {
                aiChatButton.style.transform = 'scale(1)';
            }, 150);
        });

        // Close button
        if (aiChatClose) {
            aiChatClose.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                setChatVisible(false);
            });
        }

        // Send button
        aiChatSend.addEventListener('click', e => {
            e.preventDefault();
            sendAIMessage();
        });

        // Enter key
        aiChatInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });

        // Click outside to close
        document.addEventListener('click', e => {
            if (aiChatWindow.style.display !== 'flex') return;
            const clickInside = aiChatWindow.contains(e.target) || aiChatButton.contains(e.target);
            if (!clickInside) {
                setChatVisible(false);
            }
        });

        // Initial welcome
        addMessage('👋 Hey there! I\'m Avinash\'s AI assistant. Ask me anything about his skills, projects, or experience!', 'ai-msg');

        // Debug helpers
        window.clearAvinashChat = function () {
            conversationHistory = [];
            aiChatMessages.innerHTML = '';
            addMessage('🔄 Chat cleared! How can I help you?', 'ai-msg');
        };

        window.testAvinashAPI = async function () {
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: 'Hello, who are you?',
                        conversation_history: []
                    })
                });
                const data = await res.json();
                console.log('✅ API Test:', data);
                return data;
            } catch (err) {
                console.error('❌ API Test Failed:', err);
                return null;
            }
        };

        console.log('✅ Avinash AI Digital Twin chatbot initialized');
    }

    /* ============================================================
       🔁 BOOTSTRAP
    ============================================================ */

    function bootPart3() {
        initHologramRefraction();
        initShineTracking();
        initGridPanels();
        initFloatLabels();
        initMagneticButtons();
        initPressRipple();
        initTiltCards();
        initChatbot();
        console.log('✅ WEB3 MAX ENGINE — PART 3 INITIALIZED');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootPart3);
    } else {
        bootPart3();
    }
})();

        initCursorGlow();
        initWarpEngine();
        initKeyboardAndTheme();

        console.log('✅ WEB3 MAX ENGINE — PART 2 INITIALIZED');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
