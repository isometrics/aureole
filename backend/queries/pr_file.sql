SELECT
    prf.pr_file_path as file_path,
    pr.pull_request_id AS pull_request,
    pr.repo_id as id
FROM
    pull_requests pr,
    pull_request_files prf
WHERE
    pr.pull_request_id = prf.pull_request_id AND
    pr.repo_id = ANY(%(repo_ids)s) 