import { Message as MessageType } from '../types/chat';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  return (
    <div className={`${message.role === 'user' ? 'flex justify-end' : ''}`}>
      {message.role === 'user' ? (
        <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-blue-600 text-white">
          <p className="text-base leading-relaxed font-medium">{message.content}</p>
        </div>
      ) : (
        <div className="w-full text-gray-100">
          <p className="text-base leading-relaxed font-normal">{message.content}</p>
        </div>
      )}
    </div>
  );
} 