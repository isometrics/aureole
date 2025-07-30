"use client";

import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plotlyJson?: any;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSessionsListProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  sessions: ChatSession[];
}

export default function ChatSessionsList({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  sessions 
}: ChatSessionsListProps) {
  
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="px-6 pt-4 pb-2">
        <button
          onClick={onNewSession}
          className="w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-[#252525] rounded-lg transition-all flex items-center gap-2 font-inter text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          New chat
        </button>
      </div>

      {/* Chats Section */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="text-xs text-gray-400 font-medium mb-2 mt-4 font-inter">
          Chats
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 text-sm font-inter mt-4">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`w-full px-3 py-2 rounded-lg text-left transition-all font-inter text-sm ${
                  currentSessionId === session.id
                    ? 'bg-[#292929] text-white'
                    : 'text-gray-300 hover:bg-[#252525] hover:text-white'
                }`}
              >
                <div className="truncate">
                  {truncateTitle(session.title)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}