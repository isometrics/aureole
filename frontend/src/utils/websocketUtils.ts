import { JobStatus } from './jobUtils';

// WebSocket/SSE connection manager for job status updates
export class JobStatusWebSocket {
  private eventSource: EventSource | null = null;
  private jobId: string;
  private onStatusChange: (status: JobStatus) => void;
  private onComplete: () => void;
  private onError: (error: any) => void;

  constructor(
    jobId: string,
    onStatusChange: (status: JobStatus) => void,
    onComplete: () => void,
    onError: (error: any) => void
  ) {
    this.jobId = jobId;
    this.onStatusChange = onStatusChange;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  connect() {
    try {
      // Use Server-Sent Events for real-time updates
      this.eventSource = new EventSource(`/api/websocket?jobId=${this.jobId}`);

      this.eventSource.onopen = () => {
        console.log('WebSocket/SSE connection opened for job:', this.jobId);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('WebSocket/SSE error:', error);
        this.onError(error);
        this.cleanup();
      };

      // Set up timeout to stop listening after 5 minutes
      setTimeout(() => {
        if (this.eventSource) {
          console.log('WebSocket/SSE timeout for job:', this.jobId);
          this.cleanup();
          this.onError(new Error('Connection timeout'));
        }
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('Error creating WebSocket/SSE connection:', error);
      this.onError(error);
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'connected':
        console.log('Connected to job status updates for:', data.jobId);
        break;
      
      case 'job_status_update':
        console.log('Job status update:', data.status);
        this.onStatusChange(data.status);
        
        if (data.status.status === 'completed') {
          this.onComplete();
          this.cleanup();
        }
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  disconnect() {
    this.cleanup();
  }
}

// Convenience function that matches the original polling interface
export function subscribeToJobStatus(
  jobId: string,
  onStatusChange: (status: JobStatus) => void,
  onComplete: () => void,
  onError: (error: any) => void
): JobStatusWebSocket {
  const websocket = new JobStatusWebSocket(jobId, onStatusChange, onComplete, onError);
  websocket.connect();
  return websocket;
}
