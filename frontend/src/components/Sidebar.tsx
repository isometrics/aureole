"use client";

import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import ChatSessionsList from "./ChatSessionsList";

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

interface SidebarProps {
  isCollapsed: boolean;
  onExpand: () => void;
  onJobSubmit: (loading: boolean) => void;
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  onExpand, 
  onJobSubmit,
  currentSessionId,
  onSessionSelect,
  onNewSession
}: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadSessions = () => {
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          // Convert date strings back to Date objects
          const sessionsWithDates = parsed.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setSessions(sessionsWithDates);
        } catch (error) {
          console.error('Error loading sessions:', error);
        }
      }
    };

    loadSessions();

    // Listen for storage events from ChatInterface
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatSessions') {
        loadSessions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same window
    const handleSessionsUpdate = () => {
      loadSessions();
    };
    
    window.addEventListener('sessionsUpdated', handleSessionsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionsUpdated', handleSessionsUpdate);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <SearchBar 
        isCollapsed={isCollapsed} 
        onExpand={onExpand} 
        onJobSubmit={onJobSubmit} 
      />
      
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          <ChatSessionsList 
            currentSessionId={currentSessionId}
            onSessionSelect={onSessionSelect}
            onNewSession={onNewSession}
            sessions={sessions}
          />
        </div>
      )}
    </div>
  );
}