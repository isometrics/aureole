# Celery Task Submission Guide

This guide explains how to fire off Celery requests in your application.

## Overview

Your app uses Celery for asynchronous task processing. Tasks are submitted to Redis (the message broker) and executed by Celery workers in the background.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flask App     │    │   Redis         │    │   Celery        │
│   (API)         │───▶│   (Message      │───▶│   Workers       │
│                 │    │    Broker)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Available Tasks

Your app has these Celery tasks available:

- `commits_query` - Query commit data from Augur database
- `issues_query` - Query issue data from Augur database  
- `prs_query` - Query pull request data from Augur database
- `contributors_query` - Query contributor data from Augur database
- `affiliation_query` - Query affiliation data from Augur database
- `repo_languages_query` - Query repository language data
- `package_version_query` - Query package dependency data
- `repo_releases_query` - Query repository release data
- `ossf_score_query` - Query OSSF scorecard data
- `repo_info_query` - Query repository information
- `pr_response_query` - Query PR response data
- `user_groups_query` - Query user groups data

## Starting Celery Workers

Before you can submit tasks, you need to start Celery workers:

### Method 1: Using the helper script
```bash
cd backend
python start_celery_worker.py --concurrency 4 --loglevel info
```

### Method 2: Direct command
```bash
cd backend/queries
celery -A _celery worker --loglevel=info --concurrency=4
```

### Method 3: With specific options
```bash
cd backend/queries
celery -A _celery worker --loglevel=debug --concurrency=8 --queues=celery
```

## Ways to Fire Off Celery Requests

### 1. Simple Task Submission (`.delay()`)

The simplest way to submit a task:

```python
from queries.commits_query import commits_query

# Submit task asynchronously
repo_ids = [12345, 67890]
task = commits_query.delay(repo_ids)

print(f"Task ID: {task.id}")
print(f"Status: {task.status}")
```

### 2. Advanced Task Submission (`.apply_async()`)

For more control over task execution:

```python
from queries.commits_query import commits_query

# Submit task with options
task = commits_query.apply_async(
    args=[repo_ids],
    countdown=10,      # Wait 10 seconds before executing
    priority=5,        # Higher priority (lower number = higher priority)
    expires=300,       # Task expires after 5 minutes
    queue='celery'     # Specific queue
)
```

### 3. Multiple Tasks

Submit multiple tasks at once:

```python
from queries.commits_query import commits_query
from queries.issues_query import issues_query
from queries.prs_query import prs_query

repo_ids = [12345, 67890]

# Submit all tasks
tasks = {
    'commits': commits_query.delay(repo_ids),
    'issues': issues_query.delay(repo_ids),
    'prs': prs_query.delay(repo_ids)
}

# Track task IDs
for task_name, task in tasks.items():
    print(f"{task_name}: {task.id}")
```

### 4. Wait for Results

Block until task completes:

```python
task = commits_query.delay(repo_ids)

try:
    # Wait up to 60 seconds for result
    result = task.get(timeout=60)
    print(f"Task completed: {result}")
except Exception as e:
    print(f"Task failed: {e}")
```

### 5. Poll for Status

Check task status periodically:

```python
import time
from queries._celery import celery_app

task = commits_query.delay(repo_ids)

# Poll for status
while True:
    task_result = celery_app.AsyncResult(task.id)
    
    if task_result.ready():
        if task_result.successful():
            print(f"Success: {task_result.result}")
        else:
            print(f"Failed: {task_result.info}")
        break
    
    print(f"Status: {task_result.status}")
    time.sleep(2)
```

## API Endpoints

Your Flask app now includes these endpoints for task submission:

### Submit Tasks
```bash
POST /api/celery/tasks
Content-Type: application/json

{
    "repo_ids": [12345, 67890],
    "task_types": ["commits", "issues", "prs"],
    "execution_mode": "async"
}
```

### Check Task Status
```bash
GET /api/celery/tasks/{task_id}/status
```

### Advanced Task Submission
```bash
POST /api/celery/tasks/advanced
Content-Type: application/json

{
    "repo_ids": [12345, 67890],
    "task_types": ["commits"],
    "options": {
        "countdown": 10,
        "priority": 5,
        "expires": 300
    }
}
```

## Error Handling

Tasks have built-in retry logic:

```python
@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def my_task(self, repos):
    # Task will automatically retry on failure
    pass
```

## Monitoring

### Check Worker Status
```python
from queries._celery import celery_app

# Get active workers
active_workers = celery_app.control.inspect().active()

# Get registered tasks
registered_tasks = celery_app.control.inspect().registered()
```

### Using Celery CLI
```bash
# Monitor tasks
celery -A _celery monitor

# Inspect workers
celery -A _celery inspect active

# Purge queue
celery -A _celery purge
```

## Environment Variables

Make sure these environment variables are set:

```bash
# Redis configuration
REDIS_SERVICE_HOST=localhost
REDIS_SERVICE_PORT=6379
REDIS_PASSWORD=

# PostgreSQL cache configuration
CACHE_DB_NAME=augur_cache
CACHE_HOST=localhost
CACHE_USER=postgres
POSTGRES_PASSWORD=password
CACHE_PORT=5432

# Augur database configuration
AUGUR_USERNAME=your_username
AUGUR_PASSWORD=your_password
AUGUR_HOST=your_host
AUGUR_PORT=your_port
AUGUR_DATABASE=your_database
AUGUR_SCHEMA=your_schema
```

## Examples

Run the examples script to see all methods in action:

```bash
cd backend
python celery_examples.py
```

## Best Practices

1. **Use `.delay()` for simple cases** - It's the easiest way to submit tasks
2. **Use `.apply_async()` for advanced control** - When you need countdown, priority, etc.
3. **Handle errors gracefully** - Tasks have retry logic, but handle failures in your code
4. **Monitor task status** - Don't assume tasks complete successfully
5. **Use appropriate concurrency** - Start with 4 workers, adjust based on load
6. **Set timeouts** - Always set timeouts when waiting for results
7. **Batch large workloads** - Submit tasks in batches for better performance

## Troubleshooting

### Common Issues

1. **"No workers found"** - Start Celery workers first
2. **"Redis connection failed"** - Check Redis is running and accessible
3. **"Task timeout"** - Increase timeout or check if task is stuck
4. **"Import errors"** - Make sure all dependencies are installed

### Debug Mode

Start workers in debug mode for more information:

```bash
celery -A _celery worker --loglevel=debug
```

### Check Logs

Monitor worker logs for errors and task execution details. 