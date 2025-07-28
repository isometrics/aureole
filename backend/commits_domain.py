import plotly.graph_objects as go
import pandas as pd
import logging
from dateutil.relativedelta import *  # type: ignore
import plotly.express as px
from utils.graph_utils import color_seq
from celery_app import commits_query as cmq
from utils.job_utils import nodata_graph
import time
import datetime as dt
import cache_manager.cache_facade as cf
VIZ_ID = "commit-domains"


def commit_domains_graph(repolist, num, start_date=dt.datetime.now() - dt.timedelta(days=365), end_date=dt.datetime.now()):
    # wait for data to asynchronously download and become available.
    while not_cached := cf.get_uncached(func_name=cmq.__name__, repolist=repolist):
        logging.warning(f"COMMITS_OVER_TIME_VIZ - WAITING ON DATA TO BECOME AVAILABLE")
        time.sleep(0.5)

    start = time.perf_counter()
    logging.warning(f"{VIZ_ID}- START")

    # GET ALL DATA FROM POSTGRES CACHE
    df = cf.retrieve_from_cache(
        tablename=cmq.__name__,
        repolist=repolist,
    )

    # test if there is data
    if df.empty:
        logging.warning(f"{VIZ_ID} - NO DATA AVAILABLE")
        return nodata_graph

    # function for all data pre processing, COULD HAVE ADDITIONAL INPUTS AND OUTPUTS
    df = process_data(df, num, start_date, end_date)

    fig = create_figure(df)

    logging.warning(f"{VIZ_ID} - END - {time.perf_counter() - start}")
    return fig.to_json()


def process_data(df: pd.DataFrame, num, start_date, end_date):
    # TODO: create docstring

    # convert to datetime objects rather than strings
    df["author_timestamp"] = pd.to_datetime(df["author_timestamp"], utc=True)

    # order values chronologically by author_timestamp date earliest to latest
    df = df.sort_values(by="author_timestamp", axis=0, ascending=True)

    # filter values based on date picker
    if start_date is not None:
        df = df[df.author_timestamp >= start_date]
    if end_date is not None:
        df = df[df.author_timestamp <= end_date]

    # creates list of emails for each contribution and flattens list result
    emails = df.author_email.tolist()

    # remove any entries not in email format and put all emails in lowercase
    emails = [x.lower() for x in emails if "@" in x]

    # creates list of email domains from the emails list
    email_domains = [x[x.rindex("@") + 1 :] for x in emails]

    # creates df of domains and counts
    df = pd.DataFrame(email_domains, columns=["domains"]).value_counts().to_frame().reset_index()

    df = df.rename(columns={"count": "occurrences"})

    # changes the name of the company if under a certain threshold
    df.loc[df["occurrences"] <= num, "domains"] = "Other"

    # groups others together for final counts
    df = (
        df.groupby(by="domains")["occurrences"]
        .sum()
        .reset_index()
        .sort_values(by=["occurrences"], ascending=False)
        .reset_index(drop=True)
    )

    return df


def create_figure(df: pd.DataFrame):
    # graph generation
    fig = px.pie(df, names="domains", values="occurrences", color_discrete_sequence=color_seq)
    fig.update_traces(
        textposition="inside",
        textinfo="percent+label",
        hovertemplate="%{label} <br>Commits: %{value}<br><extra></extra>",
    )

    return fig

if __name__ == "__main__":
    fig = commit_domains_graph([78412, 78408, 36113, 72172, 72177, 72180, 72171, 72189, 72181, 72186, 72161, 72176, 72175, 78410, 72192, 72184, 72160, 72155, 72147, 72143, 72188, 72185, 72167, 25450, 72145, 72165, 72146, 72154, 72144, 72187, 72151, 25445, 72153, 72178, 72148, 72149, 72142, 72156, 72150, 72182, 72159, 72174, 78411, 72158, 72179, 72164, 72173, 78409, 72163, 72166, 78385, 71441, 72190, 72169, 72191, 72168, 25452], 10, None, None)
    fig.show()