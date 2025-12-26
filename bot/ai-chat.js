/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   ai-chat.js - lightweight chat widget client
   ✅ Fixed API endpoint: /ask with 'question' field
===================================================== */
(function () {
    'use strict';

    function createChatbotWidget() {
        if (!document.getElementById('ai-chat-button')) {
            const btn = document.createElement('div');
            btn.id = 'ai-chat-button';
            // Critical CSS fallback
            btn.style.cssText = "position:Fixed; bottom:20px; right:20px; width:100px; height:100px; z-index:10060; cursor:pointer;";
            // Force Click Listener
            // Click handled by handleDragEnd to distinguish drag vs click
            // btn.onclick removed to prevent double toggle and unwanted contact requests
            document.body.appendChild(btn);
        }
        if (!document.getElementById('ai-chat-window')) {
            const win = document.createElement('div');
            win.id = 'ai-chat-window';
            win.style.display = 'none';
            win.innerHTML = `
                <div id="ai-chat-header">
                    <span>Avinash Rai • AI Twin</span>
                    <button id="ai-chat-speaker" title="Text-to-Speech">🔊</button>
                    <button id="ai-chat-close">×</button>
                </div>
                <div id="ai-chat-messages"></div>
                <div id="ai-chat-input-box">
                    <div id="ai-chat-mic">🎤</div>
                    <input type="text" id="ai-chat-input" placeholder="Type a message...">
                    <button id="ai-chat-send">➤</button>
                    <button id="ai-chat-attach" class="ai-icon-btn" style="margin-left:5px">📎</button>
                    <input type="file" id="ai-chat-file" hidden>
                </div>
            `;
            document.body.appendChild(win);
        }
    }

    function initChatbot() {
        createChatbotWidget();
        // =============== DOM ELEMENTS ===============
        const aiChatButton = document.getElementById('ai-chat-button');
        // v3.25: Build Live CSS Robot Structure (No Image)
        if (aiChatButton) {
            aiChatButton.innerHTML = `
                <div class="glass-reflection"></div>
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

        // =============== VOICE INTERACTION (Groq) ===============
        let isVoiceActive = false;
        let mediaRecorder = null;
        let audioChunks = [];
        let aiChatMic = document.getElementById('ai-chat-mic');

        if (!aiChatMic && aiChatSend) {
            aiChatMic = document.createElement('button');
            aiChatMic.id = 'ai-chat-mic';
            aiChatMic.innerHTML = '🎤';
            aiChatMic.className = 'ai-icon-btn';
            aiChatMic.style.cssText = "background:none; border:none; font-size:1.5rem; cursor:pointer; margin-right:10px;";
            aiChatSend.parentNode.insertBefore(aiChatMic, aiChatSend);

            aiChatMic.addEventListener('click', () => {
                if (!mediaRecorder || mediaRecorder.state === 'inactive') startRecording();
                else stopRecording();
            });
        }

        async function startRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                isVoiceActive = true;
                aiChatMic.classList.add('recording');

                mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    aiChatMic.classList.remove('recording');

                    const blob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('file', blob, 'voice.webm');

                    try {
                        const res = await fetch('https://AvinashAnalytics-avinash-chatbot.hf.space/api/stt', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.text) {
                            aiChatInput.value = data.text;
                            // Trigger sendMessage (assuming it's available in scope or attached to event)
                            const sendBtn = document.getElementById('ai-chat-send');
                            if (sendBtn) sendBtn.click();
                        }
                    } catch (e) { console.error('STT Error:', e); }
                };
                mediaRecorder.start();
            } catch (e) { alert('Microphone access denied'); }
        }

        function stopRecording() { if (mediaRecorder) mediaRecorder.stop(); }

        async function playTTS(text) {
            // Check RobotBrain voice setting
            if (!RobotBrain.voiceEnabled) return;

            try {
                // Fixed URL casing to lowercase
                const res = await fetch('https://avinashanalytics-avinash-chatbot.hf.space/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text })
                });
                if (res.ok) {
                    const blob = await res.blob();
                    const audio = new Audio(URL.createObjectURL(blob));
                    // Handle Autoplay promise
                    audio.play().catch(e => {
                        console.warn("Autoplay blocked:", e);
                        addMessage("⚠️ Audio playback blocked. Please interact with the page.", 'ai-msg');
                    });

                    if (aiChatButton) aiChatButton.classList.add('emotion-happy');
                    audio.onended = () => { if (aiChatButton) aiChatButton.classList.remove('emotion-happy'); };
                } else {
                    console.error("TTS API Error:", res.status);
                }
            } catch (e) { console.error('TTS Network Error', e); }
        }

        // =============== API URL ===============
        // ✅ Correct HuggingFace Space URL with /ask endpoint (lowercase standardized)
        const API_URL = 'https://avinashanalytics-avinash-chatbot.hf.space/ask';

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
            isDragging = false;
            window.isDragging = false; // Sync global
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
                window.isDragging = true; // Sync global
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
            if (e) { e.preventDefault(); e.stopPropagation(); }

            // GENIE EFFECT (Glass Opening)
            if (aiChatWindow.style.display === 'flex' && !aiChatWindow.classList.contains('closing')) {
                aiChatWindow.classList.add('closing');
                aiChatWindow.style.opacity = '0';
                aiChatWindow.style.transform = 'scale(0) translateY(100px)';
                // Reset origin to button
                const btnRect = aiChatButton.getBoundingClientRect();
                // We can't easily change transform-origin dynamically effectively without glitching, 
                // but default CSS origin (bottom right) works well for "returning into button".

                setTimeout(() => {
                    aiChatWindow.style.display = 'none';
                    aiChatWindow.classList.remove('closing');
                }, 300);
            } else {
                aiChatWindow.style.display = 'flex';
                aiChatWindow.style.opacity = '0';
                aiChatWindow.style.transform = 'scale(0) translateY(100px)';

                // Force reflow
                aiChatWindow.offsetHeight;

                aiChatWindow.style.transition = 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)'; // Genie Curve
                aiChatWindow.style.opacity = '1';
                aiChatWindow.style.transform = 'scale(1) translateY(0)';

                if (aiChatInput) setTimeout(() => aiChatInput.focus(), 150);
            }
        }

        // Attach Listeners to Button
        aiChatButton.addEventListener('mousedown', handleDragStart);
        aiChatButton.addEventListener('touchstart', handleDragStart, { passive: false });

        // Speaker Toggle
        const speakerBtn = document.getElementById('ai-chat-speaker');
        if (speakerBtn) {
            speakerBtn.onclick = (e) => {
                e.stopPropagation();
                RobotBrain.toggleVoice();
            }
        }

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

            // --- RESUME INTERCEPT ---
            const lower = text.toLowerCase();

            // --- DIAGNOSTIC COMMAND ---
            if (lower === '/test-robot') {
                addMessage("🛠 Starting Diagnostics...", 'ai-msg');
                RobotBrain.runDiagnostics();
                return;
            }

            // --- RESUME INTERCEPT ---
            if (lower.includes('resume') || lower.includes('cv') || (lower.includes('hire') && lower.includes('you'))) {
                // Trigger Resume Agent
                RobotBrain.sendResume();
                return;
            }

            conversationHistory.push({ role: 'user', content: text });
            saveConversationHistory(); // SAVE

            isLoading = true;
            showTyping();

            // Brain+ Thinking
            RobotBrain.think();

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

                // Brain+ Stop Thinking & Speak
                RobotBrain.stopThinking();
                setTimeout(() => RobotBrain.speak(reply), 200);

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
        function getUserId() {
            let userId = localStorage.getItem('chat_uid');
            if (!userId) {
                userId = 'web-' + Math.random().toString(36).substring(7) + Date.now().toString(36);
                localStorage.setItem('chat_uid', userId);
            }
            return userId;
        }

        function addMessage(text, className, id = null) {
            if (!aiChatMessages) return;
            const bubble = document.createElement('div');
            bubble.className = className;
            if (id) bubble.id = id;  // Support optional ID for temp messages

            // v3.19: Properly render AI responses with HTML/markdown, escape user messages
            if (className === 'ai-msg') {
                // AI messages: Sanitize first, then allow line breaks
                // This prevents XSS while preserving formatting
                bubble.innerHTML = escapeHtml(text).replace(/\\n/g, '<br>');
            } else {
                // User messages: Escape HTML for security
                bubble.innerHTML = escapeHtml(text).replace(/\\n/g, '<br>');
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

                    if (data.replies && data.replies.length > 0) {
                        const newIds = [];

                        data.replies.forEach(msg => {
                            // v3.17: Use message ID for duplicate detection instead of text
                            const exists = conversationHistory.some(h => h.msg_id === msg.id);
                            if (!exists) {
                                const content = msg.text || (msg.media ? "[Media]" : "...");

                                // v3.18: Add message to DOM FIRST
                                addMessage(content, 'ai-msg');

                                // v3.26: Voice TTS Hook checks RobotBrain internally now
                                if (typeof playTTS === 'function') playTTS(content);
                                else if (RobotBrain && RobotBrain.speak) RobotBrain.speak(content);

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
                                    await fetch('https://avinashanalytics-avinash-chatbot.hf.space/api/ack_replies', {
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
                }
            } catch (e) {
                console.error('[Poll Replies] Error:', e);
            }
        }

        // Start polling every 3 seconds
        setInterval(pollReplies, 3000);

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

        // =============== SOUND ENGINE (Organic Tech) ===============
        let lastOut = 0; // For Pink Noise (must be before SoundEngine)

        const SoundEngine = {
            ctx: null,
            masterGain: null,
            reverb: null,
            noiseBuffer: null,

            init() {
                if (this.ctx) return;
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();

                    this.masterGain = this.ctx.createGain();
                    this.masterGain.gain.value = 0.6;

                    // CINEMATIC REVERB (Glass Orb Physics)
                    this.reverb = this.ctx.createConvolver();
                    this.generateImpulseResponse();

                    // GENERATE PINK NOISE (For Breath/Wind texture)
                    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
                    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const output = this.noiseBuffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        output[i] = (lastOut + (0.02 * white)) / 1.02;
                        lastOut = output[i];
                        output[i] *= 3.5; // Compensate for gain
                    }

                    this.masterGain.connect(this.reverb);
                    this.reverb.connect(this.ctx.destination);
                    this.masterGain.connect(this.ctx.destination);

                    const resume = () => { if (this.ctx.state === 'suspended') this.ctx.resume(); };
                    ['click', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, resume));
                } catch (e) { console.warn("Audio Init Error", e); }
            },

            generateImpulseResponse() {
                // Glass Decay
                const duration = 1.0;
                const rate = this.ctx.sampleRate;
                const length = rate * duration;
                const impulse = this.ctx.createBuffer(2, length, rate);
                const l = impulse.getChannelData(0), r = impulse.getChannelData(1);
                for (let i = 0; i < length; i++) {
                    const n = i / length;
                    l[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 3);
                    r[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 3);
                }
                this.reverb.buffer = impulse;
            },

            // ORGANIC TONE: Oscillator + Breath Noise
            playTone(freq, duration, type = 'sine') {
                if (!this.ctx) this.init();
                const t = this.ctx.currentTime;

                // 1. Tonal Core
                const osc = this.ctx.createOscillator();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, t);

                const oscGain = this.ctx.createGain();
                oscGain.gain.setValueAtTime(0, t);
                oscGain.gain.linearRampToValueAtTime(0.2, t + 0.05);
                oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

                // 2. Breath/Wind Texture (Pink Noise)
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.noiseBuffer;
                noise.loop = true;

                const noiseGain = this.ctx.createGain();
                noiseGain.gain.setValueAtTime(0, t);
                noiseGain.gain.linearRampToValueAtTime(0.05, t + 0.02); // Subtle breath
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

                // Connect
                osc.connect(oscGain);
                oscGain.connect(this.masterGain);

                noise.connect(noiseGain);
                noiseGain.connect(this.masterGain);

                osc.start(t);
                osc.stop(t + duration + 0.1);
                noise.start(t);
                noise.stop(t + duration + 0.1);
            },

            play(type) {
                if (!this.ctx) this.init();
                if (this.ctx.state === 'suspended') this.ctx.resume(); // Fix browser policy

                switch (type) {
                    case 'chirp':
                        this.playTone(523.25, 0.3, 'sine');
                        setTimeout(() => this.playTone(659, 0.3, 'sine'), 80);
                        break;
                    case 'laugh':
                        for (let i = 0; i < 5; i++) {
                            setTimeout(() => this.playTone(400 + (Math.random() * 200), 0.15, 'triangle'), i * 120);
                        }
                        break;
                    case 'angry':
                        this.playTone(100, 0.5, 'sawtooth');
                        break;
                    case 'purr':   // Pet sound
                        this.playTone(200, 0.8, 'sine');
                        setTimeout(() => this.playTone(220, 0.8, 'sine'), 200);
                        break;
                    case 'boop':   // Teleport/Wake sound
                        this.playTone(440, 0.15, 'sine');
                        break;
                    case 'snore':  // Sleep sound
                        this.playTone(80, 1.0, 'sine');
                        break;
                    case 'cheep':  // Flying/Movement sound
                        this.playTone(880, 0.2, 'triangle');
                        break;
                    default:
                        this.playTone(880, 0.1, 'sine');
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

        // NOTE: Voice input is handled by MediaRecorder (lines 91-128) using Hugging Face STT API.
        // The duplicate SpeechRecognition handler has been removed to prevent conflicting audio systems.


        // =============== EYE TRACKING (Vector Math) ===============
        const EyeController = {
            init() {
                // Add Iris & Glint to existing pupils via JS if not in HTML
                document.querySelectorAll('.pupil').forEach(p => {
                    if (!p.querySelector('.iris')) {
                        p.innerHTML = '<div class="iris"><div class="glint"></div></div>';
                    }
                });

                document.addEventListener('mousemove', (e) => {
                    RobotBrain.lastActionTime = Date.now();

                    const eyes = document.querySelectorAll('.eye'); // Target the socket
                    if (eyes.length === 0 || aiChatButton.classList.contains('emotion-sleep')) return;

                    eyes.forEach(eye => {
                        const pupil = eye.querySelector('.pupil');
                        if (!pupil) return;

                        // Get eye center
                        const rect = eye.getBoundingClientRect();
                        const eyeCenterX = rect.left + rect.width / 2;
                        const eyeCenterY = rect.top + rect.height / 2;

                        // Vector to mouse
                        const dx = e.clientX - eyeCenterX;
                        const dy = e.clientY - eyeCenterY;
                        const angle = Math.atan2(dy, dx);

                        // Clamp distance (Radius) - Keep pupil inside eye
                        const maxRadius = (rect.width / 2) - 4; // Margin
                        const dist = Math.min(Math.hypot(dx, dy), maxRadius + 15); // Add range for "looking far"

                        // Map distance to movement (max 6px)
                        const moveDist = Math.min(dist / 10, 6);

                        const moveX = Math.cos(angle) * moveDist;
                        const moveY = Math.sin(angle) * moveDist;

                        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    });

                    // "Clever" Squint on fast movement
                    // (Simple heuristic: if mouse moved far since last frame? - skipped for performance usually, 
                    // but we can add random "scan" states in RobotBrain)
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


        // Wake up listener
        document.addEventListener('mousedown', () => RobotBrain.wakeUp()); // Wake on click
        document.addEventListener('keydown', () => RobotBrain.wakeUp()); // Wake on type

        // =============== ROBOT BRAIN (Autonomous Behavior) ===============
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        const RobotBrain = {
            state: 'IDLE',
            lastActionTime: Date.now(),

            // Stalking Logic
            isStalking: true,
            currentX: window.innerWidth - 120, // Initial estimate
            currentY: window.innerHeight - 120,

            init() {
                this.startExpressionEngine();
                this.stalkLoop();
                this.observeCursor();
                this.checkOfficeHours(); // Real World Awareness

                // Scroll Humor
                window.addEventListener('scroll', () => this.handleScroll());

                // Visibility API (Tab Focus)
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        this.startSleep();
                    } else {
                        this.wakeUp();
                        this.speak("Welcome back!");
                    }
                });

                // Track mouse global
                document.addEventListener('mousemove', (e) => {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                    this.lastActionTime = Date.now();
                    this.checkHover(e.target);
                    this.handlePetting(e); // Check for rubbing
                });
            },

            // --- REAL WORLD AWARENESS ---
            checkOfficeHours() {
                const hour = new Date().getHours();
                const isWorkTime = hour >= 9 && hour <= 18;
                if (isWorkTime) {
                    this.contextMap['avinash'] = "He's likely coding right now! 👨‍💻";
                } else {
                    this.contextMap['avinash'] = "He's probably resting or gaming. 🎮";
                }
            },

            // --- SCROLL HUMOR ENGINE ---
            lastScrollY: 0,
            scrollTimer: null,
            isScrollCool: true,

            handleScroll() {
                if (!this.isScrollCool || this.state === 'SLEEP') return;

                const currentY = window.scrollY;
                const delta = currentY - this.lastScrollY;
                const speed = Math.abs(delta);

                // Fast Scroll Detection (Threshold: 100px difference per event check)
                if (speed > 100) {
                    // Debounce
                    clearTimeout(this.scrollTimer);
                    this.scrollTimer = setTimeout(() => this.triggerScrollReaction(), 200);
                }
                this.lastScrollY = currentY;
            },

            triggerScrollReaction() {
                if (!this.isScrollCool) return;
                this.isScrollCool = false;

                // 30% Chance to react
                if (Math.random() < 0.3) {
                    const comments = [
                        "Weeeee! 🎢",
                        "Slow down! I'm getting dizzy! 😵",
                        "Whoa! Too fast! 🚀",
                        "Reading speed: 1000 WPM! ⚡",
                        "Wait for me! 🏃‍♂️",
                        "Scanning content... 👁️"
                    ];
                    const pick = comments[Math.floor(Math.random() * comments.length)];

                    this.showThinking(pick);
                    aiChatButton.classList.add('robot-shake'); // Reuse shake animation
                    setTimeout(() => aiChatButton.classList.remove('robot-shake'), 1000);

                    if (this.voiceEnabled) this.speak(pick);
                }

                // Cooldown 4s
                setTimeout(() => { this.isScrollCool = true; }, 4000);
            },

            // --- PETTING LOGIC (Rubbing Detection) ---
            lastMouseX: 0,
            lastMouseY: 0,
            rubDistance: 0,

            handlePetting(e) {
                // Only if hovering robot
                const rect = aiChatButton.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {

                    const delta = Math.hypot(e.clientX - this.lastMouseX, e.clientY - this.lastMouseY);
                    this.rubDistance += delta;

                    if (this.rubDistance > 500) { // Threshold
                        this.startPetting();
                        this.rubDistance = 0;
                    }
                } else {
                    this.rubDistance = 0; // Reset if left robot
                }
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            },

            stalkLoop() {
                requestAnimationFrame(() => this.stalkLoop());

                // Conditions to STOP stalking
                if (!this.isStalking ||
                    this.state === 'SLEEP' ||
                    isDragging ||
                    aiChatWindow.style.display === 'flex') {
                    return;
                }

                // Get current button position
                const rect = aiChatButton.getBoundingClientRect();
                const btnX = rect.left + rect.width / 2;
                const btnY = rect.top + rect.height / 2;

                // Calculate distance to mouse
                const dx = mouseX - btnX;
                const dy = mouseY - btnY;
                const dist = Math.hypot(dx, dy);

                // Logic: Follow if far, Stop if close
                const targetDist = 200; // Personal space
                const activationDist = 350; // Start following if this far

                if (dist > activationDist) {
                    // Update internal coordinates (Lerp)
                    // We need to convert fixed position "right/bottom" to "left/top" for movement
                    // Or just stick to left/top once moved.

                    // Simple Lerp (Very Slow Drift)
                    const speed = 0.005;

                    // Update our internal tracking if CSS moved it (e.g. initial load)
                    this.currentX = lerp(this.currentX, mouseX - 100, speed); // Offset slightly
                    this.currentY = lerp(this.currentY, mouseY, speed);

                    // Apply
                    aiChatButton.style.right = 'auto';
                    aiChatButton.style.bottom = 'auto';
                    aiChatButton.style.left = `${this.currentX}px`;
                    aiChatButton.style.top = `${this.currentY}px`;

                    // Add "Flying" class for tilt effect
                    aiChatButton.classList.add('robot-flying');
                } else if (dist < targetDist + 50) {
                    aiChatButton.classList.remove('robot-flying');
                    // Settle
                }
            },



            laugh() {
                aiChatButton.classList.add('emotion-happy');
                aiChatButton.style.animation = 'robotJump 0.5s ease-in-out infinite';
                SoundEngine.play('laugh');
                spawnEmoji('😂');

                setTimeout(() => {
                    aiChatButton.style.animation = ''; // Reset
                    aiChatButton.classList.remove('emotion-happy');
                    // Restore float
                    aiChatButton.offsetHeight;
                    aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite';
                }, 2000);
            },



            // --- CONTEXT AWARENESS ENGINE ---
            hoverTimer: null,
            lastHovered: null,



            // --- SUGGESTION ENGINE ---
            idleSeconds: 0,
            suggestionList: [
                "Ask me about Avinash's Resume! 📄",
                "I can detail his Work Experience! 💼",
                "Ask about his Real-World Projects! 🚀",
                "Curious about the Tech Stack? Ask me! 🛠️",
                "I can verify his skills for you! ✅",
                "Ask: 'Why should we hire him?' 🤝"
            ],

            observeCursor() {
                console.log('👁️ Robot Eye: Scanning for keywords...');

                // Active Scan Interval (Heartbeat)
                setInterval(() => {
                    // Only active if idle and not chatting
                    if (this.state === 'IDLE' && aiChatWindow.style.display !== 'flex') {

                        const el = document.elementFromPoint(mouseX, mouseY);
                        const foundContext = el ? this.checkHover(el) : false;

                        if (!foundContext) {
                            this.idleSeconds++;

                            // Every 12 seconds (~20 ticks * 0.6s) show a proactive suggestion
                            if (this.idleSeconds > 20) {
                                this.idleSeconds = 0;
                                // Random Suggestion
                                const text = this.suggestionList[Math.floor(Math.random() * this.suggestionList.length)];
                                this.showThinking(text);
                            }
                        } else {
                            this.idleSeconds = 0; // Reset if found something
                        }
                    }
                }, 600);
            },

            // Dictionary of Contexts
            contextMap: {
                // Skills from Index.html
                'snowflake': "I'm a Snowflake Data Warehouse expert! ❄️",
                'dbt': "I build modular transformation pipelines with dbt! 🧱",
                'matillion': "I orchestrate ETL workflows using Matillion! ⚙️",
                'azure': "I architect solutions on Azure Data Factory! ☁️",
                'python': "I write Python for Data Engineering & AI! 🐍",
                'sql': "I speak fluent SQL! (Select * From Awesome) 🗄️",
                'power bi': "I visualize insights in Power BI! 📊",
                'alteryx': "I automate data prep with Alteryx! 🔄",
                'aws': "I deploy on AWS S3, Lambda & Glue! ☁️",

                // Projects
                'neural': "That's my Neural Transliteration project! (LSTM + LLMs) 🧠",
                'transliteration': "Converting Roman to Devanagari using Deep Learning! 🇮🇳",
                'schema': "My Schema Evolution Framework! It heals pipelines automatically. 🛡️",
                'shopverse': "An E-commerce pipeline with dbt & Snowflake! 🛍️",
                'credit': "Analyzing financial data with dimensional modeling! 💳",
                'cortex': "Snowflake Cortex AI for intelligent ETL! 🤖",

                // Personal
                'avinash': "That's my boss! He's a Data Engineering Wizard. 🧙‍♂️",
                'contact': "Want to hire him? Click here! 📩",
                'resume': "I can send you his resume! Just ask. 📄",
                'github': "Check out our open source code! 🐙",
                'linkedin': "Let's connect professionally! 🤝"
            },

            checkHover(target) {
                if (!target) return false;

                // Stop if hovering robot itself
                if (target.closest('#ai-chat-button') || target.closest('#ai-chat-window')) return false;

                // Simple keyword check in text content or class
                const text = (target.innerText || "").toLowerCase();
                const classes = (target.className || "").toString().toLowerCase();

                let foundKey = null;

                // Check Map
                for (const key in this.contextMap) {
                    if (text.includes(key) || classes.includes(key)) {
                        foundKey = key;
                        break;
                    }
                }

                // If found interesting thing
                if (foundKey) {
                    if (this.lastHovered === foundKey) return true; // Already thinking about it

                    this.lastHovered = foundKey;

                    // Show Specific Context Bubble
                    this.showThinking(this.contextMap[foundKey]);
                    return true;
                } else {
                    this.lastHovered = null;
                    return false;
                }
            },

            showThinking(text) {
                // remove old bubble
                const old = document.querySelector('.thought-bubble');
                if (old) old.remove();

                const bubble = document.createElement('div');
                bubble.className = 'thought-bubble';
                bubble.innerText = text;

                // Click to ask
                bubble.onclick = (e) => {
                    e.stopPropagation();
                    const question = "Tell me about " + text.split('!')[0].replace("I'm a ", "").replace("That's ", ""); // Extract topic roughly

                    // Open Chat
                    if (aiChatWindow.style.display !== 'flex') {
                        // Trigger toggle logic
                        const btn = document.getElementById('ai-chat-button');
                        if (btn) btn.click();
                    }

                    setTimeout(() => {
                        if (aiChatInput) {
                            aiChatInput.value = question;
                            // processUserMessage() is not global, need to trigger send button or similar
                            const sendBtn = document.getElementById('ai-chat-send');
                            if (sendBtn) sendBtn.click();
                        }
                    }, 500);

                    bubble.remove();
                };

                document.body.appendChild(bubble);

                // Position follows robot (but above)
                const btnRect = aiChatButton.getBoundingClientRect();
                const bubbleRect = bubble.getBoundingClientRect();

                // Center Helper
                let leftPos = btnRect.left + (btnRect.width / 2) - (bubbleRect.width / 2);

                // Safety: Don't go off screen left/right
                if (leftPos < 10) leftPos = 10;
                if (leftPos + bubbleRect.width > window.innerWidth - 10) {
                    leftPos = window.innerWidth - bubbleRect.width - 10;
                }

                bubble.style.left = leftPos + 'px';
                bubble.style.top = (btnRect.top - bubbleRect.height - 15) + 'px'; // 15px above

                // Animate In
                requestAnimationFrame(() => bubble.classList.add('visible'));

                // Auto hide after 5s
                setTimeout(() => {
                    bubble.classList.remove('visible');
                    setTimeout(() => bubble.remove(), 400);
                }, 5000);
            },

            // --- BRAIN+ & VOICE ENGINE ---
            isThinking: false,
            voiceEnabled: false,

            toggleVoice() {
                this.voiceEnabled = !this.voiceEnabled;
                const btn = document.getElementById('ai-chat-speaker');
                if (btn) {
                    btn.className = this.voiceEnabled ? 'active' : '';
                    btn.innerHTML = this.voiceEnabled ? '🔊' : '🔇';
                }
                const status = this.voiceEnabled ? "Voice activated." : "Voice muted.";
                if (this.voiceEnabled) this.speak(status);
            },

            speak(text) {
                // Redirect to backend TTS
                playTTS(text);

                // Animate mouth (fallback if playTTS fails or latency)
                if (this.voiceEnabled) {
                    aiChatButton.classList.add('robot-talking');
                    setTimeout(() => aiChatButton.classList.remove('robot-talking'), 3000);
                }
            },

            think() {
                this.isThinking = true;
                aiChatButton.classList.add('robot-thinking');
            },

            stopThinking() {
                this.isThinking = false;
                aiChatButton.classList.remove('robot-thinking');
            },

            doFunnyAct() {
                if (this.state !== 'IDLE') return;

                const roll = Math.random();

                // MISCHIEF ENGINE (5% Chance)
                if (roll < 0.05) {
                    aiChatButton.classList.add('emotion-evil');
                    SoundEngine.play('laugh'); // Evil Laugh
                    this.speak("I am plotting something...");

                    setTimeout(() => {
                        aiChatButton.classList.remove('emotion-evil');
                    }, 4000);
                    return;
                }

                // Normal Acts
                const acts = ['robot-backflip', 'robot-spin', 'robot-shake'];
                const act = acts[Math.floor(Math.random() * acts.length)];
                aiChatButton.classList.add(act); // Uses class animation now
                // Also trigger inline style for old animations if needed
                if (act.includes('robotJump')) aiChatButton.style.animation = 'robotJump 0.5s ease';

                SoundEngine.play('chirp');

                setTimeout(() => {
                    aiChatButton.classList.remove(act);
                    aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite';
                }, 1000);
            },

            // --- RESUME AGENT ---
            sendResume() {
                const aiChatMessages = document.getElementById('ai-chat-messages');

                // Simulate typing
                this.think();
                setTimeout(() => {
                    this.stopThinking();
                    // Add message
                    const msg = document.createElement('div');
                    msg.className = 'ai-msg';
                    msg.innerHTML = "Submitting Resume for review... 📄<br>Here is the file.";
                    aiChatMessages.appendChild(msg);

                    // Card
                    const card = document.createElement('div');
                    card.className = 'resume-card';
                    card.innerHTML = `
                        <div class="resume-icon">📄</div>
                        <div class="resume-info">
                            <span class="resume-title">Avinash_Resume_2025.pdf</span>
                            <span class="resume-subtitle">PDF • 2.4 MB</span>
                        </div>
                        <div style="margin-left:auto">⬇️</div>
                     `;
                    card.onclick = async () => {
                        // Use Secure Backend Endpoint
                        const resumeUrl = 'https://avinashanalytics-avinash-chatbot.hf.space/api/resume';

                        try {
                            // Check if link allows redirect or returns message
                            // We use fetch first to see if it's JSON (message) or Redirect (file)
                            // Note: fetch follow redirects by default, so we might check content-type
                            const res = await fetch(resumeUrl, { method: 'HEAD' });

                            // If it's a 403/message, the backend handles it? 
                            // Actually, fetch with 'HEAD' might follow redirect.
                            // Simpler: Just open. If it's 403, the user sees the JSON in new tab.
                            // BETTER: Fetch JSON first.
                        } catch (e) { }

                        // Simply open. If it's a file/redirect, it opens.
                        // If it's 403, we want to show the message inside chat instead of a dead tab.

                        // Let's do a fetch check:
                        fetch(resumeUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
                            .then(async response => {
                                if (response.ok && response.redirected) {
                                    window.open(response.url, '_blank');
                                } else if (response.status === 403) {
                                    const data = await response.json();
                                    this.speak(data.message);
                                    const aiChatMessages = document.getElementById('ai-chat-messages');
                                    const msg = document.createElement('div');
                                    msg.className = 'ai-msg';
                                    msg.innerHTML = "🔒 " + data.message;
                                    aiChatMessages.appendChild(msg);
                                    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
                                } else {
                                    // It's likely a direct file or redirect
                                    window.open(resumeUrl, '_blank');
                                }
                            })
                            .catch(() => window.open(resumeUrl, '_blank'));
                    };
                    aiChatMessages.appendChild(card);
                    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
                    this.speak("Tap to access my resume.");
                }, 1500);
            },

            // --- BRAIN+ FEATURES (RESTORED) ---

            startExpressionEngine() {
                setInterval(() => {
                    if (this.state === 'SLEEP' || isDragging || this.isThinking) return;

                    // Check for sleep
                    if (Date.now() - this.lastActionTime > 60000) {
                        this.startSleep();
                        return;
                    }

                    // Random Expressions & Roaming
                    const roll = Math.random();
                    if (roll < 0.2) {
                        const emotions = ['suspicious', 'confused', 'love', 'shocked', 'bored'];
                        const pick = emotions[Math.floor(Math.random() * emotions.length)];
                        aiChatButton.classList.add(`emotion-${pick}`);
                        SoundEngine.play('chirp');

                        setTimeout(() => aiChatButton.classList.remove(`emotion-${pick}`), 3000);
                    } else if (roll < 0.25) {
                        this.roamToText();
                    }
                }, 5000);
            },

            startSleep() {
                if (this.state === 'PETTING') return;
                this.state = 'SLEEP';
                aiChatButton.classList.add('emotion-sleep');
                aiChatButton.style.animation = 'robotFloat 4s ease-in-out infinite';
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

                    // New Pop Animation
                    aiChatButton.style.animation = 'robotWakeShake 0.6s ease-out';
                    setTimeout(() => aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite', 600);

                    SoundEngine.play('boop');
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

            // --- MOVEMENT ENGINE ---
            roamToText() {
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

                            if (targetElement && targetElement.tagName.match(/H[1-6]/)) {
                                aiChatButton.setAttribute('data-bubble', "Ooh! " + targetElement.innerText.substring(0, 15) + "...");
                                aiChatButton.classList.add('bubble-visible');
                                setTimeout(() => aiChatButton.classList.remove('bubble-visible'), 4000);
                            }

                            setTimeout(() => {
                                this.returnHome();
                                this.isStalking = true;  // Resume stalking after returning home
                            }, 10000);

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

        // Utils
        function lerp(start, end, amt) {
            return (1 - amt) * start + amt * end;
        }

        // Helper: Render Suggestion Chips
        function renderSuggestions() {
            const container = document.createElement('div');
            container.className = 'suggestion-container';
            const tips = [
                "Who are you?",
                "Tell me a joke",
                "Roast me!",
                "Sing a song",
                "Verify Systems"
            ];

            tips.forEach(tip => {
                const chip = document.createElement('div');
                chip.className = 'suggestion-chip';
                chip.textContent = tip;
                chip.onclick = () => {
                    aiChatInput.value = tip;
                    sendMessage();
                    container.remove();
                };
                container.appendChild(chip);
            });
            return container;
        }

        // =============== INITIALIZATION ===============
        // Initializing Components
        EyeController.init();
        SoundEngine.init();
        RobotBrain.init(); // Start Brain

        // Expose for debugging
        window.robotBrain = RobotBrain;
        window.toggleAiChat = toggleChat; // Expose global toggle
        window.toggleAngryMode = () => {
            aiChatButton.classList.toggle('emotion-angry');
            SoundEngine.play('angry');
        };

        // v3.9.5: Global function for "Send Me a Message" button
        window.openChatAndNotify = function () {
            // Open the chat window using animation
            if (window.toggleAiChat) {
                // Only open if closed
                const aiChatWindow = document.getElementById('ai-chat-window');
                if (aiChatWindow && aiChatWindow.style.display !== 'flex') {
                    window.toggleAiChat();
                }
            } else {
                // Fallback
                const aiChatWindow = document.getElementById('ai-chat-window');
                if (aiChatWindow) aiChatWindow.style.display = 'flex';
            }

            // Focus input
            const aiChatInput = document.getElementById('ai-chat-input');
            if (aiChatInput) setTimeout(() => aiChatInput.focus(), 150);

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
        };
    } // End of initChatbot

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }

})(window);
