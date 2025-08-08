"""
Simple API that provides repository and organization data for client-side processing.
This API follows the client-side caching approach used in the main 8Knot application.
"""
import os
import sys
import logging
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from db_manager.augur_manager import AugurManager

# Load environment variables from .env file
load_dotenv()

# Add the parent directory to the path so we can import from 8Knot
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(format="%(asctime)s %(levelname)-8s %(message)s", level=logging.INFO)

# Initialize FastAPI app
app = FastAPI(
    title="8Knot Data API",
    description="API for repository and organization data processing",
    version="1.0.0"
)

# Global AugurManager instance
augur_manager = None


# Pydantic models for request/response validation
class RepoIdsRequest(BaseModel):
    repo_ids: List[int]

class JobIdsRequest(BaseModel):
    job_ids: List[str]

class HealthResponse(BaseModel):
    status: str
    augur_connected: bool

class RepoData(BaseModel):
    label: str
    value: int
    type: str
    formatted_label: str
    repo_ids: List[int]

class OrgData(BaseModel):
    label: str
    value: str
    type: str
    formatted_label: str
    repo_ids: List[int]

class AllDataResponse(BaseModel):
    repositories: List[RepoData]
    organizations: List[OrgData]
    all_items: List[Dict[str, Any]]

class TaskResult(BaseModel):
    job_id: str
    status: str
    task_name: str

class RunTasksResponse(BaseModel):
    message: str
    results: List[TaskResult]

class TaskStatusInfo(BaseModel):
    job_id: str
    status: str
    ready: bool
    result: Optional[str] = None
    error: Optional[str] = None

class TaskStatusResponse(BaseModel):
    results: List[TaskStatusInfo]

class GraphResponse(BaseModel):
    graph: str


def initialize_augur_manager():
    """Initialize the AugurManager with database connection."""
    global augur_manager
    try:
        # Create augur manager object
        augur_manager = AugurManager(handles_oauth=False)
        
        # Create engine
        engine = augur_manager.get_engine()
        
        # Initialize multiselect options
        augur_manager.multiselect_startup()
        
        logging.info("AugurManager initialized successfully")
        return True
    except Exception as e:
        logging.error(f"Failed to initialize AugurManager: {str(e)}")
        return False


@app.get('/health', response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        augur_connected=augur_manager is not None
    )


@app.get('/api/data', response_model=AllDataResponse)
async def get_all_data():
    """
    Get all repositories and organizations in a well-formatted structure for client-side processing.
    This is similar to the client-side cache approach used in the main 8Knot application.
    
    Returns:
    - Complete dataset with repositories, organizations, and combined list
    - Each repository includes repo_ids with a single repo ID
    - Each organization includes repo_ids with a list of repo IDs for all repos in that org
    """
    try:
        if augur_manager is None:
            raise HTTPException(status_code=500, detail="AugurManager not initialized")
        
        # Get all available options
        options = augur_manager.get_multiselect_options().copy()
        
        # Separate repos and orgs
        repos = []
        orgs = []
        
        for opt in options:
            if isinstance(opt["value"], int):
                # It's a repo
                repo_data = RepoData(
                    label=opt["label"],
                    value=opt["value"],
                    type="repo",
                    formatted_label=f"repo: {opt['label']}",
                    repo_ids=[opt["value"]]  # Single repo ID for individual repos
                )
                repos.append(repo_data)
            else:
                # It's an org - get all repo IDs for this organization
                org_name = opt["value"]
                org_repo_ids = []
                if augur_manager.is_org(org_name):
                    org_repo_ids = augur_manager.org_to_repos(org_name)
                
                org_data = OrgData(
                    label=opt["label"],
                    value=opt["value"],
                    type="org",
                    formatted_label=f"org: {opt['label']}",
                    repo_ids=org_repo_ids  # List of repo IDs for organizations
                )
                orgs.append(org_data)
        
        # Sort by label for consistent ordering
        repos.sort(key=lambda x: x.label.lower())
        orgs.sort(key=lambda x: x.label.lower())
        
        # Prepare response with all data
        all_items = []
        
        # Add combined list for easy searching
        for repo in repos:
            all_items.append({
                "label": repo.formatted_label,
                "value": repo.value,
                "type": "repo",
                "original_label": repo.label,
                "repo_ids": repo.repo_ids
            })
        for org in orgs:
            all_items.append({
                "label": org.formatted_label,
                "value": org.value,
                "type": "org",
                "original_label": org.label,
                "repo_ids": org.repo_ids
            })
        
        return AllDataResponse(
            repositories=repos,
            organizations=orgs,
            all_items=all_items
        )
        
    except Exception as e:
        logging.error(f"Error in get_all_data endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/run_tasks', response_model=RunTasksResponse)
async def run_tasks(request: RepoIdsRequest):
    """Run all tasks against a list of repositories."""
    try:
        # Import the generic task
        from celery_app import generic_query_task
        
        # Define all task names
        all_task_names = [
            'repo_info', 'affiliation', 'commits',
            'contributors', 'issue_assignee', 'issues',
            'ossf_score', 'package_version', 'pr_assignee',
            'pr_response', 'prs', 'repo_releases', 'repo_languages'
        ]
        
        # Execute all tasks using the generic task
        results = []
        for task_name in all_task_names:
            task_result = generic_query_task.delay(task_name, request.repo_ids)
            results.append(TaskResult(
                job_id=task_result.id,
                status="queued",
                task_name=task_name
            ))
        
        return RunTasksResponse(
            message=f"Queued {len(results)} tasks for {len(request.repo_ids)} repositories",
            results=results
        )
    except Exception as e:
        logging.error(f"Error in run_tasks endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/task_status', response_model=TaskStatusResponse)
async def get_task_status(request: JobIdsRequest):
    """Get the status of running tasks by their job IDs."""
    try:
        from celery_app import app as celery_app
        
        results = []
        for job_id in request.job_ids:
            task_result = celery_app.AsyncResult(job_id)
            
            status_info = TaskStatusInfo(
                job_id=job_id,
                status=task_result.status,
                ready=task_result.ready()
            )
            
            if task_result.ready():
                if task_result.successful():
                    status_info.result = "completed"
                else:
                    status_info.error = str(task_result.info)
            
            results.append(status_info)
        
        return TaskStatusResponse(results=results)
    except Exception as e:
        logging.error(f"Error in get_task_status endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/commits_over_time_graph', response_model=GraphResponse)
async def get_commits_over_time_graph(request: RepoIdsRequest):
    """Get commits over time graph for specified repositories."""
    try:
        from api.commits_over_time import commits_over_time_graph
        fig = commits_over_time_graph(request.repo_ids, "M")
        graph_data = fig.to_json()
        print(graph_data)
        return ""
    except Exception as e:
        logging.error(f"Error in get_commits_over_time_graph endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Startup event to initialize AugurManager
@app.on_event("startup")
async def startup_event():
    """Initialize AugurManager on startup."""
    if not initialize_augur_manager():
        logging.error("Failed to initialize AugurManager. Exiting.")
        sys.exit(1)


if __name__ == '__main__':
    # This is for local development only
    # In Docker, we use: uvicorn api:app --host 0.0.0.0 --port 4995
    import uvicorn
    
    # Get port from environment or default to 4995
    port = int(os.environ.get('PORT', 4995))
    
    logging.info(f"Starting 8Knot Data API on port {port}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )