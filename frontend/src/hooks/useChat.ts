import { useChat as useAIChat } from '@ai-sdk/react';

const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    createdAt: new Date(),
  }
];

export function useChat() {
  const {
    messages,
    input: inputMessage,
    setInput: setInputMessage,
    handleInputChange,
    handleSubmit,
    status,
  } = useAIChat({
    api: '/api/chat',
    initialMessages: INITIAL_MESSAGES,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  return {
    messages,
    inputMessage,
    handleInputChange,
    isLoading,
    sendMessage: handleSubmit,
  };
} 