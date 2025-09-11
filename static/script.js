class KautaliyaChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.chatLogs = document.getElementById('chatLogs');
        
        this.isLoading = false;
        this.init();
    }
    
    init() {
 
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.messageInput.addEventListener('input', () => this.handleInput());
        if (this.newChatBtn) this.newChatBtn.addEventListener('click', () => this.newChat());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        

        this.messageInput.addEventListener('input', this.autoResize.bind(this));

        this.loadChatHistory();
        
        
        this.messageInput.focus();
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
    }
    
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;
       
        this.addMessage(message, 'user');
        

        this.addToChatLog(message);
        

        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.handleInput();
        
      
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
                
              
                this.addMessage(data.response, 'assistant');
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
    
    addMessage(content, role, isError = false) {
        const messageDiv = document.createElement('div');
        const isUser = role === 'user';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.className = `flex items-start space-x-3 message-enter ${isUser ? 'justify-end' : ''}`;

        if (isUser) {
           
            messageDiv.innerHTML = `
                <div class="bg-user-msg rounded-lg p-4 max-w-3xl ${isError ? 'border-l-4 border-red-500' : ''}">
                    <div class="message-content text-gray-100 text-right">
                        ${this.formatMessage(content)}
                    </div>
                    <div class="text-xs text-gray-300 mt-2 text-right">${timestamp}</div>
                </div>
                <div class="w-8 h-8 bg-user-msg rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold">U</span>
                </div>
            `;
        } else {

            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold">K</span>
                </div>
                <div class="bg-ai-msg rounded-lg p-4 max-w-3xl ${isError ? 'border-l-4 border-red-500' : ''}">
                    <div class="message-content text-gray-100">
                        ${this.formatMessage(content)}
                    </div>
                    <div class="text-xs text-gray-400 mt-2">${timestamp}</div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(content) {

        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        

        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        return formatted;
    }
    
    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex items-start space-x-3';
        
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold">K</span>
            </div>
            <div class="bg-ai-msg rounded-lg p-4">
                <div class="typing-indicator flex space-x-1">
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
            typingIndicator.remove();
        }
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading || this.messageInput.value.trim().length === 0;
        
        if (loading) {
            this.loadingIndicator.classList.remove('hidden');
        } else {
            this.loadingIndicator.classList.add('hidden');
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    async loadChatHistory() {
        try {
            const response = await fetch('/history');
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
              
                this.messagesContainer.innerHTML = '';
                if (this.chatLogs) this.chatLogs.innerHTML = '';
                
        
                data.messages.forEach(msg => {
                    this.addMessage(msg.content, msg.role);
                    if (msg.role === 'user') {
                        this.addToChatLog(msg.content);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    async newChat() {
        if (confirm('Start a new chat? This will clear your current conversation.')) {
            await this.clearChat();
        }
    }
    
    async clearChat() {
        try {
            const response = await fetch('/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
          
                this.messagesContainer.innerHTML = `
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-bold">K</span>
                        </div>
                        <div class="bg-ai-msg rounded-lg p-4 max-w-3xl">
                            <p class="text-gray-100">Hello! I'm Kautaliya, your AI assistant. How can I help you today?</p>
                        </div>
                    </div>
                `;
                
              
                if (this.chatLogs) {
                    this.chatLogs.innerHTML = '<p class="text-gray-400 italic">No questions yet...</p>';
                }
                

                this.messageInput.focus();
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    }

    addToChatLog(message) {
        if (!this.chatLogs) return;


        if (this.chatLogs.querySelector('p.text-gray-400')) {
            this.chatLogs.innerHTML = '';
        }

        const logItem = document.createElement('div');
        logItem.className = "p-2 bg-gray-800 rounded text-gray-200 text-xs cursor-pointer hover:bg-gray-700 transition";
        logItem.textContent = message;

        this.chatLogs.appendChild(logItem);
        this.chatLogs.scrollTop = this.chatLogs.scrollHeight;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new KautaliyaChat();
});


document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page became visible');
    }
});
