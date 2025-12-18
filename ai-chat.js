/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   ai-chat.js - lightweight chat widget client
   ✅ Updated API URL (Confirmed Fix)
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

        let conversationHistory = [];
        let isLoading = false;
        let retryCount = 0; // v2.4.0: Auto-retry state

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

        // v2.5.0: Ethical Metadata Collection
        function getBrowserInfo() {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screen: `${window.screen.width}x${window.screen.height}`,
                time: new Date().toISOString(),
                referrer: document.referrer || 'Direct'
            };
        }

        // =============== SEND MESSAGE ===============
        async function sendMessage(isRetry = false) {
            const text = aiChatInput ? aiChatInput.value.trim() : '';
            if (!text && !isRetry) return;
            if (isLoading && !isRetry) return;

            if (!isRetry) {
                if (aiChatInput) aiChatInput.value = '';
                addMessage(text, 'user-msg');
                conversationHistory.push({ role: 'user', content: text });
            }

            isLoading = true;
            showTyping();

            try {
                // v2.4.0: Context-aware retries
                const lastMsg = conversationHistory[conversationHistory.length - 1];
                const cleanHistory = conversationHistory.slice(-10);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: lastMsg.content,
                        conversation_history: cleanHistory,
                        meta: getBrowserInfo() // v2.5.0: Send Metadata
                    })
                });

                if (!response.ok) throw new Error('HTTP ' + response.status);

                const data = await response.json();
                removeTyping();

                const reply = (data && (data.response || data.reply || data.output || data.text)) || "Sorry, I couldn't process that.";
                addMessage(reply, 'ai-msg');

                conversationHistory.push({ role: 'assistant', content: reply });

                // Reset retry count on success
                retryCount = 0;

            } catch (error) {
                console.error('❌ Error:', error);
                removeTyping();

                // v2.4.0: Robust Retry Logic
                retryCount++;
                let msg = String(error.message || error);

                if (retryCount <= 3 && (msg.includes('503') || msg.includes('Failed to fetch'))) {
                    addMessage(`⏳ Connection issue. Auto-retrying in 3s... (Attempt ${retryCount}/3)`, 'ai-msg system-msg');

                    setTimeout(() => {
                        showTyping();
                        sendMessage(true);
                    }, 3000);
                    return; // Don't reset loading yet
                }

                if (msg.includes('503')) {
                    msg = '⚠ AI is waking up. Please wait ~30 seconds and try again.';
                } else {
                    msg = '⚠ Connection failed. Please check your internet.';
                }
                addMessage(msg, 'ai-msg error');
                retryCount = 0; // Reset after failure

            } finally {
                // Only reset loading if we aren't retrying
                if (retryCount === 0 || retryCount > 3) {
                    isLoading = false;
                }
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

        console.log('✅ Chatbot ready!');
    }

    // Init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
