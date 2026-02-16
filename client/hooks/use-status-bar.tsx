import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { StatusMessage } from "@/components/ui/status-bar";

interface StatusBarContextType {
  messages: StatusMessage[];
  addMessage: (message: Omit<StatusMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<StatusMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  addLoadingMessage: (message: string) => string;
  updateToSuccess: (id: string, message: string) => void;
  updateToError: (id: string, message: string) => void;
}

const StatusBarContext = createContext<StatusBarContextType | undefined>(undefined);

export function StatusBarProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const addMessage = useCallback((message: Omit<StatusMessage, "id" | "timestamp">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: StatusMessage = {
      ...message,
      id,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<StatusMessage>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addLoadingMessage = useCallback((message: string) => {
    return addMessage({
      type: "loading",
      message,
      dismissible: false,
    });
  }, [addMessage]);

  const updateToSuccess = useCallback((id: string, message: string) => {
    updateMessage(id, {
      type: "success",
      message,
      dismissible: true,
    });
    
    // Auto-remove success messages after 5 seconds
    setTimeout(() => {
      removeMessage(id);
    }, 5000);
  }, [updateMessage, removeMessage]);

  const updateToError = useCallback((id: string, message: string) => {
    updateMessage(id, {
      type: "error",
      message,
      dismissible: true,
    });
    
    // Auto-remove error messages after 10 seconds
    setTimeout(() => {
      removeMessage(id);
    }, 10000);
  }, [updateMessage, removeMessage]);

  const value: StatusBarContextType = {
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    addLoadingMessage,
    updateToSuccess,
    updateToError,
  };

  return (
    <StatusBarContext.Provider value={value}>
      {children}
    </StatusBarContext.Provider>
  );
}

export function useStatusBar() {
  const context = useContext(StatusBarContext);
  if (context === undefined) {
    throw new Error("useStatusBar must be used within a StatusBarProvider");
  }
  return context;
}
