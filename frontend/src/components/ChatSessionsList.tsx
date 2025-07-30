"use client";

import { useState, useEffect, useRef } from 'react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const handleRename = (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const sessionsArray = JSON.parse(savedSessions);
      const sessionIndex = sessionsArray.findIndex((s: any) => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        sessionsArray[sessionIndex].title = newTitle.trim();
        localStorage.setItem('chatSessions', JSON.stringify(sessionsArray));
        window.dispatchEvent(new Event('sessionsUpdated'));
      }
    }
    
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = (sessionId: string) => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (!savedSessions) return;
    
    const sessionsArray = JSON.parse(savedSessions);
    const filteredSessions = sessionsArray.filter((s: any) => s.id !== sessionId);
    localStorage.setItem('chatSessions', JSON.stringify(filteredSessions));
    
    // If we're deleting the current session
    if (sessionId === currentSessionId) {
      if (filteredSessions.length > 0) {
        // Switch to the first remaining session
        onSessionSelect(filteredSessions[0].id);
      } else {
        // No sessions left, create a new one
        onNewSession();
      }
    }
    
    window.dispatchEvent(new Event('sessionsUpdated'));
  };

  const startEditing = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId);
    setEditingTitle(currentTitle);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.select();
    }
  }, [editingId]);

  return (
    <div className="flex flex-col h-full">
      {/* Chats Section */}
      <div className="flex-1 overflow-y-auto pt-4">
        <div className="px-6">
          {/* New Chat Button with Liquid Rainbow Effect */}
          <button
            onClick={onNewSession}
            className="w-full px-2 py-1.5 text-gray-300 hover:text-white rounded-full transition-all flex items-center justify-center gap-2 font-inter mb-2 relative overflow-hidden group"
          >
            {/* Bright liquid rainbow background layers */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
              <div className="absolute inset-0 bg-rainbow-gradient bg-flow animate-rainbow-flow blur-lg" />
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500">
              <div className="absolute inset-0 bg-liquid-rainbow bg-flow animate-gradient-shift blur-sm" />
            </div>
            {/* Extra bright layer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-flow animate-pulse-glow" />
            </div>
            {/* Morphing effect overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
              <div className="absolute inset-0 bg-rainbow-gradient bg-flow animate-liquid-morph" />
            </div>
            <span className="relative z-10 transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:font-semibold">+ New Chat</span>
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
              <div
                key={session.id}
                className={`group relative rounded-lg overflow-hidden transition-all duration-300 ${
                  currentSessionId === session.id
                    ? 'bg-[#292929]'
                    : 'hover:bg-[#252525]'
                }`}
                onMouseEnter={() => setHoveredId(session.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Liquid rainbow effect for active session */}
                {currentSessionId === session.id && (
                  <>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-rainbow-gradient bg-flow animate-rainbow-flow" />
                    </div>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-liquid-rainbow bg-flow animate-pulse-glow" />
                    </div>
                  </>
                )}
                
                {/* Subtle liquid effect on hover for non-active sessions */}
                {currentSessionId !== session.id && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 bg-flow animate-gradient-shift" />
                  </div>
                )}
                {editingId === session.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRename(session.id, editingTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(session.id, editingTitle);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingTitle('');
                      }
                    }}
                    className="w-full px-2 py-2 bg-[#1A1A1A] text-white rounded-lg outline-none border border-gray-500 font-inter"
                  />
                ) : (
                  <div className={`relative w-full px-2 py-2 rounded-lg transition-all font-inter flex items-center justify-between ${
                    currentSessionId === session.id
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}>
                    <button
                      onClick={() => onSessionSelect(session.id)}
                      className="flex-1 text-left truncate"
                    >
                      {truncateTitle(session.title)}
                    </button>
                    {(hoveredId === session.id || currentSessionId === session.id) && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => startEditing(session.id, session.title)}
                          className="relative p-1 rounded transition-all duration-300 hover:scale-110 group/btn overflow-hidden"
                          title="Rename"
                        >
                          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse-glow" />
                          </div>
                          <svg className="w-3 h-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="relative p-1 rounded transition-all duration-300 hover:scale-110 group/btn overflow-hidden"
                          title="Delete"
                        >
                          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 animate-pulse-glow" />
                          </div>
                          <svg className="w-3 h-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}