/* =====================================================
   AVINASH RAI - DATA ENGINEER PORTFOLIO
   Interactive Features & Animations
===================================================== */

// =====================
// GLOBAL VARIABLES
// =====================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTopButton = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

// =====================
// STICKY NAVBAR
// =====================
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow when scrolled
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// =====================
// MOBILE MENU TOGGLE
// =====================
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        
        // Reset hamburger
        const spans = navToggle?.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        
        const spans = navToggle?.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
});

// =====================
// ACTIVE NAVIGATION LINK ON SCROLL
// =====================
function highlightNav() {
    let current = '';
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            current = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNav);

// =====================
// SMOOTH SCROLL FOR ANCHOR LINKS
// =====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// =====================
// BACK TO TOP BUTTON
// =====================
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =====================
// PROJECT FILTER FUNCTIONALITY
// =====================
if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Filter projects
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category');
                
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

// =====================
// ANIMATED PARTICLES BACKGROUND
// =====================
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
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
        
        particlesContainer.appendChild(particle);
    }
}

// Add particle styles dynamically
const style = document.createElement('style');
style.textContent = `
    .particle {
        position: absolute;
        background: radial-gradient(circle, rgba(56, 182, 255, 0.8) 0%, transparent 70%);
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
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize particles
document.addEventListener('DOMContentLoaded', createParticles);

// =====================
// INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
// =====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for fade-in effect
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(`
        .project-card,
        .expertise-card,
        .highlight-card,
        .tech-category,
        .contact-card
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(el);
    });
});

// =====================
// TYPING EFFECT FOR HERO SUBTITLE (Optional)
// =====================
function typeWriter(element, texts, speed = 100) {
    if (!element) return;
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';
    
    function type() {
        const fullText = texts[textIndex];
        
        if (isDeleting) {
            currentText = fullText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = fullText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        element.textContent = currentText;
        
        let typeSpeed = isDeleting ? speed / 2 : speed;
        
        if (!isDeleting && charIndex === fullText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500; // Pause before next text
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// Initialize typing effect (optional - remove if not needed)
// Uncomment if you want animated typing in hero subtitle
/*
document.addEventListener('DOMContentLoaded', () => {
    const subtitleElement = document.querySelector('.hero-subtitle');
    if (subtitleElement) {
        const texts = [
            'Data Engineer & Analytics Architect',
            'Snowflake & dbt Specialist',
            'AI/ML Pipeline Expert',
            'Modern Data Stack Architect'
        ];
        typeWriter(subtitleElement, texts, 80);
    }
});
*/

// =====================
// DYNAMIC YEAR IN FOOTER
// =====================
document.addEventListener('DOMContentLoaded', () => {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
});

// =====================
// PARALLAX SCROLL EFFECT (Optional)
// =====================
function parallaxScroll() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax') || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
    });
}

// Uncomment to enable parallax
// window.addEventListener('scroll', parallaxScroll);

// =====================
// LAZY LOADING IMAGES
// =====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// =====================
// COPY EMAIL TO CLIPBOARD
// =====================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        const notification = document.createElement('div');
        notification.textContent = 'Email copied to clipboard!';
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #38B6FF 0%, #8B5CF6 100%);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    });
}

// Add click event to email links
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const email = link.getAttribute('href').replace('mailto:', '');
            copyToClipboard(email);
        }
    });
});

// =====================
// STATS COUNTER ANIMATION
// =====================
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

// Animate stats when visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.classList.contains('animated')) {
                const target = parseInt(statNumber.textContent);
                animateCounter(statNumber, target);
                statNumber.classList.add('animated');
                statsObserver.unobserve(entry.target);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// =====================
// CONSOLE EASTER EGG
// =====================
console.log('%c👋 Hello, Fellow Developer!', 'font-size: 24px; font-weight: bold; color: #38B6FF;');
console.log('%c🚀 Thanks for checking out my portfolio!', 'font-size: 16px; color: #FF6B9D;');
console.log('%c📧 Let\'s connect: masteravinashrai@gmail.com', 'font-size: 14px; color: #00D9A3;');
console.log('%c💼 LinkedIn: linkedin.com/in/avinashanalytics', 'font-size: 14px; color: #8892a6;');
console.log('%c⭐ GitHub: github.com/AvinashAnalytics', 'font-size: 14px; color: #8892a6;');
console.log('%c\n🎨 Built with vanilla JavaScript, CSS, and lots of ☕', 'font-size: 12px; font-style: italic; color: #b8c5d6;');

// =====================
// PERFORMANCE MONITORING
// =====================
window.addEventListener('load', () => {
    // Log page load time
    const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    console.log(`⚡ Page loaded in ${loadTime}ms`);
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.documentElement.style.scrollBehavior = 'auto';
        console.log('♿ Reduced motion mode enabled');
    }
});

// =====================
// KEYBOARD NAVIGATION ENHANCEMENT
// =====================
document.addEventListener('keydown', (e) => {
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
    
    // Press 'Home' to scroll to top
    if (e.key === 'Home' && !e.shiftKey) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Press 'End' to scroll to bottom
    if (e.key === 'End' && !e.shiftKey) {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
});

// =====================
// FOCUS VISIBLE ENHANCEMENT
// =====================
document.addEventListener('DOMContentLoaded', () => {
    let isUsingMouse = false;
    
    document.addEventListener('mousedown', () => {
        isUsingMouse = true;
    });
    
    document.addEventListener('keydown', () => {
        isUsingMouse = false;
    });
    
    document.addEventListener('focusin', (e) => {
        if (isUsingMouse) {
            e.target.classList.add('mouse-focus');
        } else {
            e.target.classList.remove('mouse-focus');
        }
    });
});

// =====================
// THEME COLOR META UPDATE (for mobile browsers)
// =====================
function updateThemeColor() {
    const scrolled = window.pageYOffset;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#0a0e27';
        document.head.appendChild(meta);
    } else {
        metaThemeColor.content = scrolled > 50 ? '#050711' : '#0a0e27';
    }
}

window.addEventListener('scroll', updateThemeColor);

// =====================
// EXTERNAL LINK SECURITY
// =====================
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer');
});

// =====================
// ANALYTICS EVENT TRACKING (Optional - for Google Analytics)
// =====================
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
}

// Track project clicks
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', () => {
        const projectName = link.closest('.project-card').querySelector('h3').textContent;
        trackEvent('Projects', 'Click', projectName);
    });
});

// Track social media clicks
document.querySelectorAll('.social-icon, .social-link').forEach(link => {
    link.addEventListener('click', () => {
        const platform = link.getAttribute('title') || 'Social Link';
        trackEvent('Social', 'Click', platform);
    });
});

// Track contact button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        trackEvent('CTA', 'Click', buttonText);
    });
});

// =====================
// INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Portfolio initialized successfully');
    
    // Highlight initial nav item
    highlightNav();
    
    // Update theme color
    updateThemeColor();
    
    // Add loaded class to body
    document.body.classList.add('loaded');
});

// =====================
// SERVICE WORKER REGISTRATION (Optional - for PWA)
// =====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        /*
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('❌ Service Worker registration failed', err));
        */
    });
}
/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   FIXED VERSION WITH CONVERSATION HISTORY
===================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // =============== DOM ELEMENTS ===============
    const aiChatButton = document.getElementById("ai-chat-button");
    const aiChatWindow = document.getElementById("ai-chat-window");
    const aiChatClose = document.getElementById("ai-chat-close");
    const aiChatMessages = document.getElementById("ai-chat-messages");
    const aiChatInput = document.getElementById("ai-chat-input");
    const aiChatSend = document.getElementById("ai-chat-send");

    // =============== CONVERSATION HISTORY ===============
    // This is the KEY FIX - maintains context between messages
    let conversationHistory = [];

    // Debug: Check if elements exist
    console.log("🤖 Chatbot Debug:");
    console.log("- Button found:", !!aiChatButton);
    console.log("- Window found:", !!aiChatWindow);
    console.log("- Close found:", !!aiChatClose);
    console.log("- Messages found:", !!aiChatMessages);
    console.log("- Input found:", !!aiChatInput);
    console.log("- Send found:", !!aiChatSend);

    // Skip if elements not present
    if (!aiChatButton || !aiChatWindow) {
        console.error("❌ Chatbot elements not found in DOM!");
        return;
    }

    console.log("✅ Chatbot initialized successfully");

    // =====================
    // TOGGLE CHAT WINDOW
    // =====================
    aiChatButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("🖱️ Chat button clicked!");
        
        if (aiChatWindow.style.display === "flex") {
            aiChatWindow.style.display = "none";
        } else {
            aiChatWindow.style.display = "flex";
            // Focus input when opening
            if (aiChatInput) {
                setTimeout(() => aiChatInput.focus(), 100);
            }
        }
    });

    // Close button
    if (aiChatClose) {
        aiChatClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("❌ Close button clicked");
            aiChatWindow.style.display = "none";
        });
    }

    // Close when clicking outside (optional)
    document.addEventListener('click', function(e) {
        if (aiChatWindow.style.display === "flex" && 
            !aiChatWindow.contains(e.target) && 
            !aiChatButton.contains(e.target)) {
            // Uncomment below to enable click-outside-to-close
            // aiChatWindow.style.display = "none";
        }
    });

    // =====================
    // SEND MESSAGE - FIXED WITH HISTORY
    // =====================
    function sendAIMessage() {
        const msg = aiChatInput.value.trim();
        if (!msg) return;

        console.log("📤 Sending message:", msg);

        // Show user bubble
        addMessage(msg, "user-msg");
        aiChatInput.value = "";

        // Add user message to conversation history
        conversationHistory.push({ 
            role: "user", 
            content: msg 
        });

        // Show loading indicator
        showTyping();

        // Call API with conversation history
        fetch("https://avinashanalytics-avinash-chatbot.hf.space/chat", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                text: msg,
                conversation_history: conversationHistory
            })
        })
        .then(response => {
            console.log("📡 Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("📥 Response received:", data);
            removeTyping();
            
            const reply = data.reply || "Sorry, I couldn't process that request.";
            addMessage(reply, "ai-msg");

            // Add AI reply to conversation history
            conversationHistory.push({ 
                role: "assistant", 
                content: reply 
            });

            // Keep history manageable (last 20 messages)
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }

            console.log("📜 History length:", conversationHistory.length);
        })
        .catch(error => {
            console.error("❌ AI Chat Error:", error);
            removeTyping();
            
            let errorMsg = "⚠️ Unable to reach AI server. Please try again later.";
            
            // More specific error messages
            if (error.message.includes("422")) {
                errorMsg = "⚠️ Request format error. Please try again.";
            } else if (error.message.includes("503") || error.message.includes("500")) {
                errorMsg = "⚠️ AI server is warming up. Please wait a moment and try again.";
            } else if (error.message.includes("Failed to fetch")) {
                errorMsg = "⚠️ Network error. Please check your connection.";
            }
            
            addMessage(errorMsg, "ai-msg");
        });
    }

    // Send button click
    if (aiChatSend) {
        aiChatSend.addEventListener('click', function(e) {
            e.preventDefault();
            sendAIMessage();
        });
    }

    // Enter key to send
    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });
    }

    // =====================
    // ADD MESSAGE TO UI
    // =====================
    function addMessage(text, type) {
        const bubble = document.createElement("div");
        bubble.className = type;
        
        // Handle markdown-like formatting
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
            .replace(/\n/g, "<br>");                            // Line breaks
        
        bubble.innerHTML = formattedText;
        aiChatMessages.appendChild(bubble);
        
        // Smooth scroll to bottom
        aiChatMessages.scrollTo({
            top: aiChatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // =====================
    // TYPING INDICATOR
    // =====================
    function showTyping() {
        const bubble = document.createElement("div");
        bubble.className = "ai-msg typing-indicator";
        bubble.id = "typing-indicator";
        bubble.innerHTML = `
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        `;
        aiChatMessages.appendChild(bubble);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById("typing-indicator");
        if (el) el.remove();
    }

    // =====================
    // QUICK ACTION BUTTONS (Optional)
    // =====================
    function addQuickActions() {
        const quickActions = document.createElement("div");
        quickActions.className = "quick-actions";
        quickActions.innerHTML = `
            <button class="quick-btn" data-msg="What are your skills?">🛠️ Skills</button>
            <button class="quick-btn" data-msg="Tell me about your projects">📁 Projects</button>
            <button class="quick-btn" data-msg="How can I contact you?">📧 Contact</button>
        `;
        
        quickActions.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                aiChatInput.value = this.getAttribute('data-msg');
                sendAIMessage();
            });
        });
        
        // Insert after welcome message
        aiChatMessages.appendChild(quickActions);
    }

    // =====================
    // WELCOME MESSAGE
    // =====================
    addMessage("👋 Hi! I'm Avinash's AI assistant. Ask me anything about his skills, projects, or experience!", "ai-msg");
    
    // Uncomment to add quick action buttons
    // addQuickActions();

    // =====================
    // CLEAR CHAT FUNCTION (Optional)
    // =====================
    window.clearAIChat = function() {
        conversationHistory = [];
        aiChatMessages.innerHTML = '';
        addMessage("👋 Chat cleared! How can I help you?", "ai-msg");
    };

});
