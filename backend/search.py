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

# Load environment variables from .env file
load_dotenv()

# Add the parent directory to the path so we can import from 8Knot
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from augur_manager import AugurManager

# Import Celery tasks
sys.path.append(os.path.join(os.path.dirname(__file__), 'queries'))
from queries._celery import celery_app
from queries.commits_query import commits_query
from queries.issues_query import issues_query
from queries.prs_query import prs_query
from queries.contributors_query import contributors_query

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
    
    Query parameters:
    - include_metadata: Include metadata about the dataset (default: true)
    
    Returns:
    - Complete dataset with repositories, organizations, combined list, and metadata
    """
    try:
        if augur_manager is None:
            return jsonify({"error": "AugurManager not initialized"}), 500
        
        include_metadata = request.args.get('include_metadata', 'true').lower() == 'true'
        
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
                    "formatted_label": f"repo: {opt['label']}"
                }
                repos.append(repo_data)
            else:
                # It's an org
                org_data = {
                    "label": opt["label"],
                    "value": opt["value"],
                    "type": "org",
                    "formatted_label": f"org: {opt['label']}"
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
                "original_label": repo["label"]
            })
        for org in orgs:
            response_data["all_items"].append({
                "label": org["formatted_label"],
                "value": org["value"],
                "type": "org",
                "original_label": org["label"]
            })
        
        # Add metadata if requested
        if include_metadata:
            metadata = {
                "total_repositories": len(repos),
                "total_organizations": len(orgs),
                "total_items": len(repos) + len(orgs),
                "last_updated": augur_manager.get_last_update_time() if hasattr(augur_manager, 'get_last_update_time') else None,
                "dataset_info": {
                    "description": "Complete dataset of repositories and organizations for client-side search",
                    "usage": "Use this data for client-side fuzzy search and filtering",
                    "recommended_client_libraries": ["rapidfuzz", "fuse.js", "fuse.js"]
                }
            }
            response_data["metadata"] = metadata
        
        return jsonify(response_data)
        
    except Exception as e:
        logging.error(f"Error in get_all_data endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/convert', methods=['POST'])
def convert_selections():
    """
    Convert selected values to repo IDs, similar to multiselect_values_to_repo_ids.
    
    Request body:
    - selections: List of selected values (repo IDs and org names)
    
    Returns:
    - List of repo IDs that correspond to the selections
    """
    try:
        if augur_manager is None:
            return jsonify({"error": "AugurManager not initialized"}), 500
        
        data = request.get_json()
        if not data or 'selections' not in data:
            return jsonify({"error": "Request body must contain 'selections' array"}), 400
        
        selections = data['selections']
        if not isinstance(selections, list):
            return jsonify({"error": "Selections must be an array"}), 400
        
        # Separate repos and orgs
        repo_ids = [r for r in selections if isinstance(r, int)]
        org_names = [n for n in selections if isinstance(n, str)]
        
        # Get repo IDs from orgs
        org_repo_ids = []
        for org_name in org_names:
            if augur_manager.is_org(org_name):
                org_repos = augur_manager.org_to_repos(org_name)
                org_repo_ids.extend(org_repos)
        
        # Combine all repo IDs and remove duplicates
        all_repo_ids = list(set(repo_ids + org_repo_ids))
        
        return jsonify({
            "repo_ids": all_repo_ids,
            "metadata": {
                "input_selections": selections,
                "repo_selections": repo_ids,
                "org_selections": org_names,
                "org_repo_ids": org_repo_ids,
                "total_repos": len(all_repo_ids)
            }
        })
        
    except Exception as e:
        logging.error(f"Error in convert_selections endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/celery/tasks', methods=['POST'])
def submit_celery_tasks():
    """
    Submit Celery tasks for data collection.
    
    Request body:
    - repo_ids: List of repository IDs to process
    - task_types: List of task types to run (commits, issues, prs, contributors)
    - execution_mode: "async" (default) or "sync" for testing
    
    Returns:
    - Task IDs and status information
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        repo_ids = data.get('repo_ids', [])
        task_types = data.get('task_types', ['commits', 'issues', 'prs', 'contributors'])
        execution_mode = data.get('execution_mode', 'async')
        
        if not repo_ids:
            return jsonify({"error": "repo_ids is required and cannot be empty"}), 400
        
        if not isinstance(repo_ids, list):
            return jsonify({"error": "repo_ids must be a list"}), 400
        
        # Task mapping
        task_mapping = {
            'commits': commits_query,
            'issues': issues_query,
            'prs': prs_query,
            'contributors': contributors_query
        }
        
        results = {
            "submitted_tasks": [],
            "execution_mode": execution_mode,
            "repo_ids": repo_ids,
            "task_types": task_types
        }
        
        if execution_mode == 'sync':
            # Synchronous execution for testing
            for task_type in task_types:
                if task_type in task_mapping:
                    try:
                        # Execute task directly (synchronous)
                        task_result = task_mapping[task_type](repo_ids)
                        results["submitted_tasks"].append({
                            "task_type": task_type,
                            "status": "completed",
                            "result": task_result
                        })
                    except Exception as e:
                        results["submitted_tasks"].append({
                            "task_type": task_type,
                            "status": "failed",
                            "error": str(e)
                        })
        else:
            # Asynchronous execution (default)
            for task_type in task_types:
                if task_type in task_mapping:
                    try:
                        # Method 1: Using .delay() - Simple async execution
                        task = task_mapping[task_type].delay(repo_ids)
                        results["submitted_tasks"].append({
                            "task_type": task_type,
                            "task_id": task.id,
                            "status": "submitted",
                            "method": "delay"
                        })
                    except Exception as e:
                        results["submitted_tasks"].append({
                            "task_type": task_type,
                            "status": "failed",
                            "error": str(e)
                        })
        
        return jsonify(results)
        
    except Exception as e:
        logging.error(f"Error in submit_celery_tasks endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/celery/tasks/<task_id>/status', methods=['GET'])
def get_task_status(task_id):
    """
    Get the status of a Celery task.
    
    Args:
    - task_id: The ID of the task to check
    
    Returns:
    - Task status and result if available
    """
    try:
        # Get task result from Celery
        task_result = celery_app.AsyncResult(task_id)
        
        response = {
            "task_id": task_id,
            "status": task_result.status,
            "ready": task_result.ready()
        }
        
        if task_result.ready():
            if task_result.successful():
                response["result"] = task_result.result
            else:
                response["error"] = str(task_result.info)
        
        return jsonify(response)
        
    except Exception as e:
        logging.error(f"Error getting task status: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/celery/tasks/advanced', methods=['POST'])
def submit_advanced_celery_tasks():
    """
    Submit Celery tasks with advanced options using apply_async.
    
    Request body:
    - repo_ids: List of repository IDs to process
    - task_types: List of task types to run
    - options: Advanced options (countdown, eta, priority, etc.)
    
    Returns:
    - Task IDs and status information
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        repo_ids = data.get('repo_ids', [])
        task_types = data.get('task_types', ['commits'])
        options = data.get('options', {})
        
        if not repo_ids:
            return jsonify({"error": "repo_ids is required and cannot be empty"}), 400
        
        # Task mapping
        task_mapping = {
            'commits': commits_query,
            'issues': issues_query,
            'prs': prs_query,
            'contributors': contributors_query
        }
        
        results = {
            "submitted_tasks": [],
            "repo_ids": repo_ids,
            "task_types": task_types,
            "options": options
        }
        
        for task_type in task_types:
            if task_type in task_mapping:
                try:
                    # Method 2: Using .apply_async() - Advanced async execution
                    task = task_mapping[task_type].apply_async(
                        args=[repo_ids],
                        **options  # Can include countdown, eta, priority, etc.
                    )
                    results["submitted_tasks"].append({
                        "task_type": task_type,
                        "task_id": task.id,
                        "status": "submitted",
                        "method": "apply_async",
                        "options": options
                    })
                except Exception as e:
                    results["submitted_tasks"].append({
                        "task_type": task_type,
                        "status": "failed",
                        "error": str(e)
                    })
        
        return jsonify(results)
        
    except Exception as e:
        logging.error(f"Error in submit_advanced_celery_tasks endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


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
