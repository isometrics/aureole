import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create the OpenAI completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for Aureole, a data analysis platform for repository metrics and insights. 
          
Your role is to help users understand:
- Repository analysis and metrics
- Data visualization features
- Augur data insights
- Platform functionality

Keep responses helpful, concise, and focused on data analysis topics. If users ask about unrelated topics, gently redirect them back to Aureole-related questions.

Current context: The user is working with a repository analysis platform that provides insights into code metrics, contribution patterns, and development trends.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return new Response(JSON.stringify({ 
      message: {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request: Request) {
  // Return empty history since we're not caching
  return new Response(JSON.stringify({ history: [] }), {
    headers: { 'Content-Type': 'application/json' }
  });
} 