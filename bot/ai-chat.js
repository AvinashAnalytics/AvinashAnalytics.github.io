/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   ai-chat.js - lightweight chat widget client
   ✅ Fixed API endpoint: /ask with 'question' field
===================================================== */
(function () {
    'use strict';

    function initChatbot() {
        // =============== DOM ELEMENTS ===============
        const aiChatButton = document.getElementById('ai-chat-button');
        // v3.25: Build Live CSS Robot Structure (No Image)
        if (aiChatButton) {
            aiChatButton.innerHTML = `
                <div class="robot-face">
                    <div class="robot-eyes">
                        <div class="eye left"><div class="pupil"></div></div>
                        <div class="eye right"><div class="pupil"></div></div>
                    </div>
                    <div class="robot-mouth"></div>
                </div>
                <div class="robot-particles"></div>
            `;

            // Generate Dust Particles
            const particleContainer = aiChatButton.querySelector('.robot-particles');
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('span');
                p.style.setProperty('--i', i);
                p.style.animationDelay = `${Math.random() * 2}s`;
                particleContainer.appendChild(p);
            }
        }

        const aiChatWindow = document.getElementById('ai-chat-window');
        const aiChatClose = document.getElementById('ai-chat-close');
        const aiChatMessages = document.getElementById('ai-chat-messages');
        const aiChatInput = document.getElementById('ai-chat-input');
        const aiChatSend = document.getElementById('ai-chat-send');

        // =============== API URL ===============
        // ✅ Correct HuggingFace Space URL with /ask endpoint
        const API_URL = 'https://AvinashAnalytics-avinash-chatbot.hf.space/ask';

        // v3.10.1: Load conversation history from localStorage for sync
        let conversationHistory = [];
        try {
            const savedHistory = localStorage.getItem('chat_conversation_history');
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                conversationHistory = Array.isArray(parsed) ? parsed : [];
                console.log(`[Chat] Restored ${conversationHistory.length} messages from history`);

                // Restore messages to UI
                conversationHistory.forEach(msg => {
                    if (msg.role === 'user') {
                        addMessage(msg.content, 'user-msg');
                    } else {
                        addMessage(msg.content, 'ai-msg');
                    }
                });
            }
        } catch (e) {
            console.error('[Chat] Failed to restore history:', e);
        }

        // Helper to save history
        function saveConversationHistory() {
            try {
                localStorage.setItem('chat_conversation_history', JSON.stringify(conversationHistory));
            } catch (e) {
                console.error('[Chat] Failed to save history:', e);
            }
        }

        let isLoading = false;

        // =============== DEBUG ===============
        console.log('🤖 Chatbot Init');
        console.log('📡 API URL:', API_URL);

        if (!aiChatButton || !aiChatWindow) {
            console.error('❌ Chatbot elements missing!');
            return;
        }

        // =============== TOGGLE CHAT & DRAG LOGIC ===============
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let dragStartTime;

        // Mouse Down / Touch Start
        function handleDragStart(e) {
            isDragging = false; // Assume click initially
            dragStartTime = Date.now();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            const rect = aiChatButton.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Remove right/bottom positioning to switch to left/top for dragging
            aiChatButton.style.right = 'auto';
            aiChatButton.style.bottom = 'auto';
            aiChatButton.style.left = `${initialLeft}px`;
            aiChatButton.style.top = `${initialTop}px`;

            // v3.23: Trigger RUN animation
            aiChatButton.style.animation = 'robotRun 0.4s linear infinite';
            aiChatButton.style.cursor = 'grabbing';

            // Add global move/up listeners
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchend', handleDragEnd);
        }

        // Mouse Move / Touch Move
        function handleDragMove(e) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // Threshold to consider it a drag
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isDragging = true;
                e.preventDefault(); // Prevent scrolling
            }

            if (isDragging) {
                let newLeft = initialLeft + deltaX;
                let newTop = initialTop + deltaY;

                // Boundary Check
                const maxLeft = window.innerWidth - aiChatButton.offsetWidth;
                const maxTop = window.innerHeight - aiChatButton.offsetHeight;

                newLeft = Math.max(0, Math.min(newLeft, maxLeft));
                newTop = Math.max(0, Math.min(newTop, maxTop));

                aiChatButton.style.left = `${newLeft}px`;
                aiChatButton.style.top = `${newTop}px`;

                // Keep animation running
            }
        }

        // Mouse Up / Touch End
        function handleDragEnd(e) {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchend', handleDragEnd);

            // v3.23: Restore Float Animation
            aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite';
            aiChatButton.style.cursor = 'grab';

            // Handle Click (if not dragged)
            // v3.24: Click if movement was minimal (<5px), regardless of time
            if (!isDragging) {
                toggleChat(e);
            }
        }

        function toggleChat(e) {
            e.preventDefault();
            e.stopPropagation();
            if (aiChatWindow.style.display === 'flex') {
                aiChatWindow.style.display = 'none';
            } else {
                aiChatWindow.style.display = 'flex';
                if (aiChatInput) setTimeout(() => aiChatInput.focus(), 120);
            }
        }

        // Attach Listeners to Button
        aiChatButton.addEventListener('mousedown', handleDragStart);
        aiChatButton.addEventListener('touchstart', handleDragStart, { passive: false });

        // =============== CLOSE ===============
        if (aiChatClose) {
            aiChatClose.addEventListener('click', function (e) {
                e.preventDefault();
                aiChatWindow.style.display = 'none';
            });
        }

        // =============== CLEAR CHAT ===============
        const aiChatClear = document.getElementById('ai-chat-clear-widget');
        if (aiChatClear) {
            aiChatClear.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent closing if inside header
                if (confirm('Clear chat history?')) {
                    conversationHistory = [];
                    saveConversationHistory();
                    if (aiChatMessages) aiChatMessages.innerHTML = '';
                    addMessage("🔄 Chat cleared!", "ai-msg");
                }
            });
        }

        // =============== SEND MESSAGE ===============
        async function sendMessage() {
            const text = aiChatInput ? aiChatInput.value.trim() : '';
            if (!text || isLoading) return;

            if (aiChatInput) aiChatInput.value = '';
            addMessage(text, 'user-msg');

            conversationHistory.push({ role: 'user', content: text });
            saveConversationHistory(); // SAVE

            isLoading = true;
            showTyping();

            try {
                // Get dynamic user ID
                let userId = localStorage.getItem('chat_uid');
                if (!userId) {
                    userId = 'web-' + Math.random().toString(36).substring(7) + Date.now().toString(36);
                    localStorage.setItem('chat_uid', userId);
                }

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: text,
                        user_id: userId  // FIXED: Use dynamic user_id
                    })
                });

                if (!response.ok) throw new Error('HTTP ' + response.status);

                const data = await response.json();
                removeTyping();

                const reply = (data && (data.response || data.reply || data.output || data.text)) || "Sorry, I couldn't process that.";
                addMessage(reply, 'ai-msg');

                conversationHistory.push({ role: 'assistant', content: reply });
                saveConversationHistory(); // SAVE

            } catch (error) {
                console.error('❌ Error:', error);
                removeTyping();

                let msg = '⚠ Connection error. ';
                if (error.message && error.message.includes('503')) {
                    msg += 'AI is waking up — try again in a few seconds!';
                } else {
                    msg += 'Please try again.';
                }
                addMessage(msg, 'ai-msg');

            } finally {
                isLoading = false;
            }
        }

        // =============== EVENTS ===============
        if (aiChatSend) {
            aiChatSend.addEventListener('click', (e) => {
                e.preventDefault();
                sendMessage();
            });
        }

        if (aiChatInput) {
            aiChatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // =============== HELPERS ===============
        function addMessage(text, className) {
            if (!aiChatMessages) return;
            const bubble = document.createElement('div');
            bubble.className = className;

            // v3.19: Properly render AI responses with HTML/markdown, escape user messages
            if (className === 'ai-msg') {
                // AI messages: Allow HTML rendering for formatting
                bubble.innerHTML = text.replace(/\n/g, '<br>');
            } else {
                // User messages: Escape HTML for security
                bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
            }

            aiChatMessages.appendChild(bubble);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }

        function showTyping() {
            if (!aiChatMessages) return;
            const div = document.createElement('div');
            div.className = 'ai-msg typing-indicator';
            div.id = 'typing-indicator';
            div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
            aiChatMessages.appendChild(div);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }

        function removeTyping() {
            const el = document.getElementById('typing-indicator');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }

        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // =============== WELCOME & SUGGESTIONS ===============
        addMessage("👋 Hi — I'm Avinash's AI assistant. I can help with Snowflake, dbt, Matillion, and AI/ML questions. Try: 'Explain dbt incremental models'", 'ai-msg');
        addMessage("Tip: Ask about projects, tech stack, or request sample code.", 'ai-msg');

        // =============== ADMIN REPLY POLLING ===============
        async function pollReplies() {
            try {
                let userId = localStorage.getItem('chat_uid');
                if (!userId) return; // No user ID yet

                // v3.13: ACK-based polling
                const checkUrl = API_URL.replace(/\/ask|\/chat/, '/api/check_replies') + `?user_id=${userId}&peek=true`;

                const res = await fetch(checkUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data.mode === 'admin') {
                        const headerTitle = document.querySelector('#ai-chat-header span');
                        if (headerTitle) headerTitle.innerText = "🔴 Chatting with Avinash (Live)";
                    } else {
                        const headerTitle = document.querySelector('#ai-chat-header span');
                        // Restore default only if it was changed
                        if (headerTitle && headerTitle.innerText.includes("Live")) {
                            headerTitle.innerText = "Avinash Rai • AI Twin";
                        }
                    }

                    if (data.replies && data.replies.length > 0) {
                        const receivedIds = [];

                        // Process messages
                        for (const msg of data.replies) {
                            // Dedup: Check if recently received (in current session history)
                            // We use a loose check on content to prevent message storms on connect
                            const isDuplicate = conversationHistory.some(m => m.content.includes(msg.text));

                            // If it's a duplicate, we still ACK it to clear it from queue, but don't render
                            if (isDuplicate) {
                                receivedIds.push(msg.id);
                                continue;
                            }

                            receivedIds.push(msg.id);

                            let adminHtml = `👨‍💻 <b>${msg.from || 'Avinash'}:</b><br>`;

                            // Handle rich media
                            if (msg.media && msg.media.media_type) {
                                const m = msg.media;
                                if (m.media_type === 'photo') {
                                    adminHtml += `<img src="${m.media_url || '#'}" style="max-width:200px; border-radius:8px; margin:5px 0;"><br>`;
                                } else if (m.media_type === 'video') {
                                    adminHtml += `<video src="${m.media_url || '#'}" controls style="max-width:250px; border-radius:8px; margin:5px 0;"></video><br>`;
                                } else if (m.media_type === 'voice') {
                                    adminHtml += `<audio src="${m.media_url || '#'}" controls style="margin:5px 0;"></audio><br>`;
                                } else if (m.media_type === 'sticker') {
                                    adminHtml += `<img src="${m.media_url || '#'}" style="max-width:120px; margin:5px 0;"><br>`;
                                }
                            }

                            adminHtml += msg.text;

                            conversationHistory.push({ role: 'assistant', content: `[Admin Reply]: ${msg.text}` });
                            saveConversationHistory(); // SAVE

                            // Create message element
                            if (!aiChatMessages) continue;
                            const bubble = document.createElement('div');
                            bubble.className = 'ai-msg';
                            bubble.innerHTML = adminHtml;
                            aiChatMessages.appendChild(bubble);
                            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
                        }

                        // Send ACK
                        if (receivedIds.length > 0) {
                            await fetch(API_URL.replace(/\/ask|\/chat/, '/api/ack_replies'), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ids: receivedIds })
                            });
                        }
                    }
                }
            } catch (e) {
                console.error('[Poll Replies] Error:', e);
            }
        }

        // Start polling every 3 seconds
        setInterval(pollReplies, 3000);

        console.log('✅ Chatbot ready!');

        // v3.10.2: File upload handler
        const attachButton = document.getElementById('ai-chat-attach');
        const fileInput = document.getElementById('ai-chat-file');

        if (attachButton && fileInput) {
            attachButton.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', async () => {
                const file = fileInput.files[0];
                if (!file) return;

                // Show uploading message
                addMessage(`📎 Uploading ${file.name}...`, 'user-msg');

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('user_id', getUserId());

                    const response = await fetch('https://AvinashAnalytics-avinash-chatbot.hf.space/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const data = await response.json();
                        addMessage(`✅ File sent to Avinash! ${data.message || ''}`, 'ai-msg');
                    } else {
                        addMessage('❌ Upload failed. Please try again.', 'ai-msg');
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    addMessage('❌ Upload failed. Please try again.', 'ai-msg');
                }

                // Reset file input
                fileInput.value = '';
            });
        }
        // v3.15: Polling for Admin Replies
        setInterval(async () => {
            const userId = localStorage.getItem('chat_uid');
            if (!userId) return;

            console.log('[POLLING] Checking replies for user_id:', userId);

            try {
                const res = await fetch(`https://AvinashAnalytics-avinash-chatbot.hf.space/api/check_replies?user_id=${userId}&peek=true`);
                if (!res.ok) return;
                const data = await res.json();

                // Handle Mode Indicator
                if (data.mode === 'admin') {
                    if (aiChatButton) aiChatButton.classList.add('live-chat-active');
                    const header = document.getElementById('ai-chat-header');
                    if (header) {
                        header.style.background = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
                        header.querySelector('span').innerText = "🔴 Live Chat with Avinash";
                    }
                } else {
                    if (aiChatButton) aiChatButton.classList.remove('live-chat-active');
                    const header = document.getElementById('ai-chat-header');
                    if (header) {
                        header.style.background = ''; // Reset to default
                        header.querySelector('span').innerHTML = "Avinash Rai • AI Twin";
                    }
                }

                // Handle Replies
                if (data.replies && data.replies.length > 0) {
                    const newIds = [];

                    data.replies.forEach(msg => {
                        // v3.17: Use message ID for duplicate detection instead of text
                        const exists = conversationHistory.some(h => h.msg_id === msg.id);
                        if (!exists) {
                            const content = msg.text || (msg.media ? "[Media]" : "...");

                            // v3.18: Add message to DOM FIRST
                            addMessage(content, 'ai-msg');

                            // v3.18: Save to conversation history with msg_id
                            conversationHistory.push({ role: 'assistant', content: content, timestamp: msg.timestamp, msg_id: msg.id });
                            saveConversationHistory();

                            if (msg.media && msg.media.media_url) {
                                const mediaHtml = `<div class="media-preview"><a href="${msg.media.media_url}" target="_blank">📄 View Attachment</a></div>`;
                                addMessage(mediaHtml, 'ai-msg');
                            }

                            // v3.18: Only add to ACK list AFTER successful display
                            newIds.push(msg.id);
                        }
                    });

                    // v3.18: Send ACK only after ALL messages are displayed and saved
                    if (newIds.length > 0) {
                        // Small delay to ensure DOM updates complete
                        setTimeout(async () => {
                            try {
                                await fetch('https://AvinashAnalytics-avinash-chatbot.hf.space/api/ack_replies', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ids: newIds })
                                });
                            } catch (e) {
                                console.error('[ACK] Failed:', e);
                            }
                        }, 100);
                    }
                }
            } catch (e) {
                // Silent fail
            }
        }, 2000); // v3.17: Reduced from 5s to 2s for faster message delivery

        // =============== ROBOT INTERACTIONS ===============
        const suggestions = [
            "Need help with Snowflake? ❄️",
            "Ask about my resume! 📄",
            "I know dbt & Matillion! 🛠️",
            "Check out my projects! 🚀",
            "Say 'Hi' to start! 👋",
            "Looking for a Data Engineer? 👨‍💻"
        ];

        function showSuggestion() {
            if (aiChatWindow.style.display === 'flex') return; // Don't show if chat open

            const randomText = suggestions[Math.floor(Math.random() * suggestions.length)];
            aiChatButton.setAttribute('data-bubble', randomText);
            aiChatButton.classList.add('bubble-visible');

            // Trigger Wobble Animation
            aiChatButton.style.animation = 'none';
            aiChatButton.offsetHeight; /* trigger reflow */
            aiChatButton.style.animation = 'robotWobble 0.6s ease-in-out, robotFloat 3s ease-in-out infinite';

            // Hide after 4 seconds
            setTimeout(() => {
                aiChatButton.classList.remove('bubble-visible');
            }, 4000);
        }

        // Show suggestion every 10-15 seconds
        setInterval(showSuggestion, 12000);

        // Click to Jump (Interactive)
        // We hook into the existing toggleChat or allow separate click logic
        // Since toggleChat handles the click, we can add a visual pop there too
        const originalToggle = toggleChat;
        if (typeof toggleChat === 'function') {
            // Redefine toggleChat locally if needed, but it's defined in scope
            // The previous logic used addEventListener('click', ...). We need to intercept that?
            // Actually, the drag logic calls `toggleChat(e)`.
            // We can just add a separate listener for 'mousedown' to trigger jump instantly?
            // No, let's keep it simple: Jump when bubble appears or clicked.
        }

        // =============== SOUND ENGINE (Formant Voice Synthesis) ===============
        const SoundEngine = {
            ctx: null,
            init() {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                    const resume = () => {
                        if (this.ctx.state === 'suspended') this.ctx.resume();
                        ['click', 'touchstart', 'keydown'].forEach(evt => document.removeEventListener(evt, resume));
                    };
                    ['click', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, resume));
                } catch (e) { console.warn('Audio err', e); }
            },

            // Core Voice Synthesizer
            speak(vowel, pitch, duration, vol = 0.1) {
                if (!this.ctx) this.init();
                if (this.ctx.state === 'suspended') this.ctx.resume();

                const t = this.ctx.currentTime;

                // Source: Sawtooth for robotic buzz
                const osc = this.ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(pitch, t);
                osc.frequency.exponentialRampToValueAtTime(pitch * 0.8, t + duration); // Pitch drop

                // Formant Filters (Vocal Tract)
                // Vowel Formants (Approx): 
                // A: 730, 1090 | E: 270, 2290 | I: 390, 1990 | O: 500, 1000 | U: 300, 870
                const formants = {
                    'a': [730, 1090], 'e': [270, 2290], 'i': [390, 1990],
                    'o': [500, 1000], 'u': [300, 870]
                };
                const fFreqs = formants[vowel] || formants['o'];

                const f1 = this.ctx.createBiquadFilter();
                f1.type = 'bandpass';
                f1.Q.value = 5;
                f1.frequency.setValueAtTime(fFreqs[0], t);

                const f2 = this.ctx.createBiquadFilter();
                f2.type = 'bandpass';
                f2.Q.value = 10;
                f2.frequency.setValueAtTime(fFreqs[1], t);

                // Routing
                // osc -> f1 -> gain
                // osc -> f2 -> gain
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(vol, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

                osc.connect(f1); f1.connect(gain);
                osc.connect(f2); f2.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + duration);
            },

            play(type) {
                if (!this.ctx) this.init();

                // Polymorphic Funny Sounds
                if (type === 'chirp') {
                    // "Wee-Woo!"
                    this.speak('e', 400, 0.15);
                    setTimeout(() => this.speak('u', 300, 0.15), 150);
                } else if (type === 'happy') {
                    // "Wa-Hoo!"
                    this.speak('a', 500, 0.2);
                    setTimeout(() => this.speak('u', 600, 0.2), 200);
                } else if (type === 'shocked') {
                    // "Ooooo!"
                    this.speak('o', 350, 0.4);
                } else if (type === 'angry') {
                    // "Meh!"
                    this.speak('e', 150, 0.3);
                } else if (type === 'cute') {
                    // "Bee-Bo?"
                    this.speak('i', 800, 0.1);
                    setTimeout(() => this.speak('o', 500, 0.1), 120);
                } else if (type === 'snore') {
                    this.speak('o', 100, 1.0, 0.05); // Low rumble
                } else if (type === 'purr') {
                    // Fast loop
                    for (let i = 0; i < 8; i++) setTimeout(() => this.speak('u', 60, 0.05, 0.05), i * 80);
                }
            }
        };

        // Helper: Spawn Emojis (Hearts, Zzz)
        function spawnEmoji(char) {
            const el = document.createElement('div');
            el.textContent = char;
            el.style.position = 'absolute';
            el.style.left = '50%';
            el.style.top = '0';
            el.style.transform = 'translateX(-50%)';
            el.style.color = char === '💖' ? '#f472b6' : '#a78bfa';
            el.style.fontSize = '20px';
            el.style.animation = 'floatUpFade 1.5s ease-out forwards';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '10060';
            aiChatButton.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }

        // =============== EYE TRACKING & INTERACTION ===============
        let petStrokeCount = 0;
        let lastPetTime = 0;

        const EyeController = {
            init() {
                // Immediate Hover Reaction (Fix "One Expression" request)
                if (aiChatButton) {
                    aiChatButton.addEventListener('mouseenter', () => {
                        if (robotBrain.state === 'IDLE' || robotBrain.state === 'SITTING') {
                            aiChatButton.classList.add('emotion-happy');
                            SoundEngine.play('cute'); // Changed from 'cheep'
                        }
                    });
                    aiChatButton.addEventListener('mouseleave', () => {
                        if (robotBrain.state === 'IDLE' || robotBrain.state === 'SITTING') {
                            aiChatButton.classList.remove('emotion-happy');
                        }
                    });
                }

                document.addEventListener('mousemove', (e) => {
                    robotBrain.lastActionTime = Date.now();

                    // Check for Petting (Rubbing)
                    const rect = aiChatButton.getBoundingClientRect();
                    if (e.clientX >= rect.left && e.clientX <= rect.right &&
                        e.clientY >= rect.top && e.clientY <= rect.bottom) {

                        const now = Date.now();
                        if (now - lastPetTime < 300) {
                            petStrokeCount++;
                        } else {
                            petStrokeCount = 0;
                        }
                        lastPetTime = now;

                        if (petStrokeCount > 10) {
                            robotBrain.startPetting();
                            petStrokeCount = 0;
                        }
                        return;
                    }

                    // Eye Tracking Logic
                    const eyes = document.querySelectorAll('.pupil');
                    if (eyes.length === 0 || aiChatButton.classList.contains('emotion-sleep')) return;

                    eyes.forEach(pupil => {
                        const r = pupil.getBoundingClientRect();
                        const x = (r.left + r.width / 2);
                        const y = (r.top + r.height / 2);
                        const rad = Math.atan2(e.clientX - x, e.clientY - y);
                        const rot = (rad * (180 / Math.PI) * -1) + 180;
                        pupil.style.transform = `rotate(${rot}deg) translateY(2px)`;
                    });
                });
            }
        };
        EyeController.init();

        // =============== AI SENSES (Listeners) ===============
        // 1. Typing Sense
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                aiChatButton.classList.add('emotion-processing');
                clearTimeout(window.typeTimer);
                window.typeTimer = setTimeout(() => {
                    aiChatButton.classList.remove('emotion-processing');
                }, 500);
            }
        });

        // 2. Click/Interact Sense
        document.addEventListener('mousedown', () => {
            // 10% chance to chirp on any click
            if (Math.random() < 0.1) SoundEngine.play('chirp');
        });

        // =============== ROBOT BRAIN (Autonomous Behavior) ===============
        const robotBrain = {
            state: 'IDLE',
            lastActionTime: Date.now(),

            init() {
                if (window.innerWidth < 768) return;
                setInterval(() => this.think(), 2500); // Think faster for sleep check
                console.log('🤖 Robot Brain: Online (Personality V2)');
            },

            think() {
                if (isDragging || aiChatWindow.style.display === 'flex') {
                    this.lastActionTime = Date.now();
                    return;
                }

                const timeSinceAction = Date.now() - this.lastActionTime;
                if (timeSinceAction > 60000 && this.state !== 'SLEEP') {
                    this.startSleep();
                    return;
                }

                // Don't interrupt these states
                if (['SLEEP', 'PETTING', 'DIZZY', 'TESTING'].includes(this.state)) return;

                const roll = Math.random();

                // Clear old emotions (except Sleep/Petting which are handled separately)
                aiChatButton.classList.remove('emotion-shocked', 'emotion-bored', 'emotion-love', 'emotion-angry', 'emotion-wink', 'emotion-happy');

                // 40% Chance to Change Expression/Sound
                if (roll < 0.4) {
                    const emotions = ['emotion-shocked', 'emotion-bored', 'emotion-love', 'emotion-angry', 'emotion-wink', 'emotion-happy'];
                    const emotion = emotions[Math.floor(Math.random() * emotions.length)];

                    aiChatButton.classList.add(emotion);
                    this.state = 'IDLE'; // Technically idle but expressive

                    // Voice Result
                    if (emotion === 'emotion-shocked') SoundEngine.play('shocked');
                    else if (emotion === 'emotion-love') { SoundEngine.play('happy'); spawnEmoji('💖'); }
                    else if (emotion === 'emotion-angry') SoundEngine.play('angry');
                    else if (emotion === 'emotion-wink') SoundEngine.play('cute');
                    else if (emotion === 'emotion-happy') SoundEngine.play('happy');

                    // Stay like this for 2s then clear
                    setTimeout(() => {
                        if (this.state === 'IDLE') aiChatButton.classList.remove(emotion);
                    }, 2000);
                }
                // 10% Chance to actually Move
                else if (roll < 0.5) {
                    this.roamToText();
                }
            },

            // --- DIAGNOSTIC SUITE ---
            runDiagnostics() {
                if (this.state === 'TESTING') return;
                console.log('🤖 STARTING SELF-DIAGNOSIS...');
                this.state = 'TESTING';

                const sequence = [
                    { action: () => { console.log('1. Sound Check'); SoundEngine.play('chirp'); }, delay: 500 },
                    { action: () => { console.log('2. Happy State'); aiChatButton.classList.add('emotion-happy'); SoundEngine.play('purr'); }, delay: 1500 },
                    { action: () => { console.log('3. Suspicious'); aiChatButton.className = ''; aiChatButton.classList.add('emotion-suspicious'); SoundEngine.play('boop'); }, delay: 3000 },
                    { action: () => { console.log('4. Petting'); aiChatButton.className = ''; this.startPetting(); }, delay: 4500 },
                    { action: () => { console.log('5. Sleep'); this.startSleep(); }, delay: 7000 },
                    { action: () => { console.log('6. Wake Up'); this.wakeUp(); }, delay: 10000 },
                    { action: () => { console.log('✅ DIAGNOSIS COMPLETE'); this.state = 'IDLE'; aiChatButton.className = ''; SoundEngine.play('chirp'); }, delay: 11000 }
                ];

                sequence.forEach(step => setTimeout(step.action, step.delay));
            },

            startSleep() {
                if (this.state === 'PETTING') return; // Don't sleep if being petted
                this.state = 'SLEEP';
                aiChatButton.classList.add('emotion-sleep');
                aiChatButton.style.animation = 'robotFloat 4s ease-in-out infinite'; // Slow float
                SoundEngine.play('snore');

                if (this.sleepInterval) clearInterval(this.sleepInterval);
                this.sleepInterval = setInterval(() => {
                    spawnEmoji('Zzz');
                }, 2000);
            },

            wakeUp() {
                if (this.state === 'SLEEP') {
                    clearInterval(this.sleepInterval);
                    aiChatButton.classList.remove('emotion-sleep');
                    this.state = 'IDLE';

                    // WAKE UP SHAKE
                    aiChatButton.style.animation = 'robotRun 0.4s ease-in-out';
                    setTimeout(() => aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite', 400);

                    SoundEngine.play('boop'); // Startled noise
                }
                this.lastActionTime = Date.now();
            },

            startPetting() {
                if (this.state === 'PETTING' || this.state === 'SLEEP') return;
                this.state = 'PETTING';
                aiChatButton.classList.add('emotion-petting');
                SoundEngine.play('purr');

                // Hearts
                let hearts = 0;
                const heartInt = setInterval(() => {
                    spawnEmoji('💖');
                    hearts++;
                    if (hearts > 5) {
                        clearInterval(heartInt);
                        aiChatButton.classList.remove('emotion-petting');
                        this.state = 'IDLE';
                        this.lastActionTime = Date.now();
                    }
                }, 300);
            },

            // ... (keep ensure roamToText, returnHome, teleportTo, moveTo, doTrick match existing) ...

            roamToText() {
                // ... existing roaming logic ...
                const elements = Array.from(document.querySelectorAll('h1, h2, h3, p, button, .nav-link'));
                const visible = elements.filter(el => {
                    const rect = el.getBoundingClientRect();
                    return (
                        rect.top > 100 &&
                        rect.bottom < window.innerHeight - 100 &&
                        rect.left > 50 &&
                        rect.right < window.innerWidth - 50
                    );
                });
                if (visible.length === 0) return;
                const target = visible[Math.floor(Math.random() * visible.length)];
                const rect = target.getBoundingClientRect();
                const targetX = rect.left - 20;
                const targetY = rect.top - 85;
                this.teleportTo(targetX, targetY, 'SITTING', target);
            },

            returnHome() {
                const homeX = window.innerWidth - 134;
                const homeY = window.innerHeight - 134;
                this.teleportTo(homeX, homeY, 'IDLE');
            },

            teleportTo(x, y, nextState, targetElement = null) {
                // Prevent teleport if Sleeping/Petting
                if (this.state === 'SLEEP' || this.state === 'PETTING') return;

                SoundEngine.play('boop');
                aiChatButton.classList.add('magic-dust');
                aiChatButton.style.animation = 'none';
                aiChatButton.style.opacity = '0';
                aiChatButton.style.transition = 'opacity 0.5s';
                this.state = 'MOVING';

                setTimeout(() => {
                    aiChatButton.style.right = 'auto';
                    aiChatButton.style.bottom = 'auto';
                    aiChatButton.style.left = `${x}px`;
                    aiChatButton.style.top = `${y}px`;
                    aiChatButton.className = '';
                    aiChatButton.id = 'ai-chat-button';

                    if (nextState === 'SITTING') {
                        aiChatButton.classList.add('robot-sitting');
                        aiChatButton.classList.add('emotion-happy');
                        SoundEngine.play('chirp');
                    } else {
                        aiChatButton.classList.add('robot-flying');
                        SoundEngine.play('cheep');
                    }
                    aiChatButton.style.opacity = '1';
                    aiChatButton.classList.remove('magic-dust');
                    aiChatButton.style.animation = 'magicalForm 0.8s ease-out';

                    setTimeout(() => {
                        if (nextState === 'SITTING') {
                            aiChatButton.style.animation = 'robotWobble 4s ease-in-out infinite';
                            this.state = 'SITTING';
                            /* Text Bubble Logic */
                            if (targetElement && targetElement.tagName.match(/H[1-6]/)) {
                                aiChatButton.setAttribute('data-bubble', "Ooh! " + targetElement.innerText.substring(0, 15) + "...");
                                aiChatButton.classList.add('bubble-visible');
                                setTimeout(() => aiChatButton.classList.remove('bubble-visible'), 4000);
                            }
                        } else {
                            aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite';
                            this.state = 'IDLE';
                            this.lastActionTime = Date.now();
                            aiChatButton.style.transform = 'scaleX(1)';
                        }
                    }, 800);
                }, 600);
            },

            moveTo(x, y) { this.teleportTo(x, y, 'ROAMING'); },

            doTrick() {
                aiChatButton.style.animation = 'robotJump 0.5s ease-in-out';
                setTimeout(() => {
                    if (this.state === 'IDLE') aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite';
                }, 500);
            }
        };

        // Initialize Brain
        robotBrain.init();

        // Listen for Test Command
        const chatInput = document.getElementById('ai-chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && chatInput.value.trim() === '/test') {
                    e.preventDefault();
                    robotBrain.runDiagnostics();
                    chatInput.value = '';
                    // Append system message
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'ai-message-wrapper received';
                    msgDiv.innerHTML = `<div class="ai-message">🤖 Running Diagnostics... Watch me!</div>`;
                    document.getElementById('ai-chat-messages').appendChild(msgDiv);
                }
            });
        }

        // Wake up listener
        document.addEventListener('mousedown', () => robotBrain.wakeUp()); // Wake on click
        document.addEventListener('keydown', () => robotBrain.wakeUp()); // Wake on type

    } // End initChatbot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }

    // v3.9.5: Global function for "Send Me a Message" button
    window.openChatAndNotify = function () {
        // Open the chat window
        const aiChatWindow = document.getElementById('ai-chat-window');
        const aiChatInput = document.getElementById('ai-chat-input');

        if (aiChatWindow) {
            aiChatWindow.style.display = 'flex';
            if (aiChatInput) setTimeout(() => aiChatInput.focus(), 120);
        }

        // Trigger contact
        sendContactRequest();
    };

    async function sendContactRequest() {
        const aiChatMessages = document.getElementById('ai-chat-messages');

        // Get or create user ID
        let userId = localStorage.getItem('chat_uid');
        if (!userId) {
            userId = 'web-' + Math.random().toString(36).substring(7) + Date.now().toString(36);
            localStorage.setItem('chat_uid', userId);
        }

        // Send contact request to backend
        try {
            const API_URL = 'https://AvinashAnalytics-avinash-chatbot.hf.space/ask';
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: "🔔 User clicked 'Send Me a Message' - wants to contact Avinash directly",
                    user_id: userId,
                    contact_request: true
                })
            });

            // Add welcome message to chat
            if (aiChatMessages) {
                const bubble = document.createElement('div');
                bubble.className = 'ai-msg';
                bubble.innerHTML = '📧 <b>Avinash has been notified!</b><br>He\'ll respond shortly. Feel free to describe what you\'d like to discuss.';
                aiChatMessages.appendChild(bubble);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
            }
        } catch (error) {
            console.error('Failed to send contact request:', error);
        }
    }
})();
