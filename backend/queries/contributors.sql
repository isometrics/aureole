SELECT
    ca.repo_id,
    ca.repo_name,
    left(ca.cntrb_id::text, 15) as cntrb_id, -- first 15 characters of the uuid
    timezone('utc', ca.created_at) AS created_at,
    ca.login,
    ca.action,
    ca.rank
FROM
    explorer_contributor_actions ca
WHERE
    ca.repo_id = ANY(%(repo_ids)s)
    and timezone('utc', ca.created_at) < now() -- created_at is a timestamptz value
    -- don't need to check non-null for created_at because it's non-null by definition. 