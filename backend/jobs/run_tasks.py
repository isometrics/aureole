from celery_app import add, hello, repo_info_query

if __name__ == "__main__":
    # Send tasks to queue
    result3 = repo_info_query.delay([1, 2, 3])
    print(f"Task 3 ID: {result3.id}")
    print(f"Repo info result: {result3.get()}") 