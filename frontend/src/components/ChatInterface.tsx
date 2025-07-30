"use client";

import { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plotlyGraphs?: any[]; // Array of Plotly JSON objects
}

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className = "" }: ChatInterfaceProps) {
  // Sample assistant message with Plotly graphs
  const sampleAssistantMessage: ChatMessage = {
    id: 'assistant-sample-1',
    role: 'assistant',
    content: 'Here are some data visualizations to help you understand the repository metrics:',
    timestamp: new Date(),
    plotlyGraphs: [
      {
        data: [
          {
            x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            y: [120, 145, 130, 165, 185, 195],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Commits Over Time',
            line: { color: '#3B82F6', width: 2 },
            marker: { size: 6 }
          }
        ],
        layout: {
          title: 'Repository Activity - Commits per Month',
          xaxis: { title: 'Month' },
          yaxis: { title: 'Number of Commits' },
          height: 350
        }
      },
      {
        data: [
          {
            labels: ['JavaScript', 'TypeScript', 'Python', 'CSS', 'Other'],
            values: [35, 30, 20, 10, 5],
            type: 'pie',
            marker: {
              colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }
          }
        ],
        layout: {
          title: 'Language Distribution',
          height: 350
        }
      },
      {
        data: [
          {
            x: ['Issues Created', 'Issues Closed', 'PRs Merged', 'PRs Open'],
            y: [45, 38, 52, 12],
            type: 'bar',
            marker: {
              color: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B']
            }
          }
        ],
        layout: {
          title: 'Repository Statistics',
          xaxis: { title: 'Metric Type' },
          yaxis: { title: 'Count' },
          height: 350
        }
      }
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([sampleAssistantMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGraphs, setExpandedGraphs] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // Convert newlines to line breaks and handle bullet points
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const toggleGraphs = (messageId: string) => {
    setExpandedGraphs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden max-h-full ${className}`}>
      {/* Chat Header */}
      <div className="p-6 border-b border-[#292929] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-inter">AI Assistant</h2>
            <p className="text-sm text-gray-400 font-inter">Ask me about your data analysis</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin min-h-0 max-h-full overflow-x-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[#292929] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2 font-inter">Welcome to Aureole Chat</p>
            <p className="text-gray-500 text-sm max-w-md font-inter">
              I'm here to help you understand your data analysis, explain repository metrics, and guide you through the platform features.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="w-full">
              {/* Message bubble */}
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#292929] text-white'
                      : 'bg-[#1D1D1D] text-gray-100'
                  }`}
                >
                  <div className="text-sm leading-relaxed font-inter" style={{ fontSize: '18px' }}>
                    {formatMessageContent(message.content)}
                  </div>
                  <div className={`text-xs mt-2 font-inter ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              {/* Graphs dropdown - only for assistant messages */}
              {message.role === 'assistant' && message.plotlyGraphs && message.plotlyGraphs.length > 0 && (
                <div className="mt-3 w-full">
                  <div className="ml-4">
                    <button
                      onClick={() => toggleGraphs(message.id)}
                      className="text-xs px-3 py-1 rounded-full transition-colors font-inter bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]"
                    >
                      {expandedGraphs.has(message.id) ? 'Hide Graphs' : `Show Graphs (${message.plotlyGraphs.length})`}
                    </button>
                  </div>
                  
                  {/* Graphs container */}
                  {expandedGraphs.has(message.id) && (
                    <div className="mt-3 ml-4 w-full space-y-4">
                      {message.plotlyGraphs.map((graph, index) => (
                        <div key={index} className="border border-[#404040] rounded-lg p-3 bg-[#1A1A1A] w-full">
                          <Plot
                            data={graph.data || []}
                            layout={{
                              ...graph.layout,
                              autosize: true,
                              margin: { l: 50, r: 50, t: 50, b: 50 },
                              paper_bgcolor: 'rgba(0,0,0,0)',
                              plot_bgcolor: 'rgba(0,0,0,0)',
                              font: { color: '#ffffff' },
                              ...graph.layout
                            }}
                            config={{ responsive: true, displayModeBar: false }}
                            style={{ width: '100%', height: '400px' }}
                            useResizeHandler={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        

        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-2 flex-shrink-0">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm font-inter" style={{ fontSize: '18px' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 flex-shrink-0">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your data..."
          className="w-full bg-[#292929] text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none border border-[#404040] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors font-inter"
          style={{ fontSize: '18px', minHeight: '44px', maxHeight: '120px' }}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
      </div>
    </div>
  );
} 