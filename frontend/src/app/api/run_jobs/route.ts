import { NextResponse } from 'next/server';

// Simple in-memory storage for job requests
// In production, this would be a database table
const jobRequests = new Map<string, { repo_ids: number[], timestamp: number, status: string, job_ids?: string[] }>();

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
  
  // Update status
  jobRequests.set(requestKey, {
    repo_ids: repoIds,
    timestamp: Date.now(),
    status: 'loading', // Keep as loading until we check individual job statuses
    job_ids: jobIds
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
  
  // If we have job IDs, check their status with the backend
  if (jobRequest.job_ids && jobRequest.job_ids.length > 0) {
    try {
      const statusResponse = await fetch('http://localhost:4995/api/task_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_ids: jobRequest.job_ids })
      });
      
      const statusResult = await statusResponse.json();
      
      // Check if all jobs are completed
      const allCompleted = statusResult.results?.every((r: any) => r.status === 'SUCCESS') || false;
      
      if (allCompleted) {
        jobRequests.set(jobId, {
          ...jobRequest,
          status: 'completed'
        });
      }
      
      return NextResponse.json({
        status: allCompleted ? 'completed' : 'loading',
        job_id: jobId,
        job_statuses: statusResult.results,
        timestamp: jobRequest.timestamp
      });
    } catch (error) {
      // If backend is not available, return current status
      return NextResponse.json({
        status: jobRequest.status,
        job_id: jobId,
        timestamp: jobRequest.timestamp
      });
    }
  }
  
  return NextResponse.json({
    status: jobRequest.status,
    job_id: jobId,
    timestamp: jobRequest.timestamp
  });
} 