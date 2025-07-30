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
              <div
                key={session.id}
                className={`group relative rounded-lg ${
                  currentSessionId === session.id
                    ? 'bg-[#292929]'
                    : 'hover:bg-[#252525]'
                }`}
                onMouseEnter={() => setHoveredId(session.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
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
                  <div className={`w-full px-2 py-2 rounded-lg transition-all font-inter flex items-center justify-between ${
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
                          className="p-1 hover:bg-[#404040] rounded transition-colors"
                          title="Rename"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-1 hover:bg-[#404040] rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </>
  );
}