#!/usr/bin/env python3
"""
Script to start Celery workers for the application.

This script provides an easy way to start Celery workers with different configurations.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def start_celery_worker(concurrency=4, loglevel='info', queue='celery', hostname=None):
    """
    Start a Celery worker with the specified configuration.
    
    Args:
        concurrency: Number of worker processes
        loglevel: Logging level (debug, info, warning, error)
        queue: Queue name to consume from
        hostname: Custom hostname for the worker
    """
    
    # Get the directory containing this script
    script_dir = Path(__file__).parent
    queries_dir = script_dir / 'queries'
    
    # Change to the queries directory (where _celery.py is located)
    os.chdir(queries_dir)
    
    # Build the celery command
    cmd = [
        'celery',
        '-A', '_celery',
        'worker',
        '--loglevel=' + loglevel,
        '--concurrency=' + str(concurrency),
        '--queues=' + queue
    ]
    
    if hostname:
        cmd.extend(['--hostname=' + hostname])
    
    print(f"Starting Celery worker with command: {' '.join(cmd)}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Concurrency: {concurrency}")
    print(f"Log level: {loglevel}")
    print(f"Queue: {queue}")
    if hostname:
        print(f"Hostname: {hostname}")
    print("-" * 50)
    
    try:
        # Start the worker process
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nWorker stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Worker failed to start: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("Error: 'celery' command not found. Make sure Celery is installed.")
        print("Install with: pip install celery")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Start Celery workers for the application')
    parser.add_argument(
        '--concurrency', '-c',
        type=int,
        default=4,
        help='Number of worker processes (default: 4)'
    )
    parser.add_argument(
        '--loglevel', '-l',
        choices=['debug', 'info', 'warning', 'error'],
        default='info',
        help='Logging level (default: info)'
    )
    parser.add_argument(
        '--queue', '-q',
        default='celery',
        help='Queue name to consume from (default: celery)'
    )
    parser.add_argument(
        '--hostname', '-n',
        help='Custom hostname for the worker'
    )
    
    args = parser.parse_args()
    
    # Check if we're in the right directory
    if not Path('queries/_celery.py').exists():
        print("Error: Could not find queries/_celery.py")
        print("Make sure you're running this script from the backend directory")
        sys.exit(1)
    
    start_celery_worker(
        concurrency=args.concurrency,
        loglevel=args.loglevel,
        queue=args.queue,
        hostname=args.hostname
    )

if __name__ == '__main__':
    main() 