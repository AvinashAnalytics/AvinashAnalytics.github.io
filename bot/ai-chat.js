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
            btn.onclick = function (e) {
                if (!window.isDragging) window.openChatAndNotify();
            };
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
            try {
                const res = await fetch('https://AvinashAnalytics-avinash-chatbot.hf.space/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text })
                });
                if (res.ok) {
                    const blob = await res.blob();
                    const audio = new Audio(URL.createObjectURL(blob));
                    audio.play();
                    if (aiChatButton) aiChatButton.classList.add('emotion-happy');
                    audio.onended = () => { if (aiChatButton) aiChatButton.classList.remove('emotion-happy'); };
                }
            } catch (e) { console.error('TTS Error', e); }
        }

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

                            // v3.26: Voice TTS Hook
                            if (isVoiceActive) playTTS(content);

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

        // =============== SOUND ENGINE (Organic Tech) ===============
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

                if (type === 'chirp') {
                    this.playTone(523.25, 0.3, 'sine');
                    setTimeout(() => this.playTone(659, 0.3, 'sine'), 80);
                } else if (type === 'laugh') {
                    // Laugh: Rapid burst of modulations
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => this.playTone(400 + (Math.random() * 200), 0.15, 'triangle'), i * 120);
                    }
                } else if (type === 'angry') {
                    this.playTone(100, 0.5, 'sawtooth');
                } else {
                    this.playTone(880, 0.1, 'sine');
                }
            }
        };
        let lastOut = 0; // For Pink Noise

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

        // =============== SPEECH RECOGNITION (Auto-Send) ===============
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isListening = false;
        let silenceTimer = null;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onstart = () => {
                isListening = true;
                aiChatMic.classList.add('listening');
                addMessage('Listening...', 'ai-msg', 'temp-listening');
                SoundEngine.play('chirp');
            };

            recognition.onend = () => {
                isListening = false;
                aiChatMic.classList.remove('listening');
                document.getElementById('temp-listening')?.remove();
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
                let liveMsg = document.getElementById('ai-chat-live-text');

                if (!liveMsg) {
                    liveMsg = document.createElement('div');
                    liveMsg.id = 'ai-chat-live-text';
                    liveMsg.className = 'user-msg live-text';
                    aiChatMessages.appendChild(liveMsg);
                }
                liveMsg.textContent = transcript + '...';
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

                // AUTO-SEND LOGIC (Silence Detection)
                clearTimeout(silenceTimer);
                if (!event.results[0].isFinal) {
                    silenceTimer = setTimeout(() => {
                        recognition.stop(); // Stops listening, triggering 'final' ideally or just taking what we have
                        // Actually, stopping might not trigger final on all browsers for interim.
                        // Force send:
                        if (liveMsg.textContent.trim().length > 3) {
                            liveMsg.removeAttribute('id');
                            liveMsg.classList.remove('live-text');
                            liveMsg.textContent = transcript;
                            aiChatInput.value = transcript;
                            processUserMessage();
                        }
                    }, 1500); // 1.5s Silence
                }

                if (event.results[0].isFinal) {
                    clearTimeout(silenceTimer);
                    liveMsg.removeAttribute('id');
                    liveMsg.classList.remove('live-text');
                    liveMsg.textContent = transcript;
                    aiChatInput.value = transcript;
                    processUserMessage();
                }
            };
        }

        if (aiChatMic) {
            aiChatMic.addEventListener('click', () => {
                if (!recognition) {
                    alert("Voice not supported in this browser.");
                    return;
                }
                if (isListening) recognition.stop();
                else recognition.start();
            });
        }

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

            wakeUp() {
                if (this.state === 'SLEEP') {
                    this.state = 'IDLE';
                    aiChatButton.classList.remove('emotion-sleep');
                    SoundEngine.play('chirp');
                    document.title = "Avinash's Portfolio";
                }
                this.lastActionTime = Date.now();
            },

            startPetting() {
                if (this.state === 'PURRING') return;
                this.state = 'PURRING';
                aiChatButton.classList.add('emotion-petting');
                SoundEngine.play('purr');
                spawnEmoji('💖'); spawnEmoji('💖');

                setTimeout(() => {
                    this.state = 'IDLE';
                    aiChatButton.classList.remove('emotion-petting');
                }, 4000);
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
                        // Expression
                        const emotions = ['suspicious', 'confused', 'love', 'shocked', 'bored'];
                        const pick = emotions[Math.floor(Math.random() * emotions.length)];
                        aiChatButton.classList.add(`emotion-${pick}`);
                        SoundEngine.play('chirp');

                        setTimeout(() => aiChatButton.classList.remove(`emotion-${pick}`), 3000);
                    } else if (roll < 0.25) {
                        // Roam (5% Chance per tick)
                        this.roamToText();
                    }
                }, 5000);
            },

            // --- MOVEMENT ENGINE ---
            roamToText() {
                // Find readable elements
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
                this.isStalking = false; // Disable stalking while teleporting
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
                            this.state = 'SITTING'; // Sitting Mode

                            // Bubble
                            if (targetElement && targetElement.tagName.match(/H[1-6]/)) {
                                aiChatButton.setAttribute('data-bubble', "Ooh! " + targetElement.innerText.substring(0, 15) + "...");
                                aiChatButton.classList.add('bubble-visible');
                                setTimeout(() => aiChatButton.classList.remove('bubble-visible'), 4000);
                            }

                            // Return home after 10s
                            setTimeout(() => {
                                this.returnHome();
                                this.isStalking = true; // Resume stalking
                            }, 10000);

                        } else {
                            aiChatButton.style.animation = 'robotFloat 3s ease-in-out infinite';
                            this.state = 'IDLE';
                            this.isStalking = true;
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
            },

            // --- CONTEXT AWARENESS ENGINE ---
            hoverTimer: null,
            lastHovered: null,

            contextMap: {
                'snowflake': "I'm a Snowflake Expert! Ask about Snowpipe. ❄️",
                'dbt': "Transformation time! Ask about dbt models. 🧱",
                'python': "I love Python! Need a script? 🐍",
                'matillion': "ETL Wizardry! Ask about orchestration. ⚙️",
                'azure': "Cloud Native! Ask about ADF pipeline. ☁️",
                'sql': "Select * From Expertise! Ask for a query. 💾",
                'ai': "That's me! Ask how I was built. 🤖",
                'ml': "Machine Learning? I can explain models. 🧠",
                'avinash': "That's the boss! (Avinash Rai) 😎",
                'contact': "Want to hire him? Click here!",
                'resume': "I can summarize his resume for you. 📄"
            },

            observeCursor() {
                console.log('👁️ Robot Eye: Scanning for keywords...');
            },

            checkHover(target) {
                if (!target || this.state === 'SLEEP' || aiChatWindow.style.display === 'flex') return;

                // Stop if hovering robot itself
                if (target.closest('#ai-chat-button') || target.closest('#ai-chat-window')) return;

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
                    if (this.lastHovered === foundKey) return; // Already thinking about it

                    this.lastHovered = foundKey;
                    clearTimeout(this.hoverTimer);

                    // Wait 0.6s before "Thinking" (Debounce)
                    this.hoverTimer = setTimeout(() => {
                        this.showThinking(this.contextMap[foundKey]);
                    }, 600);
                } else {
                    this.lastHovered = null;
                    clearTimeout(this.hoverTimer);
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
                bubble.style.left = (btnRect.left - 180) + 'px'; // Left of robot
                bubble.style.top = (btnRect.top - 60) + 'px';

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
                if (!this.voiceEnabled || !window.speechSynthesis) return;
                window.speechSynthesis.cancel(); // Stop overlap

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.1;
                utterance.pitch = 1.4; // Kid Robot Pitch
                // Try to find a good voice
                const voices = window.speechSynthesis.getVoices();
                const preferred = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
                if (preferred) utterance.voice = preferred;

                window.speechSynthesis.speak(utterance);

                // Animate mouth
                aiChatButton.classList.add('robot-talking');
                utterance.onend = () => aiChatButton.classList.remove('robot-talking');
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
                const acts = ['robot-backflip', 'robot-spin', 'robot-shake'];
                const act = acts[Math.floor(Math.random() * acts.length)];
                aiChatButton.classList.add('robot-backflip');
                setTimeout(() => aiChatButton.classList.remove('robot-backflip'), 1000);
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
                    card.onclick = () => {
                        window.open('https://github.com/AvinashAnalytics/AvinashAnalytics.github.io/raw/main/resume.pdf', '_blank');
                    };
                    aiChatMessages.appendChild(card);
                    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
                    this.speak("Here is Avinash's resume. You can download it.");
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
                    processUserMessage();
                    container.remove();
                };
                container.appendChild(chip);
            });
            return container;
        }

        // =============== INITIALIZATION ===============
        // Initializing Components
        createChatbotWidget();

        // Initial Suggestions
        setTimeout(() => {
            if (aiChatMessages) {
                const welcome = document.createElement('div');
                welcome.className = 'ai-msg';
                welcome.innerHTML = "Hi! I'm Avinash's AI Twin. Ask me anything! 🤖";
                aiChatMessages.appendChild(welcome);
                aiChatMessages.appendChild(renderSuggestions());
            }
        }, 1000);

        EyeController.init();
        SoundEngine.init();
        RobotBrain.init(); // Start Brain


        // Expose for debugging
        window.robotBrain = RobotBrain;
        window.toggleAngryMode = () => {
            aiChatButton.classList.toggle('emotion-angry');
            SoundEngine.play('angry');
        };

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
        };
    } // End of initChatbot

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }

})(window);
