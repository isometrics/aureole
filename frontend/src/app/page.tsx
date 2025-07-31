"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ToggleCircle from "@/components/ToggleCircle";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

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

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // Initialize with a session ID on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
        } else {
          // Create initial session
          const newSessionId = `session-${Date.now()}`;
          setCurrentSessionId(newSessionId);
        }
      } catch (error) {
        // Create initial session on error
        const newSessionId = `session-${Date.now()}`;
        setCurrentSessionId(newSessionId);
      }
    } else {
      // Create initial session
      const newSessionId = `session-${Date.now()}`;
      setCurrentSessionId(newSessionId);
    }
  }, []);

  const handleToggle = (isRotated: boolean) => {
    setIsCollapsed(isRotated);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
  };

  const handleJobSubmit = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    // The ChatInterface will handle creating the actual session
  };

  return (
    <div className="h-screen bg-[#242424] flex flex-col">
      {/* Topbar */}
      <div className="h-[60px] bg-[#242424] flex items-center px-6 flex-shrink-0">
        <div className="w-[30px]"></div>
        <div className="flex items-center gap-4">
          {/* Halo Logo */}
          <div className="relative w-8 h-8">
            <svg className="w-full h-full" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="haloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="12" fill="none" stroke="url(#haloGradient)" strokeWidth="3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide font-inter">
            Aureole
          </h1>
        </div>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="ml-auto flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          <div className={`bg-[#1D1D1D] rounded-l-2xl shadow-sm border-r border-[#292929] relative transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-24' : 'w-[340px]'
          }`} style={{ borderRightWidth: '1px' }}>
            {/* Left card content */}
            <Sidebar 
              isCollapsed={isCollapsed} 
              onExpand={handleExpand} 
              onJobSubmit={handleJobSubmit}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
            />
            <ToggleCircle onToggle={handleToggle} isCollapsed={isCollapsed} />
          </div>
          <div className="bg-[#1D1D1D] rounded-r-2xl flex-1 shadow-sm overflow-hidden">
            {/* Chat Interface */}
            <ChatInterface sessionId={currentSessionId} />
          </div>
        </div>
      </div>
    </div>
  );
}
