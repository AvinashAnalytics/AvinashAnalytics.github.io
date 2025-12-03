/* =====================================================
   AVINASH RAI - DATA ENGINEER PORTFOLIO
   PART 1: CORE UTILITIES, NAV, SCROLL, FILTERS, ANALYTICS
===================================================== */

(function () {
    'use strict';

    /* ============================
       SMALL UTILITY HELPERS
    ============================ */
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

    // Throttle helper for scroll handlers
    const throttle = (fn, wait = 100) => {
        let last = 0;
        let timeout;
        return function (...args) {
            const now = Date.now();
            const remaining = wait - (now - last);

            if (remaining <= 0) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                last = now;
                fn.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    last = Date.now();
                    timeout = null;
                    fn.apply(this, args);
                }, remaining);
            }
        };
    };

    /* =====================================================
       MAIN INITIALIZATION
    ====================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Portfolio DOM loaded — initializing core features');

        // Core DOM references
        const navbar = $('#navbar');
        const navToggle = $('#navToggle');
        const navMenu = $('#navMenu');
        const navLinks = $$('.nav-link');
        const backToTopButton = $('#backToTop');
        const sections = $$('section[id]');
        const filterButtons = $$('.filter-btn');
        const projectCards = $$('.project-card');
        const statBlocks = $$('.stat');
        const yearElements = $$('.current-year');

        /* ============================
           FOOTER CURRENT YEAR
        ============================ */
        if (yearElements.length) {
            const currentYear = new Date().getFullYear();
            yearElements.forEach(el => {
                el.textContent = currentYear;
            });
        }

        /* ============================
           MOBILE MENU TOGGLE
        ============================ */
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');

                const spans = navToggle.querySelectorAll('span');
                if (spans.length === 3) {
                    if (navMenu.classList.contains('active')) {
                        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                        spans[1].style.opacity = '0';
                        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
                    } else {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            });

            // Close mobile menu when clicking a nav link
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    const spans = navToggle.querySelectorAll('span');
                    if (spans.length === 3) {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                });
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu) return;
                if (navToggle && (navToggle === e.target || navToggle.contains(e.target))) return;
                if (navMenu === e.target || navMenu.contains(e.target)) return;

                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const spans = navToggle.querySelectorAll('span');
                    if (spans.length === 3) {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            });
        }

        /* ============================
           SMOOTH SCROLL FOR ANCHORS
        ============================ */
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const offsetTop = target.offsetTop - 80;

                if (prefersReducedMotion) {
                    window.scrollTo(0, offsetTop);
                } else {
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        /* ============================
           STICKY NAVBAR & ACTIVE LINK
        ============================ */
        const highlightNav = () => {
            if (!sections.length || !navLinks.length) return;
            const scrollY = window.pageYOffset;
            let currentId = '';

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 120; // adjust for navbar
                const id = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentId = id;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        };

        const handleNavbarScroll = () => {
            if (!navbar) return;
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        /* ============================
           BACK TO TOP BUTTON
        ============================ */
        const handleBackToTopScroll = () => {
            if (!backToTopButton) return;
            if (window.pageYOffset > 400) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        };

        if (backToTopButton) {
            backToTopButton.addEventListener('click', () => {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (prefersReducedMotion) {
                    window.scrollTo(0, 0);
                } else {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        }

        /* ============================
           PROJECT FILTERS
        ============================ */
        if (filterButtons.length && projectCards.length) {
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    const filterValue = button.getAttribute('data-filter') || 'all';

                    projectCards.forEach(card => {
                        const categories = card.getAttribute('data-category') || '';
                        if (filterValue === 'all' || categories.includes(filterValue)) {
                            card.style.display = 'flex';
                            card.style.animation = 'fadeIn 0.5s ease-in';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }

        /* ============================
           FADE-IN OBSERVER
        ============================ */
        const fadeInObserverOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const fadeInObserver = 'IntersectionObserver' in window
            ? new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.classList.add('fade-in-visible');
                        observer.unobserve(el);
                    }
                });
            }, fadeInObserverOptions)
            : null;

        const animatedElements = $$('.project-card, .expertise-card, .highlight-card, .tech-category, .contact-card');
        animatedElements.forEach(el => {
            // Initial state via class; actual styles in CSS (recommended)
            el.classList.add('fade-in-init');
            if (fadeInObserver) {
                fadeInObserver.observe(el);
            } else {
                // Fallback if IntersectionObserver not supported
                el.classList.add('fade-in-visible');
            }
        });

        /* ============================
           LAZY LOADING IMAGES
        ============================ */
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const dataSrc = img.getAttribute('data-src');
                        if (dataSrc) {
                            img.src = dataSrc;
                            img.onload = () => img.classList.add('loaded');
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '100px 0px' });

            $$('img[data-src]').forEach(img => imageObserver.observe(img));
        }

        /* ============================
           COPY EMAIL TO CLIPBOARD (Ctrl+Click mailto)
        ============================ */
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #38B6FF 0%, #8B5CF6 100%);
                color: white;
                padding: 0.9rem 1.8rem;
                border-radius: 999px;
                font-weight: 600;
                font-size: 0.9rem;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                z-index: 10000;
                animation: slideUp 0.25s ease-out;
            `;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideDown 0.25s ease-in';
                setTimeout(() => notification.remove(), 230);
            }, 2000);
        }

        function copyToClipboard(text) {
            if (!navigator.clipboard) {
                console.warn('Clipboard API not available');
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Email copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }

        $$('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const email = (link.getAttribute('href') || '').replace('mailto:', '');
                    if (email) {
                        copyToClipboard(email);
                    }
                }
            });
        });

        /* ============================
           STATS COUNTER ANIMATION
        ============================ */
        function animateCounter(element, target, duration = 2000) {
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + '+';
                }
            }, 16);
        }

        if ('IntersectionObserver' in window && statBlocks.length) {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const statNumber = entry.target.querySelector('.stat-number');
                        if (statNumber && !statNumber.classList.contains('animated')) {
                            const parsed = parseInt(statNumber.textContent, 10);
                            const target = isNaN(parsed) ? 0 : parsed;
                            animateCounter(statNumber, target);
                            statNumber.classList.add('animated');
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            statBlocks.forEach(stat => statsObserver.observe(stat));
        }

        /* ============================
           EXTERNAL LINK SECURITY
        ============================ */
        $$('a[target="_blank"]').forEach(link => {
            const rel = (link.getAttribute('rel') || '').toLowerCase();
            if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        /* ============================
           ANALYTICS EVENT TRACKING
        ============================ */
        function trackEvent(category, action, label) {
            if (typeof gtag === 'function') {
                gtag('event', action, {
                    event_category: category,
                    event_label: label
                });
            }
            console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
        }

        // Track project clicks
        $$('.project-link').forEach(link => {
            link.addEventListener('click', () => {
                const card = link.closest('.project-card');
                const projectName = card ? (card.querySelector('h3')?.textContent || 'Unknown Project') : 'Unknown Project';
                trackEvent('Projects', 'Click', projectName.trim());
            });
        });

        // Track social clicks
        $$('.social-icon, .social-link').forEach(link => {
            link.addEventListener('click', () => {
                const platform = link.getAttribute('title') || link.textContent.trim() || 'Social Link';
                trackEvent('Social', 'Click', platform);
            });
        });

        // Track CTA buttons
        $$('.btn').forEach(button => {
            button.addEventListener('click', () => {
                const label = button.textContent.trim() || 'Button';
                trackEvent('CTA', 'Click', label);
            });
        });

        /* ============================
           GLOBAL SCROLL HANDLER (THROTTLED)
        ============================ */
        const onScroll = throttle(() => {
            handleNavbarScroll();
            highlightNav();
            handleBackToTopScroll();
            // parallaxScroll(); // will be defined in Part 2 (optional)
            // updateThemeColor() is defined in Part 2 and also attached on scroll there
        }, 80);

        window.addEventListener('scroll', onScroll);

        // Initial run
        handleNavbarScroll();
        highlightNav();
        handleBackToTopScroll();

        // Mark page as loaded for CSS transitions
        document.body.classList.add('loaded');
    });
})();
/* =====================================================
   PART 2: PARTICLES, PERFORMANCE, KEYBOARD, THEME, PWA
===================================================== */

(function () {
    'use strict';

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

    /* ============================
       PARTICLES BACKGROUND
    ============================ */
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

            /* Fade-in helper classes */
            .fade-in-init {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .fade-in-visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Simple notification animation */
            @keyframes slideUp {
                from { transform: translate(-50%, 20px); opacity: 0; }
                to   { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translate(-50%, 0); opacity: 1; }
                to   { transform: translate(-50%, 20px); opacity: 0; }
            }

            /* Back-to-top visibility helper (optional if you use it in CSS) */
            .back-to-top.visible {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    function createParticles() {
        const particlesContainer = $('#particles');
        if (!particlesContainer) return;

        injectParticleStyles();

        const particleCount = 50;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const actualCount = prefersReducedMotion ? 20 : particleCount;

        for (let i = 0; i < actualCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';

            // Random size
            const size = Math.random() * 4 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            // Random animation duration
            const duration = Math.random() * 20 + 10;
            particle.style.animationDuration = duration + 's';

            // Random delay
            const delay = Math.random() * 5;
            particle.style.animationDelay = delay + 's';

            // Random horizontal drift set via CSS variable
            const drift = (Math.random() * 120 - 60).toFixed(1) + 'px';
            particle.style.setProperty('--drift', drift);

            particlesContainer.appendChild(particle);
        }
    }

    /* ============================
       PARALLAX SCROLL (OPTIONAL)
    ============================ */
    // This function is referenced in Part 1's scroll handler (commented there).
    function parallaxScroll() {
        const scrolled = window.pageYOffset;
        const parallaxElements = $$('[data-parallax]');
        parallaxElements.forEach(el => {
            const speedAttr = el.getAttribute('data-parallax');
            const speed = speedAttr ? parseFloat(speedAttr) : 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }
    // If you want to enable parallax globally:
    // window.addEventListener('scroll', parallaxScroll);

    /* ============================
       PERFORMANCE MONITORING
    ============================ */
    window.addEventListener('load', () => {
        // Approximate load time using Performance API (modern way)
        const loadTime = Math.round(performance.now());
        console.log(`⚡ Page interactive in ~${loadTime}ms`);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.documentElement.style.scrollBehavior = 'auto';
            console.log('♿ Reduced motion mode respected');
        }
    });

    /* ============================
       KEYBOARD NAVIGATION EXTRAS
    ============================ */
    document.addEventListener('keydown', (e) => {
        const navMenu = $('#navMenu');

        // ESC closes mobile nav
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }

        // Home / End scroll helpers
        if (e.key === 'Home' && !e.shiftKey) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (e.key === 'End' && !e.shiftKey) {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });

    /* ============================
       FOCUS VISIBLE ENHANCEMENT
    ============================ */
    document.addEventListener('DOMContentLoaded', () => {
        let usingMouse = false;

        document.addEventListener('mousedown', () => {
            usingMouse = true;
        });

        document.addEventListener('keydown', () => {
            usingMouse = false;
        });

        document.addEventListener('focusin', (e) => {
            if (!(e.target instanceof HTMLElement)) return;
            if (usingMouse) {
                e.target.classList.add('mouse-focus');
            } else {
                e.target.classList.remove('mouse-focus');
            }
        });
    });

    /* ============================
       THEME COLOR META (MOBILE UI)
    ============================ */
    function updateThemeColor() {
        const scrolled = window.pageYOffset;
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            metaThemeColor.content = '#0a0e27';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = scrolled > 50 ? '#050711' : '#0a0e27';
    }

    window.addEventListener('scroll', updateThemeColor);
    document.addEventListener('DOMContentLoaded', updateThemeColor);

    /* ============================
       CONSOLE EASTER EGG
    ============================ */
    console.log('%c👋 Hello, Fellow Developer!', 'font-size: 24px; font-weight: bold; color: #38B6FF;');
    console.log('%c🚀 Thanks for checking out my portfolio!', 'font-size: 16px; color: #FF6B9D;');
    console.log('%c📧 Let\'s connect: masteravinashrai@gmail.com', 'font-size: 14px; color: #00D9A3;');
    console.log('%c💼 LinkedIn: linkedin.com/in/avinashanalytics', 'font-size: 14px; color: #8892a6;');
    console.log('%c⭐ GitHub: github.com/AvinashAnalytics', 'font-size: 14px; color: #8892a6;');
    console.log('%c\n🎨 Built with vanilla JavaScript, CSS, and lots of ☕', 'font-size: 12px; font-style: italic; color: #b8c5d6;');

    /* ============================
       SERVICE WORKER REGISTRATION (PWA)
    ============================ */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Uncomment and place a valid sw.js at root to enable PWA support
            /*
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ Service Worker registered', reg.scope))
                .catch(err => console.log('❌ Service Worker registration failed', err));
            */
        });
    }

    /* ============================
       INIT PARTICLES AFTER DOM
    ============================ */
    document.addEventListener('DOMContentLoaded', () => {
        // Use requestIdleCallback if available to not block main thread
        if ('requestIdleCallback' in window) {
            requestIdleCallback(createParticles);
        } else {
            setTimeout(createParticles, 200);
        }
    });

    // Expose optional functions globally if you ever want to call from console
    window._AvinashEffects = {
        createParticles,
        parallaxScroll,
        updateThemeColor
    };
})();
/* =====================================================
   PART 3: 🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   PRODUCTION-READY VERSION (SECURE + OPTIMIZED)
===================================================== */

(function () {
    'use strict';

    function sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatMessage(text) {
        // Basic markdown-style formatting on ALREADY-SANITIZED text
        let safe = sanitizeText(text);

        safe = safe
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        return safe;
    }

    function initChatbot() {
        const aiChatButton = document.getElementById('ai-chat-button');
        const aiChatWindow = document.getElementById('ai-chat-window');
        const aiChatClose = document.getElementById('ai-chat-close');
        const aiChatMessages = document.getElementById('ai-chat-messages');
        const aiChatInput = document.getElementById('ai-chat-input');
        const aiChatSend = document.getElementById('ai-chat-send');

        // Hugging Face Space endpoint (ensure CORS is enabled there)
        const API_URL = 'https://avinashanalytics-avinash-chatbot.hf.space/chat';

        let conversationHistory = [];
        let isLoading = false;

        console.log('🤖 Chatbot DOM check:', {
            button: !!aiChatButton,
            window: !!aiChatWindow,
            close: !!aiChatClose,
            messages: !!aiChatMessages,
            input: !!aiChatInput,
            send: !!aiChatSend,
            API_URL
        });

        if (!aiChatButton || !aiChatWindow || !aiChatMessages) {
            console.error('❌ Chatbot critical elements missing. Check HTML markup.');
            return;
        }

        /* ============================
           UI HELPERS
        ============================ */
        function scrollMessagesToBottom(smooth = true) {
            if (!aiChatMessages) return;
            aiChatMessages.scrollTo({
                top: aiChatMessages.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }

        function addMessage(text, className) {
            if (!aiChatMessages) return;
            const bubble = document.createElement('div');
            bubble.className = className;
            bubble.innerHTML = formatMessage(text);
            aiChatMessages.appendChild(bubble);
            requestAnimationFrame(() => scrollMessagesToBottom(true));
        }

        function showTyping() {
            if (!aiChatMessages) return;
            if (document.getElementById('typing-indicator')) return;

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
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
        }

        function setChatVisible(visible) {
            if (!aiChatWindow) return;
            aiChatWindow.style.display = visible ? 'flex' : 'none';
            if (visible && aiChatInput) {
                setTimeout(() => aiChatInput.focus(), 100);
            }
        }

        /* ============================
           SEND MESSAGE LOGIC
        ============================ */
        async function sendAIMessage() {
            if (!aiChatInput) return;

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
                // Small delay for more human-like feeling
                await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

                const payload = {
                    text: rawMsg,
                    conversation_history: conversationHistory.slice(-10)
                };

                console.log('📤 Sending to API:', payload);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                console.log('📡 API status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ API Error Response:', errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log('📥 API data:', data);

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

        /* ============================
           EVENT LISTENERS
        ============================ */
        aiChatButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = aiChatWindow.style.display === 'flex';
            setChatVisible(!isOpen);

            aiChatButton.style.transform = 'scale(0.9)';
            setTimeout(() => {
                aiChatButton.style.transform = 'scale(1)';
            }, 150);
        });

        if (aiChatClose) {
            aiChatClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setChatVisible(false);
                console.log('❌ Chat closed via close button');
            });
        }

        if (aiChatSend) {
            aiChatSend.addEventListener('click', (e) => {
                e.preventDefault();
                sendAIMessage();
            });
        }

        if (aiChatInput) {
            aiChatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendAIMessage();
                }
            });
        }

        // Close chat when clicking outside (optional)
        document.addEventListener('click', (e) => {
            if (!aiChatWindow || aiChatWindow.style.display !== 'flex') return;
            const clickInside = aiChatWindow.contains(e.target) || aiChatButton.contains(e.target);
            if (!clickInside) {
                setChatVisible(false);
            }
        });

        /* ============================
           INITIAL WELCOME MESSAGE
        ============================ */
        addMessage('👋 Hey there! I\'m Avinash\'s AI assistant. Ask me anything about his skills, projects, or experience!', 'ai-msg');

        /* ============================
           GLOBAL DEBUG HELPERS
        ============================ */
        window.clearAvinashChat = function () {
            conversationHistory = [];
            if (aiChatMessages) {
                aiChatMessages.innerHTML = '';
            }
            addMessage('🔄 Chat cleared! How can I help you?', 'ai-msg');
            console.log('🧹 Chat history cleared');
        };

        window.testAvinashAPI = async function () {
            console.log('🧪 Testing chatbot API...');
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
                console.log('✅ API Test Success:', data);
                return data;
            } catch (err) {
                console.error('❌ API Test Failed:', err);
                return null;
            }
        };

        console.log('✅ Avinash AI chatbot initialized. Debug: testAvinashAPI(), clearAvinashChat()');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
<script>
document.addEventListener("DOMContentLoaded", () => {
    const layer = document.getElementById("dustLayer");

    for (let i = 0; i < 160; i++) {
        const d = document.createElement("div");
        d.className = "web3-dust";

        const size = Math.random() * 3 + 1;
        d.style.width = size + "px";
        d.style.height = size + "px";

        d.style.left = Math.random() * 100 + "%";
        d.style.top = Math.random() * 120 + "%";

        d.style.animationDuration = (14 + Math.random() * 18) + "s";

        d.style.setProperty("--dust-drift", (Math.random() * 140 - 70) + "px");

        layer.appendChild(d);
    }
});
</script>
/* ============================================================
   🌐 AVINASH WEB3 JS ENGINE — PART 18
   SCROLL REVEAL • PARALLAX • MAGNETIC • RIPPLE • 3D TILT • CURSOR GLOW
============================================================ */

(function () {
    'use strict';

    // Guard: only run after DOM is ready
    function onReady(cb) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cb);
        } else {
            cb();
        }
    }

    onReady(function () {

        /* ============================================================
           1️⃣ SCROLL REVEAL ENGINE
           Targets:
             - .web3-reveal
             - .web3-fade-up
             - .web3-rise
             - .web3-blur-in
             - .web3-stagger
             - .web3-scroll-light
        ============================================================ */

        var revealSelector = `
            .web3-reveal,
            .web3-fade-up,
            .web3-rise,
            .web3-blur-in,
            .web3-stagger,
            .web3-scroll-light
        `;

        var revealElements = Array.prototype.slice.call(
            document.querySelectorAll(revealSelector)
        );

        if ('IntersectionObserver' in window && revealElements.length > 0) {
            var revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;

                        // Generic reveal
                        if (el.classList.contains('web3-reveal')) {
                            el.classList.add('web3-reveal-visible');
                        }

                        // Specific animations
                        if (
                            el.classList.contains('web3-fade-up') ||
                            el.classList.contains('web3-rise') ||
                            el.classList.contains('web3-blur-in') ||
                            el.classList.contains('web3-stagger')
                        ) {
                            el.classList.add('web3-show');
                        }

                        // Lighting activation
                        if (el.classList.contains('web3-scroll-light')) {
                            el.classList.add('web3-scroll-light-active');
                        }

                        revealObserver.unobserve(el);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            });

            revealElements.forEach(function (el) {
                revealObserver.observe(el);
            });
        }


        /* ============================================================
           2️⃣ PARALLAX ENGINE
           - Elements with [data-parallax-speed]
           - Elements with .web3-parallax-layer[data-depth]
        ============================================================ */

        var parallaxNodes = Array.prototype.slice.call(
            document.querySelectorAll('[data-parallax-speed], .web3-parallax-layer[data-depth]')
        );

        if (parallaxNodes.length > 0) {
            var ticking = false;

            function onScroll() {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

                        parallaxNodes.forEach(function (el) {
                            var speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0;
                            var depth = parseFloat(el.getAttribute('data-depth')) || 0;

                            // Speed based parallax (vertical)
                            if (speed !== 0) {
                                var offsetY = scrollY * speed;
                                el.style.transform = 'translateY(' + (-offsetY) + 'px)';
                            }

                            // Depth-based (for .web3-parallax-layer)
                            if (el.classList.contains('web3-parallax-layer') && depth !== 0) {
                                var depthOffset = scrollY * depth;
                                el.style.transform = 'translate3d(0,' + (-depthOffset) + 'px,0)';
                            }
                        });

                        ticking = false;
                    });

                    ticking = true;
                }
            }

            window.addEventListener('scroll', onScroll);
            onScroll();
        }


        /* ============================================================
           3️⃣ MAGNETIC BUTTON ENGINE
           - Elements with .web3-magnetic
           Slight cursor attraction effect
        ============================================================ */

        var magneticElements = Array.prototype.slice.call(
            document.querySelectorAll('.web3-magnetic')
        );

        magneticElements.forEach(function (el) {
            var strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;

            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var relX = e.clientX - rect.left;
                var relY = e.clientY - rect.top;

                var moveX = (relX - rect.width / 2) * strength / 10;
                var moveY = (relY - rect.height / 2) * strength / 10;

                el.style.transform =
                    'translate(' + moveX + 'px,' + moveY + 'px) scale(1.03)';
            });

            el.addEventListener('mouseleave', function () {
                el.style.transform = 'translate(0,0) scale(1)';
            });
        });


        /* ============================================================
           4️⃣ PRESS RIPPLE ENGINE
           - Elements with .web3-press
           Uses CSS variables --x and --y for ripple origin
        ============================================================ */

        var pressElements = Array.prototype.slice.call(
            document.querySelectorAll('.web3-press')
        );

        pressElements.forEach(function (el) {
            el.addEventListener('pointerdown', function (e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                el.style.setProperty('--x', x + 'px');
                el.style.setProperty('--y', y + 'px');
            });
        });


        /* ============================================================
           5️⃣ 3D TILT CARDS
           - Elements with .web3-tilt
           - Elements with .web3-hover-parallax
        ============================================================ */

        var tiltElements = Array.prototype.slice.call(
            document.querySelectorAll('.web3-tilt, .web3-hover-parallax')
        );

        tiltElements.forEach(function (card) {
            var maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 10;
            var perspective = parseFloat(card.getAttribute('data-tilt-perspective')) || 800;

            function handleMove(e) {
                var rect = card.getBoundingClientRect();
                var relX = e.clientX - rect.left;
                var relY = e.clientY - rect.top;

                var percentX = (relX / rect.width) - 0.5;
                var percentY = (relY / rect.height) - 0.5;

                var rotateY = percentX * maxTilt;
                var rotateX = -percentY * maxTilt;

                card.style.transform =
                    'perspective(' + perspective + 'px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(0)';
            }

            function resetTilt() {
                card.style.transform = 'perspective(' + perspective + 'px) rotateX(0deg) rotateY(0deg) translateZ(0)';
            }

            card.addEventListener('mousemove', handleMove);
            card.addEventListener('mouseleave', resetTilt);
        });


        /* ============================================================
           6️⃣ CURSOR NEON GLOW + TRAIL
           - Creates: .web3-cursor-glow & .web3-cursor-glow-trail
        ============================================================ */

        var enableCursorGlow = true; // set false if you ever want to disable

        if (enableCursorGlow && window.matchMedia('(pointer:fine)').matches) {
            var glow = document.createElement('div');
            glow.className = 'web3-cursor-glow';

            var trail = document.createElement('div');
            trail.className = 'web3-cursor-glow-trail';

            document.body.appendChild(glow);
            document.body.appendChild(trail);

            var lastX = window.innerWidth / 2;
            var lastY = window.innerHeight / 2;

            document.addEventListener('pointermove', function (e) {
                var x = e.clientX;
                var y = e.clientY;

                glow.style.transform = 'translate(' + (x - 7) + 'px,' + (y - 7) + 'px)';
                trail.style.transform = 'translate(' + (lastX - 3) + 'px,' + (lastY - 3) + 'px)';

                lastX = x;
                lastY = y;
            });

            document.addEventListener('pointerdown', function () {
                glow.style.transform += ' scale(0.8)';
                setTimeout(function () {
                    glow.style.transform = glow.style.transform.replace(' scale(0.8)', '');
                }, 120);
            });
        }

        console.log('✅ Web3 JS Engine (Part 18) initialized');
    });

})();
/* ============================================================
   🌐 AVINASH WEB3 BACKGROUND ENGINE — PART 19
   MATRIX RAIN • PARTICLE FIELDS • SECTION LIGHT SCROLL
============================================================ */

(function () {
    'use strict';

    // Run after DOM is ready
    function ready(cb) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cb);
        } else {
            cb();
        }
    }

    ready(function () {

        /* ============================================================
           1️⃣ MATRIX RAIN BACKGROUND (AI Code Stream)
           Creates: <canvas id="web3-matrix"> auto-injected
        ============================================================ */

        const enableMatrix = true;

        if (enableMatrix) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.id = 'web3-matrix';
            canvas.style.position = 'fixed';
            canvas.style.top = 0;
            canvas.style.left = 0;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = 0;
            canvas.style.opacity = 0.12;

            document.body.appendChild(canvas);

            function resize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            resize();
            window.addEventListener('resize', resize);

            const letters = "アカサタナハマヤラワ0123456789ABCDEFGHIJK";
            const fontSize = 16;
            const columns = Math.floor(canvas.width / fontSize);
            const drops = new Array(columns).fill(1);

            function drawMatrix() {
                ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#38B6FF";
                ctx.font = fontSize + "px monospace";

                drops.forEach((y, i) => {
                    const char = letters[Math.floor(Math.random() * letters.length)];
                    ctx.fillText(char, i * fontSize, y * fontSize);

                    if (y * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                });

                requestAnimationFrame(drawMatrix);
            }

            drawMatrix();
        }


        /* ============================================================
           2️⃣ AI FLOATING PARTICLE FIELD (3D Depth Bubbles)
        ============================================================ */

        const enableParticles = true;

        if (enableParticles) {
            const particleLayer = document.createElement("div");
            particleLayer.className = "web3-particles-layer";
            particleLayer.style.position = "fixed";
            particleLayer.style.top = 0;
            particleLayer.style.left = 0;
            particleLayer.style.width = "100%";
            particleLayer.style.height = "100%";
            particleLayer.style.pointerEvents = "none";
            particleLayer.style.zIndex = 1;
            particleLayer.style.overflow = "hidden";
            document.body.appendChild(particleLayer);

            const particleCount = 60;

            for (let i = 0; i < particleCount; i++) {
                const p = document.createElement("div");
                p.className = "web3-float-particle";

                const size = Math.random() * 6 + 2;

                p.style.position = "absolute";
                p.style.width = size + "px";
                p.style.height = size + "px";
                p.style.borderRadius = "50%";
                p.style.background = "rgba(56,182,255,0.45)";
                p.style.filter = "blur(2px)";
                p.style.left = Math.random() * 100 + "%";
                p.style.top = Math.random() * 100 + "%";
                p.style.animation = `floatUp ${10 + Math.random() * 20}s linear infinite`;
                p.style.opacity = 0.4 + Math.random() * 0.4;

                particleLayer.appendChild(p);
            }
        }


        /* ============================================================
           3️⃣ SECTION LIGHT SCROLL ENGINE
           Activates hologram panels as user scrolls through sections
        ============================================================ */

        const sectionLights = true;

        if (sectionLights) {
            const sections = document.querySelectorAll("section");

            const sectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("section-light-active");
                        }
                    });
                },
                { threshold: 0.25 }
            );

            sections.forEach((sec) => sectionObserver.observe(sec));
        }


        /* ============================================================
           4️⃣ HOLOGRAM PANELS (auto-activate on scroll)
           Triggers .web3-hologram elements
        ============================================================ */

        const hologramNodes = document.querySelectorAll(".web3-hologram");

        if (hologramNodes.length > 0 && "IntersectionObserver" in window) {
            const holoObs = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("web3-hologram-active");
                        }
                    });
                },
                { threshold: 0.3 }
            );

            hologramNodes.forEach((node) => holoObs.observe(node));
        }


        /* ============================================================
           5️⃣ GRID BACKGROUND PARALLAX (Cyber Web3 Grid)
           Activates .web3-grid-bg
        ============================================================ */

        const gridLayers = document.querySelectorAll(".web3-grid-bg");

        if (gridLayers.length > 0) {
            window.addEventListener("scroll", () => {
                const y = window.scrollY * 0.15;

                gridLayers.forEach((layer) => {
                    layer.style.transform = `translateY(${y}px)`;
                });
            });
        }


        /* ============================================================
           6️⃣ REDUCED MOTION HANDLING
           Auto-disable animations for accessibility
        ============================================================ */

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.documentElement.classList.add("reduced-motion");

            // Stop matrix
            const matrix = document.getElementById("web3-matrix");
            if (matrix) matrix.style.display = "none";

            // Stop particles
            const particleLayer = document.querySelector(".web3-particles-layer");
            if (particleLayer) particleLayer.style.display = "none";
        }

        console.log("🌐 Web3 Background Engine (Part 19) Loaded");
    });

})();
/* ============================================================
   🌐 WEB3 HOLOGRAM JS ENGINE — PART 21
   REFRACTION • SHINE TRACKING • HOLOGRAM TILT • DYNAMIC GLOW
============================================================ */

(function () {
    'use strict';

    function ready(cb) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cb);
        } else {
            cb();
        }
    }

    ready(function () {

        /* ============================================================
           1️⃣ HOLOGRAM REFRACTION (Glass-like distortion on hover)
           Activates on elements with: .web3-hologram
        ============================================================ */

        const holograms = document.querySelectorAll(".web3-hologram");

        holograms.forEach(holo => {
            holo.addEventListener("mousemove", e => {
                const rect = holo.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const moveX = (x - centerX) / 20;
                const moveY = (y - centerY) / 20;

                holo.style.transform =
                    `translateY(-6px) rotateX(${ -moveY }deg) rotateY(${ moveX }deg) scale(1.03)`;

                holo.style.setProperty("--holo-x", x + "px");
                holo.style.setProperty("--holo-y", y + "px");
            });

            holo.addEventListener("mouseleave", () => {
                holo.style.transform = "translateY(0) rotateX(0) rotateY(0)";
            });
        });


        /* ============================================================
           2️⃣ SHINE TRACKING BEAM (White holographic streak)
           Works automatically on elements with: .web3-shine
        ============================================================ */

        const shineEls = document.querySelectorAll(".web3-shine");

        shineEls.forEach(el => {
            el.addEventListener("mousemove", e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;

                el.style.setProperty("--shine-pos", x + "px");
            });
        });


        /* ============================================================
           3️⃣ HOLOGRAM GRID PANEL INTERACTIVE DEPTH
           Class: .web3-grid-panel
        ============================================================ */

        const gridPanels = document.querySelectorAll(".web3-grid-panel");

        gridPanels.forEach(panel => {
            panel.addEventListener("mousemove", e => {
                const rect = panel.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                const rotateX = -y * 6;
                const rotateY = x * 6;

                panel.style.transform =
                    `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            panel.addEventListener("mouseleave", () => {
                panel.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
            });
        });


        /* ============================================================
           4️⃣ FLOATING HOLOGRAM LABELS (Class: .web3-float)
           Subtle continuous hover lift
        ============================================================ */

        const floaters = document.querySelectorAll(".web3-float");

        floaters.forEach(el => {
            el.addEventListener("mouseenter", () => {
                el.style.transform = "translateY(-8px)";
            });
            el.addEventListener("mouseleave", () => {
                el.style.transform = "translateY(0)";
            });
        });


        /* ============================================================
           5️⃣ HOLOGRAM GLOW INTENSITY ON SCROLL
           Class auto-applies to: .web3-hologram, .web3-grid-panel
        ============================================================ */

        const glowTargets = document.querySelectorAll(
            ".web3-hologram, .web3-grid-panel, .web3-neon-frame"
        );

        if ("IntersectionObserver" in window) {
            const glowObs = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("web3-glow-boost");
                        }
                    });
                },
                { threshold: 0.4 }
            );

            glowTargets.forEach(t => glowObs.observe(t));
        }


        /* ============================================================
           6️⃣ HOLOGRAM PULSE EFFECT
           Adds heartbeat glow when hovered
        ============================================================ */

        holograms.forEach(holo => {
            holo.addEventListener("mouseenter", () => {
                holo.classList.add("holo-pulse");
            });
            holo.addEventListener("mouseleave", () => {
                holo.classList.remove("holo-pulse");
            });
        });

        console.log("🌐 Web3 Hologram Engine (Part 21) Loaded");
    });

})();
/* ============================================================
   🌐 PART 22 — AI WARP DISTORTION ENGINE
   CURSOR WAVE • HEAT-WARP • SHOCKWAVE • TRAIL FLOWS
============================================================ */

(function() {
    "use strict";

    function ready(cb) {
        if (document.readyState !== "loading") cb();
        else document.addEventListener("DOMContentLoaded", cb);
    }

    ready(function() {

        /* ============================================================
           1️⃣ CURSOR HEAT-WARP DISTORTION LAYER
        ============================================================ */

        const heatWarpLayer = document.createElement("div");
        heatWarpLayer.id = "ai-heat-warp";
        heatWarpLayer.style.position = "fixed";
        heatWarpLayer.style.top = 0;
        heatWarpLayer.style.left = 0;
        heatWarpLayer.style.width = "100vw";
        heatWarpLayer.style.height = "100vh";
        heatWarpLayer.style.pointerEvents = "none";
        heatWarpLayer.style.zIndex = 9990;
        heatWarpLayer.style.mixBlendMode = "soft-light";
        heatWarpLayer.style.opacity = 0.25;

        document.body.appendChild(heatWarpLayer);

        document.addEventListener("mousemove", (e) => {
            heatWarpLayer.style.background = `
                radial-gradient(
                    350px circle at ${e.clientX}px ${e.clientY}px,
                    rgba(56,182,255,0.25),
                    transparent 70%
                )
            `;
        });


        /* ============================================================
           2️⃣ CURSOR SHOCKWAVE RIPPLE
        ============================================================ */

        document.addEventListener("click", (e) => {
            const ripple = document.createElement("div");
            ripple.className = "ai-shockwave";

            ripple.style.left = e.clientX - 30 + "px";
            ripple.style.top = e.clientY - 30 + "px";

            document.body.appendChild(ripple);

            setTimeout(() => ripple.remove(), 700);
        });

        /* CSS injection for ripple */
        const rippleCSS = document.createElement("style");
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
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(8); opacity: 0; }
            }
        `;
        document.head.appendChild(rippleCSS);


        /* ============================================================
           3️⃣ ADVANCED CURSOR TRAIL FLOW (Smooth, Multi-Particle)
        ============================================================ */

        const trailCount = 10;
        const trails = [];

        for (let i = 0; i < trailCount; i++) {
            const node = document.createElement("div");
            node.className = "ai-trail-node";
            node.style.position = "fixed";
            node.style.width = "10px";
            node.style.height = "10px";
            node.style.borderRadius = "50%";
            node.style.pointerEvents = "none";
            node.style.zIndex = 9994;
            node.style.mixBlendMode = "screen";
            node.style.background = "rgba(56,182,255,0.45)";
            node.style.filter = "blur(6px)";
            node.style.opacity = (0.15 + i * 0.05).toString();
            trails.push(node);
            document.body.appendChild(node);
        }

        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;

        document.addEventListener("mousemove", (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        function animateTrail() {
            let x = cursorX;
            let y = cursorY;

            trails.forEach((node, i) => {
                node.style.transform = `translate(${x}px, ${y}px)`;

                // Smooth follow
                x += (cursorX - x) * (0.15 - i * 0.008);
                y += (cursorY - y) * (0.15 - i * 0.008);
            });

            requestAnimationFrame(animateTrail);
        }

        animateTrail();


        /* ============================================================
           4️⃣ AI WATER/WAVE DISTORTION EFFECT (Hover Elements)
           Use class: .ai-warp
        ============================================================ */

        const warpTargets = document.querySelectorAll(".ai-warp");

        warpTargets.forEach(el => {
            el.style.position = "relative";
            el.style.overflow = "hidden";

            const wave = document.createElement("div");
            wave.className = "ai-warp-wave";
            el.appendChild(wave);

            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                wave.style.left = (e.clientX - rect.left - 50) + "px";
                wave.style.top = (e.clientY - rect.top - 50) + "px";
                wave.classList.add("active");
            });

            el.addEventListener("mouseleave", () => {
                wave.classList.remove("active");
            });
        });

        const warpCSS = document.createElement("style");
        warpCSS.textContent = `
            .ai-warp-wave {
                position: absolute;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    rgba(56,182,255,0.35),
                    transparent 70%
                );
                filter: blur(20px);
                opacity: 0;
                transition: opacity .2s ease;
                pointer-events: none;
            }
            .ai-warp-wave.active {
                opacity: 1;
            }
        `;
        document.head.appendChild(warpCSS);


        console.log("⚡ Web3 AI Warp Engine (Part 22) Loaded");
    });

})();
