from celery_app import add, hello, repo_info_query

if __name__ == "__main__":
    # Send tasks to queue
    result1 = add.delay(4, 4)
    result2 = hello.delay()
    result3 = repo_info_query.delay([1, 2, 3])
    
    print(f"Task 1 ID: {result1.id}")
    print(f"Task 2 ID: {result2.id}")
    print(f"Task 3 ID: {result3.id}")
    
    # Get results (this will wait for tasks to complete)
    print(f"4 + 4 = {result1.get()}")
    print(f"Hello task result: {result2.get()}")
    print(f"Repo info result: {result3.get()}") 