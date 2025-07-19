import { Message as MessageType } from '../types/chat';
import { Message, LoadingIndicator } from './index';

interface MessagesListProps {
  messages: MessageType[];
  isLoading: boolean;
}

export default function MessagesList({ messages, isLoading }: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32 pt-20">
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}
      </div>
    </div>
  );
} 