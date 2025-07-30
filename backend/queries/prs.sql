SELECT
    r.repo_id,
    r.repo_name,
    pr.pull_request_id AS pull_request,
    pr.pr_src_number,
    left(pr.pr_augur_contributor_id::text, 15) as cntrb_id,
    -- values are timestamp not timestamptz
    pr.pr_created_at AS created,
    pr.pr_closed_at AS closed,
    pr.pr_merged_at AS merged
FROM
    repo r,
    pull_requests pr
WHERE
    r.repo_id = pr.repo_id AND
    r.repo_id = ANY(%(repo_ids)s)
    and pr.pr_created_at < now()
    and (pr.pr_closed_at < now() or pr.pr_closed_at IS NULL)
    and (pr.pr_merged_at < now() or pr.pr_merged_at IS NULL)
    -- have to accept NULL values because PRs could still be open, or unassigned,
    -- and still be acceptable.
ORDER BY pr.pr_created_at 