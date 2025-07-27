from celery_app import *

if __name__ == "__main__":
    # Send tasks to queue
    result3 = repo_info_query.delay([1, 25445, 25450, 25452, 25430, 24441, 24442])
    print(f"Task 3 ID: {result3.id}")
    print(f"Repo info result: {result3.get()}") 