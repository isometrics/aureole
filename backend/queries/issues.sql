SELECT
    r.repo_id,
    r.repo_name,
    i.issue_id AS issue,
    i.gh_issue_number AS issue_number,
    i.gh_issue_id AS gh_issue,
    left(i.reporter_id::text, 15) as reporter_id,
    left(i.cntrb_id::text, 15) as issue_closer,
    -- timestamps are not timestamptz
    i.created_at,
    i.closed_at
FROM
    repo r,
    issues i
WHERE
    r.repo_id = i.repo_id AND
    r.repo_id = ANY(%(repo_ids)s)
    and i.pull_request_id is null
    and i.created_at < now()
    and (i.closed_at < now() or i.closed_at IS NULL)
    -- have to accept NULL values because issues could still be open, or unassigned,
    -- and still be acceptable.
ORDER BY i.created_at 