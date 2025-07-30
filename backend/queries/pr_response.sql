SELECT
    *
FROM
    explorer_pr_response epr
WHERE
    epr.ID = ANY(%(repo_ids)s) 