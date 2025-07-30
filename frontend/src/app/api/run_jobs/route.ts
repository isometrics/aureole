import { NextResponse } from 'next/server';
import { broadcastJobUpdate } from '../websocket/route';

// Simple in-memory storage for job requests
// In production, this would be a database table
const jobRequests = new Map<string, { repo_ids: number[], timestamp: number, status: string, job_ids?: string[], pollInterval?: NodeJS.Timeout }>();

// Background polling mechanism to check job status every 10 seconds
async function pollJobStatusFromBackend(jobId: string, backendJobIds: string[]) {
  const intervalId = setInterval(async () => {
    try {
      const statusResponse = await fetch('http://localhost:4995/api/task_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_ids: backendJobIds })
      });
      
      if (!statusResponse.ok) {
        console.error(`Failed to check job status: ${statusResponse.status}`);
        return;
      }
      
      const statusResult = await statusResponse.json();
      const allCompleted = statusResult.results?.every((r: any) => r.status === 'SUCCESS') || false;
      
      // Update job request status
      const jobRequest = jobRequests.get(jobId);
      if (jobRequest) {
        if (allCompleted) {
          jobRequest.status = 'completed';
          clearInterval(intervalId); // Stop polling when completed
          jobRequests.set(jobId, { ...jobRequest, pollInterval: undefined });
        }
        
        // Broadcast status update via WebSocket/SSE
        broadcastJobUpdate(jobId, {
          status: allCompleted ? 'completed' : 'loading',
          job_id: jobId,
          job_statuses: statusResult.results,
          timestamp: new Date().toISOString()
        });
      }
      
      // Stop polling if job is completed or no longer tracked
      if (allCompleted || !jobRequests.has(jobId)) {
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      // Continue polling even if there's an error
    }
  }, 10000); // Poll every 10 seconds
  
  return intervalId;
}

export async function POST(request: Request) {
  const data = await request.json();
  const repoIds = data.repo_ids;
  
  // Create a unique key for this request
  const requestKey = repoIds.sort().join(',');
  
  // Check if this exact request already exists
  if (jobRequests.has(requestKey)) {
    const existingRequest = jobRequests.get(requestKey)!;
    return NextResponse.json({
      status: existingRequest.status,
      message: existingRequest.status === 'loading' ? 'Request already in progress' : 'Request completed',
      job_id: requestKey,
      timestamp: existingRequest.timestamp,
      job_ids: existingRequest.job_ids
    });
  }
  
  // Store the new request
  jobRequests.set(requestKey, {
    repo_ids: repoIds,
    timestamp: Date.now(),
    status: 'loading'
  });
  
  // Send to backend API
  const backendResponse = await fetch('http://localhost:4995/api/run_tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_ids: repoIds })
  });
  
  const backendResult = await backendResponse.json();
  
  // Extract job IDs from backend response
  const jobIds = backendResult.results?.map((r: any) => r.job_id) || [];
  
  // Start background polling for this job
  const pollInterval = await pollJobStatusFromBackend(requestKey, jobIds);
  
  // Update status
  jobRequests.set(requestKey, {
    repo_ids: repoIds,
    timestamp: Date.now(),
    status: 'loading', // Keep as loading until we check individual job statuses
    job_ids: jobIds,
    pollInterval: pollInterval
  });
  
  return NextResponse.json({
    status: 'loading',
    message: 'Jobs submitted successfully',
    job_id: requestKey,
    job_ids: jobIds,
    backend_result: backendResult
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');
  
  if (!jobId || !jobRequests.has(jobId)) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  
  const jobRequest = jobRequests.get(jobId)!;
  
  // Return current status (background polling will update this via WebSocket/SSE)
  return NextResponse.json({
    status: jobRequest.status,
    job_id: jobId,
    job_ids: jobRequest.job_ids,
    timestamp: jobRequest.timestamp,
    message: 'Use WebSocket/SSE endpoint for real-time updates: /api/websocket?jobId=' + jobId
  });
} 