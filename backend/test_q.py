# [1, 25445, 25450, 25452, 25430, 24441, 24442]

from queries.commits_query import commits_query

# Test with sample repo IDs
test_repos = [1, 25445, 25450, 25452, 25430, 24441, 24442]
task = commits_query.delay([test_repos])
print(f"Task created: {task}")
