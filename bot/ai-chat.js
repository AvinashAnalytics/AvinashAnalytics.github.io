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
            }
        } catch (e) {
            console.error('[Chat] Failed to restore history:', e);
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

        // =============== SEND MESSAGE ===============
        async function sendMessage() {
            const text = aiChatInput ? aiChatInput.value.trim() : '';
            if (!text || isLoading) return;

            if (aiChatInput) aiChatInput.value = '';
            addMessage(text, 'user-msg');

            conversationHistory.push({ role: 'user', content: text });

            isLoading = true;
            showTyping();

            try {
                // Get dynamic user ID
                let userId = localStorage.getItem('chat_uid');
                if (!userId) {
                    userId = Math.random().toString(36).substring(7) + Date.now().toString(36);
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

                // v3.10.1: Save to localStorage for sync across pages
                try {
                    localStorage.setItem('chat_conversation_history', JSON.stringify(conversationHistory));
                } catch (e) {
                    console.error('[Chat] Failed to save history:', e);
                }

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
            bubble.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
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

                const checkUrl = API_URL.replace(/\/ask|\/chat/, '/api/check_replies') + `?user_id=web-${userId}`;

                const res = await fetch(checkUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data.replies && data.replies.length > 0) {
                        data.replies.forEach(msg => {
                            let adminHtml = `👨‍💻 <b>${msg.from}:</b><br>`;

                            // Handle rich media
                            if (msg.media_type && msg.media_url) {
                                if (msg.media_type === 'photo') {
                                    adminHtml += `<img src="${msg.media_url}" style="max-width:200px; border-radius:8px; margin:5px 0;"><br>`;
                                } else if (msg.media_type === 'video') {
                                    adminHtml += `<video src="${msg.media_url}" controls style="max-width:250px; border-radius:8px; margin:5px 0;"></video><br>`;
                                } else if (msg.media_type === 'voice') {
                                    adminHtml += `<audio src="${msg.media_url}" controls style="margin:5px 0;"></audio><br>`;
                                } else if (msg.media_type === 'sticker') {
                                    adminHtml += `<img src="${msg.media_url}" style="max-width:120px; margin:5px 0;"><br>`;
                                }
                            }

                            adminHtml += msg.text;

                            // Create message element
                            if (!aiChatMessages) return;
                            const bubble = document.createElement('div');
                            bubble.className = 'ai-msg';
                            bubble.innerHTML = adminHtml;
                            aiChatMessages.appendChild(bubble);
                            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

                            conversationHistory.push({ role: 'assistant', content: `[Admin Reply]: ${msg.text}` });
                        });
                    }
                }
            } catch (e) {
                console.error('[Poll Replies] Error:', e);
            }
        }

        // Start polling every 3 seconds
        setInterval(pollReplies, 3000);

        console.log('✅ Chatbot ready!');
    }

    // Init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }

    // v3.9.5: Global function for "Send Me a Message" button
    window.openChatAndContact = async function () {
        // Open the chat window
        const aiChatWindow = document.getElementById('ai-chat-window');
        const aiChatInput = document.getElementById('ai-chat-input');
        const aiChatMessages = document.getElementById('ai-chat-messages');

        if (aiChatWindow) {
            aiChatWindow.style.display = 'flex';
            if (aiChatInput) setTimeout(() => aiChatInput.focus(), 120);
        }

        // Get or create user ID
        let userId = localStorage.getItem('chat_uid');
        if (!userId) {
            userId = Math.random().toString(36).substring(7) + Date.now().toString(36);
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
})();
