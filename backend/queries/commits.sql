SELECT
    distinct
    r.repo_id as repo_id,
    c.cmt_commit_hash AS commit_hash,
    c.cmt_author_email AS author_email,
    c.cmt_author_date AS author_date,
    -- all timestamptz's are coerced to utc from their origin timezones.
    timezone('utc', c.cmt_author_timestamp) AS author_timestamp,
    timezone('utc', c.cmt_committer_timestamp) AS committer_timestamp

FROM
    repo r
JOIN commits c
    ON r.repo_id = c.repo_id
WHERE
    c.repo_id = ANY(%(repo_ids)s)
    and timezone('utc', c.cmt_author_timestamp) < now()
    and timezone('utc', c.cmt_committer_timestamp) < now()
    -- Above queries are always non-null so we don't have to check them. 