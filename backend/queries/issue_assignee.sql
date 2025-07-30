SELECT
    ia.issue_id,
    ia.id,
    -- below are timestamp not timestamptz
    ia.created,
    ia.closed,
    ia.assign_date,
    ia.assignment_action,
    left(ia.assignee::text, 15) as assignee
FROM
    explorer_issue_assignments ia
WHERE
    ia.id = ANY(%(repo_ids)s)
    and ia.created < now()
    and (ia.closed < now() or ia.closed IS NULL)
    and (ia.assign_date < now() or ia.assign_date IS NULL)
    -- have to accept NULL values because issues could still be open, or unassigned,
    -- and still be acceptable. 