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
    <>
      <style jsx>{`
        @keyframes rainbow-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .rainbow-gradient {
          background: linear-gradient(
            120deg,
            #e500ff,
            #ff0080,
            #ff0040,
            #ff8c00,
            #ffd700,
            #00ff88,
            #00ffff,
            #0080ff,
            #5000ff,
            #e500ff
          );
          background-size: 300% 300%;
          animation: rainbow-flow 3s ease infinite;
        }
      `}</style>
      <div className="flex flex-col h-full">
      {/* Chats Section */}
      <div className="flex-1 overflow-y-auto pt-4">
        <div className="px-6">
          {/* New Chat Button */}
          <button
            onClick={onNewSession}
            className="w-full px-2 py-1.5 text-gray-300 hover:text-white rounded-full transition-all flex items-center justify-center gap-2 font-inter mb-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rainbow-gradient blur-xl" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rainbow-gradient" />
            <span className="relative z-10">+ New Chat</span>
          </button>
          
          {/* Chats label */}
          <div className="text-xs text-gray-400 font-medium mt-4 mb-2 font-inter">
            Chats
          </div>
          
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 font-inter mt-8">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1.5">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`w-full px-2 py-2 rounded-lg text-left transition-all font-inter ${
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
    </div>
    </>
  );
}