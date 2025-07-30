import { NextRequest } from 'next/server';

// For now, we'll create a simpler approach that doesn't require a separate WebSocket server
// Instead, we'll use Server-Sent Events (SSE) which is easier to implement in Next.js

// Store active connections: Map<jobId, Set<ReadableStreamDefaultController>>
const jobSubscriptions = new Map<string, Set<ReadableStreamDefaultController>>();

// Store client to jobs mapping
const clientJobs = new Map<ReadableStreamDefaultController, Set<string>>();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return Response.json({ error: 'jobId parameter is required' }, { status: 400 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add client to job subscription
      if (!jobSubscriptions.has(jobId)) {
        jobSubscriptions.set(jobId, new Set());
      }
      jobSubscriptions.get(jobId)!.add(controller);

      // Track client's jobs
      if (!clientJobs.has(controller)) {
        clientJobs.set(controller, new Set());
      }
      clientJobs.get(controller)!.add(jobId);

      // Send initial connection message
      const message = `data: ${JSON.stringify({
        type: 'connected',
        jobId,
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(message));
    },
    cancel() {
      // Cleanup when connection is closed
      cleanupClient(jobId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

function cleanupClient(jobId: string) {
  const subscribers = jobSubscriptions.get(jobId);
  if (subscribers) {
    subscribers.clear();
    jobSubscriptions.delete(jobId);
  }
}

// Function to broadcast job status updates
export function broadcastJobUpdate(jobId: string, status: any) {
  const subscribers = jobSubscriptions.get(jobId);
  if (subscribers && subscribers.size > 0) {
    const message = `data: ${JSON.stringify({
      type: 'job_status_update',
      jobId,
      status,
      timestamp: new Date().toISOString()
    })}\n\n`;

    const encodedMessage = new TextEncoder().encode(message);
    
    subscribers.forEach(controller => {
      try {
        controller.enqueue(encodedMessage);
      } catch (error) {
        // Remove dead connections
        subscribers.delete(controller);
      }
    });
  }
}

export async function POST(request: NextRequest) {
  const { jobId, status } = await request.json();
  
  if (!jobId || !status) {
    return Response.json({ error: 'jobId and status are required' }, { status: 400 });
  }

  // Broadcast the update
  broadcastJobUpdate(jobId, status);

  return Response.json({ 
    message: 'Job status broadcasted',
    subscribers: jobSubscriptions.get(jobId)?.size || 0
  });
}
