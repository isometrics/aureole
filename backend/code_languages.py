import plotly.graph_objects as go
import pandas as pd
import logging
from dateutil.relativedelta import *  # type: ignore
import plotly.express as px
from utils.graph_utils import color_seq
from celery_app import repo_languages_query as rlq
from utils.job_utils import nodata_graph
import time
import datetime as dt
import cache_manager.cache_facade as cf
VIZ_ID = "code-languages"

def code_languages_graph(repolist, view="file"):
    # wait for data to asynchronously download and become available.
    while not_cached := cf.get_uncached(func_name=rlq.__name__, repolist=repolist):
        logging.warning(f"{VIZ_ID}- WAITING ON DATA TO BECOME AVAILABLE")
        time.sleep(0.5)

    start = time.perf_counter()
    logging.warning(f"{VIZ_ID}- START")

    # GET ALL DATA FROM POSTGRES CACHE
    df = cf.retrieve_from_cache(
        tablename=rlq.__name__,
        repolist=repolist,
    )

    # test if there is data
    if df.empty:
        logging.warning(f"{VIZ_ID} - NO DATA AVAILABLE")
        return nodata_graph

    # function for all data pre processing
    df = process_data(df)

    fig = create_figure(df, view)

    logging.warning(f"{VIZ_ID} - END - {time.perf_counter() - start}")
    return fig.to_json()


def process_data(df: pd.DataFrame):

    # SVG files give one line of code per file
    df.loc[df["programming_language"] == "SVG", "code_lines"] = df["files"]

    # group files by their programing language and sum code lines and files
    df_lang = df[["programming_language", "code_lines", "files"]].groupby("programming_language").sum().reset_index()

    # require a language to have atleast .1 % of total files to be shown, if not grouped into other
    min_files = df_lang["files"].sum() / 1000
    df_lang.loc[df_lang.files <= min_files, "programming_language"] = "Other"
    df_lang = (
        df_lang[["programming_language", "code_lines", "files"]].groupby("programming_language").sum().reset_index()
    )

    # order by descending file number and reset format
    df_lang = df_lang.sort_values(by="files", axis=0, ascending=False).reset_index()
    df_lang.drop("index", axis=1, inplace=True)

    # calculate percentages
    df_lang["Code %"] = (df_lang["code_lines"] / df_lang["code_lines"].sum()) * 100
    df_lang["Files %"] = (df_lang["files"] / df_lang["files"].sum()) * 100

    return df_lang


def create_figure(df: pd.DataFrame, view):

    value = "files"
    if view == "line":
        value = "code_lines"

    # graph generation
    fig = px.pie(df, names="programming_language", values=value, color_discrete_sequence=color_seq)
    fig.update_traces(
        textposition="inside",
        textinfo="percent+label",
        hovertemplate="%{label} <br>Amount: %{value}<br><extra></extra>",
    )

    # add legend title
    fig.update_layout(legend_title_text="Languages")

    return fig

if __name__ == "__main__":
    fig = code_languages_graph([78412, 78408, 36113, 72172, 72177, 72180, 72171, 72189, 72181, 72186, 72161, 72176, 72175, 78410, 72192, 72184, 72160, 72155, 72147, 72143, 72188, 72185, 72167, 25450, 72145, 72165, 72146, 72154, 72144, 72187, 72151, 25445, 72153, 72178, 72148, 72149, 72142, 72156, 72150, 72182, 72159, 72174, 78411, 72158, 72179, 72164, 72173, 78409, 72163, 72166, 78385, 71441, 72190, 72169, 72191, 72168, 25452], "file")
    fig.write_html("code_languages.html")