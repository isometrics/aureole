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
  currentTitle: string;
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  onNewSession?: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  onExpand, 
  onJobSubmit,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  currentTitle
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
      
      {currentTitle === "Chat" && !isCollapsed && (
        <div className="flex-1 overflow-hidden">
          <ChatSessionsList 
            currentSessionId={currentSessionId!}
            onSessionSelect={onSessionSelect!}
            onNewSession={onNewSession!}
            sessions={sessions}
          />
        </div>
      )}
      
      {currentTitle === "8Knot" && (
        // 8Knot navigation content
        <div className="flex-1 px-6">
          <div className="space-y-2">
            
            <a 
              href="/repo_overview" 
              className={`flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#404040] rounded-lg transition-colors duration-150 text-[16px] ${isCollapsed ? 'justify-center min-w-[48px]' : ''}`}
              style={{ fontWeight: 500 }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!isCollapsed && <span>Repository Overview</span>}
            </a>
            
            <a 
              href="/contributors" 
              className={`flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#404040] rounded-lg transition-colors duration-150 text-[16px] ${isCollapsed ? 'justify-center min-w-[48px]' : ''}`}
              style={{ fontWeight: 500 }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {!isCollapsed && <span>Contributors</span>}
            </a>
            
            <a 
              href="/contributions" 
              className={`flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#404040] rounded-lg transition-colors duration-150 text-[16px] ${isCollapsed ? 'justify-center min-w-[48px]' : ''}`}
              style={{ fontWeight: 500 }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isCollapsed && <span>Contributions</span>}
            </a>
            
            <a 
              href="/affiliation" 
              className={`flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#404040] rounded-lg transition-colors duration-150 text-[16px] ${isCollapsed ? 'justify-center min-w-[48px]' : ''}`}
              style={{ fontWeight: 500 }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {!isCollapsed && <span>Affiliation</span>}
            </a>
            
            <a 
              href="/chaoss" 
              className={`flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#404040] rounded-lg transition-colors duration-150 text-[16px] ${isCollapsed ? 'justify-center min-w-[48px]' : ''}`}
              style={{ fontWeight: 500 }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!isCollapsed && <span>CHAOSS</span>}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}