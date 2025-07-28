/**
 * Job status tracking utilities
 */

export interface JobStatus {
  status: 'loading' | 'completed' | 'error';
  job_id: string;
  job_ids?: string[];
  timestamp: number;
  job_statuses?: any[];
}

/**
 * Submit jobs and return job ID for tracking
 */
export async function submitJobs(repoIds: number[]): Promise<JobStatus> {
  const response = await fetch('/api/run_jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_ids: repoIds })
  });
  
  return await response.json();
}

/**
 * Check job status
 */
export async function checkJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`/api/run_jobs?job_id=${jobId}`);
  return await response.json();
}

/**
 * Poll job status until completion
 */
export function pollJobStatus(
  jobId: string, 
  onStatusChange: (status: JobStatus) => void,
  onComplete: () => void,
  onError: (error: any) => void
) {
  const pollInterval = setInterval(async () => {
    try {
      const status = await checkJobStatus(jobId);
      onStatusChange(status);
      
      if (status.status === 'completed') {
        clearInterval(pollInterval);
        clearTimeout(timeoutId); // Clear the timeout when completed
        onComplete();
      }
    } catch (error) {
      clearInterval(pollInterval);
      clearTimeout(timeoutId); // Clear the timeout on error
      onError(error);
    }
  }, 2000); // Poll every 2 seconds
  
  // Stop polling after 5 minutes
  const timeoutId = setTimeout(() => {
    clearInterval(pollInterval);
    onError(new Error('Polling timeout'));
  }, 300000);
  
  return pollInterval; // Return interval ID for manual clearing if needed
} 