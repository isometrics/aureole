import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1-nano'),
    messages,
    system: 'You are a helpful assistant. Keep your responses concise and friendly.',
    maxTokens: 500,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
} 