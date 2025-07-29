SELECT
    repo_id AS id,
    release_name,
    release_created_at,
    release_published_at,
    release_updated_at
FROM
    releases r
WHERE
    repo_id = ANY(%(repo_ids)s) AND
    release_published_at IS NOT NULL
ORDER BY release_published_at DESC 