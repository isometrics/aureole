import { MessagesList, MessageInput } from './index';
import { useChat } from '../hooks';

export default function Chat() {
  const { messages, inputMessage, setInputMessage, isLoading, sendMessage } = useChat();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <MessagesList messages={messages} isLoading={isLoading} />
      <MessageInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        isLoading={isLoading}
        onSubmit={sendMessage}
      />
    </div>
  );
} 