SELECT
    pa.pull_request_id,
    pa.id,
    -- below are timestamp not timestamptz
    pa.created,
    pa.closed,
    pa.assign_date,
    pa.assignment_action,
    left(pa.assignee::text, 15) as assignee
FROM
    explorer_pr_assignments pa
WHERE
    pa.id = ANY(%(repo_ids)s)
    and pa.created < now()
    and (pa.closed < now() or pa.closed IS NULL)
    and (pa.assign_date < now() or pa.assign_date IS NULL)
    -- have to accept NULL values because PRs could still be open, or unassigned,
    -- and still be acceptable. 