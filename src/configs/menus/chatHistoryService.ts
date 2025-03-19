// src/services/chatHistoryService.ts

interface ChatHistory {
    id: string;
    title: string;
    messages: any[];
    createdAt: number;
    updatedAt: number;
  }
  
  class ChatHistoryService {
    private readonly STORAGE_KEY = 'chatHistory';
    
    /**
     * Get all chat history items
     */
    getAllHistory(): ChatHistory[] {
      const history = localStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    }
    
    /**
     * Create a new chat conversation
     */
    createChat(title: string = ''): ChatHistory {
      const history = this.getAllHistory();
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title: title || `对话 ${history.length + 1}`,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      history.unshift(newChat); // Add to the beginning for newest first
      this.saveHistory(history);
      this.notifyHistoryUpdated();
      
      return newChat;
    }
    
    /**
     * Get a specific chat by ID
     */
    getChatById(id: string): ChatHistory | null {
      const history = this.getAllHistory();
      return history.find(chat => chat.id === id) || null;
    }
    
    /**
     * Add a message to an existing chat
     */
    addMessage(chatId: string, message: any): void {
      const history = this.getAllHistory();
      const chatIndex = history.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        history[chatIndex].messages.push(message);
        history[chatIndex].updatedAt = Date.now();
        
        // If it's the first user message, use it as the chat title
        if (history[chatIndex].messages.length === 1 && message.role === 'user') {
          const title = message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '');
          history[chatIndex].title = title;
        }
        
        this.saveHistory(history);
        this.notifyHistoryUpdated();
      }
    }
    
    /**
     * Delete a chat by ID
     */
    deleteChat(chatId: string): void {
      const history = this.getAllHistory();
      const filteredHistory = history.filter(chat => chat.id !== chatId);
      this.saveHistory(filteredHistory);
      this.notifyHistoryUpdated();
    }
    
    /**
     * Save history to localStorage
     */
    private saveHistory(history: ChatHistory[]): void {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    }
    
    /**
     * Notify other components that history has been updated
     */
    private notifyHistoryUpdated(): void {
      window.dispatchEvent(new CustomEvent('chatHistoryUpdated'));
    }
  }
  
  export const chatHistoryService = new ChatHistoryService();