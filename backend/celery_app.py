from celery import Celery
import logging
import cache_manager.cache_facade as cf
import time

# Create Celery app
app = Celery('tasks', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')


@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def repo_info_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for package dependency versioning data.

    Args:
    -----
        repos ([int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{repo_info_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
                SELECT DISTINCT
                    repo_id AS id,
                    issues_enabled,
                    fork_count,
                    watchers_count,
                    license,
                    stars_count,
                    code_of_conduct_file,
                    security_issue_file,
                    security_audit_file,
                    data_collection_date
                FROM
                    repo_info ri
                WHERE
                    repo_id IN %s AND
                    (repo_id, data_collection_date) IN (
                        SELECT DISTINCT ON (repo_id)
                            repo_id, data_collection_date
                        FROM repo_info
                        WHERE
                            repo_id IN %s
                        ORDER BY repo_id, data_collection_date DESC
                        )
                """

    func_name = repo_info_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(func_name=func_name, query=query_string, repolist=repos, n_repolist_uses=2)

    logging.warning(f"{repo_info_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def affiliation_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for organization affiliation data.

    Explorer_contributor_actions is a materialized view on the database for quicker run time and
    may not be in your augur database. The SQL query content can be found
    in docs/explorer_contributor_actions.sql

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{affiliation_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = f"""
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
                        c.repo_id in %s
                        and timezone('utc', c.created_at) < now() -- created_at is a timestamptz value
                        -- don't need to check non-null for created_at because it's non-null by definition.
                    GROUP BY c.cntrb_id, c.created_at, c.repo_id, c.login, c.action, c.rank, con.cntrb_company
                    ORDER BY
                        c.created_at
                    """

    # used for caching
    func_name = affiliation_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )
    """
    Old post-processing steps:

    # reformat cntrb_id
    df["cntrb_id"] = df["cntrb_id"].astype(str)
    df["cntrb_id"] = df["cntrb_id"].str[:15]

    df = df.sort_values(by="created")

    # change to compatible type and remove all data that has been incorrectly formatted
    df["created"] = pd.to_datetime(df["created"], utc=True).dt.date
    df = df[df.created < dt.date.today()]

    """
    logging.warning(f"{affiliation_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def cntrb_per_file_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database to get contributors per file data.

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{cntrb_per_file_query.__name__}_DATA_QUERY - START")

    if len(repos) == 0:
        return None

    query_string = """
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
                    pr.repo_id in %s
                GROUP BY prf.pr_file_path, pr.repo_id
                """

    func_name = cntrb_per_file_query.__name__
    cf.caching_wrapper(func_name=func_name, query=query_string, repolist=repos)

    logging.warning(f"{func_name} COLLECTION - END")
    return 0

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def commits_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for commit data.

    Args:
    -----
        repo_ids (list[int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{commits_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    # commenting-out unused query components. only need the repo_id and the
    # authorship date for our current queries. remove the '--' to re-add
    # the now-removed values.
    query_string = """
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
                        c.repo_id in %s
                        and timezone('utc', c.cmt_author_timestamp) < now()
                        and timezone('utc', c.cmt_committer_timestamp) < now()
                        -- Above queries are always non-null so we don't have to check them.
                    """

    # used for caching
    func_name = commits_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    """
    Original post-processing steps

    # change to compatible type and remove all data that has been incorrectly formated
    df["author_timestamp"] = pd.to_datetime(df["author_timestamp"], utc=True).dt.date
    df = df[df.author_timestamp < dt.date.today()]
    """

    logging.warning(f"{commits_query.__name__} COLLECTION - END")
    return 0

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def contributors_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for contributor data.

    Explorer_contributor_actions is a materialized view on the database for quicker run time and
    may not be in your augur database. The SQL query content can be found
    in docs/materialized_views/explorer_contributor_actions.sql

    NOTE: FOR ANALYSIS, REQUIRES PRE-PROCESSING STEP:
        contributors_df_action_naming() in 8Knot/8Knot/pages/utils/preprocessing_utils.py


    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{contributors_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = f"""
                    SELECT
                        ca.repo_id,
                        ca.repo_name,
                        left(ca.cntrb_id::text, 15) as cntrb_id, -- first 15 characters of the uuid
                        timezone('utc', ca.created_at) AS created_at,
                        ca.login,
                        ca.action,
                        ca.rank
                    FROM
                        explorer_contributor_actions ca
                    WHERE
                        ca.repo_id in %s
                        and timezone('utc', ca.created_at) < now() -- created_at is a timestamptz value
                        -- don't need to check non-null for created_at because it's non-null by definition.
                """

    # used for caching
    func_name = contributors_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    """
    Old Post-processing steps

    # reformat cntrb_id
    df["cntrb_id"] = df["cntrb_id"].astype(str)
    df["cntrb_id"] = df["cntrb_id"].str[:15]

    # reformat cntrb_id
    df["cntrb_id"] = df["cntrb_id"].astype(str)
    df["cntrb_id"] = df["cntrb_id"].str[:15]

    # change to compatible type and remove all data that has been incorrectly formated
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True).dt.date
    df = df[df.created_at < dt.date.today()]

    Additional post-processing done on-the-fly in 8knot/pages/utils/preprocessing_utils.py
    """

    logging.warning(f"{contributors_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def issue_assignee_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for contributor data.

    Explorer_issue_assignments is a materialized view on the database for quicker run time and
    may not be in your augur database. The SQL query content can be found
    in docs/materialized_views/explorer_issue_assignments.sql

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.
    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{issue_assignee_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = f"""
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
                        ia.id in %s
                        and ia.created < now()
                        and (ia.closed < now() or ia.closed IS NULL)
                        and (ia.assign_date < now() or ia.assign_date IS NULL)
                        -- have to accept NULL values because issues could still be open, or unassigned,
                        -- and still be acceptable.
                """

    # used for caching
    func_name = issue_assignee_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    """
    Old post-processing steps:

    #id as string and slice to remove excess 0s
    df["assignee"] = df["assignee"].astype(str)
    df["assignee"] = df["assignee"].str[:15]

    # change to compatible type and remove all data that has been incorrectly formated
    df["created"] = pd.to_datetime(df["created"], utc=True).dt.date
    df = df[df.created < dt.date.today()]
    """

    logging.warning(f"{issue_assignee_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def issues_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for issue data.

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """

    logging.warning(f"{issues_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = f"""
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
                        r.repo_id in %s
                        and i.pull_request_id is null
                        and i.created_at < now()
                        and (i.closed_at < now() or i.closed_at IS NULL)
                        -- have to accept NULL values because issues could still be open, or unassigned,
                        -- and still be acceptable.
                    ORDER BY i.created_at
                    """

    # used for caching
    func_name = issues_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    """
    Old post-processing steps:

    df = df[df["pull_request_id"].isnull()]
    df = df.drop(columns="pull_request_id")
    df = df.sort_values(by="created")

    # change to compatible type and remove all data that has been incorrectly formated
    df["created"] = pd.to_datetime(df["created"], utc=True).dt.date
    df = df[df.created < dt.date.today()]

    # reformat reporter_id and issue_closer
    df["reporter_id"] = df["reporter_id"].astype(str)
    df["reporter_id"] = df["reporter_id"].str[:15]

    df["issue_closer"] = df["issue_closer"].astype(str)
    df["issue_closer"] = df["issue_closer"].str[:15]
    """

    logging.warning(f"{issues_query.__name__} COLLECTION - END")    

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def ossf_score_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for repo ossf scorecard information.

    Args:
    -----
        repos ([int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{ossf_score_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
                SELECT
                    repo_id as id,
                    name,
                    score,
                    data_collection_date
                FROM
                    repo_deps_scorecard
                WHERE
                    repo_id IN %s
                """

    func_name = ossf_score_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    logging.warning(f"{ossf_score_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def package_version_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for package dependency versioning data.

    Args:
    -----
        repos ([int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{package_version_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
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
                    repo_id IN %s
                    AND
                    (rdl.repo_id, rdl.data_collection_date) IN (
                        SELECT DISTINCT ON (repo_id)
                            repo_id, data_collection_date
                        FROM repo_deps_libyear
                        WHERE
                            repo_id IN %s
                        ORDER BY repo_id, data_collection_date DESC
                    ) AND
                    rdl.libyear >= 0
                """

    func_name = package_version_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(func_name=func_name, query=query_string, repolist=repos, n_repolist_uses=2)

    logging.warning(f"{package_version_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def pr_assignee_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for contributor data.

    Explorer_pr_assignments is a materialized view on the database for quicker run time and
    may not be in your augur database. The SQL query content can be found
    in docs/materialized_views/explorer_pr_assignments.sql

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.
    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{pr_assignee_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = f"""
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
                        pa.id in %s
                        and pa.created < now()
                        and (pa.closed < now() or pa.closed IS NULL)
                        and (pa.assign_date < now() or pa.assign_date IS NULL)
                        -- have to accept NULL values because PRs could still be open, or unassigned,
                        -- and still be acceptable.
                """

    # used for caching
    func_name = pr_assignee_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    """
    Old post-processing steps:

    # id as string and slice to remove excess 0s
    df["assignee"] = df["assignee"].astype(str)
    df["assignee"] = df["assignee"].str[:15]

    # change to compatible type and remove all data that has been incorrectly formated
    df["created"] = pd.to_datetime(df["created"], utc=True).dt.date
    df = df[df.created < dt.date.today()]
    """

    logging.warning(f"{pr_assignee_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def pr_file_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for file pull request data.

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{pr_file_query.__name__}_DATA_QUERY - START")

    if len(repos) == 0:
        return None

    query_string = """
                    SELECT
                        prf.pr_file_path as file_path,
                        pr.pull_request_id AS pull_request,
                        pr.repo_id as id
                    FROM
                        pull_requests pr,
                        pull_request_files prf
                    WHERE
                        pr.pull_request_id = prf.pull_request_id AND
                        pr.repo_id in %s
                """

    func_name = pr_file_query.__name__
    cf.caching_wrapper(func_name=func_name, query=query_string, repolist=repos)

    logging.warning(f"{func_name} COLLECTION - END")
    return 0

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def pr_response_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for contributor data.

    This query gets the messages that are in response to a pr if any exists,
    if not the msg_timestamp is null. It takes in the data
    of the comments (messages) on prs and pr reviews for each pr if it exists.

    explorer_pr_response is a materialized view on the database for quicker run time and
    may not be in your augur database. The SQL query content can be found
    in docs/materialized_views/explorer_pr_response.sql

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{pr_response_query.__name__}_DATA_QUERY - START")

    if len(repos) == 0:
        return None

    query_string = """
                    SELECT
                        *
                    FROM
                        explorer_pr_response epr
                    WHERE
                        epr.ID in %s
                """

    func_name = pr_response_query.__name__
    cf.caching_wrapper(func_name=func_name, query=query_string, repolist=repos)

    logging.warning(f"{func_name} COLLECTION - END")
    return 0

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def prs_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for pull request data.

    Args:
    -----
        repo_ids ([str]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')
    """
    logging.warning(f"{prs_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
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
                        r.repo_id in %s
                        and pr.pr_created_at < now()
                        and (pr.pr_closed_at < now() or pr.pr_closed_at IS NULL)
                        and (pr.pr_merged_at < now() or pr.pr_merged_at IS NULL)
                        -- have to accept NULL values because PRs could still be open, or unassigned,
                        -- and still be acceptable.
                    ORDER BY pr.pr_created_at
                    """

    # used for caching
    func_name = prs_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )
    """
    Old post-processing steps:

    # change to compatible type and remove all data that has been incorrectly formated
    df["created"] = pd.to_datetime(df["created"], utc=True).dt.date
    df = df[df.created < dt.date.today()]

    # reformat cntrb_id
    df["cntrb_id"] = df["cntrb_id"].astype(str)
    df["cntrb_id"] = df["cntrb_id"].str[:15]

    # sort by the date created
    df = df.sort_values(by="created")
    """

    logging.warning(f"{prs_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def repo_info_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for package dependency versioning data.

    Args:
    -----
        repos ([int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{repo_info_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
                SELECT DISTINCT
                    repo_id AS id,
                    issues_enabled,
                    fork_count,
                    watchers_count,
                    license,
                    stars_count,
                    code_of_conduct_file,
                    security_issue_file,
                    security_audit_file,
                    data_collection_date
                FROM
                    repo_info ri
                WHERE
                    repo_id IN %s AND
                    (repo_id, data_collection_date) IN (
                        SELECT DISTINCT ON (repo_id)
                            repo_id, data_collection_date
                        FROM repo_info
                        WHERE
                            repo_id IN %s
                        ORDER BY repo_id, data_collection_date DESC
                        )
                """

    func_name = repo_info_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(func_name=func_name, query=query_string, repolist=repos, n_repolist_uses=2)

    logging.warning(f"{repo_info_query.__name__} COLLECTION - END")


@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def repo_releases_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for repo release information.

    Args:
    -----
        repos ([int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{repo_releases_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
                SELECT
                    repo_id AS id,
                    release_name,
                    release_created_at,
                    release_published_at,
                    release_updated_at
                FROM
                    releases r
                WHERE
                    repo_id IN %s AND
                    release_published_at IS NOT NULL
                ORDER BY release_published_at DESC
                """

    func_name = repo_releases_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    logging.warning(f"{repo_releases_query.__name__} COLLECTION - END")

@app.task(
    bind=True,
    autoretry_for=(Exception,),
    exponential_backoff=2,
    retry_kwargs={"max_retries": 5},
    retry_jitter=True,
)
def repo_languages_query(self, repos):
    """
    (Worker Query)
    Executes SQL query against Augur database for file language data.

    Explorer_repo_languages is a materialized view on the database for quicker run time and
    may not be in your augur database. The SQL query content can be found
    in docs/materialized_views/explorer_repo_languages.sql

    Args:
    -----
        repos ([int]): repos that SQL query is executed on.

    Returns:
    --------
        dict: Results from SQL query, interpreted from pd.to_dict('records')

    """
    logging.warning(f"{repo_languages_query.__name__} COLLECTION - START")

    if len(repos) == 0:
        return None

    query_string = """
                    SELECT
                        repo_id as id,
                        programming_language,
                        code_lines,
                        files
                    FROM explorer_repo_languages
                    WHERE repo_id in %s
                """

    func_name = repo_languages_query.__name__

    # raises Exception on failure. Returns nothing.
    cf.caching_wrapper(
        func_name=func_name,
        query=query_string,
        repolist=repos,
    )

    logging.warning(f"{repo_languages_query.__name__} COLLECTION - END")