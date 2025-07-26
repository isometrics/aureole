#!/usr/bin/env python3
"""
Examples of how to fire off Celery requests in your app.

This file demonstrates the different ways to submit tasks to Celery
and how to handle the results.
"""

import sys
import os
import time
import logging
from typing import List, Dict, Any

# Add the queries directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'queries'))

# Import Celery app and tasks
from queries._celery import celery_app
from queries.commits_query import commits_query
from queries.issues_query import issues_query
from queries.prs_query import prs_query
from queries.contributors_query import contributors_query

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def example_1_simple_delay():
    """
    Example 1: Simple task submission using .delay()
    
    This is the simplest way to submit a task asynchronously.
    """
    print("\n=== Example 1: Simple .delay() ===")
    
    # Sample repository IDs
    repo_ids = [12345, 67890]
    
    # Submit task using .delay()
    task = commits_query.delay(repo_ids)
    
    print(f"Task submitted with ID: {task.id}")
    print(f"Task status: {task.status}")
    
    return task


def example_2_apply_async_with_options():
    """
    Example 2: Advanced task submission using .apply_async()
    
    This allows you to specify additional options like countdown, eta, priority, etc.
    """
    print("\n=== Example 2: Advanced .apply_async() ===")
    
    repo_ids = [12345, 67890]
    
    # Submit task with advanced options
    task = commits_query.apply_async(
        args=[repo_ids],
        countdown=10,  # Wait 10 seconds before executing
        priority=5,    # Higher priority (lower number = higher priority)
        expires=300    # Task expires after 5 minutes
    )
    
    print(f"Task submitted with ID: {task.id}")
    print(f"Task will execute in 10 seconds")
    
    return task


def example_3_multiple_tasks():
    """
    Example 3: Submit multiple tasks and track them
    """
    print("\n=== Example 3: Multiple Tasks ===")
    
    repo_ids = [12345, 67890]
    
    # Task mapping
    tasks = {
        'commits': commits_query,
        'issues': issues_query,
        'prs': prs_query,
        'contributors': contributors_query
    }
    
    # Submit all tasks
    submitted_tasks = {}
    for task_name, task_func in tasks.items():
        task = task_func.delay(repo_ids)
        submitted_tasks[task_name] = task
        print(f"Submitted {task_name} task with ID: {task.id}")
    
    return submitted_tasks


def example_4_wait_for_results():
    """
    Example 4: Wait for task results
    """
    print("\n=== Example 4: Wait for Results ===")
    
    repo_ids = [12345, 67890]
    
    # Submit task
    task = commits_query.delay(repo_ids)
    print(f"Task submitted: {task.id}")
    
    # Wait for result (blocking)
    try:
        result = task.get(timeout=60)  # Wait up to 60 seconds
        print(f"Task completed successfully!")
        print(f"Result: {result}")
    except Exception as e:
        print(f"Task failed: {e}")
    
    return task


def example_5_poll_for_status():
    """
    Example 5: Poll for task status
    """
    print("\n=== Example 5: Poll for Status ===")
    
    repo_ids = [12345, 67890]
    
    # Submit task
    task = commits_query.delay(repo_ids)
    print(f"Task submitted: {task.id}")
    
    # Poll for status
    max_wait = 60  # Maximum seconds to wait
    poll_interval = 2  # Check every 2 seconds
    
    start_time = time.time()
    while time.time() - start_time < max_wait:
        # Get task status
        task_result = celery_app.AsyncResult(task.id)
        
        print(f"Status: {task_result.status}")
        
        if task_result.ready():
            if task_result.successful():
                print(f"Task completed successfully!")
                print(f"Result: {task_result.result}")
            else:
                print(f"Task failed: {task_result.info}")
            break
        
        time.sleep(poll_interval)
    else:
        print("Task did not complete within timeout")
    
    return task


def example_6_error_handling():
    """
    Example 6: Error handling and retries
    """
    print("\n=== Example 6: Error Handling ===")
    
    # Submit task with invalid repo IDs to trigger error
    invalid_repo_ids = [-1, -2]  # Invalid repo IDs
    
    try:
        task = commits_query.delay(invalid_repo_ids)
        print(f"Task submitted: {task.id}")
        
        # Wait for result
        result = task.get(timeout=30)
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Task failed as expected: {e}")
        
        # Check task status
        task_result = celery_app.AsyncResult(task.id)
        print(f"Final status: {task_result.status}")
        if task_result.failed():
            print(f"Error info: {task_result.info}")


def example_7_batch_processing():
    """
    Example 7: Batch processing with progress tracking
    """
    print("\n=== Example 7: Batch Processing ===")
    
    # Large list of repo IDs
    repo_ids = list(range(1000, 1010))  # 10 repos
    
    # Submit tasks in batches
    batch_size = 3
    all_tasks = []
    
    for i in range(0, len(repo_ids), batch_size):
        batch = repo_ids[i:i + batch_size]
        task = commits_query.delay(batch)
        all_tasks.append(task)
        print(f"Submitted batch {i//batch_size + 1}: {task.id}")
    
    # Monitor all tasks
    completed = 0
    failed = 0
    
    for task in all_tasks:
        try:
            result = task.get(timeout=60)
            completed += 1
            print(f"Task {task.id} completed")
        except Exception as e:
            failed += 1
            print(f"Task {task.id} failed: {e}")
    
    print(f"Batch processing complete: {completed} succeeded, {failed} failed")


def example_8_celery_control():
    """
    Example 8: Celery control and monitoring
    """
    print("\n=== Example 8: Celery Control ===")
    
    # Get active workers
    try:
        active_workers = celery_app.control.inspect().active()
        if active_workers:
            print("Active workers:")
            for worker, tasks in active_workers.items():
                print(f"  {worker}: {len(tasks)} tasks")
        else:
            print("No active workers found")
    except Exception as e:
        print(f"Could not inspect workers: {e}")
    
    # Get registered tasks
    try:
        registered_tasks = celery_app.control.inspect().registered()
        if registered_tasks:
            print("\nRegistered tasks:")
            for worker, tasks in registered_tasks.items():
                print(f"  {worker}: {tasks}")
    except Exception as e:
        print(f"Could not get registered tasks: {e}")


if __name__ == "__main__":
    print("Celery Task Submission Examples")
    print("=" * 50)
    
    # Run examples
    try:
        # Note: These examples assume you have Celery workers running
        # and Redis is available. Some may fail if workers aren't running.
        
        example_1_simple_delay()
        example_2_apply_async_with_options()
        example_3_multiple_tasks()
        example_4_wait_for_results()
        example_5_poll_for_status()
        example_6_error_handling()
        example_7_batch_processing()
        example_8_celery_control()
        
    except Exception as e:
        print(f"Error running examples: {e}")
        print("\nMake sure you have:")
        print("1. Redis running")
        print("2. Celery workers running")
        print("3. Proper environment variables set") 