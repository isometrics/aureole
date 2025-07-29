export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatApiResponse {
  message: ChatMessage;
  history: ChatMessage[];
}

export interface ChatHistoryResponse {
  history: ChatMessage[];
}

export interface ChatError {
  error: string;
  details?: string;
} 