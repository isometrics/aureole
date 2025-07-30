SELECT
    pr.repo_id as repo_id,
    prf.pr_file_path as file_path,
    string_agg(DISTINCT CAST(pr.pr_augur_contributor_id AS varchar(15)), ',') AS cntrb_ids,
    string_agg(DISTINCT CAST(prr.cntrb_id AS varchar(15)), ',') AS reviewer_ids
FROM
    pull_requests pr,
    pull_request_files prf,
    pull_request_reviews prr
WHERE
    pr.pull_request_id = prf.pull_request_id AND
    pr.pull_request_id = prr.pull_request_id AND
    pr.repo_id = ANY(%(repo_ids)s)
GROUP BY prf.pr_file_path, pr.repo_id 