WITH repo_list AS (
    SELECT unnest(%(repo_ids)s::int[]) AS repo_id
)
SELECT DISTINCT
    ri.repo_id AS id,
    ri.issues_enabled,
    ri.fork_count,
    ri.watchers_count,
    ri.license,
    ri.stars_count,
    ri.code_of_conduct_file,
    ri.security_issue_file,
    ri.security_audit_file,
    ri.data_collection_date
FROM
    repo_info ri
WHERE
    ri.repo_id IN (SELECT repo_id FROM repo_list) AND
    (ri.repo_id, ri.data_collection_date) IN (
        SELECT DISTINCT ON (repo_id)
            repo_id, data_collection_date
        FROM repo_info
        WHERE repo_id IN (SELECT repo_id FROM repo_list)
        ORDER BY repo_id, data_collection_date DESC
        ) 