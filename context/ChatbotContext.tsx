import React, { createContext, useCallback, useContext, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/client';
import { signOut as signOutGoogle } from 'next-auth/client';
import api from 'service/Api';
import { AuthContext } from './AuthContext';

interface ChatbotContextState {
  userInteracted: boolean;
  setUserInteractedState(userInteracted: boolean): void;
  loadChatbotMessages(attendance_protocol_id: string): void;
  loadingChat: boolean;
  chatbotMessages: HTMLDivElement;
}

export const ChatbotContext = createContext<ChatbotContextState>(
  {} as ChatbotContextState,
);

export const ChatbotProvider: React.FC = ({ children }) => {
  const [loadingChat, setLoadingChat] = useState(true);

  const [userInteracted, setUserInteracted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const userInteracted = localStorage.getItem(
        '@BalcaoVirtual:ChatbotUserInteracted',
      );

      return userInteracted === 'true';
    }
  });

  const setUserInteractedState = useCallback((userInteracted: boolean) => {
    localStorage.setItem(
      '@BalcaoVirtual:ChatbotUserInteracted',
      String(userInteracted),
    );
    setUserInteracted(userInteracted);
  }, []);
  const [chatbotMessages, setChatbotMessages] = useState<HTMLDivElement>(null);

  const formatChatbotMessages = useCallback((chatbotMessages: any[]) => {
    const messageList = document.createElement('div');
    messageList.id = 'messageList';
    chatbotMessages.forEach((element) => {
      const senderType = element.is_sender_agent ? 'bot' : 'user';

      const message = document.createElement('div');
      message.classList.add(
        'message',
        `${senderType}-message`,
        `${senderType}-animation`,
      );
      message.innerHTML = element.content;

      messageList.appendChild(message);
    });

    return messageList;
  }, []);

  const loadChatbotMessages = useCallback(
    async (attendance_protocol_id: string) => {
      try {
        const response = await api.get(
          `/attendance/${attendance_protocol_id}/chat`,
        );

        setChatbotMessages(formatChatbotMessages(response.data));
      } catch (error) {
        setUserInteracted(false);
        localStorage.removeItem('@BalcaoVirtual:ChatbotUserInteracted');
      } finally {
        setLoadingChat(false);
      }
    },
    [formatChatbotMessages],
  );

  return (
    <ChatbotContext.Provider
      value={{
        userInteracted,
        setUserInteractedState,
        loadChatbotMessages,
        loadingChat,
        chatbotMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
