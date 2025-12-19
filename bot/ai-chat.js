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

        // =============== TOGGLE CHAT ===============
        aiChatButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (aiChatWindow.style.display === 'flex') {
                aiChatWindow.style.display = 'none';
            } else {
                aiChatWindow.style.display = 'flex';
                if (aiChatInput) setTimeout(() => aiChatInput.focus(), 120);
            }
        });

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

    }

    // Init when DOM ready
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
