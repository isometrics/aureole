from celery import Celery
# from dash import CeleryManager
import os
from dotenv import load_dotenv
# from . import repo_languages_query
# from . import repo_files_query
# from . import affiliation_query
# from . import pr_files_query
# from . import pr_response_query
# from . import prs_query
# from . import query_template
# from . import repo_info_query
# from . import repo_releases_query
from queries.commits_query import commits_query
# from . import contributors_query
# from . import issue_assignee_query
# from . import issues_query
# from . import ossf_score_query
# from . import package_version_query
# from . import pr_assignee_query
# from . import cntrb_per_file_query


load_dotenv()

redis_host = "{}".format(os.getenv("REDIS_SERVICE_HOST", "redis-cache"))
redis_port = "{}".format(os.getenv("REDIS_SERVICE_PORT", "6379"))
redis_password = os.getenv("REDIS_PASSWORD", "")

# Build Redis URL - only include password if it's set
if redis_password:
    REDIS_URL = f"redis://:{redis_password}@{redis_host}:{redis_port}"
else:
    REDIS_URL = f"redis://{redis_host}:{redis_port}"


"""CREATE CELERY TASK QUEUE AND MANAGER"""
celery_app = Celery(
    __name__,
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_time_limit=2700,  # 45 minutes
    task_acks_late=True,
    task_track_started=True,
    result_extended=True,
    worker_prefetch_multiplier=1,
)

# celery_manager = CeleryManager(celery_app=celery_app)

# Import all celery task modules so they are registered
