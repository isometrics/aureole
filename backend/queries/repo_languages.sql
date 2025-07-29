SELECT
    repo_id as id,
    programming_language,
    code_lines,
    files
FROM explorer_repo_languages
WHERE repo_id = ANY(%(repo_ids)s) 