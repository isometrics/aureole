"""
Simple API that provides repository and organization data for client-side processing.
This API follows the client-side caching approach used in the main 8Knot application.
"""
import os
import sys
import logging
import json
from flask import Flask, request, jsonify
from typing import List, Dict, Any
from dotenv import load_dotenv
from db_manager.augur_manager import AugurManager

# Load environment variables from .env file
load_dotenv()

# Add the parent directory to the path so we can import from 8Knot
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(format="%(asctime)s %(levelname)-8s %(message)s", level=logging.INFO)

# Initialize Flask app
app = Flask(__name__)

# Global AugurManager instance
augur_manager = None


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


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "augur_connected": augur_manager is not None
    })


@app.route('/api/data', methods=['GET'])
def get_all_data():
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
            return jsonify({"error": "AugurManager not initialized"}), 500
        
        # Get all available options
        options = augur_manager.get_multiselect_options().copy()
        
        # Separate repos and orgs
        repos = []
        orgs = []
        
        for opt in options:
            if isinstance(opt["value"], int):
                # It's a repo
                repo_data = {
                    "label": opt["label"],
                    "value": opt["value"],
                    "type": "repo",
                    "formatted_label": f"repo: {opt['label']}",
                    "repo_ids": [opt["value"]]  # Single repo ID for individual repos
                }
                repos.append(repo_data)
            else:
                # It's an org - get all repo IDs for this organization
                org_name = opt["value"]
                org_repo_ids = []
                if augur_manager.is_org(org_name):
                    org_repo_ids = augur_manager.org_to_repos(org_name)
                
                org_data = {
                    "label": opt["label"],
                    "value": opt["value"],
                    "type": "org",
                    "formatted_label": f"org: {opt['label']}",
                    "repo_ids": org_repo_ids  # List of repo IDs for organizations
                }
                orgs.append(org_data)
        
        # Sort by label for consistent ordering
        repos.sort(key=lambda x: x["label"].lower())
        orgs.sort(key=lambda x: x["label"].lower())
        
        # Prepare response with all data
        response_data = {
            "repositories": repos,
            "organizations": orgs,
            "all_items": []  # Combined list for easy client-side processing
        }
        
        # Add combined list for easy searching
        for repo in repos:
            response_data["all_items"].append({
                "label": repo["formatted_label"],
                "value": repo["value"],
                "type": "repo",
                "original_label": repo["label"],
                "repo_ids": repo["repo_ids"]
            })
        for org in orgs:
            response_data["all_items"].append({
                "label": org["formatted_label"],
                "value": org["value"],
                "type": "org",
                "original_label": org["label"],
                "repo_ids": org["repo_ids"]
            })
        
        return jsonify(response_data)
        
    except Exception as e:
        logging.error(f"Error in get_all_data endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/run_tasks', methods=['POST'])
def run_tasks():
    """Run all tasks against a list of repositories."""
    data = request.get_json()
    repo_ids = data.get('repo_ids', [])
    
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
        task_result = generic_query_task.delay(task_name, repo_ids)
        results.append({
            "job_id": task_result.id,
            "status": "queued",
            "task_name": task_name
        })
    
    return jsonify({
        "message": f"Queued {len(results)} tasks for {len(repo_ids)} repositories",
        "results": results
    })


@app.route('/api/task_status', methods=['POST'])
def get_task_status():
    """Get the status of running tasks by their job IDs."""
    data = request.get_json()
    job_ids = data.get('job_ids', [])
    
    from celery_app import app as celery_app
    
    results = []
    for job_id in job_ids:
        task_result = celery_app.AsyncResult(job_id)
        
        status_info = {
            "job_id": job_id,
            "status": task_result.status,
            "ready": task_result.ready()
        }
        
        if task_result.ready():
            if task_result.successful():
                status_info["result"] = "completed"
            else:
                status_info["error"] = str(task_result.info)
        
        results.append(status_info)
    
    return jsonify({"results": results})

@app.route('/api/commits_over_time_graph', methods=['POST'])
def get_commits_over_time_graph():
    from api.commits_over_time import commits_over_time_graph
    data = request.get_json()
    repo_ids = data.get('repo_ids', [])
    fig = commits_over_time_graph(repo_ids, "M")
    data_html = fig.to_html(full_html=False, include_plotlyjs='cdn')
    return jsonify({"graph": data_html})


if __name__ == '__main__':
    # Initialize AugurManager
    if initialize_augur_manager():
        # Get port from environment or default to 5001
        port = int(os.environ.get('PORT', 4995))
        
        logging.info(f"Starting 8Knot Data API on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        logging.error("Failed to initialize AugurManager. Exiting.")
        sys.exit(1)