/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET
   ai-chat.js - lightweight chat widget client
===================================================== */
/* =====================================================
   🤖 AVINASH AI DIGITAL TWIN — CHAT WIDGET (UPDATED)
   bot/ai-chat.js - improved, class-based chatbot client
===================================================== */

class AvinashChatbot {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || 'https://your-space.hf.space';
        this.conversationHistory = [];
        this.maxHistory = config.maxHistory || 10;
        this.isLoading = false;

        this.elements = {
            container: null,
            messages: null,
            input: null,
            sendBtn: null,
            typing: null,
            toggleButton: null,
        };

        this.bubbleMessages = config.bubbleMessages || [
            'Ask me!', 'Need help?', 'Try: Explain dbt', 'Show projects', 'What can you do?'
        ];
        this.bubbleIndex = 0;
        this.bubbleIntervalMs = config.bubbleIntervalMs || 14000;
        this.bubbleShowDuration = config.bubbleShowDuration || 3500;

        this.chatSoundEnabled = (localStorage.getItem('chatSound') ?? 'true') === 'true';

        console.log('AvinashChatbot initialized');
    }

    init(selectors = {}) {
        // Support both ID and class selectors; default fallbacks match polished CSS
        const containerSel = selectors.container || '#chat-container, .chat-widget';
        const messagesSel = selectors.messages || '#chat-messages, .chat-messages';
        const inputSel = selectors.input || '#chat-input, .chat-input';
        const sendSel = selectors.sendBtn || '#chat-send-btn, .chat-send-btn, .chat-send';
        const typingSel = selectors.typing || '#typing-indicator, .typing-indicator';
        const toggleSel = selectors.toggle || '#ai-chat-button, .chat-toggle';

        this.elements.container = this._queryFirst(containerSel);
        this.elements.messages = this._queryFirst(messagesSel);
        this.elements.input = this._queryFirst(inputSel);
        this.elements.sendBtn = this._queryFirst(sendSel);
        this.elements.typing = this._queryFirst(typingSel);
        this.elements.toggleButton = this._queryFirst(toggleSel);

        // If the main container is missing, create a minimal widget and append to body
        if (!this.elements.container) {
            this._createWidgetDOM();
        }

        // Validate messages container exists
        if (!this.elements.messages) {
            console.error('Chat messages container not found!');
            return false;
        }

        // Setup event listeners
        this._setupEventListeners();

        // Start bubble rotation
        this._startBubbleRotation();

        return true;
    }

    _queryFirst(selectorList) {
        // Accept comma-separated selectors and try each
        const parts = selectorList.split(',').map(s => s.trim());
        for (const p of parts) {
            try {
                const el = document.querySelector(p);
                if (el) return el;
            } catch (e) {
                // invalid selector - skip
            }
        }
        return null;
    }

    _createWidgetDOM() {
        // Create a basic, accessible widget that matches polished CSS structure
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <button class="chat-toggle" aria-label="Open chat">💬</button>
            <div class="chat-container" role="dialog" aria-label="Chat with Avinash" hidden>
                <div class="chat-header">
                    <strong>AvinashBot</strong>
                    <button class="chat-close" aria-label="Close chat">✕</button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input-area">
                    <textarea class="chat-input" placeholder="Ask me anything..." rows="1"></textarea>
                    <button class="chat-send-btn" aria-label="Send message">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        // re-query elements
        this.elements.container = widget.querySelector('.chat-container');
        this.elements.messages = widget.querySelector('.chat-messages');
        this.elements.input = widget.querySelector('.chat-input');
        this.elements.sendBtn = widget.querySelector('.chat-send-btn');
        this.elements.typing = null;
        this.elements.toggleButton = widget.querySelector('.chat-toggle');
    }

    _setupEventListeners() {
        // Toggle open/close
        if (this.elements.toggleButton) {
            this.elements.toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                const visible = !(this.elements.container.hasAttribute('hidden'));
                if (visible) {
                    this.elements.container.setAttribute('hidden', '');
                } else {
                    this.elements.container.removeAttribute('hidden');
                    if (this.elements.input) setTimeout(() => this.elements.input.focus(), 120);
                    if (this.chatSoundEnabled) this._playOpenBeep();
                }
            });
        }

        // Close button inside container
        const closeBtn = this.elements.container ? this.elements.container.querySelector('.chat-close') : null;
        if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); this.elements.container.setAttribute('hidden', ''); });

        // Send event
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', (e) => { e.preventDefault(); this.handleSend(); });
        }

        // Enter key
        if (this.elements.input) {
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSend();
                }
            });
        }
    }

    async handleSend() {
        if (this.isLoading) return;
        const input = this.elements.input;
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        this.addMessage(message, 'user');
        await this.sendMessage(message);
    }

    async sendMessage(userMessage) {
        this.isLoading = true;
        this._showTyping(true);
        this._setButtonState(false);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000);

            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMessage, conversation_history: this.conversationHistory }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const rawReply = data?.reply ?? data?.output ?? data?.text ?? "Sorry, I couldn't generate a response.";
            const reply = this.sanitizeResponse(String(rawReply));

            this.conversationHistory.push({ role: 'user', content: userMessage });
            this.conversationHistory.push({ role: 'assistant', content: reply });
            if (this.conversationHistory.length > this.maxHistory * 2) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
            }

            this.addMessage(reply, 'assistant');

            return { reply };

        } catch (error) {
            console.error('Chat error:', error);
            let errorMessage = "Sorry, I'm having trouble connecting. Please try again!";
            if (error.name === 'AbortError') errorMessage = "The request timed out. Please try again!";
            this.addMessage(errorMessage, 'assistant', true);
            return { reply: errorMessage, status: 'error' };
        } finally {
            this.isLoading = false;
            this._showTyping(false);
            this._setButtonState(true);
        }
    }

    sanitizeResponse(text) {
        if (!text || typeof text !== 'string') return "I couldn't generate a response. Please try again.";
        let sanitized = text.trim();
        const unwantedPatterns = [ /👋\s*About\s*$/gi, /🛠\s*Skills\s*$/gi, /💼\s*Experience\s*$/gi, /📁\s*Projects\s*$/gi, /📧\s*Contact\s*$/gi, /🎓\s*Education\s*$/gi, /\n\s*About\s*\n\s*Skills\s*$/gi, /\n\s*Home\s*\n\s*About\s*$/gi ];
        for (const p of unwantedPatterns) sanitized = sanitized.replace(p, '').trim();
        return sanitized;
    }

    addMessage(text, role = 'assistant', isError = false) {
        const container = this.elements.messages;
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${role}${isError ? ' chat-message-error' : ''}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-message-content';
        // Use textContent for safety, then replace with formatted HTML
        contentDiv.textContent = text;
        contentDiv.innerHTML = this.formatMessage(text);

        messageDiv.appendChild(contentDiv);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'chat-message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timeDiv);

        container.appendChild(messageDiv);
        this._scrollToBottom();
    }

    formatMessage(text) {
        if (!text) return '';
        let formatted = this._escapeHtml(text);
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
        formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
        return formatted;
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    _showTyping(show) {
        if (!this.elements.messages) return;
        if (show) {
            if (!this._typingEl) {
                const div = document.createElement('div');
                div.className = 'chat-typing-indicator';
                div.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
                this._typingEl = div;
                this.elements.messages.appendChild(div);
            }
        } else {
            if (this._typingEl && this._typingEl.parentNode) this._typingEl.parentNode.removeChild(this._typingEl);
            this._typingEl = null;
        }
        this._scrollToBottom();
    }

    _setButtonState(enabled) {
        if (this.elements.sendBtn) this.elements.sendBtn.disabled = !enabled;
    }

    _scrollToBottom() {
        const c = this.elements.messages;
        if (!c) return;
        requestAnimationFrame(() => { c.scrollTop = c.scrollHeight; });
    }

    clearHistory() {
        this.conversationHistory = [];
        if (this.elements.messages) this.elements.messages.innerHTML = '';
    }

    addWelcomeMessage() {
        const welcomeMessage = `Hey there! 👋 I'm Avinash Rai, a Data Engineer based in Pune.\n\nI can tell you about:\n• 🛠 My skills (Snowflake, dbt, Python, AWS)\n• 💼 My work experience\n• 📁 Projects I've built\n• 🎓 My education\n• 📧 How to contact me\n\nWhat would you like to know?`;
        this.addMessage(welcomeMessage, 'assistant');
    }

    _startBubbleRotation() {
        // If there's a toggle button, update its data-bubble attribute periodically
        if (!this.elements.toggleButton) return;
        this._bubbleTimer = setInterval(() => {
            if (document.activeElement !== this.elements.toggleButton) this._showNextBubble();
        }, this.bubbleIntervalMs);

        this.elements.toggleButton.addEventListener('mouseenter', () => {
            this.elements.toggleButton.classList.add('bubble-visible');
        });
        this.elements.toggleButton.addEventListener('mouseleave', () => {
            this.elements.toggleButton.classList.remove('bubble-visible');
        });
    }

    _showNextBubble() {
        this.bubbleIndex = (this.bubbleIndex + 1) % this.bubbleMessages.length;
        this.elements.toggleButton.setAttribute('data-bubble', this.bubbleMessages[this.bubbleIndex]);
        this.elements.toggleButton.classList.add('bubble-visible');
        setTimeout(() => this.elements.toggleButton.classList.remove('bubble-visible'), this.bubbleShowDuration);
    }

    toggleChatSound() {
        this.chatSoundEnabled = !this.chatSoundEnabled;
        localStorage.setItem('chatSound', String(this.chatSoundEnabled));
        return this.chatSoundEnabled;
    }

    _playOpenBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 880;
            g.gain.value = 0.0001;
            o.connect(g); g.connect(ctx.destination);
            g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
            o.start();
            setTimeout(() => { g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12); setTimeout(() => { o.stop(); ctx.close(); }, 180); }, 120);
        } catch (err) {
            console.warn('Audio not available', err);
        }
    }
}

// Create global instance and init on DOM ready (preserves previous global name)
const chatbot = new AvinashChatbot({ apiUrl: 'https://your-username-your-space.hf.space', maxHistory: 10 });
document.addEventListener('DOMContentLoaded', () => {
    const ok = chatbot.init({
        container: '#chat-container, .chat-container, .chat-widget',
        messages: '#chat-messages, .chat-messages',
        input: '#chat-input, .chat-input',
        sendBtn: '#chat-send-btn, .chat-send-btn, .chat-send',
        typing: '#typing-indicator, .typing-indicator',
        toggle: '#ai-chat-button, .chat-toggle'
    });
    if (ok) {
        chatbot.addWelcomeMessage();
        console.log('Chatbot ready!');
    }
});
