#!/usr/bin/env python3
"""
Script to verify that repo_info_query data exists in the databases.
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Test repo IDs from the run_tasks.py file
test_repos = [1, 25445, 25450, 25452, 25430, 24441, 24442]

def check_cache_database():
    """Check if repo_info data exists in the cache database."""
    print("=== Checking Cache Database ===")
    
    # Cache database connection
    cache_cx_string = "dbname={} user={} password={} host={} port={}".format(
        os.getenv("CACHE_DB_NAME", "augur_cache"),
        os.getenv("CACHE_USER", "postgres"),
        os.getenv("POSTGRES_PASSWORD", "password"),
        os.getenv("CACHE_HOST", "postgres-cache"),
        os.getenv("CACHE_PORT", "5432")
    )
    
    try:
        with psycopg2.connect(cache_cx_string) as conn:
            with conn.cursor() as cur:
                # Check total rows in cache table
                cur.execute("SELECT COUNT(*) FROM repo_info_query")
                total_rows = cur.fetchone()[0]
                print(f"Total rows in repo_info_query cache table: {total_rows}")
                
                # Check bookkeeping
                cur.execute("SELECT COUNT(*) FROM cache_bookkeeping WHERE cache_func = 'repo_info_query'")
                bookkeeping_count = cur.fetchone()[0]
                print(f"Repos in bookkeeping for repo_info_query: {bookkeeping_count}")
                
                # Check specific repos
                cur.execute(
                    "SELECT repo_id, issues_enabled, fork_count, stars_count FROM repo_info_query WHERE repo_id = ANY(%s) LIMIT 5",
                    (test_repos,)
                )
                results = cur.fetchall()
                print(f"Sample cached data for test repos: {len(results)} rows found")
                for row in results:
                    print(f"  Repo {row[0]}: issues_enabled={row[1]}, forks={row[2]}, stars={row[3]}")
                    
    except Exception as e:
        print(f"Error connecting to cache database: {e}")

def check_augur_database():
    """Check if repo_info data exists in the Augur database."""
    print("\n=== Checking Augur Database ===")
    
    # Augur database connection
    augur_cx_string = "dbname={} user={} password={} host={} port={}".format(
        os.environ["AUGUR_DATABASE"],
        os.environ["AUGUR_USERNAME"],
        os.environ["AUGUR_PASSWORD"],
        os.environ["AUGUR_HOST"],
        os.environ["AUGUR_PORT"]
    )
    
    try:
        with psycopg2.connect(augur_cx_string) as conn:
            # Set search path
            with conn.cursor() as cur:
                cur.execute(f"SET search_path TO {os.environ['AUGUR_SCHEMA']}")
                
                # Check total rows in source table
                cur.execute("SELECT COUNT(*) FROM repo_info")
                total_rows = cur.fetchone()[0]
                print(f"Total rows in repo_info source table: {total_rows}")
                
                # Check specific repos
                cur.execute(
                    "SELECT repo_id, issues_enabled, fork_count, stars_count FROM repo_info WHERE repo_id = ANY(%s) LIMIT 5",
                    (test_repos,)
                )
                results = cur.fetchall()
                print(f"Sample source data for test repos: {len(results)} rows found")
                for row in results:
                    print(f"  Repo {row[0]}: issues_enabled={row[1]}, forks={row[2]}, stars={row[3]}")
                    
    except Exception as e:
        print(f"Error connecting to Augur database: {e}")

if __name__ == "__main__":
    check_cache_database()
    check_augur_database() 