SELECT
    repo_id as id,
    name,
    score,
    data_collection_date
FROM
    repo_deps_scorecard
WHERE
    repo_id = ANY(%(repo_ids)s) 