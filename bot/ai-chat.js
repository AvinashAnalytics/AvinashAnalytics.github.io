/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   ai-chat.js - lightweight chat widget client
===================================================== */
(function() {
    'use strict';

    function initChatbot() {
        // =============== DOM ELEMENTS ===============
        const aiChatButton = document.getElementById('ai-chat-button');
        const aiChatWindow = document.getElementById('ai-chat-window');
        const aiChatClose = document.getElementById('ai-chat-close');
        const aiChatMessages = document.getElementById('ai-chat-messages');
        const aiChatInput = document.getElementById('ai-chat-input');
        const aiChatSend = document.getElementById('ai-chat-send');

        // =============== CORRECT API URL ===============
        // ✅ Fixed: using provided URL (confirm this is the intended endpoint)
        const API_URL = 'https://avinashanalystics-avinash-chatbot.hf.space/chat';

        let conversationHistory = [];
        let isLoading = false;

        // =============== DEBUG ===============
        console.log('🤖 Chatbot Init');
        console.log('📡 API URL:', API_URL);

        if (!aiChatButton || !aiChatWindow) {
            console.error('❌ Chatbot elements missing!');
            return;
        }

        // =============== TOGGLE CHAT ===============
        aiChatButton.addEventListener('click', function(e) {
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
            aiChatClose.addEventListener('click', function(e) {
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
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text,
                        conversation_history: conversationHistory.slice(-10)
                    })
                });

                if (!response.ok) throw new Error('HTTP ' + response.status);

                const data = await response.json();
                removeTyping();

                const reply = (data && (data.reply || data.output || data.text)) || "Sorry, I couldn't process that.";
                addMessage(reply, 'ai-msg');

                conversationHistory.push({ role: 'assistant', content: reply });

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

        console.log('✅ Chatbot ready!');
    }

    // Init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
