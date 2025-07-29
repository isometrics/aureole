from celery import Celery
import logging
import cache_manager.cache_facade as cf
import time
from celery import Celery
from dotenv import load_dotenv
import os
from pathlib import Path
from functools import lru_cache

load_dotenv()

# Create Celery app
app = Celery('tasks', broker=f'redis://{os.getenv("REDIS_HOST")}:6379/0', backend=f'redis://{os.getenv("REDIS_HOST")}:6379/0')


class SQLQueryLoader:
    """Loads SQL queries from external files."""
    
    def __init__(self, queries_dir="queries"):
        self.queries_dir = Path(queries_dir)
    
    @lru_cache(maxsize=None)
    def load_query(self, query_name):
        """Load and cache SQL query from file."""
        query_file = self.queries_dir / f"{query_name}.sql"
        
        if not query_file.exists():
            raise FileNotFoundError(f"Query file not found: {query_file}")
        
        return query_file.read_text().strip()


# Initialize SQL loader
sql_loader = SQLQueryLoader()


@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def generic_query_task(self, query_name, repos):
    """
    Generic Celery task that executes SQL queries from external files.
    
    This single task replaces all the individual query tasks by loading SQL
    from external files and using configuration to determine parameters.
    
    Args:
    -----
        query_name (str): Name of the query (corresponds to .sql filename)
        repos (list): Repository IDs to query
    
    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{query_name} COLLECTION - START")
    
    if len(repos) == 0:
        return None
    
    try:
        # Load query from file
        query_string = sql_loader.load_query(query_name)
        
        # Execute query using caching wrapper
        cf.caching_wrapper(
            func_name=query_name,
            query=query_string,
            repolist=repos
        )
        
        logging.warning(f"{query_name} COLLECTION - END")
        return 0
        
    except FileNotFoundError as e:
        logging.error(f"SQL query file not found for {query_name}: {e}")
        raise
    except Exception as e:
        logging.error(f"Error executing query {query_name}: {e}")
        raise