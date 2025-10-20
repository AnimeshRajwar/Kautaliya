class KautaliyaChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.chatLogs = document.getElementById('chatLogs');
        this.sidebar = document.getElementById('sidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        
        this.isLoading = false;
        this.messageCount = 0;
        this.init();
    }
    
    init() {
        // Event listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.messageInput.addEventListener('input', () => this.handleInput());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        // Mobile menu
        this.mobileMenuBtn.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', this.autoResize.bind(this));
        
        // Load chat history
        this.loadChatHistory();
        
        // Focus input
        this.messageInput.focus();
        
        // Add welcome animation
        this.addWelcomeAnimation();
    }
    
    addWelcomeAnimation() {
        setTimeout(() => {
            const welcomeMessage = this.messagesContainer.querySelector('.animate-fade-in');
            if (welcomeMessage) {
                welcomeMessage.classList.add('animate-bounce-subtle');
            }
        }, 500);
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('open');
        this.sidebarOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.sidebarOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    handleInput() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || this.isLoading;
        
        // Add visual feedback
        if (hasText && !this.isLoading) {
            this.sendBtn.classList.add('animate-pulse');
        } else {
            this.sendBtn.classList.remove('animate-pulse');
        }
    }
    
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 128) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;
       
        // Add user message with animation
        this.addMessage(message, 'user');
        
        // Add to chat log
        this.addToChatLog(message);
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.handleInput();
        
        // Close mobile sidebar if open
        this.closeSidebar();
        
        // Set loading state
        this.setLoading(true);
        this.addTypingIndicator();
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.removeTypingIndicator();
                this.addMessage(data.response, 'assistant', false, data.timestamp);
            } else {
                this.removeTypingIndicator();
                this.addMessage(data.error || 'Sorry, something went wrong. Please try again.', 'assistant', true);
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I\'m having trouble connecting. Please check your internet connection and try again.', 'assistant', true);
        } finally {
            this.setLoading(false);
        }
    }
    
    addMessage(content, role, isError = false, customTimestamp = null) {
        const messageDiv = document.createElement('div');
        const isUser = role === 'user';
        const timestamp = customTimestamp
            ? new Date(customTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        this.messageCount++;

        messageDiv.className = `flex items-start space-x-4 message-enter ${isUser ? 'justify-end' : ''}`;

        if (isUser) {
            messageDiv.innerHTML = `
                <div class="bg-gradient-to-r from-user-msg to-indigo-600 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-2xl shadow-xl ${isError ? 'border-l-4 border-red-500' : ''}">
                    <div class="message-content text-white">
                        ${this.formatMessage(content)}
                    </div>
                    <div class="text-xs text-indigo-200 mt-3 flex items-center justify-end">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>

                        </svg>
                        ${timestamp}
                    </div>
                </div>
                <div class="w-10 h-10 bg-gradient-to-br from-user-msg to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span class="text-sm font-bold text-white">U</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span class="text-sm font-bold text-white">K</span>
                </div>
                <div class="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-2xl shadow-xl ${isError ? 'border-l-4 border-red-500' : ''}">
                    <div class="message-content text-gray-100">
                        ${this.formatMessage(content)}
                    </div>
                    <div class="text-xs text-gray-400 mt-3 flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="ml-1">${timestamp}${isError ? ' • Error' : ''}</span>
                    </div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        
        // Add staggered animation
        setTimeout(() => {
            messageDiv.classList.add('animate-fade-in');
        }, 50);
        
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        // Enhanced message formatting with better code highlighting
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-saffron">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        // Handle code blocks
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Handle links
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-saffron hover:text-orange-400 underline">$1</a>');
        
        return formatted;
    }
    
    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex items-start space-x-4 message-enter';
        
        typingDiv.innerHTML = `
            <div class="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span class="text-sm font-bold text-white">K</span>
            </div>
            <div class="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.opacity = '0';
            typingIndicator.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                typingIndicator.remove();
            }, 300);
        }
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading || this.messageInput.value.trim().length === 0;
        
        if (loading) {
            this.loadingIndicator.classList.remove('hidden');
            this.sendBtn.innerHTML = `
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            `;
        } else {
            this.loadingIndicator.classList.add('hidden');
            this.sendBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2m0 0V8"></path>
                </svg>
            `;
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTo({
                top: this.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    async loadChatHistory() {
        try {
            const response = await fetch('/history');
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                // Clear existing messages except welcome
                const welcomeMsg = this.messagesContainer.querySelector('.animate-fade-in');
                this.messagesContainer.innerHTML = '';
                if (welcomeMsg) {
                    this.messagesContainer.appendChild(welcomeMsg);
                }
                
                if (this.chatLogs) this.chatLogs.innerHTML = '';
                
                // Add messages with staggered animation
                data.messages.forEach((msg, index) => {
                    setTimeout(() => {
                        this.addMessage(msg.content, msg.role);
                        if (msg.role === 'user') {
                            this.addToChatLog(msg.content);
                        }
                    }, index * 100);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    async clearChat() {
        if (!confirm('Start a new chat? This will clear your current conversation.')) {
            return;
        }
        
        try {
            const response = await fetch('/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                // Animate out existing messages
                const messages = this.messagesContainer.querySelectorAll('.message-enter');
                messages.forEach((msg, index) => {
                    setTimeout(() => {
                        msg.style.opacity = '0';
                        msg.style.transform = 'translateY(-20px)';
                    }, index * 50);
                });
                
                // Clear after animation
                setTimeout(() => {
                    this.messagesContainer.innerHTML = `
                        <div class="flex items-start space-x-4 animate-fade-in">
                            <div class="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <span class="text-sm font-bold">K</span>
                            </div>
                            <div class="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-5 max-w-2xl shadow-xl">
                                <div class="message-content text-gray-100">
                                    <p class="mb-2">👋 Hello! I'm <strong>Kautaliya</strong>, your AI assistant.</p>
                                    <p>I'm here to help you with questions, provide insights, and engage in meaningful conversations. How can I assist you today?</p>
                                </div>
                                <div class="text-xs text-gray-400 mt-3 flex items-center">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path 
                                            stroke-linecap="round" 
                                            stroke-linejoin="round" 
                                            stroke-width="2" 
                                            d="12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                                        </path>

                                    </svg>
                                    Just now
                                </div>
                            </div>
                        </div>
                    `;
                    
                    if (this.chatLogs) {
                        this.chatLogs.innerHTML = `
                            <div class="flex items-center justify-center h-32 text-gray-400 italic">
                                <div class="text-center">
                                    <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <p>No conversations yet</p>
                                </div>
                            </div>
                        `;
                    }
                    
                    this.messageCount = 0;
                    this.messageInput.focus();
                }, messages.length * 50 + 200);
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    }

    addToChatLog(message) {
        if (!this.chatLogs) return;

        // Clear placeholder if it exists
        const placeholder = this.chatLogs.querySelector('.text-center');
        if (placeholder) {
            this.chatLogs.innerHTML = '';
        }

        const logItem = document.createElement('div');
        logItem.className = "chat-log-item p-3 bg-glass backdrop-blur-md border border-white/10 rounded-xl text-gray-200 text-xs cursor-pointer hover-lift mb-2 transition-all duration-300";
        
        // Truncate long messages
        const truncated = message.length > 50 ? message.substring(0, 50) + '...' : message;
        logItem.textContent = truncated;
        logItem.title = message; // Full message on hover

        // Add click handler to scroll to message
        logItem.addEventListener('click', () => {
            // Find and highlight the message in chat
            const messages = this.messagesContainer.querySelectorAll('.message-enter');
            messages.forEach(msg => {
                if (msg.textContent.includes(message.substring(0, 20))) {
                    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    msg.classList.add('animate-pulse');
                    setTimeout(() => msg.classList.remove('animate-pulse'), 2000);
                }
            });
        });

        this.chatLogs.appendChild(logItem);
        
        // Animate in
        setTimeout(() => {
            logItem.classList.add('animate-slide-up');
        }, 50);
        
        this.chatLogs.scrollTop = this.chatLogs.scrollHeight;
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KautaliyaChat();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page became visible');
        // Re-focus input when page becomes visible
        const messageInput = document.getElementById('messageInput');
        if (messageInput && window.innerWidth > 768) {
            messageInput.focus();
        }
    }
});

// Handle window resize for mobile responsiveness
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth >= 1024) {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }
    }
    
    // Escape to close mobile sidebar
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }
});