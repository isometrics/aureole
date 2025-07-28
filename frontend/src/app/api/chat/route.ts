import { NextResponse } from 'next/server';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// In-memory storage for chat history (in production, use a database)
const chatHistory = new Map<string, ChatMessage[]>();

export async function POST(request: Request) {
  try {
    const { message, sessionId = 'default' } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create chat history for this session
    if (!chatHistory.has(sessionId)) {
      chatHistory.set(sessionId, []);
    }
    
    const history = chatHistory.get(sessionId)!;
    
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    history.push(userMessage);
    
    // Simulate AI response (replace with actual AI API call)
    let aiResponse = '';
    
    // Simple rule-based responses for demonstration
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      aiResponse = "Hello! I'm here to help you with your Aureole data analysis. What would you like to know?";
    } else if (message.toLowerCase().includes('help')) {
      aiResponse = "I can help you with:\n• Understanding your data analysis results\n• Explaining repository metrics\n• Guiding you through the visualization features\n• Answering questions about Augur data\n\nWhat specific area would you like help with?";
    } else if (message.toLowerCase().includes('repository') || message.toLowerCase().includes('repo')) {
      aiResponse = "I can help you analyze repository data! You can search for repositories using the search bar on the left, and I can explain the metrics and insights once you've selected some repositories for analysis.";
    } else if (message.toLowerCase().includes('data') || message.toLowerCase().includes('analysis')) {
      aiResponse = "The platform provides comprehensive repository analysis including contribution patterns, code metrics, and development trends. Would you like me to explain any specific metrics or help you interpret your current analysis?";
    } else {
      aiResponse = `I understand you're asking about: "${message}". I'm here to help with Aureole data analysis and repository insights. Could you be more specific about what you'd like to know?`;
    }
    
    // Add AI response to history
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    history.push(assistantMessage);
    
    // Keep only last 50 messages to prevent memory issues
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    return NextResponse.json({
      message: assistantMessage,
      history: history
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';
    
    const history = chatHistory.get(sessionId) || [];
    
    return NextResponse.json({
      history: history
    });
    
  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
} 