WITH repo_list AS (
    SELECT unnest(%(repo_ids)s::int[]) AS repo_id
)
SELECT
    rdl.repo_id as id,
    rdl.name,
    rdl.current_release_date,
    rdl.latest_release_date,
    rdl.libyear,
    case -- categorize the dependency out-of-date-edness;
            WHEN rdl.libyear >= 1.0 THEN 'Greater than a year'
            WHEN rdl.libyear < 1.0 and rdl.libyear > 0.5 THEN '6 months to year'
            when rdl.libyear < 0.5 and rdl.libyear > 0 then 'Less than 6 months'
            when rdl.libyear = 0 then 'Up to date'
            else 'Unclear version history'
    END as dep_age
FROM
    repo_deps_libyear rdl
WHERE
    rdl.repo_id IN (SELECT repo_id FROM repo_list)
    AND
    (rdl.repo_id, rdl.data_collection_date) IN (
        SELECT DISTINCT ON (repo_id)
            repo_id, data_collection_date
        FROM repo_deps_libyear
        WHERE repo_id IN (SELECT repo_id FROM repo_list)
        ORDER BY repo_id, data_collection_date DESC
    ) AND
    rdl.libyear >= 0 