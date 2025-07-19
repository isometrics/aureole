import { MessagesList, MessageInput } from './index';
import { useChat } from '../hooks';

export default function Chat() {
  const { messages, inputMessage, handleInputChange, isLoading, sendMessage } = useChat();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <MessagesList messages={messages} isLoading={isLoading} />
      <MessageInput
        inputMessage={inputMessage}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        onSubmit={sendMessage}
      />
    </div>
  );
} 