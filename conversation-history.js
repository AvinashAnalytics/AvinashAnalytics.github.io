/* ===================================================================
   🔄 CONVERSATION HISTORY MANAGER - ChatGPT Style
   Add this script to enable conversation history and "New Chat"
=================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'ai_conversations';
    const ACTIVE_KEY = 'ai_active_conversation';

    // Helper: Generate unique ID
    function genId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Helper: Get all conversations
    function getConversations() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    // Helper: Save conversation
    function saveConversation(conv) {
        const convs = getConversations();
        const idx = convs.findIndex(c => c.id === conv.id);
        if (idx >= 0) {
            convs[idx] = conv;
        } else {
            convs.unshift(conv);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    }

    // Helper: Get active conversation
    function getActiveConv() {
        const id = localStorage.getItem(ACTIVE_KEY);
        if (!id) return null;
        return getConversations().find(c => c.id === id);
    }

    // Helper: Create new conversation
    function createNewConv() {
        const newConv = {
            id: genId(),
            title: 'New Chat',
            messages: [],
            timestamp: Date.now()
        };
        saveConversation(newConv);
        localStorage.setItem(ACTIVE_KEY, newConv.id);
        return newConv;
    }

    // GLOBAL: Start new chat
    window.startNewChat = function () {
        console.log('[New Chat] Starting fresh conversation');
        const newConv = createNewConv();

        // Clear messages UI
        const messagesDiv = document.getElementById('ai-chat-messages') || document.getElementById('messages');
        if (messagesDiv) {
            messagesDiv.innerHTML = '';

            // Add welcome message
            const bubble = document.createElement('div');
            bubble.className = messagesDiv.id === 'messages' ? 'message ai' : 'ai-msg';
            bubble.textContent = "👋 Fresh start! How can I help you today?";
            messagesDiv.appendChild(bubble);
        }

        // Reset conversation history if it exists
        if (window.conversationHistory) {
            window.conversationHistory = [];
        }

        return newConv;
    };

    // GLOBAL: Save current conversation
    window.saveCurrentChat = function (messages, title) {
        const activeId = localStorage.getItem(ACTIVE_KEY);
        if (!activeId) return;

        const conv = getActiveConv();
        if (conv) {
            conv.messages = messages || [];
            conv.timestamp = Date.now();

            // Auto-generate title from first message
            if ((!title || title === 'New Chat') && messages && messages.length > 0) {
                const firstMsg = messages.find(m => m.role === 'user');
                if (firstMsg) {
                    conv.title = firstMsg.content.substring(0, 50) +
                        (firstMsg.content.length > 50 ? '...' : '');
                }
            } else if (title) {
                conv.title = title;
            }

            saveConversation(conv);
            console.log(`[Save] Saved conversation: "${conv.title}"`);
        }
    };

    // Initialize: Create first conversation if none exists
    (function init() {
        const active = getActiveConv();
        if (!active) {
            console.log('[Init] Creating initial conversation');
            createNewConv();
        } else {
            console.log(`[Init] Active conversation: "${active.title}" (${active.messages.length} messages)`);
        }
    })();

    console.log('✅ Conversation History Manager loaded');
})();
