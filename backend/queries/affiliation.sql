SELECT
    left(c.cntrb_id::text, 15), -- first 15 characters of the uuid
    timezone('utc', c.created_at) AS created_at,
    c.repo_id,
    c.login,
    c.action,
    c.rank,
    con.cntrb_company,
    string_agg(ca.alias_email, ' , ' order by ca.alias_email) as email_list
FROM
    explorer_contributor_actions c
JOIN contributors_aliases ca
    ON c.cntrb_id = ca.cntrb_id
JOIN contributors con
    ON c.cntrb_id = con.cntrb_id
WHERE
    c.repo_id = ANY(%(repo_ids)s)
    and timezone('utc', c.created_at) < now() -- created_at is a timestamptz value
    -- don't need to check non-null for created_at because it's non-null by definition.
GROUP BY c.cntrb_id, c.created_at, c.repo_id, c.login, c.action, c.rank, con.cntrb_company
ORDER BY
    c.created_at 